import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Medicine } from "@/src/views/Home/types";
import { MedicineList } from "@/src/views/Home/MedicineList";
import { AddMedicineModal } from "@/src/views/Home/AddMedicineModal";
import { AddButton } from "@/src/views/Home/AddButton";

export function HomeView() {
  const [modalVisible, setModalVisible] = useState(false);
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  const handleAddMedicine = (medicine: Medicine) => {
    setMedicines([...medicines, medicine]);
  };

  function toggleModal(isVisible?: boolean) {
    if (isVisible !== undefined) {
      setModalVisible(isVisible);
    } else {
      setModalVisible(!modalVisible);
    }
  }

  return (
    <View style={styles.container}>
      <Title title={"Medicines"} />
      <MedicineList medicines={medicines} />
      <AddButton toggleModal={toggleModal} />
      <AddMedicineModal
        modalVisible={modalVisible}
        toggleModal={toggleModal}
        onAddMedicine={handleAddMedicine}
      />
    </View>
  );
}

function Title({ title }: { title: string }) {
  return <Text style={{ color: "#fff", fontSize: 20, marginBottom: 16 }}>{title}</Text>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    paddingTop: 60,
  },
});
