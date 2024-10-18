import { StyleSheet, View, Text, TouchableOpacity, Image, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/authContext';
import { MediaTypeOptions } from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebaesConfig';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';
import Loading from '../../components/Loading';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

export default function Profile() {
    const { logout, user, updateUsername, updateProfilePicture } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [image, setImage] = useState(user?.profilePicture || null);
    const [newUsername, setNewUsername] = useState(user?.username || '');
    const [isEditingUsername, setIsEditingUsername] = useState(false);

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert("Permission required", "Please allow access to your media library.");
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        console.log('Image picker result:', result);

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const imageUri = result.assets[0].uri;

            if (!imageUri) {
                Alert.alert("Error", "Could not select image. Please try again.");
                return;
            }

            console.log('Selected image URI:', imageUri);
            setImage(imageUri);
            uploadImage(imageUri);
        }
    };

    const uploadImage = async (uri) => {
        if (!user || !user.userId) {
            Alert.alert("Error", "User information is not available.");
            return;
        }

        setUploading(true);
        try {
            const platformUri = Platform.OS === 'android' && !uri.startsWith('file://') ? `file://${uri}` : uri;

            console.log('Uploading image from URI:', platformUri);

            const response = await fetch(platformUri);

            if (!response.ok) {
                throw new Error('Failed to fetch the image from the URI.');
            }

            const blob = await response.blob();

            const fileSizeInMB = blob.size / (1024 * 1024);
            if (fileSizeInMB > 5) {
                throw new Error('Image size is too large. Please select an image under 5MB.');
            }

            const storageRef = ref(storage, `profilePictures/${user.userId}`);
            const snapshot = await uploadBytes(storageRef, blob);

            const downloadURL = await getDownloadURL(snapshot.ref);
            await updateProfilePicture(user.userId, downloadURL);

            setImage(downloadURL);
            Alert.alert("Success", "Profile picture uploaded successfully!");

        } catch (error) {
            console.error("Image upload failed:", error);
            Alert.alert("Error", error.message || "Image upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };


    useEffect(() => {
        if (user && user.profilePicture) {
            setImage(user.profilePicture);
        }
    }, [user, user?.profilePicture]);

    const handlerLogout = async () => {
        await logout();
    };

    const handleUpdateUsername = async () => {
        if (newUsername.trim() !== '' && newUsername !== user.username) {
            const result = await updateUsername(user.userId, newUsername);
            if (result.success) {
                Alert.alert("Success", "Username updated successfully");
                setIsEditingUsername(false);
                setImage(user.profilePicture);
            } else {
                Alert.alert("Error", "Failed to update username. Please try again.");
            }
        } else {
            setIsEditingUsername(false);
        }
    };

    const handleEditUsername = () => {
        setIsEditingUsername(true);
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={pickImage} style={styles.profileImageContainer}>
                    {image && !uploading ? (
                        <Image
                            source={{ uri: image }}
                            style={styles.profileImage}
                            resizeMode='cover'
                        />
                    ) : (
                        <View style={styles.placeholderContainer}>
                            <FontAwesome5 name="user-alt" size={50} color="#6666ff" />
                        </View>
                    )}
                    {uploading && (
                        <View style={styles.loadingOverlay}>
                            <Loading size={50} />
                        </View>
                    )}
                    <View style={styles.profileEditIconContainer}>
                        <Ionicons name="camera" size={20} color="#fff" />
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.contentContainer}>
                <View style={styles.infoContainer}>
                    <View style={styles.infoItem}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="person" size={24} color="#6666ff" />
                        </View>
                        <View style={styles.textContainer}>
                            {isEditingUsername ? (
                                <TextInput
                                    style={styles.usernameInput}
                                    value={newUsername}
                                    onChangeText={setNewUsername}
                                    placeholder="Enter new username"
                                />
                            ) : (
                                <Text style={styles.infoText}>{user?.username || 'username'}</Text>
                            )}
                        </View>
                        <TouchableOpacity
                            onPress={isEditingUsername ? handleUpdateUsername : handleEditUsername}
                            style={styles.usernameEditIconContainer}
                        >
                            <Ionicons
                                name={isEditingUsername ? "checkmark" : "pencil"}
                                size={20}
                                color="#fff"
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.infoItem}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="mail" size={24} color="#6666ff" />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.infoText}>{user?.email || 'No email'}</Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={handlerLogout}>
                    <View style={styles.logoutGradient}>
                        <Ionicons name="log-out" size={24} color="#fff" />
                        <Text style={styles.logoutButtonText}>Logout</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        paddingTop: 60,
    },
    headerContainer: {
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: 30,
    },
    contentContainer: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 30,
    },
    profileImageContainer: {
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 4,
        borderColor: '#6666ff',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.34,
        shadowRadius: 6.27,
        backgroundColor: '#fff',
    },
    profileImage: {
        width: '100%',
        height: '100%',
        borderRadius: 71,
    },
    placeholderContainer: {
        width: '100%',
        height: '100%',
        borderRadius: 71,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 71,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileEditIconContainer: {
        position: 'absolute',
        bottom: -5,
        right: 5,
        backgroundColor: '#6666ff',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    infoContainer: {
        width: '100%',
        marginBottom: 30,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    iconContainer: {
        width: 40,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    infoText: {
        color: '#333',
        fontSize: 20,
        fontWeight: '600',
    },
    usernameInput: {
        fontSize: 16,
        color: '#333',
        borderBottomWidth: 1,
        borderBottomColor: '#6666ff',
        paddingVertical: 5,
    },
    logoutButton: {
        width: '100%',
        overflow: 'hidden',
        borderRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        backgroundColor: '#ff4d4d',
    },
    logoutGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        paddingHorizontal: 30,
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    usernameEditIconContainer: {
        backgroundColor: '#6666ff',
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
});
