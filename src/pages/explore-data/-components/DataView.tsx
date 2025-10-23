import { Alert, Box, LinearProgress, Skeleton } from '@mui/material';
import { GridPaginationModel } from '@mui/x-data-grid';
import React, { useState, useMemo } from 'react';
import { SciDataGrid } from '../../../components/SciDataGrid';
import { useHapiCatalog } from '../../../hooks/useHapiCatalog';

interface DataViewProps {
  serverUrl: string;
  searchTerm: string;
  setPreviewItem: React.Dispatch<React.SetStateAction<any>>;
}
/**
 * Query the HAPI catalog and render datasets as an interactive table
 */
export const DataView: React.FC<DataViewProps> = ({
  serverUrl,
  searchTerm,
  setPreviewItem,
}) => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const { isPending, isFetching, isError, data, error } =
    useHapiCatalog(serverUrl);

  // Filter datasets based on search term
  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!searchTerm) return data;

    const lowerSearchTerm = searchTerm.toLowerCase();
    return data.filter((dataset) => {
      return (
        dataset.id.toLowerCase().includes(lowerSearchTerm) ||
        dataset.title?.toLowerCase().includes(lowerSearchTerm) ||
        dataset.description?.toLowerCase().includes(lowerSearchTerm)
      );
    });
  }, [data, searchTerm]);

  const handleRowClick = (rowData: any) => {
    setPreviewItem(rowData.row);
  };

  /**
   * Generate a HAPI data request URL for two weeks of data
   */
  const generateTwoWeekUrl = (dataset: any) => {
    if (!dataset.startDate || !serverUrl) return '';

    // Parse the start date from the dataset
    const datasetStart = new Date(dataset.startDate);
    const datasetStop = dataset.stopDate
      ? new Date(dataset.stopDate)
      : new Date();

    // Calculate two weeks (14 days) from the start date
    const twoWeeksLater = new Date(datasetStart);
    twoWeeksLater.setDate(twoWeeksLater.getDate() + 14);

    // Use the earlier of: two weeks later OR the dataset's stop date
    const endDate = twoWeeksLater < datasetStop ? twoWeeksLater : datasetStop;

    // Format dates as ISO strings (HAPI expects YYYY-MM-DDTHH:MM:SS.sssZ format)
    const timeMin = datasetStart.toISOString();
    const timeMax = endDate.toISOString();

    return `${serverUrl}/data?id=${encodeURIComponent(dataset.id)}&time.min=${timeMin}&time.max=${timeMax}`;
  };

  const handlePaginationModelChange = (model: GridPaginationModel) => {
    // Reset page to first when the page size changes
    const newPage = model.pageSize !== pageSize ? 0 : model.page;
    setPage(newPage);
    setPageSize(model.pageSize);
  };

  // Show a loading skeleton while the initial query is pending
  if (isPending) {
    const emptyRows = new Array(pageSize).fill(null);
    const indexedRows = emptyRows.map((row, i) => i);
    return (
      <Box
        sx={{
          padding: 2,
        }}
      >
        {indexedRows.map((row) => (
          <Skeleton key={row} height={50} />
        ))}
      </Box>
    );
  }

  // Show an error message if the query fails
  if (isError) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  // Show the data when the query completes
  return (
    <>
      {isFetching && <LinearProgress variant="indeterminate" />}
      <SciDataGrid
        rows={filteredData}
        pagination
        paginationMode="client"
        onPaginationModelChange={handlePaginationModelChange}
        getRowId={(row) => row.id}
        columns={[
          {
            field: 'id',
            headerName: 'Dataset ID',
            width: 250,
            flex: 1,
          },
          {
            field: 'title',
            headerName: 'Title',
            width: 300,
            flex: 2,
          },
          {
            field: 'startDate',
            headerName: 'Start Date',
            width: 180,
          },
          {
            field: 'stopDate',
            headerName: 'Stop Date',
            width: 180,
          },
          {
            field: 'requestUrl',
            headerName: 'Request URL',
            width: 400,
            flex: 2,
            valueGetter: (value, row) => generateTwoWeekUrl(row),
            renderCell: (params) => (
              <Box
                component="a"
                href={params.value}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: 'primary.main',
                  textDecoration: 'none',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'block',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                {params.value}
              </Box>
            ),
          },
          {
            field: 'description',
            headerName: 'Description',
            width: 400,
            flex: 2,
          },
        ]}
        disableColumnSelector
        autoHeight
        initialState={{
          pagination: { paginationModel: { page, pageSize } },
        }}
        onRowClick={handleRowClick}
      />
    </>
  );
};
