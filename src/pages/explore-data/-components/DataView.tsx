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
