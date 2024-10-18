import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/authContext';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

export default function Addprofileimg() {
    const router = useRouter();
    const { user, updateProfilePicture } = useAuth();
    const [image, setImage] = useState(null);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const uploadImage = async () => {
        if (!image) {
            Alert.alert("Notice", "Please select an image before uploading");
            return;
        }

        try {
            await updateProfilePicture(user.userId, image);
            Alert.alert("Success", "Profile picture uploaded successfully", [
                { text: "OK", onPress: () => router.replace('Home') }
            ]);
        } catch (error) {
            Alert.alert("Error", "Unable to upload image. Please try again.");
        }
    };

    const handleSkip = async () => {
        try {
            // เปลี่ยนเป็นใช้ลิงก์สำหรับรูปภาพเริ่มต้น
            const defaultImageUri = 'https://res.cloudinary.com/dghpupmpd/image/upload/v1729243370/xwlge6fxf4vcri7xqrbl.png';
            await updateProfilePicture(user.userId, defaultImageUri);
            router.replace('Home');
        } catch (error) {
            Alert.alert("ข้อผิดพลาด", "ไม่สามารถตั้งค่ารูปโปรไฟล์เริ่มต้นได้ กรุณาลองอีกครั้ง");
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Add Profile Picture</Text>
                <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
                    {image ? (
                        <Image source={{ uri: image }} style={styles.image} />
                    ) : (
                        <View style={styles.placeholderContainer}>
                            <Ionicons name="camera" size={50} color="#ffffff" />
                            <Text style={styles.placeholderText}>Tap to select an image</Text>
                        </View>
                    )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={uploadImage}>
                    <Text style={styles.buttonText}>Upload Image</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                    <Text style={styles.skipButtonText}>Skip</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#6666ff',
        marginBottom: 30,
    },
    imageContainer: {
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: '#B1AFFF',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        marginBottom: 30,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    placeholderContainer: {
        alignItems: 'center',
    },
    placeholderText: {
        color: '#ffffff',
        marginTop: 10,
    },
    button: {
        backgroundColor: '#6666ff',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 25,
        marginBottom: 20,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    skipButton: {
        padding: 10,
    },
    skipButtonText: {
        color: '#6666ff',
        fontSize: 16,
    },
});
