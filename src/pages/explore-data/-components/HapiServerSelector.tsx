import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import React from 'react';

export interface HapiServer {
  id: string;
  name: string;
  url: string;
}

export const HAPI_SERVERS: HapiServer[] = [
  {
    id: 'cdaweb',
    name: 'CDAWeb',
    url: 'https://cdaweb.gsfc.nasa.gov/hapi',
  },
  {
    id: 'intermagnet',
    name: 'INTERMAGNET',
    url: 'https://imag-data.bgs.ac.uk/GIN_V1/hapi',
  },
  {
    id: 'lasp',
    name: 'LASP',
    url: 'https://lasp.colorado.edu/lisird/hapi',
  },
  {
    id: 'knmi',
    name: 'KNMI',
    url: 'https://hapi.spaceweather.knmi.nl/hapi',
  },
  {
    id: 'helioviewer',
    name: 'Helioviewer',
    url: 'https://api.helioviewer.org/hapi/Helioviewer/hapi',
  },
];

interface HapiServerSelectorProps {
  selectedServer: HapiServer;
  onServerChange: (server: HapiServer) => void;
}

/**
 * Dropdown selector for HAPI servers
 */
export const HapiServerSelector: React.FC<HapiServerSelectorProps> = ({
  selectedServer,
  onServerChange,
}) => {
  const handleChange = (event: SelectChangeEvent) => {
    const server = HAPI_SERVERS.find((s) => s.id === event.target.value);
    if (server) {
      onServerChange(server);
    }
  };

  return (
    <FormControl sx={{ minWidth: 200 }} size="small">
      <InputLabel id="hapi-server-select-label">HAPI Server</InputLabel>
      <Select
        labelId="hapi-server-select-label"
        id="hapi-server-select"
        value={selectedServer.id}
        label="HAPI Server"
        onChange={handleChange}
      >
        {HAPI_SERVERS.map((server) => (
          <MenuItem key={server.id} value={server.id}>
            {server.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
