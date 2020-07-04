/**
 * Code from the below medium post, only updated for latest material UI, using a
 * Menu for the popup and with breakpoints that work.
 *
 * https://medium.com/@habibmahbub/create-appbar-material-ui-responsive-like-bootstrap-1a65e8286d6f
 */
import React from "react";
import { Button, MenuItem } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import ButtonAppBarCollapse from "./ButtonAppBarCollapse";
import {Link} from "react-router-dom"


const styles = theme => ({
  root: {
    position: "absolute",
    right: 0
  },
  buttonBar: {
    [theme.breakpoints.down("xs")]: {
      display: "none"
    },
    margin: "10px",
    paddingLeft: "16px",
    right: 10,
    position: "relative",
    width: "100%",
    background: "transparent"
  }
});

const AppBarCollapse = props => (
  <div className={props.classes.root}>
    <ButtonAppBarCollapse>
      <Link to='/samples' className='AppBarColapseLink'>
        <Button color="inherit"> Samples </Button>
      </Link> 
      <Link to='/login' className='AppBarColapseLink'> 
        <Button color="inherit">Login</Button>
      </Link>
      <Link to='/signup' className='AppBarColapseLink'> 
        <Button color="inherit" className='SignUpButton'> Sign up for free</Button>
      </Link>
    </ButtonAppBarCollapse>
    <div className={props.classes.buttonBar} id="appbar-collapse">
      <Link to='/samples' className='AppBarLink'>
        <Button color="inherit"> Samples </Button>
      </Link> 
      <Link to='/login' className='AppBarLink'> 
        <Button color="inherit">Login</Button>
      </Link>
      <Link to='/signup' className='AppBarLink'> 
        <Button color="inherit" className='SignUpButton'> Sign up for free</Button>
      </Link>
    </div>
  </div>
);

export default withStyles(styles)(AppBarCollapse);
