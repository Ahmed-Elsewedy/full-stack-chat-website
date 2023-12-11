const express = require('express')
require('dotenv').config()
require('./config/db')
const cors = require('cors')
const app = express()
const path = require('path')
const session = require("express-session");

const port = process.env.PORT || 3000
const httpStatusText = require('./utils/httpStatusText')
const userRouter = require('./routes/user.routes')
const messageRouter = require('./routes/message.routes')
const googleRouter = require('./routes/google.routes')
const setupWebSocket = require('./websocket/websocket')

const passport = require('./config/passport-config')

app.use(session({
    secret: "your-secret-key",
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize())
passport.use(passport.session())

app.use(express.json())

app.use('/api/uploads', express.static(path.join(__dirname, '/uploads/')))

app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL
}))

app.get('/api', (req, res) => {
    res.json('Test Response')
})

app.use('/api/user', userRouter)
app.use('/api/message', messageRouter)
app.use('/', googleRouter)


app.use((error, req, res, next) => {
    res.status(error.statusCode || 500).json({ status: error.statusText || httpStatusText.ERROR, message: error.message, code: error.statusCode || 500, data: null });
})

const server = app.listen(port, () => {
    console.log(`Your app listening on port ${port}`)
})

setupWebSocket(server)