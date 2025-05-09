import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { deleteContactThunk } from '../redux/contact/contactSlice';
import toast from 'react-hot-toast';

// Simple Button component for consistent styling
const ActionButton = ({ onClick, children, className = '' }) => (
    <button
        onClick={onClick}
        className={`px-2 py-1 text-xs font-medium rounded focus:outline-none focus:ring-2 focus:ring-offset-1 ${className}`}
    >
        {children}
    </button>
);

function ContactList({ onView, onEdit }) {
  const contacts = useSelector((state) => state.contact.contacts);
  const dispatch = useDispatch();

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      dispatch(deleteContactThunk(id))
        .unwrap()
        .then(() => {
          toast.success('Contact deleted successfully!');
        })
        .catch((error) => {
          toast.error(`Failed to delete contact: ${error}`);
        });
    }
  };

  if (contacts.length === 0 && useSelector((state) => state.contact.status) === 'succeeded') {
    return <p className="text-center text-gray-500 my-5">No contacts added yet. Add one using the form above!</p>;
  }

  return (
    <div className="p-4 max-w-lg mx-auto my-5">
      <h2 className="text-xl font-semibold mb-4">Contact List</h2>
      {contacts.length > 0 && (
        <ul className="space-y-3">
          {contacts.map((contact) => (
            <li key={contact.id} className="p-4 border rounded shadow-sm bg-white flex justify-between items-center">
              <div className="flex-1 min-w-0 mr-4">
                <p className="font-medium truncate">{contact.firstName || contact.name} {contact.lastName}</p>
                {contact.nickname && <p className="text-sm text-gray-600 truncate">({contact.nickname})</p>}
                {contact.phones && contact.phones.length > 0 && <p className="text-xs text-gray-500 truncate">{contact.phones[0].number}</p>}
                {contact.emails && contact.emails.length > 0 && <p className="text-xs text-gray-500 truncate">{contact.emails[0].address}</p>}
              </div>
              <div className="flex space-x-2 flex-shrink-0">
                 <ActionButton
                    onClick={() => onView(contact)}
                    className="bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-400"
                 >
                    View
                 </ActionButton>
                 <ActionButton
                    onClick={() => onEdit(contact.id)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white focus:ring-yellow-400"
                 >
                    Edit
                 </ActionButton>
                 <ActionButton
                    onClick={() => handleDelete(contact.id)}
                    className="bg-red-500 hover:bg-red-600 text-white focus:ring-red-400"
                  >
                    Delete
                 </ActionButton>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ContactList; 