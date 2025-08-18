const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const Review = require("./review.js");

const listingschema = new Schema({
    title: {
        type:String,
        required:true,
    },
    description:String,
    image: {
        url: String,
        filename: String,
    },
    price:Number,
    location:String,
    country:String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
                },
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    geometry:  {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    },
},
});

// it is the way when you delelte a listing nbut it has soome reviews and you have to delete those reviews because the main listing has been deleted so what is the point of the reviews of those listing
listingschema.post("findOneAndDelete", async(listing) =>{
    if(listing){
    await Review.deleteMany({_id : {$in: listing.reviews}});
    }
});


const Listing= mongoose.model("Listing",listingschema);
module.exports=Listing;


