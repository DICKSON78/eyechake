import React from "react";
import { Avatar, Box, Card, Grid, Stack, Typography } from "@mui/material";
import { North as IncreaseIcon, South as DecreaseIcon } from "@mui/icons-material";
import { alpha } from "@mui/material/styles";

const InfoCard = ({ title, count, percentageChange, icon, color }) => {
  return (
    <Grid
      item
      md={3}
      sm={12}
      xs={12}
    >
      <Card sx={{ p: 3 }}>
        <Stack
          direction="row"
          alignItems="center"
          flexWrap="wrap"
          spacing={2}
        >
          <Box flexGrow={1}>
            <Typography
              variant="h5"
              fontWeight="500"
            >
              {count}
            </Typography>
            <Typography
              color="text.secondary"
              mt="4px"
            >
              {title}
            </Typography>
          </Box>
          <Avatar
            sx={{
              bgcolor: color,
              boxShadow: `0 7px 30px ${alpha(color, 0.15)}`,
              width: 48,
              height: 48,
              position: "relative",
              "&::before": {
                content: `""`,
                position: "absolute",
                width: "7px",
                height: "46px",
                borderBottomRightRadius: "11px",
                borderTopRightRadius: "6px",
                top: "10%",
                right: "30%",
                backgroundColor: "rgba(255, 255, 255, 0.135)",
                transform: "rotate(35deg)",
              },
              "&::after": {
                content: `""`,
                position: "absolute",
                width: "6px",
                height: "48px",
                borderTopLeftRadius: "5px",
                borderBottomLeftRadius: "3px",
                top: "-4%",
                right: "50%",
                backgroundColor: "rgba(255, 255, 255, 0.135)",
                transform: "rotate(35deg)",
              }
            }}
          >
            {icon}
          </Avatar>
        </Stack>
        <Box
          display="inline-flex"
          flexDirection="row"
          alignItems="center"
          gap="4px"
          mt="4px"
        >
          <Typography
            component="span"
            variant="body2"
            fontWeight="500"
            color={percentageChange < 0 ? "error" : "primary"}
            display="inline-flex"
            flexDirection="row"
            alignItems="center"
          >
            {percentageChange < 0 ? <DecreaseIcon fontSize="10px"/> : <IncreaseIcon fontSize="10px"/>}
            {Math.abs(percentageChange)}{"%"}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            since last month
          </Typography>
        </Box>
      </Card>
    </Grid>
  );
};

export default InfoCard;
