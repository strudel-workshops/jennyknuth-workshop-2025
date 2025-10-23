import { useQuery } from '@tanstack/react-query';
import { fetchHapiServers } from '../utils/fetchHapiServers';

/**
 * Hook to fetch the list of HAPI servers from hapi-server.org
 */
export const useHapiServers = () => {
  return useQuery({
    queryKey: ['hapi-servers'],
    queryFn: fetchHapiServers,
    staleTime: 60 * 60 * 1000, // Cache for 1 hour
  });
};
