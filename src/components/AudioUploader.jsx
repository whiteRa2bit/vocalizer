import React, { Component } from 'react';
import Dropzone from 'react-dropzone-uploader'
import 'react-dropzone-uploader/dist/styles.css'
import { withRouter } from "react-router-dom";
import CircularProgress from '@material-ui/core/CircularProgress';



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

const split_tracks = () => {
  console.log("Split tracks called")
  fetch(`http://84.201.156.96:8000/songs/${asyncLocalStorage.getItem('song_id')}/split`, {
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


  upload = (file, title) => {
    var formData = new FormData();
    formData.append("title", title);
    formData.append("file", file)

    fetch('http://84.201.156.96:8000/songs/upload', {
      method: 'POST',
      // mode: 'no-cors',
      headers: {
      },
      body: formData
    }).then(
      response => response.json()
    ).then(response => {
      asyncLocalStorage.setItem('song_id', response['data']['song']['id']).then(function () {
        return asyncLocalStorage.getItem('song_id');
      }).then(function (value) {
          console.log('Value has been set to:', value);
          window.location.href = './vocalizer/#/mytracks';
      }).then( response => {
        split_tracks();
      }
      );
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
              inputContent={(files, extra) => (extra.reject ? 'WAV files only' : 'Drag your audio file')}
              styles={{
                dropzone: {minHeight: 300, maxHeight: 400, width: 350},
                dropzoneReject: { borderColor: 'red', backgroundColor: '#DAA' },
                inputLabel: (files, extra) => (extra.reject ? { color: 'red' } : {}),
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
