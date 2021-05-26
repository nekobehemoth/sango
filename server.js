const app = require('./app')

const port = process.env.PORT || 3000

function startServer(port) {
    app.listen(port, () => {
        console.log(`App run at http://localhost:${port}`)
    })
}

if(require.main === module) {
    startServer(port)
} else {
    module.exports = startServer
}

