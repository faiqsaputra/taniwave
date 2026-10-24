import { useEffect, useMemo, useRef, useState } from 'react';
import * as Phaser from 'phaser';

import Navbar from '../components/layout/Navbar';
import FarmQuestScene from '../game/academy/FarmQuestScene';
import { MISSIONS } from '../game/academy/missions';

import {
  ArrowRight,
  Award,
  BadgeCheck,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock3,
  Coins,
  Compass,
  Gamepad2,
  Lightbulb,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Sprout,
  Star,
  Target,
  Trophy,
  X,
} from 'lucide-react';

import '../css/Academy.css';

const PROGRESS_KEY = 'taniwave-farm-quest-progress-v1';

const RANKS = [
  {
    minXP: 0,
    title: 'Penjelajah',
    description: 'Mulai mengenal keputusan pertanian.',
  },
  {
    minXP: 30,
    title: 'Pengamat Kebun',
    description: 'Mulai membangun kebiasaan mengamati.',
  },
  {
    minXP: 70,
    title: 'Perencana Budidaya',
    description: 'Belajar menimbang pilihan dan risikonya.',
  },
  {
    minXP: 120,
    title: 'Pengelola Usaha',
    description: 'Menghubungkan budidaya dan keputusan usaha.',
  },
];

function loadProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);

    if (raw) {
      const parsed = JSON.parse(raw);

      return {
        xp: Math.max(0, Number(parsed.xp) || 0),
        completed: Array.isArray(parsed.completed)
          ? parsed.completed
          : [],
        scores:
          parsed.scores && typeof parsed.scores === 'object'
            ? parsed.scores
            : {},
      };
    }
  } catch (error) {
    console.error('Gagal membaca progres Farm Quest:', error);
  }

  return {
    xp: 0,
    completed: [],
    scores: {},
  };
}

function getRank(xp) {
  return [...RANKS]
    .reverse()
    .find((rank) => xp >= rank.minXP) || RANKS[0];
}

function getNextRank(xp) {
  return RANKS.find((rank) => rank.minXP > xp) || null;
}

function formatNumber(value) {
  return new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
  }).format(value);
}

function MetricCard({ icon: Icon, label, value, detail }) {
  return (
    <article className="aq-metric-card">
      <span className="aq-metric-icon">
        <Icon size={19} />
      </span>

      <div>
        <span className="aq-metric-label">{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </article>
  );
}

function MissionStatus({ completed }) {
  return completed ? (
    <span className="aq-mission-status aq-mission-status-done">
      <CheckCircle2 size={13} />
      Selesai
    </span>
  ) : (
    <span className="aq-mission-status">
      <Compass size={13} />
      Tersedia
    </span>
  );
}

function EntityButton({ entity, selected, inspected, onClick }) {
  return (
    <button
      type="button"
      className={`aq-entity-button ${
        selected ? 'selected' : ''
      } ${inspected ? 'inspected' : ''}`}
      onClick={onClick}
    >
      <span className="aq-entity-status">
        {inspected ? (
          <CheckCircle2 size={14} />
        ) : (
          <CircleHelp size={14} />
        )}
      </span>

      <span>
        <strong>{entity.label}</strong>
        <small>{entity.subtitle}</small>
      </span>

      <ChevronRight size={14} />
    </button>
  );
}

export default function Academy() {
  const mountRef = useRef(null);
  const gameRef = useRef(null);

  const [gameReady, setGameReady] = useState(false);

  const [activeMissionId, setActiveMissionId] = useState(
    MISSIONS[0].id
  );

  const [selectedEntityId, setSelectedEntityId] = useState(null);
  const [inspectedEntityIds, setInspectedEntityIds] = useState([]);
  const [selectedChoiceId, setSelectedChoiceId] = useState(null);

  const [progress, setProgress] = useState(loadProgress);
  const [notice, setNotice] = useState('');

  const activeMission = useMemo(
    () =>
      MISSIONS.find((mission) => mission.id === activeMissionId) ||
      MISSIONS[0],
    [activeMissionId]
  );

  const selectedEntity = activeMission.entities.find(
    (entity) => entity.id === selectedEntityId
  );

  const selectedChoice = activeMission.choices.find(
    (choice) => choice.id === selectedChoiceId
  );

  const rank = getRank(progress.xp);
  const nextRank = getNextRank(progress.xp);

  const completedCount = progress.completed.filter((id) =>
    MISSIONS.some((mission) => mission.id === id)
  ).length;

  const missionCompleted = progress.completed.includes(
    activeMission.id
  );

  const bestScore = progress.scores?.[activeMission.id] || 0;

  const inspectionReady = Boolean(
    selectedEntityId &&
      inspectedEntityIds.includes(selectedEntityId)
  );

  const canChoose = inspectionReady && !selectedChoiceId;

  const rankProgress = nextRank
    ? Math.min(
        100,
        ((progress.xp - rank.minXP) /
          (nextRank.minXP - rank.minXP)) *
          100
      )
    : 100;

  useEffect(() => {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    } catch (error) {
      console.error('Gagal menyimpan progres Farm Quest:', error);
    }
  }, [progress]);

  /* =====================================
     PHASER LIFECYCLE
  ===================================== */

  useEffect(() => {
    if (!mountRef.current) return undefined;

    const scene = new FarmQuestScene({
      onReady: () => {
        setGameReady(true);
      },

      onEntitySelect: (entityId) => {
        setSelectedEntityId(entityId);

        setInspectedEntityIds((previous) =>
          previous.includes(entityId)
            ? previous
            : [...previous, entityId]
        );
      },
    });

    const game = new Phaser.Game({
      type: Phaser.AUTO,

      width: 960,
      height: 440,

      backgroundColor: '#EAF2E6',
      parent: mountRef.current,

      scene: [scene],

      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },

      render: {
        antialias: true,
        roundPixels: false,
      },
    });

    gameRef.current = game;

    return () => {
      setGameReady(false);

      game.destroy(true);

      gameRef.current = null;
    };
  }, []);

  /* Keep Phaser world synchronized with React state. */

  useEffect(() => {
    if (!gameReady || !gameRef.current) return;

    try {
      const scene = gameRef.current.scene.getScene(
        'FarmQuestScene'
      );

      scene.setQuestState({
        missionId: activeMissionId,
        selectedEntityId,
        outcomeId: selectedChoiceId,
      });
    } catch (error) {
      console.error('Gagal memperbarui dunia Farm Quest:', error);
    }
  }, [
    gameReady,
    activeMissionId,
    selectedEntityId,
    selectedChoiceId,
  ]);

  useEffect(() => {
    if (!notice) return undefined;

    const timer = window.setTimeout(() => setNotice(''), 4000);

    return () => window.clearTimeout(timer);
  }, [notice]);

  const selectMission = (missionId) => {
    setActiveMissionId(missionId);
    setSelectedEntityId(null);
    setInspectedEntityIds([]);
    setSelectedChoiceId(null);
    setNotice('');
  };

  const inspectEntity = (entityId) => {
    setSelectedEntityId(entityId);

    setInspectedEntityIds((previous) =>
      previous.includes(entityId)
        ? previous
        : [...previous, entityId]
    );
  };

  const chooseDecision = (choice) => {
    if (!inspectionReady || selectedChoiceId) return;

    setSelectedChoiceId(choice.id);

    setProgress((previous) => {
      const wasCompleted = previous.completed.includes(
        activeMission.id
      );

      const previousBest =
        previous.scores?.[activeMission.id] || 0;

      return {
        xp: previous.xp + (wasCompleted ? 0 : choice.xp),

        completed: wasCompleted
          ? previous.completed
          : [...previous.completed, activeMission.id],

        scores: {
          ...previous.scores,
          [activeMission.id]: Math.max(
            previousBest,
            choice.score
          ),
        },
      };
    });

    setNotice(
      missionCompleted
        ? 'Misi diulang. Skor terbaik diperbarui jika hasilmu meningkat, tetapi XP tidak diberikan dua kali.'
        : `Misi selesai! Kamu mendapatkan ${choice.xp} XP.`
    );
  };

  const replayMission = () => {
    setSelectedEntityId(null);
    setInspectedEntityIds([]);
    setSelectedChoiceId(null);
    setNotice('Misi siap dimainkan kembali.');
  };

  const resetProgress = () => {
    const confirmed = window.confirm(
      'Hapus semua progres Farm Quest yang tersimpan di browser?'
    );

    if (!confirmed) return;

    setProgress({
      xp: 0,
      completed: [],
      scores: {},
    });

    setSelectedEntityId(null);
    setInspectedEntityIds([]);
    setSelectedChoiceId(null);
    setNotice('Progres Farm Quest berhasil direset.');
  };

  const achievements = [
    {
      id: 'first-mission',
      title: 'Langkah Pertama',
      description: 'Selesaikan satu misi.',
      unlocked: completedCount >= 1,
      icon: Sprout,
    },
    {
      id: 'farm-observer',
      title: 'Pengamat Kebun',
      description: 'Selesaikan dua misi.',
      unlocked: completedCount >= 2,
      icon: Target,
    },
    {
      id: 'farm-strategist',
      title: 'Strategi Kebun',
      description: 'Selesaikan seluruh misi demo.',
      unlocked: completedCount >= MISSIONS.length,
      icon: Trophy,
    },
  ];

  return (
    <div className="aq-page">
      <Navbar />

      <main className="aq-shell">
        {/* HEADER */}
        <header className="aq-page-header">
          <div className="aq-title-group">
            <span className="aq-title-icon">
              <Gamepad2 size={25} />
            </span>

            <div>
              <div className="aq-title-line">
                <h1>Smart Academy</h1>
                <span className="aq-demo-badge">
                  FARM QUEST
                </span>
              </div>

              <p>
                Mainkan simulasi pertanian, ambil keputusan, dan pahami
                konsekuensinya.
              </p>
            </div>
          </div>

          <div className="aq-rank-chip">
            <span>
              <Star size={17} />
            </span>

            <div>
              <strong>{rank.title}</strong>
              <small>Level belajar</small>
            </div>
          </div>
        </header>

        {/* GAME INTRO */}
        <section className="aq-hero">
          <div className="aq-hero-copy">
            <span className="aq-eyebrow">
              <Sparkles size={14} />
              BELAJAR LEWAT KEPUTUSAN
            </span>

            <h2>
              Bukan cuma belajar pertanian.
              <br />
              <span>Rasakan konsekuensinya.</span>
            </h2>

            <p>
              Periksa kondisi lahan, susun prioritas, dan cocokkan hasil
              panen dengan pasar melalui misi interaktif.
            </p>
          </div>

          <div className="aq-hero-icon" aria-hidden="true">
            <div className="aq-hero-orbit aq-hero-orbit-one" />
            <div className="aq-hero-orbit aq-hero-orbit-two" />

            <span className="aq-hero-sprout">
              <Sprout size={45} />
            </span>

            <span className="aq-hero-star">
              <Sparkles size={21} />
            </span>
          </div>
        </section>

        {/* PROGRESS */}
        <section className="aq-progress-grid">
          <MetricCard
            icon={Coins}
            label="Total XP"
            value={formatNumber(progress.xp)}
            detail="Poin belajar terkumpul"
          />

          <MetricCard
            icon={CheckCircle2}
            label="Misi selesai"
            value={`${completedCount}/${MISSIONS.length}`}
            detail="Misi demo dituntaskan"
          />

          <MetricCard
            icon={Award}
            label="Skor terbaik"
            value={
              Object.values(progress.scores || {}).length > 0
                ? `${Math.max(
                    ...Object.values(progress.scores)
                  )}/100`
                : '—'
            }
            detail="Skor tertinggi antar-misi"
          />
        </section>

        {/* LEVEL PROGRESS */}
        <section className="aq-level-panel">
          <div className="aq-level-top">
            <div>
              <span className="aq-eyebrow">LEVEL PERJALANAN</span>
              <h2>{rank.title}</h2>
              <p>{rank.description}</p>
            </div>

            <span className="aq-level-xp">
              <Sparkles size={15} />
              {formatNumber(progress.xp)} XP
            </span>
          </div>

          <div
            className="aq-level-track"
            role="progressbar"
            aria-label="Progres menuju level berikutnya"
            aria-valuenow={Math.round(rankProgress)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span style={{ width: `${rankProgress}%` }} />
          </div>

          <div className="aq-level-footer">
            <span>
              {nextRank
                ? `${nextRank.minXP - progress.xp} XP lagi menuju ${nextRank.title}`
                : 'Semua level demo telah terbuka'}
            </span>

            <span>{Math.round(rankProgress)}%</span>
          </div>
        </section>

        {/* MISSION SELECTOR */}
        <section className="aq-missions-section">
          <div className="aq-section-heading">
            <div>
              <span className="aq-eyebrow">LEARNING JOURNEY</span>
              <h2>Pilih petualanganmu</h2>
              <p>
                Setiap misi berisi situasi, objek yang dapat diperiksa,
                dan keputusan dengan konsekuensi berbeda.
              </p>
            </div>
          </div>

          <div className="aq-mission-grid">
            {MISSIONS.map((mission) => {
              const active = mission.id === activeMissionId;

              return (
                <button
                  type="button"
                  key={mission.id}
                  className={`aq-mission-card ${
                    active ? 'active' : ''
                  }`}
                  onClick={() => selectMission(mission.id)}
                  aria-pressed={active}
                >
                  <div className="aq-mission-card-top">
                    <span className="aq-mission-number">
                      {mission.number}
                    </span>

                    <MissionStatus
                      completed={progress.completed.includes(
                        mission.id
                      )}
                    />
                  </div>

                  <span className="aq-mission-category">
                    {mission.category}
                  </span>

                  <strong className="aq-mission-title">
                    {mission.title}
                  </strong>

                  <span className="aq-mission-subtitle">
                    {mission.subtitle}
                  </span>

                  <div className="aq-mission-card-footer">
                    <span>
                      <Clock3 size={13} />
                      {mission.duration}
                    </span>

                    <span>
                      <Sparkles size={13} />
                      {mission.xp} XP
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ACTIVE MISSION */}
        <section className="aq-active-mission-heading">
          <div>
            <span className="aq-eyebrow">
              MISI {activeMission.number} · {activeMission.category}
            </span>

            <h2>{activeMission.title}</h2>

            <p>{activeMission.subtitle}</p>
          </div>

          <button
            type="button"
            className="aq-button aq-button-secondary"
            onClick={replayMission}
          >
            <RotateCcw size={15} />
            Ulangi misi
          </button>
        </section>

        {/* GAME + DECISION */}
        <div className="aq-simulation-layout">
          {/* PHASER WORLD */}
          <section className="aq-game-panel">
            <div className="aq-game-panel-header">
              <div>
                <span className="aq-game-live-indicator" />
                <strong>Dunia simulasi</strong>
              </div>

              <span className="aq-engine-label">
                <Gamepad2 size={13} />
                Powered by Phaser
              </span>
            </div>

            <div className="aq-game-stage">
              <div
                className="aq-phaser-mount"
                ref={mountRef}
                aria-label="Dunia permainan 2D Farm Quest. Pilih petak atau objek untuk memeriksa informasi."
              />
            </div>

            <div className="aq-board-instruction">
              <span className="aq-board-instruction-icon">
                <Target size={17} />
              </span>

              <p>
                <strong>
                  {inspectionReady
                    ? 'Area sudah diperiksa'
                    : 'Jelajahi dunia permainan'}
                </strong>

                <small>
                  {inspectionReady
                    ? 'Baca hasil observasi di bawah, lalu tentukan tindakan.'
                    : 'Klik petak, input, atau kelompok panen pada peta untuk membuka informasi.'}
                </small>
              </p>
            </div>

            {/* Accessible object selector */}
            <div className="aq-entity-selector">
              <div className="aq-entity-selector-heading">
                <strong>Objek yang bisa diperiksa</strong>
                <span>
                  {inspectedEntityIds.length}/{activeMission.entities.length}
                </span>
              </div>

              <div className="aq-entity-list">
                {activeMission.entities.map((entity) => (
                  <EntityButton
                    key={entity.id}
                    entity={entity}
                    selected={selectedEntityId === entity.id}
                    inspected={inspectedEntityIds.includes(
                      entity.id
                    )}
                    onClick={() => inspectEntity(entity.id)}
                  />
                ))}
              </div>
            </div>

            {/* Inspection results */}
            <div className="aq-inspection-panel">
              <div className="aq-inspection-heading">
                <span className="aq-inspection-icon">
                  <SearchIcon />
                </span>

                <div>
                  <span className="aq-eyebrow">
                    HASIL OBSERVASI
                  </span>

                  <h3>
                    {selectedEntity
                      ? selectedEntity.label
                      : 'Belum ada area diperiksa'}
                  </h3>
                </div>
              </div>

              {selectedEntity ? (
                <>
                  <div className="aq-inspection-metric">
                    <span>{selectedEntity.metricLabel}</span>
                    <strong>{selectedEntity.metric}</strong>
                  </div>

                  <p className="aq-inspection-detail">
                    {selectedEntity.detail}
                  </p>
                </>
              ) : (
                <p className="aq-inspection-empty">
                  Pilih salah satu objek di dalam permainan untuk
                  mengetahui informasi yang tersedia dalam skenario.
                </p>
              )}

              <p className="aq-inspection-disclaimer">
                Data objek merupakan simulasi pembelajaran, bukan
                pengukuran sensor atau hasil pemeriksaan lapangan.
              </p>
            </div>
          </section>

          {/* DECISION PANEL */}
          <aside className="aq-decision-panel">
            <div className="aq-decision-header">
              <span className="aq-decision-icon">
                <Lightbulb size={20} />
              </span>

              <div>
                <span className="aq-eyebrow">TANTANGAN KEPUTUSAN</span>
                <h3>Apa yang akan kamu lakukan?</h3>
              </div>
            </div>

            <div className="aq-situation-card">
              <span className="aq-situation-label">
                SITUASI
              </span>

              <p>{activeMission.situation}</p>

              <div className="aq-context-chips">
                {activeMission.context.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </div>

            <div className="aq-learning-objective">
              <Target size={15} />
              <p>
                <strong>Tujuan misi</strong>
                <span>{activeMission.objective}</span>
              </p>
            </div>

            <div className="aq-choice-heading">
              <span className="aq-eyebrow">PILIHAN TINDAKAN</span>

              {!inspectionReady && (
                <span className="aq-unlock-hint">
                  <LockKeyhole size={12} />
                  Periksa objek dahulu
                </span>
              )}
            </div>

            <div className="aq-choice-list">
              {activeMission.choices.map((choice, index) => {
                const isSelected = selectedChoiceId === choice.id;

                return (
                  <button
                    type="button"
                    key={choice.id}
                    className={`aq-choice-card ${
                      isSelected ? 'selected' : ''
                    }`}
                    disabled={!canChoose}
                    onClick={() => chooseDecision(choice)}
                    aria-pressed={isSelected}
                  >
                    <span className="aq-choice-letter">
                      {String.fromCharCode(65 + index)}
                    </span>

                    <span className="aq-choice-copy">
                      <strong>{choice.label}</strong>
                      <small>{choice.description}</small>
                    </span>

                    <span className="aq-choice-arrow">
                      {isSelected ? (
                        <CheckCircle2 size={17} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {!inspectionReady && (
              <div className="aq-locked-message">
                <LockKeyhole size={15} />

                <p>
                  Periksa minimal satu objek pada peta sebelum menentukan
                  keputusan. Biasakan mengumpulkan bukti sebelum bertindak.
                </p>
              </div>
            )}

            {/* Decision feedback */}
            {selectedChoice && (
              <section className="aq-feedback-panel">
                <div className="aq-feedback-header">
                  <span
                    className={`aq-feedback-icon aq-feedback-${selectedChoice.outcome}`}
                  >
                    {selectedChoice.score >= 80 ? (
                      <CheckCircle2 size={20} />
                    ) : (
                      <Lightbulb size={20} />
                    )}
                  </span>

                  <div>
                    <span className="aq-eyebrow">
                      FEEDBACK KEPUTUSAN
                    </span>

                    <h4>
                      {selectedChoice.score >= 80
                        ? 'Keputusan yang baik'
                        : 'Pelajaran dari keputusanmu'}
                    </h4>
                  </div>
                </div>

                <p className="aq-feedback-copy">
                  {selectedChoice.feedback}
                </p>

                <div className="aq-score-row">
                  <div>
                    <span>Skor keputusan</span>
                    <strong>{selectedChoice.score}/100</strong>
                  </div>

                  <div>
                    <span>XP misi</span>
                    <strong>
                      +{missionCompleted ? 0 : selectedChoice.xp} XP
                    </strong>
                  </div>
                </div>

                <div className="aq-consequence-list">
                  {selectedChoice.consequences.map((item) => (
                    <div key={item.label}>
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </div>
                  ))}
                </div>

                <div className="aq-learning-takeaway">
                  <BookOpen size={16} />

                  <p>
                    <strong>Yang perlu kamu pelajari</strong>
                    <span>{selectedChoice.learning}</span>
                  </p>
                </div>

                <div className="aq-feedback-note">
                  <ShieldCheck size={15} />

                  <p>
                    Konsekuensi dan skor ini ditetapkan pada materi simulasi,
                    bukan hasil prediksi agronomis atau finansial aktual.
                  </p>
                </div>

                <button
                  type="button"
                  className="aq-button aq-button-primary aq-replay-button"
                  onClick={replayMission}
                >
                  Coba keputusan lain
                  <RotateCcw size={15} />
                </button>
              </section>
            )}
          </aside>
        </div>

        {/* ACHIEVEMENTS */}
        <section className="aq-achievements-section">
          <div className="aq-section-heading">
            <div>
              <span className="aq-eyebrow">PENCAPAIAN</span>
              <h2>Koleksi badge</h2>
              <p>
                Badge dibuka berdasarkan misi yang sudah diselesaikan.
              </p>
            </div>

            <span className="aq-achievement-count">
              {achievements.filter((item) => item.unlocked).length}/
              {achievements.length} terbuka
            </span>
          </div>

          <div className="aq-achievement-grid">
            {achievements.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  className={`aq-achievement-card ${
                    item.unlocked ? 'unlocked' : 'locked'
                  }`}
                  key={item.id}
                >
                  <span className="aq-achievement-icon">
                    {item.unlocked ? (
                      <Icon size={22} />
                    ) : (
                      <LockKeyhole size={20} />
                    )}
                  </span>

                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.description}</p>
                  </div>

                  {item.unlocked && (
                    <CheckCircle2
                      className="aq-achievement-check"
                      size={17}
                    />
                  )}
                </article>
              );
            })}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="aq-footer">
          <div>
            <span className="aq-footer-mark">
              <Sprout size={15} />
            </span>

            <strong>Farm Quest</strong>
            <span>· Smart Academy TANIWAVE</span>
          </div>

          <p>
            Progres tersimpan di browser ini. Materi dan konsekuensi masih
            menggunakan data simulasi.
          </p>

          <button
            type="button"
            onClick={resetProgress}
          >
            <RotateCcw size={13} />
            Reset progres
          </button>
        </footer>
      </main>

      {notice && (
        <div className="aq-toast" role="status">
          <CheckCircle2 size={17} />
          <span>{notice}</span>
          <button
            type="button"
            onClick={() => setNotice('')}
            aria-label="Tutup notifikasi"
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

function SearchIcon() {
  return <Target size={17} />;
}