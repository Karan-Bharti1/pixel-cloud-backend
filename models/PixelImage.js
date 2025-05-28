const mongoose=require("mongoose")

const commentSchema = new Schema({
  userEmail: {
    type: String,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email address']
  },
  text: {
    type: String,
    required: true
  },
  commentedAt: {
    type: Date,
    default: Date.now
  }
});
const imageSchema=new mongoose.Schema({
albumId:{
    type:Schema.Types.ObjectId,
    ref:"PixelAlbum",
    requireed:true
},name:{
    type:String,
   required:true
},tags:[{
    type:String
}],
isFavorite:{
    type:Boolean,
    default:false
},
person:{
type:String
},
comments:[commentSchema],
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