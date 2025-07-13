# 🖼️ Pixel Cloud - Backend

**Pixel Cloud** is a full-stack Image Management System, allowing users to:

- 🔐 Login via Google OAuth2
- 📁 Create & manage albums
- 📸 Upload, tag, edit & delete images
- ❤️ Like/favorite images
- 💬 Add comments on images
- 🗑️ Soft-delete & restore images (Recycle Bin)
- 📤 Share albums via email

🌐 [Frontend Live](https://pixel-cloud-three.vercel.app/login)  
🚀 [Backend URL](https://pixel-cloud-backend.vercel.app)

---

## 🧱 Tech Stack

- **MERN Stack** (MongoDB, Express.js, React.js, Node.js)
- **Redux Toolkit** (Frontend State Management)
- **Google OAuth 2.0** (Authentication)
- **Multer** (Image Upload Middleware)
- **Cloudinary** (Image Hosting)
- **Nodemailer** (Email Sharing)
- **JWT** (Auth protection)
- **dotenv** (Environment configs)

---

## 🔐 Environment Variables

`.env` file:

```env
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret
EMAIL=your_gmail_email
PASSWORD=your_app_password
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

---

## 🗃️ Models Summary

### 📌 PixelUser

```js
{
  name: String,
  email: String,
  image: String
}
```

---

### 📌 PixelAlbum

```js
{
  name: String,
  description: String,
  ownerId: { type: ObjectId, ref: "PixelUser" },
  sharedUsers: [String] // emails
}
```

---

### 📌 PixelImage

```js
{
  albumId: { type: ObjectId, ref: "PixelAlbum" },
  name: String,
  tags: [String],
  imageUrl: String,
  isFavorite: Boolean,
  person: String,
  isDeleted: Boolean,
  size: Number,
  uploadedAt: Date
}
```

---

### 📌 PixelComment

```js
{
  text: String,
  imageId: { type: ObjectId, ref: "PixelImage" },
  userName: String
}
```

---

## 📡 API Endpoints (Protected with JWT)

### ✅ Auth

```http
POST /auth/google-login
```

---

### 📁 Albums

```http
POST    /album                        # Create album
GET     /album                        # Get all albums (admin)
GET     /album/:ownerId              # Get albums of specific user
GET     /albums/album/:id            # Get single album
POST    /album/:albumId/update       # Update album
DELETE  /album/:albumId              # Delete album
```

---

### 📸 Images

```http
POST    /upload                      # Upload image with Multer + Cloudinary
GET     /images/:albumId            # Get all images of album
GET     /image/:imageId             # Get single image
POST    /image-update/:imageId      # Update image data
DELETE  /image/:imageId             # Delete specific image
DELETE  /images/delete-by-album/:albumId   # Delete all images in album
```

---

### ❤️ Liked / Favorite Images

```http
GET /liked-images/:ownerId          # Get all liked images of user
```

---

### 🗑️ Recycle Bin

```http
GET /recycle/:ownerId               # Get deleted images of user
```

---

### 💬 Comments

```http
POST /image/comment                 # Add comment on image
GET  /image/comment/:imageId        # Get all comments on image
```

---

### 📤 Share Album via Email

```http
POST /albums/:albumId/share         # Send album images via email
Request Body:
{
  users: [emails],
  images: [urls]
}
```

---

## ▶️ Run Locally

```bash
git clone https://github.com/your-repo/pixel-cloud-backend.git
cd pixel-cloud-backend
npm install
touch .env    # Add your environment variables
npm start
```

---

## Author

- [@Github](https://github.com/Karan-Bharti1)
- [@LinkedIn](https://www.linkedin.com/in/bharti1999/)




## 🚀 About Me
Hi there! 👋.
I am currently learning Full Stack Web Development with a focus on the MERN stack (MongoDB, Express.js, React, and Node.js). I'm passionate about building dynamic, user-friendly web applications and continuously improving my skills.
