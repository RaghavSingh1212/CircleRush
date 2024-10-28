import React, { useState } from 'react';
//import React from 'react';
import { View, Text, TextInput, Button } from 'react-native';

export default function make_1({ navigation }) {

    const [circleName, setCircleName] = useState('');
    //const navigation = useNavigation();  // Access navigation 

    return (
      <View style={{ padding: 20 }}>

        <TextInput
            placeholder="Name your Circle"
            value={circleName}
            onChangeText={setCircleName}
            style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 20, paddingLeft: 8 }}
        />

        <Button
            title="Next"
            onPress={() => navigation.navigate('Make_2')}
            style={{ marginTop: 10 }}
        />
  
        
      </View>
    );
  }