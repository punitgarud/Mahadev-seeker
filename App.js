import 'react-native-get-random-values';
import { Buffer } from 'buffer';
global.Buffer = Buffer;

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';

const BRAIN_URL = 'https://punitgarud.github.io/Mahadev-seeker/';

export default function App(){
  const [wallet,setWallet]=useState(null);
  const [alloc,setAlloc]=useState(25);
  const [active,setActive]=useState(null);
  const [loading,setLoading]=useState(false);

  useEffect(()=>{
    fetch(BRAIN_URL+'active_modules.json?t='+Date.now())
     .then(r=>r.json())
     .then(setActive)
     .catch(()=> setActive({top4:[{module:'MAHADEV-ALPHA', score:92, winRate:78}]}) );
  },[]);

  const connect=async()=>{
    setLoading(true);
    try{
      // LAZY import - this fixes the crash
      const { transact } = await import('@solana-mobile/mobile-wallet-adapter-protocol-web3js');
      const r = await transact(async(w)=> await w.authorize({cluster:'mainnet-beta', identity:{name:'Mahadev Seeker'}}));
      setWallet(r.accounts[0].address);
    }catch(e){
      Alert.alert('Wallet', e.message);
    }
    finally{ setLoading(false); }
  };

  return(
    <ScrollView style={styles.bg} contentContainerStyle={{padding:20, paddingTop:60}}>
      <Text style={styles.title}>MAHADEV SEEKER v2</Text>
      <Text style={styles.sub}>6H Cycle • Seed Vault Ready • Build 21</Text>
      <TouchableOpacity style={styles.conn} onPress={connect}>
        <Text style={styles.connT}>{wallet? wallet.slice(0,4)+'...'+wallet.slice(-4)+' ✓' : 'Connect Seeker Wallet'}</Text>
      </TouchableOpacity>
      {loading && <ActivityIndicator color="#fff" style={{marginBottom:10}} />}
      <View style={styles.card}>
        <Text style={styles.label}>ACTIVE TOP 4 FOR REAL TRADES</Text>
        {active?.top4?.map((m,i)=>(
          <View key={i} style={styles.row}>
            <Text style={styles.name}>{i+1}. {m.module || m.name}</Text>
            <Text style={styles.green}>Score {m.score} • {m.winRate}%</Text>
          </View>
        ))}
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>ALLOCATION</Text>
        <View style={{flexDirection:'row', gap:8}}>
          {[25,50,75].map(v=>(
            <TouchableOpacity key={v} onPress={()=>setAlloc(v)} style={[styles.alloc, alloc===v&&styles.allocA]}>
              <Text style={alloc===v?{color:'#000',fontWeight:'900'}:{color:'#fff'}}>{v}%</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <TouchableOpacity style={styles.exec} onPress={()=>Alert.alert('Execute', `${alloc}% on ${active?.top4Names?.join(', ') || 'Top 4'}`)}>
        <Text style={styles.execT}>EXECUTE REAL TRADES - {alloc}%</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
const styles=StyleSheet.create({
  bg:{flex:1, backgroundColor:'#000'},
  title:{color:'#fff', fontSize:26, fontWeight:'900', textAlign:'center'},
  sub:{color:'#0f0', textAlign:'center', fontSize:12, marginBottom:20, marginTop:4},
  conn:{backgroundColor:'#fff', padding:14, borderRadius:10, alignItems:'center', marginBottom:12},
  connT:{color:'#000', fontWeight:'800'},
  card:{backgroundColor:'#111', borderRadius:14, padding:14, marginBottom:12, borderWidth:1, borderColor:'#222'},
  label:{color:'#666', fontSize:9, letterSpacing:1, marginBottom:8},
  row:{flexDirection:'row', justifyContent:'space-between', paddingVertical:7, borderBottomWidth:1, borderBottomColor:'#1a1a1a'},
  name:{color:'#fff', fontWeight:'600'},
  green:{color:'#00ff88', fontSize:12},
  alloc:{flex:1, borderWidth:1, borderColor:'#333', padding:10, borderRadius:8, alignItems:'center'},
  allocA:{backgroundColor:'#fff', borderColor:'#fff'},
  exec:{backgroundColor:'#00ff88', padding:16, borderRadius:12, alignItems:'center', marginTop:10},
  execT:{color:'#000', fontWeight:'900'},
});
