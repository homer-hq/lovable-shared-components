import { FileText } from "lucide-react";
import { DetailedPion, Pion } from "@/lib/homer-api";

interface PDFPionRendererProps {
  pion: Pion | DetailedPion;
  detailed?: boolean;
}

export const PDFPionRenderer = ({ pion, detailed = false }: PDFPionRendererProps) => {
  const pdfPion = pion as any;

  if (!detailed) {
    return (
      <div className="space-y-1">
        {pdfPion.file && (
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="truncate">{pdfPion.file.name || 'Document'}</span>
            {pdfPion.file.pages && (
              <span className="text-muted-foreground">({pdfPion.file.pages} pages)</span>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-lg">{pion.title}</h4>

      <div className="flex items-start gap-4">
        {pdfPion.file?.tinyUrl && (
          <button
            onClick={() => {
              if (pdfPion.file?.url) {
                window.open(pdfPion.file.url, '_blank', 'noopener,noreferrer');
              }
            }}
            className="rounded border w-16 h-20 overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <img
              src={pdfPion.file.tinyUrl}
              alt="Document preview"
              className="w-full h-full object-cover"
            />
          </button>
        )}
        <div className="space-y-2 flex-1">
          {pdfPion.documentName && <p><strong>Name:</strong> {pdfPion.documentName}</p>}
          {pdfPion.file?.pages && <p><strong>Pages:</strong> {pdfPion.file.pages}</p>}
        </div>
      </div>

      {pdfPion.file?.url && (
        <div className="border rounded-lg p-3">
          <iframe
            src={pdfPion.file.url}
            className="w-full h-[60vh] rounded border-0"
            title="PDF Preview"
            onError={() => {
              // Iframe failed to load, but we don't need to show an error as other options are available
            }}
          />
        </div>
      )}
    </div>
  );
};
