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
const PixelAlbum = require("./models/PixelAlbum")
app.get("/",(req,res)=>{
    res.send("Server is Good to go")// Server testing
})
app.use("/auth",authRoutes)
app.post("/album",async(req,res)=>{
  try {
  const data=req.body
const newData=new PixelAlbum(data)
const savedData=await newData.save()
res.status(200).json(savedData)  
  } catch (error) {
    res.status(500).json({message:"Failed to post album data",error})
  }

})
app.get("/album",async(req,res)=>{
  const data=await PixelAlbum.find()
  
  try {
    if(data){
res.status(200).json({message:"Data fetched successfully",data})
  }else{
    res.status(404).json({message:"Data not found"})
  }
  } catch (error) {
    res.status(500).status({message:"Error while fetching album data:",error})
  }
})
app.get("/album/:ownerId",async(req,res)=>{
  const data=await PixelAlbum.find({ownerId:req.params.ownerId})
  
  try {
    if(data){
res.status(200).json({message:"Data for the owner fetched successfully",data})
  }else{
    res.status(404).json({message:"Data not found"})
  }
  } catch (error) {
    res.status(500).status({message:"Error while fetching album data:",error})
  }
})
app.post("/album/:albumId/update", async (req, res) => {
  try {
    const updatedData = await PixelAlbum.findByIdAndUpdate(
      req.params.albumId,
      req.body,
      { new: true }
    );

    if (updatedData) {
      res.status(200).json({ message: "Album updated successfully", updatedData });
    } else {
      res.status(404).json({ message: "Album not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error while updating album data", error });
  }
});
app.delete("/album/:albumId",async(req,res)=>{
  const deletedData= await PixelAlbum.findByIdAndDelete(req.params.albumId)
  try {
     if (deletedData) {
      res.status(200).json({ message: "Album deleted successfully", deletedData });
    } else {
      res.status(404).json({ message: "Album not found" });
    }
    
  } catch (error) {
        res.status(500).json({ message: "Error while deleting album data", error });
  }
})
app.listen(PORT,()=>{
    console.log("App is connected to the PORT:",PORT)
})