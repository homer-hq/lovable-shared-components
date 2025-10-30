import { DetailedPion, Pion } from "@/lib/homer-api";

interface BrandPionRendererProps {
  pion: Pion | DetailedPion;
  detailed?: boolean;
}

export const BrandPionRenderer = ({ pion, detailed = false }: BrandPionRendererProps) => {
  const brandPion = pion as any;

  if (!detailed) {
    return (
      <div className="space-y-1">
        {brandPion.brand && <p className="font-medium">{brandPion.brand}</p>}
        {brandPion.model && <p className="text-muted-foreground">{brandPion.model}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h5 className="font-medium">Product Information</h5>
          {brandPion.brand && <p><strong>Brand:</strong> {brandPion.brand}</p>}
          {brandPion.model && <p><strong>Model:</strong> {brandPion.model}</p>}
          {brandPion.productInfo && (
            <div className="text-sm text-muted-foreground">
              <pre className="whitespace-pre-wrap">{JSON.stringify(brandPion.productInfo, null, 2)}</pre>
            </div>
          )}
        </div>
        {brandPion.productPhoto && (
          <div className="space-y-2">
            <h5 className="font-medium">Product Photo</h5>
            <img
              src={brandPion.productPhoto.largeUrl || brandPion.productPhoto.url}
              alt="Product"
              className="rounded-lg w-full max-w-sm object-cover"
            />
          </div>
        )}
      </div>
    </div>
  );
};
