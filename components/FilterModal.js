import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, SafeAreaView, Dimensions, ScrollView } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withTiming, runOnJS, Easing } from 'react-native-reanimated';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const FilterModal = ({ isVisible, onClose, onApply, currentFilters, genres }) => {
    const [localFilters, setLocalFilters] = useState(currentFilters);
    const translateY = useSharedValue(SCREEN_HEIGHT);

    useEffect(() => {
        if (isVisible) {
            translateY.value = withTiming(0, {
                duration: 300,
                easing: Easing.out(Easing.cubic)
            });
        } else {
            translateY.value = withTiming(SCREEN_HEIGHT, {
                duration: 300,
                easing: Easing.in(Easing.cubic)
            });
        }
    }, [isVisible]);

    const gestureHandler = useAnimatedGestureHandler({
        onStart: (_, ctx) => {
            ctx.startY = translateY.value;
        },
        onActive: (event, ctx) => {
            translateY.value = Math.max(0, ctx.startY + event.translationY);
        },
        onEnd: (event) => {
            if (event.velocityY > 500 || event.translationY > SCREEN_HEIGHT * 0.2) {
                translateY.value = withTiming(SCREEN_HEIGHT, {
                    duration: 300,
                    easing: Easing.in(Easing.cubic)
                });
                runOnJS(onClose)();
            } else {
                translateY.value = withTiming(0, {
                    duration: 300,
                    easing: Easing.out(Easing.cubic)
                });
            }
        },
    });

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
        };
    });

    const handleApply = () => {
        onApply(localFilters);
        onClose();
    };

    const updateFilter = (filterType, value) => {
        setLocalFilters(prev => {
            const currentFilters = prev[filterType] || [];
            let updatedFilters;

            if (filterType === 'sort') {
                updatedFilters = [value];
            } else {
                updatedFilters = currentFilters.includes(value)
                    ? currentFilters.filter(item => item !== value)
                    : [...currentFilters, value];
            }

            return {
                ...prev,
                [filterType]: updatedFilters
            };
        });
    };

    const renderFilterOptions = (options, filterType) => {
        return options.map(option => {
            const value = option.value || option;
            const label = option.label || option;
            const isSelected = localFilters[filterType] && localFilters[filterType].includes(value);

            return (
                <TouchableOpacity
                    key={value}
                    style={[
                        styles.filterOption,
                        isSelected && styles.selectedOption
                    ]}
                    onPress={() => updateFilter(filterType, value)}
                >
                    <Text style={[
                        styles.filterOptionText,
                        isSelected && styles.selectedOptionText
                    ]}>
                        {label}
                    </Text>
                </TouchableOpacity>
            );
        });
    };

    return (
        <Modal
            visible={isVisible}
            transparent={true}
            onRequestClose={onClose}
            animationType="none"
        >
            <View style={styles.modalOverlay}>
                <PanGestureHandler onGestureEvent={gestureHandler}>
                    <Animated.View style={[styles.modalContainer, animatedStyle]}>
                        <ScrollView style={styles.modalContent}>
                            <View style={styles.dragIndicator} />
                            <SafeAreaView>
                                <Text style={styles.title}>Filters and Sorting</Text>
                                <View style={styles.contentContainer}>
                                    <Text style={styles.sectionTitle}>Categories</Text>
                                    <View style={styles.categoriesContainer}>
                                        {renderFilterOptions(genres.map(genre => ({
                                            value: genre.id.toString(),
                                            label: genre.name
                                        })), 'categories')}
                                    </View>

                                    <Text style={styles.sectionTitle}>Time Periods</Text>
                                    <View style={styles.optionsContainer}>
                                        {renderFilterOptions(['2020s', '2010s', '2000s', '1990s'], 'timePeriods')}
                                    </View>

                                    <Text style={styles.sectionTitle}>Sort By</Text>
                                    <View style={styles.optionsContainer}>
                                        {renderFilterOptions([
                                            { label: 'Popularity', value: 'popularity.desc' },
                                            { label: 'Rating', value: 'vote_average.desc' },
                                        ], 'sort')}
                                    </View>
                                </View>
                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity style={styles.resetButton} onPress={() => setLocalFilters(currentFilters)}>
                                        <Text style={styles.resetButtonText}>Reset</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                                        <Text style={styles.applyButtonText}>Apply</Text>
                                    </TouchableOpacity>
                                </View>
                            </SafeAreaView>
                        </ScrollView>
                    </Animated.View>
                </PanGestureHandler>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: SCREEN_HEIGHT * 0.8,
    },
    modalContent: {
        padding: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
        color: '#6666ff',
        text: 'Filters and Sorting',
    },
    scrollView: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 10,
        color: '#6666ff',
    },
    optionsRow: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    filterOption: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginRight: 10,
        marginBottom: 10,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#6666ff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,


    },
    selectedOption: {
        backgroundColor: '#6666ff',
        borderColor: '#6666ff',

    },
    filterOptionText: {
        color: '#6666ff',
    },
    selectedOptionText: {
        color: '#FFFFFF',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    resetButton: {
        flex: 1,
        padding: 15,
        borderRadius: 10,
        backgroundColor: '#ffffff',
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#6666ff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    resetButtonText: {
        color: '#6666ff',
        textAlign: 'center',
        fontWeight: 'bold',
        text: 'Reset',
    },
    applyButton: {
        flex: 1,
        padding: 15,
        borderRadius: 10,
        backgroundColor: '#6666ff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    applyButtonText: {
        color: '#FFFFFF',
        textAlign: 'center',
        fontWeight: 'bold',
        text: 'Apply',
    },
    categoriesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 10,
        justifyContent: 'center',
    },
    optionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 10,
        justifyContent: 'center'
    },
    contentContainer: {
        marginBottom: 10,
    },
    // dragIndicator: {
    //     width: 40,
    //     height: 5,
    //     backgroundColor: '#ccc',
    //     borderRadius: 3,
    //     alignSelf: 'center',
    //     marginBottom: 10,
    // },
});

export default FilterModal;