import React from "react";
import { Box, Card, CardContent, CardHeader, Chip, CircularProgress, Divider, LinearProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { green, orange, red, grey } from "@mui/material/colors";
import { TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon, TrendingFlat as TrendingFlatIcon } from "@mui/icons-material";
import { numberFormat } from "../../helpers";

const getColor = (r, t) => { 
  if (!t) return grey[500]; 
  const p = (Number(r)/Number(t))*100; 
  return p>=100?green[600]:p>=75?orange[600]:red[600]; 
};

const getChipColor = (r, t) => { 
  if (!t) return "default"; 
  const p = (Number(r)/Number(t))*100; 
  return p>=100?"success":p>=75?"warning":"error"; 
};

const KPIReportCardTable = ({ title, rows=[], kpis=[], loading=false }) => {
  const tableRows = kpis.length>0 ? 
    kpis.map(k=>({
      label:k.name, 
      target:k.formatted_target||numberFormat(k.target), 
      results:k.formatted_result||numberFormat(k.result), 
      _r:k.result, 
      _t:k.target 
    })) : 
    rows.map(r=>({...r, label:r.medicine||r.label}));

  return (
    <Card sx={{ mt:3, boxShadow:"0 2px 12px rgba(0,0,0,0.08)", borderRadius:2 }}>
      <CardHeader title={title} titleTypographyProps={{ variant:"h6", fontWeight:700 }} />
      <Divider />
      <CardContent sx={{ p:0 }}>
        {loading ? (
          <Box sx={{ display:"flex", justifyContent:"center", p:4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : tableRows.length===0 ? (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
            No data available.
          </Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor:"grey.50" }}>
                  <TableCell sx={{ fontWeight:700 }}>DESCRIPTION</TableCell>
                  <TableCell align="right" sx={{ fontWeight:700 }}>TARGET</TableCell>
                  <TableCell align="right" sx={{ fontWeight:700 }}>RESULTS</TableCell>
                  <TableCell align="center" sx={{ fontWeight:700 }}>STATUS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tableRows.map((row,i) => {
                  const r=row._r, t=row._t;
                  const pct = t>0 ? Math.min(100,Math.round((r/t)*100)) : null;
                  const trend = t>0 ? Math.round(((r-t)/t)*100) : 0;
                  const color = getColor(r,t);
                  return (
                    <TableRow key={i} sx={{ "&:last-child td":{border:0}, "&:hover":{bgcolor:"action.hover"} }}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>{row.label}</Typography>
                        {pct!==null && (
                          <LinearProgress 
                            variant="determinate" 
                            value={pct} 
                            sx={{ 
                              mt:0.5, 
                              height:4, 
                              borderRadius:2, 
                              bgcolor:"grey.200", 
                              "& .MuiLinearProgress-bar":{bgcolor:color,borderRadius:2} 
                            }} 
                          />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="text.secondary">{row.target}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={700} color={t>0?color:"text.primary"}>
                          {row.results}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {pct!==null ? (
                          <Box sx={{ display:"flex", alignItems:"center", justifyContent:"center", gap:0.5 }}>
                            <Chip label={pct+"%"} size="small" color={getChipColor(r,t)} variant="outlined" />
                            {trend>0 && <TrendingUpIcon fontSize="small" sx={{ color:green[600] }} />}
                            {trend<0 && <TrendingDownIcon fontSize="small" sx={{ color:red[600] }} />}
                            {trend===0 && <TrendingFlatIcon fontSize="small" sx={{ color:grey[500] }} />}
                          </Box>
                        ) : (
                          <Typography variant="caption" color="text.secondary">—</Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default KPIReportCardTable;
