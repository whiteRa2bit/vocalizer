import React from 'react';
import { withRouter } from "react-router-dom";
import HomePageBar from './HomePageBar'

function SamplesPage() {
    return (
        <div className='SamplesPage'>
            
            <div className='FirstPage'>
                <HomePageBar></HomePageBar>

                <div>
                    <div className='FirstPageHeader'>
                        Artificial intelligence <br></br>meets music
                    </div>
                    <div className='FirstPageInfo'>
                        Unlock your creativity with our service
                            allowing you to create songs <br></br> and find the samples you love faster.
                    </div>
                </div>
            </div>
            <div className='SecondPage'>

            </div>
        </div>
    )
}

export default withRouter(SamplesPage)