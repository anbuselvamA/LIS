import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/axios';

export const useBarcode = (sampleId: string) =>
  useQuery({
    queryKey: ['barcodes', sampleId, 'image'],
    queryFn: async (): Promise<string> => {
      const response = await apiClient.get(`/barcodes/${sampleId}/image`, {
        responseType: 'blob', // Important for handling binary data
      });
      // Create a local object URL for the blob
      return URL.createObjectURL(response.data);
    },
    enabled: !!sampleId,
    // Note: It's good practice to revoke Object URLs to prevent memory leaks,
    // but since this URL is bound to React Query caching, React Query handles
    // the caching lifecycle. We just need to be careful if we unmount completely.
  });
