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
        size={{ xs: 12, sm: 12, md: 6 }}
      >
        <Grid
          container
          spacing={{ xs: 2, sm: 2, md: 3 }}
        >
          <Grid
            size={{ xs: 12, sm: 12, md: 6 }}
          >
            <Skeleton
              variant="rounded"
              height={96}
            />
          </Grid>
          <Grid
            size={{ xs: 12, sm: 12, md: 6 }}
          >
            <Skeleton
              variant="rounded"
              height={96}
            />
          </Grid>
          <Grid
            size={{ xs: 12, sm: 12, md: 6 }}
          >
            <Skeleton
              variant="rounded"
              height={96}
            />
          </Grid>
          <Grid
            size={{ xs: 12, sm: 12, md: 6 }}
          >
            <Skeleton
              variant="rounded"
              height={96}
            />
          </Grid>
          <Grid
            size={{ xs: 12, sm: 12, md: 6 }}
          >
            <Skeleton
              variant="rounded"
              height={96}
            />
          </Grid>
          <Grid
            size={{ xs: 12, sm: 12, md: 6 }}
          >
            <Skeleton
              variant="rounded"
              height={96}
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid
        size={{ xs: 12, sm: 12, md: 3 }}
      >
        <Skeleton
          variant="rounded"
          height={336}
        />
      </Grid>
      <Grid
        size={{ xs: 12, sm: 12, md: 3 }}
      >
        <Skeleton
          variant="rounded"
          height={336}
        />
      </Grid>
      <Grid
        size={{ xs: 12, sm: 12, md: 6 }}
      >
        <Skeleton
          variant="rounded"
          height={256}
        />
      </Grid>
      <Grid
        size={{ xs: 12, sm: 12, md: 6 }}
      >
        <Skeleton
          variant="rounded"
          height={256}
        />
      </Grid>
    </Grid>
  );
};

export default LoadingSkeleton;
