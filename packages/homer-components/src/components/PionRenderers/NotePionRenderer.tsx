import { FileText } from "lucide-react";
import { DetailedPion, Pion } from "@/lib/homer-api";

interface NotePionRendererProps {
  pion: Pion | DetailedPion;
  detailed?: boolean;
}

export const NotePionRenderer = ({ pion, detailed = false }: NotePionRendererProps) => {
  const notePion = pion as any;

  if (!detailed) {
    return (
      <div className="prose prose-sm max-w-none">
        <div className="whitespace-pre-wrap text-muted-foreground line-clamp-3">
          {notePion.content || '[Note content]'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="prose prose-sm max-w-none">
        <div className="whitespace-pre-wrap">
          {notePion.content || '[Note content]'}
        </div>
      </div>

      {notePion.files && notePion.files.length > 0 && (
        <div className="space-y-2">
          <h5 className="font-medium">Attached Files</h5>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {notePion.files.map((file: any) => (
              <a
                key={file.id}
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 border rounded hover:bg-muted"
              >
                {file.tinyUrl ? (
                  <img src={file.tinyUrl} alt="File preview" className="w-8 h-8 object-cover rounded" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                <span className="text-sm truncate">{file.name || 'File'}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
