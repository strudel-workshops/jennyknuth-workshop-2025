import { useQuery } from '@tanstack/react-query';

export interface HapiDataPoint {
  [key: string]: any;
}

interface HapiDataResponse {
  HAPI: string;
  status: {
    code: number;
    message: string;
  };
  startDate: string;
  stopDate: string;
  parameters: Array<{
    name: string;
    type: string;
    units?: string;
    fill?: string;
    description?: string;
  }>;
  data: any[][];
}

/**
 * Hook to fetch actual data from a HAPI server's /data endpoint
 * Fetches a sample of data (first 1000 records) for visualization
 */
export const useHapiData = (serverUrl: string, datasetId: string) => {
  return useQuery({
    queryKey: ['hapi-data', serverUrl, datasetId],
    queryFn: async (): Promise<HapiDataResponse | null> => {
      try {
        // First get the dataset info to get the time range and parameters
        const infoResponse = await fetch(
          `${serverUrl}/info?id=${encodeURIComponent(datasetId)}`
        );

        if (!infoResponse.ok) {
          throw new Error(
            `Failed to fetch dataset info: ${infoResponse.statusText}`
          );
        }

        const infoData = await infoResponse.json();

        if (infoData.status.code !== 1200) {
          throw new Error(`HAPI error: ${infoData.status.message}`);
        }

        const startDate = infoData.startDate;
        const stopDate = infoData.stopDate;

        if (!startDate || !stopDate) {
          throw new Error('Dataset does not have start/stop dates');
        }

        // Fetch a sample of data (limit to avoid large downloads)
        // We'll fetch the first portion of the dataset
        const dataResponse = await fetch(
          `${serverUrl}/data?id=${encodeURIComponent(datasetId)}&time.min=${startDate}&time.max=${stopDate}`
        );

        if (!dataResponse.ok) {
          throw new Error(`Failed to fetch data: ${dataResponse.statusText}`);
        }

        const text = await dataResponse.text();

        // Parse CSV data
        const lines = text.trim().split('\n');
        const data: any[][] = [];

        // Skip header lines and parse data (limit to first 1000 records for performance)
        const maxRecords = 1000;
        let recordCount = 0;

        for (let i = 0; i < lines.length && recordCount < maxRecords; i++) {
          const line = lines[i].trim();
          // Skip empty lines and comments
          if (line && !line.startsWith('#')) {
            const values = line.split(',');
            data.push(values);
            recordCount++;
          }
        }

        return {
          HAPI: infoData.HAPI,
          status: infoData.status,
          startDate: infoData.startDate,
          stopDate: infoData.stopDate,
          parameters: infoData.parameters || [],
          data,
        };
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching HAPI data:', error);
        throw error;
      }
    },
    enabled: !!serverUrl && !!datasetId,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });
};
