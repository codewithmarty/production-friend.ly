const express = require('express');
const router = express.Router();
const friendshipsCtrl = require('../../controllers/api/friendships');

router.get('/', friendshipsCtrl.getUsers)
router.post('/', friendshipsCtrl.filterUsers)
router.put('/update', friendshipsCtrl.updateRequests)
router.get('/:userId', friendshipsCtrl.getRequests)
router.get('/chats/:userId', friendshipsCtrl.getChats)
router.get('/messages/:userId/:friendId', friendshipsCtrl.getMessages)
router.post('/newMessage', friendshipsCtrl.newMessage)

module.exports = router;