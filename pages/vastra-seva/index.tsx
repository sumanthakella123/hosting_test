import { useRouter } from 'next/router';
import DeityCard from '../../components/DeityCard';

const deities = [
  { name: 'Siva' },
  { name: 'Parvathi' },
  { name: 'Lakshmi Narayana' },
  { name: 'Ganapathi' },
  { name: 'Subrahmanya' },
  { name: 'Ram Parivar' },
];

export default function DeitySelection() {
  const router = useRouter();

  const selectDeity = (deityName: string) => {
    router.push(`/vastra-seva/calendar?deity=${encodeURIComponent(deityName)}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="border-2 border-orange-500 rounded-lg shadow-lg p-6 bg-white">
        {/* Header Section with decorative elements */}
        <div className="text-center mb-8">
          <div className="bg-orange-50 py-4 rounded-lg border border-orange-200 shadow-sm mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Albany Hindu Temple
            </h1>
            <div className="w-32 h-1 bg-orange-500 mx-auto mb-2"></div>
            <h2 className="text-2xl font-semibold text-orange-600">
              Vastra Seva
            </h2>
          </div>
          
          <div className="inline-block bg-orange-100 px-6 py-2 rounded-full shadow-sm">
            <p className="text-orange-800 font-medium">Please Select a Deity</p>
          </div>
        </div>
        
        {/* Deity Selection Grid - Always 2 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {deities.map((deity) => (
            <DeityCard
              key={deity.name}
              name={deity.name}
              onSelect={() => selectDeity(deity.name)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}