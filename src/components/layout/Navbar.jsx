import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  Bot,
  ChevronRight,
  CloudSun,
  GraduationCap,
  House,
  Menu,
  ScanSearch,
  ShoppingBag,
  Sprout,
  UserRound,
  Wallet,
  X,
} from 'lucide-react';

import logo1 from '../../assets/logo/logo1.png';
import '../../css/Navbar.css';

const navItems = [
  {
    id: 'home',
    label: 'Beranda',
    path: '/dashboard',
    icon: House,
  },
  {
    id: 'farm',
    label: 'Smart Farming',
    bottomLabel: 'Kebun',
    path: '/smart-farming',
    icon: Sprout,
  },
  {
    id: 'academy',
    label: 'Belajar',
    path: '/academy',
    icon: GraduationCap,
  },
  {
    id: 'diagnosis',
    label: 'Skrining',
    path: '/diagnosis',
    icon: ScanSearch,
  },
  {
    id: 'erp',
    label: 'AgroERP',
    bottomLabel: 'ERP',
    path: '/agro-erp',
    icon: Wallet,
  },
  {
    id: 'marketplace',
    label: 'Pasar',
    path: '/marketplace',
    icon: ShoppingBag,
  },
  {
    id: 'assistant',
    label: 'Asisten AI',
    path: '/assistant',
    icon: Bot,
  },
  {
    id: 'climate',
    label: 'AgroClimate',
    path: '/weather',
    icon: CloudSun,
  },
  {
    id: 'profile',
    label: 'Profil',
    path: '/profile',
    icon: UserRound,
  },
];

const bottomNavIds = [
  'home',
  'farm',
  'erp',
  'marketplace',
  'profile',
];

const bottomNavItems = bottomNavIds
  .map((id) => navItems.find((item) => item.id === id))
  .filter(Boolean);

const normalizePath = (path) =>
  path.replace(/\/+$/, '') || '/';

export default function Navbar({ active: activeProp }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);

  const currentPath = normalizePath(location.pathname);

  const activeItem = navItems.find(
    (item) => normalizePath(item.path) === currentPath
  );

  const activeId =
    activeItem?.id ??
    activeProp ??
    (currentPath === '/' ? 'home' : null);

  const handleNavigate = (path) => {
    setMenuOpen(false);

    const targetPath = normalizePath(path);

    if (currentPath !== targetPath) {
      navigate(path);
    }
  };

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('keydown', handleEscape);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const mobileMenuItems = navItems.filter(
    (item) => !bottomNavIds.includes(item.id)
  );

  return (
    <>
      {/* =========================
          HEADER
      ========================== */}
      <header className="tw-navbar ">
        <div className="tw-navbar-inner">

          {/* BRAND */}
          <button
            type="button"
            className="tw-brand"
            onClick={() => handleNavigate('/dashboard')}
            aria-label="TANIWAVE, buka dashboard"
          >
            <span className="tw-brand-icon">
              <img
                src={logo1}
                alt="TANIWAVE"
              />
            </span>

            <span className="tw-brand-name">
              TANI<span>WAVE</span>
            </span>
          </button>

          {/* =========================
              DESKTOP NAVIGATION
          ========================== */}
          <nav
            className="tw-desktop-nav"
            aria-label="Navigasi utama"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeId === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  className={`tw-nav-link ${
                    isActive ? 'active' : ''
                  }`}
                  onClick={() => handleNavigate(item.path)}
                  aria-current={
                    isActive ? 'page' : undefined
                  }
                >
                  <Icon
                    size={16}
                    strokeWidth={1.9}
                  />

                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* =========================
              MOBILE MENU TOGGLE
          ========================== */}
          <button
            type="button"
            className={`tw-menu-toggle ${
              menuOpen ? 'active' : ''
            }`}
            onClick={() =>
              setMenuOpen((previous) => !previous)
            }
            aria-label={
              menuOpen ? 'Tutup menu' : 'Buka menu'
            }
            aria-expanded={menuOpen}
            aria-controls="tw-mobile-menu"
          >
            {menuOpen ? (
              <X size={21} />
            ) : (
              <Menu size={21} />
            )}
          </button>
        </div>
      </header>

      {/* =========================
          MOBILE DROPDOWN
      ========================== */}
      {menuOpen && (
        <>
          <button
            type="button"
            className="tw-menu-backdrop"
            onClick={() => setMenuOpen(false)}
            aria-label="Tutup menu navigasi"
          />

          <nav
            id="tw-mobile-menu"
            className="tw-mobile-menu"
            aria-label="Menu tambahan"
          >
            {/* MOBILE MENU HEADER */}
            <div className="tw-mobile-menu-header">
              <div>
                <span className="tw-mobile-eyebrow">
                  TANIWAVE
                </span>

                <strong>
                  Jelajahi fitur
                </strong>
              </div>

              <button
                type="button"
                className="tw-mobile-close"
                onClick={() => setMenuOpen(false)}
                aria-label="Tutup menu"
              >
                <X size={19} />
              </button>
            </div>

            {/* MOBILE MENU LINKS */}
            <div className="tw-mobile-links">
              {mobileMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeId === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`tw-mobile-link ${
                      isActive ? 'active' : ''
                    }`}
                    onClick={() =>
                      handleNavigate(item.path)
                    }
                    aria-current={
                      isActive ? 'page' : undefined
                    }
                  >
                    <span className="tw-mobile-link-icon">
                      <Icon size={18} />
                    </span>

                    <span className="tw-mobile-link-label">
                      {item.label}
                    </span>

                    <ChevronRight size={16} />
                  </button>
                );
              })}
            </div>

            {/* MOBILE MENU FOOTER */}
            <div className="tw-mobile-menu-footer">
              <Sprout size={16} />

              <span>
                Mulai dari kebunmu.
              </span>
            </div>
          </nav>
        </>
      )}

      {/* =========================
          MOBILE BOTTOM NAVIGATION
      ========================== */}
      <nav
        className="tw-bottom-nav"
        aria-label="Navigasi bawah"
      >
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeId === item.id;

          return (
            <button
              key={item.id}
              type="button"
              className={`tw-bottom-link ${
                isActive ? 'active' : ''
              }`}
              onClick={() =>
                handleNavigate(item.path)
              }
              aria-current={
                isActive ? 'page' : undefined
              }
              aria-label={item.label}
            >
              <span className="tw-bottom-icon">
                <Icon
                  size={23}
                  strokeWidth={
                    isActive ? 2.1 : 1.7
                  }
                />
              </span>

              <span className="tw-bottom-label">
                {item.bottomLabel ?? item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}