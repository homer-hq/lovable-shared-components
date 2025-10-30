import { Link, Video } from "lucide-react";
import { Pion, DetailedPion } from "@/lib/homer-api";

interface GenericPionRendererProps {
  pion: Pion | DetailedPion;
}

export const GenericPionRenderer = ({ pion }: GenericPionRendererProps) => {
  const anyPion = pion as any;

  switch (pion.type) {
    case 'url':
    case 'youtube':
      return (
        <div className="space-y-1">
          <a 
            href={anyPion.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline block truncate flex items-center gap-2"
          >
            {pion.type === 'youtube' ? <Video className="h-4 w-4" /> : <Link className="h-4 w-4" />}
            {anyPion.url}
          </a>
        </div>
      );
    default:
      return <p className="text-muted-foreground">No preview available</p>;
  }
};
