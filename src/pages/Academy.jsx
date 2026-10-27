import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Coins,
  Gamepad2,
  Lock,
  Play,
  RotateCcw,
  Sparkles,
  Sprout,
  Trophy,
  X,
  Zap,
} from "lucide-react";

import PhaserGame from "../components/academy/PhaserGame";
import CabaiGame from "../components/academy/CabaiGame";
import BibitGame from "../components/academy/BibitGame";
import MarketGame from "../components/academy/MarketGame";

import "../css/Academy.css";
 

/* =========================================================
   MISSIONS
========================================================= */

export const MISSIONS = [
  {
    id: "cabai-hujan",
    number: "01",
    category: "BUDIDAYA",
    title: "Cabai Setelah Hujan",
    shortDescription:
      "Tanamanmu baru 2 minggu. Hujan deras turun 3 hari berturut-turut.",
    question:
      "Hujan terus turun dan tanah terlihat terlalu basah. Apa langkah pertamamu?",
    context: [
      "🌧️ Hujan tinggi",
      "💧 Tanah basah",
      "🌱 Umur 14 hari",
    ],
    objective:
      "Belajar mengumpulkan bukti sebelum memberikan perlakuan pada tanaman.",
    duration: "3 menit",
    xp: 80,
    asset: "/assets/academy/case-cabai.svg",
    difficulty: "easy",
    difficultyLabel: "PEMULA",

    entities: [
      {
        id: "soil",
        label: "Tanah",
        subtitle: "Kelembapan",
        metric: "Terlalu basah",
        detail:
          "Permukaan tanah masih jenuh air dan belum kembali ke kondisi lembap yang ideal.",
      },
      {
        id: "leaf",
        label: "Daun cabai",
        subtitle: "Gejala",
        metric: "Mulai menguning",
        detail:
          "Beberapa daun bagian bawah tampak menguning. Ini adalah gejala yang perlu diamati, bukan diagnosis tunggal.",
      },
      {
        id: "drainage",
        label: "Drainase",
        subtitle: "Aliran air",
        metric: "Kurang lancar",
        detail:
          "Ada genangan kecil di sisi bedengan. Air perlu punya jalur keluar agar tidak terus mengendap.",
      },
    ],

    choices: [
      {
        id: "drain",
        label: "Periksa dan buka jalur drainase",
        description:
          "Kurangi genangan sebelum memberi input tambahan.",
        score: 100,
        xp: 80,
        coins: 30,
        feedback:
          "Kamu memprioritaskan kondisi lingkungan akar terlebih dahulu. Setelah air terkendali, observasi berikutnya menjadi lebih masuk akal.",
        learning:
          "Kenali penyebab masalah sebelum menambah pupuk atau air.",
      },
      {
        id: "fertilize",
        label: "Langsung tambah pupuk",
        description:
          "Berikan nutrisi agar daun cepat hijau.",
        score: 45,
        xp: 80,
        coins: 10,
        feedback:
          "Nutrisi bukan selalu jawaban pertama. Saat tanah terlalu basah, masalah air dan kondisi akar sebaiknya diperiksa lebih dulu.",
        learning:
          "Jangan menambah input sebelum memahami kondisi lahan.",
      },
      {
        id: "water",
        label: "Tambah penyiraman",
        description:
          "Sirami tanaman supaya tidak kekurangan air.",
        score: 20,
        xp: 80,
        coins: 5,
        feedback:
          "Kondisi tanah menunjukkan air sudah berlebih. Menambah air akan membuat kondisi yang sedang bermasalah semakin berat.",
        learning:
          "Gunakan kondisi tanah sebagai bukti sebelum menyiram.",
      },
    ],

    practiceIntro:
      "Sekarang cek satu tanaman di kebunmu. Jangan langsung memberi perlakuan. Amati dan catat dulu.",

    practiceChecklist: [
      "Periksa apakah ada genangan",
      "Rasakan kondisi lembap tanah",
      "Amati warna dan posisi daun",
      "Catat temuan sebelum mengambil tindakan",
    ],
  },

  {
    id: "bibit-sehat",
    number: "02",
    category: "PEMBIBITAN",
    title: "Pilih Bibit yang Siap Tanam",
    shortDescription:
      "Kamu punya tiga pilihan bibit. Mana yang paling siap masuk lahan?",
    question:
      "Tiga bibit tersedia. Mana yang kamu pilih untuk dipindahkan ke lahan?",
    context: [
      "🌱 3 bibit",
      "☀️ Cuaca cerah",
      "🪴 Siap pindah",
    ],
    objective:
      "Mengenali ciri bibit yang sehat dan tidak hanya memilih berdasarkan ukuran.",
    duration: "3 menit",
    xp: 80,
    asset: "/assets/academy/case-bibit.svg",
    difficulty: "easy",
    difficultyLabel: "PEMULA",

    entities: [
      {
        id: "a",
        label: "Bibit A",
        subtitle: "Tinggi",
        metric: "Terlalu memanjang",
        detail:
          "Batang tinggi dan kurus dengan jarak antar daun cukup jauh.",
      },
      {
        id: "b",
        label: "Bibit B",
        subtitle: "Kondisi",
        metric: "Kokoh & segar",
        detail:
          "Batang terlihat kokoh dan daun berwarna relatif seragam.",
      },
      {
        id: "c",
        label: "Bibit C",
        subtitle: "Daun",
        metric: "Ada bercak",
        detail:
          "Terlihat bercak pada beberapa bagian daun sehingga perlu pemeriksaan lebih lanjut.",
      },
    ],

    choices: [
      {
        id: "b",
        label: "Pilih Bibit B",
        description:
          "Utamakan bibit yang terlihat sehat dan kokoh.",
        score: 100,
        xp: 80,
        coins: 30,
        feedback:
          "Kamu memilih berdasarkan kondisi tanaman, bukan sekadar tinggi atau ukuran.",
        learning:
          "Bibit sehat biasanya menjadi titik awal yang lebih baik untuk pertumbuhan.",
      },
      {
        id: "a",
        label: "Pilih Bibit A",
        description:
          "Pilih yang paling tinggi agar cepat besar.",
        score: 50,
        xp: 80,
        coins: 10,
        feedback:
          "Ukuran tinggi belum tentu berarti bibit lebih siap. Struktur batang dan kondisi keseluruhan perlu diperhatikan.",
        learning:
          "Jangan menyamakan tinggi tanaman dengan kualitas bibit.",
      },
      {
        id: "c",
        label: "Pilih Bibit C",
        description:
          "Coba saja karena daunnya masih banyak.",
        score: 35,
        xp: 80,
        coins: 5,
        feedback:
          "Bercak pada daun adalah sinyal untuk diperiksa lebih lanjut sebelum bibit dipindahkan.",
        learning:
          "Amati gejala tanaman sebelum memutuskan.",
      },
    ],

    practiceIntro:
      "Cari tiga bibit di sekitar kamu dan bandingkan kondisinya dengan kriteria sederhana.",

    practiceChecklist: [
      "Bandingkan kekokohan batang",
      "Amati warna daun",
      "Periksa bercak atau kerusakan",
      "Pilih satu bibit dan tulis alasanmu",
    ],
  },

  {
    id: "harga-pasar",
    number: "03",
    category: "USAHA TANI",
    title: "Harga Turun, Panen Tetap Jalan",
    shortDescription:
      "Harga komoditas turun. Kamu harus memilih strategi agar usaha tidak rugi.",
    question:
      "Harga sedang turun. Apa keputusanmu agar hasil panen tetap punya nilai?",
    context: [
      "📉 Harga -20%",
      "💰 Modal terbatas",
      "🧺 Panen dekat",
    ],
    objective:
      "Belajar melihat keputusan budidaya dan pasar sebagai satu rangkaian.",
    duration: "4 menit",
    xp: 100,
    asset: "/assets/academy/case-market.svg",
    difficulty: "medium",
    difficultyLabel: "MENENGAH",

    entities: [
      {
        id: "market",
        label: "Pasar",
        subtitle: "Harga",
        metric: "Turun 20%",
        detail:
          "Harga sedang melemah. Menjual semuanya pada satu waktu meningkatkan ketergantungan pada harga hari ini.",
      },
      {
        id: "stock",
        label: "Hasil panen",
        subtitle: "Kualitas",
        metric: "Layak jual",
        detail:
          "Sebagian besar hasil panen masih berada dalam kondisi yang dapat dipasarkan.",
      },
      {
        id: "cost",
        label: "Biaya",
        subtitle: "Operasional",
        metric: "Terbatas",
        detail:
          "Modal tambahan terbatas sehingga strategi baru harus memperhatikan biaya.",
      },
    ],

    choices: [
      {
        id: "grade",
        label: "Sortir dan cari beberapa kanal penjualan",
        description:
          "Pisahkan kualitas dan jangan bergantung pada satu pembeli.",
        score: 100,
        xp: 100,
        coins: 40,
        feedback:
          "Kamu mengurangi ketergantungan pada satu harga dengan memperhatikan kualitas dan kanal penjualan.",
        learning:
          "Keputusan usaha tani tidak berhenti di produksi. Pasar dan kualitas juga perlu dibaca.",
      },
      {
        id: "hold",
        label: "Tahan seluruh panen",
        description:
          "Simpan semua sampai harga naik lagi.",
        score: 55,
        xp: 100,
        coins: 15,
        feedback:
          "Menahan panen dapat menjadi pilihan, tetapi ada biaya dan risiko kualitas yang perlu dihitung.",
        learning:
          "Setiap strategi pasar punya biaya, risiko, dan batas waktu.",
      },
      {
        id: "sell",
        label: "Jual semua ke pembeli pertama",
        description:
          "Yang penting cepat terjual.",
        score: 35,
        xp: 100,
        coins: 5,
        feedback:
          "Cepat terjual memang mengurangi waktu tunggu, tetapi kamu kehilangan kesempatan membandingkan kanal dan harga.",
        learning:
          "Bandingkan pilihan sebelum melepas hasil panen.",
      },
    ],

    practiceIntro:
      "Coba amati satu komoditas di pasar sekitar. Catat harga dan minimal dua tempat yang menjual atau membeli komoditas tersebut.",

    practiceChecklist: [
      "Catat harga hari ini",
      "Bandingkan dua kanal penjualan",
      "Catat kualitas/grade yang diminta",
      "Tulis strategi yang paling masuk akal",
    ],
  },
];

/* =========================================================
   LOCAL STORAGE
========================================================= */

const STORAGE_KEY =
  "taniwave-smart-academy-v2";

const defaultProgress = {
  xp: 0,
  coins: 0,
  completed: [],
  bestScores: {},
  practices: {},
};

/* =========================================================
   HELPERS
========================================================= */

function loadProgress() {
  const fallback = {
    ...defaultProgress,
    completed: [],
    bestScores: {},
    practices: {},
  };

  try {
    if (typeof window === "undefined") {
      return fallback;
    }

    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return fallback;
    }

    const parsed = JSON.parse(saved);

    return {
      ...fallback,
      ...parsed,
      xp: Number.isFinite(parsed?.xp) ? parsed.xp : 0,
      coins: Number.isFinite(parsed?.coins) ? parsed.coins : 0,
      completed: Array.isArray(parsed?.completed) ? parsed.completed : [],
      bestScores:
        parsed?.bestScores && typeof parsed.bestScores === "object"
          ? parsed.bestScores
          : {},
      practices:
        parsed?.practices && typeof parsed.practices === "object"
          ? parsed.practices
          : {},
    };
  } catch {
    return fallback;
  }
}

function saveProgress(progress) {
  try {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(progress)
    );
  } catch {
    // Storage can be unavailable in private mode or restricted browsers.
  }
}

function getDifficultyClass(
  difficulty
) {
  if (
    difficulty === "medium"
  ) {
    return "academy-difficulty academy-difficulty--medium";
  }

  if (
    difficulty === "hard"
  ) {
    return "academy-difficulty academy-difficulty--hard";
  }

  return "academy-difficulty academy-difficulty--easy";
}

/* =========================================================
   COMPONENT
========================================================= */

export default function Academy() {
  const [
    progress,
    setProgress,
  ] = useState(loadProgress);

  const [
    activeMission,
    setActiveMission,
  ] = useState(null);

  const [
    gameStarted,
    setGameStarted,
  ] = useState(false);

  const [
    gameResult,
    setGameResult,
  ] = useState(null);

  const [
    practiceMode,
    setPracticeMode,
  ] = useState(false);

  const [
    practiceChecked,
    setPracticeChecked,
  ] = useState([]);

  const [
    observedEntities,
    setObservedEntities,
  ] = useState([]);

  const [
    showResetConfirm,
    setShowResetConfirm,
  ] = useState(false);

  /* =======================================================
     DERIVED
  ======================================================= */

  const completedCount =
    progress.completed.length;

  const totalXP =
    progress.xp;

  const totalCoins =
    progress.coins;

  const practiceCompleted = Boolean(
    activeMission && progress.practices?.[activeMission.id]
  );

  const observationTarget =
    activeMission?.id === "harga-pasar" ? 3 : 2;

  const visibleObservedCount = Math.min(
    observedEntities.length,
    observationTarget
  );

  const academyLevel =
    Math.floor(totalXP / 300) + 1;

  const currentLevelXP =
    totalXP -
    (academyLevel - 1) * 300;

  const levelProgress =
    Math.min(
      100,
      Math.round(
        (currentLevelXP / 300) *
          100
      )
    );

  const completedMissionIds =
    useMemo(
      () =>
        new Set(
          progress.completed
        ),
      [progress.completed]
    );

  /* =======================================================
     PERSIST
  ======================================================= */

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  /* =======================================================
     START MISSION
  ======================================================= */

  const openMission = useCallback((mission) => {
    setActiveMission(mission);
    setGameStarted(false);
    setGameResult(null);
    setPracticeMode(false);
    setPracticeChecked([]);
    setObservedEntities([]);
  }, []);

  const startGame = useCallback(() => {
    setGameStarted(true);
    setGameResult(null);
    setPracticeMode(false);
    setPracticeChecked([]);
    setObservedEntities([]);
  }, []);

  const closeMission = useCallback(() => {
    setActiveMission(null);
    setGameStarted(false);
    setGameResult(null);
    setPracticeMode(false);
    setPracticeChecked([]);
    setObservedEntities([]);
  }, []);

  /* =======================================================
     GAME EVENTS
     Stable callbacks prevent Phaser from being destroyed and
     recreated every time the player inspects an object.
  ======================================================= */

  const handleEntityObserved = useCallback((entity) => {
    if (!entity?.id) return;

    setObservedEntities((prev) => {
      if (prev.some((item) => item.id === entity.id)) {
        return prev;
      }

      return [...prev, entity];
    });
  }, []);

  const handleObservationComplete = useCallback(() => {
    // Reserved for observation-stage feedback in a future iteration.
  }, []);

  const handleGameResult = useCallback((result) => {
    setGameResult(result ?? null);
  }, []);

  const handleGameComplete = useCallback((result = {}) => {
    if (!activeMission) return;

    const mission = activeMission;
    const safeScore = Number.isFinite(result.score) ? result.score : 0;
    const earnedXP = Number.isFinite(result.xp)
      ? result.xp
      : (mission.xp ?? 0);
    const earnedCoins = Number.isFinite(result.coins)
      ? result.coins
      : 0;

    setProgress((prev) => {
      const alreadyCompleted = prev.completed.includes(mission.id);
      const oldBest = prev.bestScores[mission.id] ?? 0;
      const bestScore = Math.max(oldBest, safeScore);

      // XP and coins are awarded only on the first completion.
      if (alreadyCompleted) {
        if (bestScore === oldBest) return prev;

        return {
          ...prev,
          bestScores: {
            ...prev.bestScores,
            [mission.id]: bestScore,
          },
        };
      }

      return {
        ...prev,
        xp: prev.xp + earnedXP,
        coins: prev.coins + earnedCoins,
        completed: [...prev.completed, mission.id],
        bestScores: {
          ...prev.bestScores,
          [mission.id]: bestScore,
        },
      };
    });

    setGameResult({
      ...result,
      score: safeScore,
      xp: earnedXP,
      coins: earnedCoins,
    });
  }, [activeMission]);

  /* =======================================================
     PRACTICE
  ======================================================= */

  const togglePractice = useCallback((index) => {
    setPracticeChecked((prev) => (
      prev.includes(index)
        ? prev.filter((item) => item !== index)
        : [...prev, index]
    ));
  }, []);

  const finishPractice = useCallback(() => {
    if (!activeMission) return;

    setProgress((prev) => ({
      ...prev,
      practices: {
        ...prev.practices,
        [activeMission.id]: true,
      },
    }));
  }, [activeMission]);

  /* =======================================================
     RESET
  ======================================================= */

  const resetProgress = useCallback(() => {
    setProgress({
      ...defaultProgress,
      completed: [],
      bestScores: {},
      practices: {},
    });
    setShowResetConfirm(false);
  }, []);

  /* =======================================================
     GAME COMPONENT
  ======================================================= */

  const renderGame = () => {
    if (
      !activeMission
    ) {
      return null;
    }

    const props = {
      mission:
        activeMission,

      onEntityObserved:
        handleEntityObserved,

      onObservationComplete:
        handleObservationComplete,

      onResult:
        handleGameResult,

      onComplete:
        handleGameComplete,

      onExit:
        closeMission,
    };

    switch (
      activeMission.id
    ) {
      case "cabai-hujan":
        return (
          <CabaiGame
            {...props}
          />
        );

      case "bibit-sehat":
        return (
          <BibitGame
            {...props}
          />
        );

      case "harga-pasar":
        return (
          <MarketGame
            {...props}
          />
        );

      default:
        return (
          <PhaserGame
            {...props}
          />
        );
    }
  };

  /* =======================================================
     GAME SCREEN
  ======================================================= */

  if (
    activeMission &&
    gameStarted
  ) {
    return (
      <main className="academy-page academy-page--game" aria-label="Smart Academy game">
        <header className="academy-game-topbar">
          <button
            type="button"
            className="academy-back-button"
            onClick={() => {
              setGameStarted(
                false
              );
              setGameResult(
                null
              );
            }}
          >
            <ArrowLeft
              size={18}
            />
            <span>
              Keluar dari game
            </span>
          </button>

          <div className="academy-game-title">
            <span>
              {activeMission.category}
            </span>

            <strong>
              {activeMission.title}
            </strong>
          </div>

          <div className="academy-game-progress">
            <span aria-live="polite">
              {visibleObservedCount}/{observationTarget} bukti
            </span>
          </div>
        </header>

        <section className="academy-game-stage" aria-label={`Permainan: ${activeMission.title}`}>
          <div className="academy-game-wrapper">
            {renderGame()}
          </div>
        </section>

        {gameResult && (
          <div className="academy-result-dock">
            <div className="academy-result-dock__info">
              <div className="academy-result-icon">
                {gameResult.score >=
                80 ? (
                  <Trophy
                    size={21}
                  />
                ) : (
                  <Sparkles
                    size={21}
                  />
                )}
              </div>

              <div>
                <strong>
                  {practiceCompleted
                    ? "Praktik kamu sudah tercatat"
                    : "Keputusanmu sudah tercatat"}
                </strong>

                <span>
                  Skor{" "}
                  <b>
                    {
                      gameResult.score
                    }
                  </b>{" "}
                  • +
                  {
                    gameResult.xp
                  }{" "}
                  XP • +
                  {
                    gameResult
                      .coins
                  }{" "}
                  🪙
                </span>
              </div>
            </div>

            <button
              type="button"
              className="academy-primary-button"
              onClick={practiceCompleted ? closeMission : () => setPracticeMode(true)}
            >
              {practiceCompleted ? "Kembali ke Academy" : "Lanjut Praktik"}
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        )}

        {practiceMode && (
          <PracticeModal
            mission={
              activeMission
            }
            checked={
              practiceChecked
            }
            onToggle={
              togglePractice
            }
            onFinish={
              finishPractice
            }
            onClose={() =>
              setPracticeMode(
                false
              )
            }
          />
        )}
      </main>
    );
  }

  /* =======================================================
     MISSION DETAIL
  ======================================================= */

  if (
    activeMission &&
    !gameStarted
  ) {
    const completed =
      completedMissionIds.has(
        activeMission.id
      );

    return (
      <main className="academy-page academy-page--detail">
        <div className="academy-detail-page">
          <button
            type="button"
            className="academy-detail-back"
            onClick={
              closeMission
            }
          >
            <ArrowLeft
              size={18}
            />
            Kembali ke Academy
          </button>

          <div className="academy-detail-grid">
            <section className="academy-detail-hero">
              <div className="academy-detail-image-wrap">
                <img
                  src={activeMission.asset}
                  alt={`Ilustrasi studi kasus ${activeMission.title}`}
                  className="academy-detail-image"
                  loading="eager"
                  decoding="async"
                />

                <div className="academy-detail-floating-card">
                  <Gamepad2
                    size={17}
                  />

                  <span>
                    MINI CASE
                  </span>
                </div>
              </div>

              <div className="academy-detail-copy">
                <div className="academy-detail-meta">
                  <span>
                    {
                      activeMission
                        .number
                    }
                  </span>

                  <span>
                    {
                      activeMission
                        .category
                    }
                  </span>

                  <span
                    className={getDifficultyClass(
                      activeMission.difficulty
                    )}
                  >
                    {
                      activeMission
                        .difficultyLabel
                    }
                  </span>
                </div>

                <h1>
                  {
                    activeMission.title
                  }
                </h1>

                <p className="academy-detail-description">
                  {
                    activeMission.shortDescription
                  }
                </p>

                <div className="academy-detail-stats">
                  <div>
                    <Zap
                      size={17}
                    />

                    <span>
                      {
                        activeMission
                          .xp
                      }{" "}
                      XP
                    </span>
                  </div>

                  <div>
                    <BookOpen
                      size={17}
                    />

                    <span>
                      {
                        activeMission
                          .duration
                      }
                    </span>
                  </div>

                  <div>
                    <Gamepad2
                      size={17}
                    />

                    <span>
                      Studi kasus
                    </span>
                  </div>
                </div>

                <div className="academy-question-card">
                  <span className="academy-question-label">
                    MISI HARI INI
                  </span>

                  <p>
                    {
                      activeMission.question
                    }
                  </p>
                </div>

                <div className="academy-context-list">
                  {activeMission.context.map(
                    (
                      item
                    ) => (
                      <span
                        key={item}
                      >
                        {item}
                      </span>
                    )
                  )}
                </div>

                <button
                  type="button"
                  className="academy-start-button"
                  onClick={
                    startGame
                  }
                >
                  <span>
                    <Play
                      size={20}
                      fill="currentColor"
                    />
                  </span>

                  <div>
                    <strong>
                      {completed
                        ? "Mainkan Lagi"
                        : "Mulai Studi Kasus"}
                    </strong>

                    <small>
                      {completed
                        ? "Ulangi untuk meningkatkan skor"
                        : "Masuk ke simulasi keputusan"}
                    </small>
                  </div>

                  <ArrowRight
                    size={20}
                  />
                </button>
              </div>
            </section>

            <aside className="academy-detail-sidebar">
              <div className="academy-info-card">
                <div className="academy-info-card__header">
                  <Sprout
                    size={18}
                  />

                  <strong>
                    Yang akan kamu pelajari
                  </strong>
                </div>

                <p>
                  {
                    activeMission.objective
                  }
                </p>
              </div>

              <div className="academy-info-card">
                <div className="academy-info-card__header">
                  <Sparkles
                    size={18}
                  />

                  <strong>
                    Cara bermain
                  </strong>
                </div>

                <ol className="academy-step-list">
                  <li>
                    <span>
                      1
                    </span>
                    Amati kondisi
                  </li>

                  <li>
                    <span>
                      2
                    </span>
                    Kumpulkan bukti
                  </li>

                  <li>
                    <span>
                      3
                    </span>
                    Ambil keputusan
                  </li>

                  <li>
                    <span>
                      4
                    </span>
                    Lihat konsekuensi
                  </li>

                  <li>
                    <span>
                      5
                    </span>
                    Praktik di dunia nyata
                  </li>
                </ol>
              </div>

              {completed && (
                <div className="academy-completed-card">
                  <div className="academy-completed-icon">
                    <Check
                      size={20}
                    />
                  </div>

                  <div>
                    <strong>
                      Studi kasus selesai
                    </strong>

                    <span>
                      Kamu sudah pernah
                      menyelesaikan misi ini.
                    </span>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>
    );
  }

  /* =======================================================
     MAIN ACADEMY
  ======================================================= */

  return (
    <main className="academy-page academy-page--home">
      {/* ===================================================
          HERO
      =================================================== */}

      <section className="academy-hero">
        <div className="academy-hero__background">
          <div className="academy-hero__circle academy-hero__circle--one" />
          <div className="academy-hero__circle academy-hero__circle--two" />
          <div className="academy-hero__circle academy-hero__circle--three" />
        </div>

        <div className="academy-hero__content">
          <div className="academy-hero__copy">
            <div className="academy-eyebrow">
              <Gamepad2
                size={15}
              />
              SMART ACADEMY
            </div>

            <h1>
              Belajar jadi petani.
              <br />

              <span>
                Mainkan keputusannya.
              </span>
            </h1>

            <p>
              Bukan kelas panjang.
              Hadapi kasus nyata,
              ambil keputusan, lihat
              konsekuensinya, lalu
              coba praktikkan di
              kebunmu.
            </p>

            <div className="academy-hero-actions">
              <button
                type="button"
                className="academy-hero-button"
                onClick={() => {
                  const first =
                    MISSIONS.find(
                      (mission) =>
                        !completedMissionIds.has(
                          mission.id
                        )
                    ) ||
                    MISSIONS[0];

                  openMission(
                    first
                  );
                }}
              >
                <Play
                  size={18}
                  fill="currentColor"
                />
                Mulai Belajar
              </button>

              <span className="academy-hero-note">
                ⚡ 3–4 menit per kasus
              </span>
            </div>
          </div>

          <div className="academy-hero-character">
            <div className="academy-character-glow" />

            <img
              src="/assets/academy/farmer-mascot.svg"
              alt="Petani muda TANIWAVE"
            />

            <div className="academy-character-badge">
              <Sparkles
                size={14}
              />
              <span>
                Siap bertani?
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          PLAYER STATUS
      =================================================== */}

      <section className="academy-content">
        <div className="academy-player-card">
          <div className="academy-player-profile">
            <div className="academy-player-avatar">
              🌱
            </div>

            <div>
              <span>
                PETANI MUDA
              </span>

              <strong>
                Level{" "}
                {academyLevel}
              </strong>
            </div>
          </div>

          <div className="academy-player-progress">
            <div className="academy-player-progress__top">
              <span>
                Progress level
              </span>

              <strong>
                {currentLevelXP}
                /300 XP
              </strong>
            </div>

            <div className="academy-progress-track">
              <div
                className="academy-progress-fill"
                style={{
                  width: `${levelProgress}%`,
                }}
              />
            </div>
          </div>

          <div className="academy-player-rewards">
            <div>
              <Zap
                size={17}
              />

              <strong>
                {totalXP}
              </strong>

              <span>
                XP
              </span>
            </div>

            <div>
              <Coins
                size={17}
              />

              <strong>
                {totalCoins}
              </strong>

              <span>
                Coins
              </span>
            </div>

            <div>
              <Trophy
                size={17}
              />

              <strong>
                {completedCount}
              </strong>

              <span>
                Selesai
              </span>
            </div>
          </div>
        </div>

        {/* =================================================
            SECTION HEADER
        ================================================= */}

        <div className="academy-section-header">
          <div>
            <span className="academy-section-eyebrow">
              PILIH PERMAINANMU
            </span>

            <h2>
              Mau belajar apa hari ini?
            </h2>

            <p>
              Setiap kasus membawa kamu
              lebih dekat ke praktik nyata.
            </p>
          </div>

          <div className="academy-mission-count">
            <strong>
              {completedCount}
            </strong>

            <span>
              / {MISSIONS.length}
              <br />
              misi selesai
            </span>
          </div>
        </div>

        {/* =================================================
            MISSION GRID
        ================================================= */}

        <div className="academy-mission-grid">
          {MISSIONS.map(
            (
              mission,
              index
            ) => {
              const completed =
                completedMissionIds.has(
                  mission.id
                );

              const bestScore =
                progress.bestScores[
                  mission.id
                ];

              return (
                <MissionCard
                  key={
                    mission.id
                  }
                  mission={
                    mission
                  }
                  index={
                    index
                  }
                  completed={
                    completed
                  }
                  bestScore={
                    bestScore
                  }
                  onClick={() =>
                    openMission(
                      mission
                    )
                  }
                />
              );
            }
          )}
        </div>

        {/* =================================================
            PRACTICE MESSAGE
        ================================================= */}

        <section className="academy-practice-banner">
          <div className="academy-practice-banner__icon">
            🌱
          </div>

          <div className="academy-practice-banner__content">
            <span>
              BELAJAR → PRAKTIK
            </span>

            <h3>
              Game selesai bukan berarti
              belajarnya selesai.
            </h3>

            <p>
              Setelah menyelesaikan studi
              kasus, kamu akan mendapatkan
              checklist sederhana untuk
              dicoba langsung di kebun,
              lahan, atau lingkunganmu.
            </p>
          </div>

          <div className="academy-practice-banner__steps">
            <div>
              <span>
                01
              </span>
              <strong>
                Mainkan
              </strong>
            </div>

            <ChevronRight />

            <div>
              <span>
                02
              </span>
              <strong>
                Pahami
              </strong>
            </div>

            <ChevronRight />

            <div>
              <span>
                03
              </span>
              <strong>
                Praktik
              </strong>
            </div>
          </div>
        </section>

        {/* =================================================
            RESET
        ================================================= */}

        <div className="academy-footer">
          <button
            type="button"
            onClick={() =>
              setShowResetConfirm(
                true
              )
            }
          >
            <RotateCcw
              size={14}
            />
            Reset progress
          </button>
        </div>
      </section>

      {/* ===================================================
          RESET MODAL
      =================================================== */}

      {showResetConfirm && (
        <div className="academy-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowResetConfirm(false); }}>
          <section className="academy-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="academy-reset-title">
            <button
              type="button"
              className="academy-modal-close"
              aria-label="Tutup dialog reset progress"
              onClick={() =>
                setShowResetConfirm(
                  false
                )
              }
            >
              <X
                size={18}
              />
            </button>

            <div className="academy-confirm-icon">
              <RotateCcw
                size={24}
              />
            </div>

            <h3 id="academy-reset-title">
              Reset progress?
            </h3>

            <p>
              XP, coins, skor terbaik,
              dan status misi yang sudah
              selesai akan dihapus dari
              perangkat ini.
            </p>

            <div className="academy-confirm-actions">
              <button
                type="button"
                onClick={() =>
                  setShowResetConfirm(
                    false
                  )
                }
              >
                Batal
              </button>

              <button
                type="button"
                onClick={
                  resetProgress
                }
              >
                Reset Progress
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

/* =========================================================
   MISSION CARD
========================================================= */

function MissionCard({
  mission,
  index,
  completed,
  bestScore,
  onClick,
}) {
  return (
    <article
      className={`academy-mission-card ${completed ? "is-completed" : ""}`}
      data-mission-index={index}
      role="button"
      tabIndex={0}
      aria-label={`Buka studi kasus ${mission.title}. Reward ${mission.xp} XP. Durasi ${mission.duration}.`}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <div className="academy-card-image">
        <img
          src={mission.asset}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
        />

        <div className="academy-card-number">
          {mission.number}
        </div>

        <div
          className={getDifficultyClass(
            mission.difficulty
          )}
        >
          {mission.difficultyLabel}
        </div>

        {completed && (
          <div className="academy-card-complete">
            <Check
              size={15}
            />
            SELESAI
          </div>
        )}

        <div className="academy-card-play" aria-hidden="true">
          <Play size={18} fill="currentColor" />
        </div>
      </div>

      <div className="academy-card-body">
        <div className="academy-card-category">
          {mission.category}
        </div>

        <h3>
          {mission.title}
        </h3>

        <p>
          {mission.shortDescription}
        </p>

        <div className="academy-card-context">
          {mission.context
            .slice(0, 2)
            .map(
              (
                item
              ) => (
                <span
                  key={item}
                >
                  {item}
                </span>
              )
            )}
        </div>

        <div className="academy-card-footer">
          <div className="academy-card-reward">
            <Zap
              size={15}
            />

            <strong>
              +{mission.xp}
            </strong>

            <span>
              XP
            </span>
          </div>

          <div className="academy-card-duration">
            <Gamepad2
              size={14}
            />

            {mission.duration}
          </div>

          <ChevronRight
            className="academy-card-arrow"
            size={18}
          />
        </div>

        {bestScore !==
          undefined && (
          <div className="academy-card-score">
            <Trophy
              size={13}
            />

            Skor terbaik{" "}
            <strong>
              {bestScore}
            </strong>
          </div>
        )}
      </div>
    </article>
  );
}

/* =========================================================
   PRACTICE MODAL
========================================================= */

function PracticeModal({
  mission,
  checked,
  onToggle,
  onFinish,
  onClose,
}) {
  const total =
    mission.practiceChecklist
      .length;

  const complete =
    checked.length === total;

  return (
    <div className="academy-modal-backdrop academy-modal-backdrop--practice" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="academy-practice-modal" role="dialog" aria-modal="true" aria-labelledby="academy-practice-title">
        <button
          type="button"
          className="academy-modal-close"
          aria-label="Tutup checklist praktik"
          onClick={onClose}
        >
          <X
            size={19}
          />
        </button>

        <div className="academy-practice-modal__hero">
          <div className="academy-practice-modal__icon">
            🌱
          </div>

          <div>
            <span>
              SAATNYA PRAKTIK
            </span>

            <h2 id="academy-practice-title">
              Bawa pelajaran ini ke dunia nyata.
            </h2>
          </div>
        </div>

        <div className="academy-practice-objective">
          <strong>
            Misi praktik
          </strong>

          <p>
            {
              mission.practiceIntro
            }
          </p>
        </div>

        <div className="academy-practice-checklist">
          <div className="academy-practice-checklist__header">
            <span>
              CHECKLIST
            </span>

            <strong>
              {checked.length}
              /
              {total}
            </strong>
          </div>

          {mission.practiceChecklist.map(
            (
              item,
              index
            ) => {
              const isChecked =
                checked.includes(
                  index
                );

              return (
                <button
                  type="button"
                  key={
                    item
                  }
                  className={`academy-check-item ${
                    isChecked
                      ? "is-checked"
                      : ""
                  }`}
                  onClick={() =>
                    onToggle(
                      index
                    )
                  }
                >
                  <span className="academy-check-box">
                    {isChecked && (
                      <Check
                        size={
                          15
                        }
                      />
                    )}
                  </span>

                  <span>
                    {item}
                  </span>
                </button>
              );
            }
          )}
        </div>

        <div className="academy-practice-tip">
          <Sparkles
            size={17}
          />

          <span>
            Tidak perlu sempurna.
            Yang penting kamu
            benar-benar mencoba
            mengamati dan mencatat.
          </span>
        </div>

        <button
          type="button"
          className="academy-practice-finish"
          disabled={!complete}
          onClick={() => {
            onFinish();
            onClose();
          }}
        >
          {complete ? (
            <>
              <Check
                size={19}
              />
              Praktik Selesai
            </>
          ) : (
            <>
              <Lock
                size={17}
              />
              Selesaikan checklist
            </>
          )}
        </button>
      </section>
    </div>
  );
}