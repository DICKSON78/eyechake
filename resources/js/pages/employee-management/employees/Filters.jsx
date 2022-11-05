import React from "react";
import { Card, CardContent, Grid } from "@mui/material";
import TextField from "../../../components/TextField";
import Select from "../../../components/Select";
import useFetch from "../../../hooks/useFetch";

const Filters = ({ params, setParams, ...rest }) => {

  const { data: departments } = useFetch("api/departments", {
    status: "Active",
    per_page: 500
  }, true, [], (response) => response.data.data.data);
  const { data: jobTitles } = useFetch("api/job-titles", {
    status: "Active",
    per_page: 500
  }, true, [], (response) => response.data.data.data);

  return (
    <Card
      variant="outlined"
      {...rest}
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
            <TextField
              fullWidth
              label="Employee Name"
              defaultValue={params.name}
              onChange={(value) => setParams({ ...params, name: value })}
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
              label="Employee Number"
              defaultValue={params.employee_number}
              onChange={(value) => setParams({ ...params, id: value })}
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
              value={params.gender || ""}
              onChange={(value) => setParams({ ...params, gender: value })}
            />
          </Grid>
          <Grid
            item
            md
            sm={6}
            xs={12}
          >
            <Select
              label="Department"
              fullWidth
              options={departments}
              optionsLabel="name"
              optionsValue="id"
              clearable
              value={departments.length ? (params.department_id || "") : ""}
              onChange={(value) => setParams({ ...params, department_id: value })}
            />
          </Grid>
          <Grid
            item
            md
            sm={6}
            xs={12}
          >
            <Select
              label="Job Title"
              fullWidth
              options={jobTitles}
              optionsLabel="name"
              optionsValue="id"
              clearable
              value={jobTitles.length ? (params.job_title_id || "") : ""}
              onChange={(value) => setParams({ ...params, job_title_id: value })}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default Filters;
