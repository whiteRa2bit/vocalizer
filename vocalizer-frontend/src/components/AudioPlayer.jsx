import React, { useRef, useEffect } from "react";
import { withRouter } from "react-router-dom";
import HomePageBar from './HomePageBar'
import {Howl, Howler} from 'howler'
import Grid from '@material-ui/core/Grid';
import Slider from '@material-ui/core/Slider';
import VolumeDown from '@material-ui/icons/VolumeDown';
import VolumeUp from '@material-ui/icons/VolumeUp';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import WaveSurfer from 'wavesurfer.js'
import CircularProgress from '@material-ui/core/CircularProgress';

function AudioPlayer({is_example}=true) {
    if (is_example) {
        var song_id = 1;
    } else {
        var song_id = localStorage.getItem('song_id');
    }
    

    var server_url = 'https://api.songsplitter.com/'
    const [bass_mp3, setBass] = React.useState(`${server_url}/songs/${song_id}/bass.mp3`);
    var drums_mp3 = `${server_url}/songs/${song_id}/drums.mp3`;
    var other_mp3 = `${server_url}/songs/${song_id}/other.mp3`;
    var vocals_mp3 = `${server_url}/songs/${song_id}/vocals.mp3`;

    const [is_played, setIsPlayed] = React.useState(false);    
    const [isRendered, setIsRendered] = React.useState(false);
    
    const [bass_wave, setBassWave] = React.useState(null);
    const [drums_wave, setDrumsWave] = React.useState(null);
    const [other_wave, setOtherWave] = React.useState(null);
    const [vocal_wave, setVocalWave] = React.useState(null);

    const [bassIsReady, setBassIsReady] = React.useState(false);
    const [drumsIsReady, setDrumsIsReady] = React.useState(false);
    const [otherIsReady, setOtherIsReady] = React.useState(false);
    const [vocalIsReady, setVocalIsReady] = React.useState(false);

    const [bass_volume, setBassVolume] = React.useState(100);
    const [drums_volume, setDrumsVolume] = React.useState(100);
    const [other_volume, setOtherVolume] = React.useState(100);
    const [vocal_volume, setVocalVolume] = React.useState(100);

    const handleBassVolume = (event, newVolume) => {
        bass_wave.setVolume(newVolume/100)
        setBassVolume(newVolume);
    };
    const handleDrumsVolume = (event, newVolume) => {
        drums_wave.setVolume(newVolume/100)
        setDrumsVolume(newVolume);
    };
    const handleOtherVolume = (event, newVolume) => {
        other_wave.setVolume(newVolume/100)
        setOtherVolume(newVolume);
    };

    const handleVocalVolume = (event, newVolume) => {
        vocal_wave.setVolume(newVolume/100)
        setVocalVolume(newVolume);
    };

    const waveBassRef = useRef();
    const waveDrumsRef = useRef();
    const waveOtherRef = useRef();
    const waveVocalRef = useRef();


    useEffect(() => {
      console.log("FIRST")
      if(waveBassRef.current) {
        const wavesurfer = WaveSurfer.create({
          container: waveBassRef.current,
        //   backgroundColor: 'red',
        //   responsive: true,
          height: 70,
        //   progressColor: 'red',
        });
        setBassWave(wavesurfer)
      }
      if(waveDrumsRef.current) {
        const wavesurfer = WaveSurfer.create({
          container: waveDrumsRef.current,
        //   responsive: true,
          height: 70,
        //   progressColor: 'blue'
        });
        setDrumsWave(wavesurfer)
      }
      if(waveOtherRef.current) {
        const wavesurfer = WaveSurfer.create({
          container: waveOtherRef.current,
        //   responsive: true,
          height: 70,
        //   progressColor: 'purple'
        });
        setOtherWave(wavesurfer)
      }
      if(waveVocalRef.current) {
        const wavesurfer = WaveSurfer.create({
          container: waveVocalRef.current,
        //   responsive: true,
          height: 70,
        //   progressColor: 'green'
        });
        setVocalWave(wavesurfer)
      }
      setIsRendered(true)
    }, []);

    useEffect(() => {
        console.log("Second")
        if(isRendered) {
            bass_wave.load(bass_mp3)
            drums_wave.load(drums_mp3)
            other_wave.load(other_mp3)
            vocal_wave.load(vocals_mp3)

            bass_wave.on('seek', function () {
                const new_seek = bass_wave.getCurrentTime() / bass_wave.getDuration()
                const next_seek = drums_wave.getCurrentTime() / drums_wave.getDuration()
                console.log(next_seek - new_seek)
                if (Math.abs(next_seek - new_seek) > 0.00001) {
                    drums_wave.seekTo(new_seek)
                }
            });
    
            drums_wave.on('seek', function () {
                const new_seek = drums_wave.getCurrentTime() / drums_wave.getDuration()
                other_wave.seekTo(new_seek)
            });
            other_wave.on('seek', function () {
                const new_seek = other_wave.getCurrentTime() / other_wave.getDuration()
                vocal_wave.seekTo(new_seek)
            });
            vocal_wave.on('seek', function () {
                const new_seek = vocal_wave.getCurrentTime() / vocal_wave.getDuration()
                bass_wave.seekTo(new_seek)
            });

            bass_wave.on('ready', function () {
                console.log('bass is ready')
                document.getElementById('bassWave').style.display = 'none'
                setBassIsReady(true)
            })
            drums_wave.on('ready', function () {
                console.log('drums is ready')
                document.getElementById('drumsWave').style.display = 'none'
                setDrumsIsReady(true)
            })
            other_wave.on('ready', function () {
                console.log('other is ready')
                document.getElementById('otherWave').style.display = 'none'
                setOtherIsReady(true)
            })
            vocal_wave.on('ready', function () {
                console.log('vocal is ready')
                document.getElementById('vocalWave').style.display = 'none'
                setVocalIsReady(true)
            })

            document.getElementById('bassInfo').style.display = 'none'
            document.getElementById('drumsInfo').style.display = 'none'
            document.getElementById('otherInfo').style.display = 'none'
            document.getElementById('vocalInfo').style.display = 'none'    
            document.getElementById('playButton').style.display = 'none'        
        }
    }, [isRendered])

    useEffect(() => {
        console.log("USE EFFECT READY")
        if (bassIsReady && drumsIsReady && otherIsReady && vocalIsReady) {
            console.log("Everything is ready")
            document.getElementById('bassInfo').style.display = 'block'
            document.getElementById('drumsInfo').style.display = 'block'
            document.getElementById('otherInfo').style.display = 'block'
            document.getElementById('vocalInfo').style.display = 'block'

            document.getElementById('bassWave').style.display = 'block'
            document.getElementById('drumsWave').style.display = 'block'
            document.getElementById('otherWave').style.display = 'block'
            document.getElementById('vocalWave').style.display = 'block'

            document.getElementById('playButton').style.display = 'block'        

            document.getElementById('progressDiv').style.display = 'none'


        }
    }, [bassIsReady, drumsIsReady, otherIsReady, vocalIsReady])


    const handlePlayButton = () => {
        if (is_played) {
            bass_wave.pause()
            drums_wave.pause()
            other_wave.pause()
            vocal_wave.pause()
        }
        else {
            bass_wave.play()
            drums_wave.play()
            other_wave.play()
            vocal_wave.play()
        }
        setIsPlayed(!is_played)
    };

    return (
        <div className='MyTracksPage'>
            <script src="https://unpkg.com/wavesurfer.js"></script>  
            <div className='Player' id='player'>
                <div id='progressDiv'>
                    <CircularProgress color='secondary' size='3em'> </CircularProgress>
                </div>
                <div className = 'Audio'>
                    <div className='AudioInfo' id='bassInfo'>
                        <div className='AudioName'>
                            <p> Bass </p>
                        </div>
                        <div className='VolumeContainer'> 
                            <Grid container spacing={1} className='VolumeGridContainer'>
                                <Grid item>
                                    <VolumeDown />
                                </Grid>
                                <Grid item xs>
                                <Slider value={bass_volume} onChange={handleBassVolume} aria-labelledby="continuous-slider" />
                                </Grid>
                                {/* <Grid item>
                                <VolumeUp />
                                </Grid> */}
                            </Grid>
                        </div>
                    </div>
                    <div className='WaveForm' ref={waveBassRef} id='bassWave'></div>
                </div>
                <div className = 'Audio'>
                    <div className='AudioInfo' id='drumsInfo'>
                        <div className='AudioName'>
                            <p> Drum </p>
                        </div>
                        <div className='VolumeContainer'> 
                            <Grid container spacing={1} className='VolumeGridContainer'>
                                <Grid item>
                                    <VolumeDown />
                                </Grid>
                                <Grid item xs>
                                <Slider value={drums_volume} onChange={handleDrumsVolume} aria-labelledby="continuous-slider" />
                                </Grid>
                                {/* <Grid item>
                                <VolumeUp />
                                </Grid> */}
                            </Grid>
                        </div>
                    </div>
                    <div className='WaveForm' id='drumsWave' ref={waveDrumsRef}></div>
                </div>
                <div className = 'Audio'>
                    <div className='AudioInfo' id='otherInfo'>
                        <div className='AudioName'>
                            <p> Other </p>
                        </div>
                        <div className='VolumeContainer'> 
                            <Grid container spacing={1} className='VolumeGridContainer'>
                                <Grid item>
                                    <VolumeDown />
                                </Grid>
                                <Grid item xs>
                                <Slider value={other_volume} onChange={handleOtherVolume} aria-labelledby="continuous-slider" />
                                </Grid>
                                {/* <Grid item>
                                <VolumeUp />
                                </Grid> */}
                            </Grid>
                        </div>
                    </div>
                    <div className='WaveForm' id='otherWave' ref={waveOtherRef}></div>
                </div>
                <div className = 'Audio'>
                    <div className='AudioInfo' id='vocalInfo'>
                        <div className='AudioName'>
                            <p> Vocal </p>
                        </div>
                        <div className='VolumeContainer'> 
                            <Grid container spacing={1} className='VolumeGridContainer'>
                                <Grid item>
                                    <VolumeDown />
                                </Grid>
                                <Grid item xs>
                                <Slider value={vocal_volume} onChange={handleVocalVolume} aria-labelledby="continuous-slider" />
                                </Grid>
                                {/* <Grid item>
                                <VolumeUp />
                                </Grid> */}
                            </Grid>
                        </div>
                    </div>
                    <div className='WaveForm' ref={waveVocalRef} id='vocalWave'></div>
                </div>
                <div id='playButton'>
                    {/* <Button color='secondary' onClick={uploadWave}> Upload track </Button> */}
                    {is_played? <IconButton color='secondary' size='2em' onClick={handlePlayButton}> <PauseIcon /> </IconButton>:
                        <IconButton color='secondary' size='2em' onClick={handlePlayButton}> <PlayArrowIcon /> </IconButton>}
                </div>
            </div>

        </div>
    )
}

export default AudioPlayer
