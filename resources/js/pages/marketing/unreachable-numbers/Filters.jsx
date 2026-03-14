import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Select from "../../../components/Select";

const Filters = ({ params, setParams, ...rest }) => {
  const sourceOptions = [
    { label: "All Sources", value: "" },
    { label: "SMS Campaigns", value: "sms" },
    { label: "Calling Status", value: "calling" },
  ];

  return (
    <Card
      variant="outlined"
      {...rest}
      sx={{
        bgcolor: "background.default",
        ...(rest && rest.sx),
      }}
    >
      <CardContent>
        <Grid container spacing={2}>
          <Grid item md sm={6} xs={12}>
            <Select
              label="Source"
              fullWidth
              options={sourceOptions}
              clearable
              value={params.source || ""}
              onChange={(value) =>
                setParams({ ...params, source: value || undefined })
              }
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default Filters;

