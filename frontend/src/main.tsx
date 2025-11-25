import React from 'react'
import ReactDOM from 'react-dom/client'
import { MantineProvider, createTheme } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import App from './App'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import './index.css'

const theme = createTheme({
  primaryColor: 'brand',
  defaultRadius: 'md',
  fontFamily: 'Inter, "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  headings: {
    fontFamily: 'Space Grotesk, "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    fontWeight: '600',
  },
  colors: {
    brand: ['#eaf1ff', '#d6e4ff', '#afc6ff', '#85a8ff', '#5f8cff', '#3f74ff', '#2a66ff', '#1c57e0', '#1347b4', '#0b3284'],
    accent: ['#f4f0ff', '#e8dfff', '#d1bfff', '#b99fff', '#a17fff', '#8a5fff', '#6a5be8', '#4d3fb4', '#3a2f84', '#271c66'],
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="light">
      <Notifications position="top-right" zIndex={2100} />
      <App />
    </MantineProvider>
  </React.StrictMode>,
)

