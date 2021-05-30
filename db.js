require('dotenv').config()

const {deepArrayScan, wordCleaner, dashToUnderscore} = require('./lib/utilites')

const mysql = require('mysql')
const util = require('util')

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


//Wrapper over 'query' function
async function makeQuery(sql){
    try {
        let result = await query(sql)
        // if (Array.isArray(result)){
        //     result = deepArrayScan(result)
        // }
        return result
    }
    catch(err){
        if (err.code ==='ER_DUP_ENTRY'){
            throw new Error('This entity already exist in DB');
        } else {
            throw err;
        }    
    } 
}



//////////////////////////////////////////////////////'Get' functions//////////////////////////////////////////////////////

async function getColumnName(table){
    let query = `
                 SELECT COLUMN_NAME 
                 FROM INFORMATION_SCHEMA.COLUMNS
                 WHERE table_name = '${table}'
                 AND ORDINAL_POSITION = 2
                `
    let columnName = await makeQuery(query)
    columnName = deepArrayScan(columnName)
    return columnName[0][0];
}

async function getEntityById(id, table){
    let column = await getColumnName(table)
    let query = `
                 SELECT ${table}.${column}
                 FROM ${table}
                 WHERE ${column}_id = ${id};
                `;
    let result = await makeQuery(query);
    return result
}

async function getEntityId(entity, table) {
    let columnName = await getColumnName(table)
    let query = `
                 SELECT ${table}.${columnName}_id
                 FROM ${table}
                 WHERE ${columnName} = '${entity}';`;
    try{
        let result = await makeQuery(query);
        if (result.length === 0){
            throw new Error(`Here no '${entity}' in database`)
        }
        result = deepArrayScan(result)
        return result
    } catch (err) {
        throw new Error(err.message)
    }
    
}

async function getRelation(entity, table){
    table = dashToUnderscore(table)
    entity = wordCleaner(entity)
    let founded = await search(entity)
    let foundedTable = founded.table
    let foundedTableColumn = await getColumnName(foundedTable)
    
    let splited = table.split('_')
    let firstTable = splited[0]
    let secondTable = splited[1]
    
    let firstEntityColumn = await getColumnName(firstTable)
    let secondEntityColumn = await getColumnName(secondTable)
    
    let sql = `
                SELECT ${firstTable}.${firstEntityColumn} AS ${firstTable}, ${secondTable}.${secondEntityColumn} AS ${secondTable}
                FROM ((${table}
                JOIN ${firstTable} ON ${table}.${firstTable}_id=${firstTable}.${firstEntityColumn}_id)
                JOIN ${secondTable} ON ${table}.${secondTable}_id=${secondTable}.${secondEntityColumn}_id)
                WHERE ${foundedTable}.${foundedTableColumn} LIKE '%${entity}%';
        `
        
    try {
            let result = await makeQuery(sql)
            if (result.length === 0) {
                throw new Error ('No relation in database')
            }
            return result
    } catch (err) {
        throw new Error(err.message)
    }
    
}

module.exports.getRelation = getRelation

async function getAllFromTable(table){
    let query = `
                 SELECT * FROM ${table};
                `
    try {
        let result = await makeQuery(query)
        if (result.length === 0) {
            throw new Error("No data in database yet")
        }
        return result
    } catch (err) {
        throw new Error(err.message)
    }

}
module.exports.getAllFromTable = getAllFromTable

async function search(searchFor){
    let query = '';
    let tables = ['japanese', 'english', 'russian']

    for (table of tables){
        query = `
                 SELECT *
                 FROM ${table}
                 WHERE word LIKE '%${searchFor}%';
                `;
        let queryResult = await makeQuery(query)
        if(queryResult.length !== 0){
            
            return {queryResult, table}
        }
    }
    throw new Error("Not found")

}

module.exports.search = search

//////////////////////////////////////////////////////'Add' functions//////////////////////////////////////////////////////

async function addEntities(entities, table){
    table = wordCleaner(table);
    let column = await getColumnName(table);
    let query = '';
    let splited = entities.split(',');
    if (splited.length > 1){
        splited.forEach((entity) => {
            entity = wordCleaner(entity)
            if (entity) query += `INSERT INTO ${table}(${column}) VALUES('${entity}');` 
        });
    } else {
        if (entities) query += `INSERT INTO ${table}(${column}) VALUES('${wordCleaner(entities)}');`;
    }
    try {
        makeQuery(query);
    } catch (err) {
        throw new Error(err.message)
    }
}

module.exports.addEntities = addEntities

async function addRelation(firstEntity, secondEntity, table){
    let splited = table.split('-')
    let firstEntityTable = wordCleaner(splited[0])
    let secondEntityTable = wordCleaner(splited[1])
    firstEntity = wordCleaner(firstEntity)
    secondEntity = wordCleaner(secondEntity)

    let [firstEntityId] = await getEntityId(firstEntity, firstEntityTable);
    let [secondEntityId] = await getEntityId (secondEntity, secondEntityTable);
    
    let into = dashToUnderscore(table)

    let query = `
              INSERT INTO ${into}
              VALUES (${firstEntityId}, ${secondEntityId})`;
    await makeQuery(query);
    
}

module.exports.addRelation = addRelation


//////////////////////////////////////////////////////'Delete' functions//////////////////////////////////////////////////////
async function deleteEntity(entity, table) {
    entity = wordCleaner(entity)
    table = wordCleaner(table)
    let column = await getColumnName(table)
    let query = `
                 DELETE FROM ${table} WHERE ${column} like '${entity}';
                `
    let result = await makeQuery(query)
    return result
}

module.exports.deleteEntity = deleteEntity

async function deleteRelation(firstEntity, secondEntity, table){
    let splited = table.split('-')
    let firstEntityTable = wordCleaner(splited[0])
    let secondEntityTable = wordCleaner(splited[1])
    firstEntity = wordCleaner(firstEntity)
    secondEntity = wordCleaner(secondEntity)

    let [firstEntityId] = await getEntityId(firstEntity, firstEntityTable);
    let [secondEntityId] = await getEntityId (secondEntity, secondEntityTable);
    
    let into = dashToUnderscore(table)

    let query = `
                DELETE FROM ${into}
                WHERE (${firstEntityTable}_word_id = ${firstEntityId} AND ${secondEntityTable}_word_id = ${secondEntityId});`;
    await makeQuery(query);
}

module.exports.deleteRelation = deleteRelation

async function deleteAllInTable(table) {
    table = wordCleaner(table)
    let query = `
                 DELETE FROM ${table}
                `
    await makeQuery(query)
}

(async () => {
    // let result = await getRelation('犬','japanese_russian')
    // console.log(result)
    
} )()