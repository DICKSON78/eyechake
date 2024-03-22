import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/SearchRounded";
import DatePicker from "../../../components/DatePicker";
import TextField from "../../../components/TextField";
import Select from "../../../components/Select";

import { throttle } from "../../../helpers";

const Filters = ({ params, setParams, ...rest }) => {
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
        <Grid
          container
          spacing={2}
        >
          <Grid
            item
            md
            sm={6}
            xs={12}
          >
            <DatePicker
              fullWidth
              label="Return Date"
              value={params.to_return_date || null}
              onChange={(value) =>
                setParams({
                  ...params,
                  to_return_date: !isNaN(value) ? value : null,
                })
              }
            />
          </Grid>
          <Grid
            item
            md
            sm={6}
            xs={12}
          >
            <TextField
              fullWidth
              label="Patient Name"
              placeholder="Search"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              onChange={(value) =>
                throttle(
                  () => setParams({ ...params, patient_name: value }),
                  1000
                )
              }
            />
          </Grid>
          <Grid
            item
            md
            sm={6}
            xs={12}
          >
            <TextField
              fullWidth
              label="Patient Number"
              placeholder="Search"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              onChange={(value) =>
                throttle(
                  () => setParams({ ...params, patient_id: value }),
                  1000
                )
              }
            />
          </Grid>
          <Grid
            item
            md
            sm={6}
            xs={12}
          >
            <Select
              label="Gender"
              fullWidth
              options={["Male", "Female"]}
              clearable
              onChange={(value) =>
                setParams({ ...params, patient_gender: value })
              }
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default Filters;
