var dotenv = require('dotenv')
dotenv.load()

var express = require('express')
var app = express()
var port = process.env.PORT || 3000
var morgan = require('morgan')
var mongoose = require('mongoose')
var bodyParser = require('body-parser')
var spawn = require('child_process').spawn
var admin = require('firebase-admin')
var path = require('path')
var server = require('http').createServer(app)
var io = require('socket.io')(server)

var serviceAccount = require('./util/firebase-admin.json')
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://mark-morcos.firebaseio.com'
})

app.use(morgan('dev'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json({ limit: '5mb' }))

mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost/goer', { useMongoClient: true })

app.use('/admin', express.static('admin/dist'))
app.get('/admin*', function(req, res) {
    return res.sendFile(path.join(__dirname, 'admin/dist/index.html'))
})

app.use(express.static('public'))

app.post('/deploy', function(req, res) {
    spawn('sh', ['./public/deploy.sh'])
    res.json({ success: true })
})

routes = require('./routes')
routes(app)

app.use(function(req, res) {
    return res.status(404).send({ error: req.method + ' ' + req.originalUrl + ' not found' })
})

io.on('connection', function(client) {
    console.log('Client connected...')
})

server.listen(port, function() {
    console.log('RESTful API server started on: ' + port)
})
