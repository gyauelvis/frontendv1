import { useRouter } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
const { width, height } = Dimensions.get('window');

const OnboardingScreen = () => {

    const router = useRouter();

    const handleSignUp = () => {
        console.log('Sign Up pressed');
        router.push('/auth/signup');
    };

    const handleLogin = () => {
        console.log('Login pressed');
        router.push('/auth/login');
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Geometric background pattern */}
            <View style={styles.geometricPattern} />

            <View style={styles.content}>
                {/* Logo/Brand Section */}
                <View style={styles.headerSection}>
                    <View style={styles.logoContainer}>
                        <View style={styles.logoCircle}>
                            <Text style={styles.logoText}>eV</Text>
                        </View>
                        <Text style={styles.brandName}>eVault</Text>
                    </View>
                </View>

                {/* Illustration Section */}
                <View style={styles.illustrationSection}>
                    <View style={styles.illustrationContainer}>
                        {/* Modern geometric illustration */}
                        <View style={styles.cardStack}>
                            <View style={[styles.card, styles.card1]}>
                                <Text style={styles.cardText}>$</Text>
                            </View>
                            <View style={[styles.card, styles.card2]}>
                                <Text style={styles.cardText}>€</Text>
                            </View>
                            <View style={[styles.card, styles.card3]}>
                                <Text style={styles.cardText}>¥</Text>
                            </View>
                        </View>

                        {/* Security badge */}
                        <View style={styles.securityBadge}>
                            <View style={styles.shieldIcon}>
                                <Text style={styles.shieldText}>🔒</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Content Section */}
                <View style={styles.contentSection}>
                    <Text style={styles.title}>Secure, Fast, Global</Text>
                    <Text style={styles.subtitle}>
                        Experience seamless money transfers with advanced security and real-time analytics.
                    </Text>

                    {/* Feature highlights */}
                    <View style={styles.featuresContainer}>
                        <View style={styles.feature}>
                            <View style={styles.featureIcon}>
                                <Text style={styles.featureSymbol}>⚡</Text>
                            </View>
                            <Text style={styles.featureText}>Instant Transfers</Text>
                        </View>

                        <View style={styles.feature}>
                            <View style={styles.featureIcon}>
                                <Text style={styles.featureSymbol}>🔐</Text>
                            </View>
                            <Text style={styles.featureText}>Bank-level Security</Text>
                        </View>

                        <View style={styles.feature}>
                            <View style={styles.featureIcon}>
                                <Text style={styles.featureSymbol}>📊</Text>
                            </View>
                            <Text style={styles.featureText}>Smart Analytics</Text>
                        </View>
                    </View>
                </View>

                {/* Button Section */}
                <View style={styles.buttonSection}>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={handleSignUp}
                        activeOpacity={0.9}
                    >
                        <Text style={styles.primaryButtonText}>Get Started</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={handleLogin}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.secondaryButtonText}>I already have an account</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
    },
    geometricPattern: {
        position: 'absolute',
        top: -height * 0.15,
        right: -width * 0.2,
        width: width * 0.8,
        height: height * 0.8,
        borderRadius: 200,
        backgroundColor: '#F8F9FA',
        transform: [{ rotate: '45deg' }],
        opacity: 0.8,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        zIndex: 10,
    },
    headerSection: {
        paddingTop: 20,
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    logoCircle: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#D4A574',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 8,
    },
    logoText: {
        fontSize: 26,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -0.5,
    },
    brandName: {
        fontSize: 32,
        fontWeight: '800',
        color: '#343A40',
        marginTop: 16,
        letterSpacing: -0.8,
    },
    illustrationSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    illustrationContainer: {
        position: 'relative',
        width: 220,
        height: 220,
    },
    cardStack: {
        position: 'relative',
        width: '100%',
        height: '100%',
    },
    card: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        width: 140,
        height: 85,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    cardText: {
        fontSize: 28,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.9)',
    },
    card1: {
        backgroundColor: '#D4A574',
        top: 20,
        left: 40,
        transform: [{ rotate: '-5deg' }],
        zIndex: 30,
    },
    card2: {
        backgroundColor: '#B08E6B',
        top: 60,
        left: 20,
        transform: [{ rotate: '5deg' }],
        zIndex: 20,
    },
    card3: {
        backgroundColor: '#8E7054',
        top: 100,
        left: 60,
        transform: [{ rotate: '-2deg' }],
        zIndex: 10,
    },
    securityBadge: {
        position: 'absolute',
        top: -10,
        right: 0,
        backgroundColor: '#FFFFFF',
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 6,
        zIndex: 40,
        borderWidth: 1,
        borderColor: '#F8F9FA',
    },
    shieldIcon: {
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    shieldText: {
        fontSize: 22,
    },
    contentSection: {
        alignItems: 'center',
        paddingBottom: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#343A40',
        textAlign: 'center',
        marginBottom: 16,
        letterSpacing: -0.8,
        lineHeight: 36,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '400',
        color: '#6C757D',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 36,
        paddingHorizontal: 24,
    },
    featuresContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 20,
    },
    feature: {
        alignItems: 'center',
        flex: 1,
    },
    featureIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F1F3F5',
    },
    featureSymbol: {
        fontSize: 24,
    },
    featureText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6C757D',
        textAlign: 'center',
    },
    buttonSection: {
        paddingBottom: 30,
        gap: 18,
    },
    primaryButton: {
        backgroundColor: '#D4A574',
        height: 58,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#D4A574',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 14,
        elevation: 8,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        height: 58,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#E9ECEF',
    },
    secondaryButtonText: {
        color: '#6C757D',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.2,
    },
});

export default OnboardingScreen;