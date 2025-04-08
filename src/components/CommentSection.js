// src/components/CommentSection.js
import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';

const CommentSection = ({ reportId, parameterPath, userId }) => {
  const [comment, setComment] = useState("");

  const handleAddComment = async () => {
    if (!comment) {
      Alert.alert("Error", "Please enter a comment.");
      return;
    }

    try {
      const response = await fetch("https://medical-server-7fmg.onrender.com/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportId,
          userId,
          sharedBy: userId,  // Assuming sharedBy is the user who shares the report
          commenterId: userId,
          commentType: "parameter",
          parameterPath,
          text: comment,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        Alert.alert("Success", "Comment added successfully.");
        setComment(""); // Clear comment input field
      } else {
        Alert.alert("Error", result.error || "Failed to add comment.");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      Alert.alert("Error", "Failed to add comment.");
    }
  };

  return (
    <View>
      <TextInput
        value={comment}
        onChangeText={setComment}
        placeholder="Add a comment"
        multiline
        style={{ borderColor: 'gray', borderWidth: 1, padding: 10, marginBottom: 10 }}
      />
      <Button title="Add Comment" onPress={handleAddComment} />
    </View>
  );
};

export default CommentSection;
