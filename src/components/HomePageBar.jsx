import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import {Link} from "react-router-dom"
import { withRouter } from "react-router-dom";

const useStyles = makeStyles(theme => ({
    root: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      'margin-left': 70,
      float: "left",
      'text-align': "left",
      'font-size': 20,
      flexGrow: 1,
    },
    paper: {
      position: 'absolute',
      width: 400,
      backgroundColor: theme.palette.background.paper,
      border: '2px solid #000',
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4, 3),
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
                <Link to='/samples' className='AppBarLink'>
                  <Button color="inherit"> Samples </Button>
                </Link> 
                <Link to='/login' className='AppBarLink'> 
                  <Button color="inherit">Login</Button>
                </Link>
                <Link to='/signup' className='AppBarLink'> 
                  <Button color="inherit" className='SignUpButton'> Sign up for free</Button>
                </Link>
                {/* <Button color="inherit" onClick={handleClick}>Login</Button> */}
          </Toolbar>
        </AppBar>
    )
}


export default withRouter(HomePageBar)