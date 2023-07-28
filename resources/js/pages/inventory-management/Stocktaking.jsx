import React, { useEffect, useRef, useState } from "react";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  LinearProgress,
  Radio,
  Stack,
  Tooltip,
  Typography
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/CloseRounded";

import Page, { Header as PageHeader } from "../../components/Page";
import Modal from "../../components/Modal";
import TextField from "../../components/TextField";
import Select from "../../components/Select";
import Table, { SearchTextField } from "../../components/Table";
import ConfirmationDialog from "../../components/ConfirmationDialog";

import { useFetch, usePost, useToast } from "../../hooks";
import {
  formatError,
  getValidationError,
  getValidationRules,
  numberFormat,
  throttle,
  validateInteger
} from "../../helpers";

const validationRules = getValidationRules();

const Stocktaking = () => {

  const addToast = useToast();

  const modalRef = useRef();
  const reasonRef = useRef();
  const itemRef = useRef();
  const quantityRef = useRef();
  const unitBuyingPriceRef = useRef();

  const [reason, setReason] = useState();
  const [itemName, setItemName] = useState();
  const [itemType, setItemType] = useState();
  const [lensTypeId, setLensTypeId] = useState();
  const [selectedItem, setSelectedItem] = useState();
  const [quantity, setQuantity] = useState();
  const [unitBuyingPrice, setUnitBuyingPrice] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);

  const { data: lensTypes, handleFetch: fetchLensTypes } = useFetch("api/lens-types", {
    status: "Active",
    per_page: 500
  }, false, [], (response) => response.data.data.data);

  const { data: items, setData: setItems, handleFetch: fetchItems } = useFetch("api/items", {
    status: "Active",
    per_page: 5000,
    is_stock_item: "Yes",
    q: itemName,
    item_type: itemType,
    lens_type_id: lensTypeId
  }, true, [], (response) => response.data.data.data);

  const { data, loading, error, handlePost, setError } = usePost("api/stocktakes", {
    reason,
    items: selectedItems,
  });

  useEffect(() => {
    document.title = `Stocktaking - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    if (itemType !== "Lens") {
      setLensTypeId(null);
    }

    if (itemType === "Lens") {
      fetchLensTypes();
    }
  }, [itemType]);

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const handleAddItem = () => {
    if (quantityRef.current.validate() && unitBuyingPriceRef.current.validate()) {
      setSelectedItems([...selectedItems, {
        item_id: selectedItem.id,
        item_name: selectedItem.name,
        quantity,
        unit_buying_price: unitBuyingPrice,
      }]);

      setSelectedItem(null);
      setQuantity(null);
      setUnitBuyingPrice(null);
    }
  };

  const handleRemoveItem = (index) => {
    setSelectedItems(selectedItems.filter((e, i) => i !== index));
  };

  const confirmSubmit = () => {
    setError(null);

    if (!reasonRef.current.validate()) {
      return setError(getValidationError("Please write reason for this stocktaking."));
    }

    if (!selectedItems.length) {
      return setError(getValidationError("Please add at least one item."));
    }

    let component = (
      <ConfirmationDialog
        message="Are you sure you want to perform this action?"
        onCancel={() => modalRef.current.close()}
        onOk={() => {
          modalRef.current.close();
          handlePost();
        }}
      />
    );

    modalRef.current.open("Confirm Save", component, "sm");
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Inventory Management" },
        { title: "Stocktaking" },
      ]}
    >
      <Card>
        <PageHeader title="Stocktaking"/>
        <Divider />
        <CardContent>
          <Grid
            container
            spacing={2}
            mb={2}
          >
            <Grid
              item
              md={3.5}
              sm={12}
              xs={12}
            >
              <TextField
                ref={reasonRef}
                label="Reason"
                fullWidth
                required
                onChange={(value) => setReason(value)}
              />
            </Grid>
            <Grid
              item
              md={3}
              sm={12}
              xs={12}
            >
              <TextField
                disabled
                label="Prepared By"
                fullWidth
                required
                value={window.user.full_name}
              />
            </Grid>
          </Grid>

          <Grid
            container
            spacing={2}
          >
            <Grid
              item
              md={3.5}
              sm={12}
              xs={12}
            >
              <Card variant="outlined">
                <CardHeader
                  title="Select Item"
                  titleTypographyProps={{
                    variant: "subtitle1",
                    fontWeight: 700,
                    color: "text.secondary",
                  }}
                  action={(
                    <SearchTextField
                      onChange={(value) => throttle(() => setItemName(value), 1000)}
                    />
                  )}
                  className="no-action-margin-right"
                />
                <Divider />
                <CardContent sx={{ bgcolor: "background.default" }}>
                  <Select
                    placeholder="Item Type"
                    fullWidth
                    clearable
                    options={["Pharmaceutical", "Lens", "Frame"]}
                    onChange={(value) => setItemType(value)}
                  />
                  {itemType === "Lens" ?
                    <Select
                      placeholder="Lens Type"
                      fullWidth
                      clearable
                      options={lensTypes}
                      optionsLabel="name"
                      optionsValue="id"
                      onChange={(value) => setLensTypeId(value)}
                      containerProps={{ mt: 2 }}
                    />
                    : null
                  }
                </CardContent>
                <Divider />
                <CardContent sx={{ height: "42vh", overflowY: "auto" }}>
                  {items.map((e) => (
                    <FormControlLabel
                      key={e.id}
                      control={(
                        <Radio
                          size="small"
                          checked={selectedItem === e}
                          onChange={(event) => setSelectedItem(e)}
                        />
                      )}
                      label={<Typography variant="body2">{e.name}</Typography>}
                      sx={{ display: "flex" }}
                    />
                  ))}
                </CardContent>
              </Card>
            </Grid>

            <Grid
              item
              md={8.5}
              sm={12}
              xs={12}
            >
              <Card
                variant="outlined"
                sx={{ mb: 1 }}
              >
                <CardHeader
                  title="Added Items"
                  titleTypographyProps={{
                    variant: "subtitle1",
                    fontWeight: 700,
                    color: "text.secondary",
                  }}
                />
                <Divider />
                <CardContent>
                  {selectedItem ?
                    <Grid
                      container
                      spacing={1}
                      alignItems="flex-end"
                      mb={2}
                    >
                      <Grid
                        item
                        md={4}
                        sm={4}
                        xs={12}
                      >
                        <TextField
                          ref={itemRef}
                          disabled={true}
                          label="Selected Item"
                          fullWidth
                          required
                          value={selectedItem.name || ""}
                        />
                      </Grid>
                      <Grid
                        item
                        md={3}
                        sm={4}
                        xs={12}
                      >
                        <TextField
                          disabled={true}
                          label="Unit of Measure"
                          fullWidth
                          required
                          value={selectedItem.unit_of_measure?.name || ""}
                        />
                      </Grid>
                      <Grid
                        item
                        md={2}
                        sm={4}
                        xs={12}
                      >
                        <TextField
                          ref={quantityRef}
                          label="Quantity"
                          fullWidth
                          required
                          defaultValue={quantity}
                          rules={[
                            validationRules.number,
                            (value) => value > 0 || "Quantity has to be greater than 0."
                          ]}
                          onChange={(value) => {
                            value = validateInteger(value);
                            setQuantity(value);
                          }}
                        />
                      </Grid>
                      <Grid
                        item
                        md={2}
                        sm={4}
                        xs={12}
                      >
                        <TextField
                          ref={unitBuyingPriceRef}
                          label="Unit Buying Price"
                          fullWidth
                          defaultValue={unitBuyingPrice}
                          rules={[
                            (value) => {
                              value = (value || "").trim();
                              return !value ? true : validationRules.number(value);
                            },
                            (value) => {
                              value = (value || "").trim();
                              return !value ? true : (value > 0 || "Price has to be greater than 0.");
                            },
                          ]}
                          onChange={(value) => {
                            value = validateInteger(value);
                            setUnitBuyingPrice(value);
                          }}
                        />
                      </Grid>
                      <Grid
                        item
                        md={1}
                        sm={2}
                        xs={12}
                      >
                        <Button
                          disabled={loading}
                          fullWidth
                          variant="contained"
                          color="primary"
                          size="medium"
                          onClick={handleAddItem}
                        >
                          Add
                        </Button>
                      </Grid>
                    </Grid>
                    : null
                  }

                  <Table
                    columns={[
                      {
                        field: "index",
                        headerName: "S/N",
                        valueGetter: (item, index) => (index + 1),
                      },
                      {
                        field: "item_name",
                        headerName: "Item Name",
                      },
                      {
                        field: "quantity",
                        headerName: "Quantity",
                        valueGetter: (item, index) => numberFormat(item.quantity || 0),
                      },
                      {
                        field: "unit_buying_price",
                        headerName: "Unit Buying Price",
                        valueGetter: (item, index) => numberFormat(item.unit_buying_price || 0),
                      },
                      {
                        field: "actions",
                        headerName: "Actions",
                        renderCell: (item, index) => (
                          <Tooltip title="Remove">
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => handleRemoveItem(index)}
                              >
                                <DeleteIcon fontSize="small"/>
                              </IconButton>
                            </span>
                          </Tooltip>
                        ),
                        show: !data,
                      }
                    ]}
                    items={selectedItems}
                    hidePaginationFooter
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        {loading && <LinearProgress />}
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="flex-end"
          flexWrap="wrap"
          p={2}
        >
          <Button
            disabled={loading || !!data}
            variant="contained"
            onClick={confirmSubmit}
          >
            Save
          </Button>
        </Stack>
      </Card>
      <Modal ref={modalRef}/>
    </Page>
  );
};

export default Stocktaking;
