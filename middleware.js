const Listing =require("./models/listing.js");
const Review =require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js")
const { listingSchema,reviewSchema } = require("./schema.js");






module.exports.isLoggedIn =(req,res,next) => {
      console.log(req.user);
  if(!req.isAuthenticated()){ // it checks whether  the user is authenticated to post the new [osts or not without signing in you can not post anything]
    req.session.redirectUrl = req.originalUrl;
    req.flash("error","you must be logged in to post")
   return  res.redirect("/login");
  }
  next();
}

module.exports.saveRedirectUrl = ( req,res,next) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
        delete req.session.redirectUrl;
    }
    next();
};


module.exports.isOwner = async(req,res,next) =>{ // for authorization of listing owner
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error", "You are nort the owner of this listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
};


module.exports.validateListing =(req,res,next)=>{
let{error}=  listingSchema.validate(req.body);
      if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
      }
      else{
        next();
      }
};

// module.exports.validateListing = (req,res,next)=>{
//   let { error } = listingSchema.validate(req.body);
//   if (error) {
//     let errMsg = error.details.map((el) => el.message).join(",");
//     req.flash("error", errMsg);
//     return res.redirect("/listings/new");   // ✅ redirect back, stop execution
//   }
//   next();
// };



module.exports.validateReview =(req,res,next)=>{
let{error}=  reviewSchema.validate(req.body);
      if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
      }
      else{
        next();
      } 
};

module.exports.isReviewAuthor = async(req,res,next) =>{ // for authorization of listing owner
    let {id, reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error", "You are nort the author of this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
};
