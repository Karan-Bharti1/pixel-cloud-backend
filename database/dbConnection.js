const mongoose=require("mongoose")
require("dotenv").config()
mongoose.connect(process.env.MONGODB).then(()=>{
    console.log("Database connected successfully")
}).catch((err)=>{
    console.log("Error while connecting to the database: ",err)
})