const req = require('express/lib/request')
const res = require('express/lib/response')
const Product = require('../models/product')
const ErrorHandler = require('../utils/errorHandler');
const catchAsnycErrors = require ('../middlewares/catchAsyncErrors')
const APIFeatures = require('../utils/apiFeatures')


// Create new product => /api/v1/admin/product/new
exports.newProduct = catchAsnycErrors( async (req,res,next)=> {
    
    req.body.user = req.user.id;

    const product = await Product.create(req.body);
   

    res.status(201).json({
        succes : true,
        product
    })
})


//Get all products => /api/v1/products?keyword=apple
exports.getProducts =  catchAsnycErrors (async(req,res ,next)=>{
    
    const resPerPage=15
    const productCount = await Product.countDocuments();

    const apiFeatures = new APIFeatures(Product.find(),req.query).search().filter().pagination(resPerPage)
    
    const products = await apiFeatures.query;
       
    res.status(200).json({
        succes : true,
        count : products.length,
        message : 'This route will show all products in database',
        productCount,
        products
    })})
// Get single product details => /api/v1/product/:id
exports.getSingleProduct = catchAsnycErrors( async (req, res , next)=> {

    
        const product = await Product.findById(req.params.id);
        if(!product){
            return  next(new ErrorHandler('Product not found', 404));
        }
        res.status(200).json({
            succes: true,
            product
        })
    
  

})

//update Product => /api/v1/product/:id
exports.updateProduct = catchAsnycErrors (async (req,res,next)=>{
    let product = await Product.findById(req.params.id);

    if(!product){
        return  next(new ErrorHandler('Product not found', 404));
    }

    product = await Product.findByIdAndUpdate(req.params.id,req.body,{
        new : true,
        runValidators: true,
        useFindandModify: false
    });
    res.status(200).json({
        succes: true,
        product
    })
})

//Delete Product =<api/v1/admin/product/:id

exports.deleteProduct = catchAsnycErrors(async (req, res , next)=>{

    const product = await Product.findById(req.params.id);

    if(!product){
        return  next(new ErrorHandler('Product not found', 404));
    }

    await product.remove();
    req.status(200).json({
        succes : true,
        message : 'Product id deleted'

    })

})

//Create new review => /api/v1/review
exports.createProductReview = catchAsnycErrors(async(req,res,next)=> {
        const {rating , comment , productId}=req.body;

        const review = {
            user : req.user._id,
            name : req.user.name,
            rating: Number(rating),
            comment
        }

        const product = await Product.findById(productId);
        const isReviewed = product.reviews.find(
            r=> r.user.toString()=== req.user._id.toString()
        )
    
        if(isReviewed){
            product.reviews.forEach(review =>{
                if(review.user.toString()===req.user._id.toString()){
                    review.comment = comment;
                    review.rating= rating;
                }
            })
        }else{
            product.reviews.push(review);
            product.numOfReviews = product.reviews.length
        }
        product.rating=product.reviews.reduce((acc, item) => item.rating + acc , 0)/ product.reviews.length

        await product.save({validateBeforeSave: false});

        res.status(200).json({
            succes: true
        })
})