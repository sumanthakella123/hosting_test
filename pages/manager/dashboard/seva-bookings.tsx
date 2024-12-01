import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { X, Pencil, Trash2 } from 'lucide-react';
import DashboardLayout from '../../../components/DashboardLayout';
import prisma from '../../../utils/prisma';

interface SevaBooking {
  id: number;
  sevaType: string;
  poojaDetails: string | null;
  date: string;
  amount: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gotram: string | null;
  requests: string | null;
  location: string;
  priestPreference: string;
  muhuratRequired: boolean;
  namesAndNakshatras: string | null;
  serviceDate: string;
  timeWindow: string | null;
  venueAddress: string | null;
}

interface SevaBookingsProps {
  initialBookings: SevaBooking[]; // Changed from bookings to initialBookings
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
  booking: Partial<SevaBooking> | null;
  onSave: () => void;
  onChange: (field: keyof SevaBooking, value: string | number | boolean) => void;
}) => {
  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4">
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
            <label className="block text-sm font-medium text-gray-700">Seva Type</label>
            <input
              type="text"
              value={booking.sevaType || ''}
              onChange={(e) => onChange('sevaType', e.target.value)}
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
            <label className="block text-sm font-medium text-gray-700">Service Date</label>
            <input
              type="date"
              value={booking.serviceDate || ''}
              onChange={(e) => onChange('serviceDate', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Time Window</label>
            <input
              type="text"
              value={booking.timeWindow || ''}
              onChange={(e) => onChange('timeWindow', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              value={booking.location || ''}
              onChange={(e) => onChange('location', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Venue Address</label>
            <input
              type="text"
              value={booking.venueAddress || ''}
              onChange={(e) => onChange('venueAddress', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Gotram</label>
            <input
              type="text"
              value={booking.gotram || ''}
              onChange={(e) => onChange('gotram', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Priest Preference</label>
            <input
              type="text"
              value={booking.priestPreference || ''}
              onChange={(e) => onChange('priestPreference', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Pooja Details</label>
            <textarea
              value={booking.poojaDetails || ''}
              onChange={(e) => onChange('poojaDetails', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
              rows={3}
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Names and Nakshatras</label>
            <textarea
              value={booking.namesAndNakshatras || ''}
              onChange={(e) => onChange('namesAndNakshatras', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
              rows={3}
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Special Requests</label>
            <textarea
              value={booking.requests || ''}
              onChange={(e) => onChange('requests', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2"
              rows={3}
            />
          </div>

          <div className="col-span-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={booking.muhuratRequired || false}
                onChange={(e) => onChange('muhuratRequired', e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">Muhurat Required</span>
            </label>
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
        <p>Are you sure you want to delete this booking? This action cannot be undone.</p>
        <div className="flex justify-end mt-6 space-x-4">
          <button onClick={onClose} className="bg-gray-200 px-4 py-2 rounded">Cancel</button>
          <button onClick={onConfirm} className="bg-red-500 text-white px-4 py-2 rounded">Delete</button>
        </div>
      </div>
    </div>
  );
};

export default function SevaBookings({ initialBookings }: SevaBookingsProps) {
  const [bookings, setBookings] = useState<SevaBooking[]>(initialBookings);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSevaType, setSelectedSevaType] = useState<string>('');
  const [filteredBookings, setFilteredBookings] = useState<SevaBooking[]>(bookings);
  const [sortColumn, setSortColumn] = useState<keyof SevaBooking | ''>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [editingBookingId, setEditingBookingId] = useState<number | null>(null);
  const [editedBooking, setEditedBooking] = useState<Partial<SevaBooking> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);



  // Add filtering UI
  const sevaTypes = Array.from(new Set(bookings.map(booking => booking.sevaType)));

  useEffect(() => {
    let filtered = bookings;

    if (selectedSevaType) {
      filtered = filtered.filter((booking) => booking.sevaType === selectedSevaType);
    }

    if (searchQuery) {
      filtered = filtered.filter((booking) => {
        const searchString = `${booking.firstName} ${booking.lastName} ${booking.email} ${booking.phone}`.toLowerCase();
        return searchString.includes(searchQuery.toLowerCase());
      });
    }

    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        const valueA = a[sortColumn];
        const valueB = b[sortColumn];

        if (typeof valueA === 'string' && typeof valueB === 'string') {
          return sortDirection === 'asc' 
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        }

        if (typeof valueA === 'number' && typeof valueB === 'number') {
          return sortDirection === 'asc' 
            ? valueA - valueB
            : valueB - valueA;
        }

        return 0;
      });
    }

    setFilteredBookings(filtered);
  }, [searchQuery, selectedSevaType, bookings, sortColumn, sortDirection]);

  const handleSort = (column: keyof SevaBooking) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleEdit = (booking: SevaBooking) => {
    setEditingBookingId(booking.id);
    setEditedBooking({ ...booking });
    setIsModalOpen(true);
  };

  const handleDeleteRequest = (id: number) => {
    setBookingToDelete(id);
    setIsDeleteModalOpen(true);
  };

  // Updated handler functions
  const handleDeleteConfirm = async () => {
    if (bookingToDelete) {
      try {
        const response = await fetch(`/api/seva-bookings/${bookingToDelete}`, {
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
        const response = await fetch(`/api/seva-bookings/${editingBookingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...editedBooking,
            amount: parseFloat(editedBooking.amount?.toString() || '0'),
            serviceDate: editedBooking.serviceDate,
            muhuratRequired: Boolean(editedBooking.muhuratRequired),
          }),
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

  const handleInputChange = (field: keyof SevaBooking, value: string | number | boolean) => {
    setEditedBooking((prev) => prev ? ({ ...prev, [field]: value }) : null);
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-semibold mb-6 text-gray-800">Seva Bookings</h1>
      {/* Search and Filter Controls */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <select
              value={selectedSevaType}
              onChange={(e) => setSelectedSevaType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Seva Types</option>
              {sevaTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="overflow-x-auto shadow-lg rounded-lg">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('id')}
                >
                  Booking ID
                  {sortColumn === 'id' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('sevaType')}
                >
                  Seva Type
                  {sortColumn === 'sevaType' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('serviceDate')}
                >
                  Service Date
                  {sortColumn === 'serviceDate' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('amount')}
                >
                  Amount
                  {sortColumn === 'amount' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.sevaType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(booking.serviceDate).toLocaleDateString()}
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

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const bookings = await prisma.sevaBooking.findMany({
      orderBy: {
        id: 'desc',
      },
    });

    return {
      props: {
        initialBookings: JSON.parse(JSON.stringify(bookings)),
      },
    };
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return {
      props: {
        initialBookings: [],
      },
    };
  }
};