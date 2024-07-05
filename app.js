const express = require("express");
const app = express();
const mongoose = require("mongoose");
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const Listing = require("./Models/listing.js")
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
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


//Index Route
app.get("/listings", async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
})

//New Route
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
})

//Show Route
app.get("/listings/:id", async (req, res) => {
    let { id } = req.params
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing })
})

//Create Route
app.post("/listings", async (req, res) => {
    // let {title, description, price, image, country, location} = body.params;
    // let listing = req.body.listing;
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
})

// Edit Route
app.get("/listings/:id/edit", async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
})

// Update Route
app.put("/listings/:id", async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
})

//Delete Route
app.delete("/listings/:id", async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
})

app.listen("8080", () => {
    console.log("Server is listening to port 8080");
});