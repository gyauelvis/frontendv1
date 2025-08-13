import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
} from 'react-native';

interface ButtonProps {
    title: string;
    onPress: (title: string) => void;
    variant: 'primary' | 'secondary';
    style?: any;
    icon?: keyof typeof Ionicons.glyphMap;
}

const CustomButton: React.FC<ButtonProps> = ({ title, onPress, variant, style, icon }) => {
    const [scaleValue] = useState(new Animated.Value(1));

    const handlePressIn = () => {
        Animated.spring(scaleValue, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleValue, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    const buttonStyle = variant === 'primary' ? styles.primaryButton : styles.secondaryButton;
    const textStyle = variant === 'primary' ? styles.primaryButtonText : styles.secondaryButtonText;

    return (
        <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
            <TouchableOpacity
                style={[buttonStyle, style]}
                onPress={()=>onPress(title)}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.9}
            >
                {icon && (
                    <Ionicons
                        name={icon}
                        size={18}
                        color={variant === 'primary' ? '#FFFFFF' : '#343A40'}
                        style={styles.buttonIcon}
                    />
                )}
                <Text style={textStyle}>{title}</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    buttonIcon: {
        marginRight: 4,
    },
    primaryButton: {
        backgroundColor: '#D4A574',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        flexDirection: 'row',
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    secondaryButton: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#E9ECEF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    secondaryButtonText: {
        color: '#343A40',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default CustomButton;