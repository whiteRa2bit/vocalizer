import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";

const styles = {
  root: {
    background: "black"
  },
  input: {
    color: "white"
  }
};

function CustomizedInputs(props) {
  const { classes } = props;

  return (
    <TextField
        className={classes.root}
        InputProps={{
            className: classes.input
        }}
        autoComplete="fname"
        color='primary'
        name="firstName"    
        variant="outlined"
        required
        fullWidth
        id="firstName"
        label="First Name"
        autoFocus
    />
  );
}

CustomizedInputs.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(CustomizedInputs);