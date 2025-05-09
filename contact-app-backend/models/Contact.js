// models/Contact.js
const mongoose = require('mongoose');

const phoneSchema = new mongoose.Schema({
  type: { type: String, default: 'Mobile' },
  number: { type: String },
}, {_id: false});

const emailSchema = new mongoose.Schema({
  type: { type: String, default: 'Personal' },
  address: { type: String },
}, {_id: false});

const contactSchema = new mongoose.Schema({
  firstName: { type: String, trim: true },
  lastName: { type: String, trim: true },
  name: { type: String, trim: true }, // Full name, can be auto-generated
  nickname: { type: String, trim: true },
  dob: { type: String }, // Consider using Date type: { type: Date }
  phones: [phoneSchema],
  emails: [emailSchema],
  // A primary email can be useful for uniqueness and login, if needed later.
  // For now, we assume one of the emails in the array could be considered primary or unique if needed.
  // If you need a strictly unique primary email field, add it here e.g.:
  // primaryEmail: { 
  //   type: String, 
  //   trim: true, 
  //   lowercase: true, 
  //   unique: true, // This would require careful handling to ensure it's populated
  //   sparse: true // Allows multiple documents to have no primaryEmail (null)
  // }
}, { timestamps: true });

// Pre-save hook to generate the 'name' field from firstName and lastName if not provided
// and to ensure at least one email address is present if emails array is provided
contactSchema.pre('save', function(next) {
  if (this.isModified('firstName') || this.isModified('lastName')) {
    if (this.firstName && this.lastName) {
      this.name = `${this.firstName} ${this.lastName}`.trim();
    } else if (this.firstName) {
      this.name = this.firstName.trim();
    } else if (this.lastName) {
      this.name = this.lastName.trim();
    } 
    // If only `name` is provided and `firstName` or `lastName` is missing, 
    // you might want to parse `name` back into `firstName` and `lastName` here or in the route.
  }
  
  // Basic validation: if emails are provided, at least one should have an address.
  // More complex validation (e.g. for primaryEmail uniqueness) would go here or in routes.
  if (this.emails && this.emails.length > 0) {
    const hasValidEmail = this.emails.some(e => e.address && e.address.trim() !== '');
    if (!hasValidEmail && this.emails.length === 1 && (!this.emails[0].address || this.emails[0].address.trim() === '')) {
        // If there's only one email entry and it's empty, consider removing it or not saving
        // For simplicity now, we allow saving it but frontend should handle empty submissions better.
    } else if (!hasValidEmail) {
        // This case might be too strict if multiple empty email fields are added in UI before filling.
        // return next(new Error('At least one email address must be provided if the email section is used.'));
    }
  }
  // Basic validation for phone numbers
  if (this.phones && this.phones.length > 0) {
    const hasValidPhone = this.phones.some(p => p.number && p.number.trim() !== '');
    if (!hasValidPhone && this.phones.length === 1 && (!this.phones[0].number || this.phones[0].number.trim() === '')) {
      // Similar to emails, handle single empty phone entry.
    }
  }

  next();
});

module.exports = mongoose.model('Contact', contactSchema); 