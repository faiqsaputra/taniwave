import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';

import Landing from '../pages/Landing';
import Dashboard from '../pages/Dashboard';
import SmartFarming from '../pages/SmartFarming';
import AgroERP from '../pages/AgroERP';
import AgroMarket from '../pages/AgroMarket';
import Assistant from '../pages/Assistant';
import Academy from '../pages/Academy';
import Navbar from '../components/layout/Navbar';

function FeaturePlaceholder({ active, title, description }) {
  const navigate = useNavigate();

  return (
    <>
      <Navbar active={active} />

      <main
        style={{
          minHeight: 'calc(100vh - 70px)',
          padding: 'clamp(20px, 5vw, 56px)',
          backgroundColor: '#FFF9F1',
          color: '#17202A',
        }}
      >
        <section
          style={{
            maxWidth: '720px',
            margin: '48px auto',
            padding: 'clamp(24px, 5vw, 40px)',
            border: '1px solid #E9DED0',
            borderRadius: '24px',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 12px 32px rgba(23, 50, 77, 0.06)',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              marginBottom: '16px',
              color: '#D85C38',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '1.5px',
            }}
          >
            TANIWAVE · FITUR
          </span>

          <h1
            style={{
              margin: '0 0 12px',
              color: '#17324D',
              fontSize: 'clamp(26px, 5vw, 36px)',
              lineHeight: 1.2,
            }}
          >
            {title}
          </h1>

          <p
            style={{
              margin: '0 0 24px',
              color: '#7C817F',
              fontSize: '14px',
              lineHeight: 1.8,
            }}
          >
            {description}
          </p>

          <div
            style={{
              padding: '16px',
              marginBottom: '24px',
              borderRadius: '14px',
              backgroundColor: '#FFF9F1',
              fontSize: '13px',
              lineHeight: 1.7,
            }}
          >
            Halaman ini masih dalam tahap pengembangan.
            Navigasi sudah tersedia dan konten fitur dapat
            ditambahkan secara bertahap.
          </div>

          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px 20px',
              border: 'none',
              borderRadius: '12px',
              backgroundColor: '#D85C38',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Kembali ke Dashboard
          </button>
        </section>
      </main>
    </>
  );
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* HALAMAN UTAMA */}
        <Route path="/" element={<Landing />} />

        {/* DASHBOARD */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* SMART ACADEMY · FARM QUEST */}
        <Route
          path="/academy"
          element={<Academy />}
        />

        {/* SMART FARMING */}
        <Route
          path="/smart-farming"
          element={<SmartFarming initialTab="overview" />}
        />

        {/* SKRINING TANAMAN */}
        <Route
          path="/diagnosis"
          element={
            <SmartFarming
              key="smart-farming-diagnosis"
              initialTab="screening"
            />
          }
        />

        {/* AGRO MARKET */}
        <Route
          path="/marketplace"
          element={<AgroMarket />}
        />

        <Route path="/agro-erp" element={<AgroERP />} />

        {/* AI ASSISTANT */}
        <Route
          path="/assistant"
          element={<Assistant />}
        />

        {/* AGROCLIMATE */}
        <Route
          path="/weather"
          element={
            <FeaturePlaceholder
              active="climate"
              title="AgroClimate"
              description="Pelajari kondisi cuaca dan gunakan informasi iklim sebagai pertimbangan aktivitas pertanian."
            />
          }
        />

        {/* PROFIL */}
        <Route
          path="/profile"
          element={
            <FeaturePlaceholder
              active="profile"
              title="Profil Saya"
              description="Kelola informasi profil dan preferensi akun TANIWAVE."
            />
          }
        />

        {/* ROUTE TIDAK DIKENAL */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}