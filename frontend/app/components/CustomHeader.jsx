import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const CustomHeader = ({ title, subtitle, onBack, rightElement }) => {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backBtnTxt}>← Back</Text>
          </TouchableOpacity>
        )}
        <View style={styles.brandContainer}>
          <Text style={styles.brandName}>SAMARASINGHE <Text style={styles.brandNameGold}>MOTORS</Text></Text>
        </View>
        {rightElement && <View>{rightElement}</View>}
      </View>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 15, backgroundColor: '#f0ebe0' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  backBtn: { paddingVertical: 5 },
  backBtnTxt: { color: '#c9a052', fontWeight: 'bold', fontSize: 13 },
  brandContainer: { flex: 1, alignItems: 'center' },
  brandName: { fontSize: 18, fontWeight: '900', color: '#111318', letterSpacing: -0.5 },
  brandNameGold: { color: '#c9a052' },
  
  titleContainer: { marginTop: 5 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#111318' },
  subtitle: { fontSize: 12, color: '#6c757d', marginTop: 4 },
});

export default CustomHeader;
