const BASE_URL = 'http://localhost:3001/api/contacts'; // Your backend API base URL

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Network response was not ok and error body could not be parsed' }));
    const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
    console.error('API Error:', errorMessage, 'Response:', response);
    throw new Error(errorMessage);
  }
  // If the response is 204 No Content, there might not be a JSON body to parse
  if (response.status === 204) {
    return null; // Or an appropriate representation of no content
  }
  return response.json();
};

// Fetch all contacts
export const getContacts = async () => {
  const response = await fetch(BASE_URL);
  return handleResponse(response);
};

// Create a new contact
export const createContact = async (contactData) => {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(contactData),
  });
  return handleResponse(response);
};

// Update an existing contact
export const updateContactApi = async (id, contactData) => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(contactData),
  });
  return handleResponse(response);
};

// Delete a contact
export const deleteContactApi = async (id) => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
}; 