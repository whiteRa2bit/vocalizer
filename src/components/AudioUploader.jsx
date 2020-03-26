import React from 'react';
import Dropzone from 'react-dropzone-uploader'
import 'react-dropzone-uploader/dist/styles.css'
import { white } from 'color-name';

const AudioUploader = () => {
  const getUploadParams = ({ meta }) => {
    const url = 'https://httpbin.org/post'
    return { url, meta: { fileUrl: `${url}/${encodeURIComponent(meta.name)}` } }
  }


  const upload = (file, title) => {
    var formData = new FormData();
    formData.append("title", title);
    formData.append("file", file)

    fetch('http://localhost:8000/upload', {
      method: 'POST',
      mode: 'no-cors',
      headers: {
      },
      body: formData
    }).then(
      response => response.json()
    ).then(
      success => console.log(success)
    ).catch(
      error => console.log(error)
    );
  };

  const handleChangeStatus = ({ meta }, status) => {
    console.log(status, meta)
  }

  const handleSubmit = (files, allFiles) => {
    files.forEach(f => upload(f.file, f.meta.name))
    console.log(files.map(f => f.meta))
    allFiles.forEach(f => f.remove())
  }

  return (
    <Dropzone
      getUploadParams={getUploadParams}
      onChangeStatus={handleChangeStatus}
      onSubmit={handleSubmit}
      accept="audio/mp3"
      inputContent={(files, extra) => (extra.reject ? 'WAV files only' : 'Drag your audio file')}
      styles={{
        dropzone: {minHeight: 300, maxHeight: 400, width: 350},
        dropzoneReject: { borderColor: 'red', backgroundColor: '#DAA' },
        inputLabel: (files, extra) => (extra.reject ? { color: 'red' } : {}),
      }}
    />
  )
}

export default AudioUploader
