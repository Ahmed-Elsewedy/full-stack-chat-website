const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const validator = require('validator')
const crypto = require('crypto')

const utli = require('util')
const asyncsign = utli.promisify(jwt.sign)
const _ = require('lodash')


const isStrongPassword = (value) => {
    return validator.isStrongPassword(value, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
    });
};

const passwordValidation = {
    validator: isStrongPassword,
    message: 'weak password',
};

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: [validator.isEmail, 'not valid email address']
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        validate: [passwordValidation]
    },
    passwordResetToken: String,
    passwordResetExpires: Date

}, {
    toJSON: {
        transform: (doc, retuDoc) => _.omit(retuDoc, ['__v', 'password'])
    }
})

userSchema.pre('save', async function () {
    if (this.isModified('password')) {
        const saltRound = 10 // number 
        const hashedpassword = await bcrypt.hash(this.password, saltRound)
        this.password = hashedpassword
    }
})

userSchema.methods.isPasswordMatched = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

userSchema.methods.generateToken = function () {
    const token = asyncsign({
        id: this.id,
        fullname: this.fullname,
        email: this.email,
        username: this.username,
    }, process.env.SECRET_KEY, { expiresIn: "1d" })
    return token
}


userSchema.methods.createPasswrdResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex')
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000

    return resetToken
}

module.exports = mongoose.model('User', userSchema)