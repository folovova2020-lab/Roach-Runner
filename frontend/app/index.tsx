import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

// Vibrant game-style colors for cockroaches
const ROACH_COLORS = [
  '#FF6B35', // Vibrant Orange
  '#9B59B6', // Purple
  '#2ECC71', // Green
  '#F39C12', // Golden Yellow
  '#E74C3C'  // Red
];

const ROACH_NAMES = [
  'Speedy',
  'Thunder',
  'Flash',
  'Bolt',
  'Rocket'
];

interface Cockroach {
  id: number;
  position: number;
  color: string;
  speed: number;
}

export default function Index() {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [balance, setBalance] = useState('0');
  const [currentScreen, setCurrentScreen] = useState<'home' | 'lobby' | 'race' | 'results'>('home');
  const [betAmount, setBetAmount] = useState('0.01');
  const [selectedRoach, setSelectedRoach] = useState<number | null>(null);
  const [isRacing, setIsRacing] = useState(false);
  const [cockroaches, setCockroaches] = useState<Cockroach[]>([]);
  const [winner, setWinner] = useState<number | null>(null);
  const [raceAnimations] = useState(
    Array(5).fill(0).map(() => new Animated.Value(0))
  );

  // Simulate wallet connection (WalletConnect will be integrated in production)
  const connectWallet = () => {
    // Simulated connection - In production, use WalletConnect
    const mockAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
    const mockBalance = '2.5';
    setWalletAddress(mockAddress);
    setBalance(mockBalance);
    setIsConnected(true);
    setCurrentScreen('lobby');
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress('');
    setBalance('0');
    setCurrentScreen('home');
  };

  const initializeCockroaches = () => {
    const roaches: Cockroach[] = Array(5).fill(0).map((_, index) => ({
      id: index + 1,
      position: 0,
      color: ROACH_COLORS[index],
      speed: 0
    }));
    setCockroaches(roaches);
  };

  const startRace = () => {
    if (selectedRoach === null) {
      Alert.alert('Select a Cockroach', 'Please choose your racing cockroach!');
      return;
    }

    setIsRacing(true);
    setCurrentScreen('race');
    initializeCockroaches();

    // Animate all cockroaches
    const animations = raceAnimations.map((anim, index) => {
      anim.setValue(0);
      const randomSpeed = 2000 + Math.random() * 3000; // Random speed between 2-5 seconds
      
      return Animated.timing(anim, {
        toValue: 1,
        duration: randomSpeed,
        useNativeDriver: true
      });
    });

    // Start all animations
    animations.forEach(anim => anim.start());

    // Determine winner after animations
    setTimeout(() => {
      const speeds = animations.map(anim => anim);
      const winnerIndex = Math.floor(Math.random() * 5); // Random winner for MVP
      setWinner(winnerIndex + 1);
      setIsRacing(false);
      setCurrentScreen('results');
    }, 5500);
  };

  const resetRace = () => {
    setWinner(null);
    setSelectedRoach(null);
    setCockroaches([]);
    raceAnimations.forEach(anim => anim.setValue(0));
    setCurrentScreen('lobby');
  };

  // Home Screen
  if (currentScreen === 'home') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.homeContainer}>
          <MaterialCommunityIcons name="bug" size={120} color="#FFE66D" />
          <Text style={styles.title}>🏆 ROACH RUNNERS 🏆</Text>
          <Text style={styles.subtitle}>Web3 Cockroach Racing Game</Text>
          
          <View style={styles.featureContainer}>
            <Text style={styles.featureText}>🎮 Race cockroaches</Text>
            <Text style={styles.featureText}>💰 Bet with MATIC</Text>
            <Text style={styles.featureText}>🏅 Win rewards</Text>
          </View>

          <TouchableOpacity
            style={styles.connectButton}
            onPress={connectWallet}
          >
            <Text style={styles.connectButtonText}>Connect Wallet</Text>
          </TouchableOpacity>

          <Text style={styles.infoText}>
            Phase 1 MVP - Mumbai Testnet
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Lobby Screen
  if (currentScreen === 'lobby') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Race Lobby</Text>
            <Text style={styles.walletText}>
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </Text>
          </View>
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Balance</Text>
            <Text style={styles.balanceAmount}>{balance} MATIC</Text>
          </View>
        </View>

        <ScrollView style={styles.content}>
          {/* Bet Amount */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Entry Fee</Text>
            <View style={styles.betContainer}>
              <TouchableOpacity
                style={[styles.betButton, betAmount === '0.01' && styles.betButtonActive]}
                onPress={() => setBetAmount('0.01')}
              >
                <Text style={styles.betButtonText}>0.01 MATIC</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.betButton, betAmount === '0.05' && styles.betButtonActive]}
                onPress={() => setBetAmount('0.05')}
              >
                <Text style={styles.betButtonText}>0.05 MATIC</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.betButton, betAmount === '0.1' && styles.betButtonActive]}
                onPress={() => setBetAmount('0.1')}
              >
                <Text style={styles.betButtonText}>0.1 MATIC</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Select Cockroach */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choose Your Racer</Text>
            <View style={styles.roachContainer}>
              {[1, 2, 3, 4, 5].map((id, index) => (
                <TouchableOpacity
                  key={id}
                  style={[
                    styles.roachCard,
                    { backgroundColor: ROACH_COLORS[index] },
                    selectedRoach === id && styles.roachCardSelected
                  ]}
                  onPress={() => setSelectedRoach(id)}
                >
                  <MaterialCommunityIcons 
                    name="bug" 
                    size={40} 
                    color="#000" 
                  />
                  <Text style={styles.roachNumber}>#{id}</Text>
                  {selectedRoach === id && (
                    <MaterialCommunityIcons 
                      name="check-circle" 
                      size={24} 
                      color="#fff" 
                      style={styles.checkIcon}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Race Info */}
          <View style={styles.infoCard}>
            <Text style={styles.infoCardText}>
              🏁 Race Distance: 100m
            </Text>
            <Text style={styles.infoCardText}>
              👥 Players: 1/5
            </Text>
            <Text style={styles.infoCardText}>
              💰 Total Pot: {betAmount} MATIC
            </Text>
            <Text style={styles.infoCardText}>
              🏆 Winner Gets: {(parseFloat(betAmount) * 0.95).toFixed(3)} MATIC (95%)
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.startButton, !selectedRoach && styles.startButtonDisabled]}
            onPress={startRace}
            disabled={!selectedRoach}
          >
            <Text style={styles.startButtonText}>
              {selectedRoach ? 'Start Race' : 'Select a Roach First'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.disconnectButton}
            onPress={disconnectWallet}
          >
            <Text style={styles.disconnectButtonText}>Disconnect Wallet</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Race Screen
  if (currentScreen === 'race') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.raceContainer}>
          <Text style={styles.raceTitle}>🏁 RACE IN PROGRESS 🏁</Text>
          
          <View style={styles.trackContainer}>
            {[0, 1, 2, 3, 4].map((index) => (
              <View key={index} style={styles.track}>
                <View style={styles.trackNumber}>
                  <Text style={styles.trackNumberText}>#{index + 1}</Text>
                </View>
                <View style={styles.trackLine}>
                  <Animated.View
                    style={[
                      styles.roachRunner,
                      {
                        backgroundColor: ROACH_COLORS[index],
                        transform: [{
                          translateX: raceAnimations[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, width - 120]
                          })
                        }]
                      },
                      selectedRoach === index + 1 && styles.selectedRunner
                    ]}
                  >
                    <MaterialCommunityIcons name="bug" size={24} color="#000" />
                  </Animated.View>
                </View>
                <MaterialCommunityIcons name="flag-checkered" size={24} color="#FFE66D" />
              </View>
            ))}
          </View>

          {isRacing && (
            <ActivityIndicator size="large" color="#FFE66D" style={styles.loader} />
          )}
        </View>
      </SafeAreaView>
    );
  }

  // Results Screen
  if (currentScreen === 'results') {
    const isWinner = winner === selectedRoach;
    
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.resultsContainer}>
          <View style={[styles.resultCard, isWinner ? styles.winCard : styles.loseCard]}>
            <MaterialCommunityIcons 
              name={isWinner ? "trophy" : "emoticon-sad"} 
              size={80} 
              color={isWinner ? "#FFD700" : "#FF6B6B"} 
            />
            <Text style={styles.resultTitle}>
              {isWinner ? '🎉 YOU WON! 🎉' : '😔 Better Luck Next Time'}
            </Text>
            
            <View style={styles.resultInfo}>
              <Text style={styles.resultText}>Winner: Roach #{winner}</Text>
              <Text style={styles.resultText}>Your Pick: Roach #{selectedRoach}</Text>
              {isWinner && (
                <>
                  <Text style={styles.winAmount}>
                    +{(parseFloat(betAmount) * 0.95).toFixed(3)} MATIC
                  </Text>
                  <Text style={styles.resultSubtext}>
                    Winnings credited to your wallet
                  </Text>
                </>
              )}
              {!isWinner && (
                <Text style={styles.loseAmount}>
                  -{betAmount} MATIC
                </Text>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={styles.newRaceButton}
            onPress={resetRace}
          >
            <Text style={styles.newRaceButtonText}>New Race</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={disconnectWallet}
          >
            <Text style={styles.backButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  homeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFE66D',
    marginTop: 24,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    marginTop: 8,
    textAlign: 'center',
  },
  featureContainer: {
    marginTop: 40,
    gap: 12,
  },
  featureText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },
  connectButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 48,
  },
  connectButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoText: {
    color: '#666',
    fontSize: 12,
    marginTop: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFE66D',
  },
  walletText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  balanceContainer: {
    alignItems: 'flex-end',
  },
  balanceLabel: {
    fontSize: 12,
    color: '#999',
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFE66D',
    marginBottom: 16,
  },
  betContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  betButton: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#333',
  },
  betButtonActive: {
    borderColor: '#4ECDC4',
    backgroundColor: '#1a3a38',
  },
  betButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  roachContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  roachCard: {
    width: (width - 56) / 3,
    aspectRatio: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  roachCardSelected: {
    borderColor: '#fff',
  },
  roachNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 8,
  },
  checkIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  infoCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    gap: 8,
  },
  infoCardText: {
    color: '#fff',
    fontSize: 14,
  },
  startButton: {
    margin: 16,
    backgroundColor: '#4ECDC4',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonDisabled: {
    backgroundColor: '#333',
  },
  startButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disconnectButton: {
    margin: 16,
    marginTop: 8,
    padding: 16,
    alignItems: 'center',
  },
  disconnectButtonText: {
    color: '#999',
    fontSize: 14,
  },
  raceContainer: {
    flex: 1,
    padding: 16,
  },
  raceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFE66D',
    textAlign: 'center',
    marginBottom: 32,
  },
  trackContainer: {
    flex: 1,
    justifyContent: 'space-around',
  },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 8,
  },
  trackNumber: {
    width: 40,
    height: 40,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackNumberText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  trackLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#333',
  },
  roachRunner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedRunner: {
    borderWidth: 2,
    borderColor: '#fff',
  },
  loader: {
    marginTop: 32,
  },
  resultsContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  resultCard: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
  },
  winCard: {
    backgroundColor: '#1a3a1a',
    borderWidth: 2,
    borderColor: '#4ECDC4',
  },
  loseCard: {
    backgroundColor: '#3a1a1a',
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    textAlign: 'center',
  },
  resultInfo: {
    marginTop: 24,
    gap: 12,
    alignItems: 'center',
  },
  resultText: {
    fontSize: 16,
    color: '#ccc',
  },
  winAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4ECDC4',
    marginTop: 8,
  },
  loseAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginTop: 8,
  },
  resultSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  newRaceButton: {
    marginTop: 32,
    backgroundColor: '#4ECDC4',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  newRaceButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 16,
    padding: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#999',
    fontSize: 14,
  },
});
