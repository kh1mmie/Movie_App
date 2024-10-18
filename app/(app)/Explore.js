import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ImageBackground, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Loading from '../../components/Loading';
import config from '../../config';
import { BlurView } from 'expo-blur';
import { useAuth } from '../../context/authContext';

export default function Explore() {
    const [upcomingMovies, setUpcomingMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigation = useNavigation();
    const { user } = useAuth();

    const fetchMovieDetails = async (movieId) => {
        try {
            const API_KEY = config().TMDB_API_KEY;
            const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}&language=en-US`);
            if (!response.ok) {
                throw new Error(`Server response was not ok: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            return {
                runtime: data.runtime,
                genres: data.genres
            };
        } catch (error) {
            console.error('Error fetching movie details:', error.message);
            return null;
        }
    };

    useEffect(() => {
        const fetchMoviesWithDetails = async () => {
            setIsLoading(true);
            try {
                const API_KEY = config().TMDB_API_KEY;
                const response = await fetch(`https://api.themoviedb.org/3/movie/upcoming?api_key=${API_KEY}&language=en-US`);
                const data = await response.json();
                if (data.results && Array.isArray(data.results)) {
                    const moviesWithDetails = await Promise.all(data.results.map(async (movie) => {
                        const details = await fetchMovieDetails(movie.id);
                        return { ...movie, ...details };
                    }));
                    const sortedMovies = moviesWithDetails.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
                    setUpcomingMovies(sortedMovies.slice(0, 10));
                }
            } catch (error) {
                console.error('Error fetching movies:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMoviesWithDetails();
    }, []);

    const handleSearchPress = () => {
        navigation.navigate('Search');
    };

    const handleMoviePress = (movie) => {
        navigation.navigate('DetailsAndPlay', { movie });
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#ffffff',
            marginBottom: 60,
        },
        contentContainer: {
            paddingTop: 110,
            paddingVertical: 20,
            paddingHorizontal: 10,

        },
        movieCardContainer: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginBottom: 20,
        },
        dateContainer: {
            width: 50,
            alignItems: 'center',
            marginRight: 10,
        },
        dateMonth: {
            fontSize: 16,
            fontWeight: 'bold',
            color: '#6666ff',
        },
        dateDay: {
            fontSize: 24,
            fontWeight: 'bold',
            color: '#333',
        },
        movieCard: {
            flex: 1,
            borderRadius: 15,
            overflow: 'hidden',
            backgroundColor: '#f8f8f8',
            elevation: 5,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
        },
        movieImage: {
            width: '100%',
            height: 200,
        },
        movieDetails: {
            padding: 15,
        },
        movieTitle: {
            fontSize: 24,
            fontWeight: 'bold',
            color: '#333',
            marginBottom: 5,
        },
        movieInfo: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 10,
        },
        movieInfoText: {
            fontSize: 14,
            color: '#666',
            marginRight: 10,
        },
        movieOverview: {
            fontSize: 14,
            color: '#666',
            marginBottom: 10,
        },
        releaseDateContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 5,
        },
        upcomingReleaseDate: {
            fontWeight: 'bold',
            fontSize: 14,
            color: '#666',
            marginLeft: 5,
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
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingTop: 50,
            paddingBottom: 10,
        },
        userInfo: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        profilePicture: {
            width: 40,
            height: 40,
            borderRadius: 20,
            marginRight: 10,
        },
        defaultProfilePicture: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#6666ff',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 10,
        },
        defaultProfilePictureText: {
            color: '#fff',
            fontSize: 18,
            fontWeight: 'bold',
        },
        username: {
            fontSize: 24,
            fontWeight: 'bold',
            color: '#6666ff',
        },
        searchButton: {
            padding: 10,
        },
        imdbRating: {
            backgroundColor: '#f5c518',
            paddingHorizontal: 5,
            paddingVertical: 2,
            borderRadius: 4,
            marginRight: 10,
        },
        imdbRatingText: {
            color: '#000000',
            fontWeight: 'bold',
            fontSize: 14,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
    });

    return (
        <View style={styles.container}>
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <Loading size={200} />
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.contentContainer}>
                    {upcomingMovies.map((movie, index) => {
                        const releaseDate = new Date(movie.release_date);
                        const month = releaseDate.toLocaleString('en-US', { month: 'short' });
                        const day = releaseDate.getDate();

                        return (
                            <TouchableOpacity
                                key={index}
                                style={styles.movieCardContainer}
                                onPress={() => handleMoviePress(movie)}
                            >
                                <View style={styles.dateContainer}>
                                    <Text style={styles.dateMonth}>{month}</Text>
                                    <Text style={styles.dateDay}>{day}</Text>
                                </View>
                                <View style={styles.movieCard}>
                                    <ImageBackground
                                        source={{ uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}` }}
                                        style={styles.movieImage}
                                    />
                                    <View style={styles.movieDetails}>
                                        <Text style={styles.movieTitle}>{movie.title}</Text>
                                        <View style={styles.movieInfo}>
                                            <Text style={styles.movieInfoText}>{new Date(movie.release_date).getFullYear()}</Text>
                                            <View style={styles.imdbRating}>
                                                <Text style={styles.imdbRatingText}>IMDb {movie.vote_average.toFixed(1)}</Text>
                                            </View>
                                            <Text style={styles.movieInfoText}>{movie.adult ? '18+' : 'PG'}</Text>
                                            <Text style={styles.movieInfoText}>
                                                {movie.runtime ? `${Math.floor(movie.runtime / 60)} h ${movie.runtime % 60} min` : 'N/A'}
                                            </Text>
                                        </View>
                                        <Text style={styles.movieOverview} numberOfLines={3}>
                                            {movie.overview}
                                        </Text>
                                        <View style={styles.releaseDateContainer}>
                                            <Ionicons name="pricetag-outline" size={16} color="#666" />
                                            <Text style={styles.upcomingReleaseDate}>
                                                {movie.genres && movie.genres.length > 0 ? movie.genres[0].name : 'Uncategorized'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            )}
            <BlurView intensity={80} tint="light" style={styles.headerBlur}>
                <View style={styles.header}>
                    <View style={styles.userInfo}>
                        {user?.profilePicture ? (
                            <Image
                                source={{ uri: user.profilePicture }}
                                style={styles.profilePicture}
                            />
                        ) : (
                            <View style={styles.defaultProfilePicture}>
                                <Text style={styles.defaultProfilePictureText}>
                                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                                </Text>
                            </View>
                        )}
                        <Text style={styles.username}>Coming soon</Text>
                    </View>
                    <TouchableOpacity onPress={handleSearchPress} style={styles.searchButton}>
                        <Ionicons name="search" size={24} color="#6666ff" />
                    </TouchableOpacity>
                </View>
            </BlurView>
        </View>
    );
}
