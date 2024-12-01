// pages/api/send-seva-email.ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../utils/prisma';
import { sendBookingConfirmation } from '../../utils/mailer';
import { BookingDetails } from '../../types/booking';

interface ExtendedNextApiRequest extends NextApiRequest {
  body: {
    bookingDetails: BookingDetails;
  };
}

export default async function handler(
  req: ExtendedNextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { bookingDetails } = req.body;

  try {
    // Create booking in database
    const newBooking = await prisma.sevaBooking.create({
      data: {
        sevaType: bookingDetails.pooja,
        poojaDetails: bookingDetails.poojaDetails ?? null,
        date: new Date(),
        amount: 0,
        firstName: bookingDetails.firstName,
        lastName: bookingDetails.lastName,
        email: bookingDetails.email,
        phone: bookingDetails.contact,
        gotram: bookingDetails.gotram ?? null,
        requests: bookingDetails.requests ?? null,
        location: bookingDetails.location,
        priestPreference: bookingDetails.priestPreference,
        muhuratRequired: bookingDetails.muhuratRequired === 'Yes',
        namesAndNakshatras: bookingDetails.namesAndNakshatras ?? null,
        serviceDate: new Date(bookingDetails.serviceDate),
        timeWindow: bookingDetails.timeWindow ?? null,
        venueAddress: bookingDetails.venueAddress ?? null,
      },
    });

    // Send confirmation email
    await sendBookingConfirmation(bookingDetails);

    return res.status(200).json({ 
      message: 'Booking confirmed! A confirmation email has been sent to your email address.',
      newBooking 
    });
  } catch (error) {
    console.error('Booking error:', error);
    return res.status(500).json({ error: 'Failed to process booking. Please try again.' });
  }
}