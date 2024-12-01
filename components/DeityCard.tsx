interface DeityCardProps {
  name: string;
  onSelect: () => void;
}

const DeityCard: React.FC<DeityCardProps> = ({ name, onSelect }) => {
  return (
    <div
      onClick={onSelect}
      className="bg-white rounded-lg border-2 border-gray-200 shadow-md hover:shadow-lg hover:border-orange-500 transition-all duration-300 cursor-pointer"
    >
      <div className="p-4">
        <h3 className="text-lg font-semibold text-center text-gray-800">
          {name}
        </h3>
      </div>
    </div>
  );
};

export default DeityCard;