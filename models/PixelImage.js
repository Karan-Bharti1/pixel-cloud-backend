const mongoose=require("mongoose")
const PixelAlbum = require("./PixelAlbum")

const { Schema } = mongoose;

const imageSchema=new mongoose.Schema({
albumId:{
   type: Schema.Types.ObjectId,
    ref:"PixelAlbum",
    required:true
},name:{
    type:String,
   required:true
},tags:[{
    type:String
}],
imageUrl: {
  type: String,
  required: true
},
isFavorite:{
    type:Boolean,
    default:false
},
person:{
type:String
},

  isDeleted:{
    type:Boolean,
    default:false
  },
 size: {
    type: Number,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
},{
    timestamps:true
})
module.exports=mongoose.model("PixelImage",imageSchema)