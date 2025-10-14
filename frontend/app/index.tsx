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
          {/* Logo/Icon */}
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons name="bug" size={100} color="#FF6B35" />
            <View style={styles.logoGlow} />
          </View>
          
          {/* Title */}
          <Text style={styles.title}>ROACH RUNNERS</Text>
          <Text style={styles.subtitle}>Web3 Racing Game</Text>
          
          {/* Features Grid */}
          <View style={styles.featureGrid}>
            <View style={styles.featureCard}>
              <MaterialCommunityIcons name="speedometer" size={32} color="#FF6B35" />
              <Text style={styles.featureLabel}>Fast Races</Text>
            </View>
            <View style={styles.featureCard}>
              <MaterialCommunityIcons name="cash-multiple" size={32} color="#9B59B6" />
              <Text style={styles.featureLabel}>Real Betting</Text>
            </View>
            <View style={styles.featureCard}>
              <MaterialCommunityIcons name="trophy" size={32} color="#F39C12" />
              <Text style={styles.featureLabel}>Win Big</Text>
            </View>
          </View>

          {/* CTA Button */}
          <TouchableOpacity
            style={styles.connectButton}
            onPress={connectWallet}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="wallet" size={24} color="#000" />
            <Text style={styles.connectButtonText}>Connect Wallet</Text>
          </TouchableOpacity>

          {/* Network Badge */}
          <View style={styles.networkBadge}>
            <View style={styles.networkDot} />
            <Text style={styles.networkText}>Mumbai Testnet</Text>
          </View>
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
                    size={48} 
                    color="#FFF" 
                  />
                  <Text style={styles.roachName}>{ROACH_NAMES[index]}</Text>
                  <Text style={styles.roachNumber}>#{id}</Text>
                  {selectedRoach === id && (
                    <View style={styles.selectedBadge}>
                      <MaterialCommunityIcons 
                        name="check-circle" 
                        size={28} 
                        color="#FFD700" 
                      />
                    </View>
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
          {/* Race Header */}
          <View style={styles.raceHeader}>
            <MaterialCommunityIcons name="flag-checkered" size={32} color="#F39C12" />
            <Text style={styles.raceTitle}>RACE IN PROGRESS</Text>
            <MaterialCommunityIcons name="flag-checkered" size={32} color="#F39C12" />
          </View>
          
          {/* Race Tracks */}
          <View style={styles.trackContainer}>
            {[0, 1, 2, 3, 4].map((index) => (
              <View key={index} style={styles.trackWrapper}>
                {/* Lane Label */}
                <View style={[styles.laneLabel, { backgroundColor: ROACH_COLORS[index] }]}>
                  <Text style={styles.laneLabelText}>{ROACH_NAMES[index]}</Text>
                  <Text style={styles.laneLabelNumber}>#{index + 1}</Text>
                </View>
                
                {/* Track Lane */}
                <View style={styles.track}>
                  <View style={styles.trackLine}>
                    {/* Track stripes for visual effect */}
                    <View style={styles.trackStripes}>
                      {[...Array(10)].map((_, i) => (
                        <View key={i} style={styles.trackStripe} />
                      ))}
                    </View>
                    
                    {/* Racing Cockroach */}
                    <Animated.View
                      style={[
                        styles.roachRunner,
                        {
                          backgroundColor: ROACH_COLORS[index],
                          transform: [{
                            translateX: raceAnimations[index].interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, width - 160]
                            })
                          }]
                        },
                        selectedRoach === index + 1 && styles.selectedRunner
                      ]}
                    >
                      <MaterialCommunityIcons name="bug" size={28} color="#FFF" />
                    </Animated.View>
                  </View>
                  
                  {/* Finish Line */}
                  <View style={styles.finishLine}>
                    <MaterialCommunityIcons name="flag-checkered" size={28} color="#F39C12" />
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Race Status */}
          {isRacing && (
            <View style={styles.raceStatus}>
              <ActivityIndicator size="large" color="#2ECC71" />
              <Text style={styles.raceStatusText}>Racing...</Text>
            </View>
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
  logoContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  logoGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FF6B35',
    opacity: 0.2,
    top: -10,
    left: -10,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginTop: 8,
    textAlign: 'center',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#9B59B6',
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '600',
  },
  featureGrid: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 48,
    marginBottom: 32,
  },
  featureCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
    flex: 1,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  featureLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  connectButton: {
    backgroundColor: '#2ECC71',
    paddingHorizontal: 48,
    paddingVertical: 18,
    borderRadius: 16,
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#2ECC71',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  connectButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 32,
    gap: 8,
    borderWidth: 1,
    borderColor: '#9B59B6',
  },
  networkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2ECC71',
  },
  networkText: {
    color: '#9B59B6',
    fontSize: 12,
    fontWeight: '600',
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
  roachName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 3,
  },
  roachNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
    marginTop: 2,
    opacity: 0.9,
  },
  selectedBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#000',
    borderRadius: 20,
    padding: 2,
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
  raceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 32,
    paddingVertical: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
  },
  raceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F39C12',
    textAlign: 'center',
    letterSpacing: 1,
  },
  trackContainer: {
    flex: 1,
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  trackWrapper: {
    marginVertical: 6,
  },
  laneLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    marginBottom: -1,
  },
  laneLabelText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  laneLabelNumber: {
    color: '#FFF',
    fontSize: 10,
    opacity: 0.8,
  },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 8,
  },
  trackLine: {
    flex: 1,
    height: 48,
    backgroundColor: '#2a2a2a',
    borderRadius: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  trackStripes: {
    position: 'absolute',
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    justifyContent: 'space-around',
  },
  trackStripe: {
    width: 2,
    height: '100%',
    backgroundColor: '#333',
  },
  roachRunner: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    top: 2,
    left: 4,
  },
  selectedRunner: {
    borderWidth: 3,
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOpacity: 0.6,
  },
  finishLine: {
    width: 40,
    height: 48,
    backgroundColor: '#1a1a1a',
    borderLeftWidth: 2,
    borderLeftColor: '#F39C12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  raceStatus: {
    alignItems: 'center',
    marginTop: 24,
    gap: 12,
  },
  raceStatusText: {
    color: '#2ECC71',
    fontSize: 16,
    fontWeight: 'bold',
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
