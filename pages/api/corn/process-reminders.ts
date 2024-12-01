// pages/api/cron/process-reminders.ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../utils/prisma';
import { format, startOfDay, endOfDay } from 'date-fns';
import nodemailer from 'nodemailer';

// Verify the request is authorized
const validateRequest = (req: NextApiRequest) => {
  const authHeader = req.headers.authorization;
  return authHeader === `Bearer ${process.env.CRON_SECRET_KEY}`;
};

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

async function sendVastraSevaReminder(booking: any) {
  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333; text-align: center;">Upcoming Vastra Seva Reminder</h2>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <p>Dear ${booking.firstName} ${booking.lastName},</p>
        
        <p>This is a reminder about your upcoming Vastra Seva service:</p>
        
        <div style="margin: 20px 0; padding: 15px; background-color: #fff; border-radius: 5px;">
          <p><strong>Deity:</strong> ${booking.deity}</p>
          <p><strong>Date:</strong> ${format(new Date(booking.date), 'EEEE, MMMM do, yyyy')}</p>
          ${booking.specialDay ? '<p><strong>Special Day Service</strong></p>' : ''}
        </div>

        <p>Please ensure you have made the necessary arrangements for the service.</p>
      </div>
      
      <p style="color: #666; text-align: center; margin-top: 20px;">
        If you have any questions, please contact us at ${process.env.ADMIN_EMAIL}
      </p>
    </div>
  `;

  return await transporter.sendMail({
    from: process.env.SMTP_FROM_EMAIL,
    to: booking.email,
    subject: `Reminder: Upcoming Vastra Seva Service - ${format(new Date(booking.date), 'MMM do, yyyy')}`,
    html: emailContent,
  });
}

async function sendSevaReminder(booking: any) {
  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333; text-align: center;">Upcoming Seva Service Reminder</h2>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <p>Dear ${booking.firstName} ${booking.lastName},</p>
        
        <p>This is a reminder about your upcoming Seva service:</p>
        
        <div style="margin: 20px 0; padding: 15px; background-color: #fff; border-radius: 5px;">
          <p><strong>Seva Type:</strong> ${booking.sevaType}</p>
          <p><strong>Date:</strong> ${format(new Date(booking.serviceDate), 'EEEE, MMMM do, yyyy')}</p>
          ${booking.timeWindow ? `<p><strong>Time:</strong> ${booking.timeWindow}</p>` : ''}
          <p><strong>Location:</strong> ${booking.location}</p>
          ${booking.venueAddress ? `<p><strong>Venue Address:</strong> ${booking.venueAddress}</p>` : ''}
        </div>

        <p>Please ensure you have made the necessary arrangements for the service.</p>
      </div>
      
      <p style="color: #666; text-align: center; margin-top: 20px;">
        If you have any questions, please contact us at ${process.env.ADMIN_EMAIL}
      </p>
    </div>
  `;

  return await transporter.sendMail({
    from: process.env.SMTP_FROM_EMAIL,
    to: booking.email,
    subject: `Reminder: Upcoming Seva Service - ${format(new Date(booking.serviceDate), 'MMM do, yyyy')}`,
    html: emailContent,
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Verify request is from authorized source
  if (!validateRequest(req)) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get Vastra Seva bookings for tomorrow
      const vastraSevaBookings = await prisma.vastraSevaBooking.findMany({
        where: {
          date: {
            gte: startOfDay(tomorrow),
            lt: endOfDay(tomorrow)
          },
          status: 'confirmed'
        }
      });

      // Get Seva bookings for tomorrow
      const sevaBookings = await prisma.sevaBooking.findMany({
        where: {
          serviceDate: {
            gte: startOfDay(tomorrow),
            lt: endOfDay(tomorrow)
          },
          status: 'confirmed'
        }
      });

      const results = {
        vastraSeva: [],
        seva: []
      };

      // Send reminders for Vastra Seva bookings
      for (const booking of vastraSevaBookings) {
        try {
          await sendVastraSevaReminder(booking);
          results.vastraSeva.push({
            id: booking.id,
            email: booking.email,
            status: 'sent'
          });
        } catch (error) {
          console.error(`Failed to send reminder for Vastra Seva booking ${booking.id}:`, error);
          results.vastraSeva.push({
            id: booking.id,
            email: booking.email,
            status: 'failed',
            error: error.message
          });
        }
      }

      // Send reminders for Seva bookings
      for (const booking of sevaBookings) {
        try {
          await sendSevaReminder(booking);
          results.seva.push({
            id: booking.id,
            email: booking.email,
            status: 'sent'
          });
        } catch (error) {
          console.error(`Failed to send reminder for Seva booking ${booking.id}:`, error);
          results.seva.push({
            id: booking.id,
            email: booking.email,
            status: 'failed',
            error: error.message
          });
        }
      }

      res.status(200).json({
        message: 'Reminders processed successfully',
        results
      });
    } catch (error: any) {
      console.error('Error processing reminders:', error);
      res.status(500).json({ 
        message: error.message || 'Failed to process reminders' 
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: `Method ${req.method} not allowed.` });
  }
}