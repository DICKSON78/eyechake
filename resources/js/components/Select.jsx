import React from "react";
import { Autocomplete, Box, CircularProgress, Paper, Stack, TextField, Typography } from "@mui/material";
import DropDownIcon from "@mui/icons-material/ArrowDropDownRounded";
import ClearIcon from "@mui/icons-material/CloseRounded";

class Select extends React.Component {
  constructor(props) {
    super(props);

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
    this._onChange(value, validate);
  }

  render() {
    const { containerProps, label, placeholder, required, horizontal, options, optionsLabel, optionsValue, clearable, endAdornment, loading, ...rest } = this.props;
    return (
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
          <Autocomplete
            {...rest}
            getOptionLabel={(option) => (optionsLabel ? option[optionsLabel] : option) || ""}
            options={options}
            disableClearable={!clearable}
            loading={loading}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder={placeholder || "Select"}
                variant="outlined"
                size="small"
                margin="none"
                required={required}
                error={!!this.state.error}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                    >
                      {loading ?
                        <CircularProgress color="inherit" size={18}/>
                        : null
                      }
                      {endAdornment}
                      {params.InputProps.endAdornment}
                    </Stack>
                  ),
                }}
              />
            )}
            clearIcon={<ClearIcon />}
            popupIcon={<DropDownIcon />}
            PaperComponent={(params) => (
              <Paper
                variant="elevation"
                elevation={8}
                {...params}
              />
            )}
            onChange={(event, value) => {
              if (typeof value === "object" && value && optionsValue) {
                this._onChange(value[optionsValue], true);
              } else {
                this._onChange(value, true);
              }
            }}
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
    );
  }
}

export default Select;
