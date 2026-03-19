import React, { useEffect, useState } from "react";

import Page from "../../../components/Page";

const EditableCell = ({ item, field, value, onSave }) => {
  const [editing, setEditing] = React.useState(false);
  const [val, setVal] = React.useState(value || '');
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    setVal(value || '');
  }, [value]);

  const handleSave = async () => {
    if (val === (value || '')) { setEditing(false); return; }
    setSaving(true);
    try {
      await window.axios.patch(`/api/items/${item.id}`, { [field]: val });
      onSave(item.id, field, val);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error('Save failed', e);
      alert('Failed to save. Please try again.');
    }
    setSaving(false);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        autoFocus
        value={val}
        onChange={e => setVal(e.target.value)}
        onBlur={handleSave}
        onKeyDown={e => { 
          if (e.key === 'Enter') handleSave(); 
          if (e.key === 'Escape') { setVal(value || ''); setEditing(false); } 
        }}
        style={{ width: '100%', minWidth: 80, padding: '2px 6px', border: '1px solid #1976d2', borderRadius: 4, fontSize: 13 }}
      />
    );
  }

  return (
    <span
      onClick={() => setEditing(true)}
      title="Click to edit"
      style={{ 
        cursor: 'pointer', 
        borderBottom: saved ? '1px solid #4caf50' : '1px dashed #aaa', 
        minWidth: 60, 
        display: 'inline-block', 
        padding: '1px 4px',
        color: saved ? '#4caf50' : 'inherit',
      }}
    >
      {saving ? '...' : (val || <span style={{ color: '#aaa', fontStyle: 'italic' }}>click to edit</span>)}
    </span>
  );
};

import Report from "../../../components/reports/Report";
import { SearchTextField } from "../../../components/Table";
import Select from "../../../components/Select";

import { numberFormat, throttle } from "../../../helpers";

const MedicineItemBalance = ({ module, consultationType }) => {
  const [itemUpdates, setItemUpdates] = React.useState({});
  const handleCellSave = (itemId, field, newVal) => {
    setItemUpdates(prev => ({ ...prev, [itemId]: { ...(prev[itemId] || {}), [field]: newVal } }));
  };
  const getItemValue = (item, field) => {
    return itemUpdates[item.id]?.[field] ?? item[field];
  };
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
            renderCell: (item) => <EditableCell item={item} field="generic_name" value={getItemValue(item, 'generic_name')} onSave={handleCellSave} />,
            webOnly: true,
          },
          {
            field: "brand_name",
            headerName: "Brand Name",
            renderCell: (item) => <EditableCell item={item} field="brand_name" value={getItemValue(item, 'brand_name')} onSave={handleCellSave} />,
            webOnly: true,
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
