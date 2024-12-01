// pages/vastra-seva/payment.tsx
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';

interface VastraSevaOrder {
  id: number;
  totalAmount: number;
  status: string;
  bookings: Array<{
    deity: string;
    date: string;
    amount: number;
    specialDay: boolean;
  }>;
}

export default function VastraSevaPaymentPage() {
  const router = useRouter();
  const { orderId } = router.query;

  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState<VastraSevaOrder | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch order details
  useEffect(() => {
    if (!router.isReady || !orderId) return;

    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/vastra-seva/get-order?orderId=${orderId}`);
        if (response.ok) {
          const data = await response.json();
          setOrder(data.order);
          // After fetching order details, create payment link
          createPaymentLink(data.order.id);
        } else {
          router.push('/vastra-seva');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        router.push('/vastra-seva');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [router.isReady, orderId]);

  const createPaymentLink = async (orderId: number) => {
    try {
      const response = await fetch('/api/vastra-seva/create-payment-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      });

      if (response.ok) {
        const { paymentLinkUrl } = await response.json();
        // Redirect to Square's hosted checkout page
        window.location.href = paymentLinkUrl;
      } else {
        const error = await response.json();
        setErrorMessage(error.message || 'Failed to create payment link');
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to create payment link');
    }
  };

  return (
    <Layout>
      <div className="p-4 max-w-lg mx-auto">
        {isLoading ? (
          <div className="text-center">
            <p className="text-lg">Preparing your payment...</p>
          </div>
        ) : order ? (
          <div className="border border-orange-300 p-6 rounded-lg shadow-md">
            <h1 className="text-2xl font-semibold mb-4 text-center text-orange-600">
              Redirecting to Payment Page
            </h1>
            
            <div className="mb-6">
              <p className="text-lg mb-2">Deity: {order.bookings[0]?.deity}</p>
              <p className="text-lg mb-2">
                Service Date: {new Date(order.bookings[0]?.date).toLocaleDateString()}
              </p>
              {order.bookings[0]?.specialDay && (
                <p className="text-lg mb-2 text-orange-600">Special Day Service</p>
              )}
              <p className="text-xl font-semibold text-orange-600 text-center">
                Total Amount: ${order.totalAmount}
              </p>
            </div>

            {errorMessage && (
              <div className="text-red-500 mb-4 p-3 bg-red-50 rounded text-center">
                {errorMessage}
              </div>
            )}

            <div className="text-center text-gray-600">
              <p>Please wait while we redirect you to the secure payment page...</p>
            </div>
          </div>
        ) : (
          <div className="text-center text-red-500">Order not found.</div>
        )}
      </div>
    </Layout>
  );
}