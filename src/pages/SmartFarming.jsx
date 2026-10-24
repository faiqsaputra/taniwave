import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock3,
  CloudRain,
  ImagePlus,
  Leaf,
  MapPin,
  Plus,
  RefreshCw,
  Sprout,
  Trash2,
  Upload,
  X,
  RotateCcw,
} from 'lucide-react';

import Navbar from '../components/layout/Navbar';
import '../css/SmartFarming.css';

const STORAGE = {
  crops: 'taniwave.smartfarming.crops',
  selectedCrop: 'taniwave.smartfarming.selectedCrop',
  tasks: 'taniwave.smartfarming.tasks',
  logs: 'taniwave.smartfarming.logs',
  screenings: 'taniwave.smartfarming.screenings',
};

const SYMPTOMS = [
  'Daun menguning',
  'Bercak pada daun',
  'Daun berlubang',
  'Tanaman layu',
  'Pertumbuhan lambat',
  'Batang berubah warna',
];

function todayString() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function dateDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function readStorage(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);

    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function formatDate(value) {
  if (!value) return 'Belum dicatat';

  const date = new Date(`${value.slice(0, 10)}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return 'Tanggal tidak valid';
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatDateTime(value) {
  if (!value) return '';

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function getCropAge(plantedAt) {
  if (!plantedAt) return 0;

  const [year, month, day] = plantedAt.split('-').map(Number);

  const planted = new Date(year, month - 1, day);
  const today = new Date();

  planted.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return Math.max(
    0,
    Math.floor((today.getTime() - planted.getTime()) / 86400000),
  );
}

const DEMO_CROPS = [
  {
    id: 'demo-crop-1',
    name: 'Cabai Merah',
    type: 'Cabai',
    plantedAt: dateDaysAgo(42),
    location: 'Petak utama',
    area: '250',
    soil: 'Tanah kebun',
  },
];

const DEMO_TASKS = [
  {
    id: 'task-1',
    title: 'Periksa kelembapan tanah',
    description: 'Periksa tanah secara langsung.',
    completed: false,
  },
  {
    id: 'task-2',
    title: 'Periksa bagian bawah daun',
    description: 'Amati perubahan warna dan bercak.',
    completed: false,
  },
  {
    id: 'task-3',
    title: 'Catat penyiraman',
    description: 'Perbarui catatan penyiraman kebun.',
    completed: true,
  },
];

const DEFAULT_CROP_FORM = {
  name: '',
  type: 'Cabai',
  plantedAt: todayString(),
  location: '',
  area: '',
  soil: 'Tidak diketahui',
};

function createScreeningResult({ crop, symptoms, note, photo }) {
  let title = 'Pemeriksaan lanjutan diperlukan';

  let summary =
    'Gejala yang dicatat belum cukup untuk menentukan penyebabnya.';

  let checks = [
    'Periksa kondisi tanaman secara langsung.',
    'Ambil foto yang lebih jelas jika diperlukan.',
    'Amati apakah gejala muncul pada tanaman lain.',
  ];

  if (symptoms.includes('Daun menguning')) {
    title = 'Periksa kondisi air dan daun';

    summary =
      'Daun menguning dapat berkaitan dengan air, nutrisi, kondisi akar, atau gangguan lainnya.';

    checks = [
      'Periksa kelembapan tanah dan pola penyiraman.',
      'Amati apakah daun tua atau daun muda yang menguning.',
      'Periksa apakah gejala muncul pada satu atau banyak tanaman.',
    ];
  } else if (symptoms.includes('Bercak pada daun')) {
    title = 'Periksa pola bercak pada daun';

    summary =
      'Bercak pada daun memiliki beberapa kemungkinan penyebab dan belum dapat dipastikan hanya dari gejalanya.';

    checks = [
      'Ambil foto bagian atas dan bawah daun.',
      'Amati bentuk, warna, dan penyebaran bercak.',
      'Catat apakah bercak bertambah pada pengamatan berikutnya.',
    ];
  } else if (symptoms.includes('Daun berlubang')) {
    title = 'Periksa kerusakan daun';

    summary =
      'Lubang pada daun dapat berkaitan dengan organisme pemakan jaringan tanaman atau kerusakan lainnya.';

    checks = [
      'Periksa bagian bawah daun dan pucuk muda.',
      'Amati apakah ada serangga atau bekas gigitan.',
      'Catat bagian tanaman yang paling banyak mengalami kerusakan.',
    ];
  } else if (symptoms.includes('Tanaman layu')) {
    title = 'Periksa air dan kondisi akar';

    summary =
      'Tanaman layu dapat berkaitan dengan air, kondisi akar, penyakit, atau tekanan lingkungan.';

    checks = [
      'Periksa kelembapan tanah.',
      'Amati apakah tanaman pulih setelah kondisi air diperbaiki.',
      'Periksa kondisi akar jika layu terus berlanjut.',
    ];
  } else if (symptoms.includes('Pertumbuhan lambat')) {
    title = 'Periksa perkembangan tanaman';

    summary =
      'Pertumbuhan perlu dinilai berdasarkan umur tanaman, lingkungan, dan perawatan sebelumnya.';

    checks = [
      'Periksa pertumbuhan daun dan batang terbaru.',
      'Tinjau catatan penyiraman dan pemupukan.',
      'Bandingkan dengan tanaman sejenis pada kondisi serupa.',
    ];
  } else if (symptoms.includes('Batang berubah warna')) {
    title = 'Periksa perubahan pada batang';

    summary =
      'Perubahan warna batang perlu diperiksa lebih lanjut untuk mengetahui penyebabnya.';

    checks = [
      'Foto bagian batang yang berubah warna.',
      'Periksa apakah ada luka atau perubahan tekstur.',
      'Catat apakah perubahan meluas ke bagian lain.',
    ];
  }

  return {
    id: `screen-${Date.now()}`,
    cropId: crop.id,
    cropName: crop.name,
    createdAt: new Date().toISOString(),
    symptoms: [...symptoms],
    note: note.trim(),
    photoName: photo?.name ?? '',
    title,
    summary,
    checks,
    mode: 'Simulasi',
  };
}

function getCameraErrorMessage(error) {
  if (error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError') {
    return 'Izin kamera ditolak. Izinkan akses kamera melalui pengaturan browser, lalu coba lagi.';
  }

  if (error?.name === 'NotFoundError' || error?.name === 'DevicesNotFoundError') {
    return 'Kamera tidak ditemukan pada perangkat ini. Gunakan pilihan galeri sebagai alternatif.';
  }

  if (error?.name === 'NotReadableError' || error?.name === 'TrackStartError') {
    return 'Kamera sedang digunakan aplikasi lain. Tutup aplikasi kamera lain, lalu coba kembali.';
  }

  if (error?.name === 'SecurityError') {
    return 'Browser membatasi akses kamera. Buka aplikasi melalui HTTPS atau localhost.';
  }

  return 'Kamera belum dapat dibuka. Periksa izin browser atau gunakan foto dari galeri.';
}

export default function SmartFarming({ initialTab = 'overview' }) {
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState(initialTab);

  const [crops, setCrops] = useState(() =>
    readStorage(STORAGE.crops, DEMO_CROPS),
  );

  const [selectedCropId, setSelectedCropId] = useState(() =>
    readStorage(STORAGE.selectedCrop, 'demo-crop-1'),
  );

  const [tasks, setTasks] = useState(() =>
    readStorage(STORAGE.tasks, DEMO_TASKS),
  );

  const [logs, setLogs] = useState(() =>
    readStorage(STORAGE.logs, []),
  );

  const [screeningHistory, setScreeningHistory] = useState(() =>
    readStorage(STORAGE.screenings, []),
  );

  const [showCropForm, setShowCropForm] = useState(false);
  const [cropForm, setCropForm] = useState(DEFAULT_CROP_FORM);

  const [symptoms, setSymptoms] = useState([]);
  const [screeningNote, setScreeningNote] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [screeningResult, setScreeningResult] = useState(null);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraFacing, setCameraFacing] = useState('environment');
  const [cameraBusy, setCameraBusy] = useState(false);
  const [cameraError, setCameraError] = useState('');

  const [logType, setLogType] = useState('Pengamatan');
  const [logText, setLogText] = useState('');
  const [feedback, setFeedback] = useState('');

  const selectedCrop =
    crops.find((crop) => crop.id === selectedCropId) ??
    crops[0] ??
    null;

  const cropAge = selectedCrop
    ? getCropAge(selectedCrop.plantedAt)
    : null;

  const completedTasks = tasks.filter(
    (task) => task.completed,
  ).length;

  /* -----------------------------------------
     LOCAL STORAGE
  ----------------------------------------- */

  useEffect(() => {
    const values = [
      [STORAGE.crops, crops],
      [STORAGE.selectedCrop, selectedCropId],
      [STORAGE.tasks, tasks],
      [STORAGE.logs, logs],
      [STORAGE.screenings, screeningHistory],
    ];

    values.forEach(([key, value]) => {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // Data tetap tersedia selama sesi aktif.
      }
    });
  }, [crops, selectedCropId, tasks, logs, screeningHistory]);

  useEffect(() => {
    if (
      crops.length > 0 &&
      !crops.some((crop) => crop.id === selectedCropId)
    ) {
      setSelectedCropId(crops[0].id);
    }
  }, [crops, selectedCropId]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  /* -----------------------------------------
     RELEASE CAMERA AND TEMPORARY PHOTO URLS
  ----------------------------------------- */

  useEffect(() => {
    return () => {
      cameraStreamRef.current?.getTracks().forEach((track) => {
        track.stop();
      });
    };
  }, []);

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  useEffect(() => {
    if (!cameraOpen || !cameraStream || !videoRef.current) {
      return undefined;
    }

    const video = videoRef.current;

    video.srcObject = cameraStream;

    video.play().catch(() => {
      setCameraError(
        'Pratinjau kamera belum dapat diputar. Coba tutup dan buka kamera kembali.',
      );
    });

    return () => {
      if (video.srcObject === cameraStream) {
        video.srcObject = null;
      }
    };
  }, [cameraOpen, cameraStream]);

  useEffect(() => {
    if (!feedback) return undefined;

    const timer = window.setTimeout(() => {
      setFeedback('');
    }, 2800);

    return () => window.clearTimeout(timer);
  }, [feedback]);

  /* -----------------------------------------
     NAVIGATION
  ----------------------------------------- */

  function changeTab(tab) {
    setActiveTab(tab);
    setFeedback('');
  }

  function goToRoute(path) {
    navigate(path);
  }

  /* -----------------------------------------
     CROP FORM
  ----------------------------------------- */

  function updateCropForm(field, value) {
    setCropForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function addCrop(event) {
    event.preventDefault();

    if (
      !cropForm.name.trim() ||
      !cropForm.plantedAt ||
      !cropForm.location.trim()
    ) {
      setFeedback('Lengkapi nama tanaman, tanggal tanam, dan lokasi.');
      return;
    }

    if (cropForm.plantedAt > todayString()) {
      setFeedback('Tanggal tanam tidak boleh di masa depan.');
      return;
    }

    const crop = {
      ...cropForm,
      id: `crop-${Date.now()}`,
      name: cropForm.name.trim(),
      location: cropForm.location.trim(),
    };

    setCrops((current) => [...current, crop]);
    setSelectedCropId(crop.id);
    setCropForm({
      ...DEFAULT_CROP_FORM,
      plantedAt: todayString(),
    });
    setShowCropForm(false);
    setActiveTab('overview');
    setFeedback('Profil kebun berhasil ditambahkan.');
  }

  /* -----------------------------------------
     DIRECT CAMERA
  ----------------------------------------- */

  async function startCamera(facing = cameraFacing) {
    setCameraError('');

    if (
      !window.isSecureContext &&
      !['localhost', '127.0.0.1', '::1'].includes(
        window.location.hostname,
      )
    ) {
      setCameraError(
        'Akses kamera langsung membutuhkan HTTPS. Untuk pengembangan lokal, gunakan localhost.',
      );
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        'Browser tidak mendukung akses kamera langsung. Gunakan foto dari galeri.',
      );
      return;
    }

    setCameraBusy(true);

    cameraStreamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });

    cameraStreamRef.current = null;
    setCameraStream(null);

    try {
      let stream;

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
      } catch (error) {
        // Beberapa kamera tidak mendukung constraint tertentu.
        // Coba konfigurasi standar sebelum menampilkan error.
        if (
          error?.name === 'OverconstrainedError' ||
          error?.name === 'ConstraintNotSatisfiedError'
        ) {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: true,
          });
        } else {
          throw error;
        }
      }

      cameraStreamRef.current = stream;
      setCameraStream(stream);
      setCameraFacing(facing);
      setCameraOpen(true);
    } catch (error) {
      setCameraOpen(false);
      setCameraError(getCameraErrorMessage(error));
    } finally {
      setCameraBusy(false);
    }
  }

  function stopCamera() {
    cameraStreamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });

    cameraStreamRef.current = null;

    setCameraStream(null);
    setCameraOpen(false);
    setCameraBusy(false);
  }

  async function switchCamera() {
    const nextFacing =
      cameraFacing === 'environment' ? 'user' : 'environment';

    await startCamera(nextFacing);
  }

  function useSelectedPhoto(file) {
    if (!file) return false;

    if (!file.type.startsWith('image/')) {
      setFeedback('Pilih file gambar yang valid.');
      return false;
    }

    if (file.size > 10 * 1024 * 1024) {
      setFeedback('Ukuran gambar maksimal 10 MB.');
      return false;
    }

    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setScreeningResult(null);
    setCameraError('');

    return true;
  }

  function handlePhotoChange(event) {
    const file = event.target.files?.[0];

    if (file) {
      useSelectedPhoto(file);
    }

    // Memungkinkan pengguna memilih file yang sama lagi.
    event.target.value = '';
  }

  function capturePhoto() {
    const video = videoRef.current;

    if (
      !video ||
      video.readyState < 2 ||
      !video.videoWidth ||
      !video.videoHeight
    ) {
      setCameraError('Kamera belum siap. Tunggu sebentar lalu coba lagi.');
      return;
    }

    const canvas = document.createElement('canvas');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');

    if (!context) {
      setCameraError('Tidak dapat memproses gambar dari kamera.');
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setCameraError('Foto gagal dibuat. Silakan coba lagi.');
          return;
        }

        const file = new File(
          [blob],
          `taniwave-${Date.now()}.jpg`,
          {
            type: 'image/jpeg',
            lastModified: Date.now(),
          },
        );

        useSelectedPhoto(file);
        stopCamera();
        setFeedback('Foto berhasil diambil.');
      },
      'image/jpeg',
      0.9,
    );
  }

  function removePhoto() {
    setPhoto(null);
    setPhotoPreview('');
    setScreeningResult(null);
  }

  /* -----------------------------------------
     SCREENING
  ----------------------------------------- */

  function toggleSymptom(symptom) {
    setSymptoms((current) =>
      current.includes(symptom)
        ? current.filter((item) => item !== symptom)
        : [...current, symptom],
    );

    setScreeningResult(null);
  }

  function runScreening(event) {
    event.preventDefault();

    if (!selectedCrop) {
      setFeedback('Tambahkan profil kebun terlebih dahulu.');
      return;
    }

    if (symptoms.length === 0 && !photo) {
      setFeedback('Ambil foto atau pilih minimal satu gejala.');
      return;
    }

    const result = createScreeningResult({
      crop: selectedCrop,
      symptoms,
      note: screeningNote,
      photo,
    });

    setScreeningResult(result);

    setScreeningHistory((current) =>
      [result, ...current].slice(0, 20),
    );

    setFeedback('Hasil simulasi tersimpan dalam riwayat.');
  }

  function resetScreening() {
    setSymptoms([]);
    setScreeningNote('');
    setScreeningResult(null);
    removePhoto();
    setCameraError('');
  }

  /* -----------------------------------------
     TASKS AND ACTIVITY LOGS
  ----------------------------------------- */

  function toggleTask(taskId) {
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId
          ? { ...task, completed: !task.completed }
          : task,
      ),
    );
  }

  function addLog(event) {
    event.preventDefault();

    if (!logText.trim()) {
      setFeedback('Tuliskan catatan kegiatan terlebih dahulu.');
      return;
    }

    const log = {
      id: `log-${Date.now()}`,
      cropId: selectedCrop?.id ?? null,
      cropName: selectedCrop?.name ?? 'Kebun',
      type: logType,
      text: logText.trim(),
      createdAt: new Date().toISOString(),
    };

    setLogs((current) => [log, ...current].slice(0, 50));
    setLogText('');
    setFeedback('Catatan kegiatan berhasil disimpan.');
  }

  function deleteLog(logId) {
    setLogs((current) =>
      current.filter((log) => log.id !== logId),
    );

    setFeedback('Catatan berhasil dihapus.');
  }

  /* -----------------------------------------
     RENDER
  ----------------------------------------- */

  return (
    <main className="sf-page">
      <Navbar />

      <div className="sf-container">
        <header className="sf-page-header">
          <div>
            <span className="sf-eyebrow">PENGELOLAAN KEBUN</span>

            <h1>Smart Farming</h1>

            <p>
              Periksa tanaman, pantau aktivitas kebun, dan catat
              perawatan langsung dari HP.
            </p>
          </div>

          <button
            type="button"
            className="sf-button sf-button-primary"
            onClick={() => setShowCropForm((current) => !current)}
          >
            {showCropForm ? <X size={17} /> : <Plus size={17} />}
            <span>{showCropForm ? 'Tutup' : 'Tambah kebun'}</span>
          </button>
        </header>

        <div className="sf-demo-notice">
          <span className="sf-demo-dot" />
          <span>
            Data demo tersimpan pada browser ini. Kamera menggunakan
            perangkatmu secara langsung.
          </span>
        </div>

        {/* TAMBAH KEBUN */}
        {showCropForm && (
          <section className="sf-card sf-form-card">
            <div className="sf-section-heading">
              <div>
                <span className="sf-eyebrow">KEBUN BARU</span>
                <h2>Tambahkan tanaman</h2>
              </div>

              <button
                type="button"
                className="sf-icon-button"
                onClick={() => setShowCropForm(false)}
                aria-label="Tutup formulir"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={addCrop} className="sf-form">
              <div className="sf-form-grid">
                <label className="sf-field">
                  <span>Nama kebun atau tanaman *</span>
                  <input
                    value={cropForm.name}
                    onChange={(event) =>
                      setCropForm({
                        ...cropForm,
                        name: event.target.value,
                      })
                    }
                    maxLength={70}
                    placeholder="Contoh: Cabai Petak 2"
                    required
                  />
                </label>

                <label className="sf-field">
                  <span>Jenis tanaman</span>
                  <select
                    value={cropForm.type}
                    onChange={(event) =>
                      setCropForm({
                        ...cropForm,
                        type: event.target.value,
                      })
                    }
                  >
                    <option>Cabai</option>
                    <option>Tomat</option>
                    <option>Bawang</option>
                    <option>Jagung</option>
                    <option>Padi</option>
                    <option>Sayuran lain</option>
                    <option>Tanaman lain</option>
                  </select>
                </label>

                <label className="sf-field">
                  <span>Tanggal tanam *</span>
                  <input
                    type="date"
                    value={cropForm.plantedAt}
                    max={todayString()}
                    onChange={(event) =>
                      setCropForm({
                        ...cropForm,
                        plantedAt: event.target.value,
                      })
                    }
                    required
                  />
                </label>

                <label className="sf-field">
                  <span>Lokasi atau nama petak *</span>
                  <input
                    value={cropForm.location}
                    maxLength={70}
                    onChange={(event) =>
                      setCropForm({
                        ...cropForm,
                        location: event.target.value,
                      })
                    }
                    placeholder="Contoh: Petak belakang"
                    required
                  />
                </label>

                <label className="sf-field">
                  <span>Luas lahan (m²)</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={cropForm.area}
                    onChange={(event) =>
                      setCropForm({
                        ...cropForm,
                        area: event.target.value,
                      })
                    }
                    placeholder="Contoh: 250"
                  />
                </label>

                <label className="sf-field">
                  <span>Jenis tanah</span>
                  <select
                    value={cropForm.soil}
                    onChange={(event) =>
                      setCropForm({
                        ...cropForm,
                        soil: event.target.value,
                      })
                    }
                  >
                    <option>Tidak diketahui</option>
                    <option>Tanah kebun</option>
                    <option>Lempung</option>
                    <option>Berpasir</option>
                    <option>Tanah liat</option>
                    <option>Media pot atau polybag</option>
                  </select>
                </label>
              </div>

              <div className="sf-form-actions">
                <button
                  type="button"
                  className="sf-button sf-button-secondary"
                  onClick={() => setShowCropForm(false)}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="sf-button sf-button-primary"
                >
                  <Check size={17} />
                  Simpan kebun
                </button>
              </div>
            </form>
          </section>
        )}

        {/* PILIH KEBUN */}
        <section className="sf-crop-selector">
          <div className="sf-crop-selector-icon">
            <Sprout size={21} />
          </div>

          <div className="sf-crop-selector-copy">
            <span>Kebun yang dibuka</span>

            <strong>
              {selectedCrop?.name ?? 'Belum ada kebun'}
            </strong>

            <small>
              {selectedCrop?.location ?? 'Tambahkan profil kebun'}
            </small>
          </div>

          <div className="sf-select-wrapper">
            <select
              aria-label="Pilih kebun"
              value={selectedCrop?.id ?? ''}
              disabled={!crops.length}
              onChange={(event) =>
                setSelectedCropId(event.target.value)
              }
            >
              {crops.map((crop) => (
                <option key={crop.id} value={crop.id}>
                  {crop.name}
                </option>
              ))}
            </select>

            <ChevronDown size={15} />
          </div>
        </section>

        {/* TAB */}
        <nav className="sf-tabs" aria-label="Menu Smart Farming">
          <button
            type="button"
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => changeTab('overview')}
          >
            <Activity size={17} />
            Ringkasan
          </button>

          <button
            type="button"
            className={activeTab === 'screening' ? 'active' : ''}
            onClick={() => changeTab('screening')}
          >
            <Camera size={17} />
            Skrining
          </button>

          <button
            type="button"
            className={activeTab === 'records' ? 'active' : ''}
            onClick={() => changeTab('records')}
          >
            <ClipboardList size={17} />
            Catatan
          </button>
        </nav>

        {/* =====================================
            TAB RINGKASAN
        ===================================== */}

        {activeTab === 'overview' && (
          <>
            <section className="sf-overview-grid">
              <article className="sf-card sf-crop-card">
                <div className="sf-card-topline">
                  <span className="sf-eyebrow">
                    PERKEMBANGAN TANAMAN
                  </span>

                  <span className="sf-status">
                    <span />
                    Pantau manual
                  </span>
                </div>

                {selectedCrop ? (
                  <>
                    <div className="sf-crop-main">
                      <div className="sf-crop-illustration">
                        <Sprout size={37} strokeWidth={1.6} />
                      </div>

                      <div>
                        <h2>{selectedCrop.name}</h2>
                        <p>
                          {selectedCrop.type} · {cropAge} hari sejak tanam
                        </p>
                      </div>
                    </div>

                    <div className="sf-crop-metrics">
                      <div>
                        <span>Tanggal tanam</span>
                        <strong>
                          {formatDate(selectedCrop.plantedAt)}
                        </strong>
                      </div>

                      <div>
                        <span>Luas lahan</span>
                        <strong>
                          {selectedCrop.area
                            ? `${selectedCrop.area} m²`
                            : 'Belum diisi'}
                        </strong>
                      </div>
                    </div>

                    <div className="sf-card-footer">
                      <span>
                        <MapPin size={14} />
                        {selectedCrop.location}
                      </span>

                      <button
                        type="button"
                        onClick={() => setShowCropForm(true)}
                      >
                        Tambah petak
                        <ChevronRight size={15} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="sf-empty">
                    <Sprout size={30} />
                    <p>Tambahkan profil kebun untuk memulai.</p>
                  </div>
                )}
              </article>

              <article className="sf-card sf-weather-card">
                <div className="sf-card-topline">
                  <span className="sf-eyebrow">AGROCLIMATE</span>
                  <CloudRain size={20} />
                </div>

                <span className="sf-weather-label">Data contoh</span>

                <div className="sf-weather-main">
                  <div>
                    <strong>29°</strong>
                    <span>Potensi hujan</span>
                  </div>

                  <div className="sf-weather-icon">
                    <CloudRain size={34} />
                  </div>
                </div>

                <div className="sf-weather-note">
                  <AlertCircle size={15} />

                  <p>
                    Periksa kondisi tanah dan drainase secara langsung.
                    Data ini belum terhubung ke layanan cuaca.
                  </p>
                </div>

                <button
                  type="button"
                  className="sf-link-button"
                  onClick={() => goToRoute('/weather')}
                >
                  Lihat AgroClimate
                  <ArrowRight size={15} />
                </button>
              </article>
            </section>

            <section className="sf-section">
              <div className="sf-section-heading">
                <div>
                  <span className="sf-eyebrow">AKSI CEPAT</span>
                  <h2>Apa yang ingin kamu lakukan?</h2>
                </div>
              </div>

              <div className="sf-quick-actions">
                <button
                  type="button"
                  className="sf-quick-action sf-quick-primary"
                  onClick={() => changeTab('screening')}
                >
                  <span className="sf-quick-icon">
                    <Camera size={22} />
                  </span>

                  <span>
                    <strong>Foto tanaman</strong>
                    <small>Buka kamera atau galeri</small>
                  </span>

                  <ChevronRight size={18} />
                </button>

                <button
                  type="button"
                  className="sf-quick-action"
                  onClick={() => changeTab('records')}
                >
                  <span className="sf-quick-icon">
                    <ClipboardList size={22} />
                  </span>

                  <span>
                    <strong>Catat kegiatan</strong>
                    <small>Simpan perawatan kebun</small>
                  </span>

                  <ChevronRight size={18} />
                </button>
              </div>
            </section>

            <section className="sf-section">
              <div className="sf-section-heading">
                <div>
                  <span className="sf-eyebrow">PERAWATAN</span>
                  <h2>Yang perlu diperiksa</h2>
                </div>

                <span className="sf-counter">
                  {completedTasks}/{tasks.length} selesai
                </span>
              </div>

              <div className="sf-card sf-task-list">
                {tasks.map((task) => (
                  <button
                    type="button"
                    key={task.id}
                    className={`sf-task ${task.completed ? 'completed' : ''}`}
                    onClick={() => toggleTask(task.id)}
                    aria-pressed={task.completed}
                  >
                    <span className="sf-task-check">
                      {task.completed && <Check size={16} />}
                    </span>

                    <span className="sf-task-copy">
                      <strong>{task.title}</strong>
                      <small>{task.description}</small>
                    </span>

                    {task.completed ? (
                      <CheckCircle2 size={19} className="sf-task-done" />
                    ) : (
                      <ChevronRight size={17} />
                    )}
                  </button>
                ))}

                <div className="sf-task-footer">
                  <span>
                    Checklist manual, belum terhubung dengan sensor.
                  </span>
                </div>
              </div>
            </section>

            <section className="sf-section">
              <div className="sf-section-heading">
                <div>
                  <span className="sf-eyebrow">RIWAYAT KEBUN</span>
                  <h2>Skrining terbaru</h2>
                </div>

                <button
                  type="button"
                  className="sf-link-button"
                  onClick={() => changeTab('records')}
                >
                  Lihat semua
                  <ChevronRight size={15} />
                </button>
              </div>

              {screeningHistory.length > 0 ? (
                <button
                  type="button"
                  className="sf-card sf-history-preview"
                  onClick={() => changeTab('records')}
                >
                  <span className="sf-history-icon">
                    <Leaf size={20} />
                  </span>

                  <span>
                    <strong>{screeningHistory[0].title}</strong>
                    <small>
                      {screeningHistory[0].cropName} ·{' '}
                      {formatDateTime(screeningHistory[0].createdAt)}
                    </small>
                  </span>

                  <ChevronRight size={18} />
                </button>
              ) : (
                <div className="sf-card sf-empty-history">
                  <span className="sf-history-icon">
                    <Camera size={20} />
                  </span>

                  <div>
                    <strong>Belum ada riwayat skrining</strong>
                    <p>Hasil pemeriksaan yang disimpan muncul di sini.</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => changeTab('screening')}
                  >
                    Mulai
                  </button>
                </div>
              )}
            </section>
          </>
        )}

        {/* =====================================
            TAB SKRINING
        ===================================== */}

        {activeTab === 'screening' && (
          <>
            <section className="sf-screening-intro">
              <div className="sf-screening-intro-icon">
                <Camera size={24} />
              </div>

              <div>
                <span className="sf-eyebrow">PEMERIKSAAN TANAMAN</span>

                <h2>Foto tanaman yang bermasalah</h2>

                <p>
                  Ambil foto langsung, pilih gejala, lalu simpan
                  hasil pemeriksaan awal.
                </p>
              </div>
            </section>

            <form
              className="sf-screening-form"
              onSubmit={runScreening}
            >
              <section className="sf-card sf-form-card">
                <div className="sf-section-heading">
                  <div>
                    <span className="sf-step-label">LANGKAH 1</span>
                    <h2>Foto tanaman</h2>
                    <p>
                      Arahkan kamera ke bagian daun, batang, atau buah
                      yang menunjukkan gejala.
                    </p>
                  </div>
                </div>

                <input
                  ref={cameraInputRef}
                  className="sf-visually-hidden"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoChange}
                  aria-label="Ambil foto dengan kamera bawaan browser"
                />

                <input
                  ref={galleryInputRef}
                  className="sf-visually-hidden"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  aria-label="Pilih foto dari galeri"
                />

                {photoPreview ? (
                  <div className="sf-photo-preview">
                    <img
                      src={photoPreview}
                      alt="Pratinjau foto tanaman"
                    />

                    <div className="sf-photo-info">
                      <div>
                        <strong>Foto siap digunakan</strong>
                        <span>{photo?.name}</span>
                      </div>

                      <button
                        type="button"
                        className="sf-icon-button"
                        onClick={removePhoto}
                        aria-label="Hapus foto"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="sf-upload-area">
                    <div className="sf-upload-icon">
                      <ImagePlus size={30} />
                    </div>

                    <strong>Belum ada foto</strong>

                    <p>
                      Gunakan kamera HP untuk mengambil gambar sekarang,
                      atau pilih foto yang sudah tersimpan.
                    </p>
                  </div>
                )}

                <div className="sf-photo-actions">
                  <button
                    type="button"
                    className="sf-button sf-button-primary"
                    onClick={() => startCamera('environment')}
                    disabled={cameraBusy}
                  >
                    <Camera size={18} />
                    {cameraBusy ? 'Membuka kamera...' : 'Buka kamera'}
                  </button>

                  <button
                    type="button"
                    className="sf-button sf-button-secondary"
                    onClick={() => galleryInputRef.current?.click()}
                  >
                    <Upload size={17} />
                    Galeri
                  </button>
                </div>

                {cameraError && (
                  <div className="sf-camera-error" role="alert">
                    <AlertCircle size={17} />

                    <div>
                      <p>{cameraError}</p>

                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                      >
                        Coba kamera bawaan perangkat
                      </button>
                    </div>
                  </div>
                )}

                <p className="sf-field-hint">
                  Maksimal 10 MB. Foto disimpan sebagai pratinjau lokal
                  dan belum dikirim ke server.
                </p>
              </section>

              <section className="sf-card sf-form-card">
                <div className="sf-section-heading">
                  <div>
                    <span className="sf-step-label">LANGKAH 2</span>
                    <h2>Apa yang terlihat?</h2>
                    <p>Pilih semua gejala yang sesuai.</p>
                  </div>

                  <span className="sf-counter">
                    {symptoms.length} dipilih
                  </span>
                </div>

                <div className="sf-symptom-grid">
                  {SYMPTOMS.map((symptom) => {
                    const isSelected = symptoms.includes(symptom);

                    return (
                      <button
                        type="button"
                        key={symptom}
                        className={`sf-symptom ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleSymptom(symptom)}
                        aria-pressed={isSelected}
                      >
                        <span className="sf-symptom-check">
                          {isSelected && <Check size={14} />}
                        </span>
                        {symptom}
                      </button>
                    );
                  })}
                </div>

                <label className="sf-field sf-note-field">
                  <span>Catatan tambahan (opsional)</span>

                  <textarea
                    rows={3}
                    maxLength={500}
                    value={screeningNote}
                    onChange={(event) => {
                      setScreeningNote(event.target.value);
                      setScreeningResult(null);
                    }}
                    placeholder="Contoh: gejala mulai terlihat sejak kemarin..."
                  />

                  <small>{screeningNote.length}/500 karakter</small>
                </label>
              </section>

              <section className="sf-screening-summary">
                <div>
                  <span className="sf-eyebrow">RINGKASAN</span>
                  <strong>
                    {selectedCrop?.name ?? 'Belum ada kebun'}
                  </strong>

                  <small>
                    {symptoms.length} gejala
                    {photo ? ' · Foto tersedia' : ' · Tanpa foto'}
                  </small>
                </div>

                <button
                  type="submit"
                  className="sf-button sf-button-primary"
                  disabled={!selectedCrop}
                >
                  <Activity size={18} />
                  Periksa gejala
                </button>
              </section>
            </form>

            {screeningResult && (
              <section className="sf-card sf-result-card">
                <div className="sf-result-heading">
                  <span className="sf-result-icon">
                    <AlertCircle size={22} />
                  </span>

                  <div>
                    <span className="sf-eyebrow">
                      HASIL PEMERIKSAAN
                    </span>
                    <h2>{screeningResult.title}</h2>
                  </div>
                </div>

                <span className="sf-result-demo-label">
                  SIMULASI · BUKAN DIAGNOSIS AI
                </span>

                <p className="sf-result-summary">
                  {screeningResult.summary}
                </p>

                {screeningResult.symptoms.length > 0 && (
                  <div className="sf-result-block">
                    <strong>Gejala yang dicatat</strong>

                    <div className="sf-result-tags">
                      {screeningResult.symptoms.map((symptom) => (
                        <span key={symptom}>{symptom}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="sf-result-block">
                  <strong>Pemeriksaan berikutnya</strong>

                  <ol className="sf-result-checks">
                    {screeningResult.checks.map((check) => (
                      <li key={check}>{check}</li>
                    ))}
                  </ol>
                </div>

                <div className="sf-result-warning">
                  <AlertCircle size={17} />

                  <p>
                    Foto belum dianalisis oleh model AI. Hasil dibuat
                    dari gejala yang dipilih, bukan dari isi gambar.
                    Jangan menentukan penggunaan pestisida hanya
                    berdasarkan simulasi ini.
                  </p>
                </div>

                <div className="sf-result-actions">
                  <button
                    type="button"
                    className="sf-button sf-button-secondary"
                    onClick={() => changeTab('records')}
                  >
                    <ClipboardList size={16} />
                    Lihat riwayat
                  </button>

                  <button
                    type="button"
                    className="sf-button sf-button-primary"
                    onClick={resetScreening}
                  >
                    <RefreshCw size={16} />
                    Periksa lagi
                  </button>
                </div>
              </section>
            )}
          </>
        )}

        {/* =====================================
            TAB CATATAN
        ===================================== */}

        {activeTab === 'records' && (
          <>
            <section className="sf-card sf-form-card">
              <div className="sf-section-heading">
                <div>
                  <span className="sf-eyebrow">BUKU KEGIATAN</span>
                  <h2>Catat aktivitas kebun</h2>
                  <p>Simpan aktivitas yang sudah dilakukan.</p>
                </div>
              </div>

              <form className="sf-form" onSubmit={addLog}>
                <label className="sf-field">
                  <span>Jenis kegiatan</span>

                  <select
                    value={logType}
                    onChange={(event) => setLogType(event.target.value)}
                  >
                    <option>Pengamatan</option>
                    <option>Penyiraman</option>
                    <option>Pemupukan</option>
                    <option>Pengendalian hama</option>
                    <option>Penanaman</option>
                    <option>Panen</option>
                    <option>Kegiatan lainnya</option>
                  </select>
                </label>

                <label className="sf-field">
                  <span>Catatan kegiatan *</span>

                  <textarea
                    rows={4}
                    maxLength={1000}
                    value={logText}
                    onChange={(event) => setLogText(event.target.value)}
                    placeholder="Contoh: memeriksa kelembapan tanah..."
                    required
                  />

                  <small>{logText.length}/1000 karakter</small>
                </label>

                <div className="sf-form-actions">
                  <button
                    type="submit"
                    className="sf-button sf-button-primary"
                  >
                    <Plus size={17} />
                    Simpan catatan
                  </button>
                </div>
              </form>
            </section>

            <section className="sf-section">
              <div className="sf-section-heading">
                <div>
                  <span className="sf-eyebrow">RIWAYAT SKRINING</span>
                  <h2>Hasil pemeriksaan</h2>
                </div>

                <span className="sf-counter">
                  {screeningHistory.length} catatan
                </span>
              </div>

              {screeningHistory.length ? (
                <div className="sf-record-list">
                  {screeningHistory.map((record) => (
                    <article className="sf-card sf-record-card" key={record.id}>
                      <div className="sf-record-icon">
                        <Leaf size={20} />
                      </div>

                      <div className="sf-record-content">
                        <div className="sf-record-top">
                          <strong>{record.title}</strong>
                          <span className="sf-record-badge">
                            {record.mode}
                          </span>
                        </div>

                        <p>{record.cropName}</p>

                        <small>
                          <Clock3 size={13} />
                          {formatDateTime(record.createdAt)}
                        </small>

                        <div className="sf-result-tags">
                          {record.symptoms.map((symptom) => (
                            <span key={symptom}>{symptom}</span>
                          ))}
                        </div>

                        {record.photoName && (
                          <small className="sf-record-photo">
                            <ImagePlus size={13} />
                            {record.photoName}
                          </small>
                        )}

                        {record.note && <p>{record.note}</p>}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="sf-card sf-empty-state">
                  <Camera size={27} />
                  <strong>Belum ada riwayat pemeriksaan</strong>
                  <p>Hasil skrining akan tersimpan di sini.</p>

                  <button
                    type="button"
                    className="sf-button sf-button-primary"
                    onClick={() => changeTab('screening')}
                  >
                    Mulai skrining
                  </button>
                </div>
              )}
            </section>

            <section className="sf-section">
              <div className="sf-section-heading">
                <div>
                  <span className="sf-eyebrow">KEGIATAN KEBUN</span>
                  <h2>Catatan aktivitas</h2>
                </div>

                <span className="sf-counter">{logs.length} catatan</span>
              </div>

              {logs.length ? (
                <div className="sf-record-list">
                  {logs.map((log) => (
                    <article className="sf-card sf-record-card" key={log.id}>
                      <div className="sf-log-icon">
                        <ClipboardList size={20} />
                      </div>

                      <div className="sf-record-content">
                        <div className="sf-record-top">
                          <strong>{log.type}</strong>

                          <button
                            type="button"
                            className="sf-icon-button sf-delete-button"
                            onClick={() => deleteLog(log.id)}
                            aria-label={`Hapus catatan ${log.type}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        <p>{log.text}</p>

                        <small>
                          <Clock3 size={13} />
                          {formatDateTime(log.createdAt)}
                        </small>

                        <span className="sf-log-crop">{log.cropName}</span>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="sf-card sf-empty-state">
                  <ClipboardList size={27} />
                  <strong>Belum ada catatan aktivitas</strong>
                  <p>Catat perawatan setelah dilakukan di kebun.</p>
                </div>
              )}
            </section>
          </>
        )}

        <footer className="sf-page-footer">
          <span>
            <Camera size={15} />
            Kamera perangkat
          </span>

          <span>
            <ClipboardList size={15} />
            Data lokal
          </span>

          <p>
            Belum terhubung dengan AI vision, sensor IoT, atau server.
          </p>
        </footer>
      </div>

      {/* =====================================
          KAMERA LANGSUNG
      ===================================== */}

      {cameraOpen && (
        <div
          className="sf-camera-overlay"
          onClick={stopCamera}
        >
          <section
            className="sf-camera-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sf-camera-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="sf-camera-header">
              <div>
                <span className="sf-eyebrow">KAMERA TANAMAN</span>
                <h2 id="sf-camera-title">Ambil foto</h2>
              </div>

              <button
                type="button"
                className="sf-camera-close"
                onClick={stopCamera}
                aria-label="Tutup kamera"
              >
                <X size={21} />
              </button>
            </header>

            <div className="sf-camera-stage">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                aria-label="Pratinjau kamera tanaman"
              />

              {cameraBusy && (
                <div className="sf-camera-loading">
                  Membuka kamera...
                </div>
              )}

              {!cameraBusy && cameraStream && (
                <div className="sf-camera-guide">
                  Arahkan ke bagian tanaman yang bermasalah
                </div>
              )}
            </div>

            {cameraError && (
              <div className="sf-camera-error" role="alert">
                <AlertCircle size={17} />
                <p>{cameraError}</p>
              </div>
            )}

            <div className="sf-camera-controls">
              <button
                type="button"
                className="sf-camera-switch"
                onClick={switchCamera}
                disabled={cameraBusy}
                aria-label="Ganti kamera depan atau belakang"
              >
                <RotateCcw size={19} />
                <span>Balik kamera</span>
              </button>

              <button
                type="button"
                className="sf-camera-capture"
                onClick={capturePhoto}
                disabled={cameraBusy || !cameraStream}
                aria-label="Ambil foto tanaman"
              >
                <span />
              </button>

              <button
                type="button"
                className="sf-camera-cancel"
                onClick={stopCamera}
              >
                Batal
              </button>
            </div>
          </section>
        </div>
      )}

      {/* PESAN AKSI */}
      {feedback && (
        <div className="sf-toast" role="status" aria-live="polite">
          <CheckCircle2 size={17} />
          <span>{feedback}</span>

          <button
            type="button"
            onClick={() => setFeedback('')}
            aria-label="Tutup pesan"
          >
            <X size={15} />
          </button>
        </div>
      )}
    </main>
  );
}