import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { X, Pencil, Trash2 } from 'lucide-react';
import DashboardLayout from '../../../components/DashboardLayout';
import prisma from '../../../utils/prisma';

interface AIBooking {
  id: number;
  name: string;
  email: string;
  phone: string;
  pujaName: string;
  createdAt: string;
}

interface AICallHistoryProps {
  aiBookings: AIBooking[];
}

interface ApiResponse {
  success: boolean;
  message: string;
}

const EditBookingModal = ({ 
  isOpen, 
  onClose, 
  booking, 
  onSave, 
  onChange 
}: { 
  isOpen: boolean;
  onClose: () => void;
  booking: Partial<AIBooking> | null;
  onSave: () => void;
  onChange: (field: keyof AIBooking, value: string) => void;
}) => {
  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-2xl m-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Edit AI Call #{booking.id}</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={booking.name || ''}
              onChange={(e) => onChange('name', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={booking.email || ''}
              onChange={(e) => onChange('email', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="text"
              value={booking.phone || ''}
              onChange={(e) => onChange('phone', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Puja Name</label>
            <input
              type="text"
              value={booking.pujaName || ''}
              onChange={(e) => onChange('pujaName', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 p-6 border-t">
          <button onClick={onClose} className="bg-gray-200 px-4 py-2 rounded">Cancel</button>
          <button onClick={onSave} className="bg-blue-500 text-white px-4 py-2 rounded">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm }: { isOpen: boolean, onClose: () => void, onConfirm: () => void }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <h3 className="text-xl font-semibold mb-4">Confirm Delete</h3>
        <p>Are you sure you want to delete this AI call record? This action cannot be undone.</p>
        <div className="flex justify-end mt-6 space-x-4">
          <button onClick={onClose} className="bg-gray-200 px-4 py-2 rounded">Cancel</button>
          <button onClick={onConfirm} className="bg-red-500 text-white px-4 py-2 rounded">Delete</button>
        </div>
      </div>
    </div>
  );
};

export default function AICallHistory({ aiBookings = [] }: AICallHistoryProps) {
  const [bookings, setBookings] = useState<AIBooking[]>(aiBookings);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredBookings, setFilteredBookings] = useState<AIBooking[]>(bookings);
  const [sortColumn, setSortColumn] = useState<keyof AIBooking | ''>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [editingBookingId, setEditingBookingId] = useState<number | null>(null);
  const [editedBooking, setEditedBooking] = useState<Partial<AIBooking> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<number | null>(null);

  useEffect(() => {
    let filtered = bookings;

    if (searchQuery) {
      filtered = filtered.filter((booking) => {
        const searchString = `${booking.name} ${booking.email} ${booking.phone} ${booking.pujaName}`.toLowerCase();
        return searchString.includes(searchQuery.toLowerCase());
      });
    }

    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        let valueA = a[sortColumn];
        let valueB = b[sortColumn];

        if (typeof valueA === 'string' && typeof valueB === 'string') {
          return sortDirection === 'asc' 
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        }

        if (sortColumn === 'createdAt') {
          const dateA = new Date(valueA);
          const dateB = new Date(valueB);
          return sortDirection === 'asc' 
            ? dateA.getTime() - dateB.getTime()
            : dateB.getTime() - dateA.getTime();
        }

        return 0;
      });
    }

    setFilteredBookings(filtered);
  }, [searchQuery, bookings, sortColumn, sortDirection]);

  const handleSort = (column: keyof AIBooking) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleEdit = (booking: AIBooking) => {
    setEditingBookingId(booking.id);
    setEditedBooking({ ...booking });
    setIsModalOpen(true);
  };

  const handleDeleteRequest = (id: number) => {
    setBookingToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (bookingToDelete) {
      try {
        const response = await fetch(`/api/ai-bookings/${bookingToDelete}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete booking');
        }
        
        setBookings(bookings.filter((booking) => booking.id !== bookingToDelete));
        setIsDeleteModalOpen(false);
      } catch (error) {
        console.error('Error deleting booking:', error);
      }
    }
  };
  
  const handleSave = async () => {
    if (editingBookingId && editedBooking) {
      try {
        const response = await fetch(`/api/ai-bookings/${editingBookingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editedBooking),
        });
  
        if (!response.ok) {
          throw new Error('Failed to update booking');
        }
  
        const updatedBooking = await response.json();
        setBookings(bookings.map((booking) =>
          booking.id === editingBookingId ? updatedBooking : booking
        ));
        setIsModalOpen(false);
      } catch (error) {
        console.error('Error saving booking:', error);
      }
    }
  };

  const handleInputChange = (field: keyof AIBooking, value: string) => {
    setEditedBooking((prev) => prev ? ({ ...prev, [field]: value }) : null);
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-semibold mb-6 text-gray-800">AI Call History</h1>
        
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="w-full md:w-1/2">
            <input
              type="text"
              placeholder="Search by name, email, or phone"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto shadow-lg rounded-lg">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50">
              <tr>
                {['id', 'name', 'email', 'phone', 'pujaName', 'createdAt'].map((column) => (
                  <th
                    key={column}
                    onClick={() => handleSort(column as keyof AIBooking)}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    {column.charAt(0).toUpperCase() + column.slice(1).replace(/([A-Z])/g, ' $1')}
                    {sortColumn === column && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                ))}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.pujaName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEdit(booking)}
                        className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRequest(booking.id)}
                        className="text-red-600 hover:text-red-800 transition-colors duration-200"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No call history found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modals */}
        <EditBookingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          booking={editedBooking}
          onSave={handleSave}
          onChange={handleInputChange}
        />

        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
        />
      </div>
    </DashboardLayout>
  );
}

export const getServerSideProps: GetServerSideProps<AICallHistoryProps> = async () => {
  try {
    const aiBookings = await prisma.aI_Booking.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const serializedAIBookings: AIBooking[] = aiBookings.map((booking) => ({
      id: booking.id,
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
      pujaName: booking.pujaName,
      createdAt: booking.createdAt.toISOString(),
    }));

    return {
      props: {
        aiBookings: serializedAIBookings,
      },
    };
  } catch (error) {
    console.error('Error fetching AI call history:', error);
    return {
      props: { aiBookings: [] },
    };
  }
};