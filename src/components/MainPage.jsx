import React from 'react';
import AudioUploader from './AudioUploader';
import '../index.css';
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Link from 'react-router-dom'
import Main from './Main';
import { useHistory } from 'react-router-dom';
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

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const MainPage = () => {
  const classes = useStyles();

  const [modalStyle] = React.useState(getModalStyle);
  const [open, setOpen] = React.useState(false);
  const history = useHistory();

  const handleClick = () => {
      history.push("/login");
  }

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div className="Main">
        {/* <Main></Main> */}

        <AppBar position="static" style={{ background: 'transparent', boxShadow: 'none'}}>
          <Toolbar>
            <Typography variant="h6" className={classes.title}>
                Vocalizer 
            </Typography>
                <Button color="inherit" onClick={handleClick}>Login</Button>
          </Toolbar>
        </AppBar>

        <div className='MainPage'>
          <div className='MainPageHeader'>
            <span > Create, here is <br></br> the instrument </span>
          </div>
          <div className='MainPageInfo'>
            <span> Separate vocals, drums, bass and other instruments out of your songs  </span>
          </div>
        </div>
        <div className='MainPageStart'>
          <button className='MainPageButton' onClick={handleOpen}>Try it now</button>
          <Modal
              aria-labelledby="simple-modal-title"
              aria-describedby="simple-modal-description"
              open={open}
              onClose={handleClose}
            >
              <div style={modalStyle} className={classes.paper}>
                <h2 id="simple-modal-title">Upload your audio</h2>
                <AudioUploader />
              </div>
            </Modal>
        </div>
    </div>
  );
}

export default withRouter(MainPage)