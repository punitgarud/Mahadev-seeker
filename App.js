import 'react-native-get-random-values';
import { Buffer } from 'buffer';
global.Buffer = Buffer;

import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Linking } from 'react-native';
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { Connection, clusterApiUrl, PublicKey, Transaction } from '@solana/web3.js';

const BRAIN_URL = 'https://punitgarud.github.io/Mahadev/active_modules.json';

export default function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alloc, setAlloc] = useState(25);

  const connection = new Connection(clusterApiUrl('mainnet-beta'));

  // Fetch Top 4 from Mahadev Brain
  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async ()
