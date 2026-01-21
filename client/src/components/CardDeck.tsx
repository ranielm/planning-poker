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
    <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent z-40 transition-transform duration-300">
      <div className="max-w-[1600px] mx-auto">
        <h3 className="sr-only">Select your estimate</h3>
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 md:gap-6">
          {deck.map((value) => (
            <Card
              key={String(value)}
              value={value}
              isSelected={selectedCard === value}
              onClick={() => onSelectCard(value)}
              isDisabled={disabled}
              deckType={deckType}
              size="lg"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
