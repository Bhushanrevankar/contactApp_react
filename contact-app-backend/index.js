const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const contactRoutes = require('./routes/contactRoutes');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors()); // Allow requests from frontend - configure more strictly for production
app.use(express.json()); // Parse JSON request bodies

// Routes
app.use('/api/contacts', contactRoutes);

// Default route (optional)
app.get('/', (req, res) => {
    res.send("Contact App Backend is running.");
});

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI; // Make sure this is in your .env file

if (!MONGO_URI) {
    console.error("FATAL ERROR: MONGO_URI is not defined in .env file.");
    process.exit(1); // Exit the application if DB connection string is not found
}

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1); // Exit if cannot connect to DB
  });