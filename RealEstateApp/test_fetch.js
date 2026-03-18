const axios = require('axios');
const API_BASE = "http://192.168.1.20:5000/api";
async function run() {
  const res = await axios.get(`${API_BASE}/properties`);
  console.log("Total properties:", res.data.length);
  res.data.slice(0, 3).forEach(p => {
    console.log("Prop category:", p.category, typeof p.category);
    console.log("Prop ID:", p._id);
    console.log("Prop title:", p.title);
  });
}
run();
