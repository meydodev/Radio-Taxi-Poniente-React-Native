import React from 'react';
import { View, Text, ImageBackground, StyleSheet } from 'react-native';

export default function ProfileScreen() {
    return (
        <ImageBackground
            source={require('../../assets/img/background-home.webp')}
            style={styles.container}
            resizeMode="cover"
        >
            <View style={styles.content}>
                <Text style={styles.text}>Profile Screen</Text>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, // Ocupa toda la pantalla
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff', // Ajusta el color según tu diseño
    },
});
