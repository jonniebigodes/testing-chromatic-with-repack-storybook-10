import { AppRegistry } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LiteUI } from '@storybook/react-native-ui-lite';

import { view } from './storybook.requires';
import { name as appName } from '../app.json';

/**
 * This file is user-editable.
 *
 * Use it as your React Native Storybook entrypoint and wrap `StorybookUIRoot`
 * with application decorators/providers (theme, i18n, state, navigation, etc).
 */
const StorybookUIRoot = view.getStorybookUI({
  //shouldPersistSelection: true, ## dev mode
  storage: {
    getItem: AsyncStorage.getItem,
    setItem: AsyncStorage.setItem,
  },
  CustomUIComponent: LiteUI,
  //Required for Chromatic
  enableWebsockets: true,
  host: "react-native.capture.chromatic.com",
  port: 7007,
  secured: true,
  // Recommended
  onDeviceUI: false,
  shouldPersistSelection: false,
});

AppRegistry.registerComponent(appName, () => StorybookUIRoot);

export default StorybookUIRoot;
