const bcrypt = require('bcryptjs/dist/bcrypt');
const { default: mongoose } = require('mongoose');
const mangoose = require('mongoose');
const validator = require('validator');
const jwt = require ('jsonwebtoken');
const crypto = require('crypto')


const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true ,'Please enter your name'],
        maxlength: [30, 'Your name cannot exceed 30 characters']
    },
    email :{
        type : String,
        required:[true,'Please enter your email'],
        unique : true,
        validate : [validator.isEmail,'Please valid email adress']

    },
    password : {
        type : String,
        required : [true ,'Please enter your name'],
        minlength: [6, 'Your password must be longer than 6 characters'],
        select : false
    },
    avatar : {
        public_id : {
            type:String,
            required : true
        },
        url : {
            type : String,
            required:true
        }
    },
    role: {
        type : String,
        default:'user'
    },
    createdAt: {
        type: Date,
        default :Date.now
    },
    resetPasswordToken : String ,
    resetPasswordExpire : Date
})

userSchema.pre('save', async function (next){
    if(!this.isModified('password')){
        next()
    }
    this.password = await bcrypt.hash(this.password,10)
})
// Compare user password
userSchema.methods.comparePassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password)
}

//Return JWT token 
userSchema.methods.getJwtToken = function(){
    return jwt.sign({id: this._id}, process.env.JWT_SECRET,{
        expiresIn : process.env.JWT_EXPIRES_TIME
    })
}

//Generate password reset token
userSchema.methods.getResetPasswordToken = function(){

    //Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    //Hash and set to resetPasswordtoken
    this.resetPasswordToken

    //set token expire time
    this.resetPasswordExpire = Date.now() + 30*60*1000

    return resetToken

}
module.exports = mongoose.model('User',userSchema)