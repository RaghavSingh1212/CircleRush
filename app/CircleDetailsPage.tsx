import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";

export default function CircleDetailsPage({ route }) {
  const { circleId } = route.params;
  const [circleData, setCircleData] = useState(null);

  useEffect(() => {
    const fetchCircleData = async () => {
      const docRef = doc(db, "Circles", circleId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setCircleData(docSnap.data());
      }
    };

    fetchCircleData();
  }, [circleId]);

  if (!circleData) return <Text>Loading...</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{circleData.circleName}</Text>
      <Text>Duration: {circleData.duration} days</Text>
      <Text>Winner Prize: {circleData.winnerPrize}</Text>
      <Text>Loser Challenge: {circleData.loserChallenge}</Text>
      <FlatList
        data={circleData.users}
      />
      {/* Display more circle details as needed */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 24, marginBottom: 20 },
});
