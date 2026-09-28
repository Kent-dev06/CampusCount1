import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

export default function StudentIdScreen() {
  const studentData = {
    name: "Alex Verzosa",
    studentId: "2026-IT-0492",
    course: "BS Information Technology",
    qrValue: "CAMPUSCOUNT_USER_2026_IT_0492",
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.schoolHeader}>CAMPUSCOUNT ID</Text>
        
        {/* QR Code Component */}
        <View style={styles.qrContainer}>
          <QRCode
            value={studentData.qrValue}
            size={180}
            color="#18251F"
            backgroundColor="#FFFFFF"
          />
        </View>

        <Text style={styles.name}>{studentData.name}</Text>
        <Text style={styles.idNumber}>{studentData.studentId}</Text>
        <Text style={styles.course}>{studentData.course}</Text>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>Active Student</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18251F',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    width: '85%',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  schoolHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#176B4A',
    letterSpacing: 2,
    marginBottom: 20,
  },
  qrContainer: {
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A202C',
    textAlign: 'center',
  },
  idNumber: {
    fontSize: 14,
    color: '#4A5568',
    marginTop: 4,
  },
  course: {
    fontSize: 12,
    color: '#718096',
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 16,
  },
  badge: {
    backgroundColor: '#C6F6D5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: '#22543D',
    fontSize: 12,
    fontWeight: '600',
  },
});