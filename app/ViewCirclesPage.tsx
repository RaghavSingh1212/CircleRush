import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, Image, ImageBackground, StyleSheet } from 'react-native';
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
      require('../assets/images/color1.png'),
      require('../assets/images/color2.png'),
      require('../assets/images/color3.png'),
      require('../assets/images/color4.png'),
      require('../assets/images/color5.png'),
      require('../assets/images/color6.png'),
      require('../assets/images/color7.png'),
      require('../assets/images/color8.png'),
      require('../assets/images/color9.png'),
      require('../assets/images/color10.png')
    ];
    const imageName = imageNames[item.colorCode % imageNames.length];

    return (
      <TouchableOpacity
        style={styles.circleContainer}
        onPress={() => navigation.navigate('CircleDetailsPage', { circleId: item.id, circleName: item.circleName })}
      >
        <ImageBackground source={imageName} style={styles.circleIcon} imageStyle={{ borderRadius: 10 }}>
          <Text style={styles.circleText}>{item.circleName}</Text>
        </ImageBackground>
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
        // numColumns={1}
        contentContainerStyle={styles.list}
      />
      <TouchableOpacity style={styles.buttonContainer} onPress={() => navigation.navigate('MakeJoinViewPage')}>
        <Image
          source={require('../assets/images/backarrow.png')} // Replace with your image file path
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 24, marginBottom: 20, top: 90, textAlign: 'center' },
  list: { alignItems: 'center' },
  circleContainer: {
    margin: 10,
    top: 100,
    alignItems: 'center',
    padding: 0,
    borderRadius: 10,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  circleIcon: {
    width: 315,
    height: 55,
    borderRadius: 10,
    justifyContent: 'center', // Centers the text vertically
    //alignItems: 'left',     // Centers the text horizontally
    paddingLeft: 70,
    paddingBottom: 7,
  },
  circleText: { 
    fontSize: 18, 
    //fontWeight: 'bold',
  },

  buttonContainer: {
    position: 'absolute',
    top: 30,
    left: 10,
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
