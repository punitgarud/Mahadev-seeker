import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function App(){
  return(
    <ScrollView style={styles.bg} contentContainerStyle={{padding:20, paddingTop:60}}>
      <Text style={styles.title}>MAHADEV SEEKER v2</Text>
      <Text style={styles.sub}>Build Test - GREEN</Text>
      <View style={styles.card}>
        <Text style={styles.label}>ACTIVE TOP 4</Text>
        <Text style={styles.name}>SMC, VWAP, Liquidity, FVG</Text>
        <Text style={styles.green}>If you see this APK, build pipeline is fixed</Text>
      </View>
      <TouchableOpacity style={styles.exec}>
        <Text style={styles.execT}>EXECUTE - 25%</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
const styles=StyleSheet.create({
  bg:{flex:1, backgroundColor:'#000'},
  title:{color:'#fff', fontSize:26, fontWeight:'900', textAlign:'center'},
  sub:{color:'#0f0', textAlign:'center', fontSize:12, marginBottom:20, marginTop:4},
  card:{backgroundColor:'#111', borderRadius:14, padding:14, marginBottom:12, borderWidth:1, borderColor:'#222'},
  label:{color:'#666', fontSize:9, letterSpacing:1, marginBottom:8},
  name:{color:'#fff', fontWeight:'600'},
  green:{color:'#00ff88', fontSize:12},
  exec:{backgroundColor:'#00ff88', padding:16, borderRadius:12, alignItems:'center', marginTop:10},
  execT:{color:'#000', fontWeight:'900'},
});
