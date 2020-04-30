import React, { Component } from 'react';
import Dropzone from 'react-dropzone-uploader'
import 'react-dropzone-uploader/dist/styles.css'
import { withRouter } from "react-router-dom";
import CircularProgress from '@material-ui/core/CircularProgress';
import { red } from '@material-ui/core/colors';
import { black } from 'color-name';



const asyncLocalStorage = {
  setItem: function (key, value) {
      return Promise.resolve().then(function () {
          localStorage.setItem(key, value);
      });
  },
  getItem: function (key) {
      return Promise.resolve().then(function () {
          return localStorage.getItem(key);
      });
  }
};

const split_tracks = (song_id) => {
  console.log("Split tracks called")
  fetch(`http://84.201.156.96:8000/songs/${song_id}/split`, {
      method: 'POST',
      // mode: 'no-cors',
      headers: {
      },
      // body: formData
    }).then(
      response => response.json()
    ).then(response => {
      console.log(response);
      // console.log(response) localStorage.setItem('song_id', response.json()['data']['song']['id'])
    })
}


class AudioUploader extends Component {
  state = {
    isActive: true
  };

  getUploadParams = ({ meta }) => {
    const url = 'https://httpbin.org/post'
    return { url, meta: { fileUrl: `${url}/${encodeURIComponent(meta.name)}` } }
  };

  sleep(delay) {
    console.log(`sleep for ${delay} milliseconds`)
    var start = new Date().getTime();
    while (new Date().getTime() < start + delay);
  }

  checkStatus = (song_id) => {
    fetch(`https://97442fa2.ngrok.io/songs/${song_id}`, {
      method: 'GET',
      headers: {
      },
    }).then(response => {
        this.sleep(5000)
        return response.json();
    }).then(response => {
        console.log(song_id)
        console.log(response)
        console.log(response['data']['song'])
        if (response['data']['song']['status'] == 'SPLIT') {
          console.log("File was splitted")
          window.location.href = './mytracks';
        } 
        else {
          setTimeout(this.checkStatus(song_id), 10000);
        }
    });
  };

  upload = (file, title) => {
    var formData = new FormData();
    formData.append("title", title);
    formData.append("file", file)

    fetch('https://97442fa2.ngrok.io/songs/upload', {
      method: 'POST',
      // mode: 'no-cors',
      headers: {
      },
      body: formData
    }).then(
      response => response.json()
    ).then(response => {
      console.log(response)
      asyncLocalStorage.setItem('song_id', response['data']['song']['id']).then(function () {
        return asyncLocalStorage.getItem('song_id');
      }).then(song_id => {
          console.log(song_id)
          console.log("Split tracks called")
          fetch(`https://97442fa2.ngrok.io/songs/${song_id}/split`, {
              method: 'POST',
              // mode: 'no-cors',
              headers: {
              },
              // body: formData
            }).then(
              response => response.json()
            ).then(response => {
              console.log(response);
          })
          return song_id
      }).then(song_id => {
        this.checkStatus(song_id)
      });
      // console.log(response) localStorage.setItem('song_id', response.json()['data']['song']['id'])
    })
  };

  handleChangeStatus = ({ meta }, status) => {
    console.log(status, meta)
  };

  handleSubmit = (files, allFiles) => {
    this.setState({isActive: false})
    console.log(this.isActive)
    files.forEach(f => this.upload(f.file, f.meta.name))
    console.log(files.map(f => f.meta))
    allFiles.forEach(f => f.remove())
  };

  render() {
    if (this.state.isActive) {
      return (
        <div>
            <Dropzone className='{props.shouldHide}'
              getUploadParams={this.getUploadParams}
              onChangeStatus={this.handleChangeStatus}
              onSubmit={this.handleSubmit}
              accept="audio/mp3"
              maxFiles={1}
              inputContent={(files, extra) => (extra.reject ? 'Mp3 files only' : 'Drag your audio or click')}
              styles={{
                dropzone: {minHeight: 200, maxHeight: 400, width: '100%', overflow: 'visible', opacity: 0.9},
                dropzoneReject: { borderColor: 'red', backgroundColor: '#DAA' },
                inputLabel: (files, extra) => (extra.reject ? { color: 'red' } : {color: 'black', fontFamily: 'Monaco'}),
                previewImage: {}
              }}
            />
        </div>
      )
    } else {
      return (
        <div className='ProgressDiv'>
          <p> Your audio is processing</p>
          <div className='ProgressCircleDiv'>
            <CircularProgress></CircularProgress>
          </div>
        </div>
      )
    }  
  }
}

export default withRouter(AudioUploader)
