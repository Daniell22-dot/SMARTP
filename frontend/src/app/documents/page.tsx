'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { apiClient } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { FileText, File, ExternalLink, Loader2 } from 'lucide-react';

interface Document {
  id: number;
  title: string;
  document_type: string | null;
  file_url: string;
  uploaded_at: string | null;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const data = await apiClient.get<Document[]>('/documents/my');
        setDocuments(data);
      } catch (error) {
        console.error('Failed to load documents:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDocuments();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-[#00e599]" />
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="py-16 text-center">
        <FileText className="h-16 w-16 mx-auto text-[#61646b] mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">No Documents</h2>
        <p className="text-[#94979e]">
          Documents uploaded by your landlord will appear here (lease, receipts, IDs).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {documents.map((doc) => (
          <Card key={doc.id} className="card-hover">
            <CardContent className="flex items-start gap-4 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-[#00e599]/20 bg-[#00e599]/5">
                <File className="h-5 w-5 text-[#00e599]" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="mb-1 text-base font-medium text-white truncate">{doc.title}</CardTitle>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#797d86]">
                  {doc.document_type && (
                    <span className="font-mono text-caps uppercase tracking-widest">{doc.document_type}</span>
                  )}
                  {doc.uploaded_at && <span>{formatDate(doc.uploaded_at)}</span>}
                </div>
              </div>
              <a
                href={doc.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded border border-[#303236] text-[#94979e] transition-colors hover:border-[#00e599] hover:text-[#00e599]"
                aria-label={`Open ${doc.title}`}
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}