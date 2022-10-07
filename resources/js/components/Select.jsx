import React from "react";
import { Box, InputAdornment, MenuItem, Select as MuiSelect, Typography } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDownRounded";
import CloseIcon from "@mui/icons-material/CloseRounded";

class Select extends React.Component {
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
    const { containerProps, label, placeholder, required, options, optionsText, optionsValue, clearable, endAdornment, ...rest } = this.props;
    return (
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
        <MuiSelect
          ref={(ref) => this.input = ref}
          variant="outlined"
          size="small"
          margin="none"
          displayEmpty
          {...rest}
          required={required}
          error={!!this.state.error}
          onChange={(event) => this._onChange(event.target.value, true)}
          renderValue={
            !this.state.value ? () => (
              <Typography sx={{ opacity: 0.42 }}>
                {placeholder || "Select..."}
              </Typography>
            ) : undefined
          }
          IconComponent={ArrowDropDownIcon}
          endAdornment={
            clearable && this.state.value ? (
              <InputAdornment
                position="end"
                sx={{ cursor: "pointer", mr: 2 }}
                onClick={() => this._onChange(undefined, true)}
              >
                <CloseIcon fontSize="small"/>
              </InputAdornment>
            ) : endAdornment
          }
        >
          {options.map(e => (
            <MenuItem
              key={typeof e === "string" || typeof e === "number" ? e : e[optionsValue]}
              value={typeof e === "string" || typeof e === "number" ? e : e[optionsValue]}
            >
              {typeof e === "string" || typeof e === "number" ? e : e[optionsText]}
            </MenuItem>
          ))}
        </MuiSelect>
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
    );
  }
}

export default Select;
