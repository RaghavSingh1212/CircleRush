import React from 'react';
import { View, Text, Button } from 'react-native';

export default function MakeJoinPage({ navigation }) {
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Make or Join a Circle</Text>

      <Button
        title="View My Circles"
        onPress={() => Alert.alert('Show user circles')}
      />

      <Button
        title="Make a Circle"
        onPress={() => navigation.navigate('Make_1')}
        style={{ marginTop: 10 }}
      />

      <Button
        title="Join a Circle"
        onPress={() => Alert.alert('Navigate to join circle screen')}
        style={{ marginTop: 10 }}
      />
    </View>
  );
}
