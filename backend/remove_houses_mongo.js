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

async function run() {
    try {
        console.log("Connecting to MongoDB to remove fake houses...");
        await mongoose.connect(MONGODB_URI);
        console.log("Connected. Removing houses...");

        // The fake properties we added were under category "Houses"
        const result = await Property.deleteMany({ category: "Houses" });

        console.log(`Successfully removed ${result.deletedCount} houses!`);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

run();
