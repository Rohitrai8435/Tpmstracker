import { StyleSheet, TextInput, View } from 'react-native';
import React, { useState } from 'react';
import SearchIcon from "../assets/svg/search.svg";

const Search = ({onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleSearch = (query) => {
    setSearchQuery(query);
    onSearch(query);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <SearchIcon width={18} height={18} color="#999" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Search..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>
    </View>
  );
};

export default Search;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    padding: 20,
    paddingBottom: 0,
    paddingTop: 10,
    backgroundColor: '#f7f7f7',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333',
    backgroundColor: 'white',
  },
});
