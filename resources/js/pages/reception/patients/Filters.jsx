import React from "react";
import { Card, CardContent, Grid, InputAdornment, Box, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/SearchRounded";
import FilterListIcon from "@mui/icons-material/FilterListRounded";
import StarIcon from "@mui/icons-material/StarRounded";
import BusinessIcon from "@mui/icons-material/BusinessRounded";
import SchoolIcon from "@mui/icons-material/SchoolRounded";
import TextField from "../../../components/TextField";
import Select from "../../../components/Select";
import useFetch from "../../../hooks/useFetch";

import { throttle } from "../../../helpers";

const Filters = ({ params, setParams, ...rest }) => {
  const { data: paymentModes } = useFetch(
    "api/payment-modes",
    {
      status: "Active",
      per_page: 500,
    },
    true,
    [],
    (response) => response.data.data.data
  );

  return (
    <Box {...rest}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 2,
        }}
      >
        <FilterListIcon fontSize="small" color="action" />
        <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
          Search & Filter
        </Typography>
      </Box>
      <Grid
        container
        spacing={{ xs: 2, sm: 2, md: 2 }}
      >
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            label="Patient Name"
            placeholder="Search by name"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
            onChange={(value) =>
              throttle(() => setParams({ ...params, name: value }), 1000)
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            label="Patient Number"
            placeholder="Search by ID"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
            onChange={(value) =>
              throttle(() => setParams({ ...params, id: value }), 1000)
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            label="Phone Number"
            placeholder="Search by phone"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
            onChange={(value) =>
              throttle(() => setParams({ ...params, phone: value }), 1000)
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            label="Email Address"
            placeholder="Search by email"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
            onChange={(value) =>
              throttle(() => setParams({ ...params, email: value }), 1000)
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Select
            label="Gender"
            fullWidth
            options={["Male", "Female"]}
            clearable
            onChange={(value) => setParams({ ...params, gender: value })}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Select
            label="Payment Mode"
            fullWidth
            options={paymentModes}
            optionsLabel="name"
            optionsValue="id"
            clearable
            onChange={(value) =>
              setParams({ ...params, payment_mode_id: value })
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Select
            label="Client Type"
            fullWidth
            options={[
              { label: "VIP", value: "vip", icon: <StarIcon sx={{ fontSize: 16, color: '#FFD700' }} /> },
              { label: "Business", value: "business", icon: <BusinessIcon sx={{ fontSize: 16 }} /> },
              { label: "Student", value: "student", icon: <SchoolIcon sx={{ fontSize: 16 }} /> },
              { label: "Outreach", value: "outreach" },
            ]}
            optionsLabel="label"
            optionsValue="value"
            clearable
            onChange={(value) =>
              setParams({ ...params, client_type: value, page: 1 })
            }
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Filters;