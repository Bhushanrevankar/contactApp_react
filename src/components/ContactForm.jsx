import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addContact, updateContact } from '../redux/contact/contactSlice';

// Define initial empty state structure outside the component
const initialFormState = {
  firstName: '',
  lastName: '',
  nickname: '',
  dob: '',
  // Ensure phones/emails always have at least one entry for the UI
  phones: [{ type: 'Mobile', number: '' }],
  emails: [{ type: 'Personal', address: '' }],
};

function ContactForm({ contactToEdit, onCancelEdit }) {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState(initialFormState);
  const isEditing = Boolean(contactToEdit);

  // Effect to populate form when contactToEdit changes
  useEffect(() => {
    if (isEditing) {
      // Ensure we have at least one phone/email field even if contactToEdit doesn't
      const phones = contactToEdit.phones && contactToEdit.phones.length > 0
                       ? contactToEdit.phones
                       : [{ type: 'Mobile', number: '' }];
      const emails = contactToEdit.emails && contactToEdit.emails.length > 0
                       ? contactToEdit.emails
                       : [{ type: 'Personal', address: '' }];

      setFormData({ ...contactToEdit, phones, emails });
    } else {
      setFormData(initialFormState); // Reset form if not editing
    }
  }, [contactToEdit, isEditing]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDynamicChange = (index, field, subField, value) => {
    // Create a deep copy to avoid state mutation issues
    const updatedFormData = JSON.parse(JSON.stringify(formData));
    if (updatedFormData[field] && updatedFormData[field][index]) {
       updatedFormData[field][index][subField] = value;
       setFormData(updatedFormData);
    }
  };

  const addDynamicField = (field) => {
    const defaultEntry = field === 'phones'
      ? { type: 'Mobile', number: '' }
      : { type: 'Personal', address: '' };
    // Ensure the field array exists before trying to spread it
    const currentFieldArray = formData[field] || [];
    setFormData({ ...formData, [field]: [...currentFieldArray, defaultEntry] });
  };

  const removeDynamicField = (index, field) => {
    // Create a deep copy
    const updatedFormData = JSON.parse(JSON.stringify(formData));
    if (updatedFormData[field] && updatedFormData[field].length > 1) { // Keep at least one field
        updatedFormData[field].splice(index, 1);
        setFormData(updatedFormData);
    } else if (updatedFormData[field] && updatedFormData[field].length === 1) {
        // If it's the last one, just clear its contents
        const subField = field === 'phones' ? 'number' : 'address';
        updatedFormData[field][0][subField] = '';
        setFormData(updatedFormData);
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
    if (onCancelEdit) {
        onCancelEdit(); // Call parent cancellation handler if editing
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.firstName && formData.lastName) { // Basic validation
      if (isEditing) {
        // Dispatch update action - ensure ID is included
        dispatch(updateContact({ ...formData, id: contactToEdit.id }));
        resetForm(); // Reset form and exit edit mode via onCancelEdit
      } else {
        // Dispatch add action
        dispatch(addContact(formData));
        resetForm(); // Just reset the form fields
      }
    } else {
      alert('First Name and Last Name are required.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded shadow-md bg-white max-w-lg mx-auto my-5">
      <h2 className="text-xl font-semibold mb-4">{isEditing ? 'Edit Contact' : 'Create Contact'}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name *</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name *</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>
       <div>
          <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">Nickname</label>
          <input
            type="text"
            id="nickname"
            name="nickname"
            value={formData.nickname}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="dob" className="block text-sm font-medium text-gray-700">Date of Birth</label>
          <input
            type="date"
            id="dob"
            name="dob"
            value={formData.dob}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

      {/* Phone Numbers */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Numbers</label>
        {(formData.phones || []).map((phone, index) => (
          <div key={`phone-${index}`} className="flex items-center space-x-2 mb-2">
            <select
              value={phone.type}
              onChange={(e) => handleDynamicChange(index, 'phones', 'type', e.target.value)}
              className="block w-1/4 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="Mobile">Mobile</option>
              <option value="Work">Work</option>
              <option value="Home">Home</option>
              <option value="Other">Other</option>
            </select>
            <input
              type="tel"
              placeholder="Phone Number"
              value={phone.number}
              onChange={(e) => handleDynamicChange(index, 'phones', 'number', e.target.value)}
              className="block w-2/4 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {(formData.phones || []).length > 1 && (
               <button type="button" onClick={() => removeDynamicField(index, 'phones')} className="text-red-500 hover:text-red-700 text-sm p-1">Remove</button>
            )}
          </div>
        ))}
        <button type="button" onClick={() => addDynamicField('phones')} className="text-indigo-600 hover:text-indigo-800 text-sm mt-1">+ Add Phone</button>
      </div>

      {/* Emails */}
       <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Emails</label>
        {(formData.emails || []).map((email, index) => (
          <div key={`email-${index}`} className="flex items-center space-x-2 mb-2">
            <select
              value={email.type}
              onChange={(e) => handleDynamicChange(index, 'emails', 'type', e.target.value)}
              className="block w-1/4 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="Personal">Personal</option>
              <option value="Work">Work</option>
              <option value="Other">Other</option>
            </select>
            <input
              type="email"
              placeholder="Email Address"
              value={email.address}
              onChange={(e) => handleDynamicChange(index, 'emails', 'address', e.target.value)}
              className="block w-2/4 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
             {(formData.emails || []).length > 1 && (
                <button type="button" onClick={() => removeDynamicField(index, 'emails')} className="text-red-500 hover:text-red-700 text-sm p-1">Remove</button>
             )}
          </div>
        ))}
        <button type="button" onClick={() => addDynamicField('emails')} className="text-indigo-600 hover:text-indigo-800 text-sm mt-1">+ Add Email</button>
      </div>

      {/* Submit/Cancel Buttons */}
      <div className="flex gap-4">
            <button type="submit" className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                {isEditing ? 'Update Contact' : 'Add Contact'}
            </button>
            {isEditing && (
                 <button type="button" onClick={resetForm} className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Cancel
                 </button>
            )}
      </div>
    </form>
  );
}

export default ContactForm; 