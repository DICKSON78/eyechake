import React from "react";
import { Box, Breadcrumbs, Divider, Link, Paper, Stack, Typography } from "@mui/material";
import { ChevronRightRounded as ChevronRightIcon } from "@mui/icons-material";

const Header = ({ title, subtitle, leading, trailing, containerProps }) => {
  return (
    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
      flexWrap="wrap"
      px={2}
      pt={2}
      {...(containerProps || {})}
    >
      {leading}
      {title ?
        <React.Fragment>
          <Box flexGrow={1}>
            <Typography
              variant="h6"
              fontWeight="400"
            >
              {title}
            </Typography>
            {subtitle ?
              <Typography
                variant="subtitle2"
                color="textSecondary"
              >
                {subtitle}
              </Typography>
              : null
            }
          </Box>
        </React.Fragment>
        : null
      }
      {trailing}
    </Stack>
  );
};

const Page = ({ breadcrumbs, children }) => {

  breadcrumbs = breadcrumbs || [];

  const getBreadcrumbs = () => {
    return (
      <Breadcrumbs separator={<ChevronRightIcon fontSize="small"/>}>
        {breadcrumbs.map((e, i, a) => {
          if (e.path) {
            return (
              <Link
                key={e.title}
                color="inherit"
                fontSize="small"
                href={e.to}
              >
                {e.title}
              </Link>
            );
          }

          return (
            <Typography
              key={e.title}
              {...(i === a.length - 1 ? { color: "text.primary" } : {})}
              fontSize="small"
            >
              {e.title}
            </Typography>
          );
        })}
      </Breadcrumbs>
    );
  };

  return (
    <React.Fragment>
      {breadcrumbs.length ?
        <React.Fragment>
          <Paper
            square
            elevation={0}
            sx={{ px: { xs: 2, sm: 2, md: 3 }, py: 1 }}
          >
            {getBreadcrumbs()}
          </Paper>
          <Divider />
        </React.Fragment>
        : null
      }
      <Box m={{ xs: 2, sm: 2, md: 3 }}>
        {children}
      </Box>
    </React.Fragment>
  );
};

export { Header };
export default Page;
