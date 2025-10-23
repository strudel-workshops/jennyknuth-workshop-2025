import React from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { LabelValueTable } from '../../../components/LabelValueTable';
import { HapiDataset } from '../../../hooks/useHapiCatalog';
import { useHapiDataPreview } from '../../../hooks/useHapiDataPreview';
import Plot from 'react-plotly.js';

interface PreviewPanelProps {
  /**
   * Data for the selected HAPI dataset from the main table
   */
  previewItem: HapiDataset;
  /**
   * The HAPI server URL
   */
  serverUrl: string;
  /**
   * Function to handle hiding
   */
  onClose: () => void;
}

/**
 * Panel to show extra information about a HAPI dataset in a separate panel
 * next to the main data table.
 */
export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  previewItem,
  serverUrl,
  onClose,
}) => {
  const { isPending, isError, data, error } = useHapiDataPreview(
    serverUrl,
    previewItem.id
  );

  // Prepare plot data from HAPI response
  const plotData = React.useMemo(() => {
    if (!data || !data.parameters || !data.data || data.data.length === 0) {
      return [];
    }

    // First parameter is typically time in HAPI
    const timeValues = data.data.map((row) => row[0]);

    // Create traces for each parameter (excluding time parameter at index 0)
    const traces = data.parameters.slice(1).map((param, index) => {
      const paramIndex = index + 1; // +1 because we skip the time parameter
      const yValues = data.data.map((row) => row[paramIndex]);

      return {
        x: timeValues,
        y: yValues,
        type: 'scatter' as const,
        mode: 'lines+markers' as const,
        name: param.name,
        marker: { size: 4 },
        line: { width: 2 },
      };
    });

    return traces;
  }, [data]);

  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        padding: 2,
      }}
    >
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Stack direction="row">
            <Typography variant="h6" component="h3" flex={1}>
              {previewItem.title || previewItem.id}
            </Typography>
            <IconButton size="small" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Stack>
          {previewItem.description && (
            <Typography variant="body2">{previewItem.description}</Typography>
          )}
        </Stack>
        <Box>
          <Typography fontWeight="medium" mb={1}>
            Data Preview (2 weeks)
          </Typography>
          {isPending && (
            <Box sx={{ display: 'flex', justifyContent: 'center', padding: 3 }}>
              <CircularProgress />
            </Box>
          )}
          {isError && (
            <Alert severity="error">
              Error loading data: {error?.message || 'Unknown error'}
            </Alert>
          )}
          {data && data.data && data.data.length > 0 && (
            <Box>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Showing {data.data.length} records from {data.startDate}
              </Typography>
              <Plot
                data={plotData}
                layout={{
                  autosize: true,
                  margin: { l: 50, r: 20, t: 20, b: 50 },
                  xaxis: {
                    title: data.parameters[0]?.name || 'Time',
                    type: 'date',
                  },
                  yaxis: {
                    title: 'Value',
                  },
                  legend: {
                    orientation: 'h',
                    yanchor: 'bottom',
                    y: 1.02,
                    xanchor: 'right',
                    x: 1,
                  },
                  hovermode: 'closest',
                }}
                config={{
                  responsive: true,
                  displayModeBar: true,
                  displaylogo: false,
                }}
                style={{ width: '100%', height: '400px' }}
              />
            </Box>
          )}
          {data && data.data && data.data.length === 0 && (
            <Alert severity="info">No data available for this dataset.</Alert>
          )}
        </Box>
        <Box>
          <Typography fontWeight="medium" mb={1}>
            Dataset Information
          </Typography>
          <LabelValueTable
            rows={[
              { label: 'Dataset ID', value: previewItem.id },
              { label: 'Title', value: previewItem.title || 'N/A' },
              { label: 'Contact', value: previewItem.contact || 'N/A' },
            ]}
          />
        </Box>
        <Box>
          <Typography fontWeight="medium" mb={1}>
            Time Range
          </Typography>
          <LabelValueTable
            rows={[
              { label: 'Start Date', value: previewItem.startDate || 'N/A' },
              { label: 'Stop Date', value: previewItem.stopDate || 'N/A' },
            ]}
          />
        </Box>
      </Stack>
    </Paper>
  );
};
