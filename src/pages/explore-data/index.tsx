import { Box, Paper, Stack } from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { DataView } from './-components/DataView';
import { DataViewHeader } from './-components/DataViewHeader';
import { PreviewPanel } from './-components/PreviewPanel';
import { HAPI_SERVERS, HapiServer } from './-components/HapiServerSelector';

export const Route = createFileRoute('/explore-data/')({
  component: DataExplorer,
});

/**
 * Main explorer page in the explore-data Task Flow.
 * This page allows browsing HAPI server datasets with server selection,
 * main table, and the table row preview panel.
 */
function DataExplorer() {
  const [searchTerm, setSearchTerm] = useState('');
  const [previewItem, setPreviewItem] = useState<any>();
  const [selectedServer, setSelectedServer] = useState<HapiServer>(
    HAPI_SERVERS[0]
  );

  const handleServerChange = (server: HapiServer) => {
    setSelectedServer(server);
    setPreviewItem(null); // Clear preview when changing servers
  };

  const handleClosePreview = () => {
    setPreviewItem(null);
  };

  return (
    <Box>
      <PageHeader
        pageTitle="HAPI Data Explorer"
        description="Browse and explore datasets from HAPI (Heliophysics Application Programmer's Interface) servers"
        sx={{
          marginBottom: 1,
          padding: 2,
        }}
      />
      <Box>
        <Stack direction="row">
          <Paper
            elevation={0}
            sx={{
              flex: 1,
              minHeight: '600px',
              minWidth: 0,
            }}
          >
            <DataViewHeader
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedServer={selectedServer}
              onServerChange={handleServerChange}
            />
            <DataView
              serverUrl={selectedServer.url}
              searchTerm={searchTerm}
              setPreviewItem={setPreviewItem}
            />
          </Paper>
          {previewItem && (
            <Box
              sx={{
                minWidth: '400px',
              }}
            >
              <PreviewPanel
                previewItem={previewItem}
                onClose={handleClosePreview}
              />
            </Box>
          )}
        </Stack>
      </Box>
    </Box>
  );
}
