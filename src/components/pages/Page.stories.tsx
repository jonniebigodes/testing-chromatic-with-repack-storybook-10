// this is incorrect still (was not adjusted)
// import type { Meta } from '@storybook/react';

// import { Page } from './Page';

// export default {
//   title: 'Example/Page',
//   component: Page,
// } as Meta<typeof Page>;

// export const Default = {};

import type { Meta, StoryObj } from '@storybook/react-native';

import { View } from 'react-native';

import { Page } from './Page';

const meta = {
  title: 'Example/Page',
  component: Page,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, alignItems: 'flex-start' }}>
        <Story />
      </View>
    ),
  ],
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
} satisfies Meta<typeof Page>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};