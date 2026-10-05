import 'react-native-get-random-values';
import { Buffer } from 'buffer';
global.Buffer = Buffer;

import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { Connection, clusterApiUrl } from '@solana/web3.js';

const CYCLE_MS = 6 * 60 * 60 * 1000; // 6 Hours
const BRAIN_URL = 'https://punitgarud.github.io/Mahadev/active_modules.json';

export default function App() {
  const [wallet, setWallet] = useState(null);
  const [alloc, setAlloc] = useState(25);
  const [activeSet, setActiveSet] = useState([]); // For REAL trades
  const [monitoringSet, setMonitoringSet] = useState([]); // For next cycle
  const [logs, setLogs] = useState([]);
  const [cycleEnd, setCycleEnd] = useState(null);
  const [pnl, setPnl] = useState({});

  useEffect(() => {
    loadState();
    const interval = setInterval(checkCycle, 60000); // check every min
    return () => clearInterval(interval);
  }, []);

  const loadState = async () => {
    const saved = await AsyncStorage.getItem('MAHADEV_STATE');
    if (saved) {
      const s = JSON.parse(saved);
      setActiveSet(s.activeSet || []);
      setMonitoringSet(s.monitoringSet || []);
      setLogs(s.logs || []);
      setPnl(s.pnl || {});
      setCycleEnd(s.cycleEnd);
    } else {
      // First run - fetch initial top 4
      fetchAndRotate();
    }
  };

  const saveState = async (newState) => {
    await AsyncStorage.setItem('MAHADEV_STATE', JSON.stringify(newState));
  };

  // 1) Identify Top 4 Modules for last 6 Hrs
  const fetchAndRotate = async () => {
    try {
      const res = await fetch(BRAIN_URL + '?t=' + Date.now());
      const data = await res.json();
      const allModules = data.all_modules || data.top_modules || [];

      // Sort by prob * profit - your core logic
      const sorted = [...allModules].sort((a,b) => (b.win_prob * b.avg_profit) - (a.win_prob * a.avg_profit));
      const newTop4 = sorted.slice(0,4);

      const now = Date.now();
      const newCycleEnd = now + CYCLE_MS;

      // 2) Mark Top 4 as Active for NEXT cycle, current active goes to monitoring
      const nextState = {
        activeSet: newTop4, // 3) Real trades will be executed on these for next 6 hrs
        monitoringSet: allModules, // 1) Monitoring continues 24/7
        logs: [...logs, { time: new Date().toISOString(), event: 'CYCLE_ROTATE', top4: newTop4.map(m=>m.name) }],
        pnl,
        cycleEnd: newCycleEnd
      };

      setActiveSet(newTop4);
      setMonitoringSet(allModules);
      setCycleEnd(newCycleEnd);
      setLogs(nextState.logs);
      await saveState(nextState);
    } catch(e) { console.log(e); }
  };

  const checkCycle = async () => {
    if (cycleEnd && Date.now() > cycleEnd) {
      // 4) 6hr over -> rotate
      await fetchAndRotate();
      if (wallet) executeRealTrades(); // Auto-execute for new cycle
    }
  };

  // 8) Real Trades on Seeker Seed Vault + 10) Allocation
  const executeRealTrades = async () => {
    if (!wallet) return Alert.alert('Connect Seeker Wallet');

    // Example: Calculate amount = walletBalance * alloc% / 4
    // Get balance first
    // const bal = await connection.getBalance(...)

    Alert.alert('EXECUTING', `${alloc}% on 4 modules: ${activeSet.map(m=>m.name).join(', ')}`);

    try {
      await transact(async (w) => {
        // Here you add your 4 module instructions
        // const txs = activeSet.map(m => buildTxForModule(m, alloc))
        // await w.signAndSendTransactions({transactions: txs})
      });

      // 6) Log performance
      const newPnl = {...pnl};
      activeSet.forEach(m => {
        if(!newPnl[m.name]) newPnl[m.name] = { trades:0, profit:0, win:0 };
        newPnl[m.name].trades += 1;
      });
      setPnl(newPnl);
      const newLogs = [...logs, {time: new Date().toISOString(), event:'TRADE', alloc, modules: activeSet.map(m=>m.name)}];
      setLogs(newLogs);
      await saveState({activeSet, monitoringSet, logs: newLogs, pnl: newPnl, cycleEnd});

    } catch(e) { Alert.alert('Trade Failed', e.message); }
  };

  const connectSeeker = async () => {
    const r = await transact(async (w) => await w.authorize({ cluster:'mainnet-beta', identity:{name:'Mahadev Seeker'}}));
    setWallet(r.accounts[0].address);
  };

  // 9) 24/7 background - needs Foreground Service permission in app.json
  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if(state === 'background') {
        // Android will keep running if you add "android.foregroundService" in app.json
        console.log('App in background - cycle still active');
      }
    });
    return () => sub.remove();
  }, []);

  const timeLeft = cycleEnd? Math.max(0, Math.floor((cycleEnd - Date.now())/60000)) : 0;

  return (
    <ScrollView style={styles.bg} contentContainerStyle={{padding:20, paddingTop:50}}>
      <Text style={styles.title}>MAHADEV • SEEKER</Text>
      <Text style={styles.cycle}>Cycle ends in: {timeLeft} min | Next rotation auto</Text>

      <TouchableOpacity style={styles.conn} onPress={connectSeeker}>
        <Text style={styles.connT}>{wallet? wallet.slice(0,4)+'...'+wallet.slice(-4) : 'Connect Seeker Wallet (Seed Vault)'}</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.label}>ACTIVE FOR REAL TRADES (Next 6Hrs) - Step 3</Text>
        {activeSet.map((m,i)=><View key={i} style={styles.row}><Text style={styles.name}>{i+1}. {m.name}</Text><Text style={styles.profit}>{m.win_prob}% • {m.avg_profit}$</Text></View>)}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>MONITORING ALL MODULES (Last 6Hrs) - Step 1</Text>
        {monitoringSet.slice(0,8).map((m,i)=><View key={i} style={styles.row}><Text style={styles.nameDim}>{m.name}</Text><Text style={styles.profitDim}>{m.trades_6h} trades</Text></View>)}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>ALLOCATION - Step 10</Text>
        <View style={{flexDirection:'row', gap:10}}>
          {[25,50,75].map(v=><TouchableOpacity key={v} onPress={()=>setAlloc(v)} style={[styles.alloc, alloc===v&&styles.allocA]}><Text style={alloc===v?{color:'#000'}:{color:'#fff'}}>{v}%</Text></TouchableOpacity>)}
        </View>
      </View>

      <TouchableOpacity style={styles.exec} onPress={executeRealTrades}><Text style={styles.execT}>EXECUTE REAL TRADES NOW - {alloc}%</Text></TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.label}>DETAILED P&L - Step 11</Text>
        {Object.keys(pnl).map(k=><View key={k} style={styles.row}><Text style={styles.name}>{k}</Text><Text style={styles.profit}>{pnl[k].trades} trades • {pnl[k].profit}$ P&L</Text></View>)}
        {Object.keys(pnl).length===0 && <Text style={styles.nameDim}>No trades yet - logs start after first cycle</Text>}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>LOGS - Step 6 (24/7)</Text>
        {logs.slice(-5).reverse().map((l,i)=><Text key={i} style={styles.log}>{l.time.slice(11,19)} {l.event} {l.top4? l.top4.join(',') : ''}</Text>)}
      </View>

      <Text style={styles.footer}>Build will run 24/7 with foregroundService. Add in app.json: permissions + foregroundService.{"\n"}Every 3-4 days review pnl and disable low win_prob modules - Step 7</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bg:{backgroundColor:'#000', flex:1},
  title:{color:'#fff', fontSize:26, fontWeight:'900', textAlign:'center'},
  cycle:{color:'#0f0', textAlign:'center', marginBottom:20, marginTop:5},
  conn:{backgroundColor:'#fff', padding:14, borderRadius:10, marginBottom:15, alignItems:'center'},
  connT:{color:'#000', fontWeight:'800'},
  card:{backgroundColor:'#111', borderRadius:14, padding:14, marginBottom:12, borderWidth:1, borderColor:'#222'},
  label:{color:'#666', fontSize:9, letterSpacing:1, marginBottom:8},
  row:{flexDirection:'row', justifyContent:'space-between', paddingVertical:6, borderBottomWidth:1, borderBottomColor:'#1a1a1a'},
  name:{color:'#fff', fontWeight:'600'}, nameDim:{color:'#777'}, profit:{color:'#0f0'}, profitDim:{color:'#555'},
  alloc:{flex:1, borderWidth:1, borderColor:'#333', padding:10, borderRadius:8, alignItems:'center'}, allocA:{backgroundColor:'#fff', borderColor:'#fff'},
  exec:{backgroundColor:'#0f0', padding:16, borderRadius:12, alignItems:'center', marginTop:10},
  execT:{color:'#000', fontWeight:'900'},
  log:{color:'#555', fontSize:10, marginBottom:4},
  footer:{color:'#333', fontSize:9, textAlign:'center', marginTop:20, lineHeight:14}
});
