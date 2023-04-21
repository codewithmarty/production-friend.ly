const express = require('express')
const router = express.Router()
const usersCtrl = require('../../controllers/api/users')
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })

router.use(require('../../config/auth'))
router.post('/login', usersCtrl.login)
router.post('/signup', usersCtrl.create)
router.put('/profile', usersCtrl.updateProfile)
router.get('/:email', usersCtrl.getCurrentUser)
router.put('/:userId/uploadImage', upload.single('file'), usersCtrl.uploadImage)

module.exports = router;