import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import './index.css'
import App from './App.tsx'

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#D0BCFF',
      contrastText: '#381E72',
    },
    secondary: {
      main: '#CCC2DC',
      contrastText: '#332D41',
    },
    background: {
      default: '#141218',
      paper: '#211F26', // surface-container
    },
    text: {
      primary: '#E6E0E9', // on-surface
      secondary: '#CAC4D0', // on-surface-variant
    },
    divider: '#49454F', // outline-variant
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 16, // md-sys-shape-corner-large
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 20, // md3 standard pill shape
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
)
