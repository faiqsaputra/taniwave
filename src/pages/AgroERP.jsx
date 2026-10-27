import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/layout/Navbar';
import {
  Activity,
  AlertCircle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  Boxes,
  CalendarDays,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Clock3,
  HandCoins,
  Info,
  Leaf,
  MapPin,
  Package,
  Plus,
  Receipt,
  RefreshCcw,
  RotateCcw,
  Search,
  ShoppingCart,
  Sprout,
  Store,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
  Wheat,
  X,
} from 'lucide-react';
import '../css/AgroERP.css';

const STORAGE_KEY = 'taniwave-agro-erp-v2';

const todayISO = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
};

const dateAfterDays = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
};

const createId = (prefix = 'record') =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const currency = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const number = (value) =>
  new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 1,
  }).format(Number(value) || 0);

const formatDate = (value) => {
  if (!value) return 'Belum ditentukan';

  return new Date(`${value}T00:00:00`).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const daysBetween = (from, to = todayISO()) => {
  if (!from) return 0;

  const start = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);

  return Math.floor((end.getTime() - start.getTime()) / 86400000);
};

const clamp = (value, min, max) =>
  Math.min(Math.max(Number(value) || 0, min), max);

const average = (values) => {
  const valid = values.filter((value) => Number(value) > 0);

  if (!valid.length) return 0;

  return valid.reduce((sum, value) => sum + Number(value), 0) / valid.length;
};

/* =========================================================
   DEMO MARKET DATA
   ========================================================= */

const MARKET_REFERENCE = {
  'Jagung manis': {
    unit: 'kg',
    updatedAt: 'Hari ini',
    sources: [
      {
        market: 'Pasar Kota',
        price: 5800,
        distance: '12 km',
        trend: 'up',
      },
      {
        market: 'Pasar Induk',
        price: 6100,
        distance: '28 km',
        trend: 'stable',
      },
      {
        market: 'Buyer Horeca',
        price: 6500,
        distance: '18 km',
        trend: 'up',
      },
    ],
  },

  'Cabai rawit': {
    unit: 'kg',
    updatedAt: 'Hari ini',
    sources: [
      {
        market: 'Pasar Kota',
        price: 23000,
        distance: '12 km',
        trend: 'up',
      },
      {
        market: 'Pasar Induk',
        price: 24500,
        distance: '28 km',
        trend: 'stable',
      },
      {
        market: 'Buyer Horeca',
        price: 26000,
        distance: '18 km',
        trend: 'up',
      },
    ],
  },

  Cabai: {
    unit: 'kg',
    updatedAt: 'Hari ini',
    sources: [
      {
        market: 'Pasar Kota',
        price: 23000,
        distance: '12 km',
        trend: 'up',
      },
      {
        market: 'Pasar Induk',
        price: 24500,
        distance: '28 km',
        trend: 'stable',
      },
      {
        market: 'Buyer Horeca',
        price: 26000,
        distance: '18 km',
        trend: 'up',
      },
    ],
  },

  'Padi': {
    unit: 'kg',
    updatedAt: 'Hari ini',
    sources: [
      {
        market: 'Penggilingan A',
        price: 6900,
        distance: '10 km',
        trend: 'stable',
      },
      {
        market: 'Penggilingan B',
        price: 7200,
        distance: '21 km',
        trend: 'up',
      },
      {
        market: 'Koperasi',
        price: 7350,
        distance: '15 km',
        trend: 'up',
      },
    ],
  },

  'Bawang merah': {
    unit: 'kg',
    updatedAt: 'Hari ini',
    sources: [
      {
        market: 'Pasar Kota',
        price: 28000,
        distance: '12 km',
        trend: 'stable',
      },
      {
        market: 'Pasar Induk',
        price: 29500,
        distance: '25 km',
        trend: 'up',
      },
      {
        market: 'Buyer Horeca',
        price: 31000,
        distance: '18 km',
        trend: 'up',
      },
    ],
  },
};

/* =========================================================
   DEMO BUYER NETWORK
   ========================================================= */

const BUYER_TEMPLATES = {
  'Cabai rawit': [
    {
      id: 'buyer-cabai-resto',
      name: 'Dapur Nusantara',
      type: 'Restoran',
      demandKg: 200,
      grade: 'A',
      price: 25500,
      frequency: 'Mingguan',
      distance: '18 km',
      payment: 'Tempo 3 hari',
      verified: true,
    },
    {
      id: 'buyer-cabai-distributor',
      name: 'CV Pangan Segar',
      type: 'Distributor',
      demandKg: 500,
      grade: 'A/B',
      price: 23500,
      frequency: '2x seminggu',
      distance: '25 km',
      payment: 'COD',
      verified: true,
    },
    {
      id: 'buyer-cabai-umkm',
      name: 'Sambal Kita UMKM',
      type: 'UMKM',
      demandKg: 100,
      grade: 'B',
      price: 22000,
      frequency: 'Mingguan',
      distance: '9 km',
      payment: 'COD',
      verified: true,
    },
  ],

  'Jagung manis': [
    {
      id: 'buyer-jagung-resto',
      name: 'Dapur Sehat',
      type: 'Restoran',
      demandKg: 250,
      grade: 'A',
      price: 6500,
      frequency: 'Mingguan',
      distance: '15 km',
      payment: 'Tempo 3 hari',
      verified: true,
    },
    {
      id: 'buyer-jagung-distributor',
      name: 'Pangan Kita',
      type: 'Distributor',
      demandKg: 600,
      grade: 'A/B',
      price: 6000,
      frequency: '2x seminggu',
      distance: '22 km',
      payment: 'COD',
      verified: true,
    },
    {
      id: 'buyer-jagung-umkm',
      name: 'Bakso & Jagung Pak Budi',
      type: 'UMKM',
      demandKg: 120,
      grade: 'B',
      price: 5400,
      frequency: 'Mingguan',
      distance: '7 km',
      payment: 'COD',
      verified: true,
    },
  ],

  Padi: [
    {
      id: 'buyer-padi-mill-a',
      name: 'Penggilingan Makmur',
      type: 'Penggilingan',
      demandKg: 1500,
      grade: 'A/B',
      price: 7200,
      frequency: 'Setiap panen',
      distance: '10 km',
      payment: 'COD',
      verified: true,
    },
    {
      id: 'buyer-padi-koperasi',
      name: 'Koperasi Tani Sejahtera',
      type: 'Koperasi',
      demandKg: 3000,
      grade: 'A',
      price: 7350,
      frequency: 'Setiap panen',
      distance: '15 km',
      payment: 'Tempo 7 hari',
      verified: true,
    },
  ],
};

/* =========================================================
   DEMO FARMER POOL
   ========================================================= */

const DEMO_FARMER_POOL = [
  {
    id: 'pool-01',
    name: 'Kelompok Tani Maju Bersama',
    commodity: 'Cabai rawit',
    committedKg: 750,
    targetKg: 1000,
    members: 8,
    buyerNeedKg: 1000,
    status: 'Mencari anggota',
  },
  {
    id: 'pool-02',
    name: 'Koperasi Pangan Lokal',
    commodity: 'Jagung manis',
    committedKg: 1800,
    targetKg: 2500,
    members: 14,
    buyerNeedKg: 2500,
    status: 'Mencari anggota',
  },
];

/* =========================================================
   DEMO CYCLE
   ========================================================= */

const createDemoCycle = () => ({
  id: 'cycle-demo-corn',
  commodity: 'Jagung manis',
  plotName: 'Lahan Utara',
  areaHa: 0.5,
  startDate: '2026-09-18',
  expectedHarvestDate: '2026-12-08',
  targetYieldKg: 1000,

  estimatedPricePerKg: 5000,

  prices: {
    A: 6500,
    B: 5000,
    C: 3500,
  },

  /* Data pasar dapat diganti dengan API nantinya. */
  marketPrice: 6100,

  /* Harga tawaran terakhir dari calon pembeli. */
  latestOffer: 5000,

  planItems: [
    {
      id: 'plan-demo-seed',
      name: 'Benih jagung',
      category: 'Benih',
      quantity: 4,
      unit: 'kg',
      unitCost: 65000,
    },
    {
      id: 'plan-demo-npk',
      name: 'Pupuk NPK',
      category: 'Pupuk',
      quantity: 5,
      unit: 'sak',
      unitCost: 280000,
    },
    {
      id: 'plan-demo-organic',
      name: 'Pupuk organik',
      category: 'Pupuk',
      quantity: 4,
      unit: 'karung',
      unitCost: 100000,
    },
  ],

  activities: [
    {
      id: 'activity-demo-land',
      title: 'Penyiapan lahan',
      category: 'Tenaga kerja',
      date: '2026-09-18',
      cost: 350000,
      note: 'Pengolahan awal lahan.',
    },
    {
      id: 'activity-demo-seed',
      title: 'Pembelian benih',
      category: 'Benih',
      date: '2026-09-19',
      cost: 260000,
      note: 'Benih untuk satu siklus tanam.',
    },
    {
      id: 'activity-demo-fertilizer',
      title: 'Pemupukan dasar',
      category: 'Pupuk',
      date: '2026-09-25',
      cost: 540000,
      note: 'Pemupukan awal setelah tanam.',
    },
  ],

  harvests: [
    {
      id: 'harvest-demo-1',
      date: '2026-10-12',
      totalKg: 800,
      gradeA: 350,
      gradeB: 280,
      gradeC: 120,
      rejectedKg: 30,
      note: 'Contoh hasil pencatatan panen.',
    },
  ],

  sales: [
    {
      id: 'sale-demo-1',
      date: '2026-10-15',
      buyer: 'Warung Sayur Makmur',
      grade: 'A',
      quantity: 100,
      unitPrice: 6500,
      discount: 0,
      amount: 650000,
      paidAmount: 500000,
      payments: [
        {
          id: 'payment-demo-1',
          date: '2026-10-15',
          amount: 500000,
        },
      ],
    },
  ],

  preOrders: [],

  buyers: [],

  marketHistory: [],

  notes: [],
});

const loadInitialData = () => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed.cycles) && parsed.cycles.length > 0) {
          return {
            cycles: parsed.cycles.map(normalizeCycle),
            activeCycleId: parsed.activeCycleId || parsed.cycles[0].id,
          };
        }
      }
    } catch (error) {
      console.error('Gagal membaca data AgroERP:', error);
    }
  }

  const demo = createDemoCycle();

  return {
    cycles: [demo],
    activeCycleId: demo.id,
  };
};

const normalizeCycle = (cycle) => ({
  ...cycle,

  prices: {
    A: Number(cycle?.prices?.A || cycle?.estimatedPricePerKg || 0),
    B: Number(cycle?.prices?.B || cycle?.estimatedPricePerKg || 0),
    C: Number(cycle?.prices?.C || cycle?.estimatedPricePerKg || 0),
  },

  marketPrice: Number(
    cycle?.marketPrice || cycle?.estimatedPricePerKg || 0
  ),

  latestOffer: Number(cycle?.latestOffer || 0),

  planItems: Array.isArray(cycle?.planItems) ? cycle.planItems : [],
  activities: Array.isArray(cycle?.activities) ? cycle.activities : [],
  harvests: Array.isArray(cycle?.harvests) ? cycle.harvests : [],
  sales: Array.isArray(cycle?.sales) ? cycle.sales : [],
  preOrders: Array.isArray(cycle?.preOrders) ? cycle.preOrders : [],
  buyers: Array.isArray(cycle?.buyers) ? cycle.buyers : [],
  marketHistory: Array.isArray(cycle?.marketHistory)
    ? cycle.marketHistory
    : [],
  notes: Array.isArray(cycle?.notes) ? cycle.notes : [],
});

/* =========================================================
   CALCULATION ENGINE
   ========================================================= */

const getPlanCost = (cycle) =>
  (cycle?.planItems || []).reduce(
    (total, item) =>
      total +
      Number(item.quantity || 0) * Number(item.unitCost || 0),
    0
  );

const getActualCost = (cycle) =>
  (cycle?.activities || []).reduce(
    (total, activity) => total + Number(activity.cost || 0),
    0
  );

const getTotalHarvest = (cycle) =>
  (cycle?.harvests || []).reduce(
    (total, harvest) => total + Number(harvest.totalKg || 0),
    0
  );

const getClassifiedHarvest = (cycle) =>
  (cycle?.harvests || []).reduce(
    (total, harvest) =>
      total +
      Number(harvest.gradeA || 0) +
      Number(harvest.gradeB || 0) +
      Number(harvest.gradeC || 0),
    0
  );

const getRejectedHarvest = (cycle) =>
  (cycle?.harvests || []).reduce(
    (total, harvest) => total + Number(harvest.rejectedKg || 0),
    0
  );

const getStockByGrade = (cycle) => {
  const stock = {
    A: 0,
    B: 0,
    C: 0,
  };

  (cycle?.harvests || []).forEach((harvest) => {
    stock.A += Number(harvest.gradeA || 0);
    stock.B += Number(harvest.gradeB || 0);
    stock.C += Number(harvest.gradeC || 0);
  });

  (cycle?.sales || []).forEach((sale) => {
    if (stock[sale.grade] !== undefined) {
      stock[sale.grade] -= Number(sale.quantity || 0);
    }
  });

  return {
    A: Math.max(0, stock.A),
    B: Math.max(0, stock.B),
    C: Math.max(0, stock.C),
  };
};

const getMarketReference = (cycle) => {
  const fallback = {
    unit: 'kg',
    updatedAt: 'Demo',
    sources: [],
  };

  const reference =
    MARKET_REFERENCE[cycle?.commodity] ||
    MARKET_REFERENCE[
      Object.keys(MARKET_REFERENCE).find((key) =>
        String(cycle?.commodity || '')
          .toLowerCase()
          .includes(key.toLowerCase())
      )
    ] ||
    fallback;

  return reference;
};

const getMarketAverage = (cycle) => {
  const reference = getMarketReference(cycle);

  if (!reference.sources.length) {
    return Number(cycle?.marketPrice || 0);
  }

  return Math.round(
    average(reference.sources.map((source) => source.price))
  );
};

const getBestMarketPrice = (cycle) => {
  const reference = getMarketReference(cycle);

  if (!reference.sources.length) {
    return Number(cycle?.marketPrice || 0);
  }

  return Math.max(...reference.sources.map((source) => source.price));
};

const getHPP = (cycle) => {
  const actualCost = getActualCost(cycle);

  /*
   * Jika belum ada panen, gunakan target hasil.
   * Setelah panen tercatat, gunakan hasil aktual.
   */
  const productionKg = Math.max(
    getTotalHarvest(cycle),
    Number(cycle?.targetYieldKg || 0)
  );

  if (!productionKg) return 0;

  return Math.ceil(actualCost / productionKg);
};

const getBreakEvenPrice = (cycle) => {
  const hpp = getHPP(cycle);

  if (!hpp) return 0;

  return hpp;
};

const getTargetSellingPrice = (cycle) => {
  const hpp = getHPP(cycle);

  if (!hpp) return 0;

  /*
   * Target margin default 15%.
   * Ini bukan harga pasar, hanya target internal usaha.
   */
  return Math.ceil(hpp * 1.15);
};

const getFinancials = (cycle) => {
  const actualCost = getActualCost(cycle);
  const planCost = getPlanCost(cycle);
  const stock = getStockByGrade(cycle);

  const salesValue = (cycle?.sales || []).reduce(
    (total, sale) => total + Number(sale.amount || 0),
    0
  );

  const cashReceived = (cycle?.sales || []).reduce(
    (total, sale) => total + Number(sale.paidAmount || 0),
    0
  );

  const receivables = (cycle?.sales || []).reduce(
    (total, sale) =>
      total +
      Math.max(
        0,
        Number(sale.amount || 0) - Number(sale.paidAmount || 0)
      ),
    0
  );

  const stockValue =
    stock.A * Number(cycle?.prices?.A || 0) +
    stock.B * Number(cycle?.prices?.B || 0) +
    stock.C * Number(cycle?.prices?.C || 0);

  const totalStock = stock.A + stock.B + stock.C;

  const hpp = getHPP(cycle);
  const marketPrice = getMarketAverage(cycle);
  const bestMarketPrice = getBestMarketPrice(cycle);
  const targetSellingPrice = getTargetSellingPrice(cycle);

  const marketMargin = marketPrice - hpp;
  const bestMarketMargin = bestMarketPrice - hpp;

  return {
    actualCost,
    planCost,
    stock,
    stockValue,
    totalStock,
    salesValue,
    cashReceived,
    receivables,

    cashFlow: cashReceived - actualCost,

    estimatedResult:
      salesValue + stockValue - actualCost,

    estimatedRevenue:
      Number(cycle?.targetYieldKg || 0) *
      Number(cycle?.estimatedPricePerKg || 0),

    hpp,
    breakEvenPrice: hpp,
    marketPrice,
    bestMarketPrice,
    targetSellingPrice,
    marketMargin,
    bestMarketMargin,
  };
};

const getOfferStatus = (offer, hpp, marketPrice) => {
  const price = Number(offer || 0);

  if (!price) {
    return {
      level: 'unknown',
      label: 'Belum ada tawaran',
      description: 'Masukkan harga pembeli untuk membandingkannya.',
    };
  }

  if (hpp > 0 && price < hpp) {
    return {
      level: 'danger',
      label: 'Di bawah HPP',
      description:
        'Tawaran ini berisiko membuat biaya produksi tidak tertutup.',
    };
  }

  if (marketPrice > 0 && price < marketPrice * 0.9) {
    return {
      level: 'warning',
      label: 'Di bawah referensi pasar',
      description:
        'Tawaran berada cukup jauh di bawah harga referensi pasar.',
    };
  }

  if (marketPrice > 0 && price >= marketPrice) {
    return {
      level: 'good',
      label: 'Kompetitif',
      description:
        'Tawaran berada pada atau di atas harga referensi pasar.',
    };
  }

  return {
    level: 'neutral',
    label: 'Perlu dibandingkan',
    description:
      'Bandingkan dengan buyer lain sebelum mengambil keputusan.',
  };
};

const getBuyerMatches = (cycle, stock) => {
  const templates =
    BUYER_TEMPLATES[cycle?.commodity] ||
    BUYER_TEMPLATES[
      Object.keys(BUYER_TEMPLATES).find((key) =>
        String(cycle?.commodity || '')
          .toLowerCase()
          .includes(key.toLowerCase())
      )
    ] ||
    [];

  const totalStock = stock.A + stock.B + stock.C;

  return templates
    .map((buyer) => {
      let availableForBuyer = totalStock;

      if (buyer.grade === 'A') {
        availableForBuyer = stock.A;
      }

      if (buyer.grade === 'B') {
        availableForBuyer = stock.B;
      }

      const gradeRequirement =
        buyer.grade === 'A/B'
          ? stock.A + stock.B
          : availableForBuyer;

      const canSupply = gradeRequirement > 0;

      return {
        ...buyer,
        availableKg: gradeRequirement,
        canSupply,
      };
    })
    .filter((buyer) => buyer.canSupply)
    .sort((a, b) => b.price - a.price);
};

const getSellingDecision = (cycle, financials) => {
  const hpp = financials.hpp;
  const market = financials.marketPrice;
  const offer = Number(cycle?.latestOffer || 0);

  if (!hpp) {
    return {
      type: 'info',
      title: 'Lengkapi data biaya',
      text:
        'Catat biaya budidaya agar AgroERP dapat menghitung HPP dan batas harga minimum.',
    };
  }

  if (offer > 0 && offer < hpp) {
    return {
      type: 'danger',
      title: 'Jangan buru-buru menerima tawaran',
      text: `Tawaran ${currency(
        offer
      )}/kg berada di bawah HPP ${currency(
        hpp
      )}/kg. Cari buyer alternatif atau negosiasikan harga.`,
    };
  }

  if (market > hpp && offer > 0 && offer < market * 0.9) {
    return {
      type: 'warning',
      title: 'Masih ada ruang negosiasi',
      text: `Tawaran ${currency(
        offer
      )}/kg berada di bawah referensi pasar ${currency(
        market
      )}/kg. Bandingkan dengan buyer lain sebelum menjual.`,
    };
  }

  if (market > hpp) {
    return {
      type: 'good',
      title: 'Posisi jual cukup sehat',
      text: `Referensi pasar ${currency(
        market
      )}/kg berada di atas HPP ${currency(
        hpp
      )}/kg. Petani memiliki ruang margin untuk bernegosiasi.`,
    };
  }

  return {
    type: 'neutral',
    title: 'Perlu hati-hati menentukan harga',
    text:
      'HPP dan referensi pasar masih berdekatan. Pertimbangkan biaya transportasi, kualitas, dan kepastian pembayaran.',
  };
};

/* =========================================================
   SMALL UI COMPONENTS
   ========================================================= */

function KpiCard({
  icon: Icon,
  label,
  value,
  caption,
  tone = 'default',
}) {
  return (
    <article className={`erp-kpi erp-kpi-${tone}`}>
      <div className="erp-kpi-top">
        <span className="erp-kpi-icon">
          <Icon size={19} />
        </span>
        <span className="erp-kpi-label">{label}</span>
      </div>

      <strong className="erp-kpi-value">{value}</strong>

      {caption && (
        <span className="erp-kpi-caption">{caption}</span>
      )}
    </article>
  );
}

function SectionTitle({
  eyebrow,
  title,
  description,
  action,
}) {
  return (
    <div className="erp-section-title">
      <div>
        {eyebrow && (
          <p className="erp-eyebrow">{eyebrow}</p>
        )}

        <h2>{title}</h2>

        {description && (
          <p className="erp-section-description">
            {description}
          </p>
        )}
      </div>

      {action && (
        <div className="erp-section-action">
          {action}
        </div>
      )}
    </div>
  );
}

function EmptyState({
  icon: Icon = ClipboardList,
  title,
  description,
}) {
  return (
    <div className="erp-empty-state">
      <span className="erp-empty-icon">
        <Icon size={24} />
      </span>

      <strong>{title}</strong>

      <p>{description}</p>
    </div>
  );
}

function StatusBadge({ level, children }) {
  return (
    <span className={`erp-status-badge erp-status-${level}`}>
      {level === 'good' && <CheckCircle2 size={13} />}
      {level === 'warning' && <AlertCircle size={13} />}
      {level === 'danger' && <AlertCircle size={13} />}
      {level === 'info' && <Info size={13} />}
      {children}
    </span>
  );
}

function ModalActions({
  onCancel,
  submitLabel,
}) {
  return (
    <div className="erp-modal-actions">
      <button
        type="button"
        className="erp-button erp-button-ghost"
        onClick={onCancel}
      >
        Batal
      </button>

      <button
        type="submit"
        className="erp-button erp-button-primary"
      >
        <CheckCircle2 size={17} />
        {submitLabel}
      </button>
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
   ========================================================= */

export default function AgroERP() {
  const [initialData] = useState(() =>
    loadInitialData()
  );

  const [cycles, setCycles] = useState(
    initialData.cycles
  );

  const [activeCycleId, setActiveCycleId] = useState(
    initialData.activeCycleId
  );

  const [activeTab, setActiveTab] =
    useState('overview');

  const [modal, setModal] = useState(null);

  const [formError, setFormError] =
    useState('');

  const [buyerSearch, setBuyerSearch] =
    useState('');

  const [marketRefresh, setMarketRefresh] =
    useState(0);

  const activeCycle = useMemo(
    () =>
      cycles.find(
        (cycle) => cycle.id === activeCycleId
      ) || cycles[0],
    [cycles, activeCycleId]
  );

  const financials = useMemo(
    () => getFinancials(activeCycle),
    [activeCycle]
  );

  const marketReference = useMemo(
    () => getMarketReference(activeCycle),
    [activeCycle]
  );

  const buyerMatches = useMemo(
    () =>
      getBuyerMatches(
        activeCycle,
        financials.stock
      ),
    [activeCycle, financials.stock]
  );

  const sellingDecision = useMemo(
    () =>
      getSellingDecision(
        activeCycle,
        financials
      ),
    [activeCycle, financials]
  );

  const filteredBuyers = useMemo(() => {
    const query = buyerSearch
      .trim()
      .toLowerCase();

    if (!query) return buyerMatches;

    return buyerMatches.filter((buyer) =>
      `${buyer.name} ${buyer.type} ${buyer.grade}`
        .toLowerCase()
        .includes(query)
    );
  }, [buyerMatches, buyerSearch]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          cycles,
          activeCycleId,
        })
      );
    } catch (error) {
      console.error(
        'Gagal menyimpan data AgroERP:',
        error
      );
    }
  }, [cycles, activeCycleId]);

  const updateActiveCycle = (updater) => {
    if (!activeCycle) return;

    setCycles((previous) =>
      previous.map((cycle) =>
        cycle.id === activeCycle.id
          ? updater(normalizeCycle(cycle))
          : cycle
      )
    );
  };

  const openModal = (
    type,
    payload = null
  ) => {
    setFormError('');

    setModal({
      type,
      ...payload,
    });
  };

  const closeModal = () => {
    setModal(null);
    setFormError('');
  };

  /* =======================================================
     CYCLE
     ======================================================= */

  const handleAddCycle = (event) => {
    event.preventDefault();

    const form = new FormData(
      event.currentTarget
    );

    const commodity = String(
      form.get('commodity') || ''
    ).trim();

    const estimatedPricePerKg = Number(
      form.get('estimatedPricePerKg')
    );

    if (!commodity) {
      setFormError(
        'Komoditas wajib diisi.'
      );
      return;
    }

    if (estimatedPricePerKg <= 0) {
      setFormError(
        'Harga estimasi harus lebih besar dari nol.'
      );
      return;
    }

    const newCycle = {
      id: createId('cycle'),
      commodity,
      plotName:
        String(
          form.get('plotName') || ''
        ).trim() ||
        'Lahan utama',

      areaHa: Number(
        form.get('areaHa')
      ),

      startDate:
        form.get('startDate'),

      expectedHarvestDate:
        form.get(
          'expectedHarvestDate'
        ),

      targetYieldKg: Number(
        form.get('targetYieldKg')
      ),

      estimatedPricePerKg,

      prices: {
        A: Math.round(
          estimatedPricePerKg * 1.3
        ),
        B: estimatedPricePerKg,
        C: Math.round(
          estimatedPricePerKg * 0.7
        ),
      },

      marketPrice:
        estimatedPricePerKg,

      latestOffer: 0,

      planItems: [],
      activities: [],
      harvests: [],
      sales: [],
      preOrders: [],
      buyers: [],
      marketHistory: [],
      notes: [],
    };

    setCycles((previous) => [
      newCycle,
      ...previous,
    ]);

    setActiveCycleId(
      newCycle.id
    );

    setActiveTab(
      'overview'
    );

    closeModal();
  };

  /* =======================================================
     PLANNING
     ======================================================= */

  const handleAddPlanItem = (event) => {
    event.preventDefault();

    const form = new FormData(
      event.currentTarget
    );

    const newItem = {
      id: createId('plan'),

      name: String(
        form.get('name')
      ).trim(),

      category:
        form.get('category'),

      quantity: Number(
        form.get('quantity')
      ),

      unit: String(
        form.get('unit')
      ).trim(),

      unitCost: Number(
        form.get('unitCost')
      ),
    };

    if (
      !newItem.name ||
      newItem.quantity <= 0
    ) {
      setFormError(
        'Nama dan jumlah kebutuhan harus diisi dengan benar.'
      );
      return;
    }

    updateActiveCycle(
      (cycle) => ({
        ...cycle,

        planItems: [
          newItem,
          ...(cycle.planItems || []),
        ],
      })
    );

    closeModal();
  };

  /* =======================================================
     ACTIVITIES
     ======================================================= */

  const handleAddActivity = (event) => {
    event.preventDefault();

    const form = new FormData(
      event.currentTarget
    );

    const activity = {
      id: createId('activity'),

      title: String(
        form.get('title')
      ).trim(),

      category:
        form.get('category'),

      date:
        form.get('date'),

      cost: Number(
        form.get('cost') || 0
      ),

      note: String(
        form.get('note') || ''
      ).trim(),
    };

    if (!activity.title) {
      setFormError(
        'Nama kegiatan wajib diisi.'
      );
      return;
    }

    updateActiveCycle(
      (cycle) => ({
        ...cycle,

        activities: [
          activity,
          ...(cycle.activities || []),
        ],
      })
    );

    closeModal();
  };

  /* =======================================================
     HARVEST
     ======================================================= */

  const handleAddHarvest = (event) => {
    event.preventDefault();

    const form = new FormData(
      event.currentTarget
    );

    const harvest = {
      id: createId('harvest'),

      date:
        form.get('date'),

      totalKg: Number(
        form.get('totalKg')
      ),

      gradeA: Number(
        form.get('gradeA') || 0
      ),

      gradeB: Number(
        form.get('gradeB') || 0
      ),

      gradeC: Number(
        form.get('gradeC') || 0
      ),

      rejectedKg: Number(
        form.get('rejectedKg') || 0
      ),

      note: String(
        form.get('note') || ''
      ).trim(),
    };

    const classified =
      harvest.gradeA +
      harvest.gradeB +
      harvest.gradeC +
      harvest.rejectedKg;

    if (
      harvest.totalKg <= 0
    ) {
      setFormError(
        'Total panen harus lebih besar dari nol.'
      );
      return;
    }

    if (
      classified >
      harvest.totalKg
    ) {
      setFormError(
        'Jumlah Grade A, B, C, dan hasil rusak tidak boleh melebihi total panen.'
      );
      return;
    }

    updateActiveCycle(
      (cycle) => ({
        ...cycle,

        harvests: [
          harvest,
          ...(cycle.harvests || []),
        ],
      })
    );

    closeModal();
  };

  /* =======================================================
     SALE
     ======================================================= */

  const handleAddSale = (event) => {
    event.preventDefault();

    const form = new FormData(
      event.currentTarget
    );

    const grade =
      form.get('grade');

    const quantity = Number(
      form.get('quantity')
    );

    const unitPrice = Number(
      form.get('unitPrice')
    );

    const discount = Number(
      form.get('discount') || 0
    );

    const paidAmount = Number(
      form.get('paidAmount') || 0
    );

    const subtotal =
      quantity * unitPrice;

    const amount =
      subtotal - discount;

    const stock =
      getStockByGrade(
        activeCycle
      );

    if (
      quantity <= 0 ||
      unitPrice <= 0
    ) {
      setFormError(
        'Jumlah barang dan harga jual harus lebih besar dari nol.'
      );
      return;
    }

    if (
      quantity >
      stock[grade]
    ) {
      setFormError(
        `Stok Grade ${grade} hanya ${number(
          stock[grade]
        )} kg. Kurangi jumlah penjualan.`
      );
      return;
    }

    if (
      discount < 0 ||
      discount > subtotal
    ) {
      setFormError(
        'Potongan harga tidak valid.'
      );
      return;
    }

    if (
      paidAmount < 0 ||
      paidAmount > amount
    ) {
      setFormError(
        'Pembayaran awal tidak boleh melebihi nilai transaksi.'
      );
      return;
    }

    const sale = {
      id: createId('sale'),

      date:
        form.get('date'),

      buyer: String(
        form.get('buyer')
      ).trim(),

      grade,

      quantity,

      unitPrice,

      discount,

      amount,

      paidAmount,

      payments:
        paidAmount > 0
          ? [
              {
                id: createId(
                  'payment'
                ),
                date:
                  form.get('date'),
                amount:
                  paidAmount,
              },
            ]
          : [],
    };

    updateActiveCycle(
      (cycle) => ({
        ...cycle,

        latestOffer:
          unitPrice,

        sales: [
          sale,
          ...(cycle.sales || []),
        ],
      })
    );

    closeModal();
  };

  /* =======================================================
     PAYMENT
     ======================================================= */

  const handleRecordPayment = (
    event
  ) => {
    event.preventDefault();

    const form = new FormData(
      event.currentTarget
    );

    const amount = Number(
      form.get('amount')
    );

    const saleId =
      modal?.saleId;

    const sale =
      activeCycle.sales.find(
        (item) =>
          item.id === saleId
      );

    if (!sale) {
      setFormError(
        'Transaksi penjualan tidak ditemukan.'
      );
      return;
    }

    const remaining =
      Number(sale.amount) -
      Number(sale.paidAmount);

    if (
      amount <= 0 ||
      amount > remaining
    ) {
      setFormError(
        `Pembayaran harus lebih dari Rp0 dan tidak melebihi ${currency(
          remaining
        )}.`
      );
      return;
    }

    const payment = {
      id: createId('payment'),

      date:
        form.get('date'),

      amount,
    };

    updateActiveCycle(
      (cycle) => ({
        ...cycle,

        sales:
          cycle.sales.map(
            (item) =>
              item.id === saleId
                ? {
                    ...item,

                    paidAmount:
                      Number(
                        item.paidAmount
                      ) + amount,

                    payments: [
                      ...(item.payments ||
                        []),
                      payment,
                    ],
                  }
                : item
          ),
      })
    );

    closeModal();
  };

  /* =======================================================
     MARKET
     ======================================================= */

  const handleRefreshMarket = () => {
    /*
     * Placeholder untuk integrasi API.
     * Saat API sudah tersedia, fungsi ini tinggal
     * mengambil harga terbaru dari backend.
     */
    setMarketRefresh(
      (value) => value + 1
    );

    updateActiveCycle(
      (cycle) => ({
        ...cycle,

        marketPrice:
          getMarketAverage(cycle),

        marketHistory: [
          {
            id: createId(
              'market'
            ),
            date:
              todayISO(),
            price:
              getMarketAverage(
                cycle
              ),
          },
          ...(cycle.marketHistory ||
            []),
        ],
      })
    );
  };

  /* =======================================================
     PRE-ORDER
     ======================================================= */

  const handleAddPreOrder = (
    event
  ) => {
    event.preventDefault();

    const form = new FormData(
      event.currentTarget
    );

    const buyer = String(
      form.get('buyer')
    ).trim();

    const quantity = Number(
      form.get('quantity')
    );

    const price = Number(
      form.get('price')
    );

    const harvestDate =
      form.get(
        'harvestDate'
      );

    const grade =
      form.get('grade');

    if (
      !buyer ||
      quantity <= 0 ||
      price <= 0
    ) {
      setFormError(
        'Buyer, jumlah, dan harga harus diisi dengan benar.'
      );
      return;
    }

    const preOrder = {
      id: createId(
        'preorder'
      ),

      buyer,

      quantity,

      price,

      grade,

      harvestDate,

      status:
        'Menunggu panen',

      createdAt:
        todayISO(),
    };

    updateActiveCycle(
      (cycle) => ({
        ...cycle,

        preOrders: [
          preOrder,
          ...(cycle.preOrders ||
            []),
        ],
      })
    );

    closeModal();
  };

  const cancelPreOrder = (
    preOrderId
  ) => {
    if (
      !window.confirm(
        'Batalkan pre-order ini?'
      )
    ) {
      return;
    }

    updateActiveCycle(
      (cycle) => ({
        ...cycle,

        preOrders:
          cycle.preOrders.filter(
            (item) =>
              item.id !==
              preOrderId
          ),
      })
    );
  };

  /* =======================================================
     BUYER
     ======================================================= */

  const startBuyerOrder = (
    buyer
  ) => {
    openModal(
      'preorder',
      {
        buyerPreset:
          buyer.name,

        pricePreset:
          buyer.price,

        gradePreset:
          buyer.grade ===
          'A/B'
            ? 'A'
            : buyer.grade,

        quantityPreset:
          Math.min(
            buyer.demandKg,
            Math.max(
              1,
              buyer.availableKg
            )
          ),
      }
    );
  };

  /* =======================================================
     REMOVE
     ======================================================= */

  const removePlanItem = (
    itemId
  ) => {
    if (
      !window.confirm(
        'Hapus item dari rencana kebutuhan?'
      )
    ) {
      return;
    }

    updateActiveCycle(
      (cycle) => ({
        ...cycle,

        planItems:
          cycle.planItems.filter(
            (item) =>
              item.id !== itemId
          ),
      })
    );
  };

  const removeActivity = (
    activityId
  ) => {
    if (
      !window.confirm(
        'Hapus catatan kegiatan beserta biaya tercatatnya?'
      )
    ) {
      return;
    }

    updateActiveCycle(
      (cycle) => ({
        ...cycle,

        activities:
          cycle.activities.filter(
            (activity) =>
              activity.id !==
              activityId
          ),
      })
    );
  };

  const removeSale = (
    saleId
  ) => {
    if (
      !window.confirm(
        'Batalkan catatan penjualan ini? Stok akan dihitung ulang berdasarkan transaksi yang tersisa.'
      )
    ) {
      return;
    }

    updateActiveCycle(
      (cycle) => ({
        ...cycle,

        sales:
          cycle.sales.filter(
            (sale) =>
              sale.id !==
              saleId
          ),
      })
    );
  };

  const resetDemo = () => {
    if (
      !window.confirm(
        'Reset seluruh data AgroERP di browser ini ke data simulasi awal?'
      )
    ) {
      return;
    }

    const demo =
      createDemoCycle();

    setCycles([demo]);

    setActiveCycleId(
      demo.id
    );

    setActiveTab(
      'overview'
    );

    closeModal();
  };

  if (!activeCycle) {
    return null;
  }

  /* =======================================================
     DERIVED UI DATA
     ======================================================= */

  const cycleAge =
    Math.max(
      0,
      daysBetween(
        activeCycle.startDate
      ) + 1
    );

  const harvestCountdown =
    daysBetween(
      todayISO(),
      activeCycle.expectedHarvestDate
    );

  const budgetUsage =
    financials.planCost > 0
      ? Math.min(
          100,
          (financials.actualCost /
            financials.planCost) *
            100
        )
      : 0;

  const unclassifiedKg =
    (activeCycle.harvests || []).reduce(
      (total, harvest) => {
        const classified =
          Number(
            harvest.gradeA || 0
          ) +
          Number(
            harvest.gradeB || 0
          ) +
          Number(
            harvest.gradeC || 0
          ) +
          Number(
            harvest.rejectedKg ||
              0
          );

        return (
          total +
          Math.max(
            0,
            Number(
              harvest.totalKg ||
                0
            ) - classified
          )
        );
      },
      0
    );

  const totalHarvest =
    getTotalHarvest(
      activeCycle
    );

  const recordedSales =
    activeCycle.sales || [];

  const preOrders =
    activeCycle.preOrders ||
    [];

  const preOrderKg =
    preOrders.reduce(
      (sum, item) =>
        sum +
        Number(
          item.quantity || 0
        ),
      0
    );

  const stockCoverage =
    activeCycle.targetYieldKg >
    0
      ? Math.round(
          (financials.totalStock /
            activeCycle.targetYieldKg) *
            100
        )
      : 0;

  const marketVsHpp =
    financials.hpp > 0
      ? Math.round(
          ((financials.marketPrice -
            financials.hpp) /
            financials.hpp) *
            100
        )
      : 0;

  const offerStatus =
    getOfferStatus(
      activeCycle.latestOffer,
      financials.hpp,
      financials.marketPrice
    );

  const recentItems = [
    ...(activeCycle.activities ||
      []).map((item) => ({
        id: item.id,
        date: item.date,
        title: item.title,
        subtitle:
          item.category,
        amount: item.cost,
        type: 'activity',
      })),

    ...(activeCycle.harvests ||
      []).map((item) => ({
        id: item.id,
        date: item.date,
        title:
          'Panen dicatat',
        subtitle: `${number(
          item.totalKg
        )} kg hasil panen`,
        amount: null,
        type: 'harvest',
      })),

    ...recordedSales.map(
      (item) => ({
        id: item.id,
        date: item.date,
        title: `Penjualan ke ${item.buyer}`,
        subtitle: `${number(
          item.quantity
        )} kg · Grade ${
          item.grade
        }`,
        amount: item.amount,
        type: 'sale',
      })
    ),
  ]
    .sort((a, b) =>
      (b.date || '').localeCompare(
        a.date || ''
      )
    )
    .slice(0, 5);

  const tabs = [
    {
      id: 'overview',
      label: 'Ringkasan',
      icon: TrendingUp,
    },
    {
      id: 'market',
      label: 'Daya Jual',
      icon: Target,
    },
    {
      id: 'production',
      label: 'Produksi',
      icon: Wheat,
    },
    {
      id: 'finance',
      label: 'Keuangan',
      icon: Wallet,
    },
    {
      id: 'profile',
      label: 'Profil Usaha',
      icon: BadgeCheck,
    },
  ];

  /* =======================================================
     TAB: OVERVIEW
     ======================================================= */

  const overviewContent = (
    <>
      <section className="erp-cycle-banner">
        <div className="erp-cycle-banner-main">
          <div className="erp-cycle-avatar">
            <Sprout size={28} />
          </div>

          <div>
            <p className="erp-eyebrow">
              SIKLUS USAHA TANI
            </p>

            <h2>
              {activeCycle.commodity}
            </h2>

            <div className="erp-cycle-location">
              <MapPin size={15} />

              <span>
                {activeCycle.plotName}
              </span>

              <span className="erp-dot-separator">
                •
              </span>

              <span>
                {number(
                  activeCycle.areaHa
                )}{' '}
                ha
              </span>
            </div>
          </div>
        </div>

        <div className="erp-cycle-badges">
          <span className="erp-status-pill">
            <span className="erp-status-dot" />
            Siklus berjalan
          </span>

          <span className="erp-date-pill">
            <CalendarDays
              size={14}
            />
            Hari ke-{cycleAge}
          </span>
        </div>
      </section>

      {/* SELLING POWER HERO */}

      <section className="erp-selling-power">
        <div className="erp-selling-power-header">
          <div>
            <p className="erp-eyebrow">
              SELLING POWER
            </p>

            <h2>
              Sebelum menjual, tahu posisi kamu.
            </h2>

            <p>
              AgroERP membandingkan biaya
              produksi, harga referensi pasar,
              dan tawaran pembeli agar kamu
              tidak menjual hanya karena tidak
              punya pilihan lain.
            </p>
          </div>

          <span className="erp-selling-power-icon">
            <Target size={24} />
          </span>
        </div>

        <div className="erp-selling-metrics">
          <div className="erp-selling-metric">
            <span>HPP</span>
            <strong>
              {currency(
                financials.hpp
              )}
            </strong>
            <small>
              batas impas produksi
            </small>
          </div>

          <div className="erp-selling-metric">
            <span>
              Harga pasar
            </span>

            <strong>
              {currency(
                financials.marketPrice
              )}
            </strong>

            <small>
              harga referensi
            </small>
          </div>

          <div className="erp-selling-metric">
            <span>
              Margin potensial
            </span>

            <strong
              className={
                financials.marketMargin >=
                0
                  ? 'erp-value-positive'
                  : 'erp-value-negative'
              }
            >
              {financials.marketMargin >=
              0
                ? '+'
                : '−'}
              {currency(
                Math.abs(
                  financials.marketMargin
                )
              )}
            </strong>

            <small>
              pasar − HPP / kg
            </small>
          </div>
        </div>

        <div
          className={`erp-selling-alert erp-alert-${sellingDecision.type}`}
        >
          <div className="erp-selling-alert-icon">
            {sellingDecision.type ===
            'danger' ? (
              <AlertCircle
                size={20}
              />
            ) : sellingDecision.type ===
              'good' ? (
              <CheckCircle2
                size={20}
              />
            ) : (
              <Info size={20} />
            )}
          </div>

          <div>
            <strong>
              {sellingDecision.title}
            </strong>

            <p>
              {sellingDecision.text}
            </p>
          </div>
        </div>

        {activeCycle.latestOffer >
          0 && (
          <div className="erp-offer-comparison">
            <div>
              <span>
                Tawaran terakhir
              </span>

              <strong>
                {currency(
                  activeCycle.latestOffer
                )}
                /kg
              </strong>
            </div>

            <ArrowRight
              size={18}
            />

            <div>
              <span>
                Harga pasar
              </span>

              <strong>
                {currency(
                  financials.marketPrice
                )}
                /kg
              </strong>
            </div>

            <div
              className={`erp-offer-gap erp-offer-${offerStatus.level}`}
            >
              <StatusBadge
                level={
                  offerStatus.level ===
                  'unknown'
                    ? 'info'
                    : offerStatus.level
                }
              >
                {offerStatus.label}
              </StatusBadge>
            </div>
          </div>
        )}

        <button
          type="button"
          className="erp-selling-power-cta"
          onClick={() =>
            setActiveTab(
              'market'
            )
          }
        >
          Lihat peluang buyer & harga
          <ArrowRight
            size={17}
          />
        </button>
      </section>

      <div className="erp-kpi-grid">
        <KpiCard
          icon={Wallet}
          label="Biaya tercatat"
          value={currency(
            financials.actualCost
          )}
          caption={`Rencana ${currency(
            financials.planCost
          )}`}
          tone="orange"
        />

        <KpiCard
          icon={ShoppingCart}
          label="Nilai penjualan"
          value={currency(
            financials.salesValue
          )}
          caption={`${recordedSales.length} transaksi tercatat`}
          tone="navy"
        />

        <KpiCard
          icon={Boxes}
          label="Stok tersedia"
          value={`${number(
            financials.totalStock
          )} kg`}
          caption={`Hasil panen ${number(
            totalHarvest
          )} kg`}
          tone="yellow"
        />

        <KpiCard
          icon={TrendingUp}
          label="Estimasi hasil usaha"
          value={currency(
            financials.estimatedResult
          )}
          caption="Penjualan + stok − biaya"
          tone={
            financials.estimatedResult >=
            0
              ? 'green'
              : 'red'
          }
        />
      </div>

      <div className="erp-main-grid">
        <section className="erp-panel">
          <SectionTitle
            eyebrow="PROGRES SIKLUS"
            title="Perjalanan usaha tani"
            description="Data produksi dan keuangan akan menjadi dasar keputusan penjualan."
          />

          <div className="erp-timeline">
            <div className="erp-timeline-item erp-timeline-complete">
              <span className="erp-timeline-icon">
                <CheckCircle2
                  size={18}
                />
              </span>

              <div className="erp-timeline-content">
                <strong>
                  Perencanaan
                </strong>

                <p>
                  {
                    activeCycle
                      .planItems
                      .length
                  }{' '}
                  item ·{' '}
                  {currency(
                    financials.planCost
                  )}
                </p>
              </div>

              <span className="erp-timeline-tag">
                Tercatat
              </span>
            </div>

            <div className="erp-timeline-item">
              <span className="erp-timeline-icon">
                <Activity
                  size={18}
                />
              </span>

              <div className="erp-timeline-content">
                <strong>
                  Budidaya
                </strong>

                <p>
                  {
                    activeCycle
                      .activities
                      .length
                  }{' '}
                  kegiatan ·{' '}
                  {currency(
                    financials.actualCost
                  )}
                </p>
              </div>

              <span className="erp-timeline-tag">
                Berjalan
              </span>
            </div>

            <div
              className={`erp-timeline-item ${
                activeCycle
                  .harvests
                  .length
                  ? 'erp-timeline-complete'
                  : ''
              }`}
            >
              <span className="erp-timeline-icon">
                <Wheat
                  size={18}
                />
              </span>

              <div className="erp-timeline-content">
                <strong>
                  Panen & grading
                </strong>

                <p>
                  {activeCycle
                    .harvests
                    .length
                    ? `${number(
                        totalHarvest
                      )} kg tercatat`
                    : 'Belum ada panen'}
                </p>
              </div>

              <span className="erp-timeline-tag">
                {activeCycle
                  .harvests
                  .length
                  ? 'Tercatat'
                  : 'Menunggu'}
              </span>
            </div>

            <div
              className={`erp-timeline-item ${
                activeCycle
                  .sales
                  .length
                  ? 'erp-timeline-complete'
                  : ''
              }`}
            >
              <span className="erp-timeline-icon">
                <ShoppingCart
                  size={18}
                />
              </span>

              <div className="erp-timeline-content">
                <strong>
                  Penjualan
                </strong>

                <p>
                  {activeCycle
                    .sales
                    .length
                    ? `${activeCycle.sales.length} transaksi`
                    : 'Belum ada transaksi'}
                </p>
              </div>

              <span className="erp-timeline-tag">
                {activeCycle
                  .sales
                  .length
                  ? 'Tercatat'
                  : 'Menunggu'}
              </span>
            </div>
          </div>

          <div className="erp-budget-box">
            <div className="erp-budget-header">
              <div>
                <strong>
                  Realisasi biaya
                </strong>

                <p>
                  Pantau agar biaya produksi
                  tidak diam-diam menggerus margin.
                </p>
              </div>

              <strong>
                {Math.round(
                  budgetUsage
                )}
                %
              </strong>
            </div>

            <div className="erp-progress-track">
              <div
                className="erp-progress-fill"
                style={{
                  width: `${budgetUsage}%`,
                }}
              />
            </div>

            <div className="erp-budget-footer">
              <span>
                Aktual:{' '}
                {currency(
                  financials.actualCost
                )}
              </span>

              <span>
                Rencana:{' '}
                {currency(
                  financials.planCost
                )}
              </span>
            </div>
          </div>
        </section>

        <aside className="erp-side-column">
          <section className="erp-panel erp-harvest-countdown">
            <span className="erp-countdown-icon">
              <CalendarClock
                size={21}
              />
            </span>

            <p className="erp-eyebrow">
              PERKIRAAN PANEN
            </p>

            <h3>
              {harvestCountdown >
              0
                ? `${harvestCountdown} hari lagi`
                : harvestCountdown ===
                  0
                  ? 'Jadwal hari ini'
                  : 'Jadwal telah lewat'}
            </h3>

            <p className="erp-muted-text">
              Target{' '}
              {formatDate(
                activeCycle.expectedHarvestDate
              )}
            </p>

            <div className="erp-divider" />

            <div className="erp-mini-stat">
              <span>
                Target hasil
              </span>

              <strong>
                {number(
                  activeCycle.targetYieldKg
                )}{' '}
                kg
              </strong>
            </div>

            <div className="erp-mini-stat">
              <span>
                Pre-order
              </span>

              <strong>
                {number(
                  preOrderKg
                )}{' '}
                kg
              </strong>
            </div>

            <div className="erp-mini-stat">
              <span>
                Estimasi omzet
              </span>

              <strong>
                {currency(
                  financials.estimatedRevenue
                )}
              </strong>
            </div>
          </section>

          <section className="erp-panel">
            <SectionTitle
              eyebrow="AKSI CEPAT"
              title="Catat aktivitas"
              description="Semakin lengkap data, semakin baik keputusan yang bisa dibuat."
            />

            <div className="erp-quick-actions">
              <button
                type="button"
                className="erp-quick-action"
                onClick={() =>
                  openModal(
                    'activity'
                  )
                }
              >
                <span className="erp-quick-icon erp-quick-orange">
                  <Activity
                    size={19}
                  />
                </span>

                <span>
                  <strong>
                    Kegiatan
                  </strong>
                  <small>
                    Catat biaya budidaya
                  </small>
                </span>

                <Plus size={17} />
              </button>

              <button
                type="button"
                className="erp-quick-action"
                onClick={() =>
                  openModal(
                    'harvest'
                  )
                }
              >
                <span className="erp-quick-icon erp-quick-yellow">
                  <Wheat
                    size={19}
                  />
                </span>

                <span>
                  <strong>
                    Panen
                  </strong>
                  <small>
                    Masukkan hasil & grade
                  </small>
                </span>

                <Plus size={17} />
              </button>

              <button
                type="button"
                className="erp-quick-action"
                onClick={() =>
                  openModal(
                    'sale'
                  )
                }
              >
                <span className="erp-quick-icon erp-quick-green">
                  <ShoppingCart
                    size={19}
                  />
                </span>

                <span>
                  <strong>
                    Penjualan
                  </strong>
                  <small>
                    Bandingkan harga sebelum jual
                  </small>
                </span>

                <Plus size={17} />
              </button>
            </div>
          </section>
        </aside>
      </div>

      <section className="erp-panel erp-recent-panel">
        <SectionTitle
          eyebrow="RIWAYAT TERBARU"
          title="Aktivitas terakhir"
          description="Semua data ini nantinya membentuk rekam jejak usaha tani."
          action={
            <button
              type="button"
              className="erp-text-button"
              onClick={() =>
                setActiveTab(
                  'production'
                )
              }
            >
              Lihat data
              <ArrowUpRight
                size={16}
              />
            </button>
          }
        />

        {recentItems.length ===
        0 ? (
          <EmptyState
            title="Belum ada aktivitas"
            description="Catat kegiatan, panen, atau penjualan untuk mulai membangun riwayat usaha."
          />
        ) : (
          <div className="erp-recent-list">
            {recentItems.map(
              (item) => {
                const Icon =
                  item.type ===
                  'activity'
                    ? Activity
                    : item.type ===
                        'harvest'
                      ? Wheat
                      : ShoppingCart;

                return (
                  <div
                    className="erp-recent-row"
                    key={item.id}
                  >
                    <span
                      className={`erp-recent-icon erp-recent-${item.type}`}
                    >
                      <Icon
                        size={18}
                      />
                    </span>

                    <div className="erp-recent-info">
                      <strong>
                        {item.title}
                      </strong>

                      <span>
                        {item.subtitle}
                      </span>
                    </div>

                    <div className="erp-recent-right">
                      {item.amount !==
                        null && (
                        <strong
                          className={
                            item.type ===
                            'sale'
                              ? 'erp-value-positive'
                              : 'erp-value-negative'
                          }
                        >
                          {item.type ===
                          'sale'
                            ? '+'
                            : '−'}
                          {currency(
                            item.amount
                          )}
                        </strong>
                      )}

                      <span>
                        {formatDate(
                          item.date
                        )}
                      </span>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </section>
    </>
  );

  /* =======================================================
     TAB: MARKET / SELLING POWER
     ======================================================= */

  const marketContent = (
    <>
      <section className="erp-selling-power erp-selling-power-large">
        <div className="erp-selling-power-header">
          <div>
            <p className="erp-eyebrow">
              SELLING POWER
            </p>

            <h2>
              Jangan hanya bertanya “siapa yang membeli?”
            </h2>

            <p>
              Gunakan data biaya dan pasar
              untuk menentukan apakah sebuah
              tawaran layak diterima.
            </p>
          </div>

          <button
            type="button"
            className="erp-icon-button"
            title="Perbarui referensi harga"
            onClick={
              handleRefreshMarket
            }
          >
            <RefreshCcw
              size={18}
            />
          </button>
        </div>

        <div className="erp-selling-metrics">
          <div className="erp-selling-metric">
            <span>
              HPP / BEP
            </span>

            <strong>
              {currency(
                financials.hpp
              )}
            </strong>

            <small>
              Harga minimum agar biaya tertutup
            </small>
          </div>

          <div className="erp-selling-metric">
            <span>
              Harga referensi pasar
            </span>

            <strong>
              {currency(
                financials.marketPrice
              )}
            </strong>

            <small>
              Rata-rata sumber referensi
            </small>
          </div>

          <div className="erp-selling-metric">
            <span>
              Margin potensial
            </span>

            <strong
              className={
                financials.marketMargin >=
                0
                  ? 'erp-value-positive'
                  : 'erp-value-negative'
              }
            >
              {financials.marketMargin >=
              0
                ? '+'
                : '−'}
              {currency(
                Math.abs(
                  financials.marketMargin
                )
              )}
            </strong>

            <small>
              Sebelum biaya distribusi tambahan
            </small>
          </div>
        </div>

        <div
          className={`erp-selling-alert erp-alert-${sellingDecision.type}`}
        >
          <div className="erp-selling-alert-icon">
            {sellingDecision.type ===
            'danger' ? (
              <AlertCircle
                size={21}
              />
            ) : sellingDecision.type ===
              'good' ? (
              <CheckCircle2
                size={21}
              />
            ) : (
              <Info size={21} />
            )}
          </div>

          <div>
            <strong>
              {sellingDecision.title}
            </strong>

            <p>
              {sellingDecision.text}
            </p>
          </div>
        </div>
      </section>

      <div className="erp-kpi-grid erp-kpi-grid-three">
        <KpiCard
          icon={Target}
          label="Harga target"
          value={currency(
            financials.targetSellingPrice
          )}
          caption="HPP + target margin 15%"
          tone="green"
        />

        <KpiCard
          icon={TrendingUp}
          label="Harga pasar terbaik"
          value={currency(
            financials.bestMarketPrice
          )}
          caption="Referensi tertinggi"
          tone="navy"
        />

        <KpiCard
          icon={BarChart3}
          label="Ruang margin"
          value={`${marketVsHpp}%`}
          caption="Pasar dibanding HPP"
          tone={
            marketVsHpp >=
            0
              ? 'yellow'
              : 'red'
          }
        />
      </div>

      <div className="erp-main-grid">
        <section className="erp-panel">
          <SectionTitle
            eyebrow="MARKET INTELLIGENCE"
            title="Harga referensi pasar"
            description={`Referensi harga untuk ${activeCycle.commodity}. Terakhir diperbarui ${marketReference.updatedAt}.`}
            action={
              <StatusBadge level="info">
                Data simulasi
              </StatusBadge>
            }
          />

          <div className="erp-market-source-list">
            {marketReference.sources.length ===
            0 ? (
              <EmptyState
                icon={BarChart3}
                title="Belum ada sumber harga"
                description="Hubungkan sumber data harga pasar untuk menampilkan referensi."
              />
            ) : (
              marketReference.sources.map(
                (source) => (
                  <div
                    className="erp-market-source"
                    key={`${source.market}-${source.price}`}
                  >
                    <div className="erp-market-source-icon">
                      <Store
                        size={18}
                      />
                    </div>

                    <div className="erp-market-source-main">
                      <strong>
                        {source.market}
                      </strong>

                      <span>
                        {source.distance}
                      </span>
                    </div>

                    <div className="erp-market-source-price">
                      <strong>
                        {currency(
                          source.price
                        )}
                      </strong>

                      <span>
                        /kg
                      </span>
                    </div>

                    <span
                      className={`erp-market-trend erp-market-trend-${source.trend}`}
                    >
                      {source.trend ===
                      'up' ? (
                        <TrendingUp
                          size={14}
                        />
                      ) : (
                        <ArrowRight
                          size={14}
                        />
                      )}
                    </span>
                  </div>
                )
              )
            )}
          </div>

          <div className="erp-market-summary">
            <div>
              <span>
                Rata-rata referensi
              </span>

              <strong>
                {currency(
                  financials.marketPrice
                )}
                /kg
              </strong>
            </div>

            <div>
              <span>
                Referensi tertinggi
              </span>

              <strong>
                {currency(
                  financials.bestMarketPrice
                )}
                /kg
              </strong>
            </div>
          </div>
        </section>

        <section className="erp-panel">
          <SectionTitle
            eyebrow="CEK TAWARAN"
            title="Apakah harga pembeli wajar?"
            description="Masukkan tawaran yang kamu dapat untuk melihat posisinya terhadap HPP dan pasar."
          />

          <div className="erp-offer-card">
            <div className="erp-offer-card-label">
              <span>
                Tawaran terakhir
              </span>

              <StatusBadge
                level={
                  offerStatus.level ===
                  'unknown'
                    ? 'info'
                    : offerStatus.level
                }
              >
                {offerStatus.label}
              </StatusBadge>
            </div>

            <strong className="erp-offer-price">
              {activeCycle.latestOffer >
              0
                ? `${currency(
                    activeCycle.latestOffer
                  )}/kg`
                : 'Belum ada tawaran'}
            </strong>

            <div className="erp-offer-bars">
              <div>
                <span>
                  HPP
                </span>

                <strong>
                  {currency(
                    financials.hpp
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Pasar
                </span>

                <strong>
                  {currency(
                    financials.marketPrice
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Target
                </span>

                <strong>
                  {currency(
                    financials.targetSellingPrice
                  )}
                </strong>
              </div>
            </div>

            <p className="erp-offer-explanation">
              {offerStatus.description}
            </p>

            <button
              type="button"
              className="erp-button erp-button-primary erp-full-button"
              onClick={() =>
                openModal(
                  'sale'
                )
              }
            >
              <ShoppingCart
                size={17}
              />
              Catat / cek tawaran
            </button>
          </div>
        </section>
      </div>

      {/* BUYER NETWORK */}

      <section className="erp-panel">
        <SectionTitle
          eyebrow="BUYER NETWORK"
          title="Jual ke siapa?"
          description="Alternatif buyer berdasarkan komoditas, grade, volume, dan harga indikatif."
          action={
            <div className="erp-search-box">
              <Search
                size={16}
              />

              <input
                type="search"
                value={buyerSearch}
                onChange={(event) =>
                  setBuyerSearch(
                    event.target.value
                  )
                }
                placeholder="Cari buyer..."
              />
            </div>
          }
        />

        {filteredBuyers.length ===
        0 ? (
          <EmptyState
            icon={Users}
            title="Belum ada buyer yang cocok"
            description="Belum ada buyer demo yang sesuai dengan komoditas atau pencarianmu."
          />
        ) : (
          <div className="erp-buyer-grid">
            {filteredBuyers.map(
              (buyer) => (
                <article
                  className="erp-buyer-card"
                  key={buyer.id}
                >
                  <div className="erp-buyer-top">
                    <span className="erp-buyer-avatar">
                      <Store
                        size={18}
                      />
                    </span>

                    <div>
                      <strong>
                        {buyer.name}
                      </strong>

                      <span>
                        {buyer.type}
                      </span>
                    </div>

                    {buyer.verified && (
                      <BadgeCheck
                        size={18}
                        className="erp-verified-icon"
                      />
                    )}
                  </div>

                  <div className="erp-buyer-price">
                    <span>
                      Harga indikatif
                    </span>

                    <strong>
                      {currency(
                        buyer.price
                      )}
                      /kg
                    </strong>
                  </div>

                  <div className="erp-buyer-details">
                    <div>
                      <span>
                        Kebutuhan
                      </span>
                      <strong>
                        {number(
                          buyer.demandKg
                        )}{' '}
                        kg
                      </strong>
                    </div>

                    <div>
                      <span>
                        Grade
                      </span>
                      <strong>
                        {buyer.grade}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Jarak
                      </span>
                      <strong>
                        {buyer.distance}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Pembayaran
                      </span>
                      <strong>
                        {buyer.payment}
                      </strong>
                    </div>
                  </div>

                  <div className="erp-buyer-fit">
                    <span>
                      Potensi supply
                    </span>

                    <strong>
                      {number(
                        buyer.availableKg
                      )}{' '}
                      kg
                    </strong>
                  </div>

                  <button
                    type="button"
                    className="erp-button erp-button-secondary erp-full-button"
                    onClick={() =>
                      startBuyerOrder(
                        buyer
                      )
                    }
                  >
                    Tawarkan hasil
                    <ArrowRight
                      size={16}
                    />
                  </button>
                </article>
              )
            )}
          </div>
        )}
      </section>

      {/* PRE HARVEST */}

      <section className="erp-panel">
        <SectionTitle
          eyebrow="PRE-HARVEST ORDER"
          title="Cari pembeli sebelum panen"
          description="Kurangi tekanan untuk menjual segera setelah panen dengan mencari komitmen pembeli lebih awal."
          action={
            <button
              type="button"
              className="erp-button erp-button-primary"
              onClick={() =>
                openModal(
                  'preorder'
                )
              }
            >
              <Plus size={17} />
              Buat pre-order
            </button>
          }
        />

        {preOrders.length ===
        0 ? (
          <EmptyState
            icon={CalendarClock}
            title="Belum ada pre-order"
            description="Buat penawaran hasil panen sebelum tanggal panen untuk mulai membangun kepastian pasar."
          />
        ) : (
          <div className="erp-preorder-list">
            {preOrders.map(
              (order) => (
                <div
                  className="erp-preorder-row"
                  key={order.id}
                >
                  <div className="erp-preorder-icon">
                    <CalendarClock
                      size={18}
                    />
                  </div>

                  <div className="erp-preorder-main">
                    <strong>
                      {order.buyer}
                    </strong>

                    <span>
                      Grade {order.grade} ·{' '}
                      {number(
                        order.quantity
                      )}{' '}
                      kg · Panen{' '}
                      {formatDate(
                        order.harvestDate
                      )}
                    </span>
                  </div>

                  <div className="erp-preorder-price">
                    <strong>
                      {currency(
                        order.price
                      )}
                      /kg
                    </strong>

                    <span>
                      {currency(
                        order.price *
                          order.quantity
                      )}
                    </span>
                  </div>

                  <StatusBadge level="info">
                    {order.status}
                  </StatusBadge>

                  <button
                    type="button"
                    className="erp-icon-button erp-danger-icon"
                    onClick={() =>
                      cancelPreOrder(
                        order.id
                      )
                    }
                    title="Batalkan pre-order"
                  >
                    <X
                      size={16}
                    />
                  </button>
                </div>
              )
            )}
          </div>
        )}
      </section>

      {/* FARMER POOL */}

      <section className="erp-panel">
        <SectionTitle
          eyebrow="FARMER POOL"
          title="Gabungkan volume, kuatkan posisi tawar"
          description="Jika volume satu petani belum cukup untuk buyer besar, gabungkan komitmen produksi dengan petani lain."
        />

        <div className="erp-pool-grid">
          {DEMO_FARMER_POOL.map(
            (pool) => {
              const progress =
                pool.targetKg >
                0
                  ? Math.min(
                      100,
                      (pool.committedKg /
                        pool.targetKg) *
                        100
                    )
                  : 0;

              return (
                <article
                  className="erp-pool-card"
                  key={pool.id}
                >
                  <div className="erp-pool-head">
                    <div>
                      <span>
                        {pool.commodity}
                      </span>

                      <h3>
                        {pool.name}
                      </h3>
                    </div>

                    <Users
                      size={21}
                    />
                  </div>

                  <div className="erp-pool-numbers">
                    <div>
                      <span>
                        Komitmen
                      </span>

                      <strong>
                        {number(
                          pool.committedKg
                        )}{' '}
                        kg
                      </strong>
                    </div>

                    <div>
                      <span>
                        Target buyer
                      </span>

                      <strong>
                        {number(
                          pool.buyerNeedKg
                        )}{' '}
                        kg
                      </strong>
                    </div>
                  </div>

                  <div className="erp-progress-track">
                    <div
                      className="erp-progress-fill"
                      style={{
                        width: `${progress}%`,
                      }}
                    />
                  </div>

                  <div className="erp-pool-footer">
                    <span>
                      {pool.members}{' '}
                      petani
                    </span>

                    <strong>
                      {Math.round(
                        progress
                      )}
                      %
                    </strong>
                  </div>

                  <button
                    type="button"
                    className="erp-button erp-button-secondary erp-full-button"
                    onClick={() =>
                      alert(
                        `Fitur bergabung ke ${pool.name} siap dihubungkan ke backend kelompok tani.`
                      )
                    }
                  >
                    Lihat peluang pool
                    <ArrowRight
                      size={16}
                    />
                  </button>
                </article>
              );
            }
          )}
        </div>
      </section>
    </>
  );

  /* =======================================================
     TAB: PRODUCTION
     ======================================================= */

  const productionContent = (
    <>
      <SectionTitle
        eyebrow="PRODUKSI"
        title="Produksi & stok"
        description="Data produksi adalah fondasi untuk menghitung HPP, kapasitas supply, dan peluang penjualan."
        action={
          <div className="erp-action-group">
            <button
              type="button"
              className="erp-button erp-button-secondary"
              onClick={() =>
                openModal(
                  'harvest'
                )
              }
            >
              <Plus size={17} />
              Catat panen
            </button>

            <button
              type="button"
              className="erp-button erp-button-primary"
              onClick={() =>
                openModal(
                  'sale'
                )
              }
            >
              <ShoppingCart
                size={17}
              />
              Jual hasil
            </button>
          </div>
        }
      />

      <div className="erp-kpi-grid erp-kpi-grid-three">
        <KpiCard
          icon={Wheat}
          label="Total panen"
          value={`${number(
            totalHarvest
          )} kg`}
          caption={`${number(
            financials.stock.A +
              financials.stock.B +
              financials.stock.C
          )} kg siap jual`}
          tone="yellow"
        />

        <KpiCard
          icon={Boxes}
          label="Stok siap jual"
          value={`${number(
            financials.totalStock
          )} kg`}
          caption={`${stockCoverage}% dari target`}
          tone="navy"
        />

        <KpiCard
          icon={Package}
          label="Belum terklasifikasi"
          value={`${number(
            unclassifiedKg
          )} kg`}
          caption="Perlu grading"
          tone={
            unclassifiedKg >
            0
              ? 'orange'
              : 'green'
          }
        />
      </div>

      <div className="erp-stock-grid">
        {['A', 'B', 'C'].map(
          (grade) => (
            <article
              className={`erp-stock-card erp-stock-${grade}`}
              key={grade}
            >
              <div className="erp-stock-card-top">
                <span>
                  Grade {grade}
                </span>

                <span className="erp-stock-badge">
                  Tersedia
                </span>
              </div>

              <strong>
                {number(
                  financials.stock[
                    grade
                  ]
                )}{' '}
                kg
              </strong>

              <p>
                Nilai estimasi{' '}
                {currency(
                  financials.stock[
                    grade
                  ] *
                    activeCycle
                      .prices[
                      grade
                    ]
                )}
              </p>

              <small>
                Harga estimasi{' '}
                {currency(
                  activeCycle
                    .prices[
                    grade
                  ]
                )}
                /kg
              </small>
            </article>
          )
        )}

        <article className="erp-stock-card erp-stock-total">
          <div className="erp-stock-card-top">
            <span>
              Total stok
            </span>

            <Boxes size={18} />
          </div>

          <strong>
            {number(
              financials.totalStock
            )}{' '}
            kg
          </strong>

          <p>
            Hasil terklasifikasi dan belum terjual.
          </p>

          <small>
            Belum termasuk hasil belum terklasifikasi.
          </small>
        </article>
      </div>

      <div className="erp-notice">
        <AlertCircle
          size={18}
        />

        <p>
          <strong>
            Jangan biarkan stok menjadi
            tekanan untuk menerima harga rendah.
          </strong>{' '}
          Gunakan data stok untuk melihat
          berapa volume yang tersedia dan
          bandingkan dengan kebutuhan buyer.
        </p>
      </div>

      {/* PLAN + ACTIVITY */}

      <section className="erp-panel">
        <SectionTitle
          eyebrow="PERENCANAAN"
          title="Rencana kebutuhan"
          description="Benih, pupuk, tenaga kerja, dan input lainnya."
          action={
            <button
              type="button"
              className="erp-button erp-button-secondary"
              onClick={() =>
                openModal(
                  'plan'
                )
              }
            >
              <Plus size={17} />
              Tambah kebutuhan
            </button>
          }
        />

        {activeCycle.planItems.length ===
        0 ? (
          <EmptyState
            icon={
              ClipboardList
            }
            title="Belum ada rencana kebutuhan"
            description="Tambahkan input dan perkiraan biayanya."
          />
        ) : (
          <div className="erp-list">
            {activeCycle.planItems.map(
              (item) => {
                const lineTotal =
                  Number(
                    item.quantity ||
                      0
                  ) *
                  Number(
                    item.unitCost ||
                      0
                  );

                return (
                  <div
                    className="erp-list-row"
                    key={item.id}
                  >
                    <span className="erp-list-icon">
                      <Leaf
                        size={18}
                      />
                    </span>

                    <div className="erp-list-main">
                      <strong>
                        {item.name}
                      </strong>

                      <span>
                        {item.category}{' '}
                        ·{' '}
                        {number(
                          item.quantity
                        )}{' '}
                        {
                          item.unit
                        }
                      </span>
                    </div>

                    <div className="erp-list-value">
                      <strong>
                        {currency(
                          lineTotal
                        )}
                      </strong>

                      <span>
                        {currency(
                          item.unitCost
                        )}{' '}
                        /{' '}
                        {item.unit}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="erp-icon-button erp-danger-icon"
                      onClick={() =>
                        removePlanItem(
                          item.id
                        )
                      }
                      title="Hapus item"
                    >
                      <Trash2
                        size={16}
                      />
                    </button>
                  </div>
                );
              }
            )}
          </div>
        )}

        <div className="erp-panel-total">
          <span>
            Total estimasi kebutuhan
          </span>

          <strong>
            {currency(
              financials.planCost
            )}
          </strong>
        </div>
      </section>

      <section className="erp-panel">
        <SectionTitle
          eyebrow="REALISASI"
          title="Catatan kegiatan"
          description="Biaya aktual digunakan untuk menghitung HPP."
          action={
            <button
              type="button"
              className="erp-button erp-button-primary"
              onClick={() =>
                openModal(
                  'activity'
                )
              }
            >
              <Plus size={17} />
              Catat kegiatan
            </button>
          }
        />

        {activeCycle.activities.length ===
        0 ? (
          <EmptyState
            icon={Activity}
            title="Belum ada kegiatan"
            description="Catat pekerjaan dan biaya aktual di lahan."
          />
        ) : (
          <div className="erp-list">
            {activeCycle.activities.map(
              (activity) => (
                <div
                  className="erp-list-row"
                  key={activity.id}
                >
                  <span className="erp-list-icon erp-list-icon-orange">
                    <Activity
                      size={18}
                    />
                  </span>

                  <div className="erp-list-main">
                    <strong>
                      {activity.title}
                    </strong>

                    <span>
                      {formatDate(
                        activity.date
                      )}{' '}
                      ·{' '}
                      {
                        activity.category
                      }
                    </span>

                    {activity.note && (
                      <small className="erp-list-note">
                        {
                          activity.note
                        }
                      </small>
                    )}
                  </div>

                  <div className="erp-list-value">
                    <strong>
                      {currency(
                        activity.cost
                      )}
                    </strong>

                    <span>
                      Biaya aktual
                    </span>
                  </div>

                  <button
                    type="button"
                    className="erp-icon-button erp-danger-icon"
                    onClick={() =>
                      removeActivity(
                        activity.id
                      )
                    }
                    title="Hapus kegiatan"
                  >
                    <Trash2
                      size={16}
                    />
                  </button>
                </div>
              )
            )}
          </div>
        )}
      </section>

      {/* HARVEST HISTORY */}

      <section className="erp-panel">
        <SectionTitle
          eyebrow="HASIL PRODUKSI"
          title="Riwayat panen"
          description="Pisahkan hasil berdasarkan grade agar stok dan nilai produk lebih akurat."
        />

        {activeCycle.harvests.length ===
        0 ? (
          <EmptyState
            icon={Wheat}
            title="Belum ada hasil panen"
            description="Catat hasil panen dan grading setelah panen dilakukan."
          />
        ) : (
          <div className="erp-harvest-list">
            {activeCycle.harvests.map(
              (harvest) => {
                const classified =
                  Number(
                    harvest.gradeA ||
                      0
                  ) +
                  Number(
                    harvest.gradeB ||
                      0
                  ) +
                  Number(
                    harvest.gradeC ||
                      0
                  ) +
                  Number(
                    harvest.rejectedKg ||
                      0
                  );

                const pending =
                  Math.max(
                    0,
                    Number(
                      harvest.totalKg
                    ) -
                      classified
                  );

                return (
                  <article
                    className="erp-harvest-row"
                    key={
                      harvest.id
                    }
                  >
                    <div className="erp-harvest-date">
                      <span className="erp-harvest-date-icon">
                        <Wheat
                          size={19}
                        />
                      </span>

                      <div>
                        <strong>
                          {formatDate(
                            harvest.date
                          )}
                        </strong>

                        <span>
                          Total hasil panen
                        </span>
                      </div>
                    </div>

                    <div className="erp-harvest-total">
                      <strong>
                        {number(
                          harvest.totalKg
                        )}{' '}
                        kg
                      </strong>

                      <span>
                        Hasil keseluruhan
                      </span>
                    </div>

                    <div className="erp-grade-breakdown">
                      <span className="erp-grade-a">
                        A:{' '}
                        {number(
                          harvest.gradeA
                        )}{' '}
                        kg
                      </span>

                      <span className="erp-grade-b">
                        B:{' '}
                        {number(
                          harvest.gradeB
                        )}{' '}
                        kg
                      </span>

                      <span className="erp-grade-c">
                        C:{' '}
                        {number(
                          harvest.gradeC
                        )}{' '}
                        kg
                      </span>

                      <span className="erp-grade-reject">
                        Rusak:{' '}
                        {number(
                          harvest.rejectedKg
                        )}{' '}
                        kg
                      </span>

                      {pending >
                        0 && (
                        <span className="erp-grade-pending">
                          Belum dinilai:{' '}
                          {number(
                            pending
                          )}{' '}
                          kg
                        </span>
                      )}
                    </div>

                    {harvest.note && (
                      <p className="erp-harvest-note">
                        {
                          harvest.note
                        }
                      </p>
                    )}
                  </article>
                );
              }
            )}
          </div>
        )}
      </section>
    </>
  );

  /* =======================================================
     TAB: FINANCE
     ======================================================= */

  const financeContent = (
    <>
      <SectionTitle
        eyebrow="LAPORAN USAHA"
        title="Keuangan siklus"
        description="Keuangan tidak hanya untuk laporan. Data biaya menjadi dasar untuk menentukan harga jual minimum."
        action={
          <button
            type="button"
            className="erp-button erp-button-secondary"
            onClick={() =>
              window.print()
            }
          >
            <Receipt
              size={17}
            />
            Cetak laporan
          </button>
        }
      />

      <section className="erp-finance-highlight">
        <div className="erp-finance-highlight-copy">
          <span>
            HPP / Break Even Price
          </span>

          <h2>
            {currency(
              financials.hpp
            )}
            <small>
              /kg
            </small>
          </h2>

          <p>
            Ini adalah biaya produksi
            rata-rata per kg berdasarkan
            biaya aktual yang sudah dicatat.
          </p>
        </div>

        <div className="erp-finance-highlight-side">
          <span>
            Referensi pasar
          </span>

          <strong>
            {currency(
              financials.marketPrice
            )}
            /kg
          </strong>

          <span>
            Potensi margin
          </span>

          <strong
            className={
              financials.marketMargin >=
              0
                ? 'erp-value-positive'
                : 'erp-value-negative'
            }
          >
            {financials.marketMargin >=
            0
              ? '+'
              : '−'}
            {currency(
              Math.abs(
                financials.marketMargin
              )
            )}
            /kg
          </strong>
        </div>
      </section>

      <div className="erp-kpi-grid">
        <KpiCard
          icon={Wallet}
          label="Biaya aktual"
          value={currency(
            financials.actualCost
          )}
          caption="Total biaya tercatat"
          tone="orange"
        />

        <KpiCard
          icon={ShoppingCart}
          label="Penjualan"
          value={currency(
            financials.salesValue
          )}
          caption="Nilai seluruh transaksi"
          tone="navy"
        />

        <KpiCard
          icon={HandCoins}
          label="Uang diterima"
          value={currency(
            financials.cashReceived
          )}
          caption="Cash collected"
          tone="green"
        />

        <KpiCard
          icon={Clock3}
          label="Piutang"
          value={currency(
            financials.receivables
          )}
          caption="Belum diterima"
          tone={
            financials.receivables >
            0
              ? 'yellow'
              : 'green'
          }
        />
      </div>

      <div className="erp-main-grid">
        <section className="erp-panel">
          <SectionTitle
            eyebrow="KONTROL BIAYA"
            title="Rencana vs aktual"
            description="Biaya yang meningkat akan langsung memengaruhi HPP."
          />

          <div className="erp-comparison-row">
            <div>
              <span>
                Biaya rencana
              </span>

              <strong>
                {currency(
                  financials.planCost
                )}
              </strong>
            </div>

            <div>
              <span>
                Biaya aktual
              </span>

              <strong>
                {currency(
                  financials.actualCost
                )}
              </strong>
            </div>
          </div>

          <div className="erp-progress-track erp-finance-progress">
            <div
              className={`erp-progress-fill ${
                financials.actualCost >
                financials.planCost
                  ? 'erp-progress-over'
                  : ''
              }`}
              style={{
                width: `${
                  financials.planCost >
                  0
                    ? Math.min(
                        100,
                        (financials.actualCost /
                          financials.planCost) *
                          100
                      )
                    : financials.actualCost >
                        0
                      ? 100
                      : 0
                }%`,
              }}
            />
          </div>

          <div className="erp-comparison-footer">
            <span
              className={
                financials.actualCost >
                financials.planCost
                  ? 'erp-value-negative'
                  : 'erp-value-positive'
              }
            >
              {financials.actualCost >
              financials.planCost
                ? 'Melebihi rencana'
                : 'Masih dalam rencana'}
            </span>

            <strong>
              {currency(
                Math.abs(
                  financials.planCost -
                    financials.actualCost
                )
              )}
            </strong>
          </div>

          <div className="erp-divider" />

          <div className="erp-finance-note">
            <AlertCircle
              size={17}
            />

            <p>
              HPP akan semakin akurat jika
              seluruh biaya tenaga kerja,
              input, transportasi, sewa,
              dan biaya lain dicatat.
            </p>
          </div>
        </section>

        <section className="erp-panel">
          <SectionTitle
            eyebrow="HPP"
            title="Struktur biaya"
            description="Lihat komponen biaya yang paling banyak memengaruhi biaya produksi."
          />

          {activeCycle.activities.length ===
          0 ? (
            <EmptyState
              icon={Wallet}
              title="Belum ada biaya"
              description="Catat kegiatan beserta biaya aktual."
            />
          ) : (
            <div className="erp-expense-breakdown">
              {Object.entries(
                activeCycle.activities.reduce(
                  (
                    groups,
                    activity
                  ) => {
                    const category =
                      activity.category ||
                      'Lainnya';

                    groups[
                      category
                    ] =
                      (groups[
                        category
                      ] || 0) +
                      Number(
                        activity.cost ||
                          0
                      );

                    return groups;
                  },
                  {}
                )
              )
                .sort(
                  (a, b) =>
                    b[1] -
                    a[1]
                )
                .map(
                  ([
                    category,
                    amount,
                  ]) => {
                    const share =
                      financials.actualCost >
                      0
                        ? (amount /
                            financials.actualCost) *
                          100
                        : 0;

                    return (
                      <div
                        className="erp-expense-item"
                        key={
                          category
                        }
                      >
                        <div className="erp-expense-item-head">
                          <span>
                            {
                              category
                            }
                          </span>

                          <strong>
                            {currency(
                              amount
                            )}
                          </strong>
                        </div>

                        <div className="erp-progress-track">
                          <div
                            className="erp-expense-bar"
                            style={{
                              width: `${share}%`,
                            }}
                          />
                        </div>

                        <small>
                          {Math.round(
                            share
                          )}
                          % dari biaya
                          tercatat
                        </small>
                      </div>
                    );
                  }
                )}
            </div>
          )}
        </section>
      </div>

      {/* FINANCIAL DECISION */}

      <section className="erp-panel">
        <SectionTitle
          eyebrow="KEPUTUSAN HARGA"
          title="Harga minimum yang harus dijaga"
          description="Jadikan HPP sebagai referensi saat menerima tawaran buyer."
        />

        <div className="erp-price-ladder">
          <div className="erp-price-step erp-price-danger">
            <span>
              Di bawah HPP
            </span>

            <strong>
              &lt;{' '}
              {currency(
                financials.hpp
              )}
            </strong>

            <small>
              Risiko biaya tidak tertutup
            </small>
          </div>

          <div className="erp-price-step erp-price-neutral">
            <span>
              Break Even
            </span>

            <strong>
              {currency(
                financials.breakEvenPrice
              )}
            </strong>

            <small>
              Biaya tertutup
            </small>
          </div>

          <div className="erp-price-step erp-price-good">
            <span>
              Harga pasar
            </span>

            <strong>
              {currency(
                financials.marketPrice
              )}
            </strong>

            <small>
              Referensi pasar
            </small>
          </div>

          <div className="erp-price-step erp-price-target">
            <span>
              Target
            </span>

            <strong>
              {currency(
                financials.targetSellingPrice
              )}
            </strong>

            <small>
              Target margin
            </small>
          </div>
        </div>
      </section>

      {/* PAYMENT */}

      <section className="erp-panel">
        <SectionTitle
          eyebrow="REKONSILIASI"
          title="Pembayaran dan piutang"
          description="Pastikan harga yang bagus juga diikuti kepastian pembayaran."
        />

        {recordedSales.length ===
        0 ? (
          <EmptyState
            icon={HandCoins}
            title="Belum ada transaksi"
            description="Transaksi penjualan akan muncul setelah hasil panen terjual."
          />
        ) : (
          <div className="erp-list">
            {recordedSales.map(
              (sale) => {
                const remaining =
                  Math.max(
                    0,
                    Number(
                      sale.amount
                    ) -
                      Number(
                        sale.paidAmount
                      )
                  );

                return (
                  <div
                    className="erp-list-row"
                    key={
                      sale.id
                    }
                  >
                    <span className="erp-list-icon erp-list-icon-green">
                      <HandCoins
                        size={18}
                      />
                    </span>

                    <div className="erp-list-main">
                      <strong>
                        {sale.buyer}
                      </strong>

                      <span>
                        {formatDate(
                          sale.date
                        )}{' '}
                        ·{' '}
                        {number(
                          sale.quantity
                        )}{' '}
                        kg · Grade{' '}
                        {
                          sale.grade
                        }
                      </span>

                      <small className="erp-list-note">
                        Diterima{' '}
                        {currency(
                          sale.paidAmount
                        )}{' '}
                        dari{' '}
                        {currency(
                          sale.amount
                        )}
                      </small>
                    </div>

                    <div className="erp-list-value">
                      {remaining >
                      0 ? (
                        <>
                          <strong className="erp-value-negative">
                            {currency(
                              remaining
                            )}
                          </strong>

                          <span>
                            Piutang
                          </span>
                        </>
                      ) : (
                        <>
                          <strong className="erp-value-positive">
                            Lunas
                          </strong>

                          <span>
                            Pembayaran selesai
                          </span>
                        </>
                      )}
                    </div>

                    {remaining >
                      0 && (
                      <button
                        type="button"
                        className="erp-small-button"
                        onClick={() =>
                          openModal(
                            'payment',
                            {
                              saleId:
                                sale.id,
                            }
                          )
                        }
                      >
                        <Plus
                          size={14}
                        />
                        Bayar
                      </button>
                    )}
                  </div>
                );
              }
            )}
          </div>
        )}
      </section>
    </>
  );

  /* =======================================================
     TAB: FARM PROFILE
     ======================================================= */

  const profileContent = (
    <>
      <SectionTitle
        eyebrow="FARM PROFILE"
        title="Rekam jejak usaha tani"
        description="Data produksi, biaya, penjualan, dan pembayaran membentuk profil usaha yang bisa digunakan untuk membuka lebih banyak peluang."
      />

      <section className="erp-profile-hero">
        <div className="erp-profile-avatar">
          <Sprout size={28} />
        </div>

        <div>
          <span>
            Profil usaha
          </span>

          <h2>
            {activeCycle.commodity}
          </h2>

          <p>
            {activeCycle.plotName} ·{' '}
            {number(
              activeCycle.areaHa
            )}{' '}
            ha
          </p>
        </div>

        <div className="erp-profile-status">
          <BadgeCheck
            size={17}
          />

          <span>
            Data usaha tercatat
          </span>
        </div>
      </section>

      <div className="erp-kpi-grid">
        <KpiCard
          icon={Wheat}
          label="Produksi tercatat"
          value={`${number(
            totalHarvest
          )} kg`}
          caption="Total hasil panen"
          tone="yellow"
        />

        <KpiCard
          icon={Wallet}
          label="Modal tercatat"
          value={currency(
            financials.actualCost
          )}
          caption="Biaya aktual"
          tone="orange"
        />

        <KpiCard
          icon={ShoppingCart}
          label="Penjualan"
          value={currency(
            financials.salesValue
          )}
          caption={`${recordedSales.length} transaksi`}
          tone="navy"
        />

        <KpiCard
          icon={Users}
          label="Buyer"
          value={
            new Set(
              recordedSales.map(
                (sale) =>
                  sale.buyer
              )
            ).size
          }
          caption="Buyer tercatat"
          tone="green"
        />
      </div>

      {/* PROFILE SCORE */}

      <section className="erp-panel">
        <SectionTitle
          eyebrow="FINANCING READINESS"
          title="Kesiapan rekam jejak usaha"
          description="Semakin lengkap data usaha, semakin mudah pihak mitra memahami kapasitas bisnis petani. Ini bukan jaminan persetujuan pembiayaan."
        />

        <div className="erp-readiness-grid">
          <div className="erp-readiness-item">
            <span>
              Data produksi
            </span>

            <strong>
              {totalHarvest >
              0
                ? 'Lengkap'
                : 'Perlu data'}
            </strong>

            <small>
              Panen dan grading
            </small>
          </div>

          <div className="erp-readiness-item">
            <span>
              Data biaya
            </span>

            <strong>
              {financials.actualCost >
              0
                ? 'Lengkap'
                : 'Perlu data'}
            </strong>

            <small>
              Dasar perhitungan HPP
            </small>
          </div>

          <div className="erp-readiness-item">
            <span>
              Data penjualan
            </span>

            <strong>
              {recordedSales.length >
              0
                ? 'Ada histori'
                : 'Belum ada'}
            </strong>

            <small>
              Bukti transaksi
            </small>
          </div>

          <div className="erp-readiness-item">
            <span>
              Data pembayaran
            </span>

            <strong>
              {financials.cashReceived >
              0
                ? 'Ada histori'
                : 'Belum ada'}
            </strong>

            <small>
              Cash collection
            </small>
          </div>
        </div>

        <div className="erp-profile-note">
          <Info size={17} />

          <p>
            <strong>
              Financing readiness
            </strong>{' '}
            hanya menunjukkan kelengkapan
            rekam jejak usaha di AgroERP.
            Keputusan pembiayaan tetap
            bergantung pada lembaga dan
            kriteria masing-masing.
          </p>
        </div>
      </section>

      {/* BUSINESS SUMMARY */}

      <section className="erp-panel">
        <SectionTitle
          eyebrow="BUSINESS SNAPSHOT"
          title="Ringkasan usaha"
          description="Angka utama yang bisa digunakan untuk berbicara dengan buyer, kelompok tani, koperasi, atau mitra."
        />

        <div className="erp-business-grid">
          <div>
            <span>
              Luas lahan
            </span>

            <strong>
              {number(
                activeCycle.areaHa
              )}{' '}
              ha
            </strong>
          </div>

          <div>
            <span>
              Target produksi
            </span>

            <strong>
              {number(
                activeCycle.targetYieldKg
              )}{' '}
              kg
            </strong>
          </div>

          <div>
            <span>
              HPP
            </span>

            <strong>
              {currency(
                financials.hpp
              )}
              /kg
            </strong>
          </div>

          <div>
            <span>
              Harga pasar
            </span>

            <strong>
              {currency(
                financials.marketPrice
              )}
              /kg
            </strong>
          </div>

          <div>
            <span>
              Stok
            </span>

            <strong>
              {number(
                financials.totalStock
              )}{' '}
              kg
            </strong>
          </div>

          <div>
            <span>
              Pre-order
            </span>

            <strong>
              {number(
                preOrderKg
              )}{' '}
              kg
            </strong>
          </div>
        </div>
      </section>

      {/* NEXT STEPS */}

      <section className="erp-panel">
        <SectionTitle
          eyebrow="LANGKAH BERIKUTNYA"
          title="Apa yang perlu dilakukan?"
          description="AgroERP mengubah data menjadi daftar tindakan yang lebih konkret."
        />

        <div className="erp-next-step-list">
          {financials.hpp ===
            0 && (
            <div className="erp-next-step">
              <span>
                01
              </span>

              <div>
                <strong>
                  Lengkapi biaya produksi
                </strong>

                <p>
                  Catat kegiatan dan biaya
                  agar HPP dapat dihitung.
                </p>
              </div>

              <button
                type="button"
                className="erp-text-button"
                onClick={() =>
                  setActiveTab(
                    'production'
                  )
                }
              >
                Catat
                <ArrowRight
                  size={15}
                />
              </button>
            </div>
          )}

          {financials.hpp >
            0 &&
            buyerMatches.length ===
              0 && (
              <div className="erp-next-step">
                <span>
                  01
                </span>

                <div>
                  <strong>
                    Cari buyer alternatif
                  </strong>

                  <p>
                    Belum ada buyer yang
                    cocok dengan stok saat ini.
                  </p>
                </div>

                <button
                  type="button"
                  className="erp-text-button"
                  onClick={() =>
                    setActiveTab(
                      'market'
                    )
                  }
                >
                  Cari buyer
                  <ArrowRight
                    size={15}
                  />
                </button>
              </div>
            )}

          {financials.hpp >
            0 &&
            financials.marketPrice >
              financials.hpp && (
              <div className="erp-next-step">
                <span>
                  02
                </span>

                <div>
                  <strong>
                    Pertahankan ruang margin
                  </strong>

                  <p>
                    Harga pasar berada{' '}
                    {marketVsHpp}% di atas
                    HPP.
                  </p>
                </div>

                <button
                  type="button"
                  className="erp-text-button"
                  onClick={() =>
                    setActiveTab(
                      'market'
                    )
                  }
                >
                  Lihat pasar
                  <ArrowRight
                    size={15}
                  />
                </button>
              </div>
            )}

          {financials.totalStock >
            0 &&
            preOrderKg <
              financials.totalStock && (
              <div className="erp-next-step">
                <span>
                  03
                </span>

                <div>
                  <strong>
                    Cari pembeli sebelum stok terjual
                  </strong>

                  <p>
                    Buat pre-order atau
                    tawarkan stok ke buyer
                    alternatif.
                  </p>
                </div>

                <button
                  type="button"
                  className="erp-text-button"
                  onClick={() =>
                    setActiveTab(
                      'market'
                    )
                  }
                >
                  Cari buyer
                  <ArrowRight
                    size={15}
                  />
                </button>
              </div>
            )}

          <div className="erp-next-step">
            <span>
              04
            </span>

            <div>
              <strong>
                Bangun rekam jejak
              </strong>

              <p>
                Terus catat produksi,
                penjualan, dan pembayaran.
              </p>
            </div>

            <button
              type="button"
              className="erp-text-button"
              onClick={() =>
                setActiveTab(
                  'profile'
                )
              }
            >
              Lihat profil
              <ArrowRight
                size={15}
              />
            </button>
          </div>
        </div>
      </section>
    </>
  );

  /* =======================================================
     MODAL DATA
     ======================================================= */

  const selectedSale =
    modal?.type ===
    'payment'
      ? activeCycle.sales.find(
          (sale) =>
            sale.id ===
            modal.saleId
        )
      : null;

  const modalBuyer =
    modal?.buyerPreset ||
    '';

  const modalPrice =
    modal?.pricePreset ||
    financials.marketPrice ||
    activeCycle.prices.A ||
    0;

  const modalGrade =
    modal?.gradePreset ||
    'A';

  const modalQuantity =
    modal?.quantityPreset ||
    Math.min(
      100,
      Math.max(
        1,
        financials.totalStock
      )
    );

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="erp-page">
      <Navbar />

      <main className="erp-shell">
        {/* HEADER */}

        <header className="erp-page-header">
          <div>
            <div className="erp-page-title-line">
              <span className="erp-brand-mark">
                <Sprout
                  size={21}
                />
              </span>

              <h1>
                AgroERP
              </h1>

              <span className="erp-demo-badge">
                DATA SIMULASI
              </span>
            </div>

            <p>
              Dari biaya produksi sampai
              keputusan menjual hasil panen.
            </p>
          </div>

          <div className="erp-header-controls">
            <label className="erp-cycle-select-wrap">
              <span className="erp-select-label">
                Siklus aktif
              </span>

              <span className="erp-cycle-select-control">
                <select
                  value={
                    activeCycle.id
                  }
                  onChange={(
                    event
                  ) =>
                    setActiveCycleId(
                      event.target
                        .value
                    )
                  }
                  aria-label="Pilih siklus usaha tani"
                >
                  {cycles.map(
                    (cycle) => (
                      <option
                        value={
                          cycle.id
                        }
                        key={
                          cycle.id
                        }
                      >
                        {
                          cycle.commodity
                        }{' '}
                        ·{' '}
                        {
                          cycle.plotName
                        }
                      </option>
                    )
                  )}
                </select>

                <ChevronDown
                  size={16}
                />
              </span>
            </label>

            <button
              type="button"
              className="erp-button erp-button-primary"
              onClick={() =>
                openModal(
                  'cycle'
                )
              }
            >
              <Plus
                size={17}
              />

              <span>
                Siklus baru
              </span>
            </button>
          </div>
        </header>

        {/* MOBILE FRIENDLY NAV */}

        <nav
          className="erp-tabs"
          aria-label="Navigasi AgroERP"
        >
          {tabs.map(
            ({
              id,
              label,
              icon: Icon,
            }) => (
              <button
                type="button"
                key={id}
                className={`erp-tab ${
                  activeTab === id
                    ? 'erp-tab-active'
                    : ''
                }`}
                onClick={() =>
                  setActiveTab(
                    id
                  )
                }
              >
                <Icon
                  size={17}
                />

                <span>
                  {label}
                </span>
              </button>
            )
          )}
        </nav>

        {/* CONTENT */}

        <div className="erp-tab-content">
          {activeTab ===
            'overview' &&
            overviewContent}

          {activeTab ===
            'market' &&
            marketContent}

          {activeTab ===
            'production' &&
            productionContent}

          {activeTab ===
            'finance' &&
            financeContent}

          {activeTab ===
            'profile' &&
            profileContent}
        </div>

        {/* FOOTER */}

        <footer className="erp-footer">
          <div>
            <span className="erp-footer-mark">
              <Leaf size={14} />
            </span>

            <span>
              AgroERP · TANIWAVE
            </span>
          </div>

          <p>
            Data tersimpan pada browser
            ini. Harga pasar merupakan
            data simulasi sampai API
            pasar dihubungkan.
          </p>

          <button
            type="button"
            className="erp-reset-button"
            onClick={
              resetDemo
            }
          >
            <RotateCcw
              size={13}
            />
            Reset data demo
          </button>
        </footer>
      </main>

      {/* ===================================================
          MODALS
          =================================================== */}

      {modal && (
        <div
          className="erp-modal-backdrop"
          role="presentation"
          onMouseDown={(
            event
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >
          <section
            className="erp-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="erp-modal-title"
          >
            <header className="erp-modal-header">
              <div>
                <p className="erp-eyebrow">
                  AGROERP
                </p>

                <h2 id="erp-modal-title">
                  {modal.type ===
                    'cycle' &&
                    'Buat siklus usaha tani'}

                  {modal.type ===
                    'plan' &&
                    'Tambah rencana kebutuhan'}

                  {modal.type ===
                    'activity' &&
                    'Catat kegiatan budidaya'}

                  {modal.type ===
                    'harvest' &&
                    'Catat hasil panen'}

                  {modal.type ===
                    'sale' &&
                    'Cek & catat tawaran buyer'}

                  {modal.type ===
                    'preorder' &&
                    'Buat pre-harvest order'}

                  {modal.type ===
                    'payment' &&
                    'Catat pembayaran'}
                </h2>
              </div>

              <button
                type="button"
                className="erp-icon-button"
                onClick={
                  closeModal
                }
                aria-label="Tutup formulir"
              >
                <X
                  size={19}
                />
              </button>
            </header>

            {formError && (
              <div className="erp-form-error">
                <AlertCircle
                  size={17}
                />

                <span>
                  {formError}
                </span>
              </div>
            )}

            {/* =============================================
                CYCLE MODAL
                ============================================= */}

            {modal.type ===
              'cycle' && (
              <form
                className="erp-form"
                onSubmit={
                  handleAddCycle
                }
              >
                <label className="erp-field">
                  <span>
                    Komoditas *
                  </span>

                  <input
                    name="commodity"
                    type="text"
                    placeholder="Contoh: Cabai rawit"
                    required
                    autoFocus
                  />
                </label>

                <label className="erp-field">
                  <span>
                    Nama lahan
                  </span>

                  <input
                    name="plotName"
                    type="text"
                    placeholder="Contoh: Lahan belakang"
                  />
                </label>

                <div className="erp-form-grid">
                  <label className="erp-field">
                    <span>
                      Luas lahan (ha) *
                    </span>

                    <input
                      name="areaHa"
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="0.5"
                      required
                    />
                  </label>

                  <label className="erp-field">
                    <span>
                      Target panen (kg) *
                    </span>

                    <input
                      name="targetYieldKg"
                      type="number"
                      min="1"
                      step="1"
                      placeholder="1000"
                      required
                    />
                  </label>
                </div>

                <div className="erp-form-grid">
                  <label className="erp-field">
                    <span>
                      Tanggal mulai *
                    </span>

                    <input
                      name="startDate"
                      type="date"
                      defaultValue={
                        todayISO()
                      }
                      required
                    />
                  </label>

                  <label className="erp-field">
                    <span>
                      Perkiraan panen *
                    </span>

                    <input
                      name="expectedHarvestDate"
                      type="date"
                      defaultValue={
                        dateAfterDays(
                          60
                        )
                      }
                      required
                    />
                  </label>
                </div>

                <label className="erp-field">
                  <span>
                    Estimasi harga jual
                    rata-rata/kg (Rp) *
                  </span>

                  <input
                    name="estimatedPricePerKg"
                    type="number"
                    min="1"
                    step="100"
                    placeholder="5000"
                    required
                  />

                  <small>
                    Digunakan sebagai
                    proyeksi awal.
                    Harga pasar pada
                    modul Daya Jual
                    adalah referensi
                    terpisah.
                  </small>
                </label>

                <ModalActions
                  onCancel={
                    closeModal
                  }
                  submitLabel="Buat siklus"
                />
              </form>
            )}

            {/* =============================================
                PLAN MODAL
                ============================================= */}

            {modal.type ===
              'plan' && (
              <form
                className="erp-form"
                onSubmit={
                  handleAddPlanItem
                }
              >
                <label className="erp-field">
                  <span>
                    Nama kebutuhan *
                  </span>

                  <input
                    name="name"
                    type="text"
                    placeholder="Contoh: Pupuk NPK"
                    required
                    autoFocus
                  />
                </label>

                <label className="erp-field">
                  <span>
                    Kategori *
                  </span>

                  <select
                    name="category"
                    defaultValue="Pupuk"
                    required
                  >
                    <option>
                      Benih
                    </option>
                    <option>
                      Pupuk
                    </option>
                    <option>
                      Pestisida
                    </option>
                    <option>
                      Tenaga kerja
                    </option>
                    <option>
                      Air dan energi
                    </option>
                    <option>
                      Sewa dan alat
                    </option>
                    <option>
                      Transportasi
                    </option>
                    <option>
                      Lainnya
                    </option>
                  </select>
                </label>

                <div className="erp-form-grid">
                  <label className="erp-field">
                    <span>
                      Jumlah *
                    </span>

                    <input
                      name="quantity"
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="5"
                      required
                    />
                  </label>

                  <label className="erp-field">
                    <span>
                      Satuan *
                    </span>

                    <input
                      name="unit"
                      type="text"
                      placeholder="kg, sak, liter"
                      required
                    />
                  </label>
                </div>

                <label className="erp-field">
                  <span>
                    Harga per satuan (Rp) *
                  </span>

                  <input
                    name="unitCost"
                    type="number"
                    min="0"
                    step="100"
                    placeholder="250000"
                    required
                  />
                </label>

                <p className="erp-modal-hint">
                  Total kebutuhan =
                  jumlah × harga per
                  satuan.
                </p>

                <ModalActions
                  onCancel={
                    closeModal
                  }
                  submitLabel="Simpan kebutuhan"
                />
              </form>
            )}

            {/* =============================================
                ACTIVITY MODAL
                ============================================= */}

            {modal.type ===
              'activity' && (
              <form
                className="erp-form"
                onSubmit={
                  handleAddActivity
                }
              >
                <label className="erp-field">
                  <span>
                    Nama kegiatan *
                  </span>

                  <input
                    name="title"
                    type="text"
                    placeholder="Contoh: Pemupukan susulan"
                    required
                    autoFocus
                  />
                </label>

                <div className="erp-form-grid">
                  <label className="erp-field">
                    <span>
                      Tanggal *
                    </span>

                    <input
                      name="date"
                      type="date"
                      defaultValue={
                        todayISO()
                      }
                      required
                    />
                  </label>

                  <label className="erp-field">
                    <span>
                      Kategori biaya *
                    </span>

                    <select
                      name="category"
                      defaultValue="Pupuk"
                      required
                    >
                      <option>
                        Benih
                      </option>
                      <option>
                        Pupuk
                      </option>
                      <option>
                        Pestisida
                      </option>
                      <option>
                        Tenaga kerja
                      </option>
                      <option>
                        Air dan energi
                      </option>
                      <option>
                        Sewa dan alat
                      </option>
                      <option>
                        Transportasi
                      </option>
                      <option>
                        Lainnya
                      </option>
                    </select>
                  </label>
                </div>

                <label className="erp-field">
                  <span>
                    Biaya aktual (Rp) *
                  </span>

                  <input
                    name="cost"
                    type="number"
                    min="0"
                    step="100"
                    defaultValue="0"
                    required
                  />

                  <small>
                    Masukkan seluruh
                    pengeluaran kegiatan.
                    Biaya 0 diperbolehkan
                    jika tidak ada
                    pengeluaran.
                  </small>
                </label>

                <label className="erp-field">
                  <span>
                    Catatan
                  </span>

                  <textarea
                    name="note"
                    rows="3"
                    placeholder="Apa yang dikerjakan atau input yang digunakan?"
                  />
                </label>

                <ModalActions
                  onCancel={
                    closeModal
                  }
                  submitLabel="Simpan kegiatan"
                />
              </form>
            )}

            {/* =============================================
                HARVEST MODAL
                ============================================= */}

            {modal.type ===
              'harvest' && (
              <form
                className="erp-form"
                onSubmit={
                  handleAddHarvest
                }
              >
                <label className="erp-field">
                  <span>
                    Tanggal panen *
                  </span>

                  <input
                    name="date"
                    type="date"
                    defaultValue={
                      todayISO()
                    }
                    required
                    autoFocus
                  />
                </label>

                <label className="erp-field">
                  <span>
                    Total hasil panen (kg) *
                  </span>

                  <input
                    name="totalKg"
                    type="number"
                    min="0.1"
                    step="0.1"
                    placeholder="800"
                    required
                  />
                </label>

                <div className="erp-modal-subheading">
                  <strong>
                    Klasifikasi hasil
                  </strong>

                  <p>
                    Pisahkan hasil
                    berdasarkan grade.
                  </p>
                </div>

                <div className="erp-form-grid erp-grade-form-grid">
                  <label className="erp-field">
                    <span>
                      Grade A (kg)
                    </span>

                    <input
                      name="gradeA"
                      type="number"
                      min="0"
                      step="0.1"
                      defaultValue="0"
                    />
                  </label>

                  <label className="erp-field">
                    <span>
                      Grade B (kg)
                    </span>

                    <input
                      name="gradeB"
                      type="number"
                      min="0"
                      step="0.1"
                      defaultValue="0"
                    />
                  </label>

                  <label className="erp-field">
                    <span>
                      Grade C (kg)
                    </span>

                    <input
                      name="gradeC"
                      type="number"
                      min="0"
                      step="0.1"
                      defaultValue="0"
                    />
                  </label>

                  <label className="erp-field">
                    <span>
                      Rusak/ditolak (kg)
                    </span>

                    <input
                      name="rejectedKg"
                      type="number"
                      min="0"
                      step="0.1"
                      defaultValue="0"
                    />
                  </label>
                </div>

                <div className="erp-modal-hint">
                  Hasil yang belum
                  diklasifikasikan
                  belum dianggap
                  sebagai stok siap
                  jual.
                </div>

                <label className="erp-field">
                  <span>
                    Catatan
                  </span>

                  <textarea
                    name="note"
                    rows="2"
                    placeholder="Kualitas hasil atau kondisi panen"
                  />
                </label>

                <ModalActions
                  onCancel={
                    closeModal
                  }
                  submitLabel="Simpan panen"
                />
              </form>
            )}

            {/* =============================================
                SALE MODAL
                ============================================= */}

            {modal.type ===
              'sale' && (
              <form
                className="erp-form"
                onSubmit={
                  handleAddSale
                }
              >
                <div className="erp-sale-decision-box">
                  <div>
                    <span>
                      HPP
                    </span>

                    <strong>
                      {currency(
                        financials.hpp
                      )}
                      /kg
                    </strong>
                  </div>

                  <div>
                    <span>
                      Pasar
                    </span>

                    <strong>
                      {currency(
                        financials.marketPrice
                      )}
                      /kg
                    </strong>
                  </div>

                  <div>
                    <span>
                      Target
                    </span>

                    <strong>
                      {currency(
                        financials.targetSellingPrice
                      )}
                      /kg
                    </strong>
                  </div>
                </div>

                <label className="erp-field">
                  <span>
                    Nama pembeli *
                  </span>

                  <input
                    name="buyer"
                    type="text"
                    placeholder="Contoh: Restoran, distributor, pasar"
                    required
                    autoFocus
                  />
                </label>

                <div className="erp-form-grid">
                  <label className="erp-field">
                    <span>
                      Grade *
                    </span>

                    <select
                      name="grade"
                      defaultValue="A"
                      required
                    >
                      <option value="A">
                        Grade A · stok{' '}
                        {number(
                          financials
                            .stock
                            .A
                        )}{' '}
                        kg
                      </option>

                      <option value="B">
                        Grade B · stok{' '}
                        {number(
                          financials
                            .stock
                            .B
                        )}{' '}
                        kg
                      </option>

                      <option value="C">
                        Grade C · stok{' '}
                        {number(
                          financials
                            .stock
                            .C
                        )}{' '}
                        kg
                      </option>
                    </select>
                  </label>

                  <label className="erp-field">
                    <span>
                      Jumlah dijual (kg) *
                    </span>

                    <input
                      name="quantity"
                      type="number"
                      min="0.1"
                      step="0.1"
                      placeholder="100"
                      required
                    />
                  </label>
                </div>

                <label className="erp-field">
                  <span>
                    Harga tawaran / jual per kg (Rp) *
                  </span>

                  <input
                    name="unitPrice"
                    type="number"
                    min="1"
                    step="100"
                    defaultValue={
                      financials.marketPrice
                    }
                    required
                  />

                  <small>
                    Coba masukkan harga
                    dari tengkulak atau
                    buyer lain. AgroERP
                    akan membandingkannya
                    dengan HPP dan harga
                    referensi pasar.
                  </small>
                </label>

                <div className="erp-offer-live-box">
                  <div>
                    <span>
                      HPP
                    </span>

                    <strong>
                      {currency(
                        financials.hpp
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Harga pasar
                    </span>

                    <strong>
                      {currency(
                        financials.marketPrice
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Harga input
                    </span>

                    <strong>
                      Isi harga di atas
                    </strong>
                  </div>
                </div>

                <div className="erp-decision-tip">
                  <Info
                    size={16}
                  />

                  <p>
                    <strong>
                      Patokan cepat:
                    </strong>{' '}
                    harga di bawah HPP
                    berarti biaya produksi
                    belum tertutup. Harga di
                    bawah pasar perlu
                    dibandingkan dengan
                    buyer alternatif.
                  </p>
                </div>

                <div className="erp-form-grid">
                  <label className="erp-field">
                    <span>
                      Potongan (Rp)
                    </span>

                    <input
                      name="discount"
                      type="number"
                      min="0"
                      step="100"
                      defaultValue="0"
                    />
                  </label>

                  <label className="erp-field">
                    <span>
                      Dibayar sekarang (Rp)
                    </span>

                    <input
                      name="paidAmount"
                      type="number"
                      min="0"
                      step="100"
                      defaultValue="0"
                      required
                    />
                  </label>
                </div>

                <div className="erp-modal-hint">
                  Penjualan yang belum
                  lunas otomatis menjadi
                  piutang.
                </div>

                <ModalActions
                  onCancel={
                    closeModal
                  }
                  submitLabel="Simpan penjualan"
                />
              </form>
            )}

            {/* =============================================
                PRE ORDER MODAL
                ============================================= */}

            {modal.type ===
              'preorder' && (
              <form
                className="erp-form"
                onSubmit={
                  handleAddPreOrder
                }
              >
                <div className="erp-preorder-modal-intro">
                  <CalendarClock
                    size={20}
                  />

                  <div>
                    <strong>
                      Kunci calon pembeli sebelum panen
                    </strong>

                    <p>
                      Gunakan estimasi
                      produksi untuk
                      menawarkan hasil
                      kepada buyer lebih
                      awal.
                    </p>
                  </div>
                </div>

                <label className="erp-field">
                  <span>
                    Nama buyer *
                  </span>

                  <input
                    name="buyer"
                    type="text"
                    defaultValue={
                      modalBuyer
                    }
                    placeholder="Contoh: Restoran ABC"
                    required
                    autoFocus
                  />
                </label>

                <div className="erp-form-grid">
                  <label className="erp-field">
                    <span>
                      Grade *
                    </span>

                    <select
                      name="grade"
                      defaultValue={
                        modalGrade
                      }
                      required
                    >
                      <option value="A">
                        Grade A
                      </option>

                      <option value="B">
                        Grade B
                      </option>

                      <option value="C">
                        Grade C
                      </option>
                    </select>
                  </label>

                  <label className="erp-field">
                    <span>
                      Volume (kg) *
                    </span>

                    <input
                      name="quantity"
                      type="number"
                      min="1"
                      step="1"
                      defaultValue={
                        modalQuantity
                      }
                      required
                    />
                  </label>
                </div>

                <label className="erp-field">
                  <span>
                    Harga kesepakatan /kg (Rp) *
                  </span>

                  <input
                    name="price"
                    type="number"
                    min="1"
                    step="100"
                    defaultValue={
                      modalPrice
                    }
                    required
                  />
                </label>

                <label className="erp-field">
                  <span>
                    Perkiraan tanggal panen *
                  </span>

                  <input
                    name="harvestDate"
                    type="date"
                    defaultValue={
                      activeCycle.expectedHarvestDate
                    }
                    required
                  />
                </label>

                <div className="erp-modal-hint">
                  Pre-order dicatat sebagai
                  komitmen pasar. Stok
                  belum berkurang sampai
                  transaksi penjualan
                  benar-benar terjadi.
                </div>

                <ModalActions
                  onCancel={
                    closeModal
                  }
                  submitLabel="Simpan pre-order"
                />
              </form>
            )}

            {/* =============================================
                PAYMENT MODAL
                ============================================= */}

            {modal.type ===
              'payment' &&
              selectedSale && (
                <form
                  className="erp-form"
                  onSubmit={
                    handleRecordPayment
                  }
                >
                  <div className="erp-payment-summary">
                    <span>
                      PEMBELI
                    </span>

                    <strong>
                      {
                        selectedSale.buyer
                      }
                    </strong>

                    <div>
                      <span>
                        Nilai transaksi
                      </span>

                      <strong>
                        {currency(
                          selectedSale.amount
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Sudah dibayar
                      </span>

                      <strong>
                        {currency(
                          selectedSale.paidAmount
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Sisa piutang
                      </span>

                      <strong className="erp-value-negative">
                        {currency(
                          selectedSale.amount -
                            selectedSale.paidAmount
                        )}
                      </strong>
                    </div>
                  </div>

                  <label className="erp-field">
                    <span>
                      Tanggal pembayaran *
                    </span>

                    <input
                      name="date"
                      type="date"
                      defaultValue={
                        todayISO()
                      }
                      required
                      autoFocus
                    />
                  </label>

                  <label className="erp-field">
                    <span>
                      Jumlah diterima (Rp) *
                    </span>

                    <input
                      name="amount"
                      type="number"
                      min="1"
                      max={
                        selectedSale.amount -
                        selectedSale.paidAmount
                      }
                      step="100"
                      required
                    />
                  </label>

                  <p className="erp-modal-hint">
                    Pembayaran menambah
                    uang diterima dan
                    mengurangi piutang.
                  </p>

                  <ModalActions
                    onCancel={
                      closeModal
                    }
                    submitLabel="Simpan pembayaran"
                  />
                </form>
              )}
          </section>
        </div>
      )}
    </div>
  );
}