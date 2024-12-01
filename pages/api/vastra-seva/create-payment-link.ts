// pages/api/vastra-seva/create-payment-link.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { Client, Environment } from 'square';
import prisma from '../../../utils/prisma';

// Initialize Square client with environment based on NODE_ENV
const squareClient = new Client({
  environment: process.env.NODE_ENV === 'production' 
    ? Environment.Production 
    : Environment.Sandbox,
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { orderId } = req.body;

    if (!orderId) {
      res.status(400).json({ message: 'Missing orderId.' });
      return;
    }

    try {
      // Verify Square client is properly configured
      if (!process.env.SQUARE_ACCESS_TOKEN || !process.env.SQUARE_LOCATION_ID) {
        throw new Error('Square configuration is incomplete');
      }

      // Fetch the order from the database
      const order = await prisma.vastraSevaOrder.findUnique({
        where: { id: Number(orderId) },
        include: {
          bookings: true,
        },
      });

      if (!order) {
        res.status(404).json({ message: 'Order not found.' });
        return;
      }

      // Create line items for Square checkout
      const lineItems = order.bookings.map((booking) => ({
        name: `Vastra Seva for ${booking.deity}`,
        quantity: '1',
        basePriceMoney: {
          amount: BigInt(Math.round(booking.amount * 100)), // Convert to BigInt cents
          currency: 'USD',
        },
        note: `Service Date: ${new Date(booking.date).toLocaleDateString()} ${booking.specialDay ? '(Special Day)' : ''}`,
      }));

      const checkoutApi = squareClient.checkoutApi;
      const { result } = await checkoutApi.createPaymentLink({
        idempotencyKey: `vastra-seva-${orderId}-${Date.now()}`,
        order: {
          locationId: process.env.SQUARE_LOCATION_ID!,
          lineItems,
        },
        checkoutOptions: {
          redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/vastra-seva/confirmation?orderId=${orderId}`,
          acceptedPaymentMethods: {
            applePay: true,
            googlePay: true,
            cashAppPay: true,
            afterpayClearpay: true, // Enabled for testing in sandbox
          },
          askForShippingAddress: false,
          allowTipping: false,
          merchantSupportEmail: process.env.ADMIN_EMAIL,
        },
        prePopulatedData: {
          buyerEmail: order.bookings[0]?.email,
        },
      });

      if (!result.paymentLink?.url) {
        throw new Error('Failed to create payment link');
      }

      // Log successful payment link creation
      if (process.env.NODE_ENV === 'development') {
        console.log('Sandbox Payment link created:', {
          orderId,
          paymentLinkId: result.paymentLink.id,
          totalAmount: order.totalAmount,
          environment: 'sandbox',
        });
      }

      res.status(200).json({ 
        paymentLinkUrl: result.paymentLink.url,
        paymentLinkId: result.paymentLink.id
      });
    } catch (error: any) {
      console.error('Error creating payment link:', {
        error: error.message,
        details: error.errors || [],
        orderId,
        environment: 'sandbox',
      });
      
      // In sandbox/development, return more detailed error information
      res.status(500).json({ 
        message: 'Failed to create payment link. Please try again or contact support.',
        details: process.env.NODE_ENV === 'development' ? {
          error: error.message,
          errors: error.errors,
          stack: error.stack
        } : undefined
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: `Method ${req.method} not allowed.` });
  }
}