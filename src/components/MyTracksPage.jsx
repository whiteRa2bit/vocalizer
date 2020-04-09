import React from 'react';
import { withRouter } from "react-router-dom";
import HomePageBar from './HomePageBar'
import ReactPlayer from 'react-player'




function MyTracksPage() {
    // split_tracks();
    var song_id = localStorage.getItem('song_id');
    var bass_mp3 = `http://84.201.156.96:8000/songs/${song_id}/bass.mp3`;
    var drums_mp3 = `http://84.201.156.96:8000/songs/${song_id}/drums.mp3`;
    var other_mp3 = `http://84.201.156.96:8000/songs/${song_id}/other.mp3`;
    var vocals_mp3 = `http://84.201.156.96:8000/songs/${song_id}/vocals.mp3`;

    console.log(`hello there ${song_id}`)
    return (
        <div className='MyTracksPage'>
            <HomePageBar></HomePageBar>
            <div className='Audio'>
                <div className='PlayerWrapper'>
                    <p className='AudioTitle'> Bass </p>
                    <ReactPlayer
                    width='50%'
                    height={70}
                    style ={{
                        'margin': 'auto'
                    }}
                    url={bass_mp3}
                    playing
                    controls
                    config={{ file: { attributes: { id: 'audio-element' } } }}
                    />
                </div>
                <div className='PlayerWrapper'>
                    Drums
                    <ReactPlayer
                    width='50%'
                    height={70}
                    style ={{
                        'margin': 'auto'
                    }}
                    url={drums_mp3}
                    playing
                    controls
                    config={{ file: { attributes: { id: 'audio-element' } } }}
                    />
                </div>
                <div className='PlayerWrapper'>
                    Other
                    <ReactPlayer
                    // className='react-player'
                    width='50%'
                    height={70}
                    style ={{
                        'margin': 'auto'
                    }}
                    url={other_mp3}
                    playing
                    controls
                    config={{ file: { attributes: { id: 'audio-element' } } }}
                    />
                </div>
                <div className='PlayerWrapper'>
                    Vocals
                    <ReactPlayer
                    width='50%'
                    height={70}
                    style ={{
                        'margin': 'auto'
                    }}
                    url={vocals_mp3}
                    playing
                    controls
                    config={{ file: { attributes: { id: 'audio-element' } } }}
                    />
                </div>                    
            </div>
        </div>
    )
}

export default withRouter(MyTracksPage)