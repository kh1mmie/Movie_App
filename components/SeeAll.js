import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Loading from './Loading';
import { Ionicons } from '@expo/vector-icons';
import config from '../config';
import { BlurView } from 'expo-blur';

export default function SeeAll({ route }) {
    const { category, genreId } = route.params;
    const [movies, setMovies] = useState([]);
    const [selectedGenre, setSelectedGenre] = useState(genreId);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const navigation = useNavigation();
    const genreScrollViewRef = React.useRef(null);
    const [containerWidth, setContainerWidth] = useState(0);

    useEffect(() => {
        fetchMovies();
    }, [category, selectedGenre, page]);

    const fetchMovies = async () => {
        setLoading(true);
        try {
            const API_KEY = config().TMDB_API_KEY;
            let url;

            switch (category) {
                case 'recommended':
                    url = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&page=${page}`;
                    break;
                case 'upcoming':
                    url = `https://api.themoviedb.org/3/movie/upcoming?api_key=${API_KEY}&language=en-US&page=${page}`;
                    break;
                case 'genres':
                    url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=en-US&with_genres=${selectedGenre}&page=${page}`;
                    break;
                default:
                    url = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&page=${page}`;
            }

            const response = await fetch(url);
            const data = await response.json();

            if (page === 1) {
                setMovies(data.results);
            } else {
                setMovies(prevMovies => [...prevMovies, ...data.results]);
            }

            setHasMore(data.page < data.total_pages);
        } catch (error) {
            console.error('Error fetching movies:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMoreMovies = () => {
        if (hasMore && !loading) {
            setPage(prevPage => prevPage + 1);
        }
    };

    const genres = [
        { id: 28, name: 'Action' },
        { id: 12, name: 'Adventure' },
        { id: 35, name: 'Comedy' },
        { id: 10749, name: 'Romance' },
        { id: 878, name: 'Sci-Fi' },
        { id: 53, name: 'Thriller' },
        { id: 36, name: 'History' },
        { id: 9648, name: 'Mystery' },
        { id: 16, name: 'Animation' }
    ];

    const handleGenrePress = (genreId) => {
        setSelectedGenre(genreId);
        setPage(1);
        setMovies([]);
        const index = genres.findIndex(genre => genre.id === genreId);
        if (index !== -1 && genreScrollViewRef.current) {
            const itemWidth = 110;
            const offset = index * itemWidth;
            const centerOffset = containerWidth / 2 - itemWidth / 2;
            genreScrollViewRef.current.scrollTo({
                x: offset - centerOffset,
                animated: true
            });
        }
    };

    const MovieItem = ({ movie }) => (
        <TouchableOpacity onPress={() => navigation.navigate('DetailsAndPlay', { movie })} style={styles.movieItem}>
            <ImageBackground
                source={{ uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}` }}
                style={styles.moviePoster}
                imageStyle={styles.moviePosterImage}
            >
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.9)']}
                    style={styles.gradientOverlay}
                >
                    <View style={styles.movieInfo}>
                        <Text style={styles.movieTitle} numberOfLines={2}>{movie.title}</Text>
                        <View style={styles.ratingContainer}>
                            <Text style={styles.imdbText}>IMDb</Text>
                            <Text style={styles.movieRating}>{movie.vote_average.toFixed(1)}</Text>
                        </View>
                    </View>
                </LinearGradient>
            </ImageBackground>
        </TouchableOpacity>
    );

    const handleSearchPress = () => {
        navigation.navigate('Search');
    };

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right']}>
            <BlurView intensity={80} tint="light" style={styles.headerBlur}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.title}>
                        {category === 'recommended' ? 'Recommended' : category === 'upcoming' ? 'Upcoming Movies' : 'Popular Categories'}
                    </Text>
                    <TouchableOpacity onPress={handleSearchPress} style={styles.searchButton}>
                        <Ionicons name="search" size={24} color="#000" />
                    </TouchableOpacity>
                </View>
            </BlurView>

            {category === 'genres' && (
                <View
                    style={styles.genreScrollViewContainer}
                    onLayout={(event) => {
                        const { width } = event.nativeEvent.layout;
                        setContainerWidth(width);
                    }}
                >
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        ref={genreScrollViewRef}
                        contentContainerStyle={styles.genreScrollViewContent}
                    >
                        {genres.map((genre) => (
                            <TouchableOpacity
                                key={genre.id}
                                style={[styles.genreButton, selectedGenre === genre.id && styles.selectedGenreButton]}
                                onPress={() => handleGenrePress(genre.id)}
                            >
                                <Text style={[styles.genreButtonText, selectedGenre === genre.id && styles.selectedGenreButtonText]}>
                                    {genre.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {loading && movies.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <Loading size={100} />
                </View>
            ) : (
                <FlatList
                    data={movies}
                    renderItem={({ item }) => <MovieItem movie={item} />}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    contentContainerStyle={styles.listContainer}
                    onEndReached={loadMoreMovies}
                    onEndReachedThreshold={0.1}
                    ListFooterComponent={() =>
                        loading && (
                            <View style={styles.footerLoadingContainer}>
                                <Loading size={100} />
                            </View>
                        )
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0ff',
        paddingTop: 90,
    },
    headerBlur: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingTop: 40,
        paddingBottom: 10,
    },
    backButton: {
        padding: 5,
    },
    title: {
        flex: 1,
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
    },
    searchButton: {
        padding: 5,
    },
    listContainer: {
        paddingHorizontal: 10,
    },
    movieItem: {
        width: '47%',
        marginHorizontal: '1.5%',
        marginBottom: 15,
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
    genreScrollViewContainer: {
        marginBottom: 20,
    },
    genreScrollViewContent: {
        paddingHorizontal: 10,
    },
    genreButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 25,
        marginHorizontal: 5,
        minWidth: 100,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0
    },
    selectedGenreButton: {
        backgroundColor: '#6666ff',
    },
    genreButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    selectedGenreButtonText: {
        fontWeight: 'bold',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerLoadingContainer: {
        paddingVertical: 20,
        alignItems: 'center',
    },
});
