const mongoose=require('mongoose')
const router=require("express").Router()
const googleHandler=require("../Controller/googleHandler")
router.get("/google",googleHandler)


module.exports=router