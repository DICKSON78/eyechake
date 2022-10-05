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

  render() {
    const { containerProps, label, required, ...rest } = this.props;
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
        <OutlinedInput
          inputRef={(ref) => this.input = ref}
          size="small"
          margin="none"
          {...rest}
          type="file"
          required={required}
          error={!!this.state.error}
          onChange={(event) => this._onChange(event.target.files, true)}
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
    );
  }
}

export default FileInput;
