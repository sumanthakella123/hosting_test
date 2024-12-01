// pages/api/seva-confirm-order.ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../utils/prisma';
import { sendBookingConfirmation } from '../../utils/mailer';
import { BookingDetails } from '../../types/booking';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { orderId } = req.body;

    if (!orderId) {
      res.status(400).json({ message: 'Missing orderId.' });
      return;
    }

    try {
      // Update order and fetch all related data in one query
      const order = await prisma.sevaOrder.update({
        where: { id: Number(orderId) },
        data: {
          status: 'confirmed',
          bookings: {
            updateMany: {
              where: { orderId: Number(orderId) },
              data: { status: 'confirmed' }
            }
          }
        },
        include: {
          bookings: true // Include all bookings
        }
      });

      // Send confirmation email for each booking
      if (order.bookings.length > 0) {
        for (const booking of order.bookings) {
          const emailDetails: BookingDetails = {
            pooja: booking.sevaType,
            poojaDetails: booking.poojaDetails || undefined,
            serviceDate: booking.serviceDate.toISOString(),
            timeWindow: booking.timeWindow || undefined,
            firstName: booking.firstName,
            lastName: booking.lastName,
            email: booking.email,
            contact: booking.phone,
            gotram: booking.gotram || undefined,
            location: booking.location,
            venueAddress: booking.venueAddress || undefined,
            priestPreference: booking.priestPreference,
            muhuratRequired: booking.muhuratRequired,
            requests: booking.requests || undefined,
          };

          try {
            await sendBookingConfirmation(emailDetails);
          } catch (emailError) {
            console.error('Error sending confirmation email:', emailError);
            // Continue with other bookings even if one email fails
          }
        }
      }

      res.status(200).json({ message: 'Order confirmed and confirmation emails sent.' });
    } catch (error: any) {
      console.error('Error confirming order:', error);
      res.status(500).json({ message: error.message || 'Internal server error.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: `Method ${req.method} not allowed.` });
  }
}