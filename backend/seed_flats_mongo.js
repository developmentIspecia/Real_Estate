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

const fakeFlats = [
    { title: "Luxury Penthouse Downtown", location: "New York, NY", price: "5,500,000", bedrooms: "3", bathrooms: "3", area: "2,800", beds: "3", baths: "3", sqft: "2,800", category: "Flats", description: "Top-floor penthouse with stunning skyline views.", images: [] },
    { title: "Modern Loft in Arts District", location: "Los Angeles, CA", price: "950,000", bedrooms: "1", bathrooms: "1", area: "1,200", beds: "1", baths: "1", sqft: "1,200", category: "Flats", description: "Industrial-style loft with exposed brick walls.", images: [] },
    { title: "Cosy Studio Apartment", location: "San Francisco, CA", price: "600,000", bedrooms: "1", bathrooms: "1", area: "650", beds: "1", baths: "1", sqft: "650", category: "Flats", description: "Efficient and stylish studio in a prime location.", images: [] },
    { title: "Spacious 2BHK with Balcony", location: "Chicago, IL", price: "800,000", bedrooms: "2", bathrooms: "2", area: "1,500", beds: "2", baths: "2", sqft: "1,500", category: "Flats", description: "Bright apartment with a large private balcony.", images: [] },
    { title: "High-Rise Condo with Amenities", location: "Miami, FL", price: "1,200,000", bedrooms: "2", bathrooms: "2", area: "1,800", beds: "2", baths: "2", sqft: "1,800", category: "Flats", description: "Condo featuring pool, gym, and 24/7 concierge.", images: [] },
    { title: "Charming Garden Apartment", location: "Boston, MA", price: "750,000", bedrooms: "2", bathrooms: "1", area: "1,100", beds: "2", baths: "1", sqft: "1,100", category: "Flats", description: "First-floor apartment with direct garden access.", images: [] },
    { title: "Sleek Minimalist Flat", location: "Seattle, WA", price: "850,000", bedrooms: "2", bathrooms: "2", area: "1,350", beds: "2", baths: "2", sqft: "1,350", category: "Flats", description: "Contemporary design with high-end appliances.", images: [] },
    { title: "Riverfront Condominium", location: "Austin, TX", price: "1,100,000", bedrooms: "3", bathrooms: "2", area: "1,900", beds: "3", baths: "2", sqft: "1,900", category: "Flats", description: "Beautiful views of the river and running trails.", images: [] },
    { title: "Historic Building Apartment", location: "Philadelphia, PA", price: "650,000", bedrooms: "2", bathrooms: "1", area: "1,400", beds: "2", baths: "1", sqft: "1,400", category: "Flats", description: "Unique apartment with original hardwood floors.", images: [] },
    { title: "Urban Oasis Dupelx", location: "Denver, CO", price: "980,000", bedrooms: "3", bathrooms: "3", area: "2,100", beds: "3", baths: "3", sqft: "2,100", category: "Flats", description: "Two-story apartment right in the city center.", images: [] }
];

async function run() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB.");
        await Property.deleteMany({ category: "Flats" });
        await Property.insertMany(fakeFlats);
        console.log("Successfully inserted 10 flats!");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

run();
