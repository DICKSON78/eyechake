import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/SearchRounded";
import DatePicker from "../../components/DatePicker";
import TextField from "../../components/TextField";
import Select from "../../components/Select";
import SelectDisease from "../../components/SelectDisease";
import SelectUser from "../../components/SelectUser";
import useFetch from "../../hooks/useFetch";

import { throttle, safeExtractArray } from "../../helpers";

const PatientFilters = ({
  params,
  setParams,
  showDiagnosis,
  showConsultant,
  ...rest
}) => {
  const { data: items } = useFetch(
    "api/items",
    {
      status: "Active",
      is_consultation_item: "Yes",
      per_page: 500,
    },
    true,
    [],
    (response) => safeExtractArray(response, 'data.data.data', [])
  );

  return (
    <Card
      variant="outlined"
      {...rest}
      sx={{
        bgcolor: "background.default",
        width: "100%",
        ...(rest && rest.sx),
      }}
    >
      <CardContent
        sx={{
          p: { xs: 1.5, sm: 2, md: 3 },
          "&:last-child": {
            pb: { xs: 1.5, sm: 2, md: 3 },
          },
        }}
      >
        <Grid
          container
          spacing={{ xs: 1.5, sm: 2, md: 2 }}
        >
          <Grid
            item
            md={3}
            sm={6}
            xs={12}
          >
            <DatePicker
              fullWidth
              label="Start Date"
              value={params.start_date || null}
              onChange={(value) =>
                setParams({
                  ...params,
                  start_date: !isNaN(value) ? value : null,
                })
              }
            />
          </Grid>
          <Grid
            item
            md={3}
            sm={6}
            xs={12}
          >
            <DatePicker
              fullWidth
              label="End Date"
              value={params.end_date || null}
              onChange={(value) =>
                setParams({ ...params, end_date: !isNaN(value) ? value : null })
              }
            />
          </Grid>
          <Grid
            item
            md={3}
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
                  () => setParams(prev => ({ ...prev, patient_name: value })),
                  1000
                )
              }
            />
          </Grid>
          <Grid
            item
            md={3}
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
                  () => setParams(prev => ({ ...prev, patient_id: value })),
                  1000
                )
              }
            />
          </Grid>
          <Grid
            item
            md={3}
            sm={6}
            xs={12}
          >
            <TextField
              fullWidth
              label="Phone Number"
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
                  () => setParams(prev => ({ ...prev, patient_phone: value })),
                  1000
                )
              }
            />
          </Grid>
          <Grid
            item
            md={3}
            sm={6}
            xs={12}
          >
            <Select
              label="Consultation Item"
              fullWidth
              options={items}
              optionsLabel="name"
              optionsValue="id"
              clearable
              onChange={(value) => setParams({ ...params, item_id: value })}
            />
          </Grid>
          {showDiagnosis ? (
            <Grid
              item
              md={3}
              sm={6}
              xs={12}
            >
              <SelectDisease
                label="Diagnosis"
                clearable
                onChange={(value) =>
                  setParams({ ...params, disease_id: value?.id })
                }
              />
            </Grid>
          ) : null}
          {showConsultant ? (
            <Grid
              item
              md={3}
              sm={6}
              xs={12}
            >
              <SelectUser
                label="Consultant"
                clearable
                params={{ designation: "Doctor" }}
                onChange={(value) =>
                  setParams({ ...params, consultant_id: value?.id })
                }
              />
            </Grid>
          ) : null}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default PatientFilters;
