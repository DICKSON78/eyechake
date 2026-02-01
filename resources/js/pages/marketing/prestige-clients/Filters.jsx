import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/SearchRounded";
import TextField from "../../../components/TextField";
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
              value={params.q || ""}
              onChange={(value) =>
                throttle(() => setParams({ ...params, q: value, page: 1 }), 1000)
              }
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default Filters;
