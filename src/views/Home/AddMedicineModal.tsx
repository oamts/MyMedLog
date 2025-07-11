import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Medicine } from "@/src/views/Home/types";

interface AddMedicineModalProps {
  modalVisible: boolean;
  toggleModal: (isVisible: boolean) => void;
  onAddMedicine: (medicine: Medicine) => void;
}

export function AddMedicineModal({
  modalVisible,
  toggleModal,
  onAddMedicine,
}: AddMedicineModalProps) {
  const [newMedicine, setNewMedicine] = useState("");
  const [expiry, setExpiry] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleAddMedicine = () => {
    if (newMedicine.trim()) {
      onAddMedicine({ name: newMedicine.trim(), expiry });
      setNewMedicine("");
      setExpiry(new Date());
      toggleModal(false);
    }
  };

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => toggleModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={{ color: "#fff", marginBottom: 20 }}>Add medicine</Text>
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
            <Text style={{ color: "#fff" }}>Expiry: {expiry.toLocaleDateString()}</Text>
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
              onPress={() => toggleModal(false)}
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
  );
}

const styles = StyleSheet.create({
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
