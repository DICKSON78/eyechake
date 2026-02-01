import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControlLabel,
  Checkbox,
  Grid,
  CircularProgress,
  Typography,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/DownloadRounded";
import Page, { Header as PageHeader } from "../../../components/Page";
import Select from "../../../components/Select";
import { useToast } from "../../../hooks";
import { formatError } from "../../../helpers";

const WhatsAppExport = () => {
  const addToast = useToast();
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    is_vip: false,
    is_businessperson: false,
    min_payment: undefined,
    format: "csv",
  });

  useEffect(() => {
    document.title = `WhatsApp Export - ${window.APP_NAME}`;
  }, []);

  const handleExport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.is_vip) params.append("filters[is_vip]", "1");
      if (filters.is_businessperson) params.append("filters[is_businessperson]", "1");
      if (filters.min_payment) params.append("filters[min_payment]", filters.min_payment);
      params.append("format", filters.format);

      const response = await fetch(`/api/marketing/whatsapp-export?${params.toString()}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `whatsapp_contacts_${new Date().toISOString().split("T")[0]}.${filters.format === "vcf" ? "vcf" : "csv"}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        addToast({ message: "Export successful", severity: "success" });
      } else {
        throw new Error("Export failed");
      }
    } catch (error) {
      addToast({ message: formatError(error), severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const formatOptions = [
    { label: "CSV", value: "csv" },
    { label: "Excel", value: "excel" },
    { label: "VCF (vCard)", value: "vcf" },
  ];

  const minPaymentOptions = [
    { label: "All Patients", value: "" },
    { label: "500,000+", value: "500000" },
    { label: "1,000,000+", value: "1000000" },
  ];

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Marketing Management" },
        { title: "WhatsApp Export" },
      ]}
    >
      <Card>
        <PageHeader
          title="WhatsApp Contact Export"
          subtitle="Export patient contacts for WhatsApp bulk messaging"
        />
        <Divider />
        <CardContent>
          <Card
            variant="outlined"
            sx={{
              bgcolor: "background.default",
              mb: 3,
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  fontWeight: 600,
                }}
              >
                Export Filters
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={filters.is_vip}
                        onChange={(e) =>
                          setFilters({ ...filters, is_vip: e.target.checked })
                        }
                      />
                    }
                    label="Prestige Clients Only"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={filters.is_businessperson}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            is_businessperson: e.target.checked,
                          })
                        }
                      />
                    }
                    label="Businesspersons Only"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Select
                    fullWidth
                    label="Minimum Payment"
                    options={minPaymentOptions}
                    optionsLabel="label"
                    optionsValue="value"
                    value={filters.min_payment || ""}
                    onChange={(value) =>
                      setFilters({
                        ...filters,
                        min_payment: value || undefined,
                      })
                    }
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Select
                    fullWidth
                    label="Export Format"
                    options={formatOptions}
                    optionsLabel="label"
                    optionsValue="value"
                    value={filters.format}
                    onChange={(value) =>
                      setFilters({ ...filters, format: value })
                    }
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
              onClick={handleExport}
              disabled={loading}
              size="large"
            >
              {loading ? "Exporting..." : "Export Contacts"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Page>
  );
};

export default WhatsAppExport;

