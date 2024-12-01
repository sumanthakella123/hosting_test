// pages/api/seva-bookings/[id].ts
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

const sendCancellationEmail = async (booking: any) => {
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
      <h2 style="color: #333; text-align: center;">Seva Booking Cancellation</h2>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #444;">Booking Details:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0;"><strong>Seva Type:</strong></td>
            <td>${booking.sevaType}</td>
          </tr>
          ${booking.poojaDetails ? `
          <tr>
            <td style="padding: 8px 0;"><strong>Pooja Details:</strong></td>
            <td>${booking.poojaDetails}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 8px 0;"><strong>Service Date:</strong></td>
            <td>${formatDate(booking.serviceDate)}</td>
          </tr>
          ${booking.timeWindow ? `
          <tr>
            <td style="padding: 8px 0;"><strong>Preferred Time:</strong></td>
            <td>${booking.timeWindow}</td>
          </tr>
          ` : ''}
        </table>

        <h3 style="color: #444; margin-top: 20px;">Personal Information:</h3>
        <table style="width: 100%; border-collapse: collapse;">
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
          ${booking.gotram ? `
          <tr>
            <td style="padding: 8px 0;"><strong>Gotram:</strong></td>
            <td>${booking.gotram}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 8px 0;"><strong>Location:</strong></td>
            <td>${booking.location}</td>
          </tr>
          ${booking.venueAddress ? `
          <tr>
            <td style="padding: 8px 0;"><strong>Venue Address:</strong></td>
            <td>${booking.venueAddress}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 8px 0;"><strong>Priest Preference:</strong></td>
            <td>${booking.priestPreference}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Muhurat Required:</strong></td>
            <td>${booking.muhuratRequired ? 'Yes' : 'No'}</td>
          </tr>
        </table>

        ${booking.requests ? `
        <h3 style="color: #444; margin-top: 20px;">Additional Requests:</h3>
        <p style="margin: 0;">${booking.requests}</p>
        ` : ''}
      </div>
      
      <div style="background-color: #fff3e0; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="color: #666; margin: 0;">
          Your seva booking has been cancelled. If you believe this cancellation was made in error or if you have any questions,
          please contact us immediately at ${process.env.ADMIN_EMAIL}
        </p>
      </div>
      
      <p style="color: #666; text-align: center; margin-top: 20px;">
        Thank you for your understanding. We hope to serve you again in the future.
      </p>
    </div>
  `;

  return await transporter.sendMail({
    from: process.env.SMTP_FROM_EMAIL,
    to: booking.email,
    cc: process.env.ADMIN_EMAIL,
    subject: `Seva Booking Cancellation - ${booking.sevaType}`,
    html: emailContent,
    text: `
Seva Booking Cancellation

Booking Details:
Seva Type: ${booking.sevaType}
${booking.poojaDetails ? `Pooja Details: ${booking.poojaDetails}\n` : ''}
Service Date: ${formatDate(booking.serviceDate)}
${booking.timeWindow ? `Preferred Time: ${booking.timeWindow}\n` : ''}

Personal Information:
Name: ${booking.firstName} ${booking.lastName}
Email: ${booking.email}
Phone: ${booking.phone}
${booking.gotram ? `Gotram: ${booking.gotram}\n` : ''}
Location: ${booking.location}
${booking.venueAddress ? `Venue Address: ${booking.venueAddress}\n` : ''}
Priest Preference: ${booking.priestPreference}
Muhurat Required: ${booking.muhuratRequired ? 'Yes' : 'No'}

${booking.requests ? `Additional Requests:\n${booking.requests}\n\n` : ''}

Your seva booking has been cancelled. If you believe this cancellation was made in error or if you have any questions,
please contact us immediately at ${process.env.ADMIN_EMAIL}

Thank you for your understanding. We hope to serve you again in the future.
    `,
  });
};

const sendUpdateEmail = async (booking: any) => {
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
      <h2 style="color: #333; text-align: center;">Seva Booking Updated</h2>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #444;">Updated Booking Details:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0;"><strong>Seva Type:</strong></td>
            <td>${booking.sevaType}</td>
          </tr>
          ${booking.poojaDetails ? `
          <tr>
            <td style="padding: 8px 0;"><strong>Pooja Details:</strong></td>
            <td>${booking.poojaDetails}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 8px 0;"><strong>Service Date:</strong></td>
            <td>${formatDate(booking.serviceDate)}</td>
          </tr>
          ${booking.timeWindow ? `
          <tr>
            <td style="padding: 8px 0;"><strong>Preferred Time:</strong></td>
            <td>${booking.timeWindow}</td>
          </tr>
          ` : ''}
        </table>

        <h3 style="color: #444; margin-top: 20px;">Personal Information:</h3>
        <table style="width: 100%; border-collapse: collapse;">
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
          ${booking.gotram ? `
          <tr>
            <td style="padding: 8px 0;"><strong>Gotram:</strong></td>
            <td>${booking.gotram}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 8px 0;"><strong>Location:</strong></td>
            <td>${booking.location}</td>
          </tr>
          ${booking.venueAddress ? `
          <tr>
            <td style="padding: 8px 0;"><strong>Venue Address:</strong></td>
            <td>${booking.venueAddress}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 8px 0;"><strong>Priest Preference:</strong></td>
            <td>${booking.priestPreference}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Muhurat Required:</strong></td>
            <td>${booking.muhuratRequired ? 'Yes' : 'No'}</td>
          </tr>
        </table>

        ${booking.requests ? `
        <h3 style="color: #444; margin-top: 20px;">Additional Requests:</h3>
        <p style="margin: 0;">${booking.requests}</p>
        ` : ''}
      </div>
      
      <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="color: #666; margin: 0;">
          Your seva booking has been updated with the details shown above. If you have any questions about these changes,
          please contact us at ${process.env.ADMIN_EMAIL}
        </p>
      </div>
      
      <p style="color: #666; text-align: center; margin-top: 20px;">
        Thank you for choosing our services.
      </p>
    </div>
  `;

  return await transporter.sendMail({
    from: process.env.SMTP_FROM_EMAIL,
    to: booking.email,
    cc: process.env.ADMIN_EMAIL,
    subject: `Seva Booking Updated - ${booking.sevaType}`,
    html: emailContent,
    text: `
Seva Booking Updated

Updated Booking Details:
Seva Type: ${booking.sevaType}
${booking.poojaDetails ? `Pooja Details: ${booking.poojaDetails}\n` : ''}
Service Date: ${formatDate(booking.serviceDate)}
${booking.timeWindow ? `Preferred Time: ${booking.timeWindow}\n` : ''}

Personal Information:
Name: ${booking.firstName} ${booking.lastName}
Email: ${booking.email}
Phone: ${booking.phone}
${booking.gotram ? `Gotram: ${booking.gotram}\n` : ''}
Location: ${booking.location}
${booking.venueAddress ? `Venue Address: ${booking.venueAddress}\n` : ''}
Priest Preference: ${booking.priestPreference}
Muhurat Required: ${booking.muhuratRequired ? 'Yes' : 'No'}

${booking.requests ? `Additional Requests:\n${booking.requests}\n\n` : ''}

Your seva booking has been updated with the details shown above. If you have any questions about these changes,
please contact us at ${process.env.ADMIN_EMAIL}

Thank you for choosing our services.
    `,
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const bookingId = parseInt(id as string);

  if (isNaN(bookingId)) {
    return res.status(400).json({ error: 'Invalid booking ID' });
  }

  switch (req.method) {
    case 'PUT':
      try {
        const {
          sevaType,
          poojaDetails,
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

        const updatedBooking = await prisma.sevaBooking.update({
          where: { id: bookingId },
          data: {
            sevaType,
            poojaDetails,
            amount: parseFloat(amount),
            firstName,
            lastName,
            email,
            phone,
            gotram,
            requests,
            location,
            priestPreference,
            muhuratRequired: Boolean(muhuratRequired),
            namesAndNakshatras,
            serviceDate: new Date(serviceDate),
            timeWindow,
            venueAddress,
            updatedAt: new Date(),
          },
        });

        // Send update notification email
        try {
          await sendUpdateEmail(updatedBooking);
        } catch (emailError) {
          console.error('Error sending update email:', emailError);
          // Continue with success response since update was successful
        }

        return res.status(200).json(updatedBooking);
      } catch (error) {
        console.error('Error updating booking:', error);
        return res.status(500).json({ error: 'Failed to update booking' });
      }

    case 'DELETE':
      try {
        // First, get the booking details before deletion
        const booking = await prisma.sevaBooking.findUnique({
          where: { id: bookingId },
        });

        if (!booking) {
          return res.status(404).json({ error: 'Booking not found' });
        }

        // Delete the booking
        await prisma.sevaBooking.delete({
          where: { id: bookingId },
        });

        // Send cancellation email
        try {
          await sendCancellationEmail(booking);
        } catch (emailError) {
          console.error('Error sending cancellation email:', emailError);
          // Continue with success response since booking was deleted
        }

        return res.status(200).json({ 
          message: 'Booking deleted successfully and cancellation notification sent' 
        });
      } catch (error) {
        console.error('Error deleting booking:', error);
        return res.status(500).json({ error: 'Failed to delete booking' });
      }

    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}