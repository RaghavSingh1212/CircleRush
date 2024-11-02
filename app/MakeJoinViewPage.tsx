import React from 'react';
import { View, Text, Button, Alert } from 'react-native';

export default function MakeJoinViewPage({ navigation }) {
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Make or Join a Circle</Text>

      <Button
        title="View My Circles"
        onPress={() => navigation.navigate('ViewCirclesPage')}
        style={{ marginTop: 20 }}
      />

      <Button
        title="Make a Circle"
        onPress={() => navigation.navigate('MakeCirclePage')}
        style={{ marginTop: 20 }}
      />

      <Button
        title="Join a Circle"
        onPress={() => Alert.alert('Navigate to join circle screen')}
        style={{ marginTop: 20 }}
      />
    </View>
  );
}
