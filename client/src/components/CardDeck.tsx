import Card from './Card';
import { CardValue } from '../types';

interface CardDeckProps {
  deck: CardValue[];
  selectedCard: CardValue | null;
  onSelectCard: (value: CardValue) => void;
  disabled?: boolean;
  deckType?: 'FIBONACCI' | 'TSHIRT';
}

export default function CardDeck({
  deck,
  selectedCard,
  onSelectCard,
  disabled = false,
  deckType = 'FIBONACCI',
}: CardDeckProps) {
  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
      <h3 className="text-sm font-medium text-slate-400 mb-4 text-center">
        Select your estimate
      </h3>
      <div className="flex flex-wrap justify-center gap-3">
        {deck.map((value) => (
          <Card
            key={String(value)}
            value={value}
            isSelected={selectedCard === value}
            onClick={() => onSelectCard(value)}
            isDisabled={disabled}
            deckType={deckType}
            size="md"
          />
        ))}
      </div>
    </div>
  );
}
