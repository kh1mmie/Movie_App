 import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { auth } from './firebaseConfig';

export default function App() {
  useEffect(() => {
    console.log('Firebase Auth:', auth);
  }, []);

  return (
    <View>
      <Text>Firebase Setup Done ✅</Text>
    </View>
  );
}
