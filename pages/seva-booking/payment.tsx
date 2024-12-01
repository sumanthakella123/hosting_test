import { useRouter } from 'next/router';
import { useEffect, useState, useCallback } from 'react';
import Layout from '../../components/Layout';

interface SevaOrder {
  id: number;
  totalAmount: number;
  status: string;
  bookings: Array<{
    sevaType: string;
    serviceDate: string;
    amount: number;
  }>;
}

declare global {
  interface Window {
    Square: any;
  }
}

export default function PaymentPage() {
  const router = useRouter();
  const { orderId } = router.query;

  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState<SevaOrder | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [payments, setPayments] = useState<any>(null);
  const [card, setCard] = useState<any>(null);
  const [isSquareInitialized, setIsSquareInitialized] = useState(false);

  // Fetch order details
  useEffect(() => {
    if (!router.isReady || !orderId) return;

    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/seva-get-order?orderId=${orderId}`);
        if (response.ok) {
          const data = await response.json();
          setOrder(data.order);
        } else {
          router.push('/seva-booking');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        router.push('/seva-booking');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [router.isReady, orderId]);

  // Initialize Square payments after order is loaded and component is mounted
  useEffect(() => {
    if (isLoading || !order || isSquareInitialized) return;

    if (!window.Square) {
      setErrorMessage('Square.js failed to load');
      return;
    }

    const initializeSquare = async () => {
      try {
        const cardContainer = document.getElementById('card-container');
        if (!cardContainer) {
          console.error('Card container not found');
          return;
        }

        const paymentsInstance = await window.Square.payments(
          process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID!,
          process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID!
        );
        setPayments(paymentsInstance);

        const cardInstance = await paymentsInstance.card();
        await cardInstance.attach('#card-container');
        setCard(cardInstance);
        setIsSquareInitialized(true);
      } catch (e) {
        console.error('Failed to initialize Square payments:', e);
        setErrorMessage('Failed to initialize payment system');
      }
    };

    const timeoutId = setTimeout(initializeSquare, 100); // Small delay to ensure DOM is ready

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      if (card) {
        card.destroy().catch((e: Error) => {
          console.error('Error destroying card instance:', e);
        });
      }
    };
  }, [isLoading, order, isSquareInitialized, card]);

  const handlePayment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!card || !order) return;

    try {
      setErrorMessage('');
      const result = await card.tokenize();
      if (result.status === 'OK') {
        // Send payment token to your server
        const response = await fetch('/api/process-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sourceId: result.token,
            orderId: order.id,
            amount: order.totalAmount,
          }),
        });

        if (response.ok) {
          // Payment successful, redirect to confirmation page
          router.push(`/seva-booking/confirmation?orderId=${order.id}`);
        } else {
          const error = await response.json();
          setErrorMessage(error.message || 'Payment failed');
        }
      } else {
        setErrorMessage(result.errors[0].message);
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Payment failed');
    }
  };

  return (
    <Layout>
      <div className="p-4 max-w-lg mx-auto">
        {isLoading ? (
          <div className="text-center">
            <p className="text-lg">Loading...</p>
          </div>
        ) : order ? (
          <div className="border border-orange-300 p-6 rounded-lg shadow-md">
            <h1 className="text-2xl font-semibold mb-4 text-center text-orange-600">
              Complete Your Payment
            </h1>
            
            <div className="mb-6">
              <p className="text-lg mb-2">Seva Type: {order.bookings[0]?.sevaType}</p>
              <p className="text-lg mb-2">
                Service Date: {new Date(order.bookings[0]?.serviceDate).toLocaleDateString()}
              </p>
              <p className="text-xl font-semibold text-orange-600 text-center">
                Total Amount: ${order.totalAmount}
              </p>
            </div>

            <form onSubmit={handlePayment}>
              {/* Square card input container */}
              <div 
                id="card-container" 
                className="mb-4 min-h-[100px] border border-orange-200 rounded p-3"
              ></div>

              {errorMessage && (
                <div className="text-red-500 mb-4 p-3 bg-red-50 rounded text-center">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg w-full text-xl font-medium transition-colors"
                disabled={!isSquareInitialized}
              >
                Pay ${order.totalAmount}
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center text-red-500">Order not found.</div>
        )}
      </div>
    </Layout>
  );
}