import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './LoginScreen'  // Import your login component
import MakeJoinPage from './MakeJoinPage';  // Import your MakeJoin page component
import make_1 from './make_1';
import make_2 from './make_2';
import make_3 from './make_3';

const Stack = createStackNavigator();

export default function App() {
  return (
    // <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        {/* Login Screen */}
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        {/* MakeJoin Page */}
        <Stack.Screen name="MakeJoin" component={MakeJoinPage} options={{ title: 'Make or Join a Circle' }} />
        {/* Make_1 Page */}
        <Stack.Screen name="Make_1" component={make_1} options={{ title: 'Make a Circle' }} />
      </Stack.Navigator>
    // </NavigationContainer>
  );
}
