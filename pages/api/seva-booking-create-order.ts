// pages/api/seva-booking-create-order.ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../utils/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: `Method ${req.method} not allowed.` });
    return;
  }

  try {
    const {
      sevaType,
      poojaDetails,
      date,
      amount,
      firstName,
      lastName,
      email,
      phone,
      gotram,
      requests,
      location,
      priestPreference,
      muhuratRequired,
      namesAndNakshatras,
      serviceDate,
      timeWindow,
      venueAddress,
    } = req.body;

    // Create the order and booking
    const order = await prisma.sevaOrder.create({
      data: {
        totalAmount: amount,
        status: 'pending',
        bookings: {
          create: {
            sevaType,
            poojaDetails,
            date: new Date(date),
            amount,
            firstName,
            lastName,
            email,
            phone,
            gotram: gotram || '',
            requests: requests || '',
            location,
            priestPreference,
            muhuratRequired,
            namesAndNakshatras: namesAndNakshatras || '',
            serviceDate: serviceDate ? new Date(serviceDate) : new Date(),
            timeWindow: timeWindow || '',
            venueAddress: venueAddress || '',
            status: 'pending',
          },
        },
      },
    });

    res.status(200).json({
      message: 'Order created successfully.',
      orderId: order.id,
      totalAmount: order.totalAmount,
    });
  } catch (error: any) {
    console.error('Error creating order:', error);
    res.status(500).json({ 
      message: error.message || 'Internal server error.' 
    });
  }
}