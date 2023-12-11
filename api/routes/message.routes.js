const express = require("express")
const router = express.Router()
const messageController = require('../controller/message.controller')
const authMiddleware = require('../middlewares/auth.middleware')

router.post('/chat', authMiddleware, messageController.chatBetweenTwo)


module.exports = router