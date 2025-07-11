const mongoose=require("mongoose")
const { Schema } = mongoose;
const commentSchema=new mongoose.Schema({
    text:{
        type:String,
        required:true,
        unique:false
    },
   imageId: {
   type: Schema.Types.ObjectId,
    ref:"PixelImage",
    required:true
},
userName:{
    type:String,
    required:true
}
},{
    timestamps:true
})
module.exports=mongoose.model("PixelComments",commentSchema)