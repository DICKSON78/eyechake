import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  FormControlLabel,
  Checkbox,
  Stack,
  Box,
} from "@mui/material";
import Page from "../../../components/Page";
import ChartWrapper from "../../../components/ChartWrapper";
import Table from "../../../components/Table";
import { useTheme } from "@mui/material/styles";
import { blue, red, green } from "@mui/material/colors";
import { useFetch, useToast } from "../../../hooks";
import {
  formatDateForDb,
  formatError,
  numberFormat,
} from "../../../helpers";

const PatientRegistration = () => {
  const theme = useTheme();
  const addToast = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const periodParam = searchParams.get("period") || "yearly";

  const [period, setPeriod] = useState(periodParam);

  // Update URL when period changes
  useEffect(() => {
    if (period && period !== periodParam) {
      setSearchParams({ period }, { replace: true });
    }
  }, [period, periodParam, setSearchParams]);

  const { data, loading, error, handleFetch } = useFetch(
    "api/dashboard",
    {
      patient_registration_period: period,
    },
    true,
    null,
    (response) => response.data.data
  );

  useEffect(() => {
    document.title = `Patient Registration - ${window.APP_NAME}`;
  }, []);

  // Sync period from URL params
  useEffect(() => {
    const urlPeriod = searchParams.get("period") || "yearly";
    if (urlPeriod !== period) {
      setPeriod(urlPeriod);
    }
  }, [searchParams]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  const patientRegistrationData = data?.statistics?.patient_registration || [];

  return (
    <Page
      title="Patient Registration"
      breadcrumbs={[
        { title: "Home" },
        { title: "Dashboard" },
        { title: "Patient Registration" },
      ]}
    >
      <Card sx={{ mb: 3 }}>
        <CardHeader
          title="Patient Registration"
          action={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={period === "daily"}
                      onChange={() => {
                        setPeriod("daily");
                        handleFetch();
                      }}
                      size="small"
                    />
                  }
                  label="Day"
                  sx={{ margin: 0 }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={period === "monthly"}
                      onChange={() => {
                        setPeriod("monthly");
                        handleFetch();
                      }}
                      size="small"
                    />
                  }
                  label="Month"
                  sx={{ margin: 0 }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={period === "yearly"}
                      onChange={() => {
                        setPeriod("yearly");
                        handleFetch();
                      }}
                      size="small"
                    />
                  }
                  label="Year"
                  sx={{ margin: 0 }}
                />
              </Stack>
            </Box>
          }
        />
        <Divider />
        <CardContent>
          <ChartWrapper
            options={{
              chart: {
                fontFamily: theme.typography.fontFamily,
                foreColor: theme.palette.text.primary,
                background: "transparent",
                toolbar: {
                  show: false,
                },
              },
              colors: [blue[500], red[500], green[500]],
              stroke: {
                show: true,
                width: [3, 3, 3],
                curve: "smooth",
              },
              dataLabels: {
                enabled: false,
                style: {
                  fontSize: 10,
                  fontWeight: 400,
                },
                dropShadow: {
                  enabled: false,
                },
                formatter: (val, opts) => numberFormat(val),
              },
              grid: {
                show: false,
                borderColor: theme.palette.divider,
              },
              xaxis: {
                axisBorder: {
                  show: false,
                  color: theme.palette.divider,
                },
                axisTicks: {
                  show: true,
                  color: theme.palette.divider,
                  height: 6,
                },
              },
              yaxis: {
                axisBorder: {
                  show: false,
                  color: theme.palette.divider,
                },
                axisTicks: {
                  show: true,
                  color: theme.palette.divider,
                  width: 6,
                },
                labels: {
                  formatter: (val, index) => numberFormat(val),
                },
              },
              tooltip: {
                theme: "dark",
                fillSeriesColor: true,
              },
              legend: {
                markers: {
                  width: 14,
                  height: 8,
                  radius: 4,
                },
              },
            }}
            series={[
              {
                name: "Male",
                data: patientRegistrationData.map((e) => ({
                  x: e.period,
                  y: e.male || 0,
                })),
              },
              {
                name: "Female",
                data: patientRegistrationData.map((e) => ({
                  x: e.period,
                  y: e.female || 0,
                })),
              },
              {
                name: "Total",
                data: patientRegistrationData.map((e) => ({
                  x: e.period,
                  y: (e.male || 0) + (e.female || 0),
                })),
              },
            ]}
            type="line"
            height="400"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Detailed Data" />
        <Divider />
        <CardContent>
          <Table
            loading={loading}
            columns={[
              {
                field: "period",
                headerName: "Period",
              },
              {
                field: "male",
                headerName: "Male",
                valueGetter: (item) => numberFormat(item.male || 0),
              },
              {
                field: "female",
                headerName: "Female",
                valueGetter: (item) => numberFormat(item.female || 0),
              },
              {
                field: "total",
                headerName: "Total",
                valueGetter: (item) =>
                  numberFormat((item.male || 0) + (item.female || 0)),
              },
            ]}
            items={patientRegistrationData}
            hidePaginationFooter={patientRegistrationData.length <= 25}
          />
        </CardContent>
      </Card>
    </Page>
  );
};

export default PatientRegistration;

