import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import DashboardLayout from '../../../components/DashboardLayout';
import Link from 'next/link';
import { Calendar, BookOpen } from 'lucide-react';

function VastraSevaDashboard() {
  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">Vastra Seva Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your bookings and calendar efficiently</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link href="/manager/dashboard/vastra-seva/view-bookings">
            <div className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="p-6 h-64 flex flex-col items-center justify-center space-y-4 border-b-4 border-blue-500 hover:border-blue-600 transition-colors">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <BookOpen className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">View Bookings</h2>
                <p className="text-gray-600 text-center">
                  Access and manage all your Vastra Seva bookings in one place
                </p>
                <span className="inline-flex items-center text-blue-600 group-hover:text-blue-700">
                  View Details
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>

          <Link href="/manager/dashboard/vastra-seva/manager-calendar">
            <div className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="p-6 h-64 flex flex-col items-center justify-center space-y-4 border-b-4 border-purple-500 hover:border-purple-600 transition-colors">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <Calendar className="w-8 h-8 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Manage Calendar</h2>
                <p className="text-gray-600 text-center">
                  Schedule and organize your availability and appointments
                </p>
                <span className="inline-flex items-center text-purple-600 group-hover:text-purple-700">
                  Open Calendar
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>
        </div>
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

  return {
    props: {},
  };
};

export default VastraSevaDashboard;