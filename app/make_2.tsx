import React, { useState } from 'react';
//import React from 'react';
import { View, Text, TextInput, Button } from 'react-native';

export default function make_2({ navigation }) {

    const [timeFrame, setTimeFrame] = useState('');
    //const navigation = useNavigation();  // Access navigation 

    return (
      <View style={{ padding: 20 }}>

        <TextInput
            placeholder="Set a Time Frame"
            value={timeFrame}
            onChangeText={setTimeFrame}
            style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 20, paddingLeft: 8 }}
        />

        <Button
            title="Next"
            onPress={() => navigation.navigate('Make_3')}
            style={{ marginTop: 10 }}
        />
  
        
      </View>
    );
  }