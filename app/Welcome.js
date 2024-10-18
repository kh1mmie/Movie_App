import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, FlatList, Dimensions, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const carouselData = [
    {
        id: '1',
        title: 'Welcome to\nWhatwatch?',
        subtitle: 'The best movie streaming app of the century for your amazing day!'
    },
    {
        id: '2',
        title: 'Discover Movies\nYou Love',
        subtitle: 'Choose from a wide variety of curated movies just for you'
    },
    {
        id: '3',
        title: 'Share with Friends\nAnytime, Anywhere',
        subtitle: 'Easily share your viewing experience with your friends'
    }
];

export default function Welcome() {
    const router = useRouter();
    const [activeIndex, setActiveIndex] = useState(0);
    const fadeAnim = useRef(new Animated.Value(1)).current;

    const renderItem = ({ item }) => (
        <View style={styles.slide}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
        </View>
    );

    const handleScroll = (event) => {
        const slideSize = event.nativeEvent.layoutMeasurement.width;
        const index = event.nativeEvent.contentOffset.x / slideSize;
        setActiveIndex(Math.round(index));
    };

    const navigateToSignIn = () => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
        }).start(() => {
            router.push('signIn');
        });
    };

    return (
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
            <LinearGradient
                colors={['#b3b3ff', '#9999ff']}
                style={styles.background}
            >
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.container}>
                        <FlatList
                            data={carouselData}
                            renderItem={renderItem}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onScroll={handleScroll}
                            keyExtractor={(item) => item.id}
                        />
                        <View style={styles.bottomContainer}>
                            <View style={styles.dotContainer}>
                                {carouselData.map((_, index) => (
                                    <View
                                        key={index}
                                        style={[
                                            styles.dot,
                                            index === activeIndex ? styles.activeDot : null
                                        ]}
                                    />
                                ))}
                            </View>

                            <TouchableOpacity onPress={navigateToSignIn} style={styles.button}>
                                <Text style={styles.buttonText}>Get Started</Text>
                            </TouchableOpacity>

                        </View>
                    </View>
                </SafeAreaView>
            </LinearGradient>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
        justifyContent: 'space-between',
    },
    slide: {
        width: width,
        paddingHorizontal: 20,
        paddingTop: 480,
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.8,
    },
    bottomContainer: {
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    dotContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#fff',
        marginHorizontal: 4,
        opacity: 0.5,
    },
    activeDot: {
        opacity: 1,
        width: 20,
    },
    button: {
        backgroundColor: '#6666ff',
        paddingVertical: 15,
        borderRadius: 30,
        alignItems: 'center',
        width: '100%',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
