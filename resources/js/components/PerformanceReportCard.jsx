import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Grid
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useFetch, usePatch, useToast } from '../hooks';
import { numberFormat } from '../helpers';

const PerformanceReportCard = ({ 
  department, 
  user, 
  editable = false,
  refreshTrigger = null 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTargets, setEditedTargets] = useState({});
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const addToast = useToast();
  const { patch } = usePatch();

  // Fetch department performance data
  const {
    data: performanceData,
    loading: performanceLoading,
    error: performanceError
  } = useFetch(`/api/dashboard/performance/${department}`, {
    dependencies: [refreshTrigger]
  });

  useEffect(() => {
    console.log('Performance Report Card - useEffect triggered');
    console.log('Performance Report Card - performanceData:', performanceData);
    
    if (performanceData) {
      // Extract the actual data from the nested structure
      const actualData = performanceData.data || performanceData;
      console.log('Performance Report Card - actualData:', actualData);
      console.log('Performance Report Card - actualData.summary:', actualData.summary);
      console.log('Performance Report Card - actualData.recommendations:', actualData.recommendations);
      console.log('Performance Report Card - actualData.updated_at:', actualData.updated_at);
      
      setData(actualData);
      // Initialize editable targets
      const targets = {};
      actualData.kpis?.forEach(kpi => {
        targets[kpi.id] = kpi.target;
      });
      setEditedTargets(targets);
    }
  }, [performanceData]);

  const getPerformanceColor = (result, target) => {
    if (!target || target === 0) return 'default';
    
    const percentage = (result / target) * 100;
    
    if (percentage < 100) return 'warning'; // Yellow - Below Target
    if (percentage === 100) return 'success'; // Green - Target Achieved
    return 'primary'; // Blue - Above Target
  };

  const getPerformanceIcon = (result, target) => {
    if (!target || target === 0) return '';
    
    const percentage = (result / target) * 100;
    
    if (percentage < 100) return '🟡';
    if (percentage === 100) return '🟢';
    return '🔵';
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset edited targets
    const targets = {};
    data?.kpis?.forEach(kpi => {
      targets[kpi.id] = kpi.target;
    });
    setEditedTargets(targets);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await patch(`/api/dashboard/performance/${department}/targets`, {
        targets: editedTargets
      });
      
      // Update local data
      setData(prev => ({
        ...prev,
        kpis: prev.kpis.map(kpi => ({
          ...kpi,
          target: editedTargets[kpi.id]
        }))
      }));
      
      setIsEditing(false);
      addToast({ message: 'Targets updated successfully', severity: 'success' });
    } catch (error) {
      addToast({ message: 'Failed to update targets', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleTargetChange = (kpiId, value) => {
    setEditedTargets(prev => ({
      ...prev,
      [kpiId]: value
    }));
  };

  if (performanceLoading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (performanceError) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">
            Failed to load performance data: {performanceError.message}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent>
          <Alert severity="info">
            No performance data available for {department}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title={`${department} Performance Report Card`}
        subheader={`Last updated: ${new Date(data.updated_at).toLocaleString()}`}
        action={
          editable && !isEditing ? (
            <Tooltip title="Edit Targets">
              <IconButton onClick={handleEdit} size="small">
                <EditIcon />
              </IconButton>
            </Tooltip>
          ) : editable && isEditing ? (
            <Box>
              <Tooltip title="Save">
                <IconButton onClick={handleSave} size="small" disabled={loading}>
                  <SaveIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Cancel">
                <IconButton onClick={handleCancel} size="small">
                  <CancelIcon />
                </IconButton>
              </Tooltip>
            </Box>
          ) : null
        }
      />
      <CardContent>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>KPI</TableCell>
                <TableCell align="right">Target</TableCell>
                <TableCell align="right">Result</TableCell>
                <TableCell align="center">Indicator</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.kpis?.map((kpi) => (
                <TableRow key={kpi.id}>
                  <TableCell component="th" scope="row">
                    {kpi.name}
                  </TableCell>
                  <TableCell align="right">
                    {isEditing ? (
                      <Typography
                        contentEditable
                        suppressContentEditableWarning
                        style={{
                          border: '1px solid #ccc',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          minWidth: '80px',
                          textAlign: 'right'
                        }}
                        onInput={(e) => handleTargetChange(kpi.id, e.target.textContent)}
                      >
                        {editedTargets[kpi.id]}
                      </Typography>
                    ) : (
                      <Typography variant="body2">
                        {kpi.formatted_target || numberFormat(kpi.target)}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="bold">
                      {kpi.formatted_result || numberFormat(kpi.result)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={getPerformanceIcon(kpi.result, kpi.target)}
                      color={getPerformanceColor(kpi.result, kpi.target)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Report Summary */}
        <Box mt={3}>
          <Typography variant="h6" gutterBottom>
            Report Summary
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {data.summary || 'Performance summary will be generated here.'}
          </Typography>
        </Box>

        {/* Report Recommendations */}
        <Box mt={3}>
          <Typography variant="h6" gutterBottom>
            Report Recommendations
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {data.recommendations || 'AI-generated recommendations will appear here.'}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PerformanceReportCard;
