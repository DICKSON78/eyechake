import React, { useState } from "react";
import { Box, Button, CardActions, CardContent, Divider, Grid } from "@mui/material";
import Select from "../../components/Select";

const Filter = ({ modal, params: initial, onOk }) => {

  const [params, setParams] = useState(initial);

  return (
    <>
    <CardContent>
      <Grid
        container
        spacing={2}
      >
        <Grid
          item
          md={6}
          sm={12}
          xs={12}
        >
          <Select
            label="Role"
            fullWidth
            required
            options={["Admin", "Customer"]}
            value={params.role}
            onChange={(value) => setParams({ ...params, role: value })}
          />
        </Grid>
        <Grid
          item
          md={6}
          sm={12}
          xs={12}
        >
          <Select
            label="Status"
            fullWidth
            required
            options={["Active", "Inactive"]}
            value={params.status}
            onChange={(value) => setParams({ ...params, status: value })}
          />
        </Grid>
      </Grid>
    </CardContent>
    <Divider />
    <CardActions>
      <Box flexGrow={1}/>
      <Button
        variant="text"
        onClick={() => modal.close()}
      >
        Cancel
      </Button>
      <Button
        variant="text"
        onClick={() => onOk(params)}
      >
        Ok
      </Button>
    </CardActions>
    </>
  );
};

export default Filter;
