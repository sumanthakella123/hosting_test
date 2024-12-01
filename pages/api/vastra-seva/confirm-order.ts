import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../utils/prisma';
import { sendVastraSevaConfirmation } from '../../../utils/vastra-mailer';
import { VastraSevaBookingDetails } from '../../../types/booking';

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
      // Update order and bookings to 'confirmed' status
      const order = await prisma.vastraSevaOrder.update({
        where: { id: Number(orderId) },
        data: {
          status: 'confirmed',
          bookings: {
            updateMany: {
              data: { status: 'confirmed' },
              where: { orderId: Number(orderId) },
            },
          },
        },
        include: {
          bookings: true, // Include all bookings associated with this order
        },
      });

      // Prepare booking details for email
      if (order.bookings.length > 0) {
        const firstBooking = order.bookings[0];
        const emailDetails: VastraSevaBookingDetails = {
          deity: firstBooking.deity,
          dates: order.bookings.map(booking => booking.date.toISOString()),
          specialDates: order.bookings
            .filter(booking => booking.specialDay)
            .map(booking => booking.date),
          totalAmount: order.totalAmount,
          firstName: firstBooking.firstName,
          lastName: firstBooking.lastName,
          email: firstBooking.email,
          phone: firstBooking.phone,
          gotram: firstBooking.gotram,
          requests: firstBooking.requests,
        };

        // Send confirmation email
        try {
          await sendVastraSevaConfirmation(emailDetails);
        } catch (emailError) {
          console.error('Error sending confirmation email:', emailError);
          // Don't fail the request if email fails, but log it
        }
      }

      res.status(200).json({ message: 'Order confirmed and confirmation email sent.' });
    } catch (error: any) {
      console.error('Error confirming order:', error);
      res.status(500).json({ message: error.message || 'Internal server error.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: `Method ${req.method} not allowed.` });
  }
}