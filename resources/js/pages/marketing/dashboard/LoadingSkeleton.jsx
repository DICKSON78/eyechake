import React from "react";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";

const LoadingSkeleton = () => {
  return (
    <Grid
      container
      spacing={{ xs: 2, sm: 2, md: 3 }}
    >
      <Grid
        size={{ xs: 12, sm: 6, md: 3 }}
      >
        <Skeleton
          variant="rounded"
          height={250}
        />
      </Grid>
      <Grid
        size={{ xs: 12, sm: 6, md: 3 }}
      >
        <Skeleton
          variant="rounded"
          height={250}
        />
      </Grid>
      <Grid
        size={{ xs: 12, sm: 6, md: 3 }}
      >
        <Skeleton
          variant="rounded"
          height={250}
        />
      </Grid>
      <Grid
        size={{ xs: 12, sm: 6, md: 3 }}
      >
        <Skeleton
          variant="rounded"
          height={250}
        />
      </Grid>
      <Grid
        size={{ xs: 12, sm: 12, md: 6 }}
      >
        <Skeleton
          variant="rounded"
          height={300}
        />
      </Grid>
      <Grid
        size={{ xs: 12, sm: 12, md: 6 }}
      >
        <Skeleton
          variant="rounded"
          height={300}
        />
      </Grid>
    </Grid>
  );
};

export default LoadingSkeleton;
