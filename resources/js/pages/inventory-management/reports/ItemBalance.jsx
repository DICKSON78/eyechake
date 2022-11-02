import React, { useEffect, useState } from "react";

import Page from "../../../components/Page";
import Report from "../../../components/reports/Report";
import { SearchTextField } from "../../../components/Table";

import { getNonNull, numberFormat } from "../../../helpers";

const ItemBalance = () => {

  const [params, setParams] = useState({
    status: "Active",
    is_stock_item: "Yes",
    q: undefined,
  });

  useEffect(() => {
    document.title = `Item Balance Report - ${window.APP_NAME}`;
  }, []);

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Inventory Management" },
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
              onChange={(value) => setParams({ ...params, q: value })}
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
