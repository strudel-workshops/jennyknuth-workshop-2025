import { Stack, TextField, Typography } from '@mui/material';
import React from 'react';
import { HapiServerSelector, HapiServer } from './HapiServerSelector';

interface DataViewHeaderProps {
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  selectedServer: HapiServer;
  onServerChange: (server: HapiServer) => void;
}

/**
 * Data table header section with HAPI server selector and search bar
 */
export const DataViewHeader: React.FC<DataViewHeaderProps> = ({
  searchTerm,
  setSearchTerm,
  selectedServer,
  onServerChange,
}) => {
  const handleSearch: React.ChangeEventHandler<HTMLInputElement> = (evt) => {
    setSearchTerm(evt.target.value);
  };

  return (
    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
      sx={{
        overflow: 'hidden',
        padding: 2,
      }}
    >
      <Typography variant="h6" component="h2" flex={1}>
        HAPI Datasets
      </Typography>
      <HapiServerSelector
        selectedServer={selectedServer}
        onServerChange={onServerChange}
      />
      <TextField
        variant="outlined"
        label="Search"
        size="small"
        value={searchTerm}
        onChange={handleSearch}
      />
    </Stack>
  );
};
