import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, ImageBackground, Keyboard, TouchableWithoutFeedback, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Loading from './Loading';
import FilterModal from './FilterModal';
import config from '../config';
import { BlurView } from 'expo-blur';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function Search() {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();
    const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
    const [filters, setFilters] = useState({
        categories: [],
        genre: [],
        timePeriods: [],
        sort: 'popularity.desc'
    });
    const [genres, setGenres] = useState([]);

    const translateY = useSharedValue(SCREEN_HEIGHT);

    useEffect(() => {
        fetchGenres();
    }, []);

    const fetchGenres = async () => {
        try {
            const API_KEY = config().TMDB_API_KEY;
            const response = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=en-US`);
            const data = await response.json();
            setGenres(data.genres);
        } catch (error) {
            console.error('Error fetching genres:', error);
        }
    };

    useEffect(() => {
        if (searchQuery.length > 0) {
            searchMovies();
        } else {
            setSearchResults([]);
        }
    }, [searchQuery]);

    const toggleFilterModal = () => {
        setIsFilterModalVisible(!isFilterModalVisible);
        if (!isFilterModalVisible) {
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
    };

    const applyFilters = (newFilters) => {
        setFilters(newFilters);
        toggleFilterModal();
        searchMovies(newFilters);
    };

    const searchMovies = async (appliedFilters = filters) => {
        setLoading(true);
        try {
            const API_KEY = config().TMDB_API_KEY;
            let url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=en-US&page=1`;

            if (searchQuery) {
                url = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(searchQuery)}&page=1`;
            }

            if (appliedFilters.categories.length > 0) {
                url += `&with_genres=${appliedFilters.categories.join(',')}`;
            }

            if (appliedFilters.timePeriods.length > 0) {
                const [startYear, endYear] = getYearRangeFromPeriod(appliedFilters.timePeriods[0]);
                url += `&primary_release_date.gte=${startYear}-01-01&primary_release_date.lte=${endYear}-12-31`;
            }

            url += `&sort_by=${appliedFilters.sort}`;

            const response = await fetch(url);
            const data = await response.json();
            setSearchResults(data.results);
        } catch (error) {
            console.error('Error searching movies:', error);
        } finally {
            setLoading(false);
        }
    };

    // ฟังก์ชันช่วยในการแปลงช่วงเวลาเป็นปี
    const getYearRangeFromPeriod = (period) => {
        switch (period) {
            case '2020s': return [2020, 2029];
            case '2010s': return [2010, 2019];
            case '2000s': return [2000, 2009];
            case '1990s': return [1990, 1999];
            default: return [1900, 2029];
        }
    };

    const renderMovieItem = ({ item }) => (
        <TouchableOpacity
            style={styles.movieItem}
            onPress={() => navigation.navigate('DetailsAndPlay', { movie: item })}
        >
            <ImageBackground
                source={{ uri: `https://image.tmdb.org/t/p/w500${item.poster_path}` }}
                style={styles.moviePoster}
                imageStyle={styles.moviePosterImage}
            >
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.9)']}
                    style={styles.gradientOverlay}
                >
                    <View style={styles.movieInfo}>
                        <Text style={styles.movieTitle} numberOfLines={2}>
                            {item.title}
                        </Text>
                        <View style={styles.ratingContainer}>
                            <Text style={styles.imdbText}>IMDb</Text>
                            <Text style={styles.movieRating}>{item.vote_average.toFixed(1)}</Text>
                        </View>
                    </View>
                </LinearGradient>
            </ImageBackground>
        </TouchableOpacity>
    );

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
        };
    });

    return (
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <View style={styles.container}>
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <Loading size={200} />
                        </View>
                    ) : searchResults.length > 0 ? (
                        <FlatList
                            data={searchResults}
                            renderItem={renderMovieItem}
                            keyExtractor={(item) => item.id.toString()}
                            numColumns={2}
                            contentContainerStyle={styles.movieList}
                        />
                    ) : searchQuery.length > 2 ? (
                        <View style={styles.noResultsContainer}>
                            <Text style={styles.noResultsText}>No results found</Text>
                        </View>
                    ) : null}
                    <BlurView intensity={80} tint="light" style={styles.headerBlur}>
                        <View style={styles.header}>
                            <View style={styles.searchAndFilterContainer}>
                                <View style={[
                                    styles.searchContainer,
                                    isSearchFocused && styles.searchContainerFocused
                                ]}>
                                    <Ionicons name="search" size={20} color="#6666ff" style={styles.searchIcon} />
                                    <TextInput
                                        style={styles.searchInput}
                                        placeholder="What are you looking for?"
                                        placeholderTextColor="gray"
                                        value={searchQuery}
                                        onChangeText={setSearchQuery}
                                        onFocus={() => setIsSearchFocused(true)}
                                        onBlur={() => setIsSearchFocused(false)}
                                    />
                                </View>
                                <TouchableOpacity
                                    onPress={toggleFilterModal}
                                    style={[
                                        styles.filterButton,
                                        isFilterModalVisible && styles.filterButtonActive
                                    ]}
                                >
                                    <Ionicons name="options-outline" size={24} color="#6666ff" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </BlurView>
                    <Animated.View style={[styles.filterModalContainer, animatedStyle]}>
                        <FilterModal
                            isVisible={isFilterModalVisible}
                            onClose={toggleFilterModal}
                            onApply={applyFilters}
                            currentFilters={filters}
                            genres={genres}
                        />
                    </Animated.View>
                </View>
            </GestureHandlerRootView>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        paddingTop: 50
    },
    contentContainer: {
        flex: 1,
        paddingTop: 10,
    },
    headerBlur: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 10,
    },
    searchAndFilterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0ff',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
        flex: 1,
        marginRight: 10,
        borderWidth: 1,
        borderColor: 'transparent',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    searchContainerFocused: {
        borderColor: '#6666ff',
    },
    searchIcon: {
        marginRight: 10,

    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#000',
    },
    filterButton: {
        padding: 10,
        backgroundColor: '#f0f0ff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'transparent',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    filterButtonActive: {
        borderColor: '#6666ff',
    },
    movieList: {
        paddingTop: 60,
        paddingHorizontal: 10,
    },
    movieItem: {
        width: '47%',
        marginHorizontal: '1.5%',
        marginBottom: 20,
        borderRadius: 15,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    moviePoster: {
        width: '100%',
        height: 250,
        justifyContent: 'flex-end',
    },
    moviePosterImage: {
        borderRadius: 15,
    },
    gradientOverlay: {
        height: '50%',
        justifyContent: 'flex-end',
        padding: 15,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
    },
    movieInfo: {
        justifyContent: 'flex-end',
    },
    movieTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 5
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    imdbText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#f3ce13',
        marginRight: 5,
    },
    movieRating: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    noResultsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noResultsText: {
        color: '#6666ff',
        fontSize: 18,
        text: 'No results found',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterModalContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: SCREEN_HEIGHT * 0.8,
    },
});