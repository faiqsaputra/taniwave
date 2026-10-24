import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  CloudRain,
  Droplets,
  MapPin,
  Sprout,
  TrendingDown,
  TrendingUp,
  Wind,
  X,
} from 'lucide-react';

import Navbar from '../components/layout/Navbar';
import '../css/Dashboard.css';

/* =========================================
   DATA DEMO
========================================= */

const commodities = [
  {
    name: 'Cabai',
    price: 'Rp48.500',
    change: '+8,4%',
    trend: 'up',
    icon: '🌶️',
  },
  {
    name: 'Tomat',
    price: 'Rp12.800',
    change: '-2,1%',
    trend: 'down',
    icon: '🍅',
  },
  {
    name: 'Bawang',
    price: 'Rp34.200',
    change: '+4,7%',
    trend: 'up',
    icon: '🧅',
  },
  {
    name: 'Jagung',
    price: 'Rp8.900',
    change: '+1,8%',
    trend: 'up',
    icon: '🌽',
  },
];

const forecasts = [
  {
    temp: '31°',
    rain: 20,
    icon: '☀️',
    condition: 'Cerah',
    recommendation: 'Periksa kondisi tanaman pada pagi hari.',
  },
  {
    temp: '30°',
    rain: 45,
    icon: '🌤️',
    condition: 'Cerah berawan',
    recommendation: 'Periksa kelembapan tanah sebelum menyiram.',
  },
  {
    temp: '29°',
    rain: 70,
    icon: '🌧️',
    condition: 'Berpotensi hujan',
    recommendation: 'Perhatikan drainase dan hindari penyemprotan saat hujan.',
  },
  {
    temp: '30°',
    rain: 35,
    icon: '🌤️',
    condition: 'Cerah berawan',
    recommendation: 'Lanjutkan pemeriksaan rutin tanaman.',
  },
  {
    temp: '32°',
    rain: 15,
    icon: '☀️',
    condition: 'Cerah',
    recommendation: 'Perhatikan kebutuhan air saat suhu meningkat.',
  },
  {
    temp: '31°',
    rain: 25,
    icon: '☀️',
    condition: 'Cerah',
    recommendation: 'Periksa kondisi daun dan kelembapan tanah.',
  },
  {
    temp: '30°',
    rain: 50,
    icon: '🌦️',
    condition: 'Berpotensi hujan',
    recommendation: 'Pantau perubahan cuaca sebelum melakukan perawatan.',
  },
];

const pulseItems = [
  {
    type: 'weather',
    icon: CloudRain,
    title: 'Cuaca',
    text: 'Potensi hujan meningkat besok.',
    action: 'Lihat prakiraan',
    path: '/weather',
  },
  {
    type: 'farm',
    icon: Sprout,
    title: 'Tanaman',
    text: 'Pengamatan kebun belum diperbarui.',
    action: 'Periksa tanaman',
    path: '/diagnosis',
  },
  {
    type: 'market',
    icon: TrendingUp,
    title: 'Pasar',
    text: 'Ada permintaan cabai yang sesuai.',
    action: 'Lihat peluang',
    path: '/marketplace',
  },
];

/* =========================================
   HELPER TANGGAL
========================================= */

function getDateAtOffset(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);

  return date;
}

function getForecastDay(offset) {
  if (offset === 0) return 'Hari ini';
  if (offset === 1) return 'Besok';

  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'short',
  }).format(getDateAtOffset(offset));
}

function getForecastDate(offset) {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(getDateAtOffset(offset));
}

/* =========================================
   DASHBOARD
========================================= */

function Dashboard() {
  const navigate = useNavigate();

  const [activeForecast, setActiveForecast] = useState(0);
  const [showPulse, setShowPulse] = useState(false);
  const [dialog, setDialog] = useState(null);

  const [farmObserved, setFarmObserved] = useState(false);
  const [practiceStatus, setPracticeStatus] = useState('idle');

  const selectedForecast = forecasts[activeForecast];

  /*
   * Tutup dialog menggunakan tombol Escape.
   */
  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        setShowPulse(false);
        setDialog(null);
      }
    }

    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, []);

  /*
   * Satu fungsi untuk navigasi semua fitur.
   */
  function goTo(path) {
    setShowPulse(false);
    setDialog(null);

    navigate(path);
  }

  /*
   * Satu modal untuk detail komoditas,
   * perkembangan kebun, dan praktik.
   */
  function openDialog(type, commodity = null) {
    setDialog({
      type,
      commodity,
    });
  }

  /*
   * Aksi utama dari modal.
   */
  function handleDialogAction() {
    if (!dialog) return;

    if (dialog.type === 'commodity') {
      goTo('/marketplace');
      return;
    }

    if (dialog.type === 'farm') {
      setFarmObserved(true);
      setDialog(null);
      return;
    }

    if (dialog.type === 'practice') {
      setPracticeStatus((current) => {
        if (current === 'idle') return 'started';
        if (current === 'started') return 'completed';

        return 'started';
      });

      setDialog(null);
    }
  }

  /*
   * Isi modal ditentukan berdasarkan jenis aksi.
   */
  const dialogContent = !dialog
    ? null
    : dialog.type === 'commodity'
      ? {
          kicker: 'MARKETWATCH',
          title: `Harga ${dialog.commodity.name}`,
          description:
            'Informasi berikut merupakan data simulasi untuk demonstrasi prototipe.',
          actionLabel: 'Lihat pasar',
          details: [
            {
              label: 'Harga demo',
              value: dialog.commodity.price,
            },
            {
              label: 'Perubahan',
              value: dialog.commodity.change,
            },
            {
              label: 'Tren',
              value:
                dialog.commodity.trend === 'up'
                  ? 'Cenderung naik'
                  : 'Cenderung turun',
            },
          ],
        }
      : dialog.type === 'farm'
        ? {
            kicker: 'FARMPROGRESS',
            title: 'Perkembangan kebun cabai',
            description:
              'Periksa kembali catatan kebun dan tandai pengamatan setelah pemeriksaan selesai.',
            actionLabel: farmObserved
              ? 'Perbarui pengamatan'
              : 'Tandai pengamatan selesai',
            details: [
              {
                label: 'Umur tanaman',
                value: '42 hari',
              },
              {
                label: 'Progres demo',
                value: '80%',
              },
              {
                label: 'Estimasi panen',
                value: '±18 hari',
              },
            ],
          }
        : {
            kicker: 'NEXT STEP',
            title:
              practiceStatus === 'idle'
                ? 'Mulai praktik menanam'
                : practiceStatus === 'started'
                  ? 'Praktik sedang berjalan'
                  : 'Praktik selesai',
            description:
              practiceStatus === 'idle'
                ? 'Simulasikan langkah awal praktik menanam menggunakan tiga polybag.'
                : practiceStatus === 'started'
                  ? 'Siapkan perlengkapan dan lakukan praktik. Tandai selesai setelah latihan dilakukan.'
                  : 'Praktik telah ditandai selesai pada sesi demo ini. Kamu bisa mengulangi latihan.',
            actionLabel:
              practiceStatus === 'idle'
                ? 'Mulai praktik'
                : practiceStatus === 'started'
                  ? 'Tandai selesai'
                  : 'Ulangi praktik',
            details: [
              {
                label: 'Langkah 1',
                value: 'Siapkan 3 polybag',
              },
              {
                label: 'Langkah 2',
                value: 'Siapkan media tanam',
              },
              {
                label: 'Langkah 3',
                value: 'Tanam dan catat perkembangan',
              },
            ],
          };

  return (
    <main className="dashboard mt-10">
      {/* NAVBAR */}
      <Navbar active="home" />

      <div className="dashboard-shell ">
        {/* GREETING */}
        <section className="greeting-section">
          <div>
            <p className="location-label">
              <MapPin size={13} />
              Bangsri, Jepara
            </p>

            <h1>
              Halo, Faqih
              <span>👋</span>
            </h1>

            <p className="greeting-subtitle">
              Siap melihat perkembangan kebunmu hari ini?
            </p>
          </div>

          <button
            type="button"
            className="profile-avatar"
            onClick={() => goTo('/profile')}
            aria-label="Buka profil pengguna"
          >
            F
          </button>
        </section>

        {/* =================================
            TANI PULSE
        ================================= */}

        <section className="pulse-section">
          <div className="section-heading">
            <div>
              <span className="section-kicker">TANI PULSE</span>
              <h2>Ada yang perlu kamu tahu.</h2>
            </div>

            <button
              type="button"
              className="text-button"
              onClick={() => setShowPulse(true)}
              aria-label="Lihat semua informasi Tani Pulse"
            >
              Semua
              <ChevronRight size={15} />
            </button>
          </div>

          <div className="pulse-main">
            <div className="pulse-count">
              <span>{pulseItems.length}</span>
              <small>
                hal penting
                <br />
                hari ini
              </small>
            </div>

            <div className="pulse-line" />

            <div className="pulse-summary">
              <strong>Perhatikan kebunmu</strong>

              <p>
                Cuaca, kondisi tanaman, dan peluang pasar
                sedang berubah.
              </p>
            </div>
          </div>

          <div className="pulse-list">
            {pulseItems.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  type="button"
                  className={`pulse-item pulse-${item.type}`}
                  key={item.type}
                  onClick={() => goTo(item.path)}
                  aria-label={`${item.title}: ${item.action}`}
                >
                  <div className="pulse-icon">
                    <Icon size={18} />
                  </div>

                  <div className="pulse-content">
                    <strong>{item.title}</strong>
                    <p>{item.text}</p>
                  </div>

                  <ChevronRight size={17} />
                </button>
              );
            })}
          </div>
        </section>

        {/* =================================
            AGROCLIMATE
        ================================= */}

        <section className="climate-section">
          <div className="section-heading">
            <div>
              <span className="section-kicker">AGROCLIMATE</span>
              <h2>Kondisi hari ini</h2>
            </div>

            <button
              type="button"
              className="round-arrow"
              onClick={() => goTo('/weather')}
              aria-label="Buka AgroClimate"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Cuaca sekarang: data demo */}
          <div className="weather-hero">
            <div className="weather-main">
              <div>
                <span className="weather-label">Sekarang</span>

                <div className="temperature">
                  31<span>°</span>
                </div>

                <p>Cerah berawan</p>
              </div>

              <div className="weather-illustration">
                <div className="sun-shape" />
                <CloudRain size={54} strokeWidth={1.2} />
              </div>
            </div>

            <div className="weather-details">
              <div>
                <Droplets size={16} />

                <span>
                  Kelembapan
                  <strong>78%</strong>
                </span>
              </div>

              <div>
                <Wind size={16} />

                <span>
                  Angin
                  <strong>7 m/s</strong>
                </span>
              </div>

              <div>
                <CloudRain size={16} />

                <span>
                  Hujan
                  <strong>60%</strong>
                </span>
              </div>
            </div>
          </div>

          {/* PRAKIRAAN */}
          <div className="forecast-wrapper">
            <div className="forecast-header">
              <span>Prakiraan 7 hari</span>
              <span>{getForecastDate(activeForecast)}</span>
            </div>

            <div className="forecast-list">
              {forecasts.map((forecast, index) => (
                <button
                  type="button"
                  key={getForecastDate(index)}
                  className={`forecast-item ${
                    activeForecast === index ? 'active' : ''
                  }`}
                  onClick={() => setActiveForecast(index)}
                  aria-pressed={activeForecast === index}
                  aria-label={`${getForecastDay(index)}, suhu ${forecast.temp}, peluang hujan ${forecast.rain}%`}
                >
                  <span className="forecast-day">
                    {getForecastDay(index)}
                  </span>

                  <span className="forecast-icon">
                    {forecast.icon}
                  </span>

                  <strong>{forecast.temp}</strong>

                  <small>
                    <Droplets size={10} />
                    {forecast.rain}%
                  </small>
                </button>
              ))}
            </div>
          </div>

          {/* REKOMENDASI BERDASARKAN PRAKIRAAN TERPILIH */}
          <div
            className="season-note"
            role="button"
            tabIndex={0}
            onClick={() => goTo('/weather')}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                goTo('/weather');
              }
            }}
          >
            <div className="season-icon">
              <Sprout size={19} />
            </div>

            <div>
              <span>PRAKIRAAN TERPILIH</span>

              <strong>
                {selectedForecast.condition} ·{' '}
                {getForecastDay(activeForecast)}
              </strong>

              <p>
                Suhu {selectedForecast.temp}, peluang hujan{' '}
                {selectedForecast.rain}%.{' '}
                {selectedForecast.recommendation}
              </p>
            </div>

            <ChevronRight size={18} />
          </div>
        </section>

        {/* =================================
            MARKETWATCH
        ================================= */}

        <section className="market-section">
          <div className="section-heading">
            <div>
              <span className="section-kicker">MARKETWATCH</span>
              <h2>Pasar sedang bergerak.</h2>
            </div>

            <button
              type="button"
              className="text-button"
              onClick={() => goTo('/marketplace')}
            >
              Pasar
              <ChevronRight size={15} />
            </button>
          </div>

          {/* KARTU KOMODITAS */}
          <div className="market-scroll">
            {commodities.map((commodity) => (
              <article
                className="commodity"
                key={commodity.name}
                role="button"
                tabIndex={0}
                onClick={() => openDialog('commodity', commodity)}
                onKeyDown={(event) => {
                  if (
                    event.key === 'Enter' ||
                    event.key === ' '
                  ) {
                    event.preventDefault();
                    openDialog('commodity', commodity);
                  }
                }}
                aria-label={`Lihat detail harga ${commodity.name}`}
              >
                <div className="commodity-top">
                  <span className="commodity-icon">
                    {commodity.icon}
                  </span>

                  {commodity.trend === 'up' ? (
                    <TrendingUp size={16} />
                  ) : (
                    <TrendingDown size={16} />
                  )}
                </div>

                <span className="commodity-name">
                  {commodity.name}
                </span>

                <strong>{commodity.price}</strong>

                <span
                  className={`commodity-change ${commodity.trend}`}
                >
                  {commodity.change}
                </span>
              </article>
            ))}
          </div>

          {/* PELUANG PASAR */}
          <div className="market-opportunity">
            <div className="opportunity-graphic">
              <div className="market-dot dot-one" />
              <div className="market-dot dot-two" />
              <div className="market-dot dot-three" />
              <div className="market-curve" />
            </div>

            <div className="opportunity-content">
              <span>PELUANG PASAR</span>

              <h3>2 pembeli sedang mencari cabai</h3>

              <p>Kebutuhan 50–100 kg · Grade A/B</p>

              <button
                type="button"
                onClick={() => goTo('/marketplace')}
              >
                Lihat permintaan
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </section>

        {/* =================================
            FARMPROGRESS
        ================================= */}

        <section className="farm-section">
          <div className="section-heading">
            <div>
              <span className="section-kicker">FARMPROGRESS</span>
              <h2>Kebun saya</h2>
            </div>

            <button
              type="button"
              className="round-arrow"
              onClick={() => openDialog('farm')}
              aria-label="Lihat detail perkembangan kebun"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="farm-visual">
            <div className="farm-image">
              <div className="farm-image-overlay" />

              <div className="farm-status">
                <span>AKTIF</span>
              </div>

              <div className="farm-title">
                <span>Cabai Merah</span>
                <strong>Hari ke-42</strong>
              </div>
            </div>

            <div className="farm-info">
              <div className="farm-progress">
                <div className="progress-label">
                  <span>Perjalanan menuju panen</span>
                  <strong>80%</strong>
                </div>

                <div
                  className="progress-track"
                  role="progressbar"
                  aria-label="Progres menuju panen"
                  aria-valuenow={80}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div style={{ width: '80%' }} />
                </div>

                <span className="harvest-estimate">
                  Perkiraan panen ±18 hari
                </span>

                {farmObserved && (
                  <span className="harvest-estimate">
                    Pengamatan diperbarui hari ini · data demo
                  </span>
                )}
              </div>

              <div className="farm-metrics">
                <div>
                  <span>Modal</span>
                  <strong>Rp2,5 jt</strong>
                </div>

                <div>
                  <span>Biaya</span>
                  <strong>Rp1,85 jt</strong>
                </div>

                <div>
                  <span>Hasil</span>
                  <strong>450 kg</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================
            LEARNING PROGRESS
        ================================= */}

        <section className="learning-section">
          <div className="learning-copy">
            <span className="section-kicker">
              LEARNING PROGRESS
            </span>

            <h2>
              Belajar sedikit,
              <br />
              praktik langsung.
            </h2>

            <p>
              Perjalananmu menjadi petani dimulai
              dari satu hal kecil yang kamu pahami.
            </p>
          </div>

          <div className="learning-progress">
            <div className="learning-level">
              <div>
                <span>LEVEL 02</span>
                <strong>Petani Pemula</strong>
              </div>

              <span>70%</span>
            </div>

            <div
              className="learning-bar"
              role="progressbar"
              aria-label="Progres belajar"
              aria-valuenow={70}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div style={{ width: '70%' }} />
            </div>

            <div className="learning-next">
              <div className="learning-number">03</div>

              <div>
                <span>STUDI KASUS SELANJUTNYA</span>

                <strong>
                  Tanaman cabai mulai menguning.
                  Apa yang kamu lakukan?
                </strong>
              </div>

              <button
                type="button"
                onClick={() => goTo('/academy')}
                aria-label="Buka studi kasus Smart Academy"
              >
                <ChevronRight size={19} />
              </button>
            </div>
          </div>
        </section>

        {/* =================================
            NEXT STEP
        ================================= */}

        <section className="next-step">
          <div className="next-step-decoration">
            <Sprout size={76} strokeWidth={0.8} />
          </div>

          <div className="next-step-content">
            <span className="section-kicker">NEXT STEP</span>

            <h2>
              Saatnya turun
              <br />
              ke tanah.
            </h2>

            <p>
              {practiceStatus === 'idle'
                ? 'Coba praktik menanam 3 tanaman menggunakan polybag.'
                : practiceStatus === 'started'
                  ? 'Praktik sedang berjalan. Lanjutkan langkah menanammu.'
                  : 'Praktik sudah ditandai selesai. Siap mencoba lagi?'}
            </p>

            <button
              type="button"
              className="primary-action"
              onClick={() => openDialog('practice')}
            >
              {practiceStatus === 'idle'
                ? 'Mulai praktik'
                : practiceStatus === 'started'
                  ? 'Lanjutkan praktik'
                  : 'Ulangi praktik'}

              <ChevronRight size={17} />
            </button>
          </div>
        </section>
      </div>

      {/* =====================================
          TANI PULSE SHEET
      ===================================== */}

      {showPulse && (
        <div
          className="pulse-overlay"
          onClick={() => setShowPulse(false)}
        >
          <div
            className="pulse-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pulse-sheet-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sheet-handle" />

            <div className="sheet-header">
              <div>
                <span className="section-kicker">TANI PULSE</span>
                <h2 id="pulse-sheet-title">
                  Yang perlu kamu tahu
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowPulse(false)}
                aria-label="Tutup Tani Pulse"
              >
                <X size={19} />
              </button>
            </div>

            <div className="sheet-items">
              {pulseItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div className="sheet-item" key={item.type}>
                    <div className="sheet-icon">
                      <Icon size={20} />
                    </div>

                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.text}</p>

                      <button
                        type="button"
                        onClick={() => goTo(item.path)}
                      >
                        {item.action}
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =====================================
          DETAIL MODAL BERSAMA
      ===================================== */}

      {dialog && dialogContent && (
        <div
          className="pulse-overlay"
          onClick={() => setDialog(null)}
        >
          <div
            className="pulse-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dashboard-dialog-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sheet-handle" />

            <div className="sheet-header">
              <div>
                <span className="section-kicker">
                  {dialogContent.kicker}
                </span>

                <h2 id="dashboard-dialog-title">
                  {dialogContent.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setDialog(null)}
                aria-label="Tutup detail"
              >
                <X size={19} />
              </button>
            </div>

            <p
              style={{
                margin: '12px 0 18px',
                color: '#7C817F',
                fontSize: '13px',
                lineHeight: 1.7,
              }}
            >
              {dialogContent.description}
            </p>

            <div className="farm-metrics">
              {dialogContent.details.map((detail) => (
                <div key={detail.label}>
                  <span>{detail.label}</span>
                  <strong>{detail.value}</strong>
                </div>
              ))}
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                marginTop: '24px',
              }}
            >
              <button
                type="button"
                className="text-button"
                onClick={() => setDialog(null)}
              >
                Tutup
              </button>

              <button
                type="button"
                className="primary-action"
                onClick={handleDialogAction}
              >
                {dialogContent.actionLabel}
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Dashboard;