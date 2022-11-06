import React from "react";
import { Grid, Skeleton } from "@mui/material";

const LoadingSkeleton = () => {

  return (
    <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
      <Grid item md={3} sm={12} xs={12}>
        <Skeleton variant="rounded" height={128}/>
      </Grid>

      <Grid item md={3} sm={12} xs={12}>
        <Skeleton variant="rounded" height={128}/>
      </Grid>

      <Grid item md={3} sm={12} xs={12}>
        <Skeleton variant="rounded" height={128}/>
      </Grid>

      <Grid item md={3} sm={12} xs={12}>
        <Skeleton variant="rounded" height={128}/>
      </Grid>

      <Grid item md={8} sm={12} xs={12}>
        <Skeleton variant="rounded" height={272}/>
      </Grid>

      <Grid item md={4} sm={12} xs={12}>
        <Skeleton variant="rounded" height={272}/>
      </Grid>
    </Grid>
  );
};

export default LoadingSkeleton;
