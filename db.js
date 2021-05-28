require('dotenv').config()

const {deepArrayScan, wordCleaner} = require('./lib/utilites')

const mysql = require('mysql')
const util = require('util')
const { Console, clear } = require('console')

const pool = mysql.createPool({
    connectionLimit: 5,
    host: process.env.HOST,
    port: process.env.DB_PORT,
    user: process.env.USER,
    database: process.env.DB_NAME,
    password: process.env.PASSWORD,
    multipleStatements: true,
})

const query = util.promisify(pool.query).bind(pool)

async function makeQuery(sql){
    try {
        let result = await query(sql)
        // result = deepArrayScan(result)
        return result
    }
    catch(err){
        if (err.code ==='ER_DUP_ENTRY'){
            console.log('This instance already exist in DB');
        } else {
            throw err;
        }    
    } 
}

function getColumnName(table){
    let columnName;
    switch (table) {
        case 'japanese':
        case 'english':
        case 'russian':
            columnName = 'word';
            break;
        default:
            columnName = wordCleaner(table);
    }
    return columnName;
}

function insertInto(firstInstanceTable = '', secondInstanceTable = ''){
    let standartTableName;

    if(firstInstanceTable) firstInstanceTable = wordCleaner(firstInstanceTable);
    if(secondInstanceTable) secondInstanceTable = wordCleaner(secondInstanceTable);

    if(firstInstanceTable && secondInstanceTable){
        let tableName = `${firstInstanceTable}_${secondInstanceTable}`;
        
        switch(tableName) {
            case 'japanese_english':
            case 'english_japanese':
                standartTableName = 'japanese_english';
                break;
            case 'japanese_russian':
            case 'russian_japanese':
                standartTableName = 'japanese_russian';
                break;
            case 'english_russian':
            case 'russian_english':
                standartTableName = 'english_russian';
                break;
            default:
                standartTableName = arguments[0];
        }
        
        return standartTableName
    } else {
        return wordCleaner(arguments[0])
    }
}

function addInstances(instances, table){
    table = wordCleaner(table);
    column = wordCleaner(getColumnName(table));
    let query = '';
    let splited = instances.split(',');
    if (splited.length > 1){
        splited.forEach((instance) => {
            instance = wordCleaner(instance)
            if (instance) query += `INSERT INTO ${table}(${column}) VALUES('${instance}');` 
        });
    } else {
        if (instances) query += `INSERT INTO ${table}(${column}) VALUES('${wordCleaner(instances)}');`;
    }
    return makeQuery(query);
}

async function addRelation(firstInstance, firstInstanceTable, secondInstance, secondInstanceTable){

    firstInstance = wordCleaner(firstInstance)
    firstInstanceTable = wordCleaner(firstInstanceTable)
    secondInstance = wordCleaner(secondInstance)
    secondInstanceTable = wordCleaner(secondInstanceTable)

    let firstInstanceColumn = getColumnName(firstInstanceTable);
    let secondInstanceColumn = getColumnName(secondInstanceTable);

    let [firstInstanceId] = await findInstanceId(firstInstance, firstInstanceTable, firstInstanceColumn);
    let [secondInstanceId] = await findInstanceId (secondInstance, secondInstanceTable, secondInstanceColumn);
    

    let into = insertInto(firstInstanceTable, secondInstanceTable);

    let query = `
              INSERT INTO ${into}
              VALUES (${firstInstanceId}, ${secondInstanceId})`;
    makeQuery(query);
    
}

async function findInstanceId(instance, table, columnName) {
    let query = `
                 SELECT ${table}.${columnName}_id
                 FROM ${table}
                 WHERE ${columnName} = '${instance}';`;
    let result = await makeQuery(query);
    return deepArrayScan(result)
}

async function getInstanceById(id, table){
    let column = getColumnName(table)
    let query = `
                 SELECT ${table}.${column}
                 FROM ${table}
                 WHERE ${column}_id = ${id};
                `;
    let result = await makeQuery(query);
    // result = deepArrayScan(result)
    return result
}

async function search(searchFor){
    let query = '';
    let tables = ['japanese', 'english', 'russian']

    for (table of tables){
        query = `
                 SELECT ${table}.word_id
                 FROM ${table}
                 WHERE word LIKE '%${searchFor}%';
                `;
        let queryResult = await makeQuery(query)
        if(queryResult.length !== 0){
            return [...queryResult, table]
        }
    }
    return "Not found";

}

async function getAllFromTable(table){
    let query = `
                 SELECT * FROM ${table};
                `
    let result = await makeQuery(query)
    return result
}




async function deleteInstance(instance, table) {
    instance = wordCleaner(instance)
    table = wordCleaner(table)
    let column = getColumnName(table)
    let query = `
                 DELETE FROM ${table} WHERE ${column} like '${instance}';
                `

    let result = await makeQuery(query)
    return result
}

async function deleteAllInTable(table) {
    table = wordCleaner(table)
    let query = `
                 DELETE FROM ${table}
                `
    await makeQuery(query)
}

(async () => {
    deleteAllInTable('english')
} )()