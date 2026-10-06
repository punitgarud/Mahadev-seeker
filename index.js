import 'expo-standard-web-crypto';
import { Buffer } from 'buffer';
if (!global.Buffer) global.Buffer = Buffer;

import { registerRootComponent } from 'expo';
import App from './App';
registerRootComponent(App);
