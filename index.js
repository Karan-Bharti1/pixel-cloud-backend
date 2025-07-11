const express=require("express")
const { Auth } = require("googleapis")
const nodemailer=require('nodemailer')
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
const transporter=nodemailer.createTransport({
  service:'gmail',
  host:'smtp.gmail.com',
  secure:false,
  port:587,
  auth:{
    user:process.env.EMAIL,
    pass:process.env.PASSWORD
  }
})
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
const PixelComment = require("./models/PixelComment")

app.get("/",(req,res)=>{
    res.send("Server is Good to go")// Server testing
})
app.use("/auth",authRoutes)
app.post("/album",verifyJWT,async(req,res)=>{
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
app.post("/album/:albumId/update",verifyJWT, async (req, res) => {
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
app.delete("/album/:albumId",verifyJWT,async(req,res)=>{
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
app.get("/albums/album/:id",verifyJWT,async(req,res)=>{
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


app.post("/upload",verifyJWT, upload.single("image"), async (req, res) => {
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
app.get("/images/:albumId",verifyJWT,async(req,res)=>{
  try {
   const images=await PixelImage.find({albumId:req.params.albumId,isDeleted:false}) 
   if(images){
    res.status(200).json(images)
   }else{
    res.status(404).json({message:"Images Not Found"})
   }
  } catch (error) {
    res.status(500).status({message:"Error while fetching album data:",error})
  }
})
app.delete("/images/delete-by-album/:albumId",verifyJWT,  async (req, res) => {
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
app.delete("/image/:imageId",verifyJWT,async(req,res)=>{
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
app.post("/image-update/:imageId",verifyJWT, async (req, res) => {
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
app.get("/image/:imageId",verifyJWT,async(req,res)=>{
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


app.post("/image/comment",verifyJWT, async (req, res) => {
  try {
    const { imageId, text ,userName} = req.body;

    if (!mongoose.Types.ObjectId.isValid(imageId)) {
      return res.status(400).json({ message: "Invalid image ID" });
    }

    const newComment = new PixelComment({
      imageId: new mongoose.Types.ObjectId(imageId),
      text,userName
    });

    const savedData = await newComment.save();

    return res.status(200).json(savedData);
  } catch (error) {
    console.error("POST /image/comment failed:", error);
    return res.status(500).json({ message: "Failed to add comment to the image" });
  }
});



app.get("/image/comment/:imageId",verifyJWT, async (req, res) => {
  const { imageId } = req.params;

  try {
    const objectId = new mongoose.Types.ObjectId(imageId); 
    const imageData = await PixelComment.find({ imageId: objectId });

    if (imageData) {
      res.status(200).json(imageData);
    } else {
      res.status(404).json({ message: "Comments not found." });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to find comments for the image" });
  }
});
app.post("/albums/:albumId/share",verifyJWT, async (req, res) => {
  const { users, images } = req.body;
  const albumId = req.params.albumId;
console.log(req.body)
  try {
    const album = await PixelAlbum.findById(albumId).populate("ownerId")
    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }

   const htmlBody = `
  <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); padding: 30px;">
      
      <p style="font-size: 16px; color: #555;">
        Hey there 👋,<br/><br/>
        I'd love to share my latest album with you. Click the images below to view them in full size!
      </p>
      <div style="display: grid; grid-template-columns: 1fr; gap: 15px; margin-top: 20px;">
        ${images
          .map(
            url => `
              <a href="${url}" target="_blank" rel="noopener noreferrer">
                <img src="${url}" style="width: 100%; border-radius: 10px; cursor: pointer;" />
              </a>
            `
          )
          .join('')}
      </div>
      <p style="margin-top: 30px; font-size: 16px; color: #555;">
        Want to explore more amazing albums?<br/>
        
      </p>
    </div>
  </div>
`;


    for (const email of users) {
    await transporter.sendMail({
  from: `"Pixel Cloud " <${process.env.EMAIL}>`,
  to: email,
  subject: ` ${album.ownerId.name} has  Shared album With You`,
 text: `Hey! I'm sharing my Pixel Cloud album: ${album.name}. Visit Pixel Cloud to check.`,
html: htmlBody,
});
    }

    res.status(200).json({ message: "Emails sent successfully" });

  } catch (error) {
    console.error("Error sending emails:", error);
    res.status(500).json({ message: "Failed to send emails", error });
  }
});

app.get("/liked-images/:ownerId",verifyJWT,async(req,res)=>{
 
  try{
const images=await PixelImage.find({isFavorite:true}).populate("albumId")
const userLikedImages = images.filter(
  (img) => img.albumId?.ownerId?.toString() === req.params.ownerId
);

if(userLikedImages){
  res.status(200).json(userLikedImages)
}else{
  res.status(404).json({message:"No Images found"})
}
  }catch{
res.status(500).json({message:"Failed to fetch liked images "})
  }
})
app.get("/recycle/:ownerId",verifyJWT,async(req,res)=>{
  try{
const recycledImages=await PixelImage.find({isDeleted:true}).populate("albumId")
console.log(recycledImages)
const requiredData=recycledImages?.filter(img=>img.albumId.ownerId)
if(requiredData){
  res.status(200).json(requiredData)
}else{
  res.status(404).json({message:"No Data Found"})
}
  }catch(err){
console.log(err)
    res.status(500).json({message: "Failed to get Images Data"})
  }
})






app.listen(PORT,()=>{
    console.log("App is connected to the PORT:",PORT)
})