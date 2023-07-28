import React, { useEffect, useState } from "react";

import Page from "../../../components/Page";
import Report from "../../../components/reports/Report";
import { SearchTextField } from "../../../components/Table";

import { numberFormat, throttle } from "../../../helpers";

const ItemBalance = ({ module, consultationType }) => {

  const [params, setParams] = useState({
    consultation_type: consultationType,
    status: "Active",
    is_stock_item: "Yes",
    q: undefined,
  });

  useEffect(() => {
    document.title = `Item Balance Report - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    setParams({ ...params, consultation_type: consultationType });
  }, [consultationType]);

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: module || "Inventory Management" },
        { title: "Reports" },
        { title: "Item Balance" },
      ]}
    >
      <Report
        title="Item Balance Report"
        uri="api/items"
        params={params}
        headerTrailingContent={(
          <React.Fragment>
            <SearchTextField
              placeholder="Search Item"
              onChange={(value) => throttle(() => setParams({ ...params, q: value }), 1000)}
              sx={{ width: 200 }}
            />
          </React.Fragment>
        )}
        columns={[
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
            valueGetter: (item, index) => item.item_type?.name,
          },
          {
            field: "lens_type_id",
            headerName: "Lens Type",
            valueGetter: (item, index) => item.lens_type?.name,
            show: !module || module === "Optician Center",
          },
          {
            field: "consultation_type_id",
            headerName: "Consultation Type",
            valueGetter: (item, index) => item.consultation_type?.name,
            show: !module,
          },
          {
            field: "unit_of_measure_id",
            headerName: "Unit of Measure",
            valueGetter: (item, index) => item.unit_of_measure?.name,
          },
          {
            field: "balance",
            headerName: "Balance",
            valueGetter: (item, index) => numberFormat(item.balance || 0),
          },
        ]}
      />
    </Page>
  );
};

export default ItemBalance;
