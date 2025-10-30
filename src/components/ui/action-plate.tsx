import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Copy } from "lucide-react"; 
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useActions } from "@/hooks/useActions";

interface ActionPlateProps {
  icon?: string;
  title?: string;
  description?: string;
  className?: string;
  width?: number;
  actionId?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const ActionPlate: React.FC<ActionPlateProps> = ({
  icon,
  title,
  description,
  className,
  width,
  actionId,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showCopiedDialog, setShowCopiedDialog] = useState(false);
  
  const { getActionById } = useActions();
  
  // Use provided props or fetch from actions data
  const actionData = actionId ? getActionById(actionId) : null;
  const finalIcon = icon || actionData?.icon || "https://homer-assets.s3.eu-west-1.amazonaws.com/icons_app/default.png";
  const finalTitle = title || actionData?.title || actionId || "Unknown Action";
  const finalDescription = description || actionData?.description || "No description available";

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (onMouseEnter) onMouseEnter();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (onMouseLeave) onMouseLeave();
  };

  const handleCopyClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the plate's onClick
    
    if (actionId) {
      // Copy to clipboard
      navigator.clipboard.writeText(actionId)
        .then(() => {
          // Show the copied dialog
          setShowCopiedDialog(true);
          // Auto-hide after 2 seconds
          setTimeout(() => setShowCopiedDialog(false), 2000);
        })
        .catch(err => {
          console.error('Failed to copy text: ', err);
        });
    }
  };

  return (
    <>
      <div
        className={cn(
          "relative h-[70px] sm:h-[80px] bg-white rounded-2xl shadow-action-plate",
          "transition-all duration-300 ease-out",
          "hover:shadow-action-plate-hover hover:translate-y-[-2px]",
          "flex items-center p-3 sm:p-4 cursor-pointer",
          "overflow-hidden animate-fade-in",
          "w-full",
          className
        )}
        style={{ 
          height: window.innerWidth <= 640 ? '70px' : '80px'
        }}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Left Icon */}
        <div className="flex-shrink-0 w-[32px] h-[32px] sm:w-[40px] sm:h-[40px] mr-3 sm:mr-4">
          <img
            src={finalIcon}
            alt={`${finalTitle} icon`}
            className="w-full h-full object-contain"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://homer-assets.s3.eu-west-1.amazonaws.com/icons_app/default.png';
            }}
          />
        </div>

        {/* Text content */}
        <div className="flex flex-col justify-center min-w-0 flex-grow">
          <h3 className="text-sm sm:text-base text-black-70 truncate max-w-[calc(100%-80px)] sm:max-w-[calc(100%-96px)]">
            {finalTitle}
          </h3>
          <p className="text-xs sm:text-sm text-black-60 mt-1 line-clamp-2 max-w-[calc(100%-80px)] sm:max-w-[calc(100%-96px)]">
            {finalDescription}
          </p>
        </div>

        {/* Right copy icon - visible on hover */}
        {actionId && isHovered && (
          <div 
            className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer"
            onClick={handleCopyClick}
          >
            <div className="relative flex items-center justify-center">
              <Copy className="w-[24px] h-[24px] text-primary z-10" />
            </div>
          </div>
        )}
      </div>

      {/* Copied Dialog with no close button and thin text */}
      <Dialog open={showCopiedDialog} onOpenChange={setShowCopiedDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center font-light">Copied</DialogTitle>
          </DialogHeader>
          <div className="text-center">
            <p className="text-2xl font-light mt-2">{actionId}</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ActionPlate;