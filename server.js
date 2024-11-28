const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb+srv://admin2:admin2@cluster0.dpyrz.mongodb.net/Hip_Hop_Lyrics?retryWrites=true&w=majority');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define schema for GeoJSON data
const geoSchema = new mongoose.Schema({
    type: { type: String, default: "Feature" },
    properties: { type: Object },
    geometry: {
        type: { type: String, enum: ['Point', 'LineString', 'Polygon'],
        required: true },
        coordinates: { type: [Number], required: true }
    }
}, { collection: 'Hip Hop Lyrics'});

const GeoModel = mongoose.model('Geocollection', geoSchema);

// API endpoint to get all GeoJSON data
app.get('/api/geojson', async (req, res) => {
    try {
      const features = await GeoModel.find();
      res.json({
        type: "FeatureCollection",
        features: features
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch data' });
    }
  });
  
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });

// Form code
const bodyParser = require('body-parser');
const { title } = require('process');

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const formSchema = new mongoose.Schema({
 name: { type: String, required: true },
 title: { type: String, required: true},
 artist: { type: String, required: true},
 lon: { type: Number, required: true },
 lat: { type: Number, required: true },  
 lyrics: { type: String }                 
});

const FormData = mongoose.model('FormData', formSchema);

app.get('/form', (req, res) => {
 res.sendFile(__dirname + '/form.html');
});

app.post('/submit', async (req, res) => {
 const formData = new FormData({
     name: req.body.name,
     title: req.body.title,
     artist: req.body.artist,
     lon: req.body.lon,
     lat: req.body.lat,
     lyrics: req.body.lyrics || '' //
 });

 try {
     await formData.save();
     res.send('Location data saved to MongoDB!');
 } catch (err) {
     res.status(500).send('Error saving data');
 }
});