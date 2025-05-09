import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addContactThunk, updateContactThunk } from '../redux/contact/contactSlice';
import toast from 'react-hot-toast';

// Define initial empty state structure outside the component
const initialFormState = {
  firstName: '',
  lastName: '',
  name: '',
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
    if (isEditing && contactToEdit) {
      // Ensure phones/emails arrays exist and have at least one entry
      const phones = contactToEdit.phones && contactToEdit.phones.length > 0
                       ? contactToEdit.phones
                       : [{ type: 'Mobile', number: '' }];
      const emails = contactToEdit.emails && contactToEdit.emails.length > 0
                       ? contactToEdit.emails
                       : [{ type: 'Personal', address: '' }];
      // If backend returns 'name' and not firstName/lastName, adapt here
      const nameParts = contactToEdit.name ? contactToEdit.name.split(' ') : ['', ''];
      const firstName = contactToEdit.firstName || nameParts[0] || '';
      const lastName = contactToEdit.lastName || nameParts.slice(1).join(' ') || '';

      setFormData({
        ...initialFormState, // Start with initial to ensure all fields are present
        ...contactToEdit,   // Spread the contact to edit
        id: contactToEdit.id, // or contactToEdit._id if you haven't mapped it in slice
        firstName,
        lastName,
        phones, 
        emails,
      });
    } else {
      setFormData(initialFormState);
    }
  }, [contactToEdit, isEditing]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDynamicChange = (index, field, subField, value) => {
    const updatedArray = formData[field].map((item, i) => 
      i === index ? { ...item, [subField]: value } : item
    );
    setFormData({ ...formData, [field]: updatedArray });
  };

  const addDynamicField = (field) => {
    const defaultEntry = field === 'phones'
      ? { type: 'Mobile', number: '' }
      : { type: 'Personal', address: '' };
    setFormData({ ...formData, [field]: [...(formData[field] || []), defaultEntry] });
  };

  const removeDynamicField = (index, field) => {
    if (formData[field].length > 1) {
      const updatedArray = formData[field].filter((_, i) => i !== index);
      setFormData({ ...formData, [field]: updatedArray });
    } else { // If only one item, clear its content instead of removing the row
      const subField = field === 'phones' ? 'number' : 'address';
      const updatedArray = [{ ...formData[field][0], [subField]: '' }];
      setFormData({ ...formData, [field]: updatedArray });
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
    if (onCancelEdit) {
        onCancelEdit();
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Basic validation: ensure name or firstName/lastName is present
    const hasName = formData.name || (formData.firstName && formData.lastName);
    if (!hasName) {
      toast.error('Name (or First Name and Last Name) is required.');
      return;
    }

    // Prepare data for backend (it might expect `name` or `firstName`/`lastName`)
    // Let's assume backend expects `name`, `email`, `phone` as primary fields based on schema
    // and `firstName`, `lastName`, `nickname`, `dob`, `phones`, `emails` are also accepted.
    
    // If your backend strictly uses `name`, combine `firstName` and `lastName`.
    // If it uses `firstName` and `lastName`, ensure they are sent.
    // For this example, we'll send what we have, assuming backend schema is flexible or uses specific fields.
    let submissionData = { ...formData };
    if (!submissionData.name && submissionData.firstName && submissionData.lastName) {
        // If only firstName and lastName are filled, and backend might prefer a single 'name' field
        // submissionData.name = `${submissionData.firstName} ${submissionData.lastName}`.trim();
        // Decide if you want to remove firstName/lastName if name is primary, or send all.
        // For now, sending all and assuming backend schema is flexible or uses specific fields.
    }

    // Remove the local 'id' field if it exists, backend manages its own _id
    const { id, ...dataForBackend } = submissionData; 

    try {
      if (isEditing) {
        // contactToEdit.id is the _id from MongoDB (mapped to id in Redux state)
        await dispatch(updateContactThunk({ id: contactToEdit.id, ...dataForBackend })).unwrap();
        toast.success('Contact updated successfully!');
      } else {
        await dispatch(addContactThunk(dataForBackend)).unwrap();
        toast.success('Contact added successfully!');
      }
      resetForm();
    } catch (error) { // Error from unwrap (rejectWithValue payload)
      toast.error(`Failed: ${error}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded shadow-md bg-white max-w-lg mx-auto my-5">
      <h2 className="text-xl font-semibold mb-4">{isEditing ? 'Edit Contact' : 'Create Contact'}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
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