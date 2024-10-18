import React from 'react';
import { View, StyleSheet } from 'react-native';
import Loading from '../components/Loading';

export default function Index() {
    return (
        <View style={styles.container}>
            <Loading size={200} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
