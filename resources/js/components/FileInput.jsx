import React from "react";
import { Box, OutlinedInput, Typography } from "@mui/material";

class FileInput extends React.Component {
  constructor(props) {
    super(props);

    this.input = React.createRef();

    this.state = {
      value: null,
      error: null,
    };
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
    let rules = this.props.rules || [],
      i = 0;
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

  render() {
    const { containerProps, label, required, horizontal, ...rest } = this.props;
    return (
      <Box
        component="div"
        {...(horizontal && {
          display: "flex",
          flexDirection: "row",
        })}
        {...containerProps}
      >
        {label ? (
          <Typography
            fontWeight={500}
            sx={{
              ...(horizontal && {
                mr: 1,
              }),
              ...(!horizontal && {
                ml: 0.5,
                mb: 0.5,
              }),
            }}
          >
            {label}
            {required ? (
              <Typography
                component="span"
                color="error.main"
                fontWeight="bold"
                ml={0.25}
              >
                *
              </Typography>
            ) : null}
          </Typography>
        ) : null}
        <Box
          component="div"
          {...(horizontal && {
            flexGrow: 1,
          })}
        >
          <OutlinedInput
            inputRef={(ref) => (this.input = ref)}
            size="small"
            margin="none"
            {...rest}
            type="file"
            required={required}
            error={!!this.state.error}
            onChange={(event) => this._onChange(event.target.files, true)}
          />
          {this.state.error ? (
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
          ) : null}
        </Box>
      </Box>
    );
  }
}

export default FileInput;
