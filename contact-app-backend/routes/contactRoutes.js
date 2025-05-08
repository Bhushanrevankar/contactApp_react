const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact'); // Adjust path as necessary

// POST /api/contacts - Create a new contact
router.post('/', async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }
    const newContact = new Contact({ name, email, phone });
    await newContact.save();
    res.status(201).json(newContact);
  } catch (error) {
    if (error.code === 11000) { // Handle duplicate email error
        return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Error creating contact', error: error.message });
  }
});

// GET /api/contacts - Get all contacts
router.get('/', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 }); // Sort by newest first
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contacts', error: error.message });
  }
});

// GET /api/contacts/:id - Get a single contact by ID
router.get('/:id', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contact', error: error.message });
  }
});

// PUT /api/contacts/:id - Update an existing contact
router.put('/:id', async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const updatedContact = await Contact.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, updatedAt: Date.now() },
      { new: true, runValidators: true } // new:true returns the updated doc, runValidators ensures schema validation
    );
    if (!updatedContact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    res.json(updatedContact);
  } catch (error) {
     if (error.code === 11000) { // Handle duplicate email error on update
        return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Error updating contact', error: error.message });
  }
});

// DELETE /api/contacts/:id - Delete a contact
router.delete('/:id', async (req, res) => {
  try {
    const deletedContact = await Contact.findByIdAndDelete(req.params.id);
    if (!deletedContact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    res.json({ message: 'Contact deleted successfully', id: deletedContact._id });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting contact', error: error.message });
  }
});

module.exports = router; 