const ErrorHandler = require('../utils/errorHandler');
const catchAsnycErrors = require('./catchAsyncErrors');
const jwt = require('jsonwebtoken');
const User = require('../models/user')

//check if user is authenticated or not

exports.isAuthenticatedUser = catchAsnycErrors(async(req,res,next)=> {

    const {token} = req.cookies

    console.log(token);
    if(!token){
        return next(new ErrorHandler('Login first to access this ressource', 401))
    }
const decoded = jwt.verify(token,process.env.JWT_SECRET)
req.user = await User.findById(decoded.id);
next()
})

//Handling users roles 

exports.authorizeRoles = (...roles) => {
    return (req , res , next)=> {
        if(!roles.includes(req.user.role)) {
            return next(
            new ErrorHandler(`Role (${req.user.role}) is not allowed to access this ressource`, 403)
        ,403)}
        next()
    }
}
