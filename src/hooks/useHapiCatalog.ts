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

interface HapiInfoResponse {
  HAPI: string;
  status: {
    code: number;
    message: string;
  };
  startDate?: string;
  stopDate?: string;
  [key: string]: any;
}

/**
 * Fetch info for a single dataset from a HAPI server
 */
const fetchDatasetInfo = async (
  serverUrl: string,
  datasetId: string
): Promise<{ startDate?: string; stopDate?: string; description?: string }> => {
  try {
    const response = await fetch(
      `${serverUrl}/info?id=${encodeURIComponent(datasetId)}`
    );
    if (!response.ok) {
      // eslint-disable-next-line no-console
      console.warn(
        `Failed to fetch info for dataset ${datasetId}: ${response.statusText}`
      );
      return {};
    }
    const data: HapiInfoResponse = await response.json();

    if (data.status.code !== 1200) {
      // eslint-disable-next-line no-console
      console.warn(
        `HAPI error for dataset ${datasetId}: ${data.status.message}`
      );
      return {};
    }

    return {
      startDate: data.startDate,
      stopDate: data.stopDate,
      description: data.description,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(`Error fetching info for dataset ${datasetId}:`, error);
    return {};
  }
};

/**
 * Hook to fetch the catalog of datasets from a HAPI server
 * Also fetches info for each dataset to get start and end dates
 */
export const useHapiCatalog = (serverUrl: string) => {
  return useQuery({
    queryKey: ['hapi-catalog', serverUrl],
    queryFn: async (): Promise<HapiDataset[]> => {
      // First, fetch the catalog
      const response = await fetch(`${serverUrl}/catalog`);
      if (!response.ok) {
        throw new Error(`Failed to fetch HAPI catalog: ${response.statusText}`);
      }
      const data: HapiCatalogResponse = await response.json();

      if (data.status.code !== 1200) {
        throw new Error(`HAPI error: ${data.status.message}`);
      }

      const catalog = data.catalog || [];

      // Then, fetch info for each dataset to get start and end dates
      const infoPromises = catalog.map(async (dataset) => {
        const info = await fetchDatasetInfo(serverUrl, dataset.id);
        return {
          ...dataset,
          ...info,
        };
      });

      const enrichedCatalog = await Promise.all(infoPromises);

      return enrichedCatalog;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
