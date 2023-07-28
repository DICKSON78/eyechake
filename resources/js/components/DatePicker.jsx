import React from "react";
import { Box, TextField, Typography } from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker as MuiDatePicker } from "@mui/x-date-pickers";
import {
  ArrowDropDownRounded as ArrowDropDownIcon,
  CalendarMonthRounded as CalendarIcon,
  ChevronLeftRounded as ChevronLeftIcon,
  ChevronRightRounded as ChevronRightIcon
} from "@mui/icons-material";

class DatePicker extends React.Component {
  constructor(props) {
    super(props);

    this.input = React.createRef();

    this.state = {
      value: props.value,
      error: null,
      open: false,
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.value !== this.props.value) {
      this.setState({ value: this.props.value });
    }
  }

  _onChange(value, validate = true) {
    if (this.props.onChange) {
      this.props.onChange(value);
    }

    this.setState({ value }, () => {
      if (validate) {
        this.validate();
      }
    });
  }

  validate() {
    let rules = this.props.rules || [], i = 0;
    if (this.props.required) {
      rules.unshift((value) => !!value || "This field is required.");
    }

    for (; i < rules.length; i++) {
      let validate = rules[i](this.state.value);
      if (validate !== true) {
        this.setState({ error: validate });
        return false;
      } else {
        this.setState({ error: undefined });
      }
    }

    return true;
  }

  setValue(value, validate = false) {
    this.input.value = value;
    this._onChange(value, validate);
  }

  render() {
    const { containerProps, fullWidth, label, required, horizontal, ...rest } = this.props;
    return (
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box
          component="div"
          {...(horizontal && {
            display: "flex",
            flexDirection: "row",
          })}
          {...containerProps}
        >
          {label ?
            <Typography
              fontWeight={500}
              sx={{
                ...(horizontal && {
                  mr: 1,
                }),
                ...(!horizontal && {
                  ml: 0.5,
                  mb: 0.5,
                })
              }}
            >
              {label}
              {required ?
                <Typography
                  component="span"
                  color="error.main"
                  fontWeight="bold"
                  ml={0.25}
                >
                  *
                </Typography>
                : null
              }
            </Typography>
            : null
          }
          <Box
            component="div"
            {...(horizontal && {
              flexGrow: 1,
            })}
          >
            <MuiDatePicker
              inputRef={(ref) => this.input = ref}
              PaperProps={{ variant: "elevation" }}
              components={{
                LeftArrowIcon: ChevronLeftIcon,
                OpenPickerIcon: CalendarIcon,
                RightArrowIcon: ChevronRightIcon,
                SwitchViewIcon: ArrowDropDownIcon
              }}
              inputFormat="yyyy-MM-dd"
              mask="____-__-__"
              {...rest}
              renderInput={(params) => (
                <TextField
                  variant="outlined"
                  type="text"
                  size="small"
                  margin="none"
                  autoComplete="off"
                  fullWidth={fullWidth}
                  required={required}
                  {...params}
                />
              )}
              InputProps={{
                error: !!this.state.error,
                onClick: () => this.setState({ open: true }),
              }}
              open={this.state.open}
              onClose={() => this.setState({ open: false })}
              onChange={(value) => this._onChange(value, true)}
            />
            {this.state.error ?
              <Typography
                variant="body2"
                sx={{
                  color: "error.main",
                  ml: 0.5,
                  mt: 0.25,
                }}
              >
                {this.state.error}
              </Typography>
              : null
            }
          </Box>
        </Box>
      </LocalizationProvider>
    );
  }
}

export default DatePicker;
