const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
    required: true
  },
  password: {
    type: String,
    trim: true,
    minLength: 3,
    required: true
  },
  friends: { 
    type: Array
   },
  imageUrl: { 
    type: String, 
    default: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png' 
  },
  bio: { 
    type: String, 
    default: '' 
  },
  interests: { 
    type: Array, 
    default: [] 
  },
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      return ret;
    }
  }
});

module.exports = mongoose.model('User', userSchema);