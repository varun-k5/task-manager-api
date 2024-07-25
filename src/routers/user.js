const express=require('express')
const User=require('../models/user')
const auth=require('../middleware/auth')
const router=new express.Router()
const multer=require('multer')

router.post('/users', async (req,res)=>{
    const user=new User(req.body)

    try{
        await user.save()
        const token=await user.generateAuthToken()
        res.status(201).send({user,token})
        
    }  catch(e){
        res.status(400).send(e)
    }
}) 

router.post('/users/login',async (req,res)=>{
    try{
        const user=await User.findByCredentials(req.body.email,req.body.password)
        const token=await user.generateAuthToken()
        res.send({user,token})
    }catch(e){
        //console.log(e)
        res.status(400).send(e.message)
    }
})

router.post('/users/logout',auth,async(req,res)=>{
    try{
        req.user.tokens=req.user.tokens.filter((token)=>{
            return token.token!==req.token
        })
 
        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send()
    }
})

router.post('/users/logoutAll',auth,async (req,res)=>{
    try{
        req.user.tokens=[]
        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send()
    }
})

router.get('/users/me',auth,async (req,res)=>{
    // try{
    //     const users=await User.find({})
    //     res.send(users)
    // }catch(e){
    //     res.status(500).send()
    // }
    res.send(req.user)
})

/*router.get('/users/:id',async (req,res)=>{
    const _id=req.params.id
    
    try{
        const user=await User.findById(_id)

        if(!user){
            res.status(404).send()
        }
        res.send(user)

    }catch(e){
        res.status(500).send()
    }
})*/

router.patch('/users/me',auth,async(req,res)=>{
    const updates=Object.keys(req.body)
    const allowedUpdates=['name','email','password','age']
    const isValidOperaion=updates.every((update)=>allowedUpdates.includes(update))
    
    if(!isValidOperaion){
        return res.status(400).send({error:'Invalid Updates'})
    }
    try{
        //const user=await User.findById(req.params.id)
        const user=req.user
        updates.forEach((update)=>user[update]=req.body[update])
        await user.save()
        
        //const user=await User.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true})
        /*if(!user){
            return res.status(404).send()
        }*/
        res.send(user)
    }catch(e){
        res.status(400).send(e)
    }
})

router.delete('/users/me',auth,async(req,res)=>{
    try{
        await req.user.remove()
        res.send(req.user)
    }catch(e){
        res.status(500).send()
    }
})
/*router.delete('/users/:id',async(req,res)=>{
    try{
        const user =await User.findByIdAndDelete(req.params.id)
        if(!user){
            res.status(404).send()
        }
        res.status(200).send()
    }catch(e){
        res.status(500).send()
    }
})*/

const upload=multer({
    dest:'avatars',
    limits:{
        fileSize:1000000//bytes mai 
    },
    fileFilter(req, file, cb) {//cb mtlb callback
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image'))
        }
        
        cb(undefined, true)

    }
})

router.post('/users/me/avatar', upload.single('avatar'), (req, res)=>{
    res.send()
})

module.exports=router