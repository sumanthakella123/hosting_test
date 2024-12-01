// pages/api/seva-get-order.ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../utils/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { orderId } = req.query;

  if (!orderId) {
    res.status(400).json({ message: 'Missing orderId parameter.' });
    return;
  }

  try {
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

    res.status(200).json({ order });
  } catch (error: any) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: error.message || 'Internal server error.' });
  }
}
