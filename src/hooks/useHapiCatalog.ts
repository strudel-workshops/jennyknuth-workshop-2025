import { useQuery } from '@tanstack/react-query';

export interface HapiDataset {
  id: string;
  title?: string;
  description?: string;
  contact?: string;
  startDate?: string;
  stopDate?: string;
}

interface HapiCatalogResponse {
  HAPI: string;
  status: {
    code: number;
    message: string;
  };
  catalog: HapiDataset[];
}

/**
 * Hook to fetch the catalog of datasets from a HAPI server
 */
export const useHapiCatalog = (serverUrl: string) => {
  return useQuery({
    queryKey: ['hapi-catalog', serverUrl],
    queryFn: async (): Promise<HapiDataset[]> => {
      const response = await fetch(`${serverUrl}/catalog`);
      if (!response.ok) {
        throw new Error(`Failed to fetch HAPI catalog: ${response.statusText}`);
      }
      const data: HapiCatalogResponse = await response.json();

      if (data.status.code !== 1200) {
        throw new Error(`HAPI error: ${data.status.message}`);
      }

      return data.catalog || [];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
