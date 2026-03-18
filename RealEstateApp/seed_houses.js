const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const API_BASE = "http://192.168.1.20:5000/api";

const fakeHouses = [
  { title: "Modern Villa in Beverly Hills", location: "Beverly Hills, CA", price: "4,250,000", bedrooms: "5", bathrooms: "4", area: "4,500", category: "Houses", description: "Stunning modern villa with panoramic views." },
  { title: "Cozy Family Home in Suburbs", location: "Austin, TX", price: "650,000", bedrooms: "3", bathrooms: "2", area: "2,100", category: "Houses", description: "Beautiful family home with a large backyard." },
  { title: "Luxury Estate with Pool", location: "Miami, FL", price: "8,900,000", bedrooms: "7", bathrooms: "8", area: "10,200", category: "Houses", description: "Incredible sprawling estate with private pool and dock." },
  { title: "Charming Craftsman House", location: "Portland, OR", price: "725,000", bedrooms: "4", bathrooms: "3", area: "2,800", category: "Houses", description: "Classic craftsman architecture with modern updates." },
  { title: "Mountain Retreat Cabin", location: "Denver, CO", price: "1,150,000", bedrooms: "4", bathrooms: "3", area: "3,200", category: "Houses", description: "Beautiful cabin with breathtaking mountain views." },
  { title: "Beachfront Paradise", location: "Malibu, CA", price: "12,500,000", bedrooms: "6", bathrooms: "5", area: "6,000", category: "Houses", description: "Direct beach access with stunning ocean views." },
  { title: "Historic Victorian Home", location: "Boston, MA", price: "2,100,000", bedrooms: "5", bathrooms: "4", area: "4,100", category: "Houses", description: "Meticulously restored Victorian in a historic neighborhood." },
  { title: "Contemporary Smart Home", location: "Seattle, WA", price: "1,850,000", bedrooms: "4", bathrooms: "4", area: "3,500", category: "Houses", description: "Fully integrated smart home with eco-friendly features." },
  { title: "Rustic Farmhouse on 10 Acres", location: "Nashville, TN", price: "950,000", bedrooms: "3", bathrooms: "2", area: "2,500", category: "Houses", description: "Peaceful farmhouse living with plenty of land." },
  { title: "Mid-Century Modern Gem", location: "Palm Springs, CA", price: "1,450,000", bedrooms: "3", bathrooms: "3", area: "2,300", category: "Houses", description: "Iconic mid-century design with a private courtyard." },
  { title: "Urban Townhouse", location: "Chicago, IL", price: "875,000", bedrooms: "3", bathrooms: "3", area: "2,000", category: "Houses", description: "Modern townhouse in the heart of the city." },
  { title: "Lakeside Log Cabin", location: "Lake Tahoe, NV", price: "2,500,000", bedrooms: "4", bathrooms: "3", area: "3,100", category: "Houses", description: "Beautiful log home directly on the lake." },
  { title: "Spacious Ranch Style Home", location: "Phoenix, AZ", price: "550,000", bedrooms: "4", bathrooms: "2", area: "2,400", category: "Houses", description: "Single-story home with a large desert landscape yard." },
  { title: "Elegant Georgian Estate", location: "Atlanta, GA", price: "3,200,000", bedrooms: "6", bathrooms: "7", area: "8,500", category: "Houses", description: "Stately brick estate with manicured gardens." },
  { title: "Minimalist Desert Home", location: "Joshua Tree, CA", price: "680,000", bedrooms: "2", bathrooms: "2", area: "1,500", category: "Houses", description: "Unique minimalist architecture blending with nature." }
];

async function seed() {
  console.log("Starting seed process...");
  for (let i = 0; i < fakeHouses.length; i++) {
    const house = fakeHouses[i];
    try {
      const formData = new FormData();
      Object.keys(house).forEach(key => {
        formData.append(key, house[key]);
      });

      // Send the request
      const response = await axios.post(`${API_BASE}/upload-property`, formData, {
        headers: {
          ...formData.getHeaders(),
        },
      });
      console.log(`✅ Success adding: ${house.title}`);
    } catch (err) {
      console.error(`❌ Error adding: ${house.title} - ${err.message}`);
    }
  }
  console.log("Done seeding.");
}

seed();
