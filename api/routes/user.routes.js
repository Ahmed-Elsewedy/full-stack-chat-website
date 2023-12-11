const express = require("express")
const router = express.Router()
const userController = require('../controller/user.controller')
const authMiddleware = require('../middlewares/auth.middleware')

router.post('/register', userController.register)
router.post('/login', userController.login)

router.post('/forgetPassword', userController.forgetPassword)
router.patch('/resetPassword/:token', userController.resetPassword)


router.get('/profile', authMiddleware, userController.profile)
router.get('/people', authMiddleware, userController.peopleChated)
router.get('/', authMiddleware, userController.allUsers)
router.patch('/update', authMiddleware, userController.updateProfile)

module.exports = router