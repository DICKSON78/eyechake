import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  LinearProgress,
  Tooltip
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/DeleteRounded";
import Table, { SearchTextField } from "../../../components/Table";

import { useDelete, useFetch, usePost } from "../../../hooks";
import { formatError, getNonNull } from "../../../helpers";

const SelectDiagnoses = ({ consultationId, selected: initial, diagnosisType, fetchDiagnoses, modal }) => {

  const [data, setData] = useState();
  const [error, setError] = useState();

  const [diseaseName, setDiseaseName] = useState();

  const { data: diseases, loading: loadingDiseases } = useFetch("api/diseases", {
    status: "Active",
    per_page: 50000,
    q: diseaseName
  }, true, [], (response) => response.data.data.data);

  const [selected, setSelected] = useState(initial);

  const { data: dataPost, loading: loadingPost, error: errorPost, handlePost } = usePost();
  const { data: dataDelete, loading: loadingDelete, error: errorDelete, handleDelete } = useDelete();

  useEffect(() => {
    if (dataPost) {
      setData(dataPost);
      setSelected([...selected, dataPost.data]);
      fetchDiagnoses();
    }
  }, [dataPost]);

  useEffect(() => {
    if (dataDelete) {
      setData(dataDelete);
      setSelected(selected.filter((e) => e.id !== dataDelete.data.id));
      fetchDiagnoses();
    }
  }, [dataDelete]);

  useEffect(() => {
    if (errorPost) {
      setError(errorPost);
    }
  }, [errorPost]);

  useEffect(() => {
    if (errorDelete) {
      setError(errorDelete);
    }
  }, [errorDelete]);

  const handlePostDiagnosis = (item) => {
    setData(null);
    setError(null);
    handlePost("api/consultation-diagnoses", {
      consultation_id: consultationId,
      diagnosis_type: diagnosisType,
      disease_id: item.id
    });
  };

  const handleDeleteDiagnosis = (item) => {
    setData(null);
    setError(null);
    handleDelete(`api/consultation-diagnoses/${item.id}`);
  };

  const handleFeedback = () => {
    if (data || error) {
      return (
        <Alert
          sx={{ mb: 2 }}
          severity={error ? "error" : "success"}
        >
          {error ? formatError(error) : data ? data.message : null}
        </Alert>
      );
    }

    return null;
  };

  return (
    <React.Fragment>
      {(loadingPost || loadingDelete) ?
        <LinearProgress />
        : null
      }
      <CardContent sx={{ maxHeight: "calc(100vh - 160px)", overflowY: "auto" }}>
        {handleFeedback()}
        <Grid
          container
          spacing={2}
        >
          <Grid
            item
            md={5}
            sm={12}
            xs={12}
          >
            <Card variant="outlined">
              <CardHeader
                title="Select Disease"
                titleTypographyProps={{ variant: "subtitle1" }}
                action={(
                  <SearchTextField
                    onChange={(value) => setDiseaseName(value)}
                  />
                )}
                className="no-action-margin-right"
              />
              <Divider />
              {loadingDiseases && <LinearProgress />}
              <CardContent sx={{ height: "40vh", overflowY: "auto" }}>
                {diseases.map((e) => (
                  <FormControlLabel
                    key={e.id}
                    control={(
                      <Checkbox
                        checked={!!selected.find((f) => f.disease_id === e.id)}
                        onChange={(event) => {
                          if (event.target.checked) {
                            handlePostDiagnosis(e);
                          } else {
                            const item = selected.find((f) => f.disease_id === e.id);
                            if (item) {
                              handleDeleteDiagnosis(item);
                            }
                          }
                        }}
                      />
                    )}
                    label={e.name}
                    sx={{ display: "block" }}
                  />
                ))}
              </CardContent>
            </Card>
          </Grid>

          <Grid
            item
            md={7}
            sm={12}
            xs={12}
          >
            <Card variant="outlined">
              <CardHeader
                title="Selected Diseases"
                titleTypographyProps={{ variant: "subtitle1" }}
              />
              <Divider />
              <CardContent>
                <Table
                  columns={[
                    {
                      field: "index",
                      headerName: "S/N",
                      valueGetter: (item, index) => (index + 1),
                    },
                    {
                      field: "disease_name",
                      headerName: "Disease Name",
                      valueGetter: (item, index) => getNonNull(item.disease).name,
                    },
                    {
                      field: "disease_code",
                      headerName: "Disease Code",
                      valueGetter: (item, index) => getNonNull(item.disease).code,
                    },
                    {
                      field: "actions",
                      headerName: "Actions",
                      renderCell: (item) => (
                        <Tooltip title="Delete">
                          <span>
                            <IconButton
                              size="small"
                              disabled={loadingDelete}
                              onClick={() => handleDeleteDiagnosis(item)}
                            >
                              <DeleteIcon fontSize="small"/>
                            </IconButton>
                          </span>
                        </Tooltip>
                      ),
                    }
                  ]}
                  items={selected}
                  hidePaginationFooter
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </CardContent>
      <Divider />
      <CardActions>
        <Box flexGrow={1}/>
        <Button
          variant="text"
          size="large"
          onClick={() => modal.close()}
        >
          Close
        </Button>
      </CardActions>
    </React.Fragment>
  );
};

export default SelectDiagnoses;
