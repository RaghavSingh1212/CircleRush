import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '@/firebase';
import { useNavigation } from '@react-navigation/native';

export default function ViewCirclesPage() {
  const [circles, setCircles] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserCircles = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const circlesRef = collection(db, 'Circles');
      console.log(circlesRef);
      const q = query(circlesRef, where('users', 'array-contains', { userName: user.displayName || user.email }));
      console.log("query:");
      console.log(q);
      const querySnapshot = await getDocs(q);

      const circlesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log("Circles Data for ");
      console.log(user);
      console.log(circlesData);

      setCircles(circlesData);
    };

    fetchUserCircles();
  }, []);

  const renderCircle = ({ item }) => (
    <TouchableOpacity
      style={styles.circleContainer}
    //   onPress={() => navigation.navigate('CircleDetails', { circleId: item.id })}
    >
      <Image source={require('@/assets/images/adaptive-icon.png')} style={styles.circleIcon} />
      <Text style={styles.circleText}>{item.circleName}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Circles</Text>
      <FlatList
        data={circles}
        renderItem={renderCircle}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  list: { alignItems: 'center' },
  circleContainer: { margin: 10, alignItems: 'center' },
  circleIcon: { width: 80, height: 80 },
  circleText: { marginTop: 5, fontSize: 16 },
});
