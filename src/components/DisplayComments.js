// src/components/DisplayComments.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';

const DisplayComments = ({ reportId, parameterPath }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(
          `https://medical-server-7fmg.onrender.com/api/comments/${reportId}/parameter/${parameterPath}`
        );
        const data = await response.json();
        setComments(data.comments);
      } catch (error) {
        console.error("Error fetching comments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [reportId, parameterPath]);

  if (loading) {
    return <ActivityIndicator size="large" color="#6200ee" />;
  }

  return (
    <View>
      <FlatList
        data={comments}
        renderItem={({ item }) => (
          <View style={{ padding: 10, borderBottomWidth: 1 }}>
            <Text style={{ fontWeight: 'bold' }}>{item.commenterId}:</Text>
            <Text>{item.text}</Text>
          </View>
        )}
        keyExtractor={(item) => item._id}
      />
    </View>
  );
};

export default DisplayComments;
