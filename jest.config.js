module.exports = {
  preset: '@react-native/jest-preset',
  // Mirror the rspack build with Storybook disabled (DefinePlugin + StorybookPlugin stub)
  globals: {
    STORYBOOK_ENABLED: false,
  },
  moduleNameMapper: {
    '\\.rnstorybook$': '<rootDir>/node_modules/@storybook/react-native/dist/stub.js',
  },
};
