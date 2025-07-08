const mongoose = require('mongoose');
const { Schema } = mongoose;

const albumSchema = new Schema({
  name: {
    type: String,
    required: true   
  },
  description: {
    type: String, 
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: "PixelUser",
    required: true   
  },
  isDeleted:{
    type:Boolean,
    default:false
  },
  sharedUsers: [{
    type: String,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email address']

  }]
}, {
  timestamps: true
});

module.exports = mongoose.model("PixelAlbum", albumSchema);
