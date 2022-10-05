import React from "react";
import { Box, TextField, Typography } from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker as MuiDatePicker } from "@mui/x-date-pickers";

class DatePicker extends React.Component {
  constructor(props) {
    super(props);

    this.input = React.createRef();

    this.state = {
      value: props.value,
      error: null,
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
    const { containerProps, fullWidth, label, required, ...rest } = this.props;
    return (
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box
          component="div"
          {...containerProps}
        >
          {label ?
            <Typography
              sx={{
                marginLeft: "4px",
                marginBottom: "4px",
              }}
            >
              {label}
              {required ?
                <Typography
                  component="span"
                  color={(theme) => theme.palette.mode === "light" ? theme.palette.error.light : theme.palette.error.dark}
                  fontWeight="bold"
                  ml="2px"
                >
                  *
                </Typography>
                : null
              }
            </Typography>
            : null
          }
          <MuiDatePicker
            inputRef={(ref) => this.input = ref}
            onChange={(value) => this._onChange(value, true)}
            renderInput={(params) => (
              <TextField
                variant="outlined"
                type="text"
                size="small"
                margin="none"
                autoComplete="off"
                fullWidth={fullWidth}
                required={required}
                error={!!this.state.error}
                {...params}
              />
            )}
            inputFormat="yyyy-MM-dd"
            mask="____-__-__"
            {...rest}
          />
          {this.state.error ?
            <Typography
              variant="body2"
              sx={{
                color: (theme) => theme.palette.mode === "light" ? theme.palette.error.light : theme.palette.error.dark,
                marginLeft: "4px",
                marginTop: "2px",
              }}
            >
              {this.state.error}
            </Typography>
            : null
          }
        </Box>
      </LocalizationProvider>
    );
  }
}

export default DatePicker;
