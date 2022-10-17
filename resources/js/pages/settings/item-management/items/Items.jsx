import React, { useEffect, useRef, useState } from "react";

import { Alert, Button, Card, CardContent, Chip, Divider, IconButton, Stack, Tooltip } from "@mui/material";
import { EditRounded as EditIcon, Settings as SettingsIcon } from "@mui/icons-material";
import Page, { Header as PageHeader } from "../../../../components/Page";
import Table, { PageSizeSelect, SearchTextField } from "../../../../components/Table";
import Modal from "../../../../components/Modal";
import Filter from "./Filter";
import CreateItem from "./CreateItem";
import EditItem from "./EditItem";
import ManageItemPrices from "./ManageItemPrices";

import { useFetch } from "../../../../hooks";
import { formatError, getNonNull } from "../../../../helpers";

const Items = () => {

  const modalRef = useRef();

  const [params, setParams] = useState({
    page: 1,
    per_page: 25,
    q: undefined,
  });

  const { data, loading, error, handleFetch } = useFetch("api/items", params, true, {
    data: [],
    total: 0,
    page: 1
  }, (response) => response.data.data);

  useEffect(() => {
    document.title = `Items - ${window.APP_NAME}`;
  }, []);

  const openFilterModal = () => {
    let component = (
      <Filter
        params={params}
        modal={modalRef.current}
        onOk={(updated) => {
          setParams(updated);
          modalRef.current.close();
        }}
      />
    );

    modalRef.current.open("Filter", component);
  };

  const openCreateItemModal = () => {
    let component = (
      <CreateItem
        modal={modalRef.current}
        fetchItems={() => {
          if (params.page !== 1) {
            setParams({ ...params, page: 1 });
          } else {
            handleFetch();
          }
        }}
      />
    );

    modalRef.current.open("Create Item", component);
  };

  const openEditItemModal = (item) => {
    let component = (
      <EditItem
        item={item}
        modal={modalRef.current}
        fetchItems={handleFetch}
      />
    );

    modalRef.current.open("Edit Item", component);
  };

  const openManageItemPricesModal = (item) => {
    let component = (
      <ManageItemPrices
        item={item}
        modal={modalRef.current}
        fetchItems={handleFetch}
      />
    );

    modalRef.current.open("Manage Item Prices", component, "md", item.name);
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
        { title: "Items" },
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
          title="Items"
          trailing={
            <React.Fragment>
              <PageSizeSelect
                pageSize={params.per_page}
                onChange={(value) => setParams({ ...params, per_page: value })}
              />
              <SearchTextField onChange={(value) => setParams({ ...params, q: value })}/>
              <Button
                variant="contained"
                color="secondary"
                disableElevation
                onClick={openFilterModal}
              >
                Filter
              </Button>
              <Button
                variant="contained"
                disableElevation
                onClick={openCreateItemModal}
              >
                New Item
              </Button>
            </React.Fragment>
          }
        />
        <Divider />
        <CardContent>
          <Table
            loading={loading}
            columns={[
              {
                field: "index",
                headerName: "S/N",
                valueGetter: (item, index) => ((params.per_page * (params.page - 1)) + index + 1),
              },
              {
                field: "name",
                headerName: "Item Name",
              },
              {
                field: "code",
                headerName: "Item Code",
              },
              {
                field: "item_type_id",
                headerName: "Item Type",
                valueGetter: (item, index) => getNonNull(item.item_type).name,
              },
              {
                field: "consultation_type_id",
                headerName: "Consultation Type",
                valueGetter: (item, index) => getNonNull(item.consultation_type).name,
              },
              {
                field: "unit_of_measure_id",
                headerName: "Unit of Measure",
                valueGetter: (item, index) => getNonNull(item.unit_of_measure).name,
              },
              {
                field: "lens_type_id",
                headerName: "Lens Type",
                valueGetter: (item, index) => getNonNull(item.lens_type).name,
              },
              {
                field: "prices",
                headerName: "Prices",
                renderCell: (item) => (
                  <Tooltip title="Manage">
                    <IconButton
                      size="small"
                      onClick={() => openManageItemPricesModal(item)}
                    >
                      <SettingsIcon fontSize="small"/>
                    </IconButton>
                  </Tooltip>
                ),
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
                        onClick={() => openEditItemModal(item)}
                      >
                        <EditIcon fontSize="small"/>
                      </IconButton>
                    </Tooltip>
                  </Stack>
                ),
              }
            ]}
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

export default Items;
