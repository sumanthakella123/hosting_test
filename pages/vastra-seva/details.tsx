// pages/vastra-seva/details.tsx
import { useRouter } from 'next/router';
import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { parseISO } from 'date-fns';

export default function DetailsForm() {
  const router = useRouter();
  const { deity, dates } = router.query;

  const [formData, setFormData] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    gotram: string;
    requests: string;
  }>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gotram: '',
    requests: '',
  });

  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (!router.isReady) return; // Wait until router is ready

    if (!deity || !dates) {
      // Redirect back or show an error message
      router.push('/vastra-seva'); // Adjust the path as needed
      return;
    }

    if (dates) {
      const dateArray = Array.isArray(dates) ? dates : [dates];
      const parsedDates = dateArray.map((dateStr) => parseISO(dateStr));
      setSelectedDates(parsedDates);

      // Calculate total amount
      const amount = parsedDates.reduce((total, date) => {
        return total + getPriceForDate(date);
      }, 0);
      setTotalAmount(amount);
    }
  }, [router.isReady, deity, dates]);

  const getPriceForDate = (date: Date): number => {
    return isSpecialDate(date) ? 100 : 50;
  };

  // Define your logic to determine if a date is special
  const isSpecialDate = (date: Date): boolean => {
    // Implement logic to determine special dates
    // For this example, assume no dates are special
    return false;
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    // Prepare booking data
    const bookingData = {
      deity,
      dates: selectedDates.map((date) => date.toISOString()),
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      gotram: formData.gotram,
      requests: formData.requests,
    };

    try {
      // Send booking data to the server to create an order
      const response = await fetch('/api/vastra-seva-create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (response.ok) {
        const data = await response.json();
        const { orderId } = data;

        // Redirect to payment page with orderId
        router.push({
          pathname: '/vastra-seva/payment',
          query: { orderId },
        });
      } else {
        // Handle server errors
        const errorData = await response.json();
        setErrorMessage(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('An unexpected error occurred:', error);
      setErrorMessage(
        'An unexpected error occurred. Please try again later.'
      );
    }

    setIsSubmitting(false);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      {/* Card Container */}
      <div className="border border-orange-300 p-6 rounded-lg relative shadow-md bg-white">
        {/* Back Button */}
        <div className="absolute top-4 left-4">
          <button
            onClick={() => router.back()}
            className="text-orange-500 hover:text-orange-700 font-medium"
          >
            &#8592; Back
          </button>
        </div>
        <h1 className="text-2xl font-semibold mb-6 text-center text-orange-600">
          Your Details
        </h1>
        <h2 className="text-xl font-medium mb-4 text-orange-500">
          Selected Dates
        </h2>
        <ul className="list-disc list-inside text-lg mb-4 pl-4">
          {selectedDates.map((date, index) => (
            <li key={index}>
              {date.toDateString()} (
              {isSpecialDate(date) ? 'Special Day' : 'Normal Day'}) - $
              {getPriceForDate(date)}
            </li>
          ))}
        </ul>
        <div className="text-xl font-semibold mb-6 text-orange-600">
          Total Amount: ${totalAmount}
        </div>
        {errorMessage && (
          <div className="text-red-500 mb-4 text-center">{errorMessage}</div>
        )}
        <form onSubmit={handleSubmit}>
          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label className="block text-left text-lg">First Name</label>
              <input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="border border-orange-300 p-3 w-full rounded text-lg"
              />
            </div>
            {/* Last Name */}
            <div>
              <label className="block text-left text-lg">Last Name</label>
              <input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="border border-orange-300 p-3 w-full rounded text-lg"
              />
            </div>
            {/* Email ID */}
            <div>
              <label className="block text-left text-lg">Email ID</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="border border-orange-300 p-3 w-full rounded text-lg"
              />
            </div>
            {/* Phone Number */}
            <div>
              <label className="block text-left text-lg">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="border border-orange-300 p-3 w-full rounded text-lg"
              />
            </div>
            {/* Gotram (Optional) */}
            <div>
              <label className="block text-left text-lg">Gotram (Optional)</label>
              <input
                name="gotram"
                value={formData.gotram}
                onChange={handleChange}
                className="border border-orange-300 p-3 w-full rounded text-lg"
              />
            </div>
            {/* Additional Requests */}
            <div className="md:col-span-2">
              <label className="block text-left text-lg">
                Additional Requests (Optional)
              </label>
              <textarea
                name="requests"
                value={formData.requests}
                onChange={handleChange}
                className="border border-orange-300 p-3 w-full rounded text-lg"
                rows={3}
              />
            </div>
          </div>
          {/* Submit Button */}
          <button
            type="submit"
            className={`mt-6 bg-orange-500 text-white px-6 py-3 rounded-lg w-full text-xl font-medium ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Proceed to Payment'}
          </button>
        </form>
      </div>
    </div>
  );
}