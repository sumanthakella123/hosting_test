// types/booking.ts
export interface BookingDetails {
    pooja: string;
    poojaDetails?: string;
    firstName: string;
    lastName: string;
    email: string;
    contact: string;
    gotram?: string;
    requests?: string;
    location: string;
    priestPreference: string;
    muhuratRequired: boolean;
    namesAndNakshatras?: string;
    serviceDate: string;
    timeWindow?: string;
    venueAddress?: string;
  }

  export interface VastraSevaBookingDetails {
    deity: string;
    dates: string[];
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    gotram?: string;
    requests?: string;
    specialDates: Date[];
    totalAmount: number;
  }