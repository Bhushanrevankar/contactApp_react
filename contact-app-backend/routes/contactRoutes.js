const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact'); // Adjust path as necessary

// POST /api/contacts - Create a new contact
router.post('/', async (req, res) => {
  try {
    // Extract all expected fields from the form
    const { firstName, lastName, nickname, dob, phones, emails } = req.body;

    // Basic Validation (ensure at least first or last name is present)
    if (!(firstName?.trim()) && !(lastName?.trim())) {
      return res.status(400).json({ message: 'At least First Name or Last Name is required' });
    }

    // Optional: Add more specific validation for email formats, phone numbers, etc.
    // Optional: Filter out empty phone/email entries before saving
    const validPhones = phones?.filter(p => p.number?.trim()) || [];
    const validEmails = emails?.filter(e => e.address?.trim()) || [];

    // Create new contact data object
    const newContactData = {
      firstName: firstName?.trim(),
      lastName: lastName?.trim(),
      nickname: nickname?.trim(),
      dob, // Assuming dob is sent in a format MongoDB/Mongoose can handle or as String
      phones: validPhones,
      emails: validEmails
    };

    const newContact = new Contact(newContactData);
    await newContact.save(); // The pre-save hook in the model will generate the 'name' field
    res.status(201).json(newContact);

  } catch (error) {
    console.error("Error creating contact:", error);
    // Handle potential duplicate errors if you add unique fields later (e.g., primaryEmail)
    if (error.code === 11000) {
        // Check which field caused the duplicate error
        const field = Object.keys(error.keyValue)[0];
        return res.status(400).json({ message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.` });
    } 
    // Handle validation errors from Mongoose schema validation
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
    res.status(500).json({ message: 'Error creating contact', error: error.message });
  }
});

// GET /api/contacts - Get all contacts
router.get('/', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
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
     console.error("Error fetching contact:", error);
     if (error.name === 'CastError') { // Handle invalid MongoDB ID format
        return res.status(400).json({ message: 'Invalid contact ID format' });
     }
    res.status(500).json({ message: 'Error fetching contact', error: error.message });
  }
});

// PUT /api/contacts/:id - Update an existing contact
router.put('/:id', async (req, res) => {
  try {
    const { firstName, lastName, nickname, dob, phones, emails } = req.body;

    // Validation
     if (!(firstName?.trim()) && !(lastName?.trim())) {
      return res.status(400).json({ message: 'At least First Name or Last Name is required' });
    }

    // Filter empty entries
    const validPhones = phones?.filter(p => p.number?.trim()) || [];
    const validEmails = emails?.filter(e => e.address?.trim()) || [];

    // Prepare update data
    const updateData = {
      firstName: firstName?.trim(),
      lastName: lastName?.trim(),
      nickname: nickname?.trim(),
      dob,
      phones: validPhones,
      emails: validEmails,
      // Generate name based on updated first/last names
      name: `${firstName?.trim() || ''} ${lastName?.trim() || ''}`.trim()
    };

    const updatedContact = await Contact.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true, context: 'query' } // context: 'query' helps with some validators in updates
    );

    if (!updatedContact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    res.json(updatedContact);

  } catch (error) {
     console.error("Error updating contact:", error);
     // Handle potential duplicate errors if you add unique fields later
    if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        return res.status(400).json({ message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.` });
    } 
    // Handle validation errors
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
    // Handle invalid ID format
    if (error.name === 'CastError') {
        return res.status(400).json({ message: 'Invalid contact ID format' });
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
    // Return only the ID of the deleted contact, as used by the frontend Redux slice
    res.json({ id: deletedContact._id }); 
  } catch (error) {
    console.error("Error deleting contact:", error);
     if (error.name === 'CastError') { 
        return res.status(400).json({ message: 'Invalid contact ID format' });
     }
    res.status(500).json({ message: 'Error deleting contact', error: error.message });
  }
});

module.exports = router; 