import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Dimensions, KeyboardAvoidingView, ScrollView, Platform } from 'react-native'
import React, { useState } from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useRouter } from 'expo-router';
import Loading from '../components/Loading';
import { useAuth } from '../context/authContext';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function SignIn() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [focusedInput, setFocusedInput] = useState(null);

    const { login } = useAuth();
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Sign In', "Please fill all the fields!")
            return;
        }
        if (!validateEmail(email)) {
            Alert.alert('Sign In', "Invalid email format!")
            return;
        }

        setLoading(true);

        let response = await login(email, password)

        if (!response.success) {
            setLoading(false);
            Alert.alert('Sign In', response.msg)
            return;
        }

    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Loading size={200} />
            </View>
        )
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
            <ScrollView
                contentContainerStyle={styles.scrollViewContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >

                <View style={styles.content}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.titleBlue}>Log-in</Text>
                        <Text style={styles.titleBlack}> your account</Text>
                    </View>

                    <View style={[
                        styles.inputContainer,
                        focusedInput === 'email' && styles.inputContainerFocused
                    ]}>
                        <Ionicons name="mail-outline" size={20} color={focusedInput === 'email' ? '#6666ff' : 'gray'} />
                        <TextInput
                            onChangeText={value => setEmail(value)}
                            style={styles.input}
                            placeholder='Email address'
                            placeholderTextColor={'gray'}
                            keyboardType='email-address'
                            autoCapitalize='none'
                            onFocus={() => setFocusedInput('email')}
                            onBlur={() => setFocusedInput(null)}
                        />
                    </View>

                    <View style={[
                        styles.inputContainer,
                        focusedInput === 'password' && styles.inputContainerFocused
                    ]}>
                        <Ionicons name="lock-closed-outline" size={20} color={focusedInput === 'password' ? '#6666ff' : 'gray'} />
                        <TextInput
                            onChangeText={value => setPassword(value)}
                            style={styles.input}
                            placeholder='Password'
                            secureTextEntry={!showPassword}
                            placeholderTextColor={'gray'}
                            onFocus={() => setFocusedInput('password')}
                            onBlur={() => setFocusedInput(null)}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color={focusedInput === 'password' ? '#6666ff' : 'gray'} />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={handleLogin} style={styles.button}>
                        <Text style={styles.buttonText}>Sign in</Text>
                    </TouchableOpacity>

                    <TouchableOpacity>
                        <Text style={styles.forgotPassword}>Forget the password?</Text>
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            don't have an account?
                        </Text>
                        <TouchableOpacity onPress={() => router.push('signUp')}>
                            <Text style={styles.footerLink}>
                                Sign up
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0ff',
    },
    backButton: {
        marginTop: hp(6),
        marginBottom: hp(2),
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        gap: hp(2.5),
    },
    titleContainer: {
        flexDirection: 'row',
        marginBottom: hp(4),
    },
    titleBlue: {
        fontSize: hp(4),
        fontWeight: 'bold',
        color: '#6666ff',
    },
    titleBlack: {
        fontSize: hp(4),
        fontWeight: 'bold',
        color: '#000',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 10,
        paddingHorizontal: wp(4),
        height: hp(7),
        borderWidth: 1,
        borderColor: 'transparent',
    },
    inputContainerFocused: {
        borderColor: '#6666ff',
        backgroundColor: '#f0f0ff',
    },
    input: {
        flex: 1,
        fontSize: hp(2),
        marginLeft: wp(2),
    },
    button: {
        backgroundColor: '#6666ff',
        borderRadius: 25,
        height: hp(7),
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: hp(2),
    },
    buttonText: {
        color: 'white',
        fontSize: hp(2.2),
        fontWeight: 'bold',
    },
    forgotPassword: {
        color: '#6666ff',
        fontSize: hp(2),
        textAlign: 'center',
        marginTop: hp(2),
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: hp(4),
    },
    footerText: {
        color: 'gray',
        fontSize: hp(2),
    },
    footerLink: {
        color: '#6666ff',
        fontSize: hp(2),
        fontWeight: 'bold',
        marginLeft: wp(1),
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0ff',
    },
    scrollViewContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: wp(6),
        minHeight: height,
    },
});
