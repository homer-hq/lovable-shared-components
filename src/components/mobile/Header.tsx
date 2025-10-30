import React from 'react';
import { Search, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import avatarIcon from '@/assets/avatar-free.png';
import homeinfoIcon from '@/assets/avatar-home-free.png';
import collapseIcon from '@/assets/collapse-grey.png';

interface HeaderProps {
  homeName: string;
  homeImageUrl?: string;
  partnerLogoUrl?: string;
  display: {
    avatars: boolean;
    homeInfo: boolean;
    userSettings: boolean;
    expandCollapse: boolean;
    ellipsis: boolean;
    searchAsk: boolean;
    search: boolean | undefined;
    ask: boolean | undefined;
    navDots: boolean;
  };
  navDotCount?: number;
  activeNavDot?: number;
}

export const Header: React.FC<HeaderProps> = ({
  homeName,
  homeImageUrl,
  partnerLogoUrl,
  display,
  navDotCount = 3,
  activeNavDot = 0,
}) => {
  return (
    <div className="relative h-[320px] overflow-hidden">
      {/* Background home image */}
      <div className="absolute inset-0">
        {homeImageUrl ? (
          <img
            src={homeImageUrl}
            alt="Home"
            className="w-full h-full object-fill"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-primary/20 to-primary/5" />
        )}
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-transparent" />
      </div>

      {/* Partner logo overlay - positioned at bottom */}
      {partnerLogoUrl && (
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <img
            src={partnerLogoUrl}
            alt="Partner"
            className="w-full h-auto"
          />
        </div>
      )}

      {/* Overlay content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Top icons row */}
        <div className="flex justify-between items-center p-4">
          <div className="flex gap-2">
            {display.avatars && display.userSettings && (
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 rounded-full bg-[#BFBFBF] hover:bg-[#AFAFAF] border-0 p-0"
              >
                <img 
                  src={avatarIcon} 
                  alt="User settings" 
                  className="w-10 h-10"
                />
              </Button>
            )}
            {display.homeInfo && (
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 rounded-full bg-[#BFBFBF] hover:bg-[#AFAFAF] border-0 p-0"
              >
                <img 
                  src={homeinfoIcon} 
                  alt="Home info" 
                  className="w-10 h-10"
                />
              </Button>
            )}
            {display.expandCollapse && (
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 rounded-full bg-[#BFBFBF] hover:bg-[#AFAFAF] border-0 p-0"
              >
                <img 
                  src={collapseIcon} 
                  alt="Expand" 
                  className="w-6 h-6"
                />
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {display.ellipsis && (
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 rounded-full bg-[#BFBFBF] hover:bg-[#AFAFAF] border-0 flex items-center justify-center gap-1"
              >
                <div className="w-1 h-1 rounded-full bg-white" />
                <div className="w-1 h-1 rounded-full bg-white" />
                <div className="w-1 h-1 rounded-full bg-white" />
              </Button>
            )}
          </div>
        </div>

        {/* Home name */}
        <div className="px-6 pt-2 pb-3">
          <h1 className="text-4xl font-bold text-white drop-shadow-lg">
            {homeName}
          </h1>
        </div>

        {/* Search/Ask bar */}
        {(((display.search ?? display.searchAsk) || (display.ask ?? display.searchAsk))) && (
          <div className="px-4 pb-4">
            <div className="flex gap-2">
              {/* Show search if searchAsk is true unless search is explicitly false */}
              {(display.search ?? display.searchAsk) && (
                <Button
                  variant="secondary"
                  className="flex-1 justify-start gap-2 bg-white/50 backdrop-blur-sm hover:bg-white/60 text-white border border-white"
                >
                  <Search className="w-4 h-4" />
                  <span className="text-sm">Search...</span>
                </Button>
              )}
              {/* Show ask if searchAsk is true unless ask is explicitly false */}
              {(display.ask ?? display.searchAsk) && (
                <Button
                  variant="secondary"
                  className="flex-1 justify-start gap-2 bg-white/50 backdrop-blur-sm hover:bg-white/60 text-white border border-white"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span className="text-sm">Get help</span>
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Nav dots */}
        {display.navDots && navDotCount > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {Array.from({ length: navDotCount }).map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all ${
                  index === activeNavDot
                    ? 'w-6 bg-white'
                    : 'w-1.5 bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
