import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import { AppShell, Button, Container, Group, Paper, Pill, Stack, Text, Title } from '@mantine/core'
import { ToastProvider } from './contexts/ToastContext'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import Cranes from './pages/Cranes'
import CraneDetail from './pages/CraneDetail'
import Trucks from './pages/Trucks'
import TruckDetail from './pages/TruckDetail'
import Inventory from './pages/Inventory'
import CraneConfigs from './pages/CraneConfigs'

const NAV_LINKS = [
  { label: 'Projeler', path: '/projects' },
  { label: 'Vinçler', path: '/cranes' },
  { label: 'Konfigüratör', path: '/configurator' },
  { label: 'Çekici Dorseler', path: '/trucks' },
  { label: 'Envanter', path: '/inventory' },
]

function Navbar() {
  const location = useLocation()

  const isActive = (path: string) => {
    if (path === '/projects') {
      return location.pathname === path || location.pathname.startsWith('/projects/')
    }
    if (path === '/cranes') {
      return location.pathname === path || location.pathname.startsWith('/cranes/')
    }
    if (path === '/trucks') {
      return location.pathname === path || location.pathname.startsWith('/trucks/')
    }
    return location.pathname === path
  }

  return (
    <Paper shadow="md" radius="lg" withBorder p="lg" h="100%" style={{ background: 'rgba(255,255,255,0.92)' }}>
      <Container size="xl">
        <Group justify="space-between" align="flex-start">
          <Stack gap={4}>
            <Pill.Group>
              <Pill color="accent.5" size="sm">
                AYDINTAŞ
              </Pill>
            </Pill.Group>
            <Title order={2} fw={600}>
              Vinç & Çekici / Dorse Operasyon Yönetimi
            </Title>
            <Text size="sm" c="dimmed">
              Operasyonlarınızı tek merkezden yönetin, planlayın ve raporlayın.
            </Text>
          </Stack>
          <Group gap="xs" wrap="wrap">
            {NAV_LINKS.map((item) => (
              <Button
                key={item.path}
                component={Link}
                to={item.path}
                variant={isActive(item.path) ? 'filled' : 'light'}
                color={isActive(item.path) ? 'brand' : 'gray'}
                radius="xl"
                size="sm"
              >
                {item.label}
              </Button>
            ))}
          </Group>
        </Group>
      </Container>
    </Paper>
  )
}

function App() {
  return (
    <ToastProvider>
      <Router>
        <AppShell
          padding="xl"
          header={{ height: 160 }}
          withBorder={false}
          styles={{
            main: {
              background: 'linear-gradient(180deg, #f6f8fb 0%, #eef2f9 100%)',
            },
          }}
        >
          <AppShell.Header style={{ background: 'transparent', borderBottom: 'none' }}>
            <Navbar />
          </AppShell.Header>
          <AppShell.Main>
            <Container size="xl" py="xl">
              <Routes>
                <Route path="/" element={<Navigate to="/projects" replace />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/:id" element={<ProjectDetail />} />
                <Route path="/cranes" element={<Cranes />} />
                <Route path="/cranes/:id" element={<CraneDetail />} />
                <Route path="/configurator" element={<CraneConfigs />} />
                <Route path="/trucks" element={<Trucks />} />
                <Route path="/trucks/:id" element={<TruckDetail />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="*" element={<Navigate to="/projects" replace />} />
              </Routes>
            </Container>
          </AppShell.Main>
        </AppShell>
      </Router>
    </ToastProvider>
  )
}

export default App

