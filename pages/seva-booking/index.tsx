// pages/seva-booking/index.tsx
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';

const poojas = [
  { name: 'Abhishekam', description: 'An elaborate ritual of bathing the deity with sacred substances.', amount: 100 },
  { name: 'OTHER', description: '', amount: 100 },
];

interface FormData {
  poojaDetails: string;
  email: string;
  phone: string;
  requests: string;
  location: string;
  priestPreference: string;
  muhuratRequired: string;
  namesAndNakshatras: string;
  serviceDate: string;
  timeWindow: string;
  firstName: string;
  lastName: string;
  venueAddress: string;
}

export default function PoojaSelection() {
  const [selectedPooja, setSelectedPooja] = useState<typeof poojas[0] | null>(null);
  const [formData, setFormData] = useState<FormData>({
    poojaDetails: '',
    email: '',
    phone: '',
    requests: '',
    location: '',
    priestPreference: '',
    muhuratRequired: '',
    namesAndNakshatras: '',
    serviceDate: '',
    timeWindow: '',
    firstName: '',
    lastName: '',
    venueAddress: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePoojaSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = poojas.find((pooja) => pooja.name === e.target.value);
    setSelectedPooja(selected || null);
    setFormData({ ...formData, poojaDetails: '' });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    if (!selectedPooja) {
      setErrorMessage('Please select a pooja');
      setIsSubmitting(false);
      return;
    }

    try {
      const bookingData = {
        sevaType: selectedPooja.name,
        poojaDetails: formData.poojaDetails,
        date: new Date().toISOString(),
        amount: selectedPooja.amount,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        gotram: '', // Add gotram if needed
        requests: formData.requests,
        location: formData.location,
        priestPreference: formData.priestPreference,
        muhuratRequired: formData.muhuratRequired === 'Yes',
        namesAndNakshatras: formData.namesAndNakshatras,
        serviceDate: formData.serviceDate ? new Date(formData.serviceDate).toISOString() : new Date().toISOString(),
        timeWindow: formData.timeWindow,
        venueAddress: formData.venueAddress,
      };

      const response = await axios.post('/api/seva-booking-create-order', bookingData);

      if (response.status === 200) {
        const { orderId } = response.data;
        // Updated path to match new structure
        router.push({
          pathname: '/seva-booking/payment',
          query: { orderId },
        });
      } else {
        throw new Error(response.data.message || 'Failed to create booking');
      }
    } catch (error: any) {
      console.error('An unexpected error occurred:', error);
      setErrorMessage(error.response?.data?.message || 'An unexpected error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white border border-orange-300 rounded-lg shadow-lg">
      <h1 className="text-2xl font-semibold text-center text-orange-600 mb-6">Select a Pooja</h1>

      {/* Dropdown for Pooja Selection */}
      <div className="mb-4">
        <label className="block text-lg mb-2 text-orange-500">Pooja Type</label>
        <select
          name="sevaType"
          className="w-full border border-orange-300 p-3 rounded text-lg"
          value={selectedPooja?.name || ''}
          onChange={handlePoojaSelect}
        >
          <option value="" disabled>
            Select a Pooja
          </option>
          {poojas.map((pooja) => (
            <option key={pooja.name} value={pooja.name}>
              {pooja.name}
            </option>
          ))}
        </select>
        {selectedPooja && selectedPooja.name === 'OTHER' && (
          <div className="mt-4">
            <label className="block text-lg mb-2">Please specify details of the Pooja</label>
            <textarea
              name="poojaDetails"
              value={formData.poojaDetails}
              onChange={handleChange}
              className="w-full border border-orange-300 p-3 rounded text-lg"
              rows={3}
            />
          </div>
        )}
      </div>

      {/* User Details Form */}
      {selectedPooja && (
        <form onSubmit={handleSubmit} className="mt-4">
          <h2 className="text-xl font-semibold text-orange-600 mb-4">Your Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Location of Pooja */}
            <div className="md:col-span-2">
              <label className="block text-lg mb-2">Location of Pooja</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="location"
                    value="In the Temple"
                    onChange={handleChange}
                    required
                  />
                  <span className="ml-2">In the Temple</span>
                </label>
                <label className="flex items-center">
                  <input type="radio" name="location" value="At Home" onChange={handleChange} />
                  <span className="ml-2">At Home</span>
                </label>
              </div>
            </div>

            {/* Priest Preference */}
            <div className="md:col-span-2">
              <label className="block text-lg mb-2">Priest Preference</label>
              <select
                name="priestPreference"
                value={formData.priestPreference}
                onChange={handleChange}
                className="w-full border border-orange-300 p-3 rounded text-lg"
                required
              >
                <option value="" disabled>
                  Select a Priest
                </option>
                <option value="Pt. Srinivas Sarama">Pt. Srinivas Sarama</option>
                <option value="Pt. Ghanashyam Sharma">Pt. Ghanashyam Sharma</option>
                <option value="No preference">No preference</option>
              </select>
            </div>

            {/* Muhurat Suggestion */}
            <div className="md:col-span-2">
              <label className="block text-lg mb-2">Do you want the priest to suggest Muhurat?</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="muhuratRequired"
                    value="Yes"
                    onChange={handleChange}
                    required
                  />
                  <span className="ml-2">Yes</span>
                </label>
                <label className="flex items-center">
                  <input type="radio" name="muhuratRequired" value="No" onChange={handleChange} />
                  <span className="ml-2">No</span>
                </label>
              </div>
            </div>

            {/* Name(s) and Nakshatra(s) if Muhurat is required */}
            {formData.muhuratRequired === 'Yes' && (
              <div className="md:col-span-2">
                <label className="block text-lg mb-2">
                  If Muhurat is required, please provide Name(s) and Birth Nakshatra(s)
                </label>
                <textarea
                  name="namesAndNakshatras"
                  value={formData.namesAndNakshatras}
                  onChange={handleChange}
                  className="w-full border border-orange-300 p-3 rounded text-lg"
                  rows={2}
                />
              </div>
            )}

            {/* Service Date */}
            <div>
              <label className="block text-lg mb-2">Service Date</label>
              <input
                type="date"
                name="serviceDate"
                value={formData.serviceDate}
                onChange={handleChange}
                className="w-full border border-orange-300 p-3 rounded text-lg"
              />
            </div>

            {/* Time Window for Pooja */}
            <div>
              <label className="block text-lg mb-2">Time Window for the Pooja</label>
              <input
                type="text"
                name="timeWindow"
                value={formData.timeWindow}
                onChange={handleChange}
                className="w-full border border-orange-300 p-3 rounded text-lg"
                placeholder="E.g., 10:00 AM - 12:00 PM"
              />
            </div>

            {/* Additional Details */}
            <div>
              <label className="block text-lg mb-2">Your First Name</label>
              <input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full border border-orange-300 p-3 rounded text-lg"
              />
            </div>
            <div>
              <label className="block text-lg mb-2">Your Last Name</label>
              <input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full border border-orange-300 p-3 rounded text-lg"
              />
            </div>

            {/* Contact Details */}
            <div>
              <label className="block text-lg mb-2">Contact Phone Number</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full border border-orange-300 p-3 rounded text-lg"
              />
            </div>
            <div>
              <label className="block text-lg mb-2">Email Address</label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-orange-300 p-3 rounded text-lg"
                required
              />
            </div>

            {/* Venue Address */}
            <div className="md:col-span-2">
              <label className="block text-lg mb-2">Venue Address (if applicable)</label>
              <textarea
                name="venueAddress"
                value={formData.venueAddress}
                onChange={handleChange}
                className="w-full border border-orange-300 p-3 rounded text-lg"
                rows={2}
              />
            </div>

            {/* Additional Requests */}
            <div className="md:col-span-2">
              <label className="block text-lg mb-2">Additional Requests (Optional)</label>
              <textarea
                name="requests"
                value={formData.requests}
                onChange={handleChange}
                className="w-full border border-orange-300 p-3 rounded text-lg"
                rows={3}
              />
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && <p className="text-red-500 mt-4">{errorMessage}</p>}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`mt-6 w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg text-xl font-medium ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Processing...' : 'Confirm Booking'}
          </button>
        </form>
      )}
    </div>
  );
}
