import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./LoginScreen"; // Import your login component
import CircleDetailsPage from "./CircleDetailsPage";
import ViewCirclesPage from "./ViewCirclesPage";
import MakeJoinViewPage from "./MakeJoinViewPage";
import MakeCirclePage from "./MakeCirclePage";
import AddTaskPage from "./AddTaskPage";
import AddMembersPage from "./AddMembersPage";
import CircleSettingsPage from "./CircleSettingsPage";
import { TouchableOpacity, Text, StatusBar } from "react-native";

const Stack = createStackNavigator();

export default function App() {
  return (
    <Stack.Navigator initialRouteName="Login">
      {/* Login Screen */}
      <Stack.Screen
        name="LoginScreen"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      {/* MakeJoin Page */}
      <Stack.Screen
        name="MakeJoinViewPage"
        component={MakeJoinViewPage}
        options={{ title: "Make or Join a Circle" }}
        options={{ headerShown: false }}
      />
      {/* Make_1 Page */}
      <Stack.Screen
        name="MakeCirclePage"
        component={MakeCirclePage}
        options={{ title: "Make a Circle" }}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ViewCirclesPage"
        component={ViewCirclesPage}
        options={{ title: "My Circles" }}
      />
      <Stack.Screen
        name="CircleDetailsPage"
        component={CircleDetailsPage}
        options={({ route, navigation }) => ({
          title: route.params.circleName,
          headerRight: () => (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("CircleSettingsPage", {
                  circleId: route.params.circleId,
                })
              }
              style={{ marginRight: 15 }}
            >
              <Text style={{ color: "#007BFF", fontSize: 16 }}>Settings</Text>
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="AddTaskPage"
        component={AddTaskPage}
        options={({ route }) => ({ title: route.params.circleName })}
      />
      <Stack.Screen
        name="AddMembers"
        component={AddMembersPage}
        options={{ title: "Invite Members" }} // Customize title for AddMembers screen
      />
      <Stack.Screen name="CircleSettingsPage" component={CircleSettingsPage} options={{ title: "Settings" }} />
    </Stack.Navigator>
  );
}
