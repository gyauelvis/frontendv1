import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  Alert,
  Image,
  Linking,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

const QRCodeScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams();

  const paystackUrl = params.paystackUrl as string;
  const amount = params.amount as string;
  const description = params.description as string;

  // Generate QR code URL using a web service
  const qrCodeUrl = paystackUrl 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(paystackUrl)}`
    : `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`Payment Request: $${amount} - ${description || 'No description'}`)}`;

  const handleSharePayment = async () => {
    try {
      await Share.share({
        message: `Hi! I'm requesting payment of $${amount} for services. Pay here: ${paystackUrl}`,
        title: 'Payment Request'
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share payment request');
    }
  };

  const handleCopyLink = () => {
    Alert.alert('Link Copied', `Payment link copied: ${paystackUrl}`);
  };

  const handleOpenPaystackCheckout = async () => {
    if (paystackUrl) {
      try {
        const supported = await Linking.canOpenURL(paystackUrl);
        if (supported) {
          await Linking.openURL(paystackUrl);
        } else {
          Alert.alert('Error', 'Cannot open payment link');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to open payment page');
      }
    } else {
      Alert.alert('Error', 'Payment URL not available');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment QR Code</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* QR Code Display */}
        <View style={styles.qrSection}>
          <Text style={styles.sectionTitle}>Scan to Pay</Text>
          
          <View style={styles.qrContainer}>
            <View style={styles.qrCode}>
              <Image
                source={{ uri: qrCodeUrl }}
                style={styles.qrCodeImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.qrNote}>
              Scan with any QR code reader
            </Text>
            {!paystackUrl && (
              <Text style={styles.warningText}>
                ⚠️ Demo QR Code (Paystack URL not available)
              </Text>
            )}
          </View>
        </View>

        {/* Payment Details */}
        <View style={styles.detailsSection}>
          <Text style={styles.detailsTitle}>Payment Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount:</Text>
            <Text style={styles.detailValue}>${amount || '50.00'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>To:</Text>
            <Text style={styles.detailValue}>{user?.firstName} {user?.lastName}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Description:</Text>
            <Text style={styles.detailValue}>{description || 'Payment request'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Link:</Text>
            <Text style={styles.detailValue} numberOfLines={2}>
              {paystackUrl ? paystackUrl.substring(0, 30) + '...' : 'Not available'}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          {paystackUrl ? (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleOpenPaystackCheckout}
              activeOpacity={0.9}
            >
              <Text style={styles.primaryButtonText}>🔄 Open Paystack Checkout</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => Alert.alert('Demo Mode', 'This is a demo QR code. In production, you would see the Paystack checkout button.')}
              activeOpacity={0.9}
            >
              <Text style={styles.primaryButtonText}>🧪 Demo Mode</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleSharePayment}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Share Payment Request</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleCopyLink}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Copy Payment Link</Text>
          </TouchableOpacity>
        </View>

        {/* Payment Instructions */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>How to Complete Payment</Text>
          
          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Scan the QR Code</Text>
              <Text style={styles.stepDescription}>
                Use any QR code reader app to scan this code
              </Text>
            </View>
          </View>
          
          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Complete Payment</Text>
              <Text style={styles.stepDescription}>
                Follow the payment instructions on the opened page
              </Text>
            </View>
          </View>
          
          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Payment Confirmed</Text>
              <Text style={styles.stepDescription}>
                You'll receive confirmation and the transaction will be recorded
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 20,
    color: '#343A40',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#343A40',
    marginLeft: 20,
  },
  headerSpacer: {
    flex: 1,
  },
  qrSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#343A40',
    marginBottom: 30,
  },
  qrContainer: {
    alignItems: 'center',
  },
  qrCode: {
    width: 200,
    height: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E9ECEF',
    marginBottom: 16,
    padding: 10,
  },
  qrCodeImage: {
    width: 180,
    height: 180,
  },
  qrNote: {
    fontSize: 14,
    color: '#8C855F',
    textAlign: 'center',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 12,
    color: '#E74C3C',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  detailsSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#343A40',
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  detailLabel: {
    fontSize: 16,
    color: '#6C757D',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: '#343A40',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
    marginLeft: 10,
  },
  actionsSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  primaryButton: {
    backgroundColor: '#D4A574',
    height: 58,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
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
    backgroundColor: '#F8F9FA',
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  secondaryButtonText: {
    color: '#343A40',
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#343A40',
    marginBottom: 20,
    textAlign: 'center',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D4A574',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    marginTop: 2,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#343A40',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#6C757D',
    lineHeight: 20,
  },
});

export default QRCodeScreen;
