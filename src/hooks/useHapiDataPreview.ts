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
 * Hook to fetch 2 weeks of data from a HAPI server's /data endpoint
 * Fetches data from the dataset's start date or 2 weeks, whichever is shorter
 */
export const useHapiDataPreview = (serverUrl: string, datasetId: string) => {
  return useQuery({
    queryKey: ['hapi-data-preview', serverUrl, datasetId],
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

        if (!startDate) {
          throw new Error('Dataset does not have a start date');
        }

        // Calculate 2 weeks from the start date
        const start = new Date(startDate);
        const twoWeeksLater = new Date(start);
        twoWeeksLater.setDate(twoWeeksLater.getDate() + 14);

        // Format the date as ISO string and extract just the date portion
        const timeMax = twoWeeksLater.toISOString().split('.')[0] + 'Z';

        // Fetch 2 weeks of data
        const dataResponse = await fetch(
          `${serverUrl}/data?id=${encodeURIComponent(datasetId)}&time.min=${startDate}&time.max=${timeMax}`
        );

        if (!dataResponse.ok) {
          throw new Error(`Failed to fetch data: ${dataResponse.statusText}`);
        }

        const text = await dataResponse.text();

        // Parse CSV data
        const lines = text.trim().split('\n');
        const data: any[][] = [];

        // Parse all data lines
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          // Skip empty lines and comments
          if (line && !line.startsWith('#')) {
            const values = line.split(',');
            data.push(values);
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
        console.error('Error fetching HAPI data preview:', error);
        throw error;
      }
    },
    enabled: !!serverUrl && !!datasetId,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });
};
