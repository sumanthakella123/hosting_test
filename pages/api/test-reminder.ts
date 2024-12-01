// pages/api/test-reminder.ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../utils/prisma';
import { format } from 'date-fns';
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      // Fetch a few recent confirmed bookings for testing
      const vastraSevaBookings = await prisma.vastraSevaBooking.findMany({
        where: {
          status: 'confirmed'
        },
        take: 2,
        orderBy: {
          date: 'desc'
        }
      });

      const sevaBookings = await prisma.sevaBooking.findMany({
        where: {
          status: 'confirmed'
        },
        take: 2,
        orderBy: {
          serviceDate: 'desc'
        }
      });

      const results = {
        vastraSeva: [],
        seva: []
      };

      // Send test reminders for Vastra Seva bookings
      for (const booking of vastraSevaBookings) {
        try {
          const emailContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #333; text-align: center;">Test Reminder - Upcoming Vastra Seva</h2>
              
              <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <p>Dear ${booking.firstName} ${booking.lastName},</p>
                
                <p>This is a <strong>TEST</strong> reminder about your Vastra Seva service:</p>
                
                <div style="margin: 20px 0; padding: 15px; background-color: #fff; border-radius: 5px;">
                  <p><strong>Deity:</strong> ${booking.deity}</p>
                  <p><strong>Date:</strong> ${format(new Date(booking.date), 'EEEE, MMMM do, yyyy')}</p>
                  ${booking.specialDay ? '<p><strong>Special Day Service</strong></p>' : ''}
                  <p><strong>Booking ID:</strong> ${booking.id}</p>
                </div>

                <p style="color: #666;"><i>This is a test email for the reminder system. You can ignore this message.</i></p>
              </div>
            </div>
          `;

          await transporter.sendMail({
            from: process.env.SMTP_FROM_EMAIL,
            to: booking.email,
            subject: `[TEST] Vastra Seva Reminder - ${format(new Date(booking.date), 'MMM do, yyyy')}`,
            html: emailContent,
          });

          results.vastraSeva.push({
            id: booking.id,
            email: booking.email,
            status: 'sent'
          });
        } catch (error) {
          console.error(`Failed to send test reminder for Vastra Seva booking ${booking.id}:`, error);
          results.vastraSeva.push({
            id: booking.id,
            email: booking.email,
            status: 'failed',
            error: error.message
          });
        }
      }

      // Send test reminders for Seva bookings
      for (const booking of sevaBookings) {
        try {
          const emailContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #333; text-align: center;">Test Reminder - Upcoming Seva Service</h2>
              
              <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <p>Dear ${booking.firstName} ${booking.lastName},</p>
                
                <p>This is a <strong>TEST</strong> reminder about your Seva service:</p>
                
                <div style="margin: 20px 0; padding: 15px; background-color: #fff; border-radius: 5px;">
                  <p><strong>Seva Type:</strong> ${booking.sevaType}</p>
                  <p><strong>Date:</strong> ${format(new Date(booking.serviceDate), 'EEEE, MMMM do, yyyy')}</p>
                  ${booking.timeWindow ? `<p><strong>Time:</strong> ${booking.timeWindow}</p>` : ''}
                  <p><strong>Location:</strong> ${booking.location}</p>
                  <p><strong>Booking ID:</strong> ${booking.id}</p>
                </div>

                <p style="color: #666;"><i>This is a test email for the reminder system. You can ignore this message.</i></p>
              </div>
            </div>
          `;

          await transporter.sendMail({
            from: process.env.SMTP_FROM_EMAIL,
            to: booking.email,
            subject: `[TEST] Seva Service Reminder - ${format(new Date(booking.serviceDate), 'MMM do, yyyy')}`,
            html: emailContent,
          });

          results.seva.push({
            id: booking.id,
            email: booking.email,
            status: 'sent'
          });
        } catch (error) {
          console.error(`Failed to send test reminder for Seva booking ${booking.id}:`, error);
          results.seva.push({
            id: booking.id,
            email: booking.email,
            status: 'failed',
            error: error.message
          });
        }
      }

      res.status(200).json({
        message: 'Test reminders processed',
        results
      });
    } catch (error: any) {
      console.error('Error processing test reminders:', error);
      res.status(500).json({ 
        message: error.message || 'Failed to process test reminders' 
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: `Method ${req.method} not allowed.` });
  }
}