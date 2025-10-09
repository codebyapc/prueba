import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout, Typography } from 'antd';
import RoomList from './components/RoomList';
import RoomForm from './components/RoomForm';
import BookingForm from './components/BookingForm';
import Navigation from './components/Navigation';
import './App.css';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

function App() {
  return (
    <Layout className="layout" style={{ minHeight: '100vh' }}>
      <Header>
        <div className="logo" />
        <Navigation />
      </Header>
      <Content style={{ padding: '0 50px' }}>
        <div className="site-layout-content" style={{ padding: 24, minHeight: 280 }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
            Gestión de Salas y Centros
          </Title>
          <Routes>
            <Route path="/" element={<RoomList />} />
            <Route path="/rooms/new" element={<RoomForm />} />
            <Route path="/rooms/:id/edit" element={<RoomForm />} />
            <Route path="/bookings/new" element={<BookingForm />} />
            <Route path="/bookings/:id/edit" element={<BookingForm />} />
          </Routes>
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        Gestión de Salas ©{new Date().getFullYear()} - CodebyAPC
      </Footer>
    </Layout>
  );
}

export default App;