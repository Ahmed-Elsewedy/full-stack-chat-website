const crypto = require('crypto')
const User = require('../models/user.model')
const asyncWrapper = require('../middlewares/asyncWrapper')
const httpStatusText = require('../utils/httpStatusText')
const appError = require('../utils/appError')
const sendEmail = require('../utils/email')
const Message = require('../models/message.mode')


// auth 
register = asyncWrapper(async (req, res, next) => {

    const { username, email } = req.body
    let oldUser = await User.findOne({ email })
    if (oldUser) {
        const error = appError.create('email already exist', 400, httpStatusText.FAIL)
        return next(error)
    }
    oldUser = await User.findOne({ username })
    if (oldUser) {
        const error = appError.create('username already exist', 400, httpStatusText.FAIL)
        return next(error)
    }
    const user = new User(req.body)
    await user.save()
    const token = await user.generateToken()
    res.status(201).json({ status: httpStatusText.SUCCESS, data: { user, token } })
})

login = asyncWrapper(async (req, res, next) => {
    const { username, password } = req.body

    if (!username || !password)
        return next(appError.create('username and password are required', 400, httpStatusText.FAIL))

    const user = await User.findOne({
        $or: [
            { username },
            { email: username }
        ]
    })

    if (!user)
        return next(appError.create('user not exist', 400, httpStatusText.FAIL))

    if (!await user.isPasswordMatched(password))
        return next(appError.create('wrong password', 400, httpStatusText.FAIL))

    const token = await user.generateToken()
    res.status(200).json({ status: httpStatusText.SUCCESS, data: { user, token } })
})

forgetPassword = asyncWrapper(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email })

    if (!user)
        return next(appError.create('user not found', 400, httpStatusText.FAIL))

    const resetToken = user.createPasswrdResetToken()
    await user.save({ validateBeforeSave: false })

    const resetUrl = `${req.protocol}://${req.get('host')}/api/user/resetPassword/${resetToken}`

    const message = `forget your password?\n
    click this link ${resetUrl}\n
    `
    try {
        await sendEmail({
            email: user.email,
            subject: 'your password reset token (valid 10 minutes)',
            message,
            resetToken
        })

        res.status(200).json({ status: httpStatusText.SUCCESS, message: 'Token sent to email' })
    } catch (err) {
        user.passwordResetToken = undefined
        user.passwordResetExpires = undefined
        await user.save({ validateBeforeSave: false })

        return next(appError.create('email not exist', httpStatusText.ERROR))
    }
})

resetPassword = asyncWrapper(async (req, res, next) => {

    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex')

    const user = await User.findOne({
        passwordResetExpires: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    })

    if (!user)
        return next(appError.create('Invalid token or expired', 400, httpStatusText.FAIL))

    user.password = req.body.password
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined

    await user.save()

    res.status(200).json({ status: httpStatusText.SUCCESS, data: { user, token: await user.generateToken() } })

})

// 
profile = asyncWrapper(async (req, res, next) => {
    const user = await User.findById(req.currentUser.id)
    const token = await user.generateToken()
    res.status(200).json({ status: httpStatusText.SUCCESS, data: { user, token } })
})

updateProfile = asyncWrapper(async (req, res, next) => {
    const id = req.currentUser.id
    const { fullname, username } = req.body
    if (!username)
        return next(appError.create('username required', 400, httpStatusText.FAIL))

    const userName = await User.findOne({ username })
    if (userName)
        return next(appError.create('username already exist', 400, httpStatusText.FAIL))


    const user = await User.findByIdAndUpdate(id, { fullname, username })
    token = await user.generateToken()
    res.status(200).json({ status: httpStatusText.SUCCESS, data: { user, token } })

})

peopleChated = asyncWrapper(async (req, res, next) => {

    const userId = req.currentUser.id

    const users = await User.find({ _id: { $ne: userId } })

    const peoplePromises = users.map(async (user) => {
        const msg = await Message
            .findOne({
                $or: [
                    { sender: userId, receiver: user._id },
                    { receiver: userId, sender: user._id },
                ]
            })
            .sort({ createdAt: -1 })
            .select('createdAt')

        if (msg)
            return { id: user._id, username: user.username, fullname: user.fullname, time: msg.createdAt };
    });

    let people = (await Promise.all(peoplePromises)).filter(Boolean);
    people = people.sort((a, b) => new Date(b.time) - new Date(a.time));

    res.status(200).json({ status: httpStatusText.SUCCESS, data: { people } })

})

allUsers = asyncWrapper(async (req, res) => {
    const userId = req.currentUser.id
    const users = await User.find({ _id: { $ne: userId } }).sort({ username: 1 })
    res.status(200).json({ status: httpStatusText.SUCCESS, data: { users } })
})

module.exports = {
    register,
    login,
    profile,
    peopleChated,
    updateProfile,
    allUsers,
    forgetPassword,
    resetPassword,
}