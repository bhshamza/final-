const ErrorHandler = require ('../utils/errorHandler');

module.exports = (err, req,res,next)=> {

    err.statusCode = err.statusCode || 500 ;

    if(process.env.NODE_ENV === 'DEVELOPMENT'){
    
        res.status(err.statusCode).json({
            succes : false,
            error : err ,
            errMessage : err.message,
            stack: err.stack
        })
    }

    if(process.env.NODE_ENV === 'PRODUCTION'){
        let error = {...err}

        error.message = err.message
        // Wrong Mongoose Object ID Error
        if(err.name ==='CastError'){
            const message = `Resource not found. Invalid: ${err.path}`
            error = new ErrorHandler(message,400)
        }
        //Handling Mongoose Validation Error
        if (err.name === 'ValidationError' ){
            const message = Object.values(err.errors).map(value => value.message);
            error = new ErrorHandler(message,400)
        }

        if(err.code ===11000){
            const message = `Duplicate ${Object.keys(err.keyValue)} entered`
            error = new ErrorHandler(message,400)
        }
        //Handling expired JWT error
        if (err.name === 'jsonWebTokenError' ){
            const message = 'JSON Web Token is invalid . Try again !';
            error = new ErrorHandler(message,400)
        }
        //Handling expired JWT error
        if (err.name === 'jsonWebExpiredError' ){
            const message = 'JSON Web Token is expired . Try again !';
            error = new ErrorHandler(message,400)
        }

        res.status(error.statusCode).json({
            succes: false,
            message: error.message ||'Internal Server Error'
    
        })
    }




  





}