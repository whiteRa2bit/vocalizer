import React, { useRef, useEffect } from "react";
import { withRouter } from "react-router-dom";
import HomePageBar from './HomePageBar'
import {Howl, Howler} from 'howler'
import Grid from '@material-ui/core/Grid';
import Slider from '@material-ui/core/Slider';
import VolumeDown from '@material-ui/icons/VolumeDown';
import VolumeUp from '@material-ui/icons/VolumeUp';
import IconButton from '@material-ui/core/IconButton';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import WaveSurfer from 'wavesurfer.js'

function MyTracksPage() {
    // split_tracks();
    var song_id = localStorage.getItem('song_id');
    var bass_mp3 = `http://84.201.156.96:8000/songs/${song_id}/bass.mp3`;
    var drums_mp3 = `http://84.201.156.96:8000/songs/${song_id}/drums.mp3`;
    var other_mp3 = `http://84.201.156.96:8000/songs/${song_id}/other.mp3`;
    var vocals_mp3 = `http://84.201.156.96:8000/songs/${song_id}/vocals.mp3`;
    
    const [bass, setBass] = React.useState(new Howl({src: [bass_mp3]}))
    const [drums, setDrums] = React.useState(new Howl({src: [drums_mp3]}))
    const [other, setOther] = React.useState(new Howl({src: [other_mp3]}))
    const [vocal, setVocal] = React.useState(new Howl({src: [vocals_mp3]}))

    const [bass_id, setBassId] = React.useState(null);
    const [drums_id, setDrumsId] = React.useState(null);
    const [other_id, setOtherId] = React.useState(null);
    const [vocal_id, setVocalId] = React.useState(null);

    const [bass_volume, setBassVolume] = React.useState(100);
    const [drums_volume, setDrumsVolume] = React.useState(100);
    const [other_volume, setOtherVolume] = React.useState(100);
    const [vocal_volume, setVocalVolume] = React.useState(100);

    const [is_played, setIsPlayed] = React.useState(false);    
    const [pos, setPos] = React.useState(0);

    const handleBassVolume = (event, newVolume) => {
        bass.volume(newVolume/100, bass_id)
        setBassVolume(newVolume);
    };
    const handleDrumsVolume = (event, newVolume) => {
        drums.volume(newVolume/100, drums_id)
        setDrumsVolume(newVolume);
    };
    const handleOtherVolume = (event, newVolume) => {
        other.volume(newVolume/100, other_id)
        setOtherVolume(newVolume);
    };
    const handleVocalVolume = (event, newVolume) => {
        vocal.volume(newVolume/100, vocal_id)
        setVocalVolume(newVolume);
    };

    const handlePlayButton = () => {
        if (is_played) {
            bass.pause()
            drums.pause()
            other.pause()
            vocal.pause()
            setIsPlayed(false)
        }
        else {
            setBassId(bass.play())
            setDrumsId(drums.play())
            setOtherId(other.play())
            setVocalId(vocal.play())
            setIsPlayed(true)  
        }
    }

    // const waveformRef = useRef();
    // useEffect(() => {
    //   if(waveformRef.current) {
    //     const wavesurfer = WaveSurfer.create({
    //       container: waveformRef.current,
    //       height: 50
    //     });
    //     wavesurfer.load(vocals_mp3);
    //     // wavesurfer.on('ready', function () {
    //     //     wavesurfer.play();
    //     // });
    //   }
    // }, []);

    return (
        <div className='MyTracksPage'>
            <script src="https://unpkg.com/wavesurfer.js"></script>
            <HomePageBar></HomePageBar>
            <div className='Player'>
                <div className = 'Track'>
                    <p> Bass </p>
                    <Grid container spacing={2}>
                        <Grid item>
                        <VolumeDown />
                        </Grid>
                        <Grid item xs>
                        <Slider value={bass_volume} onChange={handleBassVolume} aria-labelledby="continuous-slider" />
                        </Grid>
                        <Grid item>
                        <VolumeUp />
                        </Grid>
                    </Grid>
                </div>
                <div className = 'Track'>
                    <p> Drums </p>
                    <Grid container spacing={2}>
                        <Grid item>
                        <VolumeDown />
                        </Grid>
                        <Grid item xs>
                        <Slider value={drums_volume} onChange={handleDrumsVolume} aria-labelledby="continuous-slider" />
                        </Grid>
                        <Grid item>
                        <VolumeUp />
                        </Grid>
                    </Grid>
                </div>
                <div className = 'Track'>
                    <p> Other </p>
                    <Grid container spacing={2}>
                        <Grid item>
                        <VolumeDown />
                        </Grid>
                        <Grid item xs>
                        <Slider value={other_volume} onChange={handleOtherVolume} aria-labelledby="continuous-slider" />
                        </Grid>
                        <Grid item>
                        <VolumeUp />
                        </Grid>
                    </Grid>
                </div>
                <div className = 'Track'>
                    <p> Vocal </p>
                    <Grid container spacing={2}>
                        <Grid item>
                        <VolumeDown />
                        </Grid>
                        <Grid item xs>
                        <Slider value={vocal_volume} onChange={handleVocalVolume} aria-labelledby="continuous-slider" />
                        </Grid>
                        <Grid item>
                        <VolumeUp />
                        </Grid>
                    </Grid>
                    {/* <div className='WaveForm' ref={waveformRef}></div> */}
            </div>
            <div>
                {is_played? <IconButton color='secondary' onClick={handlePlayButton}> <PauseIcon /> </IconButton>:
                    <IconButton color='secondary' onClick={handlePlayButton}> <PlayArrowIcon /> </IconButton>}
            </div>
            </div>

        </div>
    )
}

export default withRouter(MyTracksPage)