import React, { useRef, useEffect } from "react";
import { withRouter } from "react-router-dom";
import HomePageBar from './HomePageBar'
import AudioPlayer from './AudioPlayer'



function MyTracksPage() {
    // split_tracks();
    return (
        <div className='MyTracksPage'>
            <script src="https://unpkg.com/wavesurfer.js"></script>  
            <HomePageBar></HomePageBar>
            <AudioPlayer is_example={false}></AudioPlayer>
        </div>
    )
}

export default withRouter(MyTracksPage)