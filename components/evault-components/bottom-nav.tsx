import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface NavigationItem {
    id: string;
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    isActive: boolean;
}

interface BottomNavigationProps {
    navigation: NavigationItem[];
    onNavigationPress: (id: string) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ navigation, onNavigationPress }) => {
    const router = useRouter();
    return (
        <View style={styles.bottomNavigationContainer}>
            <LinearGradient
                colors={['#FFFFFF', '#F8F9FA']}
                style={styles.bottomNavigation}
            >
                {navigation.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={[styles.navItem, item.isActive && styles.activeNavItem]}
                        onPress={() => onNavigationPress(item.id)}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.navIconContainer, item.isActive && styles.activeNavIconContainer]}>
                            <Ionicons
                                name={item.isActive ? (item.icon.replace('-outline', '') as keyof typeof Ionicons.glyphMap) : item.icon}
                                size={24}
                                color={item.isActive ? '#FFFFFF' : '#6C757D'}
                            />
                        </View>
                        <Text style={[
                            styles.navLabel,
                            item.isActive && styles.activeNavLabel
                        ]}>
                            {item.title}
                        </Text>
                    </TouchableOpacity>
                ))}
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    bottomNavigationContainer: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 12,
    },
    bottomNavigation: {
        flexDirection: 'row',
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 32 : 20,
        paddingHorizontal: 16,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    navItem: {
        flex: 1,
        alignItems: 'center',
        gap: 6,
        paddingVertical: 8,
    },
    activeNavItem: {
        transform: [{ scale: 1.05 }],
    },
    navIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    activeNavIconContainer: {
        backgroundColor: '#D4A574',
        shadowColor: '#D4A574',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    navLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6C757D',
    },
    activeNavLabel: {
        color: '#343A40',
        fontWeight: '700',
    },
});

export default BottomNavigation;
export type { NavigationItem };
