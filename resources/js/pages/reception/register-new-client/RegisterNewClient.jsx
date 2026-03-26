import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme, alpha } from "@mui/material/styles";

import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  LinearProgress,
  Stack,
  FormControlLabel,
  Checkbox,
  Typography,
  Alert,
  Paper,
  Container,
  Chip,
} from "@mui/material";
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  Category as CategoryIcon,
  CheckCircle as CheckCircleIcon,
  LocationOn as LocationIcon,
  Email as EmailIcon,
  Work as WorkIcon,
  Payment as PaymentIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import Form from "../../../components/Form";
import TextField from "../../../components/TextField";
import DatePicker from "../../../components/DatePicker";
import Select from "../../../components/Select";
import Page from "../../../components/Page";

import moment from "moment";
import { useFetch, usePost, useToast } from "../../../hooks";
import {
  formatDateForDb,
  formatError,
  getValidationRules,
  validateInteger,
} from "../../../helpers";

// Import static location data for cascading dropdowns
import { tanzaniaLocationData, getRegions, getDistrictsByRegionName, getWardsByDistrictName } from "../../../data/tanzaniaLocationsComplete";

const validationRules = getValidationRules();

const RegisterNewClient = () => {
  const theme = useTheme();
  const addToast = useToast();
  const navigate = useNavigate();

  const formRef = useRef();
  const firstNameRef = useRef();
  const middleNameRef = useRef();
  const lastNameRef = useRef();
  const genderRef = useRef();
  const dateOfBirthRef = useRef();
  const ageRef = useRef();
  const addressRef = useRef();
  const nationalIdRef = useRef();
  const phoneRef = useRef();
  const emailRef = useRef();
  const occupationRef = useRef();
  const paymentModeRef = useRef();
  const informationSourceRef = useRef();
  const regionRef = useRef();
  const districtRef = useRef();
  const wardRef = useRef();

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

  const { data: informationSources } = useFetch(
    "api/marketing/information-sources",
    {
      status: "Active",
      per_page: 500,
    },
    true,
    [],
    (response) => response.data.data.data
  );

  const { data: occupations } = useFetch(
    "api/occupations",
    {
      status: "Active",
      per_page: 500,
    },
    true,
    [],
    (response) => response.data.data.data
  );

  // Fetch regions from API for ID mapping (we'll use static data for UI)
  const { data: apiRegions, loading: regionsLoading, error: regionsError } = useFetch(
    "api/regions",
    {
      status: "Active",
      per_page: 500,
    },
    true,
    [],
    (response) => {
      try {
        const paginatedData = response?.data?.data;
        if (paginatedData && typeof paginatedData === 'object' && !Array.isArray(paginatedData)) {
          if (Array.isArray(paginatedData.data)) {
            return paginatedData.data;
          }
        }
        if (Array.isArray(paginatedData)) {
          return paginatedData;
        }
        if (Array.isArray(response?.data)) {
          return response.data;
        }
        return [];
      } catch (error) {
        console.error('Error parsing regions response:', error);
        return [];
      }
    }
  );

  // Use static data for regions dropdown (from JSON structure)
  const staticRegions = getRegions();

  // State for districts and wards (using static data)
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [availableWards, setAvailableWards] = useState([]);

  // State to track selected names (for mapping to IDs)
  const [selectedRegionName, setSelectedRegionName] = useState(null);
  const [selectedDistrictName, setSelectedDistrictName] = useState(null);
  const [selectedWardName, setSelectedWardName] = useState(null);

  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    gender: '',
    date_of_birth: null,
    age: null,
    region_id: null,
    district_id: null,
    ward_id: null,
    address: '',
    national_id: '',
    phone: '',
    email: '',
    occupation: '',
    payment_mode_id: null,
    info_source_id: null,
    is_vip: false,
    is_student: false,
    is_businessperson: false,
    is_outreach: false,
    is_employee: false,
  });

  const [submitError, setSubmitError] = useState(null);
  const lastUpdatedFieldRef = useRef(null);

  const { data, loading, error, handlePost } = usePost("api/patients");

  useEffect(() => {
    document.title = `Register New Client - ${window.APP_NAME}`;
  }, []);

  // Debug: Log regions data when it changes
  useEffect(() => {
    console.log('Regions state changed:', {
      apiRegions: apiRegions,
      apiRegionsType: typeof apiRegions,
      isArray: Array.isArray(apiRegions),
      count: Array.isArray(apiRegions) ? apiRegions.length : (apiRegions ? 'not array' : 'null/undefined'),
      loading: regionsLoading,
      error: regionsError,
      staticRegions: staticRegions,
      staticRegionsCount: Array.isArray(staticRegions) ? staticRegions.length : 0
    });
  }, [apiRegions, regionsLoading, regionsError, staticRegions]);

  useEffect(() => {
    if (data) {
      const createdId = data?.data?.id;
      if (createdId) {
        addToast({ message: data.message || "Patient registered successfully", severity: "success" });
        window.setTimeout(() => {
          navigate(`/reception/patients/${createdId}/check-in`);
        }, 1000);
      } else {
        addToast({
          message: data?.data?.error || "Registration failed. Please try again.",
          severity: "error",
        });
      }
    }
  }, [data, addToast, navigate]);

  useEffect(() => {
    if (error) {
      let errorMessage = formatError(error);

      // Extract validation errors - check multiple possible locations
      const responseData = error?.response?.data;
      let validationErrors = null;

      // Check different possible locations for validation errors
      if (responseData?.errors) {
        validationErrors = responseData.errors;
      } else if (responseData?.data?.errors) {
        validationErrors = responseData.data.errors;
      } else if (responseData?.data && typeof responseData.data === 'object') {
        // Sometimes errors are in the data object directly
        validationErrors = responseData.data;
      }

      if (validationErrors && typeof validationErrors === 'object') {
        const errorMessages = Object.entries(validationErrors)
          .map(([field, messages]) => {
            const fieldName = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            const messageText = Array.isArray(messages) ? messages.join(', ') : (messages || 'Invalid value');
            return `${fieldName}: ${messageText}`;
          })
          .join('; ');

        if (errorMessages) {
          errorMessage = errorMessages;
        }
      } else if (responseData?.message) {
        errorMessage = responseData.message;
      } else if (responseData?.error) {
        errorMessage = responseData.error;
      }

      setSubmitError(errorMessage);
      addToast({ message: errorMessage, severity: "error" });
      console.error('Registration error:', error);
      console.error('Error response data:', responseData);
      console.error('Validation errors:', validationErrors);
    } else {
      setSubmitError(null);
    }
  }, [error, addToast]);

  useEffect(() => {
    if (ageRef.current && lastUpdatedFieldRef.current === 'date_of_birth' && formData.age !== null && formData.age !== undefined) {
      const ageValue = formData.age.toString();
      setTimeout(() => {
        if (ageRef.current) {
          ageRef.current.setValue(ageValue, false);
        }
      }, 0);
    }
  }, [formData.age]);

  // Update districts when region name changes - use static data
  useEffect(() => {
    if (selectedRegionName) {
      const districts = getDistrictsByRegionName(selectedRegionName);
      setAvailableDistricts(districts);

      // Try to find matching region ID from API
      if (apiRegions && Array.isArray(apiRegions)) {
        const matchingRegion = apiRegions.find(r =>
          r.name?.toLowerCase() === selectedRegionName.toLowerCase()
        );
        if (matchingRegion) {
          setFormData(prev => ({
            ...prev,
            region_id: matchingRegion.id,
            district_id: null,
            ward_id: null
          }));
        }
      }
    } else {
      setAvailableDistricts([]);
      setAvailableWards([]);
      setFormData(prev => ({ ...prev, region_id: null, district_id: null, ward_id: null }));
      setSelectedDistrictName(null);
      setSelectedWardName(null);
    }
  }, [selectedRegionName, apiRegions]);

  // Update wards when district name changes - use static data
  useEffect(() => {
    if (selectedRegionName && selectedDistrictName) {
      const wards = getWardsByDistrictName(selectedRegionName, selectedDistrictName);
      setAvailableWards(wards);

      // Try to find matching district ID from API
      if (formData.region_id) {
        window.axios
          .get("api/districts", {
            params: {
              region_id: formData.region_id,
              status: "Active",
              per_page: 500,
            },
          })
          .then((response) => {
            const backendData = response?.data?.data;
            let districtsData = [];

            if (backendData && typeof backendData === 'object' && !Array.isArray(backendData) && Array.isArray(backendData.data)) {
              districtsData = backendData.data;
            } else if (Array.isArray(backendData)) {
              districtsData = backendData;
            }

            const matchingDistrict = districtsData.find(d =>
              d.name?.toLowerCase() === selectedDistrictName.toLowerCase()
            );
            if (matchingDistrict) {
              setFormData(prev => ({
                ...prev,
                district_id: matchingDistrict.id,
                ward_id: null
              }));
            }
          })
          .catch((error) => {
            console.error("Error fetching districts from API:", error);
          });
      }
    } else {
      setAvailableWards([]);
      setFormData(prev => ({ ...prev, district_id: null, ward_id: null }));
      setSelectedWardName(null);
    }
  }, [selectedRegionName, selectedDistrictName, formData.region_id]);

  // Update ward ID when ward name is selected
  useEffect(() => {
    if (selectedRegionName && selectedDistrictName && selectedWardName && formData.district_id) {
      window.axios
        .get("api/wards", {
          params: {
            district_id: formData.district_id,
            status: "Active",
            per_page: 500,
          },
        })
        .then((response) => {
          const backendData = response?.data?.data;
          let wardsData = [];

          if (backendData && typeof backendData === 'object' && !Array.isArray(backendData) && Array.isArray(backendData.data)) {
            wardsData = backendData.data;
          } else if (Array.isArray(backendData)) {
            wardsData = backendData;
          }

          const matchingWard = wardsData.find(w =>
            w.name?.toLowerCase() === selectedWardName.toLowerCase()
          );
          if (matchingWard) {
            setFormData(prev => ({ ...prev, ward_id: matchingWard.id }));
          }
        })
        .catch((error) => {
          console.error("Error fetching wards from API:", error);
        });
    }
  }, [selectedWardName, formData.district_id]);

  const handleSubmit = () => {
    setSubmitError(null);

    // Validate form using formRef
    if (!formRef.current.validate()) {
      return;
    }

    // Additional validation: Check if payment_mode_id is selected
    if (!formData.payment_mode_id || formData.payment_mode_id === null || formData.payment_mode_id === 0) {
      addToast({
        message: "Please select a payment mode. This field is required.",
        severity: "error"
      });
      return;
    }

    // Validate required fields
    if (!formData.first_name?.trim()) {
      addToast({ message: "First name is required", severity: "error" });
      return;
    }

    if (!formData.last_name?.trim()) {
      addToast({ message: "Last name is required", severity: "error" });
      return;
    }

    if (!formData.gender) {
      addToast({ message: "Gender is required", severity: "error" });
      return;
    }

    if (!formData.phone?.trim()) {
      addToast({ message: "Phone number is required", severity: "error" });
      return;
    }

    // Debug: Log formData before building payload
    console.log('FormData before building payload:', formData);

    // Build payload - get actual values (they should be non-empty due to validation above)
    const payload = {
      first_name: formData.first_name?.trim() || '',
      middle_name: formData.middle_name?.trim() || null,
      last_name: formData.last_name?.trim() || '',
      gender: formData.gender || '',
      date_of_birth: formData.date_of_birth ? formatDateForDb(formData.date_of_birth) : null,
      phone: formData.phone?.trim() || '',
      email: formData.email?.trim() || null,
      address: formData.address?.trim() || null,
      national_id: formData.national_id?.trim() || null,
      occupation: formData.occupation?.trim() || null,
      payment_mode_id: formData.payment_mode_id || null,
      info_source_id: formData.info_source_id || null,
      region_id: formData.region_id || null,
      district_id: formData.district_id || null,
      ward_id: formData.ward_id || null,
      is_vip: Boolean(formData.is_vip),
      is_student: Boolean(formData.is_student),
      is_businessperson: Boolean(formData.is_businessperson),
      is_outreach: Boolean(formData.is_outreach),
      is_employee: Boolean(formData.is_employee),
    };

    // Handle optional string fields - convert empty strings to null
    const optionalStringFields = ['middle_name', 'email', 'address', 'national_id', 'occupation'];
    optionalStringFields.forEach(field => {
      if (payload[field] === '' || payload[field] === undefined || !payload[field]) {
        payload[field] = null;
      }
    });

    // Handle optional integer fields - convert to integer or null
    // region_id, district_id, ward_id, info_source_id are optional
    // IMPORTANT: Only send IDs that exist in the database
    // If using static data, we need to ensure the ID matches a database record
    const optionalIntegerFields = ['region_id', 'district_id', 'ward_id', 'info_source_id'];
    optionalIntegerFields.forEach(field => {
      const value = payload[field];
      if (value === '' || value === undefined || value === null || value === 0 || isNaN(value)) {
        payload[field] = null;
      } else {
        const intValue = parseInt(value, 10);
        if (isNaN(intValue) || intValue <= 0) {
          payload[field] = null;
        } else {
          // Validate that the ID is valid
          // If we're using static data and the ID might not match database, we should verify
          // For now, we'll trust that if API data is available, IDs are correct
          // If using static data, we'll send the ID but backend validation will catch invalid IDs
          payload[field] = intValue;
        }
      }
    });

    // Additional validation: If using static data IDs, ensure they're reasonable
    // Static region IDs are 1-31, static district IDs are 100+, static ward IDs are 20000+
    // Database IDs are typically auto-increment starting from 1
    // If we detect a static data ID pattern that doesn't match database patterns, log a warning
    if (payload.region_id && payload.region_id > 100) {
      console.warn('Region ID seems unusually high, may be a static data ID mismatch:', payload.region_id);
    }
    if (payload.district_id && payload.district_id > 10000) {
      console.warn('District ID seems unusually high, may be a static data ID mismatch:', payload.district_id);
    }
    if (payload.ward_id && payload.ward_id > 100000) {
      console.warn('Ward ID seems unusually high, may be a static data ID mismatch:', payload.ward_id);
    }

    // Handle required integer field - payment_mode_id
    // This field is REQUIRED, so we must ensure it's a valid integer
    if (payload.payment_mode_id === '' || payload.payment_mode_id === undefined || payload.payment_mode_id === null || payload.payment_mode_id === 0) {
      console.error('Payment mode ID is required but missing or invalid:', payload.payment_mode_id);
      // Set to null to trigger backend validation error with clear message
      payload.payment_mode_id = null;
    } else {
      const intValue = parseInt(payload.payment_mode_id, 10);
      if (isNaN(intValue) || intValue <= 0) {
        console.error('Payment mode ID is not a valid number:', payload.payment_mode_id);
        payload.payment_mode_id = null;
      } else {
        payload.payment_mode_id = intValue;
      }
    }

    // Remove undefined values
    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined) {
        delete payload[key];
      }
    });

    // Debug: Log the final payload before sending
    console.log('Final payload being sent to API:', payload);
    console.log('Payment Mode ID:', payload.payment_mode_id, 'Type:', typeof payload.payment_mode_id);

    handlePost("api/patients", payload);
  };

  return (
    <Page
      breadcrumbs={[
        { title: "Home" },
        { title: "Reception" },
        { title: "Register New Client" },
      ]}
    >
      <Container maxWidth="lg" sx={{ py: 1, px: 1.5, mt: -1 }}>
        {/* Header Section */}
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="h4"
            component="h1"
            fontWeight={700}
            sx={{ mb: 0.5, color: theme.palette.text.primary }}
          >
            Register New Patient
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Complete all required fields to register a new patient in the system
          </Typography>
        </Box>

        {loading && <LinearProgress sx={{ mb: 1.5, borderRadius: 2, height: 6 }} />}

        {submitError && (
          <Alert severity="error" sx={{ mb: 1.5, borderRadius: 2 }}>
            {submitError}
          </Alert>
        )}

        <Form ref={formRef}>
          <Card>
            <CardContent sx={{ p: 2 }}>
              <Grid container spacing={2}>
                {/* Section 1: Personal Information */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="h6" sx={{ mt: 0, mb: 1.5 }}>
                    Personal Information
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <TextField
                    ref={firstNameRef}
                    label="First Name"
                    fullWidth
                    required
                    onChange={(value) =>
                      setFormData({ ...formData, first_name: value })
                    }
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <TextField
                    ref={middleNameRef}
                    label="Middle Name"
                    fullWidth
                    onChange={(value) =>
                      setFormData({ ...formData, middle_name: value })
                    }
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <TextField
                    ref={lastNameRef}
                    label="Last Name"
                    fullWidth
                    required
                    onChange={(value) =>
                      setFormData({ ...formData, last_name: value })
                    }
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Select
                    ref={genderRef}
                    label="Gender"
                    fullWidth
                    required
                    options={["Male", "Female"]}
                    onChange={(value) =>
                      setFormData({ ...formData, gender: value })
                    }
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <DatePicker
                    ref={dateOfBirthRef}
                    label="Date of Birth"
                    fullWidth
                    value={formData.date_of_birth}
                    onChange={(value) => {
                      const newDate = !isNaN(value) && value !== null && value !== undefined ? value : null;
                      lastUpdatedFieldRef.current = 'date_of_birth';

                      let calculatedAge = null;
                      if (newDate) {
                        const years = moment().diff(moment(newDate), "years");
                        calculatedAge = years >= 0 ? Math.floor(years) : null;
                      }

                      setFormData({
                        ...formData,
                        date_of_birth: newDate,
                        age: calculatedAge,
                      });
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <TextField
                    ref={ageRef}
                    label="Age (Years)"
                    fullWidth
                    value={formData.age !== null && formData.age !== undefined ? formData.age.toString() : ''}
                    rules={[validationRules.optionalInteger]}
                    onChange={(value) => {
                      lastUpdatedFieldRef.current = 'age';
                      const age = validateInteger(value);

                      if (age !== null && age !== undefined && age >= 0) {
                        const calculatedDateOfBirth = moment().subtract(age, "years").startOf('day').toDate();
                        setFormData({
                          ...formData,
                          age: age,
                          date_of_birth: calculatedDateOfBirth,
                        });
                      } else if (value === '' || value === null || value === undefined) {
                        setFormData({
                          ...formData,
                          age: null,
                          date_of_birth: null,
                        });
                      }
                    }}
                    helperText={
                      formData.date_of_birth
                        ? "Auto-calculated from date of birth"
                        : "Enter age to auto-calculate date of birth"
                    }
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <TextField
                    ref={nationalIdRef}
                    label="National ID"
                    fullWidth
                    onChange={(value) =>
                      setFormData({ ...formData, national_id: value })
                    }
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Select
                    ref={occupationRef}
                    label="Occupation"
                    fullWidth
                    clearable
                    options={occupations}
                    optionsLabel="name"
                    optionsValue="name"
                    onChange={(value) =>
                      setFormData({ ...formData, occupation: value })
                    }
                  />
                </Grid>

                {/* Section 2: Contact Information */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="h6" sx={{ mt: 1.5, mb: 1.5 }}>
                    Contact Information
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <TextField
                    ref={phoneRef}
                    label="Phone Number"
                    fullWidth
                    required
                    type="tel"
                    rules={[validationRules.requiredPhone]}
                    onChange={(value) => setFormData({ ...formData, phone: value })}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <TextField
                    ref={emailRef}
                    label="Email Address"
                    fullWidth
                    type="email"
                    rules={[validationRules.optionalEmail]}
                    onChange={(value) => setFormData({ ...formData, email: value })}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <TextField
                    ref={addressRef}
                    label="Address"
                    fullWidth
                    multiline
                    rows={3}
                    onChange={(value) =>
                      setFormData({ ...formData, address: value })
                    }
                  />
                </Grid>

                {/* Section 3: Location Details */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="h6" sx={{ mt: 1.5, mb: 1.5 }}>
                    Location Details (Tanzania)
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Select
                    ref={regionRef}
                    label="Region"
                    fullWidth
                    clearable
                    value={selectedRegionName}
                    options={staticRegions}
                    optionsLabel="name"
                    optionsValue="name"
                    placeholder="Select a region (optional)"
                    onChange={(value) => {
                      setSelectedRegionName(value || null);
                      setSelectedDistrictName(null);
                      setSelectedWardName(null);
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Select
                    ref={districtRef}
                    label="District"
                    fullWidth
                    clearable
                    disabled={!selectedRegionName || availableDistricts.length === 0}
                    value={selectedDistrictName}
                    options={availableDistricts}
                    optionsLabel="name"
                    optionsValue="name"
                    placeholder={
                      !selectedRegionName
                        ? "Select a region first"
                        : availableDistricts.length === 0
                          ? "No districts available for this region"
                          : "Select a district (optional)"
                    }
                    onChange={(value) => {
                      setSelectedDistrictName(value || null);
                      setSelectedWardName(null);
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Select
                    ref={wardRef}
                    label="Ward"
                    fullWidth
                    clearable
                    disabled={!selectedDistrictName || availableWards.length === 0}
                    value={selectedWardName}
                    options={availableWards}
                    optionsLabel="name"
                    optionsValue="name"
                    placeholder={
                      !selectedDistrictName
                        ? "Select a district first"
                        : availableWards.length === 0
                          ? "No wards available for this district"
                          : "Select a ward (optional)"
                    }
                    onChange={(value) => {
                      setSelectedWardName(value || null);
                    }}
                  />
                </Grid>

                {/* Section 4: Payment & Information */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="h6" sx={{ mt: 1.5, mb: 1.5 }}>
                    Payment & Information
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Select
                    ref={paymentModeRef}
                    label="Payment Mode"
                    fullWidth
                    required
                    options={paymentModes}
                    optionsLabel="name"
                    optionsValue="id"
                    onChange={(value) => {
                      // The Select component with optionsValue="id" should already return just the ID
                      // But handle both cases: if it's an object, extract the ID; if it's already an ID, use it
                      const paymentModeId = (typeof value === 'object' && value !== null) ? value.id : value;
                      setFormData({ ...formData, payment_mode_id: paymentModeId });
                    }}
                  />
                </Grid>


                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Select
                    ref={informationSourceRef}
                    label="Source of Information"
                    fullWidth
                    clearable
                    options={informationSources}
                    optionsLabel="name"
                    optionsValue="id"
                    onChange={(value) => setFormData({ ...formData, info_source_id: value })}
                  />
                </Grid>
                {/* Section 5: Client Type */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="h6" sx={{ mt: 1.5, mb: 0.5 }}>
                    Client Type
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    Select all categories that apply to this client
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} flexWrap="wrap">
                    {[
                      { key: 'is_student', label: 'Student', icon: '🎓' },
                      { key: 'is_businessperson', label: 'Businessperson', icon: '💼' },
                      { key: 'is_vip', label: 'Prestige', icon: '⭐' },
                      { key: 'is_outreach', label: 'Outreach Client', icon: '🤝' },
                      { key: 'is_employee', label: 'VIP', icon: '👔' },
                    ].map(({ key, label, icon }) => (
                      <Paper
                        key={key}
                        elevation={0}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          border: `2px solid ${formData[key] ? theme.palette.secondary.main : theme.palette.divider}`,
                          backgroundColor: formData[key]
                            ? alpha(theme.palette.secondary.main, 0.1)
                            : theme.palette.background.paper,
                          transition: 'all 0.2s ease',
                          cursor: 'pointer',
                          flex: { xs: '1 1 100%', sm: '1 1 auto' },
                          minWidth: { sm: 140 },
                          '&:hover': {
                            borderColor: theme.palette.secondary.main,
                            backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                            transform: 'translateY(-2px)',
                            boxShadow: `0 4px 12px ${alpha(theme.palette.secondary.main, 0.2)}`,
                          },
                        }}
                        onClick={() =>
                          setFormData({ ...formData, [key]: !formData[key] })
                        }
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData[key]}
                              onChange={(e) =>
                                setFormData({ ...formData, [key]: e.target.checked })
                              }
                              sx={{
                                color: theme.palette.secondary.main,
                                '&.Mui-checked': {
                                  color: theme.palette.secondary.main,
                                },
                              }}
                            />
                          }
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography component="span" sx={{ fontSize: 18 }}>
                                {icon}
                              </Typography>
                              <Typography variant="body2" fontWeight={600}>
                                {label}
                              </Typography>
                            </Box>
                          }
                          sx={{ m: 0 }}
                        />
                      </Paper>
                    ))}
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>

            {/* Submit Button */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                p: 2,
                pt: 1.5,
                borderTop: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={loading ? null : <CheckCircleIcon />}
                size="large"
                sx={{
                  minWidth: 220,
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 1.5,
                  px: 5,
                  fontSize: '1rem',
                  borderRadius: 2,
                  boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                  '&:hover': {
                    boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.5)}`,
                  },
                }}
              >
                {loading ? "Registering Patient..." : "Register Patient"}
              </Button>
            </Box>
          </Card>
        </Form>
      </Container>
    </Page>
  );
};

export default RegisterNewClient;
