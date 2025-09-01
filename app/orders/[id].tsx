import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function OrderDetail(){
  const { id } = useLocalSearchParams();
  return (
    <View style={{ flex:1, padding:16 }}>
      <Text style={{ fontSize:18, fontWeight:'600' }}>Order {id}</Text>
      <Text style={{ marginTop:8 }}>Status timeline stub.</Text>
    </View>
  );
}
