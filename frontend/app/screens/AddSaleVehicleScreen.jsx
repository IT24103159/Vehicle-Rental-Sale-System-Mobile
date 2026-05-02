import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import api from '../../services/api';

const AddSaleVehicleScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    conditionStatus: 'Registered',
    yearReg: '',
    yom: '',
    transmission: 'Auto',
    bodyType: '',
    mileage: '',
    price: '',
    description: '',
    imageUrl: '', // For simple demo, using a text URL for image
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.name || !formData.price || !formData.brand) {
      if (Platform.OS === 'web') window.alert("Please fill required fields (Name, Brand, Price)");
      else Alert.alert("Required", "Please fill Name, Brand, and Price");
      return;
    }

    setLoading(true);
    try {
      await api.post('/vehicles/sale', {
        ...formData,
        price: parseFloat(formData.price),
        mileage: parseFloat(formData.mileage),
        yearReg: parseInt(formData.yearReg),
        yom: parseInt(formData.yom),
        images: [formData.imageUrl]
      });

      if (Platform.OS === 'web') window.alert("Sale vehicle added successfully!");
      else Alert.alert("Success", "Sale vehicle added successfully!");
      navigation.goBack();
    } catch (err) {
      console.log(err);
      if (Platform.OS === 'web') window.alert("Failed to add vehicle");
      else Alert.alert("Error", "Failed to add vehicle");
    } finally {
      setLoading(false);
    }
  };

  const inputChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0ebe0" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Sale Vehicle</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.formCard}>
          <Text style={styles.sectionLabel}>BASIC INFORMATION</Text>
          <TextInput style={styles.input} placeholder="Vehicle Name (e.g. Civic)" value={formData.name} onChangeText={v => inputChange('name', v)} />
          <TextInput style={styles.input} placeholder="Brand (e.g. Honda)" value={formData.brand} onChangeText={v => inputChange('brand', v)} />
          
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.smallLabel}>CONDITION</Text>
              <select 
                style={styles.webSelect} 
                value={formData.conditionStatus} 
                onChange={e => inputChange('conditionStatus', e.target.value)}
              >
                <option value="Brand New">Brand New</option>
                <option value="Registered">Registered</option>
                <option value="Reconditioned">Reconditioned</option>
              </select>
            </View>
            <View style={styles.col}>
              <Text style={styles.smallLabel}>TRANSMISSION</Text>
              <select 
                style={styles.webSelect} 
                value={formData.transmission} 
                onChange={e => inputChange('transmission', e.target.value)}
              >
                <option value="Auto">Auto</option>
                <option value="Manual">Manual</option>
                <option value="Tiptronic">Tiptronic</option>
              </select>
            </View>
          </View>

          <Text style={styles.sectionLabel}>TECHNICAL SPECS</Text>
          <View style={styles.row}>
            <TextInput style={[styles.input, {flex: 1, marginRight: 10}]} placeholder="YOM" keyboardType="numeric" value={formData.yom} onChangeText={v => inputChange('yom', v)} />
            <TextInput style={[styles.input, {flex: 1}]} placeholder="Reg Year" keyboardType="numeric" value={formData.yearReg} onChangeText={v => inputChange('yearReg', v)} />
          </View>
          <TextInput style={styles.input} placeholder="Body Type (e.g. SUV, Sedan)" value={formData.bodyType} onChangeText={v => inputChange('bodyType', v)} />
          <TextInput style={styles.input} placeholder="Mileage (km)" keyboardType="numeric" value={formData.mileage} onChangeText={v => inputChange('mileage', v)} />

          <Text style={styles.sectionLabel}>PRICING & MEDIA</Text>
          <TextInput style={[styles.input, styles.priceInput]} placeholder="Price (Rs.)" keyboardType="numeric" value={formData.price} onChangeText={v => inputChange('price', v)} />
          <TextInput style={styles.input} placeholder="Image URL" value={formData.imageUrl} onChangeText={v => inputChange('imageUrl', v)} />
          <TextInput style={[styles.input, {height: 80}]} placeholder="Description" multiline value={formData.description} onChangeText={v => inputChange('description', v)} />

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.submitBtnTxt}>Add to Fleet</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f0ebe0' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  backBtn: { color: '#c9a052', fontWeight: 'bold' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 'bold', marginRight: 40 },
  container: { padding: 20 },
  formCard: { backgroundColor: '#111318', borderRadius: 20, padding: 20 },
  sectionLabel: { color: '#c9a052', fontSize: 12, fontWeight: 'bold', marginBottom: 15, marginTop: 10 },
  smallLabel: { color: '#888', fontSize: 10, marginBottom: 5 },
  input: { backgroundColor: '#1e212a', color: '#fff', padding: 15, borderRadius: 10, marginBottom: 15 },
  priceInput: { borderColor: '#c9a052', borderWidth: 1 },
  row: { flexDirection: 'row', marginBottom: 15 },
  col: { flex: 1, marginRight: 10 },
  webSelect: { width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: '#1e212a', color: '#fff', border: 'none' },
  submitBtn: { backgroundColor: '#c9a052', padding: 18, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  submitBtnTxt: { color: '#000', fontWeight: 'bold', fontSize: 16 }
});

export default AddSaleVehicleScreen;
