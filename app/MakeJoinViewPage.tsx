import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Button, Image, Alert } from 'react-native';

export default function MakeJoinViewPage({ navigation }) {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>

      <TouchableOpacity style={styles.makeButton} onPress={() => navigation.navigate('MakeCirclePage')}>
        <Text style={styles.makeButtonText}>Make a Circle</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.joinButton} onPress={() => navigation.navigate('JoinCirclePage')}>
        <Text style={styles.joinButtonText}>Join a Circle</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.viewButton} onPress={() => navigation.navigate('ViewCirclesPage')}>
        <Text style={styles.viewButtonText}>View my Circles</Text>
      </TouchableOpacity>

      <View style={styles.pencilContainer}>
          <Image
              source={require('../assets/images/pencil.png')}
              style={styles.pencil}
          />
      </View>

      <View style={styles.peopleContainer}>
          <Image
              source={require('../assets/images/people.png')}
              style={styles.people}
          />
      </View>

      <View style={styles.listtContainer}>
          <Image
              source={require('../assets/images/list.png')}
              style={styles.listt}
          />
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(196, 221, 235, 0.4)',
  },

  makeButton: {
    position: 'absolute',
    width: 300,
    height: 45,
    backgroundColor: '#95C0D7',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    top: 190,
    left: 45,
    elevation: 4, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  
  makeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },

  joinButton: {
    position: 'absolute',
    width: 300,
    height: 45,
    backgroundColor: '#95C0D7',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    top: 330,
    left: 45,
    elevation: 4, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },

  viewButton: {
    position: 'absolute',
    width: 300,
    height: 45,
    backgroundColor: '#95C0D7',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    top: 470,
    left: 45,
    elevation: 4, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  
  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },

  pencilContainer: {
    position: 'absolute',
    top: 135,
    left: 170,
    width: 45,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  pencil: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },

  peopleContainer: {
    position: 'absolute',
    top: 280,
    left: 170,
    width: 45,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  people: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },

  listtContainer: {
    position: 'absolute',
    top: 420,
    left: 170,
    width: 45,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  listt: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  }
});
