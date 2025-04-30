import { createSlice, nanoid } from '@reduxjs/toolkit'

const initialState = {
  contacts: [], // Initialize contacts as an empty array
}

export const contactSlice = createSlice({
  name: 'contact',
  initialState,
  reducers: {
    // Reducer to add a new contact
    addContact: {
      reducer(state, action) {
        state.contacts.push(action.payload);
      },
      // Prepare payload to include a unique ID using nanoid
      prepare(contactData) {
        return {
          payload: {
            id: nanoid(),
            ...contactData,
          },
        };
      },
    },
    // Add other reducers like removeContact, updateContact later
    deleteContact: (state, action) => {
      // action.payload will be the id of the contact to delete
      state.contacts = state.contacts.filter(contact => contact.id !== action.payload);
    },
    updateContact: (state, action) => {
      // action.payload will be the updated contact object (including id)
      const index = state.contacts.findIndex(contact => contact.id === action.payload.id);
      if (index !== -1) {
        state.contacts[index] = action.payload;
      }
    },
  },
})

// Export the action creators
export const { addContact, deleteContact, updateContact } = contactSlice.actions

export default contactSlice.reducer