if(process.env.NODE_ENV !== "production"){
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// Use Atlas URL if provided, otherwise fallback to local MongoDB
const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

async function connectDB() {
    try {
        console.log(`Connecting to MongoDB at: ${dbUrl}`);
        await mongoose.connect(dbUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("✅ Successfully connected to MongoDB");
    } catch (err) {
        console.error("❌ Database connection error:", err);
        process.exit(1); // Stop app if DB fails
    }
}

connectDB(); // Connect immediately

// ------------------------ Express setup ------------------------
app.set("view engine","ejs");
app.set("views", path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

// ------------------------ Session ------------------------
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: { secret: process.env.SECRET },
    touchAfter: 24*3600
});

store.on("error", err => {
    console.log("Error in Mongo session", err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 7*24*60*60*1000,
        maxAge: 7*24*60*60*1000
    }
};

app.use(session(sessionOptions));
app.use(flash());

// ------------------------ Passport ------------------------
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// ------------------------ Routes ------------------------
app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);

// ------------------------ 404 ------------------------
app.use((req, res, next) => {
    console.log("404 triggered for:", req.method, req.originalUrl);
    next(new ExpressError(404, "Page Not Found"));
});

// ------------------------ Error handler ------------------------
app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", { err, message });
});

// ------------------------ Server ------------------------
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});


// // Load environment variables
// if (process.env.NODE_ENV !== "production") {
//     require("dotenv").config();
// }

// const express = require("express");
// const app = express();
// const mongoose = require("mongoose");
// const path = require("path");
// const methodOverride = require("method-override");
// const ejsMate = require("ejs-mate");
// const session = require("express-session");
// const MongoStore = require("connect-mongo");
// const flash = require("connect-flash");
// const passport = require("passport");
// const LocalStrategy = require("passport-local");
// const User = require("./models/user.js");
// const ExpressError = require("./utils/ExpressError.js");

// // Routers
// const listingsRouter = require("./routes/listing.js");
// const reviewsRouter = require("./routes/review.js");
// const userRouter = require("./routes/user.js");

// // ------------------------
// // Database Connection
// // ------------------------
// const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

// if (!process.env.ATLASDB_URL && process.env.NODE_ENV === "production") {
//     console.warn("⚠️ Warning: ATLASDB_URL is not set in production!");
// }

// async function connectDB() {
//     try {
//         console.log(`Connecting to MongoDB at: ${dbUrl}`);
//         await mongoose.connect(dbUrl);
//         console.log("✅ Successfully connected to MongoDB");
//     } catch (err) {
//         console.error("❌ Database connection error:", err);
//         process.exit(1);
//     }
// }

// connectDB();

// // ------------------------
// // Express & Middleware
// // ------------------------
// app.set("view engine", "ejs");
// app.set("views", path.join(__dirname, "views"));
// app.engine("ejs", ejsMate);
// app.use(express.urlencoded({ extended: true }));
// app.use(methodOverride("_method"));
// app.use(express.static(path.join(__dirname, "/public")));

// // ------------------------
// // Session & Flash
// // ------------------------
// const store = MongoStore.create({
//     mongoUrl: dbUrl,
//     crypto: { secret: "mysupersecretcode" },
//     touchAfter: 24 * 3600, // 24 hours
// });

// store.on("error", (err) => {
//     console.log("❌ Session store error:", err);
// });

// const sessionOptions = {
//     store,
//     secret: "mysupersecretcode",
//     resave: false,
//     saveUninitialized: true,
//     cookie: {
//         httpOnly: true,
//         expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
//         maxAge: 7 * 24 * 60 * 60 * 1000,
//         // secure: true // enable in production with HTTPS
//     },
// };

// app.use(session(sessionOptions));
// app.use(flash());

// // ------------------------
// // Passport Authentication
// // ------------------------
// app.use(passport.initialize());
// app.use(passport.session());
// passport.use(new LocalStrategy(User.authenticate()));
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

// // Make flash messages & current user available in all templates
// app.use((req, res, next) => {
//     res.locals.success = req.flash("success");
//     res.locals.error = req.flash("error");
//     res.locals.currUser = req.user;
//     next();
// });

// // ------------------------
// // Routes
// // ------------------------
// app.use("/listings", listingsRouter);
// app.use("/listings/:id/reviews", reviewsRouter);
// app.use("/", userRouter);

// // ------------------------
// // 404 Handler
// // ------------------------
// app.use((req, res, next) => {
//     console.log("404 triggered for:", req.method, req.originalUrl);
//     next(new ExpressError(404, "Page Not Found"));
// });

// // ------------------------
// // Error Handler
// // ------------------------
// app.use((err, req, res, next) => {
//     if (res.headersSent) return next(err);
//     const { statusCode = 500, message = "Something went wrong!" } = err;
//     res.status(statusCode).render("error.ejs", { err, message });
// });

// // ------------------------
// // Start Server
// // ------------------------
// const PORT = process.env.PORT || 8080;
// app.listen(PORT, () => {
//     console.log(`🚀 Server is listening on port ${PORT}`);
// });
