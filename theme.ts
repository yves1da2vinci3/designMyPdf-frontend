import { MantineThemeOverride } from '@mantine/core';

export const theme: MantineThemeOverride = {
  primaryColor: 'blue',
  defaultRadius: 'md', // Set default border radius for components like Paper, Card, Button, Input etc.

  components: {
    Paper: {
      defaultProps: {
        shadow: 'sm',
        withBorder: true,
      },
    },
    Button: {
      defaultProps: {
        size: 'sm',
        //NCC: Consider adding a default radius here if `defaultRadius` doesn't cover it as expected.
        // For example: radius: 'md'
      },
    },
    Card: {
      defaultProps: {
        shadow: 'sm',
        withBorder: true,
        //NCC: Consider adding a default radius here if `defaultRadius` doesn't cover it as expected.
        // For example: radius: 'md'
      },
    },
    Input: {
      defaultProps: {
        //NCC: Consider adding a default radius here if `defaultRadius` doesn't cover it as expected.
        // For example: radius: 'md'
      }
    },
    Select: {
      defaultProps: {
        //NCC: Consider adding a default radius here if `defaultRadius` doesn't cover it as expected.
        // For example: radius: 'md'
      }
    }
  },
};
