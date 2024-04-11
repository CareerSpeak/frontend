import React from 'react';

import { View } from 'react-native';
import { Button, Surface, Text } from 'react-native-paper';
import DocumentPicker, { DocumentPickerResponse, isCancel } from 'react-native-document-picker';

import { fetchLanguageResult } from '../DataFetcher';

const pickFile = async (setMethod: CallableFunction) => {
  const pickerResult = await DocumentPicker.pickSingle({
    type: [DocumentPicker.types.pdf],
    copyTo: 'cachesDirectory'
  }).catch((error) => {
    if (isCancel(error)) {
      console.log('Cancelled')
    } else {
      console.error(error)
    }
  })
  setMethod(pickerResult)
}

const ResumeUploadScreen = () => {
  const onUpload = async (res: DocumentPickerResponse, uploadComplete: CallableFunction) => {
    try {
      let formData = new FormData();
      formData.append('resumeFile', {
        uri: res.uri,
        type: res.type,
        name: res.name
      });
      await fetch('http://192.168.1.168/data', {
        method: 'POST',
        headers: {
          'content-type': 'multipart/form-data'
        },
        body: formData
      });
      uploadComplete(true);
    } catch (error) {
      console.error(error);
    }
  };

  const [pickedFile, setPickedFile] = React.useState<DocumentPickerResponse>({ name: null, uri: '', fileCopyUri: null, type: null, size: null });
  const [uploadSuccessful, setUploadSuccessful] = React.useState(false);
  const [languageResult, setLanguageResult] = React.useState<string>('')

  return (
    <Surface style={{ minHeight: '100%' }}>
      {!uploadSuccessful ?
        <View style={{ minHeight: '100%', alignContent: 'center', justifyContent: 'space-evenly' }}>
          {pickedFile.name ?
            <View style={{ alignItems: 'center' }}>
              <Text>Selected: {pickedFile.name}</Text>
              <Text>Size: {pickedFile.size ? pickedFile.size / 1000 : ''}kB</Text>
            </View> : null}
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', }}>
            <Button mode='outlined' onPress={() => { pickFile(setPickedFile) }}>Select Resume</Button>
            <Button mode='outlined' onPress={() => { onUpload(pickedFile, setUploadSuccessful) }}>Upload</Button>
          </View>
        </View>
        :
        <Surface style={{ minHeight: '50%', padding: '5%', margin: '5%', borderRadius: 25 }}>
          <Text>{fetchLanguageResult(pickedFile.name, setLanguageResult)}</Text>
        </Surface>}
    </Surface >
  )
}

export default ResumeUploadScreen;
