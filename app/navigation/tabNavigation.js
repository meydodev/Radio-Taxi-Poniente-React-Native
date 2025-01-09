import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AppInfoScreen from '../screens/AppInfoScreen';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Tab = createBottomTabNavigator();

export default function TabsNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    // Asignar diferentes iconos para cada pantalla
                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline'; // Iconos para la pestaña Inicio
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'account' : 'account-outline'; // Iconos para la pestaña Perfil
                    }
                    else if (route.name === 'Info') {
                        iconName = focused ? 'information' : 'information-outline';
                        
                    }
                    return <Icon name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#fff',
                tabBarActiveBackgroundColor: '#1e90ff', // Fondo para la pestaña activa
                tabBarInactiveTintColor: '#fff',
                tabBarStyle: {
                    backgroundColor: '#1e90ff', // Fondo de la barra inferior
                },
            })}
        >
            {/* Pantalla Inicio */}
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    headerTitle: 'Radio Taxi Poniente',
                    headerStyle: {
                        backgroundColor: '#1e90ff',
                    },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                        textAlign: 'center',
                    },
                    tabBarLabel: 'Inicio',
                }}
            />

            {/* Pantalla Perfil */}
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    headerTitle: 'Mi Perfil',
                    headerStyle: {
                        backgroundColor: '#1e90ff',
                    },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                        textAlign: 'center',
                    },
                    tabBarLabel: 'Perfil',
                }}
            />
            <Tab.Screen
                name="Info"
                component={AppInfoScreen}
                options={{
                    headerTitle: 'Información de la App',
                    headerStyle: { backgroundColor: '#1e90ff' },
                    headerTintColor: '#fff',
                }}
            />
        </Tab.Navigator>
    );
}
