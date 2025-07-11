import { FlatList, StyleSheet, Text, View } from "react-native";
import { Medicine } from "@/src/views/Home/types";

type MedicineListProps = {
  medicines: Medicine[];
};

export function MedicineList({ medicines }: MedicineListProps) {
  return (
    <FlatList
      data={medicines}
      keyExtractor={(item, index) => item.name + index}
      renderItem={({ item }) => {
        const isExpired = new Date(item.expiry) < new Date();
        return (
          <View style={[styles.medicineItem, isExpired && { backgroundColor: "#712121" }]}>
            <Text style={{ color: "#fff" }}>{item.name}</Text>
            <Text style={{ color: "#aaa", fontSize: 12, marginTop: 4 }}>
              Expires: {item.expiry}
            </Text>
          </View>
        );
      }}
      ListEmptyComponent={<Text style={{ color: "#888" }}>No medicines added yet.</Text>}
      contentContainerStyle={{ flexGrow: 1, alignItems: "center" }}
    />
  );
}

const styles = StyleSheet.create({
  medicineItem: {
    backgroundColor: "#333",
    padding: 14,
    borderRadius: 8,
    marginVertical: 6,
    width: 300,
    alignItems: "center",
  },
});
