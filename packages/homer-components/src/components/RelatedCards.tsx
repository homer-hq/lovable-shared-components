import { type Card as CardType } from "@/lib/homer-api";
import { CardPion } from "./CardPion";

interface RelatedCardsProps {
  currentCard: CardType;
  allCards: CardType[];
  onCardClick: (cardId: string) => void;
  maxCards?: number;
}

export const RelatedCards = ({ 
  currentCard, 
  allCards, 
  onCardClick, 
  maxCards = 6 
}: RelatedCardsProps) => {
  // Get related cards by finding cards that share at least one tag with current card
  const getRelatedCards = (): CardType[] => {
    if (!currentCard.tags || currentCard.tags.length === 0) {
      return [];
    }
    
    return allCards
      .filter(card => 
        card.id !== currentCard.id && // Exclude current card
        card.tags?.some(tag => 
          currentCard.tags?.some(currentTag => currentTag.id === tag.id)
        )
      )
      .slice(0, maxCards); // Limit to maxCards
  };

  const relatedCards = getRelatedCards();

  if (relatedCards.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        Related Cards ({relatedCards.length})
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {relatedCards.map((card) => (
          <CardPion
            key={card.id}
            card={card}
            onCardClick={onCardClick}
          />
        ))}
      </div>
    </div>
  );
};