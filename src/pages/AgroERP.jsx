import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/layout/Navbar';
import {
  Activity,
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Boxes,
  CalendarDays,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  HandCoins,
  Leaf,
  MapPin,
  Package,
  Plus,
  Receipt,
  RotateCcw,
  ShoppingCart,
  Sprout,
  Trash2,
  TrendingUp,
  Wallet,
  Wheat,
  X,
} from 'lucide-react';
import '../css/AgroERP.css';

const STORAGE_KEY = 'taniwave-agro-erp-v1';

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
});

const loadInitialData = () => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed.cycles) && parsed.cycles.length > 0) {
          return {
            cycles: parsed.cycles,
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

const getPlanCost = (cycle) =>
  (cycle?.planItems || []).reduce(
    (total, item) => total + Number(item.quantity || 0) * Number(item.unitCost || 0),
    0
  );

const getActualCost = (cycle) =>
  (cycle?.activities || []).reduce(
    (total, activity) => total + Number(activity.cost || 0),
    0
  );

const getStockByGrade = (cycle) => {
  const stock = { A: 0, B: 0, C: 0 };

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
      total + Math.max(0, Number(sale.amount || 0) - Number(sale.paidAmount || 0)),
    0
  );

  const stockValue =
    stock.A * Number(cycle?.prices?.A || 0) +
    stock.B * Number(cycle?.prices?.B || 0) +
    stock.C * Number(cycle?.prices?.C || 0);

  const totalStock = stock.A + stock.B + stock.C;

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
    estimatedResult: salesValue + stockValue - actualCost,
    estimatedRevenue:
      Number(cycle?.targetYieldKg || 0) *
      Number(cycle?.estimatedPricePerKg || 0),
  };
};

function KpiCard({ icon: Icon, label, value, caption, tone = 'default' }) {
  return (
    <article className={`erp-kpi erp-kpi-${tone}`}>
      <div className="erp-kpi-top">
        <span className="erp-kpi-icon">
          <Icon size={19} />
        </span>
        <span className="erp-kpi-label">{label}</span>
      </div>

      <strong className="erp-kpi-value">{value}</strong>

      {caption && <span className="erp-kpi-caption">{caption}</span>}
    </article>
  );
}

function SectionTitle({ eyebrow, title, description, action }) {
  return (
    <div className="erp-section-title">
      <div>
        {eyebrow && <p className="erp-eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
        {description && <p className="erp-section-description">{description}</p>}
      </div>

      {action && <div className="erp-section-action">{action}</div>}
    </div>
  );
}

function EmptyState({ icon: Icon = ClipboardList, title, description }) {
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

export default function AgroERP() {
  const [initialData] = useState(() => loadInitialData());
  const [cycles, setCycles] = useState(initialData.cycles);
  const [activeCycleId, setActiveCycleId] = useState(initialData.activeCycleId);
  const [activeTab, setActiveTab] = useState('overview');
  const [modal, setModal] = useState(null);
  const [formError, setFormError] = useState('');

  const activeCycle = useMemo(
    () => cycles.find((cycle) => cycle.id === activeCycleId) || cycles[0],
    [cycles, activeCycleId]
  );

  const financials = useMemo(
    () => getFinancials(activeCycle),
    [activeCycle]
  );

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ cycles, activeCycleId })
      );
    } catch (error) {
      console.error('Gagal menyimpan data AgroERP:', error);
    }
  }, [cycles, activeCycleId]);

  const updateActiveCycle = (updater) => {
    if (!activeCycle) return;

    setCycles((previous) =>
      previous.map((cycle) =>
        cycle.id === activeCycle.id ? updater(cycle) : cycle
      )
    );
  };

  const openModal = (type, saleId = null) => {
    setFormError('');
    setModal({ type, saleId });
  };

  const closeModal = () => {
    setModal(null);
    setFormError('');
  };

  const handleAddCycle = (event) => {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const estimatedPricePerKg = Number(form.get('estimatedPricePerKg'));

    const newCycle = {
      id: createId('cycle'),
      commodity: String(form.get('commodity')).trim(),
      plotName: String(form.get('plotName')).trim() || 'Lahan utama',
      areaHa: Number(form.get('areaHa')),
      startDate: form.get('startDate'),
      expectedHarvestDate: form.get('expectedHarvestDate'),
      targetYieldKg: Number(form.get('targetYieldKg')),
      estimatedPricePerKg,
      prices: {
        A: Math.round(estimatedPricePerKg * 1.3),
        B: estimatedPricePerKg,
        C: Math.round(estimatedPricePerKg * 0.7),
      },
      planItems: [],
      activities: [],
      harvests: [],
      sales: [],
    };

    setCycles((previous) => [newCycle, ...previous]);
    setActiveCycleId(newCycle.id);
    setActiveTab('overview');
    closeModal();
  };

  const handleAddPlanItem = (event) => {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    const newItem = {
      id: createId('plan'),
      name: String(form.get('name')).trim(),
      category: form.get('category'),
      quantity: Number(form.get('quantity')),
      unit: String(form.get('unit')).trim(),
      unitCost: Number(form.get('unitCost')),
    };

    updateActiveCycle((cycle) => ({
      ...cycle,
      planItems: [newItem, ...(cycle.planItems || [])],
    }));

    closeModal();
  };

  const handleAddActivity = (event) => {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    const activity = {
      id: createId('activity'),
      title: String(form.get('title')).trim(),
      category: form.get('category'),
      date: form.get('date'),
      cost: Number(form.get('cost') || 0),
      note: String(form.get('note') || '').trim(),
    };

    updateActiveCycle((cycle) => ({
      ...cycle,
      activities: [activity, ...(cycle.activities || [])],
    }));

    closeModal();
  };

  const handleAddHarvest = (event) => {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    const harvest = {
      id: createId('harvest'),
      date: form.get('date'),
      totalKg: Number(form.get('totalKg')),
      gradeA: Number(form.get('gradeA') || 0),
      gradeB: Number(form.get('gradeB') || 0),
      gradeC: Number(form.get('gradeC') || 0),
      rejectedKg: Number(form.get('rejectedKg') || 0),
      note: String(form.get('note') || '').trim(),
    };

    const classified =
      harvest.gradeA +
      harvest.gradeB +
      harvest.gradeC +
      harvest.rejectedKg;

    if (classified > harvest.totalKg) {
      setFormError(
        'Jumlah Grade A, B, C, dan hasil rusak tidak boleh melebihi total panen.'
      );
      return;
    }

    updateActiveCycle((cycle) => ({
      ...cycle,
      harvests: [harvest, ...(cycle.harvests || [])],
    }));

    closeModal();
  };

  const handleAddSale = (event) => {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    const grade = form.get('grade');
    const quantity = Number(form.get('quantity'));
    const unitPrice = Number(form.get('unitPrice'));
    const discount = Number(form.get('discount') || 0);
    const paidAmount = Number(form.get('paidAmount') || 0);
    const subtotal = quantity * unitPrice;
    const amount = subtotal - discount;
    const stock = getStockByGrade(activeCycle);

    if (quantity <= 0 || unitPrice <= 0) {
      setFormError('Jumlah barang dan harga jual harus lebih besar dari nol.');
      return;
    }

    if (quantity > stock[grade]) {
      setFormError(
        `Stok Grade ${grade} hanya ${number(stock[grade])} kg. Kurangi jumlah penjualan.`
      );
      return;
    }

    if (discount < 0 || discount > subtotal) {
      setFormError('Potongan harga tidak valid.');
      return;
    }

    if (paidAmount < 0 || paidAmount > amount) {
      setFormError(
        'Pembayaran awal tidak boleh melebihi nilai transaksi.'
      );
      return;
    }

    const sale = {
      id: createId('sale'),
      date: form.get('date'),
      buyer: String(form.get('buyer')).trim(),
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
                id: createId('payment'),
                date: form.get('date'),
                amount: paidAmount,
              },
            ]
          : [],
    };

    updateActiveCycle((cycle) => ({
      ...cycle,
      sales: [sale, ...(cycle.sales || [])],
    }));

    closeModal();
  };

  const handleRecordPayment = (event) => {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const amount = Number(form.get('amount'));
    const saleId = modal?.saleId;
    const sale = activeCycle.sales.find((item) => item.id === saleId);

    if (!sale) {
      setFormError('Transaksi penjualan tidak ditemukan.');
      return;
    }

    const remaining = sale.amount - sale.paidAmount;

    if (amount <= 0 || amount > remaining) {
      setFormError(
        `Pembayaran harus lebih dari Rp0 dan tidak melebihi ${currency(remaining)}.`
      );
      return;
    }

    const payment = {
      id: createId('payment'),
      date: form.get('date'),
      amount,
    };

    updateActiveCycle((cycle) => ({
      ...cycle,
      sales: cycle.sales.map((item) =>
        item.id === saleId
          ? {
              ...item,
              paidAmount: item.paidAmount + amount,
              payments: [...(item.payments || []), payment],
            }
          : item
      ),
    }));

    closeModal();
  };

  const removePlanItem = (itemId) => {
    if (!window.confirm('Hapus item dari rencana kebutuhan?')) return;

    updateActiveCycle((cycle) => ({
      ...cycle,
      planItems: cycle.planItems.filter((item) => item.id !== itemId),
    }));
  };

  const removeActivity = (activityId) => {
    if (!window.confirm('Hapus catatan kegiatan beserta biaya tercatatnya?')) {
      return;
    }

    updateActiveCycle((cycle) => ({
      ...cycle,
      activities: cycle.activities.filter(
        (activity) => activity.id !== activityId
      ),
    }));
  };

  const removeSale = (saleId) => {
    if (
      !window.confirm(
        'Batalkan catatan penjualan ini? Stok akan dihitung ulang berdasarkan transaksi yang tersisa.'
      )
    ) {
      return;
    }

    updateActiveCycle((cycle) => ({
      ...cycle,
      sales: cycle.sales.filter((sale) => sale.id !== saleId),
    }));
  };

  const resetDemo = () => {
    if (
      !window.confirm(
        'Reset seluruh data AgroERP di browser ini ke data simulasi awal?'
      )
    ) {
      return;
    }

    const demo = createDemoCycle();

    setCycles([demo]);
    setActiveCycleId(demo.id);
    setActiveTab('overview');
    closeModal();
  };

  if (!activeCycle) return null;

  const cycleAge = Math.max(0, daysBetween(activeCycle.startDate) + 1);
  const harvestCountdown = daysBetween(todayISO(), activeCycle.expectedHarvestDate);
  const budgetUsage =
    financials.planCost > 0
      ? Math.min(
          100,
          (financials.actualCost / financials.planCost) * 100
        )
      : 0;

  const unclassifiedKg = (activeCycle.harvests || []).reduce((total, harvest) => {
    const classified =
      Number(harvest.gradeA || 0) +
      Number(harvest.gradeB || 0) +
      Number(harvest.gradeC || 0) +
      Number(harvest.rejectedKg || 0);

    return total + Math.max(0, Number(harvest.totalKg || 0) - classified);
  }, 0);

  const totalHarvest = (activeCycle.harvests || []).reduce(
    (total, harvest) => total + Number(harvest.totalKg || 0),
    0
  );

  const recordedSales = activeCycle.sales || [];

  const recentItems = [
    ...(activeCycle.activities || []).map((item) => ({
      id: item.id,
      date: item.date,
      title: item.title,
      subtitle: item.category,
      amount: item.cost,
      type: 'activity',
    })),
    ...(activeCycle.harvests || []).map((item) => ({
      id: item.id,
      date: item.date,
      title: 'Panen dicatat',
      subtitle: `${number(item.totalKg)} kg hasil panen`,
      amount: null,
      type: 'harvest',
    })),
    ...recordedSales.map((item) => ({
      id: item.id,
      date: item.date,
      title: `Penjualan ke ${item.buyer}`,
      subtitle: `${number(item.quantity)} kg · Grade ${item.grade}`,
      amount: item.amount,
      type: 'sale',
    })),
  ]
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .slice(0, 5);

  const tabs = [
    { id: 'overview', label: 'Ringkasan', icon: TrendingUp },
    { id: 'activities', label: 'Kegiatan', icon: ClipboardList },
    { id: 'harvest', label: 'Panen & Stok', icon: Wheat },
    { id: 'finance', label: 'Keuangan', icon: Wallet },
  ];

  const tabContent = {
    overview: (
      <>
        <section className="erp-cycle-banner">
          <div className="erp-cycle-banner-main">
            <div className="erp-cycle-avatar">
              <Sprout size={28} />
            </div>
            <div>
              <p className="erp-eyebrow">SIKLUS USAHA TANI</p>
              <h2>{activeCycle.commodity}</h2>
              <div className="erp-cycle-location">
                <MapPin size={15} />
                <span>{activeCycle.plotName}</span>
                <span className="erp-dot-separator">•</span>
                <span>{number(activeCycle.areaHa)} ha</span>
              </div>
            </div>
          </div>

          <div className="erp-cycle-badges">
            <span className="erp-status-pill">
              <span className="erp-status-dot" />
              Siklus berjalan
            </span>
            <span className="erp-date-pill">
              <CalendarDays size={14} />
              Hari ke-{cycleAge}
            </span>
          </div>
        </section>

        <div className="erp-kpi-grid">
          <KpiCard
            icon={Wallet}
            label="Biaya tercatat"
            value={currency(financials.actualCost)}
            caption={`Rencana ${currency(financials.planCost)}`}
            tone="orange"
          />
          <KpiCard
            icon={ShoppingCart}
            label="Nilai penjualan"
            value={currency(financials.salesValue)}
            caption={`${recordedSales.length} transaksi tercatat`}
            tone="navy"
          />
          <KpiCard
            icon={Boxes}
            label="Stok tersedia"
            value={`${number(financials.totalStock)} kg`}
            caption={`Hasil panen ${number(totalHarvest)} kg`}
            tone="yellow"
          />
          <KpiCard
            icon={TrendingUp}
            label="Estimasi hasil usaha"
            value={currency(financials.estimatedResult)}
            caption="Penjualan + estimasi stok − biaya"
            tone={financials.estimatedResult >= 0 ? 'green' : 'red'}
          />
        </div>

        <div className="erp-main-grid">
          <section className="erp-panel">
            <SectionTitle
              eyebrow="PROGRES SIKLUS"
              title="Perjalanan usaha tani"
              description="Ikuti pergerakan dari perencanaan sampai penjualan."
            />

            <div className="erp-timeline">
              <div className="erp-timeline-item erp-timeline-complete">
                <span className="erp-timeline-icon">
                  <CheckCircle2 size={18} />
                </span>
                <div className="erp-timeline-content">
                  <strong>Perencanaan</strong>
                  <p>
                    {activeCycle.planItems.length} item kebutuhan ·{' '}
                    {currency(financials.planCost)}
                  </p>
                </div>
                <span className="erp-timeline-tag">Tercatat</span>
              </div>

              <div className="erp-timeline-item">
                <span className="erp-timeline-icon">
                  <Activity size={18} />
                </span>
                <div className="erp-timeline-content">
                  <strong>Budidaya</strong>
                  <p>
                    {activeCycle.activities.length} kegiatan · biaya aktual{' '}
                    {currency(financials.actualCost)}
                  </p>
                </div>
                <span className="erp-timeline-tag">Berjalan</span>
              </div>

              <div
                className={`erp-timeline-item ${
                  activeCycle.harvests.length ? 'erp-timeline-complete' : ''
                }`}
              >
                <span className="erp-timeline-icon">
                  <Wheat size={18} />
                </span>
                <div className="erp-timeline-content">
                  <strong>Panen dan grading</strong>
                  <p>
                    {activeCycle.harvests.length
                      ? `${number(totalHarvest)} kg hasil panen tercatat`
                      : 'Belum ada hasil panen'}
                  </p>
                </div>
                <span className="erp-timeline-tag">
                  {activeCycle.harvests.length ? 'Tercatat' : 'Menunggu'}
                </span>
              </div>

              <div
                className={`erp-timeline-item ${
                  activeCycle.sales.length ? 'erp-timeline-complete' : ''
                }`}
              >
                <span className="erp-timeline-icon">
                  <ShoppingCart size={18} />
                </span>
                <div className="erp-timeline-content">
                  <strong>Penjualan</strong>
                  <p>
                    {activeCycle.sales.length
                      ? `${activeCycle.sales.length} transaksi · ${currency(financials.salesValue)}`
                      : 'Belum ada transaksi penjualan'}
                  </p>
                </div>
                <span className="erp-timeline-tag">
                  {activeCycle.sales.length ? 'Tercatat' : 'Menunggu'}
                </span>
              </div>
            </div>

            <div className="erp-budget-box">
              <div className="erp-budget-header">
                <div>
                  <strong>Realisasi biaya</strong>
                  <p>Perbandingan biaya tercatat dengan rencana.</p>
                </div>
                <strong>{Math.round(budgetUsage)}%</strong>
              </div>

              <div className="erp-progress-track">
                <div
                  className="erp-progress-fill"
                  style={{ width: `${budgetUsage}%` }}
                />
              </div>

              <div className="erp-budget-footer">
                <span>Aktual: {currency(financials.actualCost)}</span>
                <span>Rencana: {currency(financials.planCost)}</span>
              </div>
            </div>
          </section>

          <aside className="erp-side-column">
            <section className="erp-panel erp-harvest-countdown">
              <span className="erp-countdown-icon">
                <CalendarClock size={21} />
              </span>
              <p className="erp-eyebrow">PERKIRAAN PANEN</p>
              <h3>
                {harvestCountdown > 0
                  ? `${harvestCountdown} hari lagi`
                  : harvestCountdown === 0
                    ? 'Jadwal hari ini'
                    : 'Jadwal telah lewat'}
              </h3>
              <p className="erp-muted-text">
                Target tanggal {formatDate(activeCycle.expectedHarvestDate)}
              </p>
              <div className="erp-divider" />
              <div className="erp-mini-stat">
                <span>Target hasil</span>
                <strong>{number(activeCycle.targetYieldKg)} kg</strong>
              </div>
              <div className="erp-mini-stat">
                <span>Estimasi omzet</span>
                <strong>
                  {currency(financials.estimatedRevenue)}
                </strong>
              </div>
              <p className="erp-micro-note">
                Estimasi memakai target hasil dan harga rata-rata yang diisi
                saat membuat siklus.
              </p>
            </section>

            <section className="erp-panel">
              <SectionTitle
                eyebrow="AKSI CEPAT"
                title="Catat aktivitas"
                description="Pilih transaksi yang ingin dicatat."
              />

              <div className="erp-quick-actions">
                <button
                  type="button"
                  className="erp-quick-action"
                  onClick={() => openModal('activity')}
                >
                  <span className="erp-quick-icon erp-quick-orange">
                    <Activity size={19} />
                  </span>
                  <span>
                    <strong>Kegiatan</strong>
                    <small>Catat biaya budidaya</small>
                  </span>
                  <Plus size={17} />
                </button>

                <button
                  type="button"
                  className="erp-quick-action"
                  onClick={() => openModal('harvest')}
                >
                  <span className="erp-quick-icon erp-quick-yellow">
                    <Wheat size={19} />
                  </span>
                  <span>
                    <strong>Panen</strong>
                    <small>Masukkan hasil dan grade</small>
                  </span>
                  <Plus size={17} />
                </button>

                <button
                  type="button"
                  className="erp-quick-action"
                  onClick={() => openModal('sale')}
                >
                  <span className="erp-quick-icon erp-quick-green">
                    <ShoppingCart size={19} />
                  </span>
                  <span>
                    <strong>Penjualan</strong>
                    <small>Catat barang terjual</small>
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
            description="Ringkasan catatan pada siklus yang sedang dipilih."
            action={
              <button
                type="button"
                className="erp-text-button"
                onClick={() => setActiveTab('activities')}
              >
                Lihat kegiatan
                <ArrowUpRight size={16} />
              </button>
            }
          />

          {recentItems.length === 0 ? (
            <EmptyState
              title="Belum ada aktivitas"
              description="Catat kegiatan budidaya, panen, atau penjualan untuk mulai membangun riwayat usaha."
            />
          ) : (
            <div className="erp-recent-list">
              {recentItems.map((item) => {
                const Icon =
                  item.type === 'activity'
                    ? Activity
                    : item.type === 'harvest'
                      ? Wheat
                      : ShoppingCart;

                return (
                  <div className="erp-recent-row" key={item.id}>
                    <span className={`erp-recent-icon erp-recent-${item.type}`}>
                      <Icon size={18} />
                    </span>

                    <div className="erp-recent-info">
                      <strong>{item.title}</strong>
                      <span>{item.subtitle}</span>
                    </div>

                    <div className="erp-recent-right">
                      {item.amount !== null && (
                        <strong
                          className={
                            item.type === 'sale'
                              ? 'erp-value-positive'
                              : 'erp-value-negative'
                          }
                        >
                          {item.type === 'sale' ? '+' : '−'}
                          {currency(item.amount)}
                        </strong>
                      )}
                      <span>{formatDate(item.date)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </>
    ),

    activities: (
      <>
        <SectionTitle
          eyebrow="PERENCANAAN DAN BUDIDAYA"
          title="Kegiatan usaha tani"
          description="Bandingkan kebutuhan yang direncanakan dengan biaya aktual yang sudah dicatat."
          action={
            <button
              type="button"
              className="erp-button erp-button-primary"
              onClick={() => openModal('activity')}
            >
              <Plus size={17} />
              Catat kegiatan
            </button>
          }
        />

        <div className="erp-kpi-grid erp-kpi-grid-three">
          <KpiCard
            icon={ClipboardList}
            label="Rencana kebutuhan"
            value={currency(financials.planCost)}
            caption={`${activeCycle.planItems.length} item direncanakan`}
            tone="navy"
          />
          <KpiCard
            icon={Wallet}
            label="Biaya aktual"
            value={currency(financials.actualCost)}
            caption={`${activeCycle.activities.length} kegiatan tercatat`}
            tone="orange"
          />
          <KpiCard
            icon={TrendingUp}
            label="Selisih rencana"
            value={currency(financials.planCost - financials.actualCost)}
            caption={
              financials.actualCost > financials.planCost
                ? 'Biaya aktual melebihi rencana'
                : 'Aktual dibanding rencana'
            }
            tone={
              financials.actualCost > financials.planCost ? 'red' : 'green'
            }
          />
        </div>

        <section className="erp-panel">
          <SectionTitle
            eyebrow="DAFTAR INPUT"
            title="Rencana kebutuhan"
            description="Benih, pupuk, tenaga kerja, dan input lain yang diperkirakan dibutuhkan."
            action={
              <button
                type="button"
                className="erp-button erp-button-secondary"
                onClick={() => openModal('plan')}
              >
                <Plus size={17} />
                Tambah kebutuhan
              </button>
            }
          />

          {activeCycle.planItems.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="Belum ada rencana kebutuhan"
              description="Tambahkan benih, pupuk, atau input lainnya beserta jumlah dan perkiraan harga."
            />
          ) : (
            <div className="erp-list">
              {activeCycle.planItems.map((item) => {
                const lineTotal =
                  Number(item.quantity || 0) * Number(item.unitCost || 0);

                return (
                  <div className="erp-list-row" key={item.id}>
                    <span className="erp-list-icon">
                      <Leaf size={18} />
                    </span>

                    <div className="erp-list-main">
                      <strong>{item.name}</strong>
                      <span>
                        {item.category} · {number(item.quantity)} {item.unit}
                      </span>
                    </div>

                    <div className="erp-list-value">
                      <strong>{currency(lineTotal)}</strong>
                      <span>
                        {currency(item.unitCost)} / {item.unit}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="erp-icon-button erp-danger-icon"
                      title="Hapus item"
                      aria-label={`Hapus ${item.name}`}
                      onClick={() => removePlanItem(item.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="erp-panel-total">
            <span>Total estimasi kebutuhan</span>
            <strong>{currency(financials.planCost)}</strong>
          </div>
        </section>

        <section className="erp-panel">
          <SectionTitle
            eyebrow="REALISASI LAPANGAN"
            title="Catatan kegiatan"
            description="Setiap biaya pada kegiatan menambah total biaya aktual siklus."
          />

          {activeCycle.activities.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="Belum ada kegiatan tercatat"
              description="Catat pekerjaan di lahan dan masukkan biaya aktualnya. Biaya nol diperbolehkan untuk kegiatan tanpa pengeluaran."
            />
          ) : (
            <div className="erp-list">
              {activeCycle.activities.map((activity) => (
                <div className="erp-list-row" key={activity.id}>
                  <span className="erp-list-icon erp-list-icon-orange">
                    <Activity size={18} />
                  </span>

                  <div className="erp-list-main">
                    <strong>{activity.title}</strong>
                    <span>
                      {formatDate(activity.date)} · {activity.category}
                    </span>
                    {activity.note && (
                      <small className="erp-list-note">{activity.note}</small>
                    )}
                  </div>

                  <div className="erp-list-value">
                    <strong>{currency(activity.cost)}</strong>
                    <span>Biaya aktual</span>
                  </div>

                  <button
                    type="button"
                    className="erp-icon-button erp-danger-icon"
                    title="Hapus kegiatan"
                    aria-label={`Hapus ${activity.title}`}
                    onClick={() => removeActivity(activity.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </>
    ),

    harvest: (
      <>
        <SectionTitle
          eyebrow="HASIL PRODUKSI"
          title="Panen dan stok"
          description="Catat hasil panen per grade. Penjualan akan otomatis mengurangi stok grade terkait."
          action={
            <div className="erp-action-group">
              <button
                type="button"
                className="erp-button erp-button-secondary"
                onClick={() => openModal('harvest')}
              >
                <Plus size={17} />
                Catat panen
              </button>
              <button
                type="button"
                className="erp-button erp-button-primary"
                onClick={() => openModal('sale')}
              >
                <ShoppingCart size={17} />
                Jual hasil
              </button>
            </div>
          }
        />

        <div className="erp-stock-grid">
          {['A', 'B', 'C'].map((grade) => (
            <article className={`erp-stock-card erp-stock-${grade}`} key={grade}>
              <div className="erp-stock-card-top">
                <span>Grade {grade}</span>
                <span className="erp-stock-badge">Tersedia</span>
              </div>
              <strong>{number(financials.stock[grade])} kg</strong>
              <p>Estimasi nilai {currency(financials.stock[grade] * activeCycle.prices[grade])}</p>
              <small>Harga estimasi {currency(activeCycle.prices[grade])}/kg</small>
            </article>
          ))}

          <article className="erp-stock-card erp-stock-total">
            <div className="erp-stock-card-top">
              <span>Total stok</span>
              <Boxes size={18} />
            </div>
            <strong>{number(financials.totalStock)} kg</strong>
            <p>Hasil yang sudah terklasifikasi dan belum terjual.</p>
            <small>Belum termasuk hasil belum terklasifikasi.</small>
          </article>
        </div>

        <div className="erp-notice">
          <AlertCircle size={18} />
          <p>
            <strong>Perhatikan hasil grading.</strong> Panen yang belum
            diklasifikasikan tetap masuk total hasil panen, tetapi belum
            dihitung sebagai stok siap jual. Saat ini ada{' '}
            <strong>{number(unclassifiedKg)} kg</strong> hasil belum
            terklasifikasi.
          </p>
        </div>

        <section className="erp-panel">
          <SectionTitle
            eyebrow="CATATAN PRODUKSI"
            title="Riwayat panen"
            description="Jumlah grade tidak boleh melebihi total panen pada satu catatan."
          />

          {activeCycle.harvests.length === 0 ? (
            <EmptyState
              icon={Wheat}
              title="Belum ada hasil panen"
              description="Setelah panen dilakukan, catat total hasil dan klasifikasikan berdasarkan grade."
            />
          ) : (
            <div className="erp-harvest-list">
              {activeCycle.harvests.map((harvest) => {
                const classified =
                  Number(harvest.gradeA || 0) +
                  Number(harvest.gradeB || 0) +
                  Number(harvest.gradeC || 0) +
                  Number(harvest.rejectedKg || 0);
                const pending = Math.max(0, harvest.totalKg - classified);

                return (
                  <article className="erp-harvest-row" key={harvest.id}>
                    <div className="erp-harvest-date">
                      <span className="erp-harvest-date-icon">
                        <Wheat size={19} />
                      </span>
                      <div>
                        <strong>{formatDate(harvest.date)}</strong>
                        <span>Total hasil panen</span>
                      </div>
                    </div>

                    <div className="erp-harvest-total">
                      <strong>{number(harvest.totalKg)} kg</strong>
                      <span>Hasil keseluruhan</span>
                    </div>

                    <div className="erp-grade-breakdown">
                      <span className="erp-grade-a">A: {number(harvest.gradeA)} kg</span>
                      <span className="erp-grade-b">B: {number(harvest.gradeB)} kg</span>
                      <span className="erp-grade-c">C: {number(harvest.gradeC)} kg</span>
                      <span className="erp-grade-reject">
                        Rusak: {number(harvest.rejectedKg)} kg
                      </span>
                      {pending > 0 && (
                        <span className="erp-grade-pending">
                          Belum dinilai: {number(pending)} kg
                        </span>
                      )}
                    </div>

                    {harvest.note && (
                      <p className="erp-harvest-note">{harvest.note}</p>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="erp-panel">
          <SectionTitle
            eyebrow="TRANSAKSI KELUAR"
            title="Riwayat penjualan"
            description="Stok dihitung dari total grading dikurangi kuantitas yang sudah terjual."
          />

          {recordedSales.length === 0 ? (
            <EmptyState
              icon={ShoppingCart}
              title="Belum ada penjualan"
              description="Catat penjualan untuk mengurangi stok dan menghitung nilai transaksi, uang diterima, serta piutang."
            />
          ) : (
            <div className="erp-table-wrap">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Tanggal / Pembeli</th>
                    <th>Produk</th>
                    <th>Nilai transaksi</th>
                    <th>Sisa piutang</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {recordedSales.map((sale) => {
                    const remaining = Math.max(
                      0,
                      sale.amount - sale.paidAmount
                    );

                    return (
                      <tr key={sale.id}>
                        <td>
                          <strong>{sale.buyer}</strong>
                          <span className="erp-table-sub">
                            {formatDate(sale.date)}
                          </span>
                        </td>
                        <td>
                          <strong>Grade {sale.grade}</strong>
                          <span className="erp-table-sub">
                            {number(sale.quantity)} kg
                          </span>
                        </td>
                        <td>
                          <strong>{currency(sale.amount)}</strong>
                          <span className="erp-table-sub">
                            Dibayar {currency(sale.paidAmount)}
                          </span>
                        </td>
                        <td>
                          {remaining > 0 ? (
                            <span className="erp-receivable">
                              {currency(remaining)}
                            </span>
                          ) : (
                            <span className="erp-paid-pill">Lunas</span>
                          )}
                        </td>
                        <td>
                          <div className="erp-table-actions">
                            {remaining > 0 && (
                              <button
                                type="button"
                                className="erp-small-button"
                                onClick={() =>
                                  openModal('payment', sale.id)
                                }
                              >
                                <HandCoins size={14} />
                                Bayar
                              </button>
                            )}
                            <button
                              type="button"
                              className="erp-icon-button erp-danger-icon"
                              title="Batalkan penjualan"
                              aria-label="Batalkan penjualan"
                              onClick={() => removeSale(sale.id)}
                            >
                              <RotateCcw size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </>
    ),

    finance: (
      <>
        <SectionTitle
          eyebrow="LAPORAN USAHA"
          title="Keuangan siklus"
          description="Pisahkan nilai penjualan, uang yang benar-benar diterima, biaya, dan nilai stok yang belum terjual."
          action={
            <button
              type="button"
              className="erp-button erp-button-secondary"
              onClick={() => window.print()}
            >
              <Receipt size={17} />
              Cetak laporan
            </button>
          }
        />

        <div className="erp-finance-highlight">
          <div className="erp-finance-highlight-copy">
            <span>Estimasi hasil usaha saat ini</span>
            <h2>{currency(financials.estimatedResult)}</h2>
            <p>
              Nilai penjualan tercatat + estimasi nilai stok tersisa − biaya
              aktual tercatat.
            </p>
          </div>

          <span className="erp-finance-highlight-icon">
            <TrendingUp size={28} />
          </span>
        </div>

        <div className="erp-kpi-grid erp-kpi-grid-three">
          <KpiCard
            icon={Wallet}
            label="Biaya aktual"
            value={currency(financials.actualCost)}
            caption="Pengeluaran yang sudah dicatat"
            tone="orange"
          />
          <KpiCard
            icon={ShoppingCart}
            label="Nilai penjualan"
            value={currency(financials.salesValue)}
            caption="Nilai transaksi, termasuk yang belum lunas"
            tone="navy"
          />
          <KpiCard
            icon={HandCoins}
            label="Uang diterima"
            value={currency(financials.cashReceived)}
            caption="Pembayaran penjualan yang sudah masuk"
            tone="green"
          />
          <KpiCard
            icon={Receipt}
            label="Piutang penjualan"
            value={currency(financials.receivables)}
            caption="Sisa pembayaran dari pembeli"
            tone="yellow"
          />
          <KpiCard
            icon={Boxes}
            label="Estimasi nilai stok"
            value={currency(financials.stockValue)}
            caption={`${number(financials.totalStock)} kg belum terjual`}
            tone="navy"
          />
          <KpiCard
            icon={ArrowUpRight}
            label="Arus kas bersih"
            value={currency(financials.cashFlow)}
            caption="Uang diterima − biaya aktual tercatat"
            tone={financials.cashFlow >= 0 ? 'green' : 'red'}
          />
        </div>

        <div className="erp-finance-grid">
          <section className="erp-panel">
            <SectionTitle
              eyebrow="KONTROL BIAYA"
              title="Rencana vs aktual"
              description="Gunakan selisih ini untuk melihat apakah biaya tercatat melampaui rencana."
            />

            <div className="erp-comparison-row">
              <div>
                <span>Biaya rencana</span>
                <strong>{currency(financials.planCost)}</strong>
              </div>
              <div>
                <span>Biaya aktual</span>
                <strong>{currency(financials.actualCost)}</strong>
              </div>
            </div>

            <div className="erp-progress-track erp-finance-progress">
              <div
                className={`erp-progress-fill ${
                  financials.actualCost > financials.planCost
                    ? 'erp-progress-over'
                    : ''
                }`}
                style={{
                  width: `${
                    financials.planCost > 0
                      ? Math.min(
                          100,
                          (financials.actualCost / financials.planCost) * 100
                        )
                      : financials.actualCost > 0
                        ? 100
                        : 0
                  }%`,
                }}
              />
            </div>

            <div className="erp-comparison-footer">
              <span
                className={
                  financials.actualCost > financials.planCost
                    ? 'erp-value-negative'
                    : 'erp-value-positive'
                }
              >
                {financials.actualCost > financials.planCost
                  ? 'Melebihi rencana'
                  : 'Masih dalam rencana'}
              </span>
              <strong>
                {currency(Math.abs(financials.planCost - financials.actualCost))}
              </strong>
            </div>

            <div className="erp-divider" />

            <div className="erp-finance-note">
              <AlertCircle size={17} />
              <p>
                Biaya hanya mencerminkan kegiatan yang sudah dicatat. Biaya
                yang belum masuk ke sistem akan membuat estimasi hasil usaha
                terlihat lebih tinggi dari kondisi sebenarnya.
              </p>
            </div>
          </section>

          <section className="erp-panel">
            <SectionTitle
              eyebrow="RINGKASAN PENGELUARAN"
              title="Biaya per kategori"
              description="Distribusi biaya dari kegiatan yang tercatat."
            />

            {activeCycle.activities.length === 0 ? (
              <EmptyState
                icon={Wallet}
                title="Belum ada pengeluaran"
                description="Catat kegiatan beserta biayanya untuk melihat komposisi biaya."
              />
            ) : (
              <div className="erp-expense-breakdown">
                {Object.entries(
                  activeCycle.activities.reduce((groups, activity) => {
                    const category = activity.category || 'Lainnya';
                    groups[category] =
                      (groups[category] || 0) + Number(activity.cost || 0);
                    return groups;
                  }, {})
                )
                  .sort((a, b) => b[1] - a[1])
                  .map(([category, amount]) => {
                    const share =
                      financials.actualCost > 0
                        ? (amount / financials.actualCost) * 100
                        : 0;

                    return (
                      <div className="erp-expense-item" key={category}>
                        <div className="erp-expense-item-head">
                          <span>{category}</span>
                          <strong>{currency(amount)}</strong>
                        </div>
                        <div className="erp-progress-track">
                          <div
                            className="erp-expense-bar"
                            style={{ width: `${share}%` }}
                          />
                        </div>
                        <small>{Math.round(share)}% dari biaya tercatat</small>
                      </div>
                    );
                  })}
              </div>
            )}
          </section>
        </div>

        <section className="erp-panel">
          <SectionTitle
            eyebrow="REKONSILIASI PENJUALAN"
            title="Pembayaran dan piutang"
            description="Catat pembayaran tambahan sampai setiap penjualan lunas."
          />

          {recordedSales.length === 0 ? (
            <EmptyState
              icon={HandCoins}
              title="Belum ada transaksi"
              description="Transaksi penjualan akan muncul di sini setelah hasil panen terjual."
            />
          ) : (
            <div className="erp-list">
              {recordedSales.map((sale) => {
                const remaining = Math.max(0, sale.amount - sale.paidAmount);

                return (
                  <div className="erp-list-row" key={sale.id}>
                    <span className="erp-list-icon erp-list-icon-green">
                      <HandCoins size={18} />
                    </span>

                    <div className="erp-list-main">
                      <strong>{sale.buyer}</strong>
                      <span>
                        {formatDate(sale.date)} · {number(sale.quantity)} kg
                        · Grade {sale.grade}
                      </span>
                      <small className="erp-list-note">
                        Diterima {currency(sale.paidAmount)} dari{' '}
                        {currency(sale.amount)}
                      </small>
                    </div>

                    <div className="erp-list-value">
                      {remaining > 0 ? (
                        <>
                          <strong className="erp-value-negative">
                            {currency(remaining)}
                          </strong>
                          <span>Piutang tersisa</span>
                        </>
                      ) : (
                        <>
                          <strong className="erp-value-positive">
                            Lunas
                          </strong>
                          <span>Semua pembayaran diterima</span>
                        </>
                      )}
                    </div>

                    {remaining > 0 && (
                      <button
                        type="button"
                        className="erp-small-button"
                        onClick={() => openModal('payment', sale.id)}
                      >
                        <Plus size={14} />
                        Pembayaran
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </>
    ),
  };

  const selectedSale =
    modal?.type === 'payment'
      ? activeCycle.sales.find((sale) => sale.id === modal.saleId)
      : null;

  return (
    <div className="erp-page">
      <Navbar />

      <main className="erp-shell">
        <header className="erp-page-header">
          <div>
            <div className="erp-page-title-line">
              <span className="erp-brand-mark">
                <Sprout size={21} />
              </span>
              <h1>AgroERP</h1>
              <span className="erp-demo-badge">DATA SIMULASI</span>
            </div>
            <p>
              Kelola usaha tani dari rencana biaya sampai hasil penjualan.
            </p>
          </div>

          <div className="erp-header-controls">
            <label className="erp-cycle-select-wrap">
              <span className="erp-select-label">Siklus aktif</span>
              <span className="erp-cycle-select-control">
                <select
                  value={activeCycle.id}
                  onChange={(event) => setActiveCycleId(event.target.value)}
                  aria-label="Pilih siklus usaha tani"
                >
                  {cycles.map((cycle) => (
                    <option value={cycle.id} key={cycle.id}>
                      {cycle.commodity} · {cycle.plotName}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} />
              </span>
            </label>

            <button
              type="button"
              className="erp-button erp-button-primary"
              onClick={() => openModal('cycle')}
            >
              <Plus size={17} />
              <span>Siklus baru</span>
            </button>
          </div>
        </header>

        <nav className="erp-tabs" aria-label="Navigasi AgroERP">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              type="button"
              key={id}
              className={`erp-tab ${activeTab === id ? 'erp-tab-active' : ''}`}
              onClick={() => setActiveTab(id)}
            >
              <Icon size={17} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="erp-tab-content">{tabContent[activeTab]}</div>

        <footer className="erp-footer">
          <div>
            <span className="erp-footer-mark">
              <Leaf size={14} />
            </span>
            <span>AgroERP · TANIWAVE</span>
          </div>
          <p>
            Data tersimpan pada browser ini. Estimasi bukan laporan akuntansi
            final.
          </p>
          <button
            type="button"
            className="erp-reset-button"
            onClick={resetDemo}
          >
            <RotateCcw size={13} />
            Reset data demo
          </button>
        </footer>
      </main>

      {modal && (
        <div
          className="erp-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
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
                <p className="erp-eyebrow">AGROERP</p>
                <h2 id="erp-modal-title">
                  {modal.type === 'cycle' && 'Buat siklus usaha tani'}
                  {modal.type === 'plan' && 'Tambah rencana kebutuhan'}
                  {modal.type === 'activity' && 'Catat kegiatan budidaya'}
                  {modal.type === 'harvest' && 'Catat hasil panen'}
                  {modal.type === 'sale' && 'Catat penjualan hasil'}
                  {modal.type === 'payment' && 'Catat pembayaran'}
                </h2>
              </div>

              <button
                type="button"
                className="erp-icon-button"
                onClick={closeModal}
                aria-label="Tutup formulir"
              >
                <X size={19} />
              </button>
            </header>

            {formError && (
              <div className="erp-form-error">
                <AlertCircle size={17} />
                <span>{formError}</span>
              </div>
            )}

            {modal.type === 'cycle' && (
              <form className="erp-form" onSubmit={handleAddCycle}>
                <label className="erp-field">
                  <span>Komoditas *</span>
                  <input
                    name="commodity"
                    type="text"
                    placeholder="Contoh: Cabai rawit"
                    required
                    autoFocus
                  />
                </label>

                <label className="erp-field">
                  <span>Nama lahan</span>
                  <input
                    name="plotName"
                    type="text"
                    placeholder="Contoh: Lahan belakang"
                  />
                </label>

                <div className="erp-form-grid">
                  <label className="erp-field">
                    <span>Luas lahan (ha) *</span>
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
                    <span>Target panen (kg) *</span>
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
                    <span>Tanggal mulai *</span>
                    <input
                      name="startDate"
                      type="date"
                      defaultValue={todayISO()}
                      required
                    />
                  </label>
                  <label className="erp-field">
                    <span>Perkiraan panen *</span>
                    <input
                      name="expectedHarvestDate"
                      type="date"
                      defaultValue={dateAfterDays(60)}
                      required
                    />
                  </label>
                </div>

                <label className="erp-field">
                  <span>Estimasi harga jual rata-rata per kg (Rp) *</span>
                  <input
                    name="estimatedPricePerKg"
                    type="number"
                    min="1"
                    step="100"
                    placeholder="5000"
                    required
                  />
                  <small>
                    Dipakai untuk proyeksi omzet awal. Harga grade A/B/C akan
                    dibuat sebagai perkiraan dan bisa disesuaikan di kode data.
                  </small>
                </label>

                <ModalActions onCancel={closeModal} submitLabel="Buat siklus" />
              </form>
            )}

            {modal.type === 'plan' && (
              <form className="erp-form" onSubmit={handleAddPlanItem}>
                <label className="erp-field">
                  <span>Nama kebutuhan *</span>
                  <input
                    name="name"
                    type="text"
                    placeholder="Contoh: Pupuk NPK"
                    required
                    autoFocus
                  />
                </label>

                <label className="erp-field">
                  <span>Kategori *</span>
                  <select name="category" defaultValue="Pupuk" required>
                    <option>Benih</option>
                    <option>Pupuk</option>
                    <option>Pestisida</option>
                    <option>Tenaga kerja</option>
                    <option>Air dan energi</option>
                    <option>Sewa dan alat</option>
                    <option>Transportasi</option>
                    <option>Lainnya</option>
                  </select>
                </label>

                <div className="erp-form-grid">
                  <label className="erp-field">
                    <span>Jumlah *</span>
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
                    <span>Satuan *</span>
                    <input
                      name="unit"
                      type="text"
                      placeholder="kg, sak, liter"
                      required
                    />
                  </label>
                </div>

                <label className="erp-field">
                  <span>Harga per satuan (Rp) *</span>
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
                  Total kebutuhan dihitung otomatis dari jumlah dikalikan
                  harga per satuan.
                </p>

                <ModalActions
                  onCancel={closeModal}
                  submitLabel="Simpan kebutuhan"
                />
              </form>
            )}

            {modal.type === 'activity' && (
              <form className="erp-form" onSubmit={handleAddActivity}>
                <label className="erp-field">
                  <span>Nama kegiatan *</span>
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
                    <span>Tanggal *</span>
                    <input
                      name="date"
                      type="date"
                      defaultValue={todayISO()}
                      required
                    />
                  </label>
                  <label className="erp-field">
                    <span>Kategori biaya *</span>
                    <select name="category" defaultValue="Pupuk" required>
                      <option>Benih</option>
                      <option>Pupuk</option>
                      <option>Pestisida</option>
                      <option>Tenaga kerja</option>
                      <option>Air dan energi</option>
                      <option>Sewa dan alat</option>
                      <option>Transportasi</option>
                      <option>Lainnya</option>
                    </select>
                  </label>
                </div>

                <label className="erp-field">
                  <span>Biaya aktual (Rp) *</span>
                  <input
                    name="cost"
                    type="number"
                    min="0"
                    step="100"
                    defaultValue="0"
                    required
                  />
                  <small>
                    Masukkan total pengeluaran untuk kegiatan ini. Isi 0 jika
                    tidak ada biaya yang dikeluarkan.
                  </small>
                </label>

                <label className="erp-field">
                  <span>Catatan (opsional)</span>
                  <textarea
                    name="note"
                    rows="3"
                    placeholder="Apa yang dikerjakan atau input yang digunakan?"
                  />
                </label>

                <ModalActions
                  onCancel={closeModal}
                  submitLabel="Simpan kegiatan"
                />
              </form>
            )}

            {modal.type === 'harvest' && (
              <form className="erp-form" onSubmit={handleAddHarvest}>
                <label className="erp-field">
                  <span>Tanggal panen *</span>
                  <input
                    name="date"
                    type="date"
                    defaultValue={todayISO()}
                    required
                    autoFocus
                  />
                </label>

                <label className="erp-field">
                  <span>Total hasil panen (kg) *</span>
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
                  <strong>Klasifikasi hasil</strong>
                  <p>Isi berat per grade berdasarkan hasil sortir.</p>
                </div>

                <div className="erp-form-grid erp-grade-form-grid">
                  <label className="erp-field">
                    <span>Grade A (kg)</span>
                    <input
                      name="gradeA"
                      type="number"
                      min="0"
                      step="0.1"
                      defaultValue="0"
                    />
                  </label>
                  <label className="erp-field">
                    <span>Grade B (kg)</span>
                    <input
                      name="gradeB"
                      type="number"
                      min="0"
                      step="0.1"
                      defaultValue="0"
                    />
                  </label>
                  <label className="erp-field">
                    <span>Grade C (kg)</span>
                    <input
                      name="gradeC"
                      type="number"
                      min="0"
                      step="0.1"
                      defaultValue="0"
                    />
                  </label>
                  <label className="erp-field">
                    <span>Rusak/ditolak (kg)</span>
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
                  Hasil yang belum diklasifikasikan tetap tercatat sebagai
                  bagian dari total panen, tetapi belum masuk ke stok siap jual.
                </div>

                <label className="erp-field">
                  <span>Catatan (opsional)</span>
                  <textarea
                    name="note"
                    rows="2"
                    placeholder="Kualitas hasil atau kondisi panen"
                  />
                </label>

                <ModalActions onCancel={closeModal} submitLabel="Simpan panen" />
              </form>
            )}

            {modal.type === 'sale' && (
              <form className="erp-form" onSubmit={handleAddSale}>
                <label className="erp-field">
                  <span>Tanggal transaksi *</span>
                  <input
                    name="date"
                    type="date"
                    defaultValue={todayISO()}
                    required
                    autoFocus
                  />
                </label>

                <label className="erp-field">
                  <span>Nama pembeli *</span>
                  <input
                    name="buyer"
                    type="text"
                    placeholder="Contoh: Pasar atau nama pengepul"
                    required
                  />
                </label>

                <div className="erp-form-grid">
                  <label className="erp-field">
                    <span>Grade *</span>
                    <select name="grade" defaultValue="A" required>
                      <option value="A">
                        Grade A · stok {number(financials.stock.A)} kg
                      </option>
                      <option value="B">
                        Grade B · stok {number(financials.stock.B)} kg
                      </option>
                      <option value="C">
                        Grade C · stok {number(financials.stock.C)} kg
                      </option>
                    </select>
                  </label>

                  <label className="erp-field">
                    <span>Jumlah dijual (kg) *</span>
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

                <div className="erp-form-grid">
                  <label className="erp-field">
                    <span>Harga per kg (Rp) *</span>
                    <input
                      name="unitPrice"
                      type="number"
                      min="1"
                      step="100"
                      defaultValue={activeCycle.prices.A}
                      required
                    />
                  </label>
                  <label className="erp-field">
                    <span>Potongan (Rp)</span>
                    <input
                      name="discount"
                      type="number"
                      min="0"
                      step="100"
                      defaultValue="0"
                    />
                  </label>
                </div>

                <label className="erp-field">
                  <span>Pembayaran diterima sekarang (Rp)</span>
                  <input
                    name="paidAmount"
                    type="number"
                    min="0"
                    step="100"
                    defaultValue="0"
                    required
                  />
                  <small>
                    Isi 0 jika pembeli belum membayar. Selisihnya akan dicatat
                    sebagai piutang.
                  </small>
                </label>

                <div className="erp-modal-hint">
                  Stok akan berkurang sesuai grade dan kuantitas yang dijual.
                  Sistem menolak transaksi yang melebihi stok tersedia.
                </div>

                <ModalActions
                  onCancel={closeModal}
                  submitLabel="Simpan penjualan"
                />
              </form>
            )}

            {modal.type === 'payment' && selectedSale && (
              <form className="erp-form" onSubmit={handleRecordPayment}>
                <div className="erp-payment-summary">
                  <span>PEMBELI</span>
                  <strong>{selectedSale.buyer}</strong>
                  <div>
                    <span>Nilai transaksi</span>
                    <strong>{currency(selectedSale.amount)}</strong>
                  </div>
                  <div>
                    <span>Sudah dibayar</span>
                    <strong>{currency(selectedSale.paidAmount)}</strong>
                  </div>
                  <div>
                    <span>Sisa piutang</span>
                    <strong className="erp-value-negative">
                      {currency(selectedSale.amount - selectedSale.paidAmount)}
                    </strong>
                  </div>
                </div>

                <label className="erp-field">
                  <span>Tanggal pembayaran *</span>
                  <input
                    name="date"
                    type="date"
                    defaultValue={todayISO()}
                    required
                    autoFocus
                  />
                </label>

                <label className="erp-field">
                  <span>Jumlah diterima (Rp) *</span>
                  <input
                    name="amount"
                    type="number"
                    min="1"
                    max={selectedSale.amount - selectedSale.paidAmount}
                    step="100"
                    required
                  />
                </label>

                <p className="erp-modal-hint">
                  Pembayaran akan menambah uang diterima dan mengurangi piutang.
                  Nilai penjualan dan stok tidak berubah.
                </p>

                <ModalActions
                  onCancel={closeModal}
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

function ModalActions({ onCancel, submitLabel }) {
  return (
    <div className="erp-modal-actions">
      <button
        type="button"
        className="erp-button erp-button-ghost"
        onClick={onCancel}
      >
        Batal
      </button>
      <button type="submit" className="erp-button erp-button-primary">
        <CheckCircle2 size={17} />
        {submitLabel}
      </button>
    </div>
  );
}