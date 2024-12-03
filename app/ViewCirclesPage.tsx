import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '@/firebase';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

export default function ViewCirclesPage() {
  const [circles, setCircles] = useState([]);
  const navigation = useNavigation();

  const fetchUserCircles = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;

    const circlesRef = collection(db, "Circles");
    const q = query(circlesRef); // Fetch all circles

    const querySnapshot = await getDocs(q);
    const circlesData = querySnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((circle) =>
        circle.users.some((u) => u.userName === (user.displayName || user.email))
      );

    setCircles(circlesData);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUserCircles();
    }, [fetchUserCircles])
  );

  const renderCircle = ({ item, index }) => {
    // Dynamically set image and background color based on index
    const imageNames = [
      require('../assets/images/Vector-1.png'),
      require('../assets/images/Vector-2.png'),
      require('../assets/images/Vector-3.png'),
      require('../assets/images/Vector-4.png')
    ];
    const imageName = imageNames[index % imageNames.length];

    return (
      <TouchableOpacity
        style={styles.circleContainer}
        onPress={() => navigation.navigate('CircleDetailsPage', { circleId: item.id, circleName: item.circleName })}
      >
        <Image source={imageName} style={styles.circleIcon} />
        <Text style={styles.circleText}>{item.circleName}</Text>
      </TouchableOpacity>
    );
  };

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
  circleContainer: {
    margin: 10,
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  circleIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
  },
  circleText: { marginTop: 5, fontSize: 16 },
});
