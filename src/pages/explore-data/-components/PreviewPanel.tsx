import React from 'react';
import { Box, IconButton, Paper, Stack, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { LabelValueTable } from '../../../components/LabelValueTable';
import { HapiDataset } from '../../../hooks/useHapiCatalog';

interface PreviewPanelProps {
  /**
   * Data for the selected HAPI dataset from the main table
   */
  previewItem: HapiDataset;
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
  onClose,
}) => {
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
