import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getContacts,
  createContact,
  updateContactApi,
  deleteContactApi
} from '../../services/contactService'; // Adjust path if your services folder is elsewhere

// Async thunk for fetching contacts
export const fetchContactsThunk = createAsyncThunk(
  'contacts/fetchContacts',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getContacts();
      return data; // This will be an array of contacts
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for adding a contact
export const addContactThunk = createAsyncThunk(
  'contacts/addContact',
  async (contactData, { rejectWithValue }) => {
    try {
      const data = await createContact(contactData);
      return data; // This will be the newly created contact from the backend
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for updating a contact
export const updateContactThunk = createAsyncThunk(
  'contacts/updateContact',
  async ({ id, ...contactData }, { rejectWithValue }) => { // Destructure id and the rest of data
    try {
      const data = await updateContactApi(id, contactData);
      return data; // This will be the updated contact from the backend
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for deleting a contact
export const deleteContactThunk = createAsyncThunk(
  'contacts/deleteContact',
  async (contactId, { rejectWithValue }) => {
    try {
      // The backend for DELETE might return the deleted contact's ID or a success message
      // Or it might return 204 No Content. contactService.js handleResponse handles 204.
      await deleteContactApi(contactId);
      return contactId; // Return the ID to identify which contact to remove from state
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  contacts: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

export const contactSlice = createSlice({
  name: 'contact',
  initialState,
  reducers: {
    // You can add synchronous reducers here if needed for other purposes
    // For example, to clear an error or reset status manually
    clearContactError: (state) => {
        state.error = null;
    },
    resetContactStatus: (state) => {
        state.status = 'idle';
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Contacts
      .addCase(fetchContactsThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchContactsThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Ensure IDs are consistent. MongoDB uses _id.
        // If your backend returns contacts with _id, map them or ensure your components use _id.
        // For now, assuming backend returns objects with 'id' or we map it to 'id'.
        // Let's assume the backend returns contacts with `_id` and we'll use that as `id` in the frontend state.
        state.contacts = action.payload.map(contact => ({ ...contact, id: contact._id }));
      })
      .addCase(fetchContactsThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload; // error message from rejectWithValue
      })
      // Add Contact
      .addCase(addContactThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(addContactThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Add the new contact (which should have an _id from backend) to the state
        // Ensure it has an 'id' field for consistency if other parts of your app expect it.
        const newContact = { ...action.payload, id: action.payload._id };
        state.contacts.push(newContact);
      })
      .addCase(addContactThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Update Contact
      .addCase(updateContactThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateContactThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const updatedContact = { ...action.payload, id: action.payload._id };
        const index = state.contacts.findIndex(contact => contact.id === updatedContact.id);
        if (index !== -1) {
          state.contacts[index] = updatedContact;
        }
      })
      .addCase(updateContactThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Delete Contact
      .addCase(deleteContactThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteContactThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // action.payload is the contactId
        state.contacts = state.contacts.filter(contact => contact.id !== action.payload);
      })
      .addCase(deleteContactThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

// Export any new synchronous action creators if you added them
export const { clearContactError, resetContactStatus } = contactSlice.actions;

// Note: The async thunks are exported directly and don't need to be in contactSlice.actions

export default contactSlice.reducer;