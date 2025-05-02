import { useState } from 'react'
import { useSelector } from 'react-redux'
import ContactForm from './components/ContactForm';
import ContactList from './components/ContactList';
import ViewContactModal from './components/ViewContactModal';
import { Toaster } from 'react-hot-toast';

function App() {
  // State for View Modal
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedContactForView, setSelectedContactForView] = useState(null);

  // State for Editing
  const [contactIdToEdit, setContactIdToEdit] = useState(null);
  const contacts = useSelector((state) => state.contact.contacts);
  const contactToEdit = contacts.find(contact => contact.id === contactIdToEdit);

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

  return (
    <div className="container mx-auto p-4">
      <Toaster position="top-center" reverseOrder={false} />
      <h1 className="text-3xl font-bold text-center my-6 text-indigo-700">Contact App</h1>
      <ContactForm
        contactToEdit={contactToEdit}
        onCancelEdit={handleCancelEdit}
      />
      <ContactList
        onView={handleViewContact}
        onEdit={handleEditContact}
      />
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
