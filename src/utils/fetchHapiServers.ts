/**
 * Fetches and parses the list of HAPI servers from hapi-server.org
 */

export interface HapiServer {
  url: string;
  name: string;
  id: string;
  contact: string;
  email: string;
}

export async function fetchHapiServers(): Promise<HapiServer[]> {
  try {
    const response = await fetch('https://hapi-server.org/servers/all.txt');
    const text = await response.text();

    // Parse CSV data
    const lines = text.split('\n');
    const servers: HapiServer[] = [];

    for (const line of lines) {
      // Skip empty lines and comments
      if (!line.trim() || line.startsWith('#')) {
        continue;
      }

      // Parse CSV line
      const parts = line.split(',').map((part) => part.trim());

      if (parts.length >= 5) {
        servers.push({
          url: parts[0],
          name: parts[1],
          id: parts[2],
          contact: parts[3],
          email: parts[4],
        });
      }
    }
    return servers;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching HAPI servers:', error);
    return [];
  }
}
