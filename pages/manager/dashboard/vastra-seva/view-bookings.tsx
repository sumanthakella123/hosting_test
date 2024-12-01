import { GetServerSideProps } from 'next';
import { useState, useEffect } from 'react';
import { X, Pencil, Trash2 } from 'lucide-react';
import DashboardLayout from '../../../../components/DashboardLayout';
import prisma from '../../../../utils/prisma';

interface Booking {
  id: number;
  deity: string;
  date: string; // Serialized date string
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  amount: number;
}

interface ViewBookingsProps {
  bookings: Booking[];
}

// Edit Modal Component
const EditBookingModal = ({ 
  isOpen, 
  onClose, 
  booking, 
  onSave, 
  onChange 
}: { 
  isOpen: boolean;
  onClose: () => void;
  booking: Partial<Booking> | null;
  onSave: () => void;
  onChange: (field: keyof Booking, value: string | number) => void;
}) => {
  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Edit Booking #{booking.id}</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">First Name</label>
            <input
              type="text"
              value={booking.firstName || ''}
              onChange={(e) => onChange('firstName', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Last Name</label>
            <input
              type="text"
              value={booking.lastName || ''}
              onChange={(e) => onChange('lastName', e.target.value)}
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
            <label className="block text-sm font-medium text-gray-700">Deity</label>
            <input
              type="text"
              value={booking.deity || ''}
              onChange={(e) => onChange('deity', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Amount</label>
            <input
              type="number"
              value={booking.amount || 0}
              onChange={(e) => onChange('amount', parseFloat(e.target.value))}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              value={booking.date?.split('T')[0] || ''}
              onChange={(e) => onChange('date', e.target.value)}
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

// Delete Confirmation Modal Component
const DeleteConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm 
}: { 
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <h3 className="text-xl font-semibold mb-4">Confirm Delete</h3>
        <p>Are you sure you want to delete this booking? This action cannot be undone.</p>
        <div className="flex justify-end mt-6 space-x-4">
          <button onClick={onClose} className="bg-gray-200 px-4 py-2 rounded">Cancel</button>
          <button onClick={onConfirm} className="bg-red-500 text-white px-4 py-2 rounded">Delete</button>
        </div>
      </div>
    </div>
  );
};

export default function ViewBookings({ bookings = [] }: ViewBookingsProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDeity, setSelectedDeity] = useState<string>('');
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>(bookings);
  const [sortColumn, setSortColumn] = useState<keyof Booking | ''>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [localBookings, setLocalBookings] = useState<Booking[]>(bookings);
  const [editingBookingId, setEditingBookingId] = useState<number | null>(null);
  const [editedBooking, setEditedBooking] = useState<Partial<Booking> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<number | null>(null);

  const deities = Array.from(new Set(bookings.map((booking) => booking.deity)));

  useEffect(() => {
    let filtered = localBookings;

    if (selectedDeity) {
      filtered = filtered.filter((booking) => booking.deity === selectedDeity);
    }

    if (searchQuery) {
      filtered = filtered.filter((booking) => {
        const searchString = `${booking.firstName} ${booking.lastName} ${booking.email} ${booking.phone}`.toLowerCase();
        return searchString.includes(searchQuery.toLowerCase());
      });
    }

    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        let valueA: string | number | Date = a[sortColumn];
        let valueB: string | number | Date = b[sortColumn];

        if (sortColumn === 'date') {
          valueA = new Date(valueA as string);
          valueB = new Date(valueB as string);
        }

        if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredBookings(filtered);
  }, [searchQuery, selectedDeity, localBookings, sortColumn, sortDirection]);

  const handleSort = (column: keyof Booking) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleEdit = (booking: Booking) => {
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
        const response = await fetch(`/api/vastra-seva/${bookingToDelete}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete booking');
        }
        
        setLocalBookings(localBookings.filter((booking) => booking.id !== bookingToDelete));
        setIsDeleteModalOpen(false);
      } catch (error) {
        console.error('Error deleting booking:', error);
      }
    }
  };

  const handleSave = async () => {
    if (editingBookingId && editedBooking) {
      try {
        const response = await fetch(`/api/vastra-seva/${editingBookingId}`, {
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
        setLocalBookings(localBookings.map((booking) =>
          booking.id === editingBookingId ? updatedBooking : booking
        ));
        setIsModalOpen(false);
      } catch (error) {
        console.error('Error saving booking:', error);
      }
    }
  };

  const handleInputChange = (field: keyof Booking, value: string | number) => {
    setEditedBooking((prev) => prev ? ({ ...prev, [field]: value }) : null);
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-semibold mb-6 text-gray-800">Vastra Seva Bookings</h1>

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

          <div className="w-full md:w-1/3">
            <select
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedDeity}
              onChange={(e) => setSelectedDeity(e.target.value)}
            >
              <option value="">All Deities</option>
              {deities.map((deity) => (
                <option key={deity} value={deity}>
                  {deity}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto shadow-lg rounded-lg">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('id')}
                >
                  <div className="flex items-center">
                    Booking ID
                    {sortColumn === 'id' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('deity')}
                >
                  <div className="flex items-center">
                    Deity
                    {sortColumn === 'deity' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center">
                    Date
                    {sortColumn === 'date' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center">
                    Amount
                    {sortColumn === 'amount' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.deity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(booking.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {`${booking.firstName} ${booking.lastName}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${booking.amount.toFixed(2)}
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
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    No bookings found
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

export const getServerSideProps: GetServerSideProps<ViewBookingsProps> = async (context) => {
  try {
    const bookings = await prisma.vastraSevaBooking.findMany({
      orderBy: { date: 'asc' },
    });

    const serializedBookings: Booking[] = bookings.map((booking) => ({
      id: booking.id,
      deity: booking.deity,
      date: booking.date.toISOString(),
      firstName: booking.firstName,
      lastName: booking.lastName,
      email: booking.email,
      phone: booking.phone,
      amount: booking.amount,
    }));

    return {
      props: {
        bookings: serializedBookings,
      },
    };
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return {
      props: {
        bookings: [],
      },
    };
  }
};
