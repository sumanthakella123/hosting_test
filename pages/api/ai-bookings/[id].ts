// pages/api/ai-bookings/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../utils/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const bookingId = parseInt(id as string);

  switch (req.method) {
    case 'PUT':
      try {
        const updatedBooking = await prisma.aI_Booking.update({
          where: { id: bookingId },
          data: {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            pujaName: req.body.pujaName,
          },
        });
        return res.status(200).json(updatedBooking);
      } catch (error) {
        console.error('Error updating AI booking:', error);
        return res.status(500).json({ message: 'Error updating booking' });
      }

    case 'DELETE':
      try {
        await prisma.aI_Booking.delete({
          where: { id: bookingId },
        });
        return res.status(200).json({ message: 'Booking deleted successfully' });
      } catch (error) {
        console.error('Error deleting AI booking:', error);
        return res.status(500).json({ message: 'Error deleting booking' });
      }

    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}