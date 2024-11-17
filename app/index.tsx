<<<<<<< HEAD
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './LoginScreen'  // Import your login component
import CircleDetailsPage from './CircleDetailsPage';
import ViewCirclesPage from './ViewCirclesPage';
import MakeJoinViewPage from './MakeJoinViewPage';
import MakeCirclePage from './MakeCirclePage';
import AddTaskPage from './AddTaskPage';
import AddMembersPage from './AddMembersPage';


const Stack = createStackNavigator();

export default function App() {
  return (
      <Stack.Navigator initialRouteName="Login">
        {/* Login Screen */}
        <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
        {/* MakeJoin Page */}
        <Stack.Screen name="MakeJoinViewPage" component={MakeJoinViewPage} options={{ title: 'Make or Join a Circle' }} />
        {/* Make_1 Page */}
        <Stack.Screen name="MakeCirclePage" component={MakeCirclePage} options={{ title: 'Make a Circle' }} />
        <Stack.Screen name="ViewCirclesPage" component={ViewCirclesPage} options={{ title: 'My Circles' }} />
        <Stack.Screen name="CircleDetailsPage" component={CircleDetailsPage} options={({ route }) => ({ title: route.params.circleName })} />
        <Stack.Screen name="AddTaskPage" component={AddTaskPage} options={({ route }) => ({ title: route.params.circleName })} />
        <Stack.Screen
          name="AddMembers"
          component={AddMembersPage}
          options={{ title: 'Invite Members' }} // Customize title for AddMembers screen
        />

      </Stack.Navigator>
      
=======
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
    </View>
>>>>>>> parent of a51cc8fc (firestore connection working)
  );
}
