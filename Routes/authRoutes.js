const  router=require("express").Router()

router.get("/test",(req,res)=>{
res.send("test pass")
})


const googleHandler=require("../Controller/googleHandler")
router.get("/google",googleHandler)


module.exports=router