const express=require("express")
const { Auth } = require("googleapis")
const cloudinary=require('cloudinary')
const mongoose=require('mongoose')
const multer=require('multer')
const PORT=process.env.PORT||5000
const app=express()
const cors=require('cors')
require('dotenv').config()
const jwt=require("jsonwebtoken")
const JWT_SECRET = process.env.JWT_SECRET
require("./database/dbConnection")
const PixelUser=require("./models/PixelUser")
const PixelImage=require('./models/PixelImage')
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing form data

const corsOptions = {
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  credentials: true, 
};

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})
//multer
const storage=multer.diskStorage({})
const upload=multer({storage})
app.use(cors(corsOptions));


const verifyJWT=(req,res,next)=>{
    const token=req.headers["authorization"]
    if(!token){
        res.status(401).json({message:"No token was found"})
    }
   const authToken=token.split(' ')[1]
    try {
        const decodedToken=jwt.verify(authToken,JWT_SECRET)
        console.log(decodedToken)
        req.user=decodedToken
        next()
    } catch (error) {
     
       res.status(500).json({message:"Invalid Token",error}) 
    }
}
const authRoutes=require("./Routes/authRoutes")
const PixelAlbum = require("./models/PixelAlbum")
const bodyParser = require("body-parser")
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
app.get("/album",verifyJWT,async(req,res)=>{
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
app.get("/album/:ownerId",verifyJWT,async(req,res)=>{
  const data=await PixelAlbum.find({ownerId:req.params.ownerId})
  
  try {
    if(data){
res.status(200).json(data)
  }else{
    res.status(404).json({message:"Data not found"})
  }
  } catch (error) {
     
    res.status(500).status({message:"Error while fetching album data:",error})
    console.log(error)
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
app.get("/albums/album/:id",async(req,res)=>{
   const data=await PixelAlbum.findOne({_id:req.params.id})
try {
  if(data){
res.status(200).json(data)
  }else{
    res.status(404).json({message:"Data not found"})
  } 
} catch (error) {
   res.status(500).status({message:"Error while fetching album data:",error})
}
})


app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).send("No file uploaded");
    }

    const {
      albumId,
      name,
      tags
    } = req.body;

    // Parse the tags string into an actual array
    const tagsArray = tags ? JSON.parse(tags) : [];

    // Upload to cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "uploads",
    });
console.log({"AlbumId":albumId})
    // Store in MongoDB
    const newImage = new PixelImage({
      albumId: new mongoose.Types.ObjectId(albumId),
      name,
      tags: tagsArray,
      size: file.size,
      imageUrl: result.secure_url,
    });

    const finalImage=await newImage.save();

    res.status(200).json(finalImage);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to upload image data",
      error: error.message,
    });
  }
});
app.get("/images/:albumId",async(req,res)=>{
  try {
   const images=await PixelImage.find({albumId:req.params.albumId}) 
   if(images){
    res.status(200).json(images)
   }else{
    res.status(404).json({message:"Images Not Found"})
   }
  } catch (error) {
    res.status(500).status({message:"Error while fetching album data:",error})
  }
})
app.delete("/images/delete-by-album/:albumId",  async (req, res) => {
  try {
    const { albumId } = req.params;
    const images = await PixelImage.find({ albumId })
    if (images.length === 0) {
      return res.status(404).json({ message: "No images found for this album" });
    }

    const deleteResult = await PixelImage.deleteMany({ albumId });

    res.status(200).json({
      message: "All images deleted successfully for this album",
      deletedCount: deleteResult.deletedCount,
    });
  } catch (error) {
    console.error("Error while deleting images:", error);
    res.status(500).json({
      message: "Failed to delete images",
      error: error.message,
    });
  }
});
app.delete("/image/:imageId",async(req,res)=>{
  try{
const imageId=req.params.imageId
const deletedItem=await PixelImage.findByIdAndDelete(imageId)
if(deletedItem){
  res.status(200).json({message:"Image Deleted Successfully",deletedItem})
}else{
  res.status(404).json({message:"Image not found"})
}
  }catch{
res.status(500).json({message:"Failed to delete image"})
  }
})
app.post("/image-update/:imageId", async (req, res) => {
  try {
    const imageId = req.params.imageId;
    const updatedData = req.body;

    const updatedImage = await PixelImage.findByIdAndUpdate(
      imageId,
      updatedData,
      { new: true }
    );

    if (updatedImage) {
      res.status(200).json(updatedImage);
    } else {
      res.status(404).json({ message: "Image not found" });
    }
  } catch (error) {
    console.error("Error while updating image:", error);
    res.status(500).json({
      message: "Failed to update image",
      error: error.message,
    });
  }
});
app.get("/image/:imageId",async(req,res)=>{
  try {
    const image=await PixelImage.findOne({_id:req.params.imageId})
    if(image){
      res.status(200).json(image)
    }
    else {
      res.status(404).json({ message: "Image not found" });

    }
  } catch (error) {
    console.log(error)
  res.status(500).json({message:"Failed to fetch image data"})  
  }
})
app.listen(PORT,()=>{
    console.log("App is connected to the PORT:",PORT)
})