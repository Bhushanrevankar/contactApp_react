import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import ContactForm from './components/ContactForm';
import ContactList from './components/ContactList';
import ViewContactModal from './components/ViewContactModal';
import { Toaster, toast } from 'react-hot-toast';
import { fetchContactsThunk, clearContactError } from './redux/contact/contactSlice';

function App() {
  const dispatch = useDispatch();
  // State for View Modal
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedContactForView, setSelectedContactForView] = useState(null);

  // State for Editing
  const [contactIdToEdit, setContactIdToEdit] = useState(null);
  
  // Get contacts, status and error from Redux store
  const { contacts, status, error } = useSelector((state) => state.contact);
  const contactToEdit = contacts.find(contact => contact.id === contactIdToEdit);

  // Fetch contacts when the component mounts
  useEffect(() => {
    if (status === 'idle') { // Only fetch if status is idle to prevent multiple fetches
      dispatch(fetchContactsThunk());
    }
  }, [status, dispatch]);

  // Effect to show error toasts and clear them
  useEffect(() => {
    if (error) {
      toast.error(`Error: ${error}`);
      dispatch(clearContactError()); // Clear the error from Redux state after showing toast
    }
  }, [error, dispatch]);

  // Handlers for View Modal
  const handleViewContact = (contact) => {
    setSelectedContactForView(contact);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedContactForView(null);
  };

  // Handlers for Editing
  const handleEditContact = (id) => {
    setContactIdToEdit(id);
    // Optionally scroll form into view if needed
    // window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setContactIdToEdit(null);
  };

  let content;
  if (status === 'loading' && contacts.length === 0) { // Show loading only on initial load
    content = <p className="text-center text-gray-500">Loading contacts...</p>;
  } else if (status === 'failed' && contacts.length === 0) { // Show error only if no contacts loaded
    content = <p className="text-center text-red-500">Failed to load contacts. Please try again later.</p>;
  } else {
    content = (
      <ContactList
        onView={handleViewContact}
        onEdit={handleEditContact}
        // contacts prop is no longer needed as ContactList will get it from useSelector
      />
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Toaster position="top-center" reverseOrder={false} />
      <h1 className="text-3xl font-bold text-center my-6 text-indigo-700">Contact App</h1>
      <ContactForm
        contactToEdit={contactToEdit}
        onCancelEdit={handleCancelEdit}
      />
      {content} {/* Render a loading/error message or the ContactList */}
      {isViewModalOpen && (
        <ViewContactModal
          contact={selectedContactForView}
          onClose={handleCloseViewModal}
        />
      )}
    </div>
  );
}

export default App
