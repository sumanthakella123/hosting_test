// pages/seva/confirmation.tsx
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Confirmation() {
  const router = useRouter();
  const { orderId } = router.query;

  const [isConfirmed, setIsConfirmed] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!router.isReady || !orderId) return;

    // Update the order status in the database
    const updateOrderStatus = async () => {
      try {
        const response = await fetch('/api/seva-confirm-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ orderId }),
        });

        if (response.ok) {
          setIsConfirmed(true);
        } else {
          setError('Failed to confirm order.');
        }
      } catch (error) {
        console.error('Error confirming order:', error);
        setError('An unexpected error occurred.');
      }
    };

    updateOrderStatus();
  }, [router.isReady, orderId]);

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="border border-green-300 p-6 rounded-lg text-center shadow-md">
        {error ? (
          <>
            <h1 className="text-2xl font-semibold mb-4 text-red-600">Error</h1>
            <p className="mb-4 text-red-500">{error}</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold mb-4 text-green-600">Booking Confirmed!</h1>
            <p className="mb-4">Thank you for your booking.</p>
            <p className="mb-6">We have sent a confirmation email to your provided email address.</p>
          </>
        )}
        <button
          onClick={() => router.push('/seva-booking')}
          className="mt-6 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg text-lg transition-colors"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}