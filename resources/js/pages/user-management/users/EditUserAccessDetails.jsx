import React, { useEffect, useRef, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  Grid,
  InputAdornment,
  LinearProgress,
  Paper,
  Stack,
  Switch,
  Typography,
  alpha,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  LockReset as LockResetIcon,
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import Form from "../../../components/Form";
import TextField from "../../../components/TextField";

import { usePatch, useToast } from "../../../hooks";
import { formatError, getPrivileges } from "../../../helpers";

const EditUserAccessDetails = ({ item, modal, fetchUsers }) => {
  const addToast = useToast();

  const formRef = useRef();
  const usernameRef = useRef();
  const passwordRef = useRef();

  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: "", color: "error" });

  // Normalize privileges to always be an array
  const normalizePrivileges = (privileges) => {
    if (!privileges) return [];
    if (Array.isArray(privileges)) return privileges;
    if (typeof privileges === 'object') {
      // Convert object format { dashboard: true, reception: true } to array
      return Object.keys(privileges).filter(key => 
        privileges[key] === true || 
        privileges[key] === 1 || 
        privileges[key] === "1" ||
        privileges[key] === "true"
      );
    }
    return [];
  };

  const [formData, setFormData] = useState({
    username: item.username,
    password: undefined,
    privileges: normalizePrivileges(item.privileges),
    status: item.status,
  });

  const { data, loading, error, handlePatch } = usePatch(
    `api/users/${item.id}`,
    formData
  );

  useEffect(() => {
    if (data) {
      addToast({ message: data.message, severity: "success" });
      
      // If updating current user's privileges, refresh window.user
      if (item.id && window.user && window.user.id === item.id) {
        if (window.axios) {
          window.axios.get('/api/auth/user')
            .then(response => {
              if (response.data && response.data.data) {
                window.user = response.data.data;
                window.location.reload();
              }
            })
            .catch(err => {
              console.error('Failed to refresh user data:', err);
            });
        }
      }
      
      window.setTimeout(() => {
        fetchUsers();
        modal.close();
      }, 1000);
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error]);

  // Password strength checker
  const checkPasswordStrength = (password) => {
    if (!password) {
      return { score: 0, label: "", color: "error" };
    }
    
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;

    const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
    const colors = ["error", "error", "warning", "info", "success"];
    
    return {
      score: (score / 5) * 100,
      label: labels[Math.min(score, 4)],
      color: colors[Math.min(score, 4)],
    };
  };

  const handlePasswordChange = (value) => {
    setFormData({ ...formData, password: value });
    setPasswordStrength(checkPasswordStrength(value));
  };

  const handleSubmit = () => {
    if (formRef.current.validate()) {
      handlePatch();
    }
  };

  // Toggle all privileges in a category
  const toggleCategory = (category, checked) => {
    const categoryPrivileges = [category.value];
    if (category.children) {
      category.children.forEach(child => categoryPrivileges.push(child.value));
    }
    
    setFormData({
      ...formData,
      privileges: checked
        ? [...new Set([...formData.privileges, ...categoryPrivileges])]
        : formData.privileges.filter(p => !categoryPrivileges.includes(p)),
    });
  };

  const getPrivilegesTree = (items) => {
    if (!items) return null;

    return items
      .filter((e) => typeof e.show === "undefined" || e.show)
      .map((e) => {
        const hasChildren = e.children && e.children.length;
        const isChecked = formData.privileges.indexOf(e.value) !== -1;
        const childrenChecked = hasChildren 
          ? e.children.filter(c => formData.privileges.includes(c.value)).length 
          : 0;
        const allChildrenChecked = hasChildren && childrenChecked === e.children.length;
        const someChildrenChecked = hasChildren && childrenChecked > 0 && !allChildrenChecked;
        
        return hasChildren ? (
          <Grid item xs={12} sm={6} key={e.value}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                height: "100%",
                backgroundColor: isChecked 
                  ? (theme) => alpha(theme.palette.primary.main, 0.04)
                  : "background.paper",
                borderColor: isChecked 
                  ? "primary.main"
                  : (theme) => theme.palette.divider,
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: "primary.main",
                  boxShadow: 1,
                },
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isChecked}
                    indeterminate={someChildrenChecked && !isChecked}
                    onChange={(event) => toggleCategory(e, event.target.checked)}
                    sx={{
                      "&.Mui-checked": {
                        color: "primary.main",
                      },
                    }}
                  />
                }
                label={
                  <Typography variant="subtitle2" fontWeight={600}>
                    {e.label}
                  </Typography>
                }
              />
              {e.children && (
                <Box sx={{ pl: 4, mt: 1 }}>
                  {e.children.map(child => (
                    <FormControlLabel
                      key={child.value}
                      control={
                        <Checkbox
                          size="small"
                          checked={formData.privileges.indexOf(child.value) !== -1}
                          onChange={(event) =>
                            setFormData({
                              ...formData,
                              privileges: event.target.checked
                                ? [...new Set([...formData.privileges, child.value])]
                                : formData.privileges.filter((f) => f !== child.value),
                            })
                          }
                        />
                      }
                      label={
                        <Typography variant="body2" color="text.secondary">
                          {child.label}
                        </Typography>
                      }
                      sx={{ display: "block", ml: 0 }}
                    />
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>
        ) : (
          <Grid item xs={12} sm={6} md={4} key={e.value}>
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                height: "100%",
                backgroundColor: isChecked 
                  ? (theme) => alpha(theme.palette.primary.main, 0.04)
                  : "background.paper",
                borderColor: isChecked 
                  ? "primary.main"
                  : (theme) => theme.palette.divider,
                transition: "all 0.2s ease",
                cursor: "pointer",
                "&:hover": {
                  borderColor: "primary.main",
                },
              }}
              onClick={() =>
                setFormData({
                  ...formData,
                  privileges: isChecked
                    ? formData.privileges.filter((f) => f !== e.value)
                    : [...formData.privileges, e.value],
                })
              }
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isChecked}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        privileges: event.target.checked
                          ? [...new Set([...formData.privileges, e.value])]
                          : formData.privileges.filter((f) => f !== e.value),
                      })
                    }
                  />
                }
                label={
                  <Typography variant="body2">
                    {e.label}
                  </Typography>
                }
                sx={{ m: 0, width: "100%" }}
              />
            </Paper>
          </Grid>
        );
      });
  };

  const privilegeCount = formData.privileges.length;

  return (
    <React.Fragment>
      {loading && <LinearProgress />}
      <CardContent sx={{ pt: 3 }}>
        <Form ref={formRef}>
          {/* Account Status Alert */}
          <Alert 
            severity={formData.status === "Active" ? "success" : "warning"}
            icon={formData.status === "Active" ? <CheckCircleIcon /> : <CancelIcon />}
            sx={{ mb: 3 }}
          >
            This account is currently <strong>{formData.status}</strong>
          </Alert>

          {/* Login Credentials Section */}
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardHeader
              avatar={<LockResetIcon color="primary" />}
              title={
                <Typography variant="subtitle1" fontWeight={600}>
                  Login Credentials
                </Typography>
              }
              subheader="Username and password for system access"
              sx={{
                backgroundColor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(255, 255, 255, 0.02)"
                    : "rgba(0, 0, 0, 0.01)",
              }}
            />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    ref={usernameRef}
                    label="Username"
                    fullWidth
                    required
                    defaultValue={formData.username}
                    onChange={(value) =>
                      setFormData({ ...formData, username: value })
                    }
                    helperText="Used for logging into the system"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    ref={passwordRef}
                    label="New Password"
                    helperText="Leave blank to keep current password"
                    fullWidth
                    type={showPassword ? "text" : "password"}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment
                          position="end"
                          sx={{ cursor: "pointer" }}
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <VisibilityIcon />
                          ) : (
                            <VisibilityOffIcon />
                          )}
                        </InputAdornment>
                      ),
                    }}
                    onChange={handlePasswordChange}
                  />
                  {formData.password && (
                    <Box sx={{ mt: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box sx={{ flexGrow: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={passwordStrength.score}
                            color={passwordStrength.color}
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                        </Box>
                        <Chip
                          size="small"
                          label={passwordStrength.label}
                          color={passwordStrength.color}
                          sx={{ minWidth: 80 }}
                        />
                      </Stack>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Access Privileges Section */}
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardHeader
              avatar={<SecurityIcon color="primary" />}
              title={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Access Privileges
                  </Typography>
                  <Chip
                    size="small"
                    label={`${privilegeCount} selected`}
                    color={privilegeCount > 0 ? "primary" : "default"}
                    variant="outlined"
                  />
                </Stack>
              }
              subheader="Control which areas of the system this employee can access"
              action={
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    onClick={() => {
                      const allPrivs = [];
                      getPrivileges(window.user?.clinic?.preferences || [])
                        .filter(e => typeof e.show === "undefined" || e.show)
                        .forEach(e => {
                          allPrivs.push(e.value);
                          if (e.children) {
                            e.children.forEach(c => allPrivs.push(c.value));
                          }
                        });
                      setFormData({ ...formData, privileges: allPrivs });
                    }}
                  >
                    Select All
                  </Button>
                  <Button
                    size="small"
                    color="secondary"
                    onClick={() => setFormData({ ...formData, privileges: [] })}
                  >
                    Clear All
                  </Button>
                </Stack>
              }
              sx={{
                backgroundColor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(255, 255, 255, 0.02)"
                    : "rgba(0, 0, 0, 0.01)",
              }}
            />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                {getPrivilegesTree(
                  getPrivileges(window.user?.clinic?.preferences || [])
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Account Status Section */}
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Account Status
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Inactive accounts cannot log in to the system
                  </Typography>
                </Box>
                <Switch
                  checked={formData.status === "Active"}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      status: event.target.checked ? "Active" : "Inactive",
                    })
                  }
                  color="success"
                />
              </Stack>
            </CardContent>
          </Card>
        </Form>
      </CardContent>
      <Divider />
      <CardActions sx={{ p: 2, justifyContent: "flex-end" }}>
        <Button
          variant="outlined"
          size="large"
          color="inherit"
          onClick={() => modal.close()}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </CardActions>
    </React.Fragment>
  );
};

export default EditUserAccessDetails;
