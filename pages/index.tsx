import Link from 'next/link';

export default function Home() {
  return (
    <div className="text-center">
      <div className="mt-8">
        <Link href="/vastra-seva">
          <div className="text-2xl text-orange-500 underline cursor-pointer mb-4">
            Vastra Seva Booking
          </div>
        </Link>
        <Link href="/seva-booking">
          <div className="text-2xl text-orange-500 underline cursor-pointer mb-4">
            Seva Booking
          </div>
        </Link>
        <Link href="/manager/login">
          <div className="text-2xl text-orange-500 underline cursor-pointer">
            Manager Dashboard
          </div>
        </Link>
      </div>
    </div>
  );
}
