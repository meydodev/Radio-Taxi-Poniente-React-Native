import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity,ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen  () {
    
    const navigation = useNavigation();

    return (
        <ImageBackground source={require('../../assets/img/background-home.webp')} style={styles.container} 
        resizeMode='cover'>
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('Channel1')}
            >
                <Text style={styles.buttonText}>Canal 1</Text>
            </TouchableOpacity>
        </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    button: {
        backgroundColor: '#1e90ff',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 50,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

