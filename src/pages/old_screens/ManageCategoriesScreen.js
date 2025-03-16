import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';

const ManageCategoriesScreen = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [message, setMessage] = useState('');

  // Fetch existing categories
  useEffect(() => {
    fetch('http://localhost:3000/api/categories') // Update with your backend URL
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((error) => {
        console.error('Error fetching categories:', error);
        setMessage('Failed to fetch categories.');
      });
  }, []);

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      setMessage('Please enter a category name.');
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategory.trim() }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Category added successfully.');
        setCategories((prev) => [...prev, { name: newCategory.trim(), _id: data._id }]);
        setNewCategory('');
      } else {
        setMessage(data.message || 'Failed to add category.');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      setMessage('Failed to add category.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Manage Categories</Text>
      {message && <Text style={styles.message}>{message}</Text>}

      <View style={styles.inputContainer}>
        <Text style={styles.label}>New Category:</Text>
        <TextInput
          style={styles.input}
          value={newCategory}
          onChangeText={setNewCategory}
          placeholder="Enter category name"
        />
      </View>
      <Button title="Add Category" onPress={handleAddCategory} />

      <Text style={styles.subHeader}>Existing Categories</Text>
      <FlatList
        data={categories}
        keyExtractor={(item) => item._id || item.name}
        renderItem={({ item }) => <Text style={styles.categoryItem}>{item.name}</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    color: 'red',
    marginBottom: 10,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  subHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  categoryItem: {
    fontSize: 18,
    marginVertical: 5,
  },
});

export default ManageCategoriesScreen;
