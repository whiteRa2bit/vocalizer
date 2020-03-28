import React from 'react';
import '../styles/index.css';
import AudioUploader from './AudioUploader';
import HomePageBar from './HomePageBar'
import Modal from '@material-ui/core/Modal';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';
import { withRouter } from "react-router-dom";


function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles(theme => ({
  paper: {
    position: 'absolute',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));


const HomePage = () => {
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

  const logo = require('../images/logo/logo_transparent.png');

  return (
    <div className="Home">
      <div className='FirstHome'>
        <HomePageBar></HomePageBar>
          <div className='FirstHomePage'>
            <div className='FirstHomePageHeader'>
              <span > Create, here is <br></br> the instrument </span>
            </div>
            <div className='FirstHomePageInfo'>
              <span> Separate vocals, drums, bass and other instruments out of your songs  </span>
            </div>
          </div>
          <div className='FirstHomePageStart'>
            <button className='FirstHomePageButton' onClick={handleOpen}>Try it now</button>
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
      <div className='SecondHomePage'>
        <div className='UsersInfo'>
          <div className='Remix'>
            <img src={require('../images/remix.jpg')} className='UserImage'></img>
              <p className='UsageType'> Remix</p>
              <p className='UsageDescription'> Find your style and control every sound of your music.</p>
          </div>
          <div className='Sing'>
              <img src={require('../images/sing.jpg')} className='UserImage'></img>
              <p className='UsageType'>Sing</p>
              <p className='UsageDescription'>Extract vocals and practice your favorite song until perfection.</p>
          </div>
          <div className='Play'>
           <img src={require('../images/play.jpg')} className='UserImage'></img>
           <p className='UsageType'>Play</p>
           <p className='UsageDescription'>Remove music and practice playing your belowed instrument.</p>
          </div>
        </div>
        {/* hello there */}
      </div>
    </div>
  );
}

export default withRouter(HomePage)