// pages/api/seva-create-payment-link.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { Client, Environment } from 'square';
import prisma from '../../utils/prisma';

const squareClient = new Client({
  environment: process.env.NODE_ENV === 'production' 
    ? Environment.Sandbox 
    : Environment.Sandbox,
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: `Method ${req.method} not allowed.` });
    return;
  }

  const { orderId } = req.body;

  if (!orderId) {
    res.status(400).json({ message: 'Missing orderId.' });
    return;
  }

  try {
    // Fetch the order from the database
    const order = await prisma.sevaOrder.findUnique({
      where: { id: Number(orderId) },
      include: {
        bookings: true,
      },
    });

    if (!order) {
      res.status(404).json({ message: 'Order not found.' });
      return;
    }

    // Create line items for the payment link
    const lineItems = order.bookings.map((booking) => ({
      name: `${booking.sevaType} Service - ${new Date(booking.serviceDate).toLocaleDateString()}`,
      quantity: '1',
      basePriceMoney: {
        amount: BigInt(Math.round(booking.amount * 100)), // Convert to cents and then to BigInt
        currency: 'USD',
      },
    }));

    // Create the payment link
    const onlineCheckoutApi = squareClient.checkoutApi;
    const { result } = await onlineCheckoutApi.createPaymentLink({
      idempotencyKey: `seva-${orderId}-${Date.now()}`,
      order: {
        locationId: process.env.SQUARE_LOCATION_ID!,
        lineItems,
      },
      checkoutOptions: {
        redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/seva-booking/confirmation?orderId=${orderId}`,
      },
    });

    if (!result.paymentLink?.url) {
      throw new Error('Failed to create payment link');
    }

    // Store the payment link URL in the order if needed
    await prisma.sevaOrder.update({
      where: { id: Number(orderId) },
      data: {
        status: 'payment_pending',
      },
    });

    res.status(200).json({ paymentLinkUrl: result.paymentLink.url });
  } catch (error: any) {
    console.error('Error creating payment link:', error);
    res.status(500).json({ 
      message: error.message || 'Internal server error.'
    });
  }
}