import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
export default function App(){
  return (
    <View style={styles.bg}>
      <Text style={styles.title}>MAHADEV SEEKER v2</Text>
      <Text style={styles.sub}>Build 26 • No Native Crypto</Text>
      <TouchableOpacity style={styles.btn} onPress={async()=>{
        try{
          const { transact } = await import('@solana-mobile/mobile-wallet-adapter-protocol-web3js');
          const r = await transact(async(w)=> await w.authorize({cluster:'mainnet-beta', identity:{name:'Mahadev'}}));
          Alert.alert('Connected', r.accounts[0].address);
        }catch(e){ Alert.alert('Wallet', e.message); }
      }}>
        <Text style={styles.btnT}>Connect Seeker Wallet</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles=StyleSheet.create({
  bg:{flex:1, backgroundColor:'#000', alignItems:'center', justifyContent:'center', padding:20},
  title:{color:'#fff', fontSize:26, fontWeight:'900'},
  sub:{color:'#0f0', marginTop:8, marginBottom:20},
  btn:{backgroundColor:'#fff', padding:14, borderRadius:10, width:'100%', alignItems:'center'},
  btnT:{color:'#000', fontWeight:'800'}
});
