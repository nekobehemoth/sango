const express = require('express')

const app = express()

app.use(express.urlencoded({extended:true}))
app.use(express.json())

require('./routers')(app)

module.exports = app