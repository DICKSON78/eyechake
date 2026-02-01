import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Typography,
  Tabs,
  Tab,
  Container,
  Stack,
  Paper,
  alpha,
} from "@mui/material";
import {
  AddRounded as AddIcon,
  ChevronLeftRounded as ChevronLeftIcon,
  ChevronRightRounded as ChevronRightIcon,
  TodayRounded as TodayIcon,
  EventRounded as EventIcon,
  CalendarTodayRounded as CalendarTodayIcon,
} from "@mui/icons-material";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths, addWeeks, subWeeks, addDays as addDaysFn, startOfDay, endOfDay } from "date-fns";

import Page, { Header as PageHeader } from "../../components/Page";
import Modal from "../../components/Modal";
import { useFetch, useToast } from "../../hooks";
import { formatError } from "../../helpers";
import CreateEvent from "./CreateEvent";
import EditEvent from "./EditEvent";

const Calendar = () => {
  const addToast = useToast();
  const modalRef = useRef();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("month"); // month, week, day
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Check if user has calendar edit privilege
  const canEditCalendar = () => {
    const user = window.user || {};
    const privileges = user.privileges || {};
    const isGranted = (v) => v === true || v === 1 || v === "1" || v === "true" || v === "Yes" || v === "yes";
    return isGranted(privileges.calendar_edit) || user.role === "Admin" || user.is_admin;
  };

  // Calculate date range based on view
  const getDateRange = () => {
    if (view === "month") {
      return {
        start_date: format(startOfMonth(currentDate), "yyyy-MM-dd"),
        end_date: format(endOfMonth(currentDate), "yyyy-MM-dd"),
      };
    } else if (view === "week") {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
      return {
        start_date: format(weekStart, "yyyy-MM-dd"),
        end_date: format(weekEnd, "yyyy-MM-dd"),
      };
    } else {
      // day view
      return {
        start_date: format(startOfDay(currentDate), "yyyy-MM-dd"),
        end_date: format(endOfDay(currentDate), "yyyy-MM-dd"),
      };
    }
  };

  const dateRange = getDateRange();

  const { data: events, loading, error, handleFetch } = useFetch(
    "api/office-calendar",
    dateRange,
    true,
    [],
    (response) => {
      const result = response?.data?.data;
      return Array.isArray(result) ? result : [];
    }
  );

  useEffect(() => {
    document.title = `Office Calendar - ${window.APP_NAME}`;
  }, []);

  useEffect(() => {
    handleFetch();
  }, [currentDate, view]);

  useEffect(() => {
    if (error) {
      addToast({ message: formatError(error), severity: "error" });
    }
  }, [error, addToast]);

  const navigateDate = (direction) => {
    if (view === "month") {
      setCurrentDate(direction === "next" ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
    } else if (view === "week") {
      setCurrentDate(direction === "next" ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1));
    } else {
      setCurrentDate(direction === "next" ? addDaysFn(currentDate, 1) : addDaysFn(currentDate, -1));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (date) => {
    if (!canEditCalendar()) {
      addToast({ message: "You don't have permission to create events", severity: "warning" });
      return;
    }
    setSelectedDate(date);
    openCreateEventModal(date);
  };

  const handleEventClick = (event) => {
    if (!canEditCalendar()) {
      addToast({ message: "You don't have permission to edit events", severity: "warning" });
      return;
    }
    setSelectedEvent(event);
    openEditEventModal(event);
  };

  const openCreateEventModal = (date = null) => {
    const component = (
      <CreateEvent
        initialDate={date || selectedDate}
        modal={modalRef.current}
        fetchEvents={handleFetch}
      />
    );
    modalRef.current.open("Create Event", component, "md");
  };

  const openEditEventModal = (event) => {
    const component = (
      <EditEvent
        event={event}
        modal={modalRef.current}
        fetchEvents={handleFetch}
      />
    );
    modalRef.current.open("Edit Event", component, "md");
  };

  // Get events for each day
  const getEventsForDay = (date) => {
    if (!events || !Array.isArray(events)) return [];
    return events.filter((event) => {
      const eventStart = new Date(event.start_date);
      const eventEnd = event.end_date ? new Date(event.end_date) : eventStart;
      return (
        isSameDay(eventStart, date) ||
        isSameDay(eventEnd, date) ||
        (eventStart <= date && eventEnd >= date)
      );
    });
  };

  // Render Month View
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    return (
      <Box sx={{ width: "100%", mt: 2 }}>
        {/* Weekday Headers */}
        <Grid container spacing={0} sx={{ borderBottom: 2, borderColor: "divider", mb: 0 }}>
          {weekDays.map((dayName) => (
            <Grid
              key={dayName}
              size={{ xs: 12 / 7 }}
              sx={{
                p: { xs: 1, sm: 1.5 },
                textAlign: "center",
                bgcolor: alpha("#667eea", 0.08),
                fontWeight: 700,
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                borderRight: { xs: "none", sm: "1px solid" },
                borderColor: "divider",
                "&:last-child": {
                  borderRight: "none",
                },
              }}
            >
              {dayName}
            </Grid>
          ))}
        </Grid>

        {/* Calendar Days */}
        <Grid container spacing={0}>
          {days.map((day, idx) => {
            const dayEvents = getEventsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());
            const isSelected = selectedDate && isSameDay(day, selectedDate);

            return (
              <Grid
                key={idx}
                size={{ xs: 12 / 7 }}
                sx={{
                  minHeight: { xs: 80, sm: 100, md: 120 },
                  p: { xs: 0.5, sm: 1 },
                  borderRight: { xs: "none", sm: "1px solid" },
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  bgcolor: isCurrentMonth ? "background.paper" : alpha("#000", 0.02),
                  cursor: "pointer",
                  position: "relative",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: isCurrentMonth ? alpha("#667eea", 0.05) : alpha("#667eea", 0.02),
                    zIndex: 1,
                  },
                  "&:nth-of-type(7n)": {
                    borderRight: "none",
                  },
                  ...(isToday && {
                    bgcolor: alpha("#667eea", 0.1),
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 4,
                      left: 4,
                      right: 4,
                      bottom: 4,
                      border: `2px solid #667eea`,
                      borderRadius: 1,
                      pointerEvents: "none",
                    },
                  }),
                  ...(isSelected && !isToday && {
                    bgcolor: alpha("#667eea", 0.08),
                  }),
                  ...(canEditCalendar() ? {} : { cursor: "default" }),
                }}
                onClick={canEditCalendar() ? () => handleDateClick(day) : undefined}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: isToday ? 700 : isCurrentMonth ? 600 : 400,
                    color: isToday
                      ? "#667eea"
                      : isCurrentMonth
                      ? "text.primary"
                      : "text.disabled",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    mb: 0.5,
                  }}
                >
                  {format(day, "d")}
                </Typography>
                <Box
                  sx={{
                    maxHeight: { xs: 50, sm: 70, md: 90 },
                    overflowY: "auto",
                    "&::-webkit-scrollbar": {
                      width: "4px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      backgroundColor: alpha("#000", 0.2),
                      borderRadius: 2,
                    },
                  }}
                >
                  {dayEvents.slice(0, 3).map((event) => (
                    <Chip
                      key={event.id}
                      label={event.title}
                      size="small"
                      onClick={canEditCalendar() ? (e) => {
                        e.stopPropagation();
                        handleEventClick(event);
                      } : undefined}
                      sx={{
                        width: "100%",
                        mb: 0.5,
                        fontSize: { xs: "0.65rem", sm: "0.7rem" },
                        height: { xs: 18, sm: 22 },
                        bgcolor: event.color || "#667eea",
                        color: "white",
                        cursor: canEditCalendar() ? "pointer" : "default",
                        pointerEvents: canEditCalendar() ? "auto" : "none",
                        "&:hover": {
                          opacity: 0.9,
                          transform: "scale(1.02)",
                        },
                      }}
                    />
                  ))}
                  {dayEvents.length > 3 && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        fontSize: { xs: "0.6rem", sm: "0.7rem" },
                        display: "block",
                        mt: 0.5,
                      }}
                    >
                      +{dayEvents.length - 3} more
                    </Typography>
                  )}
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  };

  // Render Week View
  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      weekDays.push(addDays(weekStart, i));
    }

    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <Box sx={{ width: "100%", mt: 2, overflowX: "auto" }}>
        <Grid container spacing={0} sx={{ border: "1px solid", borderColor: "divider" }}>
          <Grid size={{ xs: 12, sm: 1 }} sx={{ borderRight: { sm: "1px solid" }, borderColor: "divider" }}>
            <Box
              sx={{
                p: 1.5,
                textAlign: "center",
                bgcolor: alpha("#667eea", 0.08),
                fontWeight: 700,
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              Time
            </Box>
            {hours.map((hour) => (
              <Box
                key={hour}
                sx={{
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  p: 1,
                  minHeight: 60,
                  textAlign: "center",
                  fontSize: "0.75rem",
                  color: "text.secondary",
                }}
              >
                {hour}:00
              </Box>
            ))}
          </Grid>
          {weekDays.map((day, dayIdx) => {
            const dayEvents = getEventsForDay(day).filter((event) => {
              const eventStart = new Date(event.start_date);
              return isSameDay(eventStart, day);
            });
            const isToday = isSameDay(day, new Date());

            return (
              <Grid
                key={dayIdx}
                size={{ xs: 12, sm: 11 / 7 }}
                sx={{ borderRight: { sm: "1px solid" }, borderColor: "divider" }}
              >
                <Box
                  sx={{
                    p: 1.5,
                    textAlign: "center",
                    bgcolor: isToday ? alpha("#667eea", 0.15) : alpha("#667eea", 0.08),
                    fontWeight: 700,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    cursor: canEditCalendar() ? "pointer" : "default",
                    transition: "background-color 0.2s",
                    "&:hover": {
                      bgcolor: isToday ? alpha("#667eea", 0.2) : alpha("#667eea", 0.12),
                    },
                  }}
                  onClick={canEditCalendar() ? () => handleDateClick(day) : undefined}
                >
                  <Typography variant="body2" sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                    {format(day, "EEE")}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      color: isToday ? "#667eea" : "text.primary",
                      fontWeight: isToday ? 700 : 600,
                    }}
                  >
                    {format(day, "d")}
                  </Typography>
                </Box>
                <Box sx={{ position: "relative", minHeight: 1440 }}>
                  {hours.map((hour) => (
                    <Box
                      key={hour}
                      sx={{
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        minHeight: 60,
                        p: 0.5,
                        cursor: "pointer",
                        transition: "background-color 0.2s",
                        "&:hover": {
                          bgcolor: alpha("#667eea", 0.05),
                        },
                        ...(canEditCalendar() ? {} : { cursor: "default" }),
                      }}
                      onClick={canEditCalendar() ? () => {
                        const date = new Date(day);
                        date.setHours(hour, 0, 0, 0);
                        handleDateClick(date);
                      } : undefined}
                    />
                  ))}
                  {dayEvents.map((event) => {
                    const eventStart = new Date(event.start_date);
                    const eventEnd = event.end_date ? new Date(event.end_date) : addDays(eventStart, 1);
                    const startHour = eventStart.getHours();
                    const startMinute = eventStart.getMinutes();
                    const duration = (eventEnd - eventStart) / (1000 * 60);
                    const top = startHour * 60 + startMinute;
                    const height = Math.max(duration, 30);

                    return (
                      <Box
                        key={event.id}
                        onClick={canEditCalendar() ? (e) => {
                          e.stopPropagation();
                          handleEventClick(event);
                        } : undefined}
                        sx={{
                          position: "absolute",
                          top: `${top}px`,
                          left: 4,
                          right: 4,
                          height: `${height}px`,
                          bgcolor: event.color || "#667eea",
                          color: "white",
                          p: 0.5,
                          borderRadius: 1,
                          fontSize: "0.75rem",
                          cursor: canEditCalendar() ? "pointer" : "default",
                          overflow: "hidden",
                          boxShadow: 1,
                          transition: "all 0.2s",
                          "&:hover": {
                            opacity: 0.9,
                            transform: "scale(1.02)",
                            zIndex: 10,
                            boxShadow: 2,
                          },
                        }}
                      >
                        <Typography variant="caption" fontWeight="bold" display="block">
                          {event.title}
                        </Typography>
                        {event.location && (
                          <Typography variant="caption" display="block" sx={{ opacity: 0.9 }}>
                            📍 {event.location}
                          </Typography>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  };

  // Render Day View
  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const dayEvents =
      events?.filter((event) => {
        const eventStart = new Date(event.start_date);
        return isSameDay(eventStart, currentDate);
      }) || [];

    return (
      <Box sx={{ width: "100%", mt: 2 }}>
        <Card
          sx={{
            mb: 3,
            background: `linear-gradient(135deg, ${alpha("#667eea", 0.1)} 0%, ${alpha("#764ba2", 0.1)} 100%)`,
            border: `1px solid ${alpha("#667eea", 0.2)}`,
          }}
        >
          <CardContent sx={{ textAlign: "center", py: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#667eea" }}>
              {format(currentDate, "EEEE, MMMM d, yyyy")}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
              {dayEvents.length} {dayEvents.length === 1 ? "event" : "events"} scheduled
            </Typography>
          </CardContent>
        </Card>

        <Grid container spacing={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, overflow: "hidden" }}>
          <Grid size={{ xs: 12, sm: 2 }} sx={{ borderRight: { sm: "1px solid" }, borderColor: "divider" }}>
            <Box
              sx={{
                p: 1.5,
                textAlign: "center",
                bgcolor: alpha("#667eea", 0.08),
                fontWeight: 700,
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              Time
            </Box>
            {hours.map((hour) => (
              <Box
                key={hour}
                sx={{
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  p: 1.5,
                  minHeight: 80,
                  textAlign: "center",
                  fontSize: "0.875rem",
                  color: "text.secondary",
                }}
              >
                {hour}:00
              </Box>
            ))}
          </Grid>
          <Grid size={{ xs: 12, sm: 10 }}>
            <Box sx={{ position: "relative", minHeight: 1920 }}>
              {hours.map((hour) => (
                <Box
                  key={hour}
                  sx={{
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    minHeight: 80,
                    p: 1,
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                    "&:hover": {
                      bgcolor: alpha("#667eea", 0.05),
                    },
                    ...(canEditCalendar() ? {} : { cursor: "default" }),
                  }}
                  onClick={canEditCalendar() ? () => {
                    const date = new Date(currentDate);
                    date.setHours(hour, 0, 0, 0);
                    handleDateClick(date);
                  } : undefined}
                />
              ))}
              {dayEvents.map((event) => {
                const eventStart = new Date(event.start_date);
                const eventEnd = event.end_date ? new Date(event.end_date) : addDays(eventStart, 1);
                const startHour = eventStart.getHours();
                const startMinute = eventStart.getMinutes();
                const duration = (eventEnd - eventStart) / (1000 * 60);
                const top = startHour * 80 + (startMinute / 60) * 80;
                const height = Math.max(duration / 60 * 80, 60);

                return (
                  <Box
                    key={event.id}
                    onClick={canEditCalendar() ? (e) => {
                      e.stopPropagation();
                      handleEventClick(event);
                    } : undefined}
                    sx={{
                      position: "absolute",
                      top: `${top}px`,
                      left: 8,
                      right: 8,
                      height: `${height}px`,
                      bgcolor: event.color || "#667eea",
                      color: "white",
                      p: 1.5,
                      borderRadius: 1.5,
                      cursor: canEditCalendar() ? "pointer" : "default",
                      overflow: "hidden",
                      boxShadow: 2,
                      transition: "all 0.2s",
                      "&:hover": {
                        opacity: 0.95,
                        transform: "translateY(-2px)",
                        zIndex: 10,
                        boxShadow: 4,
                      },
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight="bold">
                      {event.title}
                    </Typography>
                    {event.location && (
                      <Typography variant="caption" display="block" sx={{ mt: 0.5, opacity: 0.9 }}>
                        📍 {event.location}
                      </Typography>
                    )}
                    {event.description && (
                      <Typography variant="caption" display="block" sx={{ mt: 0.5, opacity: 0.85 }}>
                        {event.description.substring(0, 60)}
                        {event.description.length > 60 ? "..." : ""}
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Grid>
        </Grid>
      </Box>
    );
  };

  return (
    <Page
      title="Office Calendar"
      breadcrumbs={[
        { title: "Home" },
        { title: "Office Calendar" },
      ]}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3 }, height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Calendar Header Controls */}
        <Card
          elevation={0}
          sx={{
            mb: { xs: 2, sm: 3 },
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            background: `linear-gradient(135deg, ${alpha("#667eea", 0.05)} 0%, ${alpha("#764ba2", 0.05)} 100%)`,
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Grid container spacing={{ xs: 2, sm: 3 }} alignItems="center">
              {/* Left Side - Navigation */}
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <IconButton
                    onClick={() => navigateDate("prev")}
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      "&:hover": { bgcolor: alpha("#667eea", 0.1), borderColor: "#667eea" },
                    }}
                  >
                    <ChevronLeftIcon />
                  </IconButton>
                  <Button
                    variant="outlined"
                    startIcon={<TodayIcon />}
                    onClick={goToToday}
                    sx={{
                      borderColor: "divider",
                      "&:hover": {
                        borderColor: "#667eea",
                        bgcolor: alpha("#667eea", 0.05),
                      },
                    }}
                  >
                    Today
                  </Button>
                  <IconButton
                    onClick={() => navigateDate("next")}
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      "&:hover": { bgcolor: alpha("#667eea", 0.1), borderColor: "#667eea" },
                    }}
                  >
                    <ChevronRightIcon />
                  </IconButton>
                  <Typography
                    variant="h6"
                    sx={{
                      ml: { xs: 0, sm: 2 },
                      mt: { xs: 1, sm: 0 },
                      fontWeight: 700,
                      fontSize: { xs: "1rem", sm: "1.25rem" },
                      color: "text.primary",
                      width: { xs: "100%", sm: "auto" },
                    }}
                  >
                    {view === "month"
                      ? format(currentDate, "MMMM yyyy")
                      : view === "week"
                      ? `${format(startOfWeek(currentDate, { weekStartsOn: 1 }), "MMM d")} - ${format(endOfWeek(currentDate, { weekStartsOn: 1 }), "MMM d, yyyy")}`
                      : format(currentDate, "EEEE, MMMM d, yyyy")}
                  </Typography>
                </Stack>
              </Grid>

              {/* Right Side - View Toggle & New Event */}
              <Grid size={{ xs: 12, sm: 6, md: 8 }}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  alignItems={{ xs: "stretch", sm: "center" }}
                  justifyContent="flex-end"
                >
                  <Paper
                    elevation={0}
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      display: "inline-flex",
                      width: { xs: "100%", sm: "auto" },
                    }}
                  >
                    <Tabs
                      value={view}
                      onChange={(e, newValue) => setView(newValue)}
                      sx={{
                        minHeight: 40,
                        "& .MuiTab-root": {
                          minHeight: 40,
                          fontSize: { xs: "0.75rem", sm: "0.875rem" },
                          px: { xs: 1.5, sm: 3 },
                        },
                      }}
                    >
                      <Tab label="Month" value="month" />
                      <Tab label="Week" value="week" />
                      <Tab label="Day" value="day" />
                    </Tabs>
                  </Paper>
                  {canEditCalendar() && (
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => openCreateEventModal()}
                      sx={{
                        bgcolor: "#667eea",
                        "&:hover": { bgcolor: "#5568d3" },
                        width: { xs: "100%", sm: "auto" },
                        whiteSpace: "nowrap",
                      }}
                    >
                      New Event
                    </Button>
                  )}
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Calendar Content */}
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            bgcolor: "background.paper",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            p: { xs: 1, sm: 2, md: 3 },
            boxShadow: 1,
            minHeight: 0,
          }}
        >
          {loading ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="body1" color="text.secondary">
                Loading calendar...
              </Typography>
            </Box>
          ) : (
            <>
              {view === "month" && renderMonthView()}
              {view === "week" && renderWeekView()}
              {view === "day" && renderDayView()}
            </>
          )}
        </Box>
      </Container>
      <Modal ref={modalRef} />
    </Page>
  );
};

export default Calendar;
