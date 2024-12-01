// pages/api/process-payment.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { Client, Environment } from 'square';
import prisma from '../../utils/prisma';

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
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: `Method ${req.method} not allowed.` });
    return;
  }

  const { sourceId, orderId, amount } = req.body;

  if (!sourceId || !orderId || !amount) {
    res.status(400).json({ message: 'Missing required parameters.' });
    return;
  }

  try {
    // Convert amount to cents and then to BigInt
    const amountInCents = BigInt(Math.round(amount * 100));

    // Create the payment with Square
    const payment = await squareClient.paymentsApi.createPayment({
      sourceId,
      idempotencyKey: `seva-${orderId}-${Date.now()}`,
      amountMoney: {
        amount: amountInCents,
        currency: 'USD',
      },
      locationId: process.env.SQUARE_LOCATION_ID!,
    });

    if (payment.result?.payment?.status === 'COMPLETED') {
      // Update order status in database
      await prisma.sevaOrder.update({
        where: { id: Number(orderId) },
        data: {
          status: 'paid',
          bookings: {
            updateMany: {
              where: { orderId: Number(orderId) },
              data: { status: 'confirmed' },
            },
          },
        },
      });

      res.status(200).json({ 
        message: 'Payment successful',
        paymentId: payment.result.payment.id,
      });
    } else {
      throw new Error('Payment failed');
    }
  } catch (error: any) {
    console.error('Payment processing error:', error);
    res.status(500).json({ 
      message: error.message || 'Payment processing failed.' 
    });
  }
}