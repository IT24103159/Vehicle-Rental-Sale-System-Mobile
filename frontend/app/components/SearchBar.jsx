import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text } from 'react-native';

const SearchBar = ({ searchQuery, onSearchChange, onFilterPress, isFilterVisible }) => {
  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <Text style={{ fontSize: 18, marginRight: 10 }}>🔍</Text>
        <TextInput 
          style={styles.searchInput} 
          placeholder="Search vehicles..." 
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={onSearchChange}
        />
      </View>
      <TouchableOpacity style={styles.filterToggleBtn} onPress={onFilterPress}>
        <Text style={{ fontSize: 20 }}>{isFilterVisible ? '✕' : '⚙️'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#f0ebe0',
    gap: 12,
    alignItems: 'center'
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 55,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '500'
  },
  filterToggleBtn: {
    width: 55,
    height: 55,
    backgroundColor: '#111318',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
});

export default SearchBar;
