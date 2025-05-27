const express=require("express")
const { Auth } = require("googleapis")
const PORT=process.env.PORT||5000
const app=express()
const cors=require('cors')
require("./database/dbConnection")
const PixelUser=require("./models/PixelUser")
const corsOptions = {
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  credentials: true, 
};

app.use(cors(corsOptions));
app.use(express.json())
const authRoutes=require("./Routes/authRoutes")
app.get("/",(req,res)=>{
    res.send("Server is Good to go")// Server testing
})
app.use("/auth",authRoutes)
app.listen(PORT,()=>{
    console.log("App is connected to the PORT:",PORT)
})