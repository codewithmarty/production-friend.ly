const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const friendshipSchema = new Schema({
    sender: { type: Schema.Types.ObjectId, required: true },
    receiver: { type: Schema.Types.ObjectId, required: true },
    confirmed: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('Friendship', friendshipSchema);