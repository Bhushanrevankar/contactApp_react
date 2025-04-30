import React from 'react';

function ViewContactModal({ contact, onClose }) {
  if (!contact) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      <div className="relative mx-auto p-6 border w-full max-w-lg shadow-lg rounded-md bg-white">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl font-bold">&times;</button>
        <h3 className="text-xl font-semibold text-center mb-4">Contact Details</h3>
        <div className="space-y-3 text-sm">
          <p><span className="font-medium">First Name:</span> {contact.firstName}</p>
          <p><span className="font-medium">Last Name:</span> {contact.lastName}</p>
          {contact.nickname && <p><span className="font-medium">Nickname:</span> {contact.nickname}</p>}
          {contact.dob && <p><span className="font-medium">Date of Birth:</span> {contact.dob}</p>}

          {contact.phones && contact.phones.length > 0 && (
            <div>
              <p className="font-medium mb-1">Phone Numbers:</p>
              <ul className="list-disc list-inside pl-4 space-y-1">
                {contact.phones.map((phone, index) => (
                  <li key={`phone-${index}`}>{phone.type}: {phone.number}</li>
                ))}
              </ul>
            </div>
          )}

          {contact.emails && contact.emails.length > 0 && (
            <div>
              <p className="font-medium mb-1">Emails:</p>
              <ul className="list-disc list-inside pl-4 space-y-1">
                {contact.emails.map((email, index) => (
                  <li key={`email-${index}`}>{email.type}: {email.address}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ViewContactModal; 