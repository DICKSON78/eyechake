import React, { useEffect, useState } from "react";

import Page from "../../../components/Page";
import Report from "../../../components/reports/Report";
import { SearchTextField } from "../../../components/Table";
import Select from "../../../components/Select";

import { numberFormat, throttle } from "../../../helpers";

const MedicineItemBalance = ({ module, consultationType }) => {
  const [params, setParams] = useState({
    status: "Active",
    search: undefined,
    report_period: "weekly",
  });

  useEffect(() => {
    document.title = `Medicine Item Balance Report - ${window.APP_NAME}`;
  }, []);

  const getReportPeriodTitle = () => {
    switch (params.report_period) {
      case "daily":
        return "Daily Report";
      case "weekly":
        return "Weekly Report";
      case "monthly":
        return "Monthly Report";
      case "yearly":
        return "Yearly Report";
      default:
        return "";
    }
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: module || "Medicine Center" },
        { title: "Reports" },
        { title: "Medicine Item Balance" },
      ]}
    >
      <Report
        title={`Medicine Item Balance Report - ${getReportPeriodTitle()}`}
        uri="api/medicines"
        params={{ ...params, status: "Active" }}
        headerTrailingContent={
          <React.Fragment>
            <Select
              label="Report Period"
              options={[
                { id: "daily", name: "Daily" },
                { id: "weekly", name: "Weekly" },
                { id: "monthly", name: "Monthly" },
                { id: "yearly", name: "Yearly" },
              ]}
              optionsLabel="name"
              optionsValue="id"
              value={params.report_period}
              onChange={(value) =>
                setParams({ ...params, report_period: value })
              }
              sx={{ width: 150, mr: 2 }}
            />
            <SearchTextField
              placeholder="Search Medicine"
              onChange={(value) =>
                throttle(() => setParams({ ...params, search: value }), 1000)
              }
              sx={{ width: 200 }}
            />
          </React.Fragment>
        }
        columns={[
          {
            field: "name",
            headerName: "Medicine Name",
            valueGetter: (item) => item.name,
          },
          {
            field: "code",
            headerName: "Medicine Code",
            valueGetter: (item) => item.code || 'N/A',
          },
          {
            field: "generic_name",
            headerName: "Generic Name",
            valueGetter: (item) => item.generic_name || 'N/A',
          },
          {
            field: "brand_name",
            headerName: "Brand Name",
            valueGetter: (item) => item.brand_name || 'N/A',
          },
          {
            field: "unit_of_measure_id",
            headerName: "Unit of Measure",
            valueGetter: (item) => item.unit_of_measure?.name || 'N/A',
          },
          {
            field: "unit_buying_price",
            headerName: "Unit Price (TZS)",
            valueGetter: (item) => `Tz ${numberFormat(item.unit_buying_price || 0)}`,
          },
          {
            field: "selling_price",
            headerName: "Selling Price (TZS)",
            valueGetter: (item) => `Tz ${numberFormat(item.selling_price || 0)}`,
          },
          {
            field: "balance",
            headerName: "Current Balance",
            valueGetter: (item) => {
              const balance = parseFloat(item.balance) || 0;
              // Display 0 instead of negative values to avoid confusion during inspections
              return numberFormat(balance < 0 ? 0 : balance);
            },
          },
          {
            field: "expiry_date",
            headerName: "Expiry Date",
            valueGetter: (item) => {
              if (!item.expiry_date) return 'No expiry';
              return new Date(item.expiry_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });
            },
          },
        ]}
      />
    </Page>
  );
};

export default MedicineItemBalance;
