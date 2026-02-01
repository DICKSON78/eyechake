import React from "react";
import { Button, Select, MenuItem } from "@mui/material";

const Reports = () => {
  const handleExport = () => {
    // Implement export logic
    alert("Exporting reports...");
  };

  return (
    <div>
      <Select defaultValue="all">
        <MenuItem value="all">All</MenuItem>
        <MenuItem value="progressive">Progressive Lenses</MenuItem>
        <MenuItem value="bifocal">Bifocal Lenses</MenuItem>
        {/* Add other filter options as needed */}
      </Select>

      <Button
        variant="contained"
        color="secondary"
        onClick={handleExport}
      >
        Export Reports
      </Button>
    </div>
  );
};

export default Reports;
