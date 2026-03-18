const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://vaishaligupta:vaishaligupta@realestate.d86uplg.mongodb.net/real_estate?retryWrites=true&w=majority";

mongoose.connect(MONGODB_URI).then(() => {
    console.log("Connected to MongoDB");
}).catch(err => {
    console.error("Connection error:", err);
    process.exit(1);
});

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

const fakeHouses = [
    { title: "Modern Villa in Beverly Hills", location: "Beverly Hills, CA", price: "4,250,000", bedrooms: "5", bathrooms: "4", area: "4,500", beds: "5", baths: "4", sqft: "4,500", category: "Houses", description: "Stunning modern villa with panoramic views.", images: [] },
    { title: "Cozy Family Home in Suburbs", location: "Austin, TX", price: "650,000", bedrooms: "3", bathrooms: "2", area: "2,100", beds: "3", baths: "2", sqft: "2,100", category: "Houses", description: "Beautiful family home with a large backyard.", images: [] },
    { title: "Luxury Estate with Pool", location: "Miami, FL", price: "8,900,000", bedrooms: "7", bathrooms: "8", area: "10,200", beds: "7", baths: "8", sqft: "10,200", category: "Houses", description: "Incredible sprawling estate with private pool and dock.", images: [] },
    { title: "Charming Craftsman House", location: "Portland, OR", price: "725,000", bedrooms: "4", bathrooms: "3", area: "2,800", beds: "4", baths: "3", sqft: "2,800", category: "Houses", description: "Classic craftsman architecture with modern updates.", images: [] },
    { title: "Mountain Retreat Cabin", location: "Denver, CO", price: "1,150,000", bedrooms: "4", bathrooms: "3", area: "3,200", beds: "4", baths: "3", sqft: "3,200", category: "Houses", description: "Beautiful cabin with breathtaking mountain views.", images: [] },
    { title: "Beachfront Paradise", location: "Malibu, CA", price: "12,500,000", bedrooms: "6", bathrooms: "5", area: "6,000", beds: "6", baths: "5", sqft: "6,000", category: "Houses", description: "Direct beach access with stunning ocean views.", images: [] },
    { title: "Historic Victorian Home", location: "Boston, MA", price: "2,100,000", bedrooms: "5", bathrooms: "4", area: "4,100", beds: "5", baths: "4", sqft: "4,100", category: "Houses", description: "Meticulously restored Victorian in a historic neighborhood.", images: [] },
    { title: "Contemporary Smart Home", location: "Seattle, WA", price: "1,850,000", bedrooms: "4", bathrooms: "4", area: "3,500", beds: "4", baths: "4", sqft: "3,500", category: "Houses", description: "Fully integrated smart home with eco-friendly features.", images: [] },
    { title: "Rustic Farmhouse on 10 Acres", location: "Nashville, TN", price: "950,000", bedrooms: "3", bathrooms: "2", area: "2,500", beds: "3", baths: "2", sqft: "2,500", category: "Houses", description: "Peaceful farmhouse living with plenty of land.", images: [] },
    { title: "Mid-Century Modern Gem", location: "Palm Springs, CA", price: "1,450,000", bedrooms: "3", bathrooms: "3", area: "2,300", beds: "3", baths: "3", sqft: "2,300", category: "Houses", description: "Iconic mid-century design with a private courtyard.", images: [] },
    { title: "Urban Townhouse", location: "Chicago, IL", price: "875,000", bedrooms: "3", bathrooms: "3", area: "2,000", beds: "3", baths: "3", sqft: "2,000", category: "Houses", description: "Modern townhouse in the heart of the city.", images: [] },
    { title: "Lakeside Log Cabin", location: "Lake Tahoe, NV", price: "2,500,000", bedrooms: "4", bathrooms: "3", area: "3,100", beds: "4", baths: "3", sqft: "3,100", category: "Houses", description: "Beautiful log home directly on the lake.", images: [] },
    { title: "Spacious Ranch Style Home", location: "Phoenix, AZ", price: "550,000", bedrooms: "4", bathrooms: "2", area: "2,400", beds: "4", baths: "2", sqft: "2,400", category: "Houses", description: "Single-story home with a large desert landscape yard.", images: [] },
    { title: "Elegant Georgian Estate", location: "Atlanta, GA", price: "3,200,000", bedrooms: "6", bathrooms: "7", area: "8,500", beds: "6", baths: "7", sqft: "8,500", category: "Houses", description: "Stately brick estate with manicured gardens.", images: [] },
    { title: "Minimalist Desert Home", location: "Joshua Tree, CA", price: "680,000", bedrooms: "2", bathrooms: "2", area: "1,500", beds: "2", baths: "2", sqft: "1,500", category: "Houses", description: "Unique minimalist architecture blending with nature.", images: [] }
];

async function run() {
    try {
        await Property.deleteMany({ category: "Houses" }); // clear old fake houses if any 
        await Property.insertMany(fakeHouses);
        console.log("Successfully inserted 15 houses!");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

// wait for connection then run
mongoose.connection.once('open', run);
