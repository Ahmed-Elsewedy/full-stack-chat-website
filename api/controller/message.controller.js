const asyncWrapper = require('../middlewares/asyncWrapper')
const Message = require('../models/message.mode')
const httpStatusText = require('../utils/httpStatusText')

newMessage = async body => {
    const message = new Message(body)
    await message.save()
    return message._id
}

chatBetweenTwo = asyncWrapper(async (req, res) => {
    const sender = req.currentUser.id
    const receiver = req.body.receiver

    const limit = req.query.limit || 50
    const page = req.query.page || 1
    const skip = limit * (page - 1)

    const messages = await Message.find({
        $or: [
            { sender, receiver },
            { sender: receiver, receiver: sender },
        ],
    }).sort({ createdAt: 1 }).limit(limit).skip(skip)
    res.json({ status: httpStatusText.SUCCESS, data: { messages } })
})



module.exports = {
    newMessage,
    chatBetweenTwo,
}