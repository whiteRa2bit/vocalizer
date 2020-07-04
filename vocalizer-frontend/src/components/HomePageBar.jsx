import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import {Link} from "react-router-dom"
import { withRouter } from "react-router-dom";
import AppBarCollapse from "./AppBarCollapse";

const useStyles = makeStyles(theme => ({
    root: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      'margin-left': '0%',
      float: "left",
      'text-align': "left",
      'font-size': 20,
      flexGrow: 1,
    },
}));

const HomePageBar = () => {
    const classes = useStyles();

    return (
        <AppBar position="static" style={{ background: 'transparent', boxShadow: 'none'}}>
          <Toolbar>
            {/* <img src={logo} className='Logo'></img> */}
            
            <Typography variant="h6" className={classes.title}>
                <Link to='/' className='LogoLink'>
                  Vocalizer 
                </Link>
            </Typography>
                
                {/* <Button color="inherit" onClick={handleClick}>Login</Button> */}

            <AppBarCollapse></AppBarCollapse>  
          </Toolbar>
        </AppBar>
    )
}


export default withRouter(HomePageBar)