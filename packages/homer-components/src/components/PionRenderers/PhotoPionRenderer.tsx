import { DetailedPion, Pion } from "@/lib/homer-api";

interface PhotoPionRendererProps {
  pion: Pion | DetailedPion;
  detailed?: boolean;
}

export const PhotoPionRenderer = ({ pion, detailed = false }: PhotoPionRendererProps) => {
  const photoPion = pion as any;

  if (!detailed && photoPion.photos) {
    return (
      <div className="space-y-2">
        {photoPion.photos.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {photoPion.photos.slice(0, 2).map((photo: any) => (
              <img
                key={photo.id}
                src={photo.smallUrl || photo.url}
                alt={photo.caption || pion.title || 'Photo'}
                className="rounded-lg w-full h-24 object-cover"
              />
            ))}
          </div>
        )}
        {photoPion.photos.length > 2 && (
          <p className="text-sm text-muted-foreground">
            +{photoPion.photos.length - 2} more photos
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {photoPion.photos?.map((photo: any) => (
          <div key={photo.id} className="space-y-2">
            <img
              src={photo.largeUrl || photo.mediumUrl || photo.url}
              alt={photo.caption || 'Photo'}
              className="rounded-lg w-full h-48 object-cover"
            />
            {photo.caption && (
              <p className="text-sm font-medium">{photo.caption}</p>
            )}
            {photo.description && (
              <p className="text-sm text-muted-foreground">{photo.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
