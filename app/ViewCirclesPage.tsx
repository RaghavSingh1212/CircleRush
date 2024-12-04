import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ImageBackground, StyleSheet } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '@/firebase';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

export default function ViewCirclesPage() {
  const [circles, setCircles] = useState([]);
  const navigation = useNavigation();

  const fetchUserCircles = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;

    const circlesRef = collection(db, 'Circles');
    const q = query(circlesRef);

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
    /*
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
      require('../assets/images/color10.png'),
    ];
    */
    //const imageName = imageNames[item.colorCode % imageNames.length];

    const circColor = item.colorCode;

    return (
      <TouchableOpacity
        style={styles.circleContainer}
        onPress={() => navigation.navigate('CircleDetailsPage', { circleId: item.id, circleName: item.circleName })}
      >
        <View style={[styles.rectangle, { backgroundColor: `${circColor}80` }]}>
          <View style={[styles.circleInsideRectangle, {backgroundColor: circColor}]} />
          <Text style={styles.circleText}>{item.circleName}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Circles</Text>
      <FlatList
        data={circles}
        renderItem={renderCircle}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
      <TouchableOpacity style={styles.buttonContainer} onPress={() => navigation.goBack()}>
        <Image source={require('../assets/images/backarrow.png')} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 100, // Added padding to push the entire page down
    // backgroundColor: '#C4DDEB66',

  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  list: {
    alignItems: 'center',
    paddingTop: 10,
  },
  circleContainer: {
    marginVertical: 0,
    alignItems: 'center',
    width: '100%',
  },
  rectangle: {
    width: 300,
    height: 50,
    //opacity: 0.5,
    //backgroundColor: circColor, // Light blue
    alignSelf: 'center',
    borderRadius: 10,
    marginBottom: 20,
    flexDirection: 'row', // Horizontal layout
    alignItems: 'center', // Center vertically
    paddingHorizontal: 15, // Add padding inside the rectangle
  },

  circleInsideRectangle: {
    width: 30, // Diameter of the circle
    height: 30, // Diameter of the circle
    borderRadius: 15, // Half of the width/height for a perfect circle
  },

  circleIcon: {
    width: 315,
    height: 55,
    borderRadius: 10,
    justifyContent: 'center',
    paddingLeft: 70,
  },
  circleText: {
    fontSize: 18,
    marginLeft: 10, // Space between the circle and text
  },
  buttonContainer: {
    position: 'absolute',
    top: 55,
    left: 25,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
