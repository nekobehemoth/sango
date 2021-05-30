
const db = require('../db')
const {lastPathSegment, wordCleaner} = require('./utilites')

//////////////////////////////////////////////////////'Get' functionality//////////////////////////////////////////////////////

exports.search = async (req, res) => {
    let searchFor = req.params.searchFor
    console.log("We are searching for: ", searchFor)
    try {
        let found = await db.search(searchFor)
        console.log("we find: ", found)
        res.send(found)

    } catch (err) {
        res.send({"message": err.message})
    }
}

exports.getAllEntities = async (req, res) => {
    const url = req.url
    let lastSegment = lastPathSegment(url)
    try {
        let allEntities = await db.getAllFromTable(lastSegment)
        res.json(allEntities)
    } catch (err) {
        res.json({"message": err.message})
    }
    
}

exports.getRelation = async (req, res) => {
    let url = req.url
    let tableName = url.match(/(?<=api\/)(.*?)\//)
    console.log('table name is: ', tableName)
    let searchFor = req.params.searchFor
    try {
        let found = await db.getRelation(searchFor, tableName[1])
        res.send(found)
    } catch (err){
        res.send({"message": err.message})
    }
}

//////////////////////////////////////////////////////'Add' functionality//////////////////////////////////////////////////////

exports.addEntities = async (req, res) => {
    const url = req.url
    let tableName = url.match(/(?<=api\/).*/)
    console.log(req.body.entity)
    const entity = wordCleaner(req.body.entity)
    
    try {
        console.log("entity is: ", entity)
        console.log('url is: ', tableName[0])
        await db.addEntities(entity, tableName[0])
        res.send({"message": 'Successfully added in DB'})
    } catch(err) {
        res.send({"message": err.message})
    }
    
}

exports.addRelation = async (req, res) => {
    const url = req.url
    let tableName = url.match(/(?<=api\/).*/)
    let firstEntity = req.body.firstEntity
    let secondEntity = req.body.secondEntity

    console.log("First entity", firstEntity)

    try {

        await db.addRelation(firstEntity, secondEntity, tableName[0])
        res.send({"message": "Relation added successesfully" })
    } catch(err) {
        if (err.code == 'ER_BAD_FIELD_ERROR'){
            res.send({"error": "Here no such words in database"})
        }
        res.send({"message": err.message})
    }
}

//////////////////////////////////////////////////////'Delete' functionality//////////////////////////////////////////////////////

exports.deleteEntity = async (req, res) => {
    let url = req.url
    let tableName = url.match(/(?<=api\/)(.*?)\//)
    const deleteEntity = req.params.entity

    try {
        await db.deleteEntity(deleteEntity, tableName[1])
        res.send({"message": `Delete ${deleteEntity} successfully` })
    } catch (err) {
        res.send({"message": err.message})
    }
}

exports.deleteRelation = async(req, res) => {
    let url = req.url
    let tableName = url.match(/(?<=api\/)(.*?)\//)
    let firstEntityToDelete = req.params.firstEntity
    let secondEntityToDelete = req.params.secondEntity

    try {
        await db.deleteRelation(firstEntityToDelete, secondEntityToDelete, tableName[1])
        res.send({"message": `Relation between '${firstEntityToDelete}' and '${secondEntityToDelete}' successfully deleted`})
    } catch (err) {
        res.send({"message": err.message})
    }
}
//////////////////////////////////////////////////////Error handlers//////////////////////////////////////////////////////////
exports.notFound = (req, res) => {
    res.send({"message": '404 - Not Found'})
}

exports.serverError = (err, req, res, next) => {
    console.error(err.message);
    // res.status(500);
    res.send({"message": '500'})
}