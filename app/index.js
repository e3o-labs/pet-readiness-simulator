import { registerRootComponent } from 'expo';

import App from './App';
import { MobileAppFrame } from './src/MobileAppFrame';

function MobileApp() {
  return (
    <MobileAppFrame>
      <App />
    </MobileAppFrame>
  );
}

registerRootComponent(MobileApp);
