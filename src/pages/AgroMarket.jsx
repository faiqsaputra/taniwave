import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/layout/Navbar';

import {
  ArrowDownUp,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  HandCoins,
  Leaf,
  MapPin,
  Package,
  Plus,
  RefreshCw,
  Search,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Sprout,
  Store,
  Tag,
  Truck,
  Users,
  Wallet,
  Wheat,
  X,
  XCircle,
} from 'lucide-react';

import '../css/AgroMarket.css';

const STORAGE_KEY = 'taniwave-agro-market-v1';

const FARMER_NAME = 'Tani Makmur';
const BUYER_NAME = 'UMKM Sambal Makmur';

const ACTIVE_ORDER_STATUSES = [
  'pending',
  'confirmed',
  'ready',
  'shipping',
];

const OCCUPYING_ORDER_STATUSES = [
  ...ACTIVE_ORDER_STATUSES,
  'completed',
];

const GRADE_RANK = {
  C: 1,
  B: 2,
  A: 3,
};

const GRADE_LABEL = {
  A: 'Grade A',
  B: 'Grade B',
  C: 'Grade C',
};

const ORDER_STATUS = {
  pending: 'Menunggu konfirmasi',
  confirmed: 'Dikonfirmasi',
  ready: 'Siap dipenuhi',
  shipping: 'Dalam pengiriman',
  completed: 'Selesai',
  rejected: 'Ditolak',
  cancelled: 'Dibatalkan',
};

const ORDER_STATUS_DESCRIPTION = {
  pending: 'Stok telah dicadangkan sementara sambil menunggu keputusan penjual.',
  confirmed: 'Penjual telah menerima pesanan.',
  ready: 'Penjual sedang menyiapkan hasil panen.',
  shipping: 'Pesanan dalam proses pemenuhan atau pengiriman.',
  completed: 'Pesanan selesai dan stok dihitung sebagai terjual.',
  rejected: 'Pesanan ditolak dan stok yang dicadangkan telah dilepas.',
  cancelled: 'Pesanan dibatalkan dan stok yang dicadangkan telah dilepas.',
};

function todayISO() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

function dateOffset(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

function dateOffsetFromToday(days) {
  return new Date(`${dateOffset(days)}T00:00:00`);
}

function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function formatNumber(value) {
  return new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 1,
  }).format(Number(value) || 0);
}

function formatDate(value) {
  if (!value) return 'Belum ditentukan';

  return new Date(`${value}T00:00:00`).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function createId(prefix = 'market') {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

function normalizeText(value) {
  return String(value || '')
    .trim()
    .toLocaleLowerCase('id-ID')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

function sameCommodity(a, b) {
  return normalizeText(a) === normalizeText(b);
}

function sameLocation(a, b) {
  const locationA = normalizeText(a);
  const locationB = normalizeText(b);

  return (
    Boolean(locationA) &&
    Boolean(locationB) &&
    (locationA === locationB ||
      locationA.includes(locationB) ||
      locationB.includes(locationA))
  );
}

/* =========================================
   DATA SIMULASI
========================================= */

function createDemoMarket() {
  const listings = [
    {
      id: 'listing-chili-b',
      commodity: 'Cabai merah keriting',
      variety: 'Cabai merah keriting',
      grade: 'B',
      quantity: 20,
      unit: 'kg',
      price: 25000,
      seller: FARMER_NAME,
      location: 'Jepara',
      availableDate: dateOffset(2),
      active: true,
      source: 'AgroERP · demo',
      description:
        'Cabai hasil sortir, cocok untuk kebutuhan pedagang dan UMKM olahan.',
      createdAt: dateOffset(-3),
    },
    {
      id: 'listing-chili-a',
      commodity: 'Cabai merah keriting',
      variety: 'Cabai merah keriting',
      grade: 'A',
      quantity: 8,
      unit: 'kg',
      price: 32000,
      seller: 'Kebun Bu Sari',
      location: 'Jepara',
      availableDate: dateOffset(1),
      active: true,
      source: 'Data demo',
      description:
        'Cabai pilihan dengan tampilan lebih seragam untuk kebutuhan premium.',
      createdAt: dateOffset(-2),
    },
    {
      id: 'listing-tomato-b',
      commodity: 'Tomat merah',
      variety: 'Tomat merah',
      grade: 'B',
      quantity: 35,
      unit: 'kg',
      price: 14000,
      seller: 'Tani Berkah',
      location: 'Demak',
      availableDate: dateOffset(1),
      active: true,
      source: 'Data demo',
      description:
        'Tomat untuk pedagang sayur, rumah makan, dan kebutuhan harian.',
      createdAt: dateOffset(-2),
    },
    {
      id: 'listing-corn-a',
      commodity: 'Jagung manis',
      variety: 'Jagung manis',
      grade: 'A',
      quantity: 80,
      unit: 'kg',
      price: 6500,
      seller: 'Kebun Lestari',
      location: 'Semarang',
      availableDate: dateOffset(3),
      active: true,
      source: 'Data demo',
      description:
        'Jagung manis untuk pasar segar dan usaha makanan.',
      createdAt: dateOffset(-1),
    },
  ];

  const demands = [
    {
      id: 'demand-chili-1',
      commodity: 'Cabai merah keriting',
      minGrade: 'B',
      minQty: 15,
      maxQty: 20,
      maxPrice: 27000,
      buyer: BUYER_NAME,
      location: 'Jepara',
      needBy: dateOffset(2),
      allowPartial: true,
      recurring: 'Setiap Jumat',
      active: true,
      description:
        'Kebutuhan bahan baku cabai untuk produksi sambal.',
      createdAt: dateOffset(-2),
    },
    {
      id: 'demand-tomato-1',
      commodity: 'Tomat merah',
      minGrade: 'B',
      minQty: 40,
      maxQty: 50,
      maxPrice: 15000,
      buyer: 'Dapur Sehat',
      location: 'Demak',
      needBy: dateOffset(2),
      allowPartial: true,
      recurring: 'Satu kali',
      active: true,
      description:
        'Kebutuhan tomat untuk persiapan bahan makanan.',
      createdAt: dateOffset(-1),
    },
    {
      id: 'demand-corn-1',
      commodity: 'Jagung manis',
      minGrade: 'B',
      minQty: 25,
      maxQty: 40,
      maxPrice: 7000,
      buyer: 'Warung Jagung Ceria',
      location: 'Semarang',
      needBy: dateOffset(4),
      allowPartial: true,
      recurring: 'Setiap minggu',
      active: true,
      description:
        'Jagung manis untuk penjualan makanan siap santap.',
      createdAt: dateOffset(-1),
    },
  ];

  const orders = [
    {
      id: 'order-demo-1',
      listingId: 'listing-chili-b',
      demandId: 'demand-chili-1',
      buyer: BUYER_NAME,
      seller: FARMER_NAME,
      commodity: 'Cabai merah keriting',
      grade: 'B',
      quantity: 5,
      unit: 'kg',
      unitPrice: 25000,
      total: 125000,
      status: 'confirmed',
      paymentStatus: 'unpaid',
      createdAt: dateOffset(-1),
    },
  ];

  return { listings, demands, orders };
}

function loadInitialMarket() {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (raw) {
        const parsed = JSON.parse(raw);

        if (
          Array.isArray(parsed.listings) &&
          Array.isArray(parsed.demands) &&
          Array.isArray(parsed.orders)
        ) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('Gagal membaca data Agro Market:', error);
    }
  }

  return createDemoMarket();
}

/* =========================================
   STOK DAN RESERVASI
========================================= */

/**
 * quantity = total volume dalam penawaran.
 *
 * available = total volume - reservasi aktif - jumlah terjual.
 * Penolakan dan pembatalan tidak lagi menggunakan stok.
 */
function getListingMetrics(listing, orders) {
  const listingOrders = orders.filter(
    (order) => order.listingId === listing.id
  );

  const reserved = listingOrders
    .filter((order) => ACTIVE_ORDER_STATUSES.includes(order.status))
    .reduce((total, order) => total + Number(order.quantity || 0), 0);

  const sold = listingOrders
    .filter((order) => order.status === 'completed')
    .reduce((total, order) => total + Number(order.quantity || 0), 0);

  const occupied = reserved + sold;

  return {
    total: Number(listing.quantity || 0),
    reserved,
    sold,
    available: Math.max(0, Number(listing.quantity || 0) - occupied),
  };
}

function getDemandCommitted(demand, orders) {
  return orders
    .filter(
      (order) =>
        order.demandId === demand.id &&
        OCCUPYING_ORDER_STATUSES.includes(order.status)
    )
    .reduce((total, order) => total + Number(order.quantity || 0), 0);
}

/* =========================================
   MATCHING ENGINE
========================================= */

/**
 * Versi awal memakai pencocokan berbasis aturan:
 * komoditas, kualitas minimum, anggaran, tanggal,
 * lokasi, dan volume yang masih diperlukan.
 *
 * Belum menggunakan machine learning maupun data eksternal.
 */
function evaluateMatch(listing, demand, orders) {
  const metrics = getListingMetrics(listing, orders);
  const committed = getDemandCommitted(demand, orders);

  const quantityNeeded = Math.max(
    0,
    Number(demand.minQty || 0) - committed
  );

  const remainingMax = Math.max(
    0,
    Number(demand.maxQty || 0) - committed
  );

  const result = {
    listing,
    demand,
    status: 'none',
    reasons: [],
    issues: [],
    available: metrics.available,
    committed,
    quantityNeeded,
    remainingMax,
    suggestedQty: 0,
    score: 0,
  };

  if (!listing.active || !demand.active) {
    return result;
  }

  if (quantityNeeded <= 0 || remainingMax <= 0) {
    result.issues.push('Target minimum permintaan sudah terpenuhi.');
    return result;
  }

  if (!sameCommodity(listing.commodity, demand.commodity)) {
    result.issues.push('Komoditas berbeda.');
    return result;
  }

  result.reasons.push('Komoditas sesuai');

  if (
    (GRADE_RANK[listing.grade] || 0) <
    (GRADE_RANK[demand.minGrade] || 0)
  ) {
    result.issues.push('Grade di bawah persyaratan pembeli.');
    return result;
  }

  result.reasons.push('Kualitas memenuhi syarat');

  if (Number(listing.price) > Number(demand.maxPrice)) {
    result.issues.push('Harga melebihi anggaran pembeli.');
    return result;
  }

  result.reasons.push('Harga sesuai anggaran');

  if (listing.availableDate > demand.needBy) {
    result.issues.push('Produk tersedia setelah jadwal kebutuhan.');
    return result;
  }

  result.reasons.push('Jadwal tersedia sesuai');

  if (!sameLocation(listing.location, demand.location)) {
    result.issues.push('Lokasi belum sesuai untuk simulasi ini.');
    return result;
  }

  result.reasons.push('Lokasi sesuai');

  if (metrics.available <= 0) {
    result.issues.push('Stok sudah habis atau sedang dicadangkan.');
    return result;
  }

  const suggestedQty = Math.min(
    metrics.available,
    remainingMax,
    quantityNeeded
  );

  if (metrics.available >= quantityNeeded) {
    result.status = 'matched';
    result.score = 100;
    result.reasons.push('Stok cukup untuk memenuhi kebutuhan minimum.');
  } else if (demand.allowPartial && metrics.available > 0) {
    result.status = 'partial';
    result.score = 80;
    result.reasons.push('Stok dapat memenuhi sebagian kebutuhan.');
  } else {
    result.issues.push('Stok belum mencukupi dan pembeli tidak menerima suplai parsial.');
    return result;
  }

  result.suggestedQty = suggestedQty;

  return result;
}

/* =========================================
   PRESENTATION HELPERS
========================================= */

function MarketMetric({ icon: Icon, label, value, caption }) {
  return (
    <article className="am-metric">
      <div className="am-metric-top">
        <span className="am-metric-icon">
          <Icon size={18} />
        </span>
        <span>{label}</span>
      </div>

      <strong>{value}</strong>

      {caption && <small>{caption}</small>}
    </article>
  );
}

function GradeBadge({ grade }) {
  return (
    <span className={`am-grade-badge am-grade-${grade}`}>
      {GRADE_LABEL[grade] || `Grade ${grade}`}
    </span>
  );
}

function StatusBadge({ status }) {
  return (
    <span className={`am-status-badge am-status-${status}`}>
      <span className="am-status-dot" />
      {ORDER_STATUS[status] || status}
    </span>
  );
}

function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="am-empty">
      <span className="am-empty-icon">
        <Icon size={25} />
      </span>

      <strong>{title}</strong>
      <p>{description}</p>

      {action && action}
    </div>
  );
}

function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="am-section-heading">
      <div>
        {eyebrow && <span className="am-eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>

      {action && <div className="am-section-action">{action}</div>}
    </div>
  );
}

function ModalActions({ onCancel, submitText }) {
  return (
    <div className="am-modal-actions">
      <button
        type="button"
        className="am-button am-button-ghost"
        onClick={onCancel}
      >
        Batal
      </button>

      <button
        type="submit"
        className="am-button am-button-primary"
      >
        <Check size={16} />
        {submitText}
      </button>
    </div>
  );
}

/* =========================================
   MAIN PAGE
========================================= */

export default function AgroMarket() {
  const [market, setMarket] = useState(loadInitialMarket);

  const [role, setRole] = useState('buyer');
  const [activeTab, setActiveTab] = useState('explore');

  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recommended');

  const [modal, setModal] = useState(null);
  const [modalError, setModalError] = useState('');
  const [notice, setNotice] = useState('');

  const { listings, demands, orders } = market;

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(market));
    } catch (error) {
      console.error('Gagal menyimpan Agro Market:', error);
      setNotice('Penyimpanan gagal. Periksa ruang penyimpanan browser.');
    }
  }, [market]);

  useEffect(() => {
    if (!notice) return undefined;

    const timeout = window.setTimeout(() => {
      setNotice('');
    }, 4000);

    return () => window.clearTimeout(timeout);
  }, [notice]);

  const closeModal = () => {
    setModal(null);
    setModalError('');
  };

  const openModal = (type, data = {}) => {
    setModalError('');
    setModal({ type, ...data });
  };

  const activeListings = listings.filter((listing) => listing.active);
  const activeDemands = demands.filter((demand) => demand.active);

  const currentOrders = orders.filter((order) =>
    role === 'farmer'
      ? order.seller === FARMER_NAME
      : order.buyer === BUYER_NAME
  );

  const ownListings = listings.filter(
    (listing) => listing.seller === FARMER_NAME
  );

  const ownDemands = demands.filter(
    (demand) => demand.buyer === BUYER_NAME
  );

  const metrics = useMemo(() => {
    const availableListingCount = activeListings.filter(
      (listing) => getListingMetrics(listing, orders).available > 0
    ).length;

    const availableQuantity = activeListings.reduce(
      (total, listing) =>
        total + getListingMetrics(listing, orders).available,
      0
    );

    const reservedQuantity = activeListings.reduce(
      (total, listing) =>
        total + getListingMetrics(listing, orders).reserved,
      0
    );

    const pendingOrders = currentOrders.filter(
      (order) => order.status === 'pending'
    ).length;

    return {
      availableListingCount,
      availableQuantity,
      reservedQuantity,
      pendingOrders,
    };
  }, [activeListings, orders, currentOrders]);

  const matchResults = useMemo(() => {
    if (role === 'buyer') {
      const results = [];

      ownDemands
        .filter((demand) => demand.active)
        .forEach((demand) => {
          activeListings.forEach((listing) => {
            const match = evaluateMatch(listing, demand, orders);

            if (match.status !== 'none') {
              results.push(match);
            }
          });
        });

      return results.sort((a, b) => {
        if (a.score !== b.score) return b.score - a.score;
        return b.available - a.available;
      });
    }

    const results = [];

    ownListings
      .filter((listing) => listing.active)
      .forEach((listing) => {
        activeDemands.forEach((demand) => {
          const match = evaluateMatch(listing, demand, orders);

          if (match.status !== 'none') {
            results.push(match);
          }
        });
      });

    return results.sort((a, b) => {
      if (a.score !== b.score) return b.score - a.score;
      return b.available - a.available;
    });
  }, [
    role,
    ownDemands,
    ownListings,
    activeListings,
    activeDemands,
    orders,
  ]);

  const filteredListings = useMemo(() => {
    let result = activeListings.filter((listing) => {
      const query = normalizeText(search);

      const matchesSearch =
        !query ||
        normalizeText(listing.commodity).includes(query) ||
        normalizeText(listing.seller).includes(query) ||
        normalizeText(listing.location).includes(query);

      const matchesGrade =
        gradeFilter === 'all' || listing.grade === gradeFilter;

      const hasStock =
        getListingMetrics(listing, orders).available > 0;

      return matchesSearch && matchesGrade && hasStock;
    });

    if (sortBy === 'price-asc') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'stock-desc') {
      result = [...result].sort(
        (a, b) =>
          getListingMetrics(b, orders).available -
          getListingMetrics(a, orders).available
      );
    } else {
      result = [...result].sort((a, b) => {
        const aMatch = matchResults.some(
          (match) =>
            match.listing.id === a.id &&
            match.status === 'matched'
        );
        const bMatch = matchResults.some(
          (match) =>
            match.listing.id === b.id &&
            match.status === 'matched'
        );

        return Number(bMatch) - Number(aMatch);
      });
    }

    return result;
  }, [
    activeListings,
    search,
    gradeFilter,
    sortBy,
    orders,
    matchResults,
  ]);

  const orderListing = listings.find(
    (listing) => listing.id === modal?.listingId
  );

  const orderDemand = demands.find(
    (demand) => demand.id === modal?.demandId
  );

  const orderListingMetrics = orderListing
    ? getListingMetrics(orderListing, orders)
    : null;

  const orderDemandCommitted = orderDemand
    ? getDemandCommitted(orderDemand, orders)
    : 0;

  const suggestedOrderQty =
    orderListing && orderListingMetrics
      ? Math.max(
          0,
          Math.min(
            orderListingMetrics.available,
            orderDemand
              ? Math.max(
                  0,
                  Math.min(
                    orderDemand.maxQty - orderDemandCommitted,
                    orderDemand.minQty - orderDemandCommitted
                  )
                )
              : orderListingMetrics.available
          )
        )
      : 0;

  const changeRole = (nextRole) => {
    setRole(nextRole);
    setActiveTab('explore');
    setSearch('');
    setGradeFilter('all');
    setNotice(
      nextRole === 'farmer'
        ? 'Mode Petani aktif. Penawaran dan pesanan menampilkan data demo Tani Makmur.'
        : 'Mode Pembeli aktif. Produk, kebutuhan, dan pesanan menampilkan data demo UMKM Sambal Makmur.'
    );
  };

  /* -----------------------------------------
     LISTING
  ----------------------------------------- */

  const handleCreateListing = (event) => {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    const commodity = String(form.get('commodity') || '').trim();
    const quantity = Number(form.get('quantity'));
    const price = Number(form.get('price'));

    if (!commodity || quantity <= 0 || price <= 0) {
      setModalError('Lengkapi komoditas, stok, dan harga dengan benar.');
      return;
    }

    const listing = {
      id: createId('listing'),
      commodity,
      variety: String(form.get('variety') || commodity).trim(),
      grade: form.get('grade'),
      quantity,
      unit: 'kg',
      price,
      seller: FARMER_NAME,
      location: String(form.get('location') || '').trim(),
      availableDate: form.get('availableDate'),
      active: true,
      source: 'Penawaran demo',
      description: String(form.get('description') || '').trim(),
      createdAt: todayISO(),
    };

    setMarket((previous) => ({
      ...previous,
      listings: [listing, ...previous.listings],
    }));

    closeModal();
    setActiveTab('offers');
    setNotice('Penawaran berhasil dibuat. Stok simulasi sudah masuk marketplace.');
  };

  const toggleListing = (listingId) => {
    const listing = listings.find((item) => item.id === listingId);
    if (!listing) return;

    const nextActive = !listing.active;

    setMarket((previous) => ({
      ...previous,
      listings: previous.listings.map((item) =>
        item.id === listingId
          ? { ...item, active: nextActive }
          : item
      ),
    }));

    setNotice(
      nextActive
        ? 'Penawaran kembali aktif.'
        : 'Penawaran dinonaktifkan. Pesanan yang sudah ada tetap diproses.'
    );
  };

  /* -----------------------------------------
     BUYER DEMAND
  ----------------------------------------- */

  const handleCreateDemand = (event) => {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    const minQty = Number(form.get('minQty'));
    const maxQty = Number(form.get('maxQty'));
    const maxPrice = Number(form.get('maxPrice'));

    if (
      !String(form.get('commodity') || '').trim() ||
      minQty <= 0 ||
      maxQty < minQty ||
      maxPrice <= 0
    ) {
      setModalError(
        'Periksa kembali komoditas, jumlah minimum, maksimum, dan anggaran.'
      );
      return;
    }

    const demand = {
      id: createId('demand'),
      commodity: String(form.get('commodity')).trim(),
      minGrade: form.get('minGrade'),
      minQty,
      maxQty,
      maxPrice,
      buyer: BUYER_NAME,
      location: String(form.get('location') || '').trim(),
      needBy: form.get('needBy'),
      allowPartial: form.get('allowPartial') === 'on',
      recurring: String(form.get('recurring') || 'Satu kali'),
      active: true,
      description: String(form.get('description') || '').trim(),
      createdAt: todayISO(),
    };

    setMarket((previous) => ({
      ...previous,
      demands: [demand, ...previous.demands],
    }));

    closeModal();
    setActiveTab('offers');
    setNotice(
      'Kebutuhan berhasil dipublikasikan. Sistem akan mencocokkannya dengan penawaran yang tersedia.'
    );
  };

  const toggleDemand = (demandId) => {
    setMarket((previous) => ({
      ...previous,
      demands: previous.demands.map((demand) =>
        demand.id === demandId
          ? { ...demand, active: !demand.active }
          : demand
      ),
    }));

    setNotice('Status kebutuhan berhasil diperbarui.');
  };

  /* -----------------------------------------
     ORDER CREATION AND RESERVATION
  ----------------------------------------- */

  const handleCreateOrder = (event) => {
    event.preventDefault();

    if (!orderListing || !orderListingMetrics) {
      setModalError('Penawaran tidak ditemukan.');
      return;
    }

    if (!orderListing.active) {
      setModalError('Penawaran sudah tidak aktif.');
      return;
    }

    const form = new FormData(event.currentTarget);
    const quantity = Number(form.get('quantity'));

    const freshMetrics = getListingMetrics(orderListing, orders);

    if (quantity <= 0 || !Number.isFinite(quantity)) {
      setModalError('Jumlah pesanan harus lebih besar dari nol.');
      return;
    }

    if (quantity > freshMetrics.available) {
      setModalError(
        `Stok yang dapat dipesan hanya ${formatNumber(
          freshMetrics.available
        )} kg. Stok yang telah dipesan tidak dapat digunakan ulang.`
      );
      return;
    }

    if (orderDemand) {
      const committed = getDemandCommitted(orderDemand, orders);
      const remainingMax = Math.max(
        0,
        orderDemand.maxQty - committed
      );

      if (quantity > remainingMax) {
        setModalError(
          `Kebutuhan ini masih menerima maksimal ${formatNumber(
            remainingMax
          )} kg pada saat ini.`
        );
        return;
      }

      if (
        !evaluateMatch(orderListing, orderDemand, orders).status ||
        evaluateMatch(orderListing, orderDemand, orders).status === 'none'
      ) {
        setModalError(
          'Penawaran sudah tidak memenuhi kriteria permintaan tersebut.'
        );
        return;
      }
    }

    const order = {
      id: createId('order'),
      listingId: orderListing.id,
      demandId: orderDemand?.id || null,
      buyer: BUYER_NAME,
      seller: orderListing.seller,
      commodity: orderListing.commodity,
      grade: orderListing.grade,
      quantity,
      unit: orderListing.unit || 'kg',
      unitPrice: Number(orderListing.price),
      total: quantity * Number(orderListing.price),
      status: 'pending',
      paymentStatus: 'unpaid',
      createdAt: todayISO(),
    };

    setMarket((previous) => ({
      ...previous,
      orders: [order, ...previous.orders],
    }));

    closeModal();
    setRole('buyer');
    setActiveTab('orders');
    setNotice(
      `Pesanan dibuat. ${formatNumber(
        quantity
      )} kg stok dicadangkan sementara menunggu konfirmasi penjual.`
    );
  };

  const changeOrderStatus = (orderId, nextStatus) => {
    const targetOrder = orders.find((order) => order.id === orderId);
    if (!targetOrder) return;

    if (
      nextStatus === 'rejected' ||
      nextStatus === 'cancelled'
    ) {
      const confirmed = window.confirm(
        'Batalkan atau tolak pesanan ini? Stok yang dicadangkan akan dilepas.'
      );

      if (!confirmed) return;
    }

    setMarket((previous) => ({
      ...previous,
      orders: previous.orders.map((order) =>
        order.id === orderId
          ? { ...order, status: nextStatus }
          : order
      ),
    }));

    const messages = {
      confirmed: 'Pesanan diterima. Stok tetap dicadangkan.',
      ready: 'Pesanan siap dipenuhi.',
      shipping: 'Status pesanan diperbarui menjadi dalam pengiriman.',
      completed: 'Pesanan selesai. Barang dihitung sebagai terjual.',
      rejected: 'Pesanan ditolak. Cadangan stok dilepas.',
      cancelled: 'Pesanan dibatalkan. Cadangan stok dilepas.',
    };

    setNotice(messages[nextStatus] || 'Status pesanan diperbarui.');
  };

  const markOrderPaid = (orderId) => {
    setMarket((previous) => ({
      ...previous,
      orders: previous.orders.map((order) =>
        order.id === orderId
          ? { ...order, paymentStatus: 'paid' }
          : order
      ),
    }));

    setNotice(
      'Pembayaran ditandai lunas pada simulasi. Belum ada payment gateway aktif.'
    );
  };

  const resetDemo = () => {
    const confirmed = window.confirm(
      'Reset seluruh data Agro Market di browser ini ke data simulasi awal?'
    );

    if (!confirmed) return;

    const demo = createDemoMarket();
    setMarket(demo);
    setRole('buyer');
    setActiveTab('explore');
    setSearch('');
    setGradeFilter('all');
    setSortBy('recommended');
    closeModal();
    setNotice('Data demo Agro Market telah direset.');
  };

  /* -----------------------------------------
     NAVIGATION
  ----------------------------------------- */

  const tabs = [
    {
      id: 'explore',
      label: role === 'buyer' ? 'Jelajahi' : 'Permintaan pasar',
      icon: role === 'buyer' ? ShoppingBag : Users,
    },
    {
      id: 'matches',
      label: 'Kecocokan',
      icon: BadgeCheck,
      count: matchResults.length,
    },
    {
      id: 'offers',
      label: role === 'buyer' ? 'Kebutuhan saya' : 'Penawaran saya',
      icon: role === 'buyer' ? ClipboardIcon : Store,
    },
    {
      id: 'orders',
      label: 'Pesanan',
      icon: ShoppingCart,
      count: currentOrders.filter(
        (order) =>
          order.status === 'pending' ||
          order.status === 'confirmed'
      ).length,
    },
  ];

  const pageStats =
    role === 'buyer'
      ? [
          {
            icon: ShoppingBag,
            label: 'Produk tersedia',
            value: metrics.availableListingCount,
            caption: 'Penawaran dengan stok',
          },
          {
            icon: BadgeCheck,
            label: 'Kecocokan',
            value: matchResults.length,
            caption: 'Kandidat yang memenuhi syarat',
          },
          {
            icon: ShoppingCart,
            label: 'Pesanan aktif',
            value: currentOrders.filter(
              (order) =>
                ACTIVE_ORDER_STATUSES.includes(order.status)
            ).length,
            caption: 'Pesanan Anda',
          },
        ]
      : [
          {
            icon: Store,
            label: 'Penawaran aktif',
            value: ownListings.filter((listing) => listing.active).length,
            caption: 'Penawaran milik Tani Makmur',
          },
          {
            icon: BadgeCheck,
            label: 'Kecocokan',
            value: matchResults.length,
            caption: 'Peluang permintaan pasar',
          },
          {
            icon: Package,
            label: 'Stok dicadangkan',
            value: `${formatNumber(
              ownListings.reduce(
                (total, listing) =>
                  total +
                  getListingMetrics(listing, orders).reserved,
                0
              )
            )} kg`,
            caption: 'Pesanan yang belum selesai',
          },
        ];

  return (
    <div className="am-page">
      <Navbar />

      <main className="am-shell">
        {/* PAGE HEADER */}
        <header className="am-page-header">
          <div className="am-title-group">
            <div className="am-title-icon">
              <ShoppingBag size={24} />
            </div>

            <div>
              <div className="am-title-line">
                <h1>Agro Market</h1>
                <span className="am-demo-label">DATA DEMO</span>
              </div>

              <p>
                Temukan hasil panen dan cocokkan dengan kebutuhan pasar.
              </p>
            </div>
          </div>

          <div className="am-role-switch" aria-label="Pilih mode demo">
            <button
              type="button"
              className={role === 'farmer' ? 'active' : ''}
              onClick={() => changeRole('farmer')}
            >
              <Sprout size={16} />
              Petani
            </button>

            <button
              type="button"
              className={role === 'buyer' ? 'active' : ''}
              onClick={() => changeRole('buyer')}
            >
              <ShoppingBag size={16} />
              Pembeli
            </button>
          </div>
        </header>

        {/* INTRO BANNER */}
        <section className="am-hero">
          <div className="am-hero-copy">
            <span className="am-hero-eyebrow">
              SUPPLY <span>×</span> DEMAND
            </span>

            <h2>
              {role === 'buyer'
                ? 'Temukan hasil panen yang sesuai kebutuhanmu.'
                : 'Temukan pembeli untuk hasil panenmu.'}
            </h2>

            <p>
              {role === 'buyer'
                ? 'Bandingkan kualitas, jumlah, harga, dan waktu ketersediaan sebelum memesan.'
                : 'Cocokkan stok berdasarkan grade, jumlah, harga, dan jadwal kebutuhan pembeli.'}
            </p>

            <div className="am-hero-actions">
              <button
                type="button"
                className="am-button am-button-light"
                onClick={() =>
                  role === 'buyer'
                    ? setActiveTab('explore')
                    : setActiveTab('matches')
                }
              >
                {role === 'buyer' ? 'Jelajahi produk' : 'Lihat kecocokan'}
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                className="am-button am-button-hero-outline"
                onClick={() =>
                  openModal(role === 'buyer' ? 'demand' : 'listing')
                }
              >
                <Plus size={16} />
                {role === 'buyer'
                  ? 'Buat kebutuhan'
                  : 'Pasang penawaran'}
              </button>
            </div>
          </div>

          <div className="am-hero-visual" aria-hidden="true">
            <div className="am-hero-orbit am-hero-orbit-one" />
            <div className="am-hero-orbit am-hero-orbit-two" />

            <div className="am-hero-product am-hero-product-one">
              <Sprout size={28} />
            </div>

            <div className="am-hero-product am-hero-product-two">
              <Wheat size={27} />
            </div>

            <div className="am-hero-center">
              <ShoppingBag size={35} />
            </div>
          </div>
        </section>

        {/* SUMMARY */}
        <section className="am-metrics-grid">
          {pageStats.map((item) => (
            <MarketMetric
              key={item.label}
              icon={item.icon}
              label={item.label}
              value={item.value}
              caption={item.caption}
            />
          ))}
        </section>

        {/* PRIMARY NAV */}
        <nav className="am-tabs" aria-label="Navigasi Agro Market">
          {tabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                className={`am-tab ${
                  activeTab === tab.id ? 'active' : ''
                }`}
                onClick={() => setActiveTab(tab.id)}
                aria-current={activeTab === tab.id ? 'page' : undefined}
              >
                <Icon size={17} />
                <span>{tab.label}</span>

                {tab.count > 0 && (
                  <span className="am-tab-count">{tab.count}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* PAGE CONTENT */}
        <div className="am-content">
          {/* =================================
              EXPLORE
          ================================= */}
          {activeTab === 'explore' && role === 'buyer' && (
            <>
              <SectionHeading
                eyebrow="HASIL PANEN TERSEDIA"
                title="Jelajahi produk"
                description="Pilih hasil panen berdasarkan komoditas, grade, stok, dan harga."
                action={
                  <button
                    type="button"
                    className="am-button am-button-secondary"
                    onClick={() => openModal('demand')}
                  >
                    <Plus size={16} />
                    Buat kebutuhan
                  </button>
                }
              />

              <div className="am-filter-bar">
                <label className="am-search">
                  <Search size={18} />
                  <input
                    type="search"
                    placeholder="Cari komoditas, petani, lokasi..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      aria-label="Hapus pencarian"
                    >
                      <X size={15} />
                    </button>
                  )}
                </label>

                <label className="am-filter-control">
                  <SlidersHorizontal size={15} />
                  <select
                    value={gradeFilter}
                    onChange={(event) => setGradeFilter(event.target.value)}
                    aria-label="Filter grade"
                  >
                    <option value="all">Semua grade</option>
                    <option value="A">Grade A</option>
                    <option value="B">Grade B</option>
                    <option value="C">Grade C</option>
                  </select>
                  <ChevronDown size={14} />
                </label>

                <label className="am-filter-control am-sort-control">
                  <ArrowDownUp size={15} />
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                    aria-label="Urutkan produk"
                  >
                    <option value="recommended">Rekomendasi</option>
                    <option value="price-asc">Harga terendah</option>
                    <option value="price-desc">Harga tertinggi</option>
                    <option value="stock-desc">Stok terbanyak</option>
                  </select>
                  <ChevronDown size={14} />
                </label>
              </div>

              {filteredListings.length === 0 ? (
                <EmptyState
                  icon={Search}
                  title="Produk belum ditemukan"
                  description="Coba ubah pencarian atau filter untuk melihat penawaran lain."
                />
              ) : (
                <div className="am-product-grid">
                  {filteredListings.map((listing) => {
                    const stock = getListingMetrics(listing, orders);

                    const match = matchResults.find(
                      (item) =>
                        item.listing.id === listing.id &&
                        item.status === 'matched'
                    );

                    return (
                      <article className="am-product-card" key={listing.id}>
                        <div className={`am-product-art am-art-${listing.grade}`}>
                          <span className="am-product-art-icon">
                            {listing.commodity
                              .toLowerCase()
                              .includes('cabai') ? (
                              <Sprout size={35} />
                            ) : listing.commodity
                                .toLowerCase()
                                .includes('jagung') ? (
                              <Wheat size={35} />
                            ) : (
                              <Leaf size={35} />
                            )}
                          </span>

                          <GradeBadge grade={listing.grade} />

                          {match && (
                            <span className="am-match-ribbon">
                              <BadgeCheck size={13} />
                              Cocok
                            </span>
                          )}
                        </div>

                        <div className="am-product-body">
                          <div className="am-product-title-row">
                            <div>
                              <h3>{listing.commodity}</h3>
                              <p>{listing.seller}</p>
                            </div>

                            <span className="am-seller-check">
                              <BadgeCheck size={17} />
                            </span>
                          </div>

                          <div className="am-product-details">
                            <span>
                              <MapPin size={14} />
                              {listing.location}
                            </span>
                            <span>
                              <CalendarDays size={14} />
                              {formatDate(listing.availableDate)}
                            </span>
                          </div>

                          <div className="am-stock-line">
                            <span>Stok siap dibeli</span>
                            <strong>
                              {formatNumber(stock.available)} {listing.unit}
                            </strong>
                          </div>

                          <div className="am-product-bottom">
                            <div>
                              <small>Harga per {listing.unit}</small>
                              <strong>{formatCurrency(listing.price)}</strong>
                            </div>

                            <button
                              type="button"
                              className="am-button am-button-primary am-buy-button"
                              disabled={
                                stock.available <= 0 || !listing.active
                              }
                              onClick={() =>
                                openModal('order', {
                                  listingId: listing.id,
                                  demandId: null,
                                })
                              }
                            >
                              <ShoppingCart size={15} />
                              Pesan
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {activeTab === 'explore' && role === 'farmer' && (
            <>
              <SectionHeading
                eyebrow="KEBUTUHAN PEMBELI"
                title="Permintaan pasar"
                description="Temukan kebutuhan pembeli yang bisa dipenuhi oleh hasil panenmu."
              />

              {activeDemands.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="Belum ada permintaan"
                  description="Permintaan pembeli akan muncul ketika tersedia di marketplace."
                />
              ) : (
                <div className="am-demand-grid">
                  {activeDemands.map((demand) => {
                    const committed = getDemandCommitted(demand, orders);
                    const remaining = Math.max(
                      0,
                      demand.minQty - committed
                    );

                    const possibleMatches = ownListings
                      .filter((listing) => listing.active)
                      .map((listing) =>
                        evaluateMatch(listing, demand, orders)
                      )
                      .filter((result) => result.status !== 'none');

                    return (
                      <article className="am-demand-card" key={demand.id}>
                        <div className="am-demand-top">
                          <span className="am-demand-icon">
                            <ShoppingBag size={20} />
                          </span>

                          <span className="am-demand-type">
                            {demand.recurring}
                          </span>
                        </div>

                        <h3>{demand.commodity}</h3>
                        <p className="am-demand-buyer">{demand.buyer}</p>

                        <div className="am-demand-chips">
                          <GradeBadge grade={demand.minGrade} />
                          <span className="am-chip">
                            {formatNumber(demand.minQty)}–{formatNumber(demand.maxQty)} kg
                          </span>
                        </div>

                        <div className="am-demand-info">
                          <div>
                            <span>Anggaran maksimal</span>
                            <strong>{formatCurrency(demand.maxPrice)}/kg</strong>
                          </div>
                          <div>
                            <span>Dibutuhkan</span>
                            <strong>{formatDate(demand.needBy)}</strong>
                          </div>
                          <div>
                            <span>Lokasi</span>
                            <strong>{demand.location}</strong>
                          </div>
                        </div>

                        {remaining > 0 && committed > 0 && (
                          <p className="am-demand-progress">
                            Sudah tercatat {formatNumber(committed)} kg pada
                            pesanan terkait.
                          </p>
                        )}

                        <button
                          type="button"
                          className="am-button am-button-secondary am-full-button"
                          onClick={() => setActiveTab('matches')}
                        >
                          {possibleMatches.length > 0
                            ? `${possibleMatches.length} kecocokan ditemukan`
                            : 'Periksa kecocokan'}
                          <ArrowRight size={15} />
                        </button>
                      </article>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* =================================
              MATCH RESULTS
          ================================= */}
          {activeTab === 'matches' && (
            <>
              <SectionHeading
                eyebrow="MARKETPLACE ENGINE"
                title={
                  role === 'buyer'
                    ? 'Pemasok yang sesuai'
                    : 'Peluang penjualan'
                }
                description={
                  role === 'buyer'
                    ? 'Penawaran diperiksa terhadap kebutuhanmu, termasuk grade, harga, jadwal, lokasi, dan stok.'
                    : 'Permintaan diperiksa terhadap penawaranmu berdasarkan kualitas, harga, lokasi, volume, dan jadwal.'
                }
              />

              <div className="am-match-method-note">
                <BadgeCheck size={18} />
                <p>
                  Kecocokan dihitung dari aturan yang dapat diperiksa. Label
                  cocok bukan jaminan transaksi; pembeli dan penjual tetap
                  perlu menyepakati pesanan.
                </p>
              </div>

              {matchResults.length === 0 ? (
                <EmptyState
                  icon={Search}
                  title="Belum ada kecocokan"
                  description={
                    role === 'buyer'
                      ? 'Buat kebutuhan atau ubah kriteria komoditas, grade, anggaran, lokasi, dan tanggal.'
                      : 'Pasang penawaran yang memenuhi kebutuhan pembeli, lalu periksa kembali hasil pencocokan.'
                  }
                  action={
                    <button
                      type="button"
                      className="am-button am-button-primary"
                      onClick={() =>
                        openModal(role === 'buyer' ? 'demand' : 'listing')
                      }
                    >
                      <Plus size={16} />
                      {role === 'buyer'
                        ? 'Buat kebutuhan'
                        : 'Pasang penawaran'}
                    </button>
                  }
                />
              ) : (
                <div className="am-match-list">
                  {matchResults.map((match) => {
                    const { listing, demand } = match;

                    return (
                      <article
                        className="am-match-card"
                        key={`${listing.id}-${demand.id}`}
                      >
                        <div className="am-match-main">
                          <div className="am-match-product-icon">
                            {listing.commodity.toLowerCase().includes('jagung') ? (
                              <Wheat size={24} />
                            ) : (
                              <Sprout size={24} />
                            )}
                          </div>

                          <div className="am-match-product-copy">
                            <span className="am-eyebrow">
                              {match.status === 'matched'
                                ? 'KECOCOKAN TERDETEKSI'
                                : 'KECOCOKAN SEBAGIAN'}
                            </span>

                            <h3>{listing.commodity}</h3>
                            <p>
                              {listing.seller} <span>·</span>{' '}
                              {listing.location}
                            </p>

                            <div className="am-demand-chips">
                              <GradeBadge grade={listing.grade} />
                              <span className="am-chip">
                                {formatNumber(match.available)} kg siap dibeli
                              </span>
                            </div>
                          </div>

                          <div
                            className={`am-match-score ${
                              match.status === 'partial' ? 'partial' : ''
                            }`}
                          >
                            <strong>{match.score}%</strong>
                            <span>kecocokan</span>
                          </div>
                        </div>

                        <div className="am-match-flow">
                          <div>
                            <span>Kebutuhan</span>
                            <strong>{demand.buyer}</strong>
                            <small>
                              {demand.commodity} · minimal Grade {demand.minGrade}
                            </small>
                          </div>

                          <ArrowRight size={20} />

                          <div>
                            <span>Penawaran</span>
                            <strong>{formatCurrency(listing.price)}/kg</strong>
                            <small>
                              Maksimal anggaran {formatCurrency(demand.maxPrice)}/kg
                            </small>
                          </div>
                        </div>

                        <div className="am-match-reasons">
                          {match.reasons.map((reason) => (
                            <span key={reason}>
                              <CheckCircle2 size={13} />
                              {reason}
                            </span>
                          ))}
                        </div>

                        <div className="am-match-footer">
                          <div>
                            <span>Jumlah yang direkomendasikan</span>
                            <strong>{formatNumber(match.suggestedQty)} kg</strong>
                          </div>

                          {role === 'buyer' ? (
                            <button
                              type="button"
                              className="am-button am-button-primary"
                              onClick={() =>
                                openModal('order', {
                                  listingId: listing.id,
                                  demandId: demand.id,
                                })
                              }
                            >
                              <ShoppingCart size={16} />
                              Buat pesanan
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="am-button am-button-secondary"
                              onClick={() => setActiveTab('offers')}
                            >
                              Kelola penawaran
                              <ArrowRight size={15} />
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* =================================
              MY OFFERS / MY DEMANDS
          ================================= */}
          {activeTab === 'offers' && role === 'farmer' && (
            <>
              <SectionHeading
                eyebrow="INVENTARIS PENAWARAN"
                title="Penawaran saya"
                description="Kelola penawaran dan volume yang dapat dibeli. Stok yang dicadangkan atau sudah terjual tidak tersedia untuk pesanan baru."
                action={
                  <button
                    type="button"
                    className="am-button am-button-primary"
                    onClick={() => openModal('listing')}
                  >
                    <Plus size={16} />
                    Pasang penawaran
                  </button>
                }
              />

              {ownListings.length === 0 ? (
                <EmptyState
                  icon={Store}
                  title="Belum ada penawaran"
                  description="Buat penawaran pertama untuk mulai mencocokkan hasil panen dengan kebutuhan pasar."
                  action={
                    <button
                      type="button"
                      className="am-button am-button-primary"
                      onClick={() => openModal('listing')}
                    >
                      <Plus size={16} />
                      Buat penawaran
                    </button>
                  }
                />
              ) : (
                <div className="am-managed-list">
                  {ownListings.map((listing) => {
                    const stock = getListingMetrics(listing, orders);

                    return (
                      <article className="am-managed-card" key={listing.id}>
                        <div className={`am-managed-icon am-art-${listing.grade}`}>
                          <Sprout size={24} />
                        </div>

                        <div className="am-managed-main">
                          <div className="am-managed-title">
                            <h3>{listing.commodity}</h3>
                            <GradeBadge grade={listing.grade} />
                            <span
                              className={`am-listing-state ${
                                listing.active ? 'active' : 'inactive'
                              }`}
                            >
                              {listing.active ? 'Aktif' : 'Nonaktif'}
                            </span>
                          </div>

                          <p>
                            {listing.location} · tersedia mulai{' '}
                            {formatDate(listing.availableDate)}
                          </p>

                          <div className="am-stock-breakdown">
                            <span>
                              Total {formatNumber(stock.total)} kg
                            </span>
                            <span>
                              Dicadangkan {formatNumber(stock.reserved)} kg
                            </span>
                            <span>
                              Terjual {formatNumber(stock.sold)} kg
                            </span>
                            <strong>
                              Siap {formatNumber(stock.available)} kg
                            </strong>
                          </div>
                        </div>

                        <div className="am-managed-right">
                          <strong>{formatCurrency(listing.price)}/kg</strong>

                          <button
                            type="button"
                            className="am-button am-button-secondary am-small-button"
                            onClick={() => toggleListing(listing.id)}
                          >
                            {listing.active ? 'Nonaktifkan' : 'Aktifkan'}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {activeTab === 'offers' && role === 'buyer' && (
            <>
              <SectionHeading
                eyebrow="KEBUTUHAN PEMBELIAN"
                title="Kebutuhan saya"
                description="Catat spesifikasi komoditas, volume, anggaran, dan waktu yang dibutuhkan."
                action={
                  <button
                    type="button"
                    className="am-button am-button-primary"
                    onClick={() => openModal('demand')}
                  >
                    <Plus size={16} />
                    Buat kebutuhan
                  </button>
                }
              />

              {ownDemands.length === 0 ? (
                <EmptyState
                  icon={ShoppingBag}
                  title="Belum ada kebutuhan"
                  description="Buat permintaan pembelian untuk mencocokkan kebutuhan dengan stok yang ditawarkan petani."
                  action={
                    <button
                      type="button"
                      className="am-button am-button-primary"
                      onClick={() => openModal('demand')}
                    >
                      <Plus size={16} />
                      Buat kebutuhan
                    </button>
                  }
                />
              ) : (
                <div className="am-demand-grid">
                  {ownDemands.map((demand) => {
                    const committed = getDemandCommitted(demand, orders);
                    const remaining = Math.max(
                      0,
                      demand.minQty - committed
                    );

                    const fulfilled = remaining === 0;

                    return (
                      <article className="am-demand-card" key={demand.id}>
                        <div className="am-demand-top">
                          <span className="am-demand-icon">
                            <ShoppingBag size={20} />
                          </span>

                          <span
                            className={`am-listing-state ${
                              demand.active ? 'active' : 'inactive'
                            }`}
                          >
                            {fulfilled
                              ? 'Minimum terpenuhi'
                              : demand.active
                                ? 'Aktif'
                                : 'Nonaktif'}
                          </span>
                        </div>

                        <h3>{demand.commodity}</h3>
                        <p className="am-demand-buyer">
                          {demand.recurring}
                        </p>

                        <div className="am-demand-chips">
                          <GradeBadge grade={demand.minGrade} />
                          <span className="am-chip">
                            {formatNumber(demand.minQty)}–{formatNumber(demand.maxQty)} kg
                          </span>
                        </div>

                        <div className="am-demand-info">
                          <div>
                            <span>Anggaran maksimal</span>
                            <strong>{formatCurrency(demand.maxPrice)}/kg</strong>
                          </div>
                          <div>
                            <span>Batas waktu</span>
                            <strong>{formatDate(demand.needBy)}</strong>
                          </div>
                          <div>
                            <span>Lokasi</span>
                            <strong>{demand.location}</strong>
                          </div>
                        </div>

                        <div className="am-demand-progress-wrap">
                          <div className="am-demand-progress-label">
                            <span>Volume tercatat dalam pesanan</span>
                            <strong>
                              {formatNumber(committed)} /{' '}
                              {formatNumber(demand.minQty)} kg
                            </strong>
                          </div>

                          <div className="am-progress">
                            <span
                              style={{
                                width: `${Math.min(
                                  100,
                                  (committed / demand.minQty) * 100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>

                        <div className="am-demand-card-actions">
                          <button
                            type="button"
                            className="am-button am-button-secondary"
                            onClick={() => {
                              setActiveTab('matches');
                              setNotice(
                                'Kecocokan dihitung dari penawaran yang masih aktif dan stok yang tersedia.'
                              );
                            }}
                          >
                            <BadgeCheck size={15} />
                            Lihat kecocokan
                          </button>

                          <button
                            type="button"
                            className="am-button am-button-ghost am-small-button"
                            onClick={() => toggleDemand(demand.id)}
                          >
                            {demand.active ? 'Jeda' : 'Aktifkan'}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* =================================
              ORDERS
          ================================= */}
          {activeTab === 'orders' && (
            <>
              <SectionHeading
                eyebrow="TRANSAKSI"
                title="Pesanan"
                description={
                  role === 'buyer'
                    ? 'Lacak status pesanan, progres pemenuhan, dan pembayaran.'
                    : 'Konfirmasi pesanan, siapkan hasil panen, dan perbarui status pemenuhan.'
                }
              />

              <div className="am-order-note">
                <Package size={18} />
                <p>
                  Pesanan berstatus menunggu konfirmasi, dikonfirmasi, siap
                  dipenuhi, atau dalam pengiriman menggunakan cadangan stok.
                  Setelah selesai, jumlahnya dihitung sebagai terjual.
                </p>
              </div>

              {currentOrders.length === 0 ? (
                <EmptyState
                  icon={ShoppingCart}
                  title="Belum ada pesanan"
                  description={
                    role === 'buyer'
                      ? 'Pesanan yang kamu buat akan muncul di halaman ini.'
                      : 'Pesanan untuk penawaranmu akan muncul setelah pembeli mengajukan permintaan.'
                  }
                  action={
                    <button
                      type="button"
                      className="am-button am-button-primary"
                      onClick={() => setActiveTab('explore')}
                    >
                      {role === 'buyer'
                        ? 'Jelajahi produk'
                        : 'Lihat permintaan'}
                    </button>
                  }
                />
              ) : (
                <div className="am-order-list">
                  {currentOrders.map((order) => {
                    const canCancel = [
                      'pending',
                      'confirmed',
                      'ready',
                    ].includes(order.status);

                    return (
                      <article className="am-order-card" key={order.id}>
                        <div className="am-order-top">
                          <div className="am-order-product-icon">
                            <Package size={21} />
                          </div>

                          <div className="am-order-title">
                            <span>
                              PESANAN #{order.id.slice(-6).toUpperCase()}
                            </span>
                            <h3>{order.commodity}</h3>
                            <p>
                              {role === 'buyer'
                                ? `Penjual: ${order.seller}`
                                : `Pembeli: ${order.buyer}`}
                              {' · '}
                              {formatDate(order.createdAt)}
                            </p>
                          </div>

                          <StatusBadge status={order.status} />
                        </div>

                        <div className="am-order-details">
                          <div>
                            <span>Grade</span>
                            <strong>
                              <GradeBadge grade={order.grade} />
                            </strong>
                          </div>
                          <div>
                            <span>Jumlah</span>
                            <strong>{formatNumber(order.quantity)} kg</strong>
                          </div>
                          <div>
                            <span>Harga satuan</span>
                            <strong>{formatCurrency(order.unitPrice)}</strong>
                          </div>
                          <div>
                            <span>Nilai pesanan</span>
                            <strong>{formatCurrency(order.total)}</strong>
                          </div>
                        </div>

                        <div className="am-order-bottom">
                          <div className="am-order-payment">
                            <Wallet size={16} />

                            <span>
                              Pembayaran:{' '}
                              <strong
                                className={
                                  order.paymentStatus === 'paid'
                                    ? 'paid'
                                    : 'unpaid'
                                }
                              >
                                {order.paymentStatus === 'paid'
                                  ? 'Lunas (demo)'
                                  : 'Belum lunas'}
                              </strong>
                            </span>
                          </div>

                          <div className="am-order-actions">
                            {role === 'farmer' &&
                              order.status === 'pending' && (
                                <>
                                  <button
                                    type="button"
                                    className="am-button am-button-ghost am-small-button"
                                    onClick={() =>
                                      changeOrderStatus(order.id, 'rejected')
                                    }
                                  >
                                    <XCircle size={15} />
                                    Tolak
                                  </button>

                                  <button
                                    type="button"
                                    className="am-button am-button-primary am-small-button"
                                    onClick={() =>
                                      changeOrderStatus(order.id, 'confirmed')
                                    }
                                  >
                                    <Check size={15} />
                                    Terima
                                  </button>
                                </>
                              )}

                            {role === 'farmer' &&
                              order.status === 'confirmed' && (
                                <button
                                  type="button"
                                  className="am-button am-button-primary am-small-button"
                                  onClick={() =>
                                    changeOrderStatus(order.id, 'ready')
                                  }
                                >
                                  <Package size={15} />
                                  Tandai siap
                                </button>
                              )}

                            {role === 'farmer' &&
                              order.status === 'ready' && (
                                <button
                                  type="button"
                                  className="am-button am-button-primary am-small-button"
                                  onClick={() =>
                                    changeOrderStatus(order.id, 'shipping')
                                  }
                                >
                                  <Truck size={15} />
                                  Mulai pengiriman
                                </button>
                              )}

                            {role === 'buyer' &&
                              order.status === 'shipping' && (
                                <button
                                  type="button"
                                  className="am-button am-button-primary am-small-button"
                                  onClick={() =>
                                    changeOrderStatus(order.id, 'completed')
                                  }
                                >
                                  <CheckCircle2 size={15} />
                                  Konfirmasi diterima
                                </button>
                              )}

                            {canCancel && (
                              <button
                                type="button"
                                className="am-button am-button-ghost am-small-button"
                                onClick={() =>
                                  changeOrderStatus(order.id, 'cancelled')
                                }
                              >
                                Batalkan
                              </button>
                            )}

                            {order.paymentStatus !== 'paid' &&
                              (order.status === 'completed' ||
                                role === 'farmer') && (
                                <button
                                  type="button"
                                  className="am-button am-button-secondary am-small-button"
                                  onClick={() => markOrderPaid(order.id)}
                                >
                                  <HandCoins size={15} />
                                  Tandai lunas
                                </button>
                              )}
                          </div>
                        </div>

                        <p className="am-order-status-copy">
                          {ORDER_STATUS_DESCRIPTION[order.status]}
                        </p>
                      </article>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* FOOTER */}
        <footer className="am-footer">
          <div>
            <span className="am-footer-icon">
              <Leaf size={15} />
            </span>
            <strong>Agro Market</strong>
            <span>· TANIWAVE</span>
          </div>

          <p>
            Data simulasi pada browser ini. Harga dan ketersediaan bukan data
            pasar aktual.
          </p>

          <button type="button" onClick={resetDemo}>
            <RefreshCw size={13} />
            Reset demo
          </button>
        </footer>
      </main>

      {/* NOTICE */}
      {notice && (
        <div className="am-toast" role="status">
          <CheckCircle2 size={18} />
          <span>{notice}</span>
          <button
            type="button"
            onClick={() => setNotice('')}
            aria-label="Tutup notifikasi"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* =====================================
          MODALS
      ===================================== */}
      {modal && (
        <div
          className="am-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section
            className="am-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="am-modal-title"
          >
            <header className="am-modal-header">
              <div>
                <span className="am-eyebrow">AGRO MARKET</span>

                <h2 id="am-modal-title">
                  {modal.type === 'listing' && 'Pasang penawaran'}
                  {modal.type === 'demand' && 'Buat kebutuhan pembelian'}
                  {modal.type === 'order' && 'Buat pesanan'}
                </h2>
              </div>

              <button
                type="button"
                className="am-close-button"
                onClick={closeModal}
                aria-label="Tutup formulir"
              >
                <X size={19} />
              </button>
            </header>

            {modalError && (
              <div className="am-form-error" role="alert">
                <XCircle size={17} />
                <span>{modalError}</span>
              </div>
            )}

            {/* CREATE LISTING */}
            {modal.type === 'listing' && (
              <form className="am-form" onSubmit={handleCreateListing}>
                <div className="am-form-note">
                  <Sprout size={18} />
                  <p>
                    Prototipe ini memakai stok simulasi. Koneksi langsung ke
                    stok AgroERP belum diaktifkan.
                  </p>
                </div>

                <label className="am-field">
                  <span>Nama komoditas *</span>
                  <input
                    name="commodity"
                    type="text"
                    placeholder="Contoh: Cabai merah keriting"
                    required
                    autoFocus
                  />
                </label>

                <div className="am-form-grid">
                  <label className="am-field">
                    <span>Grade *</span>
                    <select name="grade" defaultValue="B" required>
                      <option value="A">Grade A</option>
                      <option value="B">Grade B</option>
                      <option value="C">Grade C</option>
                    </select>
                  </label>

                  <label className="am-field">
                    <span>Stok yang ditawarkan (kg) *</span>
                    <input
                      name="quantity"
                      type="number"
                      min="0.1"
                      step="0.1"
                      placeholder="20"
                      required
                    />
                  </label>
                </div>

                <label className="am-field">
                  <span>Varietas atau spesifikasi</span>
                  <input
                    name="variety"
                    type="text"
                    placeholder="Boleh sama dengan nama komoditas"
                  />
                </label>

                <label className="am-field">
                  <span>Harga per kg (Rp) *</span>
                  <input
                    name="price"
                    type="number"
                    min="1"
                    step="100"
                    placeholder="25000"
                    required
                  />
                </label>

                <div className="am-form-grid">
                  <label className="am-field">
                    <span>Lokasi *</span>
                    <input
                      name="location"
                      type="text"
                      placeholder="Contoh: Jepara"
                      required
                    />
                  </label>

                  <label className="am-field">
                    <span>Tanggal tersedia *</span>
                    <input
                      name="availableDate"
                      type="date"
                      min={todayISO()}
                      defaultValue={dateOffset(1)}
                      required
                    />
                  </label>
                </div>

                <label className="am-field">
                  <span>Deskripsi (opsional)</span>
                  <textarea
                    name="description"
                    rows="3"
                    placeholder="Informasi kualitas dan kondisi hasil panen."
                  />
                </label>

                <ModalActions
                  onCancel={closeModal}
                  submitText="Publikasikan penawaran"
                />
              </form>
            )}

            {/* CREATE DEMAND */}
            {modal.type === 'demand' && (
              <form className="am-form" onSubmit={handleCreateDemand}>
                <label className="am-field">
                  <span>Komoditas yang dibutuhkan *</span>
                  <input
                    name="commodity"
                    type="text"
                    placeholder="Contoh: Cabai merah keriting"
                    required
                    autoFocus
                  />
                </label>

                <label className="am-field">
                  <span>Kualitas minimum *</span>
                  <select name="minGrade" defaultValue="B" required>
                    <option value="A">Minimal Grade A</option>
                    <option value="B">Minimal Grade B</option>
                    <option value="C">Minimal Grade C</option>
                  </select>
                  <small>
                    Grade yang lebih tinggi dianggap memenuhi batas minimum
                    pada simulasi awal.
                  </small>
                </label>

                <div className="am-form-grid">
                  <label className="am-field">
                    <span>Jumlah minimum (kg) *</span>
                    <input
                      name="minQty"
                      type="number"
                      min="0.1"
                      step="0.1"
                      placeholder="15"
                      required
                    />
                  </label>

                  <label className="am-field">
                    <span>Jumlah maksimum (kg) *</span>
                    <input
                      name="maxQty"
                      type="number"
                      min="0.1"
                      step="0.1"
                      placeholder="20"
                      required
                    />
                  </label>
                </div>

                <label className="am-field">
                  <span>Anggaran maksimum per kg (Rp) *</span>
                  <input
                    name="maxPrice"
                    type="number"
                    min="1"
                    step="100"
                    placeholder="27000"
                    required
                  />
                </label>

                <div className="am-form-grid">
                  <label className="am-field">
                    <span>Lokasi kebutuhan *</span>
                    <input
                      name="location"
                      type="text"
                      placeholder="Contoh: Jepara"
                      required
                    />
                  </label>

                  <label className="am-field">
                    <span>Dibutuhkan paling lambat *</span>
                    <input
                      name="needBy"
                      type="date"
                      min={todayISO()}
                      defaultValue={dateOffset(2)}
                      required
                    />
                  </label>
                </div>

                <label className="am-field">
                  <span>Frekuensi kebutuhan</span>
                  <select name="recurring" defaultValue="Satu kali">
                    <option>Satu kali</option>
                    <option>Setiap minggu</option>
                    <option>Setiap Jumat</option>
                    <option>Setiap bulan</option>
                  </select>
                </label>

                <label className="am-checkbox-field">
                  <input
                    name="allowPartial"
                    type="checkbox"
                    defaultChecked
                  />
                  <span>
                    <strong>Menerima suplai parsial</strong>
                    <small>
                      Penawaran yang belum memenuhi jumlah minimum tetap
                      dapat ditampilkan sebagai kecocokan sebagian.
                    </small>
                  </span>
                </label>

                <label className="am-field">
                  <span>Catatan kualitas (opsional)</span>
                  <textarea
                    name="description"
                    rows="3"
                    placeholder="Contoh: ukuran seragam, segar, tanpa kerusakan berat."
                  />
                </label>

                <ModalActions
                  onCancel={closeModal}
                  submitText="Publikasikan kebutuhan"
                />
              </form>
            )}

            {/* CREATE ORDER */}
            {modal.type === 'order' && orderListing && (
              <form className="am-form" onSubmit={handleCreateOrder}>
                <div className="am-order-product-summary">
                  <div className={`am-managed-icon am-art-${orderListing.grade}`}>
                    <Sprout size={25} />
                  </div>

                  <div>
                    <strong>{orderListing.commodity}</strong>
                    <span>
                      {orderListing.seller} · {orderListing.location}
                    </span>

                    <div className="am-demand-chips">
                      <GradeBadge grade={orderListing.grade} />
                      <span className="am-chip">
                        Tersedia {formatNumber(
                          orderListingMetrics?.available || 0
                        )} kg
                      </span>
                    </div>
                  </div>
                </div>

                <div className="am-order-summary-line">
                  <span>Harga penawaran</span>
                  <strong>{formatCurrency(orderListing.price)}/kg</strong>
                </div>

                {orderDemand && (
                  <div className="am-form-note">
                    <BadgeCheck size={18} />
                    <p>
                      Pesanan ini terhubung ke kebutuhan{' '}
                      <strong>{orderDemand.commodity}</strong>. Kuantitas
                      dibatasi agar tidak melebihi sisa kebutuhan.
                    </p>
                  </div>
                )}

                <label className="am-field">
                  <span>Jumlah yang dipesan (kg) *</span>
                  <input
                    name="quantity"
                    type="number"
                    min="0.1"
                    max={Math.min(
                      orderListingMetrics?.available || 0,
                      orderDemand
                        ? Math.max(
                            0,
                            orderDemand.maxQty -
                              orderDemandCommitted
                          )
                        : orderListingMetrics?.available || 0
                    )}
                    step="0.1"
                    defaultValue={
                      suggestedOrderQty > 0
                        ? suggestedOrderQty
                        : undefined
                    }
                    required
                    autoFocus
                    disabled={
                      !orderListing.active ||
                      !orderListingMetrics ||
                      orderListingMetrics.available <= 0
                    }
                  />

                  <small>
                    Stok siap dibeli: {formatNumber(
                      orderListingMetrics?.available || 0
                    )} kg. Jumlah yang sudah dicadangkan tidak bisa dipesan ulang.
                  </small>
                </label>

                <div className="am-order-total-preview">
                  <span>Nilai pesanan dihitung dari jumlah × harga.</span>
                  <strong>
                    {formatCurrency(
                      Number(orderListing.price) *
                        Number(suggestedOrderQty || 0)
                    )}
                  </strong>
                </div>

                <div className="am-form-note">
                  <Clock3 size={18} />
                  <p>
                    Setelah pesanan dibuat, stok langsung dicadangkan dalam
                    simulasi ini. Cadangan dilepas jika penjual menolak atau
                    pesanan dibatalkan.
                  </p>
                </div>

                <ModalActions
                  onCancel={closeModal}
                  submitText="Kirim pesanan"
                />
              </form>
            )}

            {modal.type === 'order' && !orderListing && (
              <div className="am-modal-error-state">
                <XCircle size={22} />
                <p>Penawaran tidak ditemukan. Tutup formulir dan pilih produk lain.</p>
                <button
                  type="button"
                  className="am-button am-button-primary"
                  onClick={closeModal}
                >
                  Tutup
                </button>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function ClipboardIcon({ size = 20, ...props }) {
  return <Package size={size} {...props} />;
}