// Installed packages - npm init -y(package.json), Express, EJS, mongoose, EJS mate, joi(for schema validation)

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const Listing = require("./Models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema } = require("./schema.js");
const Review = require("./Models/review.js");


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));       // used to parse data recieved from POST req in readable form for Express.
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

main().then(() => {
    console.log("connected to DB")
}).catch((err) => {
    console.log(err)
});

async function main() {
    await mongoose.connect(MONGO_URL);
};


app.get("/", (req, res) => {
    res.send("Hii i am root")
});

// app.get("/testlisting", async (req, res) => {
//     let sampleListing = new listing({
//         title: "my new villa",
//         description: "On the beach",
//         price: 1200,
//         location: "Panji, Goa",
//         country: "India",
//     });

//     await sampleListing.save();
//     console.log("Sample was saved");
//     res.send("Successful testing");
// })

// Validating listing errors(through "joi")
const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        throw new ExpressError(400, error);
    } else {
        next();
    }
}


//Index Route
app.get("/listings", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

//New Route
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
})

//Show Route
app.get("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing })
}));

//Create Route
app.post("/listings", validateListing, wrapAsync(async (req, res, next) => {
    // let {title, description, price, image, country, location} = body.params;
    // let listing = req.body.listing;
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
}));

// Edit Route
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
}))

// Update Route
app.put("/listings/:id", validateListing, wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
}))

//Delete Route
app.delete("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}))

// Error Handling
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not found!"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.render("error.ejs", { message });
    // res.status(statusCode).send(message);
});

//Reviews
//Post route
app.post("/listings/:id/reviews", async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    console.log("New review saved");
    res.send("New review saved");
});

app.listen("8080", () => {
    console.log("Server is listening to port 8080");
});