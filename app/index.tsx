import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './LoginScreen'  // Import your login component
import MakeJoinPage from './MakeJoinPage';  // Import your MakeJoin page component

const Stack = createStackNavigator();

export default function App() {
  return (
    // <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        {/* Login Screen */}
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        {/* MakeJoin Page */}
        <Stack.Screen name="MakeJoin" component={MakeJoinPage} options={{ title: 'Make or Join a Circle' }} />
      </Stack.Navigator>
    // </NavigationContainer>
  );
}
