import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
// import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { withStyles } from '@material-ui/core/styles';
import { withRouter } from "react-router-dom";
import {Link} from "react-router-dom"



// const styles = {
//     root: {
//       background: "black"
//     },
//     multilineColor:{
//         color:'red'
//     },
//     textField: {
//         width: '90%',
//         marginLeft: 'auto',
//         marginRight: 'auto',            
//         paddingBottom: 0,
//         marginTop: 0,
//         fontWeight: 500
//     },
//     input: {
//         color: 'white'
//     }
//   }

function Copyright() {
  return (
    <Typography variant="body2" color="inherit" align="center">
      {'Copyright © '}
      <Link to='/' className='AppBarLink'>
        Vocalizer
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));


const ValidationTextField = withStyles({
  root: {
    '& input:valid + fieldset': {
      borderColor: 'green',
      borderWidth: 2,
    },
    '& input:invalid + fieldset': {
      borderColor: 'red',
      borderWidth: 2,
    },
    '& input:valid:focus + fieldset': {
      borderLeftWidth: 6,
      padding: '4px !important', // override inline-style
    },
  },
})(TextField);

function SignUpPage() {
  const classes = useStyles();

  return (
    <div className='SignUpPage'>
        <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
            {/* <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
            </Avatar> */}
            <Link to='/' className='LogoLink'>
              Vocalizer
            </Link>{' '}
            <Typography component="h1" variant="h5">
            Sign up
            </Typography>
            <form className={classes.form} noValidate>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <TextField autoComplete="fname"
                    InputProps={{
                        style: {
                            color: "white",
                            border: '1px solid darkcyan', 
                            '&:hover': {
                              backgroundColor: 'red',
                            },
                            '&:focus': {
                              backgroundColor: 'red',
                            }   
                        }
                    }}
                    InputLabelProps={{
                        style: {
                            color: "darkgray",
                        }
                    }}
                    color='primary'
                    name="firstName"    
                    variant="outlined"
                    required
                    fullWidth
                    id="firstName"
                    label="First Name"
                    autoFocus
                    />
    
                </Grid>
                <Grid item xs={12} sm={6}>
                <TextField
                    InputProps={{
                        style: {
                            color: "white",
                            border: '1px solid darkcyan', 
                        }
                    }}
                    InputLabelProps={{
                      style: {
                          color: "darkgray"
                      }
                    }}
                    variant="outlined"
                    required
                    fullWidth
                    id="lastName"
                    label="Last Name"
                    name="lastName"
                    autoComplete="lname"
                />
                </Grid>
                <Grid item xs={12}>
                <TextField
                    InputProps={{
                        style: {
                            color: "white",
                            border: '1px solid darkcyan', 
                        }
                    }} 
                    InputLabelProps={{
                      style: {
                          color: "darkgray"
                      }
                    }}
                    variant="outlined"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                />
                </Grid>
                <Grid item xs={12}>
                <TextField
                    InputProps={{
                        style: {
                            color: "white",
                            border: '1px solid darkcyan', 
                        }
                    }}
                    InputLabelProps={{
                      style: {
                          color: "darkgray"
                      }
                    }}
                    variant="outlined"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="current-password"
                />
                </Grid>
                <Grid item xs={12}>
                {/* <FormControlLabel
                    control={<Checkbox value="allowExtraEmails" color="primary" />}
                    label="I want to receive inspiration, marketing promotions and updates via email."
                /> */}
                </Grid>
            </Grid>
            <Button
                type="submit"
                fullWidth
                variant="contained"
                color="secondary"
                className={classes.submit}
            >
                Sign Up
            </Button>
            <Grid container justify="flex-end">
                <Grid item>
                <Link to='/login' className='AppBarLink'>
                    Already have an account? Sign in
                </Link>
                </Grid>
            </Grid>
            </form>
        </div>
        <Box mt={5}>
            <Copyright color='inherit'/>
        </Box>
        </Container>
    </div>
  );
}

export default withRouter(SignUpPage)