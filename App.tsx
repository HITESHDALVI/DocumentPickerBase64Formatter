import React from 'react';
import {
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import DocumentPicker from 'react-native-document-picker';
import RNFetchBlob from 'react-native-blob-util';
function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  const [result, setResult] = React.useState<
    | {
        name: string;
        type: string;
        size: number | null;
        extension: string;
        blob: any;
        path: string;
      }[]
    | undefined
    | null
  >(null);

  const handleDocumentUpload = async () => {
    try {
      const res = await DocumentPicker.pickSingle();
      if (!res) {
        throw new Error('File pick cancelled or failed');
      }
      const {
        type: fileType,
        uri: fileUri,
        name: fileName,
        size: fileSize,
      } = res;

      if (!fileType || !fileUri || !fileName) {
        throw new Error('Failed to get file information');
      }
      const fileExtension = fileType.substr(fileType.indexOf('/') + 1);
      let realURI = fileUri;
      if (Platform.OS === 'ios') {
        realURI = decodeURI(fileUri);
      }
      const base64Data = await getBase64Data(realURI);
      const sanitizedFileName = fileName.replace(/\s/g, '');
      const path = '/patients';

      const newUploadedFile = [
        {
          name: sanitizedFileName,
          type: fileType,
          size: fileSize,
          extension: fileExtension,
          blob: base64Data,
          path: Array.isArray(path) ? path.join() : path,
        },
      ];
      setResult(newUploadedFile);
    } catch (error) {
      console.error('Error picking or processing file:', error);
    }
  };

  const getBase64Data = async (uri: string) => {
    try {
      const base64Data = await RNFetchBlob.fs.readFile(uri, 'base64');
      return base64Data;
    } catch (error) {
      console.error('Error reading file as base64:', error);
      throw new Error('Failed to read file');
    }
  };
  return (
    <View style={styles.wrapper}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <TouchableOpacity
        style={[styles.button]}
        onPress={async () => {
          handleDocumentUpload();
        }}>
        <Text style={[{color: 'black', fontFamily: '800', fontSize: 18}]}>
          Upload
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'blue',
    width: 200,
    height: 50,
    opacity: 0.3,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  wrapper: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;
