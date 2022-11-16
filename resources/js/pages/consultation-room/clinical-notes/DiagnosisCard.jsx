import React from "react";

import { Button, Card, CardContent, CardHeader, Divider } from "@mui/material";
import Table from "../../../components/Table";

import { getNonNull } from "../../../helpers";

const DiagnosisCard = ({ title, diagnosisType, loading, items, consultation, onClickAdd }) => {

  return (
    <Card variant="outlined">
      <CardHeader
        title={title}
        titleTypographyProps={{
          variant: "subtitle2",
          fontWeight: 500,
        }}
      />
      <Divider />
      <CardContent>
        <Table
          loading={loading}
          columns={[
            {
              field: "index",
              headerName: "S/N",
              valueGetter: (item, index) => (index + 1),
            },
            {
              field: "disease_name",
              headerName: "Disease Name",
              valueGetter: (item, index) => getNonNull(item.disease).name,
            },
            {
              field: "disease_code",
              headerName: "Disease Code",
              valueGetter: (item, index) => getNonNull(item.disease).code,
            },
          ]}
          items={items.filter((e) => e.diagnosis_type === diagnosisType)}
          hideNoItemsOverlayIcon
          hidePaginationFooter
          footerItems={[
            [
              {
                value: "",
                tableCellProps: { colSpan: 2 },
              },
              {
                value: (
                  <Button
                    variant="contained"
                    color="secondary"
                    disableElevation
                    size="small"
                    onClick={() => onClickAdd(title, diagnosisType)}
                  >
                    Add
                  </Button>
                ),
              }
            ]
          ]}
        />
      </CardContent>
    </Card>
  );
};

export default DiagnosisCard;
