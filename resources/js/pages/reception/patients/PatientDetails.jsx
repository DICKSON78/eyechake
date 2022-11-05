import React, { useEffect } from "react";
import { Alert, Skeleton } from "@mui/material";
import Descriptions from "../../../components/Descriptions";

import { useFetch } from "../../../hooks";
import { formatError, getNonNull } from "../../../helpers";

const PatientDetails = ({ patientId, setLoading, onLoadSuccess }) => {

  const { data, loading, error } = useFetch(`api/patients/${patientId}`, null, true, null, (response) => response.data.data);

  useEffect(() => {
    if (typeof setLoading === "function") {
      setLoading(loading);
    }
  }, [loading]);

  useEffect(() => {
    if (data && (typeof onLoadSuccess === "function")) {
      onLoadSuccess(data);
    }
  }, [data]);

  const handleFeedback = () => {
    if (error) {
      return (
        <Alert
          sx={{ mb: 2 }}
          severity={"error"}
        >
          {formatError(error)}
        </Alert>
      );
    }

    return null;
  };

  return (
    <React.Fragment>
      {handleFeedback()}
      {loading ?
        <Skeleton
          variant="rounded"
          height={128}
          sx={{ mb: 2 }}
        />
        : null
      }
      {data ?
        <Descriptions
          columns={4}
          items={[
            { label: "Patient Name", value: data.full_name },
            { label: "Patient Number", value: data.id },
            { label: "Date of Birth", value: data.date_of_birth },
            { label: "Gender", value: data.gender },
            { label: "Phone Number", value: data.phone },
            { label: "Region", value: getNonNull(data.region).name },
            { label: "District", value: getNonNull(data.district).name },
            { label: "Payment Mode", value: getNonNull(data.payment_mode).name },
          ]}
          containerProps={{
            sx: {
              mb: 2,
              p: 2,
              bgcolor: (theme) => theme.palette.primary.main,
            }
          }}
          itemSpacing={1}
          itemProps={{
            sx: {
              "& .MuiTypography-root": {
                color: (theme) => theme.palette.primary.contrastText,
              }
            }
          }}
        />
        : null
      }
    </React.Fragment>
  );
};

export default PatientDetails;
