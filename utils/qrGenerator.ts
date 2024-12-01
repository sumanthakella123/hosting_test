// utils/qrGenerator.ts
import QRCode from 'qrcode';
import { BookingDetails } from '../types/booking';

export const generateBookingQR = async (bookingDetails: BookingDetails): Promise<string> => {
  // Create a simplified version of booking details for the QR code
  const qrData = {
    sevaType: bookingDetails.pooja,
    name: `${bookingDetails.firstName} ${bookingDetails.lastName}`,
    date: new Date(bookingDetails.serviceDate).toLocaleDateString(),
    time: bookingDetails.timeWindow || 'N/A',
    location: bookingDetails.location,
  };

  // Generate QR code as base64 data URL
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};