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
  Sparkles,
} from 'lucide-react';

import logo1 from '../../assets/logo/logo1.png';
import '../../css/Navbar.css';

const navItems = [
  { id: 'home', label: 'Beranda', path: '/dashboard', icon: House },
  { id: 'farm', label: 'Smart Farming', bottomLabel: 'Kebun', path: '/smart-farming', icon: Sprout },
  { id: 'academy', label: 'Belajar', path: '/academy', icon: GraduationCap },
  { id: 'diagnosis', label: 'Skrining', path: '/diagnosis', icon: ScanSearch },
  { id: 'erp', label: 'AgroERP', bottomLabel: 'ERP', path: '/agro-erp', icon: Wallet },
  { id: 'marketplace', label: 'Pasar', path: '/marketplace', icon: ShoppingBag },
  { id: 'assistant', label: 'Asisten AI', path: '/assistant', icon: Bot },
  { id: 'climate', label: 'AgroClimate', path: '/weather', icon: CloudSun },
  { id: 'profile', label: 'Profil', path: '/profile', icon: UserRound },
];

const bottomNavIds = ['home', 'farm', 'erp', 'marketplace', 'profile'];

const bottomNavItems = bottomNavIds
  .map((id) => navItems.find((item) => item.id === id))
  .filter(Boolean);

const normalizePath = (path) => path.replace(/\/+$/, '') || '/';

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

    if (currentPath !== normalizePath(path)) {
      navigate(path);
    }
  };

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    const handleResize = () => {
      if (window.innerWidth > 1024) setMenuOpen(false);
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
      {/* DESKTOP & MOBILE HEADER */}
      <header className="tw-navbar">
        <div className="tw-navbar-inner">

          <button
            type="button"
            className="tw-brand"
            onClick={() => handleNavigate('/dashboard')}
            aria-label="TANIWAVE Dashboard"
          >
            <span className="tw-brand-icon">
              <img src={logo1} alt="" />
            </span>

            <span className="tw-brand-content">
              <span className="tw-brand-name">
                TANI<span>WAVE</span>
              </span>
              <span className="tw-brand-caption">
                Grow Beyond Limits
              </span>
            </span>
          </button>

          {/* DESKTOP NAVIGATION */}
          <nav className="tw-desktop-nav" aria-label="Navigasi utama">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeId === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  className={`tw-nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => handleNavigate(item.path)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon size={17} strokeWidth={1.9} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* MOBILE MENU BUTTON */}
          <button
            type="button"
            className={`tw-menu-toggle ${menuOpen ? 'active' : ''}`}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={menuOpen}
            aria-controls="tw-mobile-menu"
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      <div
        className={`tw-mobile-overlay ${menuOpen ? 'show' : ''}`}
        aria-hidden={!menuOpen}
        onClick={() => setMenuOpen(false)}
      />

      <aside
        id="tw-mobile-menu"
        className={`tw-mobile-menu ${menuOpen ? 'open' : ''}`}
        aria-label="Menu tambahan"
        aria-hidden={!menuOpen}
        inert={!menuOpen}
      >
        <div className="tw-mobile-menu-header">
          <div className="tw-drawer-brand">
            <span className="tw-drawer-logo">
              <img src={logo1} alt="" />
            </span>

            <div>
              <strong>TANIWAVE</strong>
              <span>Explore your agriculture</span>
            </div>
          </div>

          <button
            type="button"
            className="tw-mobile-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Tutup menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="tw-drawer-intro">
          <span className="tw-drawer-eyebrow">
            <Sparkles size={13} />
            YOUR AGRICULTURE SPACE
          </span>

          <h3>Jelajahi fitur TANIWAVE</h3>
          <p>Semua kebutuhan pertanian dalam satu ruang.</p>
        </div>

        <div className="tw-mobile-links">
          <span className="tw-menu-section-label">
            FITUR LAINNYA
          </span>

          {mobileMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeId === item.id;

            return (
              <button
                key={item.id}
                type="button"
                className={`tw-mobile-link ${isActive ? 'active' : ''}`}
                onClick={() => handleNavigate(item.path)}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="tw-mobile-link-icon">
                  <Icon size={19} strokeWidth={1.8} />
                </span>

                <span className="tw-mobile-link-label">
                  {item.label}
                </span>

                <ChevronRight size={17} className="tw-mobile-chevron" />
              </button>
            );
          })}
        </div>

        <div className="tw-mobile-menu-footer">
          <span className="tw-footer-icon">
            <Sprout size={19} />
          </span>

          <div>
            <strong>Grow your future.</strong>
            <span>Mulai dari kebunmu.</span>
          </div>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="tw-bottom-nav" aria-label="Navigasi bawah">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeId === item.id;

          return (
            <button
              key={item.id}
              type="button"
              className={`tw-bottom-link ${isActive ? 'active' : ''}`}
              onClick={() => handleNavigate(item.path)}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.label}
            >
              <span className="tw-bottom-icon">
                <Icon
                  size={21}
                  strokeWidth={isActive ? 2.3 : 1.8}
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
