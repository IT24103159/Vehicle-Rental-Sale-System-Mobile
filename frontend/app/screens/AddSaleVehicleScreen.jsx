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
  Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
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
  });

  const [selectedImages, setSelectedImages] = useState([]);
  const [scanReport, setScanReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.7,
      selectionLimit: 5,
    });

    if (!result.canceled) {
      const newImages = [...selectedImages, ...result.assets.map(a => a.uri)].slice(0, 5);
      setSelectedImages(newImages);
    }
  };

  const removeImage = (index) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const pickScanReport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setScanReport(result.assets[0]);
      }
    } catch (error) {
      console.log('Error picking document', error);
      Alert.alert("Error", "Could not pick PDF document.");
    }
  };

  const removeScanReport = () => {
    setScanReport(null);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price || !formData.brand) {
      Alert.alert("Required", "Please fill Name, Brand, and Price");
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      
      // Append fields
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });

      // Append Images
      for (const [index, uri] of selectedImages.entries()) {
        if (Platform.OS === 'web') {
          const res = await fetch(uri);
          const blob = await res.blob();
          data.append('images', blob, `upload_${index}.jpg`);
        } else {
          const filename = uri.split('/').pop() || `upload_${index}.jpg`;
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : `image/jpeg`;
          
          data.append('images', {
            uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
            name: filename,
            type
          });
        }
      }

      // Append Scan Report
      if (scanReport) {
        if (Platform.OS === 'web') {
          const res = await fetch(scanReport.uri);
          const blob = await res.blob();
          data.append('scanReport', blob, scanReport.name || 'report.pdf');
        } else {
          data.append('scanReport', {
            uri: Platform.OS === 'ios' ? scanReport.uri.replace('file://', '') : scanReport.uri,
            name: scanReport.name || 'report.pdf',
            type: scanReport.mimeType || 'application/pdf'
          });
        }
      }

      await api.post('/vehicles/sale', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      Alert.alert("Success", "Sale vehicle added successfully!");
      navigation.goBack();
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to add vehicle");
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
          
          <Text style={styles.smallLabel}>VEHICLE IMAGES (MAX 5)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
            {selectedImages.map((uri, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri }} style={styles.previewImg} />
                <TouchableOpacity style={styles.removeImgBtn} onPress={() => removeImage(index)}>
                  <Text style={styles.removeImgTxt}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
            {selectedImages.length < 5 && (
              <TouchableOpacity style={styles.addImageBtn} onPress={pickImages}>
                <Text style={styles.addImageTxt}>+</Text>
                <Text style={{ fontSize: 10, color: '#888' }}>Add Photo</Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          <Text style={styles.sectionLabel}>DOCUMENTS</Text>
          <Text style={styles.smallLabel}>VEHICLE HEALTH SCAN REPORT (PDF ONLY)</Text>
          {scanReport ? (
            <View style={styles.pdfContainer}>
              <Text style={styles.pdfText}>📄 {scanReport.name}</Text>
              <TouchableOpacity onPress={removeScanReport} style={styles.removePdfBtn}>
                <Text style={styles.removePdfTxt}>Remove</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.uploadPdfBtn} onPress={pickScanReport}>
              <Text style={styles.uploadPdfTxt}>+ Upload PDF Report</Text>
            </TouchableOpacity>
          )}

          <TextInput style={[styles.input, {height: 80, marginTop: 15}]} placeholder="Description" multiline value={formData.description} onChangeText={v => inputChange('description', v)} />

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
  submitBtnTxt: { color: '#000', fontWeight: 'bold', fontSize: 16 },

  // Image Picker Styles
  imageScroll: { flexDirection: 'row', marginTop: 5, marginBottom: 15 },
  imageWrapper: { marginRight: 12, position: 'relative' },
  previewImg: { width: 80, height: 80, borderRadius: 10, backgroundColor: '#1e212a' },
  removeImgBtn: { position: 'absolute', top: -5, right: -5, backgroundColor: '#ef4444', width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  removeImgTxt: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  addImageBtn: { width: 80, height: 80, borderRadius: 10, borderStyle: 'dashed', borderWidth: 1, borderColor: '#444', justifyContent: 'center', alignItems: 'center', backgroundColor: '#1e212a' },
  addImageTxt: { fontSize: 24, color: '#c9a052', marginBottom: 2 },

  // PDF Styles
  uploadPdfBtn: { backgroundColor: '#1e212a', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#444', borderStyle: 'dashed', alignItems: 'center', marginBottom: 15 },
  uploadPdfTxt: { color: '#c9a052', fontWeight: 'bold' },
  pdfContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1e212a', padding: 15, borderRadius: 10, marginBottom: 15 },
  pdfText: { color: '#fff', flex: 1, marginRight: 10 },
  removePdfBtn: { backgroundColor: '#ef4444', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5 },
  removePdfTxt: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
});

export default AddSaleVehicleScreen;
