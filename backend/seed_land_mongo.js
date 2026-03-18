import mongoose from 'mongoose';

const MONGODB_URI = "mongodb+srv://development:1%40IDspecia@realestate.d86uplg.mongodb.net/?appName=RealEstate";

const propertySchema = new mongoose.Schema({
    title: String,
    location: String,
    price: String,
    beds: String,
    baths: String,
    sqft: String,
    bedrooms: String,
    bathrooms: String,
    area: String,
    category: String,
    description: String,
    images: [String],
    contact: String,
    sellType: String,
});

const Property = mongoose.models.Property || mongoose.model("Property", propertySchema);

const fakeLand = [
    { title: "Prime Commercial Plot", location: "Downtown Dallas, TX", price: "2,500,000", bedrooms: "0", bathrooms: "0", area: "10,000", beds: "0", baths: "0", sqft: "10,000", category: "Land", description: "Excellent location for a commercial high-rise or mixed-use development.", images: [] },
    { title: "Scenic Mountain Acreage", location: "Aspen, CO", price: "4,200,000", bedrooms: "0", bathrooms: "0", area: "435,600", beds: "0", baths: "0", sqft: "435,600", category: "Land", description: "10 acres of untouched natural beauty with panoramic mountain views.", images: [] },
    { title: "Fertile Farmland", location: "Omaha, NE", price: "850,000", bedrooms: "0", bathrooms: "0", area: "2,178,000", beds: "0", baths: "0", sqft: "2,178,000", category: "Land", description: "50 acres of flat, rich soil ready for agricultural use.", images: [] },
    { title: "Lakeside Residential Lot", location: "Lake Tahoe, NV", price: "1,150,000", bedrooms: "0", bathrooms: "0", area: "20,000", beds: "0", baths: "0", sqft: "20,000", category: "Land", description: "Build your dream home directly on the beautiful shores of Lake Tahoe.", images: [] },
    { title: "Suburban Development Parcel", location: "Charlotte, NC", price: "3,100,000", bedrooms: "0", bathrooms: "0", area: "871,200", beds: "0", baths: "0", sqft: "871,200", category: "Land", description: "20 acres zoned for residential subdivision, close to city amenities.", images: [] }
];

async function run() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB.");
        await Property.deleteMany({ category: "Land" });
        await Property.insertMany(fakeLand);
        console.log("Successfully inserted 5 land parcels!");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

run();
