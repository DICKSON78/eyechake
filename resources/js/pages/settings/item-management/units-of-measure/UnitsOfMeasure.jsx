import React, { useEffect, useMemo, useRef, useState } from "react";

import { Alert, Button, Card, CardContent, Chip, Divider, IconButton, Stack, Tooltip } from "@mui/material";
import { EditRounded as EditIcon } from "@mui/icons-material";
import Page, { Header as PageHeader } from "../../../../components/Page";
import Table, { PageSizeSelect, SearchTextField } from "../../../../components/Table";
import Modal from "../../../../components/Modal";
import CreateUnitOfMeasure from "./CreateUnitOfMeasure";
import EditUnitOfMeasure from "./EditUnitOfMeasure";

import { useFetch } from "../../../../hooks";
import { formatError } from "../../../../helpers";

const UnitsOfMeasure = () => {

  const modalRef = useRef();

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    q: "",
  });

  const columns = useMemo(() => [
    {
      field: "index",
      headerName: "S/N",
      sortable: false,
      valueGetter: (item, index) => ((params.per_page * (params.page - 1)) + index + 1),
    },
    {
      field: "name",
      headerName: "Name",
    },
    {
      field: "description",
      headerName: "Description",
    },
    {
      field: "status",
      headerName: "Status",
      renderCell: (item) => (
        <Chip
          size="small"
          color={getStatusColor(item.status)}
          label={item.status}
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      renderCell: (item) => (
        <Stack
          direction="row"
          alignItems="center"
          divider={<Divider orientation="vertical" sx={{ height: 16 }}/>}
          spacing={1}
        >
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => openEditUnitOfMeasureModal(item)}
            >
              <EditIcon fontSize="small"/>
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    }
  ], [params]);

  const { data, loading, error, handleFetch } = useFetch("api/units-of-measure", params, true, {
    data: [],
    total: 0,
    page: 1
  }, (response) => response.data.data);

  useEffect(() => {
    document.title = `Units of Measure - ${window.APP_NAME}`;
  }, []);

  const openCreateUnitOfMeasureModal = () => {
    let component = (
      <CreateUnitOfMeasure
        modal={modalRef.current}
        fetchUnitsOfMeasure={() => {
          if (params.page !== 1) {
            setParams({ ...params, page: 1 });
          } else {
            handleFetch();
          }
        }}
      />
    );

    modalRef.current.open("Create Unit of Measure", component);
  };

  const openEditUnitOfMeasureModal = (item) => {
    let component = (
      <EditUnitOfMeasure
        item={item}
        modal={modalRef.current}
        fetchUnitsOfMeasure={handleFetch}
      />
    );

    modalRef.current.open("Edit Unit of Measure", component);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "success";
    }

    return "neutral";
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Settings" },
        { title: "Item Management" },
        { title: "Units of Measure" },
      ]}
    >
      {error ?
        <Alert
          sx={{ mb: 2 }}
          severity="error"
        >
          {formatError(error)}
        </Alert>
        : null
      }
      <Card>
        <PageHeader
          title="Units of Measure"
          trailing={
            <React.Fragment>
              <PageSizeSelect
                pageSize={params.per_page}
                onChange={(value) => setParams({ ...params, per_page: value })}
              />
              <SearchTextField onChange={(value) => setParams({ ...params, q: value })}/>
              <Button
                variant="contained"
                disableElevation
                onClick={openCreateUnitOfMeasureModal}
              >
                New Unit of Measure
              </Button>
            </React.Fragment>
          }
        />
        <CardContent>
          <Table
            loading={loading}
            columns={columns}
            items={data.data}
            itemCount={data.total}
            page={params.page}
            pageSize={params.per_page}
            onPageChange={(page) => setParams({ ...params, page })}
          />
        </CardContent>
      </Card>
      <Modal ref={modalRef}/>
    </Page>
  );
};

export default UnitsOfMeasure;
