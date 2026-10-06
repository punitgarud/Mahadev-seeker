import { install } from 'react-native-quick-crypto';
import { Buffer } from 'buffer';
global.Buffer = global.Buffer || Buffer;
install();

import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
