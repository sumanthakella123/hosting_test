// pages/api/vastra-seva/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../utils/prisma';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const sendEmail = async (booking: any, type: 'update' | 'cancel') => {
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333; text-align: center;">Vastra Seva Booking ${type === 'update' ? 'Updated' : 'Cancelled'}</h2>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #444;">Booking Details:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0;"><strong>Deity:</strong></td>
            <td>${booking.deity}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Name:</strong></td>
            <td>${booking.firstName} ${booking.lastName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Email:</strong></td>
            <td>${booking.email}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Phone:</strong></td>
            <td>${booking.phone}</td>
          </tr>
        </table>
      </div>
      
      <div style="background-color: ${type === 'update' ? '#e3f2fd' : '#fff3e0'}; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="color: #666; margin: 0;">
          ${type === 'update' 
            ? 'Your Vastra Seva booking has been updated with the details shown above.'
            : 'Your Vastra Seva booking has been cancelled.'} 
          If you have any questions, please contact us at ${process.env.ADMIN_EMAIL}
        </p>
      </div>
    </div>
  `;

  return await transporter.sendMail({
    from: process.env.SMTP_FROM_EMAIL,
    to: booking.email,
    cc: process.env.ADMIN_EMAIL,
    subject: `Vastra Seva Booking ${type === 'update' ? 'Updated' : 'Cancelled'} - ${booking.deity}`,
    html: emailContent,
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      const updatedBooking = await prisma.vastraSevaBooking.update({
        where: { id: parseInt(id as string, 10) },
        data: req.body,
      });

      // Send update email
      try {
        await sendEmail(updatedBooking, 'update');
      } catch (emailError) {
        console.error('Error sending update email:', emailError);
      }

      return res.status(200).json(updatedBooking);
    } catch (error) {
      console.error('Error updating booking:', error);
      return res.status(500).json({ error: 'Unable to update booking' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      // Get booking details before deletion
      const booking = await prisma.vastraSevaBooking.findUnique({
        where: { id: parseInt(id as string, 10) },
      });

      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      // Delete the booking
      await prisma.vastraSevaBooking.delete({
        where: { id: parseInt(id as string, 10) },
      });

      // Send cancellation email
      try {
        await sendEmail(booking, 'cancel');
      } catch (emailError) {
        console.error('Error sending cancellation email:', emailError);
      }

      return res.status(200).json({ message: 'Booking deleted successfully' });
    } catch (error) {
      console.error('Error deleting booking:', error);
      return res.status(500).json({ error: 'Unable to delete booking' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}