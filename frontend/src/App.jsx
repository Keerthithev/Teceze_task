import React from 'react'
import './index.css'
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom'
import { ConfigProvider, Layout, Menu, Button, Drawer, Grid } from 'antd'
import { CalculatorOutlined } from '@ant-design/icons'
import Calculator from './pages/Calculator.jsx'
import About from './pages/About.jsx'

function App() {
  return (
    <BrowserRouter>
      <ConfigProvider theme={{
        token: {
          // Brand palette: Teal primary, clean light surface like the screenshot
          colorPrimary: '#12B5A6',
          colorInfo: '#12B5A6',
          linkColor: '#12B5A6',
          colorTextHeading: '#103B6F',
          colorText: '#0F2748',
          borderRadius: 10,
          colorBgLayout: '#F5FAFF',
          fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif'
        }
      }}>
        <Layout style={{ minHeight: '100vh' }}>
          <ResponsiveHeader />
          <Layout.Content style={{ padding: 16, background: '#F7FAFC' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
              <Routes>
                <Route path="/calculator" element={<Calculator />} />
                <Route path="/about" element={<About />} />
                <Route path="*" element={<Navigate to="/calculator" replace />} />
              </Routes>
            </div>
          </Layout.Content>
          <Layout.Footer style={{ background: '#FFFFFF', borderTop: '1px solid #E6EEF5', padding: '12px 20px', textAlign: 'center', color: '#0F2748' }}>
            Developed by <b>Keerthigan Thevarasa</b>
          </Layout.Footer>
        </Layout>
      </ConfigProvider>
    </BrowserRouter>
  )
}

export default App

function ResponsiveHeader() {
  const screens = Grid.useBreakpoint()
  const [open, setOpen] = React.useState(false)
  const isMobile = !screens.md
  return (
    <Layout.Header style={{ background: '#FFFFFF', paddingInline: 16, display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #E6EEF5', position: 'sticky', top: 0, zIndex: 100 }}>
      <img src="/logo.jpeg" alt="TECEZE" style={{ height: 30, objectFit: 'contain' }} />
      <div style={{ color: '#103B6F', fontWeight: 800, flex: 1, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Price Book Calculator</div>
      {isMobile ? (
        <>
          <Button type="text" onClick={() => setOpen(true)} style={{ color: '#103B6F', fontSize: 22 }} aria-label="Open menu">⋯</Button>
          <Drawer
            placement="right"
            open={open}
            onClose={() => setOpen(false)}
            title="Menu"
            closable
            maskClosable
            bodyStyle={{ padding: 0 }}
          >
            <Menu mode="inline" selectable={false} onClick={() => setOpen(false)} style={{ borderRight: 0 }}>
              <Menu.Item key="calculator" icon={<CalculatorOutlined />}>
                <Link to="/calculator">Calculator</Link>
              </Menu.Item>
              <Menu.Item key="about">
                <Link to="/about">About</Link>
              </Menu.Item>
            </Menu>
          </Drawer>
        </>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Button type="primary"><Link to="/calculator" style={{ color: 'white' }}>Calculator</Link></Button>
          <Button type="primary"><Link to="/about" style={{ color: 'white' }}>About</Link></Button>
        </div>
      )}
    </Layout.Header>
  )
}
