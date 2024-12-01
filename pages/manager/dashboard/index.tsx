// pages/manager/dashboard/index.tsx
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import DashboardLayout from '../../../components/DashboardLayout';
import DashboardCalendar from '../../../components/DashboardCalendar';
import prisma from '../../../utils/prisma';
import { startOfMonth, endOfMonth } from 'date-fns';

// Type definitions for our booking data
type BookingData = {
  date: string;
  bookings: {
    vastraSeva: number;
    seva: number;
    aiBooking: number;
  };
};

type DashboardHomeProps = {
  initialBookings: BookingData[];
};

export default function DashboardHome({ initialBookings }: DashboardHomeProps) {
  return (
    <DashboardLayout>
      <h1 className="text-2xl font-semibold mb-6">Welcome to the Manager Dashboard</h1>
      <div className="mb-8">
        <DashboardCalendar initialBookings={initialBookings} />
      </div>
    </DashboardLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session || !session.user) {
    return {
      redirect: {
        destination: '/manager/login',
        permanent: false,
      },
    };
  }

  try {
    // Get current month's date range
    const today = new Date();
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);

    // Fetch all types of bookings for the current month
    const [vastraSevaBookings, sevaBookings, aiBookings] = await Promise.all([
      prisma.vastraSevaBooking.groupBy({
        by: ['date'],
        _count: {
          id: true,
        },
        where: {
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      }),
      prisma.sevaBooking.groupBy({
        by: ['date'],
        _count: {
          id: true,
        },
        where: {
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      }),
      prisma.aI_Booking.groupBy({
        by: ['createdAt'],
        _count: {
          id: true,
        },
        where: {
          createdAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      }),
    ]);

    // Create a map to store all bookings by date
    const bookingsByDate = new Map();

    // Helper function to initialize booking counts for a date
    const getInitialBookingCounts = () => ({
      vastraSeva: 0,
      seva: 0,
      aiBooking: 0,
    });

    // Process Vastra Seva bookings
    vastraSevaBookings.forEach((booking) => {
      const dateStr = booking.date.toISOString().split('T')[0];
      if (!bookingsByDate.has(dateStr)) {
        bookingsByDate.set(dateStr, getInitialBookingCounts());
      }
      bookingsByDate.get(dateStr).vastraSeva = booking._count.id;
    });

    // Process Seva bookings
    sevaBookings.forEach((booking) => {
      const dateStr = booking.date.toISOString().split('T')[0];
      if (!bookingsByDate.has(dateStr)) {
        bookingsByDate.set(dateStr, getInitialBookingCounts());
      }
      bookingsByDate.get(dateStr).seva = booking._count.id;
    });

    // Process AI bookings
    aiBookings.forEach((booking) => {
      const dateStr = booking.createdAt.toISOString().split('T')[0];
      if (!bookingsByDate.has(dateStr)) {
        bookingsByDate.set(dateStr, getInitialBookingCounts());
      }
      bookingsByDate.get(dateStr).aiBooking = booking._count.id;
    });

    // Convert map to array for serialization
    const initialBookings = Array.from(bookingsByDate.entries()).map(([date, bookings]) => ({
      date,
      bookings,
    }));

    return {
      props: {
        initialBookings,
      },
    };
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return {
      props: {
        initialBookings: [],
      },
    };
  }
};