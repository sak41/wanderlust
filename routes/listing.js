const express=require("express");
const router= express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing =require("../models/listing.js");
const {isLoggedIn , isOwner, validateListing} = require("../middleware.js");
const multer = require('multer');
const {storage} = require("../cloudConfig.js")
const upload = multer({storage });

const listingcontoller = require("../controllers/listing.js");

router.route("/")
.get( wrapAsync(listingcontoller.index)) // index route
.post(isLoggedIn,
  upload.single("listing[image]"), // create route
    validateListing,
    wrapAsync(listingcontoller.createListing)
);

 // new route
router.get("/new", isLoggedIn, wrapAsync(listingcontoller.renderNewForm));

router.route("/:id")
.get(wrapAsync(listingcontoller.showListing)) // show route
.put(isLoggedIn, isOwner,upload.single("listing[image]"),validateListing,wrapAsync(listingcontoller.updateListing)) // update route
.delete(isLoggedIn, isOwner,wrapAsync(listingcontoller.destroyListing)); // delete routee



// edit route
router.get("/:id/edit",
  isLoggedIn,isOwner,
     wrapAsync(listingcontoller.renderEdit)
);






module.exports = router;



