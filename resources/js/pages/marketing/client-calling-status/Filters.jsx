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
    { label: "Need to Call", value: "need_to_call" },
    { label: "Called", value: "called" },
    { label: "Unreachable", value: "unreachable" },
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
              placeholder="Search by name or phone"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              onChange={(value) =>
                throttle(() => setParams((prev) => ({ ...prev, q: value || undefined, page: 1 })), 1000)
              }
            />
          </Grid>
          <Grid item md sm={6} xs={12}>
            <Select
              label="Status"
              fullWidth
              options={statusOptions}
              optionsLabel="label"
              optionsValue="value"
              clearable
              value={params.status || ""}
              onChange={(value) =>
                setParams((prev) => ({ ...prev, status: value || undefined, page: 1 }))
              }
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default Filters;

