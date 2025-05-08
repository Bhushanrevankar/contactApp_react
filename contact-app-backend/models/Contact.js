// models/Contact.js
const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
}, { timestamps: true }); // Automatically adds createdAt and updatedAt

module.exports = mongoose.model('Contact', contactSchema); 