import { AntDesign } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Medicine } from "@/src/views/Home/types";
import MedicineList from "@/src/views/Home/MedicineList";
import AddMedicineModal from "@/src/views/Home/AddMedicineModal";

export function HomeView() {
  const [modalVisible, setModalVisible] = useState(false);
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  const handleAddMedicine = (medicine: Medicine) => {
    setMedicines([...medicines, medicine]);
  };

  return (
    <View style={styles.container}>
      <Text style={{ color: "#fff", fontSize: 20, marginBottom: 16 }}>Medicines</Text>
      <MedicineList medicines={medicines} />
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <AntDesign name="plus" size={28} color="#fff" />
      </TouchableOpacity>
      <AddMedicineModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        onAddMedicine={handleAddMedicine}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    paddingTop: 60,
  },
  addButton: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "#333",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
