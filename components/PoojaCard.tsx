import React from 'react';

interface PoojaCardProps {
  name: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}

const PoojaCard: React.FC<PoojaCardProps> = ({ name, description, selected, onSelect }) => {
  return (
    <div
      className={`cursor-pointer border p-4 text-center ${
        selected ? 'bg-primary text-secondary' : ''
      }`}
      onClick={onSelect}
    >
      <h2 className="text-xl">{name}</h2>
      <p>{description}</p>
    </div>
  );
};

export default PoojaCard;
