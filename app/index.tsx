import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';  // Import the Firestore instance

export default function App() {
  const [circleName, setCircleName] = useState('');

  useEffect(() => {
    const fetchCircleName = async () => {
      try {
        // Reference the document in the "Circles" collection by its ID
        // console.log(db);
        const docRef = doc(db, 'Circles', 'DKntG1PEtg8zETDDruBA');
        // console.log(docRef);
        // console.log(docRef);
        console.log("bruh");
        const docSnap = await getDoc(docRef);
        console.log("getting the data:");
        console.log(docSnap);

        // Check if the document exists and fetch the "name" field
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCircleName(data.name);  // Assuming the document has a "name" field
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching document: ', error);
      }
    };

    fetchCircleName();
  }, []);

  return (
    <View>
      {circleName ? <Text>{circleName}</Text> : <Text>Loading...</Text>}
    </View>
  );
}
