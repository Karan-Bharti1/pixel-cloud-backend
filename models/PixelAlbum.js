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
  sharedUsers: [{
    type: Schema.Types.ObjectId,
    ref: "PixelUser"
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model("PixelAlbum", albumSchema);
