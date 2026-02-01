import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/SearchRounded";
import Select from "../../../components/Select";
import TextField from "../../../components/TextField";
import { throttle } from "../../../helpers";

const Filters = ({ params, setParams, ...rest }) => {
  const statusOptions = [
    { label: "All Statuses", value: "" },
    { label: "Draft", value: "draft" },
    { label: "Scheduled", value: "scheduled" },
    { label: "Sending", value: "sending" },
    { label: "Completed", value: "completed" },
    { label: "Failed", value: "failed" },
  ];

  const typeOptions = [
    { label: "All Types", value: "" },
    { label: "Offer", value: "offer" },
    { label: "Announcement", value: "announcement" },
    { label: "Reminder", value: "reminder" },
    { label: "Other", value: "other" },
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
            <TextField
              fullWidth
              label="Search"
              placeholder="Search by title or message"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              onChange={(value) =>
                throttle(() => setParams({ ...params, q: value }), 1000)
              }
            />
          </Grid>
          <Grid item md sm={6} xs={12}>
            <Select
              label="Status"
              fullWidth
              options={statusOptions}
              clearable
              value={params.status || ""}
              onChange={(value) =>
                setParams({ ...params, status: value || undefined })
              }
            />
          </Grid>
          <Grid item md sm={6} xs={12}>
            <Select
              label="Type"
              fullWidth
              options={typeOptions}
              clearable
              value={params.type || ""}
              onChange={(value) =>
                setParams({ ...params, type: value || undefined })
              }
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default Filters;

