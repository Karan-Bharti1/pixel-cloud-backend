const mongoose=require('mongoose')
const pixelUserSchema=new mongoose.Schema({
    name:{
    type:String
},email:{
    type:String
},
image:{
    type:String
}
},{
    timestamps:true
})
module.exports=mongoose.model("PixelUser",pixelUserSchema)