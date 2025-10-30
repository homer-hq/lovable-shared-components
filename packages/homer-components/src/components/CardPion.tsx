import { Card, CardContent } from "@/components/ui/card";
import { type Card as CardType, homerAPI } from "@/lib/homer-api";
import { useEffect, useState } from "react";

interface CardPionProps {
  card?: CardType;
  cardId?: string;
  homeId?: string;
  onCardClick: (cardId: string) => void;
}

export const CardPion = ({ card, cardId, homeId, onCardClick }: CardPionProps) => {
  const [cardData, setCardData] = useState<CardType | null>(card || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If we have a card prop, use it directly
    if (card) {
      setCardData(card);
      return;
    }

    // If we have cardId, fetch the card data using simple API
    if (cardId) {
      console.log('Fetching card for cardId:', cardId);
      setIsLoading(true);
      setError(null);
      
      homerAPI.getCard(cardId)
        .then((fetchedCard) => {
          console.log('Fetched card result:', fetchedCard);
          if (fetchedCard) {
            // Convert simple card to CardType format
            setCardData({
              ...fetchedCard,
              home: homeId || '',
              read: true,
              unreadPions: 0,
              updatedAt: new Date().toISOString(),
              createdAt: new Date().toISOString(),
              pions: [],
              actionPionsCount: 0,
              tags: []
            });
          } else {
            setError('Card not found');
          }
        })
        .catch((error) => {
          console.error('Error fetching card details:', error);
          setError('Failed to load card');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [card, cardId, homeId]);

  const handleClick = () => {
    const targetCardId = cardData?.id || cardId;
    if (targetCardId) {
      onCardClick(targetCardId);
    }
  };

  if (isLoading) {
    return (
      <Card className="cursor-pointer">
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-1">
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !cardData) {
    return (
      <Card className="cursor-pointer opacity-50">
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center flex-shrink-0">
              <span className="text-muted-foreground text-xs">❌</span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium">{cardId ? `Card ${cardId.slice(0, 8)}...` : 'Unknown Card'}</h4>
              <p className="text-xs text-muted-foreground">{error || 'Card not found'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleClick}
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
           {/* Square Thumbnail */}
           <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
             {(() => {
               // Try headerImage first, then fall back to image
               const img = cardData.headerImage ?? cardData.image;
               const imageUrl = img?.mediumUrl || img?.smallUrl || img?.tinyUrl;
               
               return imageUrl ? (
                 <img
                   src={imageUrl}
                   alt={cardData.title}
                   className="w-full h-full object-cover"
                 />
               ) : (
                 <div className="w-full h-full flex items-center justify-center bg-muted">
                   <span className="text-muted-foreground text-xs">📄</span>
                 </div>
               );
             })()}
           </div>
          
          {/* Title inline */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium line-clamp-2 leading-tight">
              {cardData.title || "Untitled Card"}
            </h4>
            {cardData.subtitle && (
              <p className="text-xs text-muted-foreground line-clamp-1">
                {cardData.subtitle}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};