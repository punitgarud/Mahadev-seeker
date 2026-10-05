import { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { Connection, PublicKey, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

const RPC = "https://api.mainnet-beta.solana.com";
const ENGINE_URL = "https://punitgarud.github.io/Mahadev/active_modules.json";

export default function App(){
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(0);
  const [top4, setTop4] = useState([]);
  const [funds, setFunds] = useState(25);

  const fetchEngine = async () => {
    try{
      const r = await fetch(ENGINE_URL+'?t='+Date.now());
      const j = await r.json();
      setTop4(j.top4 || []);
      console.log("Top4", j.top4);
    }catch(e){ console.log(e); }
  };

  useEffect(()=>{ fetchEngine(); const i=setInterval(fetchEngine,30000); return()=>clearInterval(i); },[]);

  const connect = async () => {
    try{
      await transact(async (w) => {
        const auth = await w.authorize({ cluster: 'mainnet-beta', identity: { name: 'Mahadev Engine v2' } });
        setWallet(auth.accounts[0].address);
        const conn = new Connection(RPC);
        const bal = await conn.getBalance(new PublicKey(auth.accounts[0].address));
        setBalance(bal / LAMPORTS_PER_SOL);
      });
    }catch(e){ Alert.alert("Connect failed - Install on Seeker device", String(e)); }
  };

  const executeReal = async () => {
    if(!wallet) return Alert.alert("Connect wallet first");
    const totalForTrading = balance * (funds/100);
    Alert.alert(`Executing REAL`, `Wallet: ${balance.toFixed(3)} SOL\nUsing ${funds}% = ${totalForTrading.toFixed(3)} SOL\nTop4: ${top4.map(t=>t.module).join(', ')}\n\nThis will sign via Seeker Seed Vault (No key export)`);

    // Here you call Jupiter swap for each Top4 allocation
    // Example: await transact for each module based on allocation
  };

  return (
    <ScrollView style={styles.bg}>
      <Text style={styles.h1}>🔱 Mahadev Seeker dApp</Text>
      <View style={styles.card}>
        <Text style={styles.white}>Wallet: {wallet? wallet.slice(0,8)+'...'+wallet.slice(-4) : 'Not connected'}</Text>
        <Text style={styles.white}>Balance: {balance} SOL</Text>
        <Button title={wallet? "Connected ✅" : "Connect Seeker Wallet"} onPress={connect} color="#00ff88"/>
      </View>

      <View style={styles.card}>
        <Text style={styles.h2}>Funds to Use</Text>
        <View style={{flexDirection:'row', gap:6}}>
          <Button title="25%" onPress={()=>setFunds(25)} color={funds==25?'#00ff88':'#333'}/>
          <Button title="50%" onPress={()=>setFunds(50)} color={funds==50?'#00ff88':'#333'}/>
          <Button title="75%" onPress={()=>setFunds(75)} color={funds==75?'#00ff88':'#333'}/>
        </View>
        <Text style={styles.gold}>Using {funds}% of wallet</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.h2}>🏆 Top 4 Active (from GitHub Engine)</Text>
        {top4.map((m,i)=><Text key={i} style={styles.white}>#{i+1} {m.module} - Score {m.score} PnL ₹{m.pnl}</Text>)}
        <Button title="Execute REAL Trades on Seeker" onPress={executeReal} color="#ffd700"/>
        <Text style={styles.dim}>Uses Seeker Seed Vault - Private key never leaves secure enclave</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.dim}>Engine URL: {ENGINE_URL}{"\n"}Auto refresh every 30s. Engine runs 24x7 on GitHub.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bg:{backgroundColor:'#07070a', flex:1, padding:12, paddingTop:40},
  card:{backgroundColor:'#111', borderColor:'#222', borderWidth:1, borderRadius:12, padding:12, marginVertical:8},
  h1:{color:'#fff', fontSize:22, fontWeight:'bold'},
  h2:{color:'#fff', fontSize:16, fontWeight:'bold', marginBottom:6},
  white:{color:'#fff', marginVertical:2},
  gold:{color:'#ffd700', marginTop:6},
  dim:{color:'#888', fontSize:11, marginTop:6}
});
