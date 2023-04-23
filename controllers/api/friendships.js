const User = require('../../models/user')
const Friendship = require('../../models/friendship')
const Message = require('../../models/message')
const mongoose = require('mongoose')

module.exports = {
    getUsers,
    filterUsers,
    updateRequests,
    getRequests,
    getChats,
    getMessages,
    newMessage
}

function getIds(arr, key) {
    return arr.map(elem => elem[key]._id)
}

async function findUninteractedUserIds(user) {
    const sent = await Friendship.find({ sender: user._id })
    const receive = await Friendship.find({ receiver: user._id }) 
    return (sent.length || receive.length) ?  [getIds(sent, 'receiver'), getIds(receive, 'sender')].flat(Infinity) : []
}

async function findUninteractedUsers(req, user) {
    user = req.user || user
    const Ids = await findUninteractedUserIds(user)
    const users = await User.find({ $and: [ { _id: { $not: { $in: Ids } } },  { _id: { $not: { $eq: user._id } } } ] })
    return users
}

async function getUsers(req, res) {
    try {
        const users = await findUninteractedUsers(req)
        res.status(200).json(users)
    } catch (err) {
        res.status(400).json(err)
    }
}

async function filterUsers(req, res) {
    try {
        await Friendship.create({ sender: req.body.senderId, receiver: req.body.receiverId })
        const user = await User.findById(req.body.senderId)
        const users = await findUninteractedUsers(req, user)
        console.log(users)
        res.status(200).json(users)
    } catch (err) {
        res.status(400).json(err)
    }    
}

async function updateRequests(req, res) {
    try {
        const request = await Friendship.findOne({ receiver: req.body.user, sender: req.body.friend })
        request.confirmed = true
        await request.save()
        let requests = await Friendship.find({ receiver: req.body.user, confirmed: false })
        requests = requests.map(request => request.sender)
        const requesters = await User.find({ _id: { $in: requests } })
        res.status(200).json(requesters)
    } catch (err) {
        res.status(400).json(err)
    }
}

async function getRequests(req, res) {
    try {
        let requests = await Friendship.find({ receiver: req.params.userId, confirmed: false })
        requests = requests.map(request => request.sender)
        const requesters = await User.find({ _id: { $in: requests } })
        res.status(200).json(requesters)
    } catch (err) {
        res.status(400).json(err)
    }
}

async function getChats(req, res) {
    try {

        const sent = await Friendship.find({ sender: req.params.userId, confirmed: true })
        const receive = await Friendship.find({ receiver: req.params.userId, confirmed: true })
        const Ids = (sent.length || receive.length) ?  [getIds(sent, 'receiver'), getIds(receive, 'sender')].flat(Infinity) : []
        const users = await User.find({ $and: [ { _id: { $in: Ids } },  { _id: { $not: { $eq: req.params.userId } } } ] })
        res.status(200).json(users)
    
    } catch (err) {
        res.status(400).json(err)
    }
}

async function getMessages(req, res) {

    try {
        const messages = await Message.find({ $or: [{ senderId: req.params.userId, receiverId: req.params.friendId }, { senderId: req.params.friendId, receiverId: req.params.userId }] })
        .populate([
            'senderId',
            'receiverId'
        ])
        res.status(200).json(messages)
    } catch(err) {
        res.status(400).json(err)
    }

}

async function newMessage(req, res) {
    try {
        const newMessage = await Message.create(req.body)
        res.status(200).json(newMessage)
    } catch (err) {
        res.status(400).json(err)
    }
}