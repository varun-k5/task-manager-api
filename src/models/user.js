const mongoose=require('mongoose')
const validator=require('validator')
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const Task=require('./task')

const userSchema=mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        unique:true,
        required:true,
        trim:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid')
            }
        }
    },
    age:{
        type:Number,
        default:0,
        validate(value){
            if(value<0){
                throw new Error('Age must be a positive')
            }
        }
    },
    password:{
        type:String,
        trim:true,
        validate(value){//minlength:7,
            if(value.length<=6){
                throw new Error('Password must be greater than 6 char.')
            }
            if(value.includes("password")){
                throw new Error('Password should not contain "password"')
            }
        }
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]
})

userSchema.virtual('tasks',{
    ref:'Task',
    localField:'_id',
    foreignField:'owner'
})


userSchema.methods.toJSON=function(){
    const user=this
    const userObject=user.toObject()

    delete userObject.password
    delete userObject.tokens

    return userObject
}

userSchema.methods.generateAuthToken=async function(){
    const user=this
    const token=jwt.sign({_id:user._id.toString()},'thisismynewcourse')//dusra part secret code hai

    user.tokens=user.tokens.concat({token})
    await user.save()

    return token
}

userSchema.statics.findByCredentials=async(email,password)=>{
    const user=await User.findOne({email})

    if(!user){
        //console.log('Unable to login')
        throw new error('User not found')
    }
    
    const isMatch= await bcrypt.compare(password,user.password)

    if(!isMatch){
        //throw new Error('Unable to login')
        //console.log('invalid password')
        throw new Error('Invalid password')
    }
    return user
}

//Hash the plain text password before saving
userSchema.pre('save',async function(next){
    const user=this

    if(user.isModified('password')){
        user.password=await bcrypt.hash(user.password,8)
    }

    next()
})

//Delete user taks when user is removed
userSchema.pre('remove',async function (next) {
    const user=this
    await Task.deleteMany({owner:user._id})
    next()
})

const User=mongoose.model('User',userSchema)
User.createIndexes();
module.exports=User