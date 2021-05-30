const app = require('./app')
const api = require('./lib/api')
const path = require('path');

//API routing

module.exports = app => {

//API endpoint for non authorized users
    app.get('/api/search/:searchFor', api.search)

    app.get('/api/russian', api.getAllEntities)
    app.get('/api/english', api.getAllEntities)
    app.get('/api/japanese', api.getAllEntities)

    app.get('/api/english-russian', api.getAllEntities)
    app.get('/api/japanese-english', api.getAllEntities)
    app.get('/api/japanese-russian', api.getAllEntities)
    
    app.get('/api/japanese-english/:searchFor', api.getRelation)
    app.get('/api/japanese-russian/:searchFor', api.getRelation)
    app.get('/api/english-russian/:searchFor', api.getRelation)
    


//API endpoint for admins or moderators
    app.post('/api/russian', api.addEntities)
    app.delete('/api/russian/:entity', api.deleteEntity)

    app.post('/api/english-russian', api.addRelation)
    app.delete('/api/english-russian/:firstEntity/:secondEntity', api.deleteRelation)

    
    app.post('/api/english', api.addEntities)
    app.delete('/api/english/:entity', api.deleteEntity)

   
    app.post('/api/japanese', api.addEntities)
    app.post('/api/japanese-english', api.addRelation)
    app.post('/api/japanese-russian', api.addRelation)
    app.delete('/api/japanese/:entity', api.deleteEntity)
    app.delete('/api/japanese-russian/:firstEntity/:secondEntity', api.deleteRelation)
    app.delete('/api/japanese-english/:firstEntity/:secondEntity', api.deleteRelation)


    //Error handlers
    app.use(api.notFound);
    app.use(api.serverError);
}   
    

