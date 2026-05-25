import { createTheme, alpha } from '@mui/material/styles';

// Extend the Palette interface to include MD3 custom colors
declare module '@mui/material/styles' {
  interface Palette {
    surfaceContainerLowest: string;
    surfaceContainerLow: string;
    surfaceContainer: string;
    surfaceContainerHigh: string;
    surfaceContainerHighest: string;
    primaryContainer: string;
    onPrimaryContainer: string;
    secondaryContainer: string;
    onSecondaryContainer: string;
    tertiaryContainer: string;
    onTertiaryContainer: string;
    surfaceVariant: string;
    onSurfaceVariant: string;
    outline: string;
    outlineVariant: string;
  }
  interface PaletteOptions {
    surfaceContainerLowest?: string;
    surfaceContainerLow?: string;
    surfaceContainer?: string;
    surfaceContainerHigh?: string;
    surfaceContainerHighest?: string;
    primaryContainer?: string;
    onPrimaryContainer?: string;
    secondaryContainer?: string;
    onSecondaryContainer?: string;
    tertiaryContainer?: string;
    onTertiaryContainer?: string;
    surfaceVariant?: string;
    onSurfaceVariant?: string;
    outline?: string;
    outlineVariant?: string;
  }
}

// MD3 Baseline Dark Theme Colors
const md3DarkColors = {
  primary: '#D0BCFF',
  onPrimary: '#381E72',
  primaryContainer: '#4F378B',
  onPrimaryContainer: '#EADDFF',
  secondary: '#CCC2DC',
  onSecondary: '#332D41',
  secondaryContainer: '#4A4458',
  onSecondaryContainer: '#E8DEF8',
  tertiary: '#EFB8C8',
  onTertiary: '#492532',
  tertiaryContainer: '#633B48',
  onTertiaryContainer: '#FFD8E4',
  error: '#F2B8B5',
  onError: '#601410',
  errorContainer: '#8C1D18',
  onErrorContainer: '#F9DEDC',
  background: '#141218',
  onBackground: '#E6E0E9',
  surface: '#141218',
  onSurface: '#E6E0E9',
  surfaceVariant: '#49454F',
  onSurfaceVariant: '#CAC4D0',
  outline: '#938F99',
  outlineVariant: '#49454F',
  
  // MD3 Surface Containers (Dark)
  surfaceContainerLowest: '#0F0D13',
  surfaceContainerLow: '#1D1B20',
  surfaceContainer: '#211F26',
  surfaceContainerHigh: '#2B2930',
  surfaceContainerHighest: '#36343B',
};

export const md3Theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: md3DarkColors.primary,
      contrastText: md3DarkColors.onPrimary,
    },
    secondary: {
      main: md3DarkColors.secondary,
      contrastText: md3DarkColors.onSecondary,
    },
    error: {
      main: md3DarkColors.error,
      contrastText: md3DarkColors.onError,
    },
    background: {
      default: md3DarkColors.background,
      paper: md3DarkColors.surface,
    },
    text: {
      primary: md3DarkColors.onSurface,
      secondary: md3DarkColors.onSurfaceVariant,
    },
    divider: md3DarkColors.outlineVariant,
    
    // Custom MD3 Tokens
    surfaceContainerLowest: md3DarkColors.surfaceContainerLowest,
    surfaceContainerLow: md3DarkColors.surfaceContainerLow,
    surfaceContainer: md3DarkColors.surfaceContainer,
    surfaceContainerHigh: md3DarkColors.surfaceContainerHigh,
    surfaceContainerHighest: md3DarkColors.surfaceContainerHighest,
    primaryContainer: md3DarkColors.primaryContainer,
    onPrimaryContainer: md3DarkColors.onPrimaryContainer,
    secondaryContainer: md3DarkColors.secondaryContainer,
    onSecondaryContainer: md3DarkColors.onSecondaryContainer,
    tertiaryContainer: md3DarkColors.tertiaryContainer,
    onTertiaryContainer: md3DarkColors.onTertiaryContainer,
    surfaceVariant: md3DarkColors.surfaceVariant,
    onSurfaceVariant: md3DarkColors.onSurfaceVariant,
    outline: md3DarkColors.outline,
    outlineVariant: md3DarkColors.outlineVariant,
  },
  typography: {
    fontFamily: '"Roboto", "Inter", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '3.5rem', fontWeight: 400, lineHeight: 1.12, letterSpacing: '-0.25px' }, // Display Large
    h2: { fontSize: '2.8125rem', fontWeight: 400, lineHeight: 1.15, letterSpacing: '0px' },  // Display Medium
    h3: { fontSize: '2.25rem', fontWeight: 400, lineHeight: 1.22, letterSpacing: '0px' },   // Display Small
    h4: { fontSize: '2rem', fontWeight: 400, lineHeight: 1.25, letterSpacing: '0px' },      // Headline Large
    h5: { fontSize: '1.75rem', fontWeight: 400, lineHeight: 1.28, letterSpacing: '0px' },    // Headline Medium
    h6: { fontSize: '1.5rem', fontWeight: 400, lineHeight: 1.33, letterSpacing: '0px' },     // Headline Small
    subtitle1: { fontSize: '1.375rem', fontWeight: 400, lineHeight: 1.27, letterSpacing: '0px' }, // Title Large
    subtitle2: { fontSize: '1rem', fontWeight: 500, lineHeight: 1.5, letterSpacing: '0.15px' },   // Title Medium
    body1: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.5, letterSpacing: '0.5px' },        // Body Large
    body2: { fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.43, letterSpacing: '0.25px' },  // Body Medium
    button: { fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.43, letterSpacing: '0.1px', textTransform: 'none' }, // Label Large
    caption: { fontSize: '0.75rem', fontWeight: 500, lineHeight: 1.33, letterSpacing: '0.5px' },  // Label Medium
    overline: { fontSize: '0.6875rem', fontWeight: 500, lineHeight: 1.45, letterSpacing: '0.5px', textTransform: 'none' }, // Label Small
  },
  shape: {
    borderRadius: 16, // Default large radius for MD3
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 100, // Pill shape
          padding: '10px 24px',
          transition: 'all 0.2s ease-in-out',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 1px 3px 1px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.30)', // MD3 Elevation 1
          },
        },
        outlined: {
          borderColor: md3DarkColors.outline,
          color: md3DarkColors.primary,
          '&:hover': {
            backgroundColor: alpha(md3DarkColors.primary, 0.08),
            borderColor: md3DarkColors.outline,
          },
        },
        text: {
          color: md3DarkColors.primary,
          padding: '10px 12px',
          '&:hover': {
            backgroundColor: alpha(md3DarkColors.primary, 0.08),
          },
        },
      },
      variants: [
        {
          props: { variant: 'contained', color: 'primary' },
          style: {
            backgroundColor: md3DarkColors.primary,
            color: md3DarkColors.onPrimary,
            '&:hover': {
              backgroundColor: md3DarkColors.primary,
              backgroundImage: `linear-gradient(${alpha(md3DarkColors.onPrimary, 0.08)}, ${alpha(md3DarkColors.onPrimary, 0.08)})`,
            },
          },
        },
        {
          props: { variant: 'contained', color: 'secondary' },
          style: {
            backgroundColor: md3DarkColors.secondaryContainer,
            color: md3DarkColors.onSecondaryContainer,
            '&:hover': {
              backgroundColor: md3DarkColors.secondaryContainer,
              backgroundImage: `linear-gradient(${alpha(md3DarkColors.onSecondaryContainer, 0.08)}, ${alpha(md3DarkColors.onSecondaryContainer, 0.08)})`,
            },
          },
        },
      ],
    },
    MuiFab: {
      styleOverrides: {
        root: {
          borderRadius: 16, // Rounded rectangle shape in MD3
          boxShadow: '0px 1px 3px 1px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.30)', // MD3 Elevation 3
          textTransform: 'none',
          fontWeight: 500,
          '&:hover': {
            boxShadow: '0px 2px 6px 2px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.30)', // MD3 Elevation 4
          },
        },
      },
      variants: [
        {
          props: { color: 'primary' },
          style: {
            backgroundColor: md3DarkColors.primaryContainer,
            color: md3DarkColors.onPrimaryContainer,
            '&:hover': {
              backgroundColor: md3DarkColors.primaryContainer,
              backgroundImage: `linear-gradient(${alpha(md3DarkColors.onPrimaryContainer, 0.08)}, ${alpha(md3DarkColors.onPrimaryContainer, 0.08)})`,
            },
          },
        },
      ],
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: md3DarkColors.surfaceContainerLow,
          borderRadius: 24, // MD3 Medium or Large shape
          boxShadow: 'none',
          backgroundImage: 'none',
          border: `1px solid ${md3DarkColors.outlineVariant}`,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: md3DarkColors.surfaceContainer,
          borderRadius: 16,
        },
        elevation1: {
          boxShadow: 'none',
          backgroundColor: md3DarkColors.surfaceContainerLow,
        },
        elevation2: {
          boxShadow: 'none',
          backgroundColor: md3DarkColors.surfaceContainer,
        },
        elevation3: {
          boxShadow: 'none',
          backgroundColor: md3DarkColors.surfaceContainerHigh,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8, // MD3 standard chip rounding
          height: 32,
          fontWeight: 500,
        },
        filled: {
          backgroundColor: md3DarkColors.surfaceContainerHigh,
          color: md3DarkColors.onSurface,
          '&:hover': {
            backgroundColor: md3DarkColors.surfaceContainerHighest,
          },
        },
        outlined: {
          borderColor: md3DarkColors.outline,
          color: md3DarkColors.onSurface,
          '&:hover': {
            backgroundColor: alpha(md3DarkColors.onSurface, 0.08),
          },
        },
      },
      variants: [
        {
          props: { color: 'primary' },
          style: {
            backgroundColor: md3DarkColors.primaryContainer,
            color: md3DarkColors.onPrimaryContainer,
            '&:hover': {
              backgroundColor: md3DarkColors.primaryContainer,
              backgroundImage: `linear-gradient(${alpha(md3DarkColors.onPrimaryContainer, 0.08)}, ${alpha(md3DarkColors.onPrimaryContainer, 0.08)})`,
            },
          },
        },
      ],
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          color: md3DarkColors.primary,
          height: 4, // MD3 track is 4dp
        },
        thumb: {
          height: 20, // MD3 thumb
          width: 20,
          backgroundColor: md3DarkColors.primary,
          '&:hover, &.Mui-focusVisible': {
            boxShadow: `0px 0px 0px 10px ${alpha(md3DarkColors.primary, 0.16)}`, // MD3 state layer
          },
          '&.Mui-active': {
            boxShadow: `0px 0px 0px 14px ${alpha(md3DarkColors.primary, 0.24)}`,
          },
        },
        track: {
          height: 4,
          border: 'none',
        },
        rail: {
          height: 4,
          backgroundColor: md3DarkColors.surfaceVariant,
          opacity: 1,
        },
      },
    },
  },
});
