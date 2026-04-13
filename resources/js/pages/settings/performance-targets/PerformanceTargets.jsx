import React, { useEffect, useState } from "react";
import {
  Box, Button, Card, CardContent, CardHeader, Divider,
  Grid, LinearProgress, Tab, Tabs, TextField, Typography, Alert,
} from "@mui/material";
import { SaveRounded as SaveIcon } from "@mui/icons-material";
import Page from "../../../components/Page";
import { useFetch, useToast } from "../../../hooks";
import { formatError } from "../../../helpers";

const DEPARTMENTS = [
  { key: "sales", label: "Sales" },
  { key: "optometry", label: "Optometry" },
  { key: "crm", label: "CRM / Marketing" },
];

const PerformanceTargets = () => {
  const addToast = useToast();
  const [activeTab, setActiveTab] = useState(0);
  const [saving, setSaving] = useState(false);
  const [targets, setTargets] = useState({});
  const department = DEPARTMENTS[activeTab].key;

  const { data, loading, error, handleFetch } = useFetch(
    "api/performance-reports/" + department,
    {},
    true,
    null,
    (response) => response.data.data
  );

  useEffect(() => {
    if (data && data.kpis) {
      const newTargets = {};
      data.kpis.forEach((kpi) => {
        newTargets[kpi.id] = kpi.target;
      });
      setTargets(newTargets);
    }
  }, [data]);

  useEffect(() => {
    handleFetch();
  }, [activeTab]);

  useEffect(() => {
    if (error) addToast({ message: formatError(error), severity: "error" });
  }, [error]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await window.axios.patch("/api/performance-reports/" + department + "/targets", { targets });
      addToast({ message: "Targets saved successfully!", severity: "success" });
      handleFetch();
    } catch (err) {
      addToast({ message: formatError(err), severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Page breadcrumbs={[{ title: "Home" }, { title: "Settings" }, { title: "Performance Targets" }]}>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>Performance Targets</Typography>
      <Card>
        <CardHeader
          title="Set KPI Targets by Department"
          subheader="Define monthly targets for each department key performance indicators"
        />
        <Divider />
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} sx={{ px: 2 }}>
            {DEPARTMENTS.map((dept) => (<Tab key={dept.key} label={dept.label} />))}
          </Tabs>
        </Box>
        <CardContent>
          {loading ? (<LinearProgress />) : data && data.kpis && data.kpis.length > 0 ? (
            <>
              <Alert severity="info" sx={{ mb: 3 }}>
                Set monthly targets for each KPI. These will be used to calculate performance percentages.
              </Alert>
              <Grid container spacing={3}>
                {data.kpis.map((kpi) => (
                  <Grid key={kpi.id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" fontWeight={600} gutterBottom>{kpi.name}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: "block" }}>
                          Current result: {kpi.formatted_result}
                        </Typography>
                        <TextField
                          fullWidth
                          label="Monthly Target"
                          type="number"
                          value={targets[kpi.id] !== undefined ? targets[kpi.id] : kpi.target}
                          onChange={(e) => setTargets({ ...targets, [kpi.id]: parseFloat(e.target.value) || 0 })}
                          size="small"
                          helperText={"Unit: " + kpi.unit}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
                <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving} size="large">
                  {saving ? "Saving..." : "Save Targets"}
                </Button>
              </Box>
            </>
          ) : (
            <Typography color="text.secondary" textAlign="center" py={4}>No KPIs found for this department.</Typography>
          )}
        </CardContent>
      </Card>
    </Page>
  );
};

export default PerformanceTargets;
