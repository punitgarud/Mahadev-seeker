import { install } from 'react-native-quick-crypto';
import { Buffer } from 'buffer';
global.Buffer = global.Buffer || Buffer;
install();
