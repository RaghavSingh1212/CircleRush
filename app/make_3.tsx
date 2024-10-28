import React, { useState } from 'react';
//import React from 'react';
import { View, Text, TextInput, Button } from 'react-native';

export default function make_3({ navigation }) {

    const [goalName, setGoalName] = useState('');
    //const navigation = useNavigation();  // Access navigation 

    return (
      <View style={{ padding: 20 }}>

        <TextInput
            placeholder="Set a Goal"
            value={goalName}
            onChangeText={setGoalName}
            style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 20, paddingLeft: 8 }}
        />

        <Button
            title="Create Circle"
            onPress={() => navigation.navigate('AddMembers')}
            style={{ marginTop: 10 }}
        />
  
        
      </View>
    );
  }