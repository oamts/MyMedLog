import { AntDesign } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Medicine = {
  name: string;
  expiry: Date;
};

export default function Index() {
  const [modalVisible, setModalVisible] = useState(false);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [newMedicine, setNewMedicine] = useState("");
  const [expiry, setExpiry] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleAddMedicine = () => {
    if (newMedicine.trim()) {
      setMedicines([...medicines, { name: newMedicine.trim(), expiry }]);
      setNewMedicine("");
      setExpiry(new Date());
      setModalVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={{ color: "#fff", fontSize: 20, marginBottom: 16 }}>
        Medicines
      </Text>
      <FlatList
        data={medicines}
        keyExtractor={(item, index) => item.name + index}
        renderItem={({ item }) => {
          const isExpired = item.expiry < new Date();
          return (
            <View
              style={[
                styles.medicineItem,
                isExpired && { backgroundColor: "#712121" },
              ]}
            >
              <Text style={{ color: "#fff" }}>{item.name}</Text>
              <Text style={{ color: "#aaa", fontSize: 12, marginTop: 4 }}>
                Expires: {item.expiry.toLocaleDateString()}
              </Text>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={{ color: "#888" }}>No medicines added yet.</Text>
        }
        contentContainerStyle={{ flexGrow: 1, alignItems: "center" }}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <AntDesign name="plus" size={28} color="#fff" />
      </TouchableOpacity>
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ color: "#fff", marginBottom: 20 }}>
              Add medicine
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Medicine name"
              placeholderTextColor="#aaa"
              value={newMedicine}
              onChangeText={setNewMedicine}
              autoFocus
            />
            <Pressable
              style={[
                styles.input,
                {
                  marginTop: 12,
                  backgroundColor: "#222",
                  borderWidth: 1,
                  borderColor: "#444",
                },
              ]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={{ color: "#fff" }}>
                Expiry: {expiry.toLocaleDateString()}
              </Text>
            </Pressable>
            {showDatePicker && (
              <DateTimePicker
                value={expiry}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(_, selectedDate) => {
                  setShowDatePicker(Platform.OS === "ios");
                  if (selectedDate) setExpiry(selectedDate);
                }}
              />
            )}
            <View style={{ flexDirection: "row", marginTop: 16 }}>
              <Pressable
                style={[styles.modalButton, { backgroundColor: "#444" }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={{ color: "#fff" }}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.modalButton,
                  {
                    backgroundColor: "#2ecc40",
                    marginLeft: 10,
                    opacity: newMedicine.trim() ? 1 : 0.5,
                  },
                ]}
                onPress={handleAddMedicine}
                disabled={!newMedicine.trim()}
              >
                <Text style={{ color: "#fff" }}>Add</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  medicineItem: {
    backgroundColor: "#333",
    padding: 14,
    borderRadius: 8,
    marginVertical: 6,
    width: 300,
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#222",
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 250,
  },
  input: {
    backgroundColor: "#333",
    color: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: 200,
    fontSize: 16,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
});
