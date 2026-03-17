import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
} from "@mui/material";
import {
  People as PeopleIcon,
  Assignment as TaskIcon,
  TrendingUp as TrendingIcon,
  Notifications as NotificationIcon,
} from "@mui/icons-material";

const EmployeeManagementDashboard = ({ setSmsBalance, notifications }) => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    pendingTasks: 0,
    recentActivities: 0,
  });

  useEffect(() => {
    // TODO: Fetch actual data from API
    setStats({
      totalEmployees: 45,
      activeEmployees: 38,
      pendingTasks: 12,
      recentActivities: 8,
    });
  }, []);

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Employee Management Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PeopleIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.totalEmployees}</Typography>
                  <Typography color="textSecondary">Total Employees</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingIcon color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.activeEmployees}</Typography>
                  <Typography color="textSecondary">Active Employees</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TaskIcon color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.pendingTasks}</Typography>
                  <Typography color="textSecondary">Pending Tasks</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <NotificationIcon color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.recentActivities}</Typography>
                  <Typography color="textSecondary">Recent Activities</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activities
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="New employee onboarded"
                  secondary="John Doe - Reception Department"
                />
                <Chip label="2 hours ago" size="small" />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Task completed"
                  secondary="Performance review submitted"
                />
                <Chip label="5 hours ago" size="small" />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Leave request approved"
                  secondary="Jane Smith - 3 days leave"
                />
                <Chip label="1 day ago" size="small" />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Card sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'grey.50' } }}>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <PeopleIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="body2">Manage Employees</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'grey.50' } }}>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <TaskIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="body2">View Tasks</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'grey.50' } }}>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <TrendingIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="body2">Reports</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'grey.50' } }}>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <NotificationIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="body2">Notifications</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmployeeManagementDashboard;
