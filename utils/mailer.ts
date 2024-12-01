// utils/mailer.ts
import nodemailer from 'nodemailer';
import { BookingDetails } from '../types/booking';
import { generateBookingQR } from './qrGenerator';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendBookingConfirmation = async (bookingDetails: BookingDetails) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Generate QR code
  const qrCodeDataUrl = await generateBookingQR(bookingDetails);

  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333; text-align: center;">Seva Booking Confirmation</h2>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #444;">Booking Details:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0;"><strong>Seva Type:</strong></td>
            <td>${bookingDetails.pooja}</td>
          </tr>
          ${bookingDetails.poojaDetails ? `
          <tr>
            <td style="padding: 8px 0;"><strong>Pooja Details:</strong></td>
            <td>${bookingDetails.poojaDetails}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 8px 0;"><strong>Service Date:</strong></td>
            <td>${formatDate(bookingDetails.serviceDate)}</td>
          </tr>
          ${bookingDetails.timeWindow ? `
          <tr>
            <td style="padding: 8px 0;"><strong>Preferred Time:</strong></td>
            <td>${bookingDetails.timeWindow}</td>
          </tr>
          ` : ''}
        </table>

        <h3 style="color: #444; margin-top: 20px;">Personal Information:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0;"><strong>Name:</strong></td>
            <td>${bookingDetails.firstName} ${bookingDetails.lastName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Email:</strong></td>
            <td>${bookingDetails.email}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Phone:</strong></td>
            <td>${bookingDetails.contact}</td>
          </tr>
          ${bookingDetails.gotram ? `
          <tr>
            <td style="padding: 8px 0;"><strong>Gotram:</strong></td>
            <td>${bookingDetails.gotram}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 8px 0;"><strong>Location:</strong></td>
            <td>${bookingDetails.location}</td>
          </tr>
          ${bookingDetails.venueAddress ? `
          <tr>
            <td style="padding: 8px 0;"><strong>Venue Address:</strong></td>
            <td>${bookingDetails.venueAddress}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 8px 0;"><strong>Priest Preference:</strong></td>
            <td>${bookingDetails.priestPreference}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Muhurat Required:</strong></td>
            <td>${bookingDetails.muhuratRequired ? 'Yes' : 'No'}</td>
          </tr>
        </table>

        ${bookingDetails.requests ? `
        <h3 style="color: #444; margin-top: 20px;">Additional Requests:</h3>
        <p style="margin: 0;">${bookingDetails.requests}</p>
        ` : ''}
      </div>
      
      <p style="color: #666; text-align: center; margin-top: 20px;">
        If you have any questions about your booking, please contact us at ${process.env.ADMIN_EMAIL}
      </p>
    </div>
  `;

  // Also attach the QR code as a separate file
  const attachments = [{
    filename: 'booking-qr.png',
    content: qrCodeDataUrl.split(';base64,').pop(),
    encoding: 'base64',
  }];

  return await transporter.sendMail({
    from: process.env.SMTP_FROM_EMAIL,
    to: bookingDetails.email,
    cc: process.env.ADMIN_EMAIL,
    subject: `Seva Booking Confirmation - ${bookingDetails.pooja}`,
    html: emailContent,
    attachments,
  });
};