import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Eye,
  Gamepad2,
  Leaf,
  RotateCcw,
  Sparkles,
  Sprout,
  Trophy,
  X,
  Zap,
} from "lucide-react";

import "../../css/academy/BibitGame.css";

/**
 * =========================================================
 * BIBIT GAME
 * =========================================================
 *
 * FLOW
 *
 * INTRO
 *   ↓
 * OBSERVE
 *   ↓
 * COMPARE
 *   ↓
 * CHOOSE
 *   ↓
 * CONSEQUENCE
 *   ↓
 * DISCUSSION
 *   ↓
 * COMPLETE
 *
 * Parent:
 *
 * <BibitGame
 *   mission={mission}
 *   onEntityObserved={fn}
 *   onObservationComplete={fn}
 *   onResult={fn}
 *   onComplete={fn}
 *   onExit={fn}
 * />
 *
 * =========================================================
 */

const PHASES = {
  INTRO: "intro",
  OBSERVE: "observe",
  CHOOSE: "choose",
  RESULT: "result",
  DISCUSSION: "discussion",
};

const DEFAULT_RESULT = {
  score: 0,
  xp: 0,
  coins: 0,
};

function clamp(value, min, max) {
  return Math.min(
    Math.max(value, min),
    max
  );
}

function getMissionChoice(
  mission,
  choiceId
) {
  return (
    mission?.choices?.find(
      (choice) =>
        choice.id === choiceId
    ) || null
  );
}

/* =========================================================
   COMPONENT
========================================================= */

export default function BibitGame({
  mission,
  onEntityObserved,
  onObservationComplete,
  onResult,
  onComplete,
  onExit,
}) {
  const safeMission =
    mission || {};

  const entities =
    safeMission.entities ||
    [];

  const choices =
    safeMission.choices ||
    [];

  const [
    phase,
    setPhase,
  ] = useState(
    PHASES.INTRO
  );

  const [
    selectedEntity,
    setSelectedEntity,
  ] = useState(null);

  const [
    observedIds,
    setObservedIds,
  ] = useState([]);

  const [
    selectedChoice,
    setSelectedChoice,
  ] = useState(null);

  const [
    result,
    setResult,
  ] = useState(
    DEFAULT_RESULT
  );

  const [
    showHint,
    setShowHint,
  ] = useState(false);

  const [
    dialogueIndex,
    setDialogueIndex,
  ] = useState(0);

  const [
    revealChoice,
    setRevealChoice,
  ] = useState(null);

  const [
    finished,
    setFinished,
  ] = useState(false);

  const [
    animationKey,
    setAnimationKey,
  ] = useState(0);

  const completionCalled =
    useRef(false);

  /* =======================================================
     INTRO NARRATIVE
  ======================================================= */

  const introNarrative =
    useMemo(
      () => [
        {
          speaker:
            "KAMU",
          text:
            "Hari ini kamu akan memindahkan bibit cabai ke lahan.",
        },
        {
          speaker:
            "PETANI SENIOR",
          text:
            "Sebelum memilih, jangan hanya lihat mana yang paling tinggi.",
        },
        {
          speaker:
            "PETANI SENIOR",
          text:
            "Tanaman yang terlihat besar belum tentu paling siap ditanam.",
        },
      ],
      []
    );

  const currentDialogue =
    introNarrative[
      dialogueIndex
    ];

  /* =======================================================
     RESET
  ======================================================= */

  const resetGame =
    useCallback(() => {
      completionCalled.current =
        false;

      setPhase(
        PHASES.INTRO
      );

      setSelectedEntity(
        null
      );

      setObservedIds(
        []
      );

      setSelectedChoice(
        null
      );

      setResult(
        DEFAULT_RESULT
      );

      setShowHint(
        false
      );

      setDialogueIndex(
        0
      );

      setRevealChoice(
        null
      );

      setFinished(
        false
      );

      setAnimationKey(
        (value) =>
          value + 1
      );
    }, []);

  /* =======================================================
     INTRO
  ======================================================= */

  const nextDialogue =
    useCallback(() => {
      if (
        dialogueIndex <
        introNarrative.length -
          1
      ) {
        setDialogueIndex(
          (value) =>
            value + 1
        );

        return;
      }

      setPhase(
        PHASES.OBSERVE
      );
    }, [
      dialogueIndex,
      introNarrative.length,
    ]);

  /* =======================================================
     OBSERVATION
  ======================================================= */

  const handleEntityClick =
    useCallback(
      (entity) => {
        if (!entity) {
          return;
        }

        setSelectedEntity(
          entity.id
        );

        setObservedIds(
          (previous) => {
            if (
              previous.includes(
                entity.id
              )
            ) {
              return previous;
            }

            const next = [
              ...previous,
              entity.id,
            ];

            if (
              onEntityObserved
            ) {
              onEntityObserved(
                entity
              );
            }

            return next;
          }
        );

        setShowHint(
          false
        );
      },
      [onEntityObserved]
    );

  const allObserved =
    entities.length > 0 &&
    observedIds.length >=
      entities.length;

  const continueToChoice =
    useCallback(() => {
      if (!allObserved) {
        setShowHint(
          true
        );

        return;
      }

      if (
        onObservationComplete
      ) {
        onObservationComplete({
          observed:
            observedIds,
        });
      }

      setPhase(
        PHASES.CHOOSE
      );

      setSelectedEntity(
        null
      );

      setAnimationKey(
        (value) =>
          value + 1
      );
    }, [
      allObserved,
      observedIds,
      onObservationComplete,
    ]);

  /* =======================================================
     CHOICE
  ======================================================= */

  const handleChoice =
    useCallback(
      (choice) => {
        if (!choice) {
          return;
        }

        setSelectedChoice(
          choice.id
        );

        setRevealChoice(
          choice.id
        );

        setResult({
          score:
            Number(
              choice.score || 0
            ),
          xp:
            Number(
              choice.xp ||
                safeMission.xp ||
                0
            ),
          coins:
            Number(
              choice.coins || 0
            ),
        });

        if (onResult) {
          onResult({
            score:
              Number(
                choice.score || 0
              ),
            xp:
              Number(
                choice.xp ||
                  safeMission.xp ||
                  0
              ),
            coins:
              Number(
                choice.coins || 0
              ),
            choice:
              choice.id,
          });
        }

        setPhase(
          PHASES.RESULT
        );

        setAnimationKey(
          (value) =>
            value + 1
        );
      },
      [
        onResult,
        safeMission.xp,
      ]
    );

  /* =======================================================
     RESULT
  ======================================================= */

  const continueToDiscussion =
    useCallback(() => {
      setPhase(
        PHASES.DISCUSSION
      );

      setAnimationKey(
        (value) =>
          value + 1
      );
    }, []);

  /* =======================================================
     COMPLETE
  ======================================================= */

  const completeGame =
    useCallback(() => {
      if (
        completionCalled.current
      ) {
        return;
      }

      completionCalled.current =
        true;

      setFinished(
        true
      );

      const choice =
        getMissionChoice(
          safeMission,
          selectedChoice
        );

      const finalResult = {
        score:
          Number(
            result.score || 0
          ),

        xp:
          Number(
            result.xp ||
              choice?.xp ||
              safeMission.xp ||
              0
          ),

        coins:
          Number(
            result.coins ||
              choice?.coins ||
              0
          ),

        choice:
          selectedChoice,

        missionId:
          safeMission.id,

        observed:
          observedIds,
      };

      /*
       * onComplete dipanggil PALING AKHIR.
       *
       * Academy.jsx akan:
       * - menyimpan reward
       * - menandai mission selesai
       * - menutup game
       * - kembali ke Academy
       */
      if (onComplete) {
        onComplete(
          finalResult
        );
      }
    }, [
      onComplete,
      observedIds,
      result,
      safeMission,
      selectedChoice,
    ]);

  /* =======================================================
     KEYBOARD
  ======================================================= */

  useEffect(() => {
    const handleKeyDown =
      (event) => {
        if (
          event.key ===
          "Escape"
        ) {
          if (
            phase ===
            PHASES.INTRO
          ) {
            onExit?.();
          }
        }

        if (
          event.key ===
          "Enter"
        ) {
          if (
            phase ===
            PHASES.INTRO
          ) {
            nextDialogue();
          }

          if (
            phase ===
            PHASES.OBSERVE &&
            allObserved
          ) {
            continueToChoice();
          }

          if (
            phase ===
              PHASES.RESULT &&
            revealChoice
          ) {
            continueToDiscussion();
          }
        }
      };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    allObserved,
    continueToChoice,
    continueToDiscussion,
    nextDialogue,
    onExit,
    phase,
    revealChoice,
  ]);

  /* =======================================================
     EMPTY STATE
  ======================================================= */

  if (!mission) {
    return (
      <div className="bibit-game bibit-game--empty">
        <div>
          <Sprout
            size={36}
          />

          <h2>
            Studi kasus tidak
            ditemukan
          </h2>

          <button
            type="button"
            onClick={
              onExit
            }
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <div
      key={animationKey}
      className={`bibit-game bibit-game--${phase}`}
    >
      {/* ===================================================
          BACKGROUND
      =================================================== */}

      <div
        className="bibit-game__background"
        aria-hidden="true"
      >
        <div className="bibit-cloud bibit-cloud--one" />
        <div className="bibit-cloud bibit-cloud--two" />
        <div className="bibit-sun" />

        <div className="bibit-field">
          <div className="bibit-field__row bibit-field__row--one" />
          <div className="bibit-field__row bibit-field__row--two" />
          <div className="bibit-field__row bibit-field__row--three" />
        </div>
      </div>

      {/* ===================================================
          TOP BAR
      =================================================== */}

      <header className="bibit-topbar">
        <button
          type="button"
          className="bibit-exit"
          onClick={
            onExit
          }
          aria-label="Keluar dari game"
        >
          <ArrowLeft
            size={18}
          />

          <span>
            Academy
          </span>
        </button>

        <div className="bibit-topbar__mission">
          <span>
            STUDI KASUS
          </span>

          <strong>
            {
              safeMission.title
            }
          </strong>
        </div>

        <div className="bibit-topbar__xp">
          <Zap
            size={16}
          />

          <span>
            +{
              safeMission.xp ||
              0
            } XP
          </span>
        </div>
      </header>

      {/* ===================================================
          INTRO
      =================================================== */}

      {phase ===
        PHASES.INTRO && (
        <section className="bibit-intro">
          <div className="bibit-intro__illustration">
            <div className="bibit-intro__glow" />

            <div className="bibit-intro__plant">
              <div className="bibit-pot">
                <div className="bibit-pot__soil" />
              </div>

              <div className="bibit-stem" />

              <div className="bibit-leaf bibit-leaf--left" />
              <div className="bibit-leaf bibit-leaf--right" />

              <div className="bibit-leaf bibit-leaf--top" />
            </div>

            <div className="bibit-floating-tag">
              <Sparkles
                size={15}
              />

              <span>
                Misi Pembibitan
              </span>
            </div>
          </div>

          <div className="bibit-intro__content">
            <div className="bibit-kicker">
              <Gamepad2
                size={15}
              />

              MINI CASE 02
            </div>

            <h1>
              {
                safeMission.title
              }
            </h1>

            <p className="bibit-intro__description">
              {
                safeMission.shortDescription
              }
            </p>

            <div className="bibit-story-card">
              <div className="bibit-story-avatar">
                🧑‍🌾
              </div>

              <div>
                <span>
                  {
                    currentDialogue
                      ?.speaker
                  }
                </span>

                <p>
                  {
                    currentDialogue
                      ?.text
                  }
                </p>
              </div>
            </div>

            <div className="bibit-dialogue-progress">
              {introNarrative.map(
                (
                  _,
                  index
                ) => (
                  <span
                    key={
                      index
                    }
                    className={
                      index <=
                      dialogueIndex
                        ? "is-active"
                        : ""
                    }
                  />
                )
              )}
            </div>

            <button
              type="button"
              className="bibit-primary-button"
              onClick={
                nextDialogue
              }
            >
              <span>
                {dialogueIndex <
                introNarrative.length -
                  1
                  ? "Lanjut"
                  : "Mulai Mengamati"}
              </span>

              <ArrowRight
                size={19}
              />
            </button>
          </div>
        </section>
      )}

      {/* ===================================================
          OBSERVE
      =================================================== */}

      {phase ===
        PHASES.OBSERVE && (
        <section className="bibit-observe">
          <div className="bibit-section-heading">
            <div>
              <span>
                LANGKAH 01 · AMATI
              </span>

              <h2>
                Jangan buru-buru
                memilih.
              </h2>

              <p>
                Tap setiap bibit untuk
                mencari petunjuk. Kamu
                perlu mengumpulkan semua
                bukti sebelum mengambil
                keputusan.
              </p>
            </div>

            <div className="bibit-observe-counter">
              <Eye
                size={18}
              />

              <strong>
                {
                  observedIds.length
                }
                /
                {
                  entities.length
                }
              </strong>

              <span>
                diamati
              </span>
            </div>
          </div>

          {/* ===============================================
              VISUAL BIBIT
          =============================================== */}

          <div className="bibit-plants-stage">
            {entities.map(
              (
                entity,
                index
              ) => {
                const observed =
                  observedIds.includes(
                    entity.id
                  );

                const selected =
                  selectedEntity ===
                  entity.id;

                return (
                  <button
                    key={
                      entity.id
                    }
                    type="button"
                    className={`bibit-plant-card bibit-plant-card--${index + 1} ${
                      observed
                        ? "is-observed"
                        : ""
                    } ${
                      selected
                        ? "is-selected"
                        : ""
                    }`}
                    onClick={() =>
                      handleEntityClick(
                        entity
                      )
                    }
                  >
                    <div className="bibit-plant-card__number">
                      {
                        index +
                        1
                      }
                    </div>

                    <div className="bibit-plant-visual">
                      <div className="bibit-plant__leaves">
                        <span />
                        <span />
                        <span />
                        <span />
                      </div>

                      <div className="bibit-plant__stem" />

                      <div className="bibit-plant__soil" />

                      <div className="bibit-plant__pot" />
                    </div>

                    <div className="bibit-plant-card__label">
                      <strong>
                        {
                          entity.label
                        }
                      </strong>

                      <span>
                        Tap untuk
                        mengamati
                      </span>
                    </div>

                    {observed && (
                      <div className="bibit-observed-badge">
                        <Check
                          size={13}
                        />

                        DITEMUKAN
                      </div>
                    )}
                  </button>
                );
              }
            )}
          </div>

          {/* ===============================================
              OBSERVATION DETAIL
          =============================================== */}

          <div className="bibit-observation-panel">
            {!selectedEntity ? (
              <div className="bibit-observation-empty">
                <Eye
                  size={22}
                />

                <div>
                  <strong>
                    Cari petunjuk
                  </strong>

                  <span>
                    Pilih salah satu
                    bibit untuk melihat
                    kondisinya.
                  </span>
                </div>
              </div>
            ) : (
              (() => {
                const entity =
                  entities.find(
                    (item) =>
                      item.id ===
                      selectedEntity
                  );

                if (!entity) {
                  return null;
                }

                return (
                  <div className="bibit-observation-detail">
                    <div className="bibit-observation-detail__icon">
                      🌱
                    </div>

                    <div className="bibit-observation-detail__copy">
                      <span>
                        {
                          entity.subtitle
                        }
                      </span>

                      <strong>
                        {
                          entity.metric
                        }
                      </strong>

                      <p>
                        {
                          entity.detail
                        }
                      </p>
                    </div>

                    <div className="bibit-observation-found">
                      <Check
                        size={17}
                      />

                      Petunjuk
                      ditemukan
                    </div>
                  </div>
                );
              })()
            )}
          </div>

          {showHint && (
            <div className="bibit-hint">
              <Sparkles
                size={17}
              />

              <span>
                Amati semua bibit dulu.
                Petani yang baik tidak
                mengambil keputusan hanya
                dari satu tanda.
              </span>
            </div>
          )}

          <button
            type="button"
            className="bibit-primary-button bibit-primary-button--wide"
            disabled={!allObserved}
            onClick={
              continueToChoice
            }
          >
            <span>
              {allObserved
                ? "Saya Sudah Mengamati"
                : `Amati ${
                    entities.length -
                    observedIds.length
                  } bibit lagi`}
            </span>

            <ArrowRight
              size={19}
            />
          </button>
        </section>
      )}

      {/* ===================================================
          CHOOSE
      =================================================== */}

      {phase ===
        PHASES.CHOOSE && (
        <section className="bibit-choice">
          <div className="bibit-choice__top">
            <div className="bibit-choice__visual">
              <div className="bibit-choice__sun">
                ☀️
              </div>

              <div className="bibit-choice__field">
                <div className="bibit-mini-plant">
                  <span />
                  <span />
                  <span />
                  <i />
                </div>

                <div className="bibit-mini-plant bibit-mini-plant--two">
                  <span />
                  <span />
                  <span />
                  <i />
                </div>

                <div className="bibit-mini-plant bibit-mini-plant--three">
                  <span />
                  <span />
                  <span />
                  <i />
                </div>
              </div>
            </div>

            <div className="bibit-choice__heading">
              <span>
                LANGKAH 02 · PUTUSKAN
              </span>

              <h2>
                Mana yang paling
                siap ditanam?
              </h2>

              <p>
                Kamu sudah mengamati
                ketiganya. Sekarang
                gunakan bukti yang kamu
                temukan.
              </p>
            </div>
          </div>

          <div className="bibit-choice__question">
            <div>
              <Sparkles
                size={18}
              />

              <span>
                Tantangan
              </span>
            </div>

            <strong>
              {
                safeMission.question
              }
            </strong>
          </div>

          <div className="bibit-choice-grid">
            {choices.map(
              (
                choice,
                index
              ) => (
                <button
                  type="button"
                  key={
                    choice.id
                  }
                  className="bibit-choice-card"
                  onClick={() =>
                    handleChoice(
                      choice
                    )
                  }
                >
                  <div className="bibit-choice-card__visual">
                    <div className="bibit-choice-plant">
                      <span className="leaf leaf--one" />
                      <span className="leaf leaf--two" />
                      <span className="leaf leaf--three" />
                      <span className="stem" />
                      <span className="soil" />
                      <span className="pot" />
                    </div>

                    <div className="bibit-choice-number">
                      {String.fromCharCode(
                        65 +
                          index
                      )}
                    </div>
                  </div>

                  <div className="bibit-choice-card__body">
                    <strong>
                      {
                        choice.label
                      }
                    </strong>

                    <p>
                      {
                        choice.description
                      }
                    </p>

                    <span>
                      Pilih ini
                      <ChevronRight
                        size={15}
                      />
                    </span>
                  </div>
                </button>
              )
            )}
          </div>

          <div className="bibit-choice-tip">
            💡
            <span>
              Tidak perlu mencari
              jawaban yang terlihat
              paling besar. Tanyakan:
              <strong>
                "Apa buktinya?"
              </strong>
            </span>
          </div>
        </section>
      )}

      {/* ===================================================
          RESULT
      =================================================== */}

      {phase ===
        PHASES.RESULT &&
        revealChoice && (
          <section className="bibit-result">
            <div className="bibit-result__confetti">
              <span>✦</span>
              <span>✧</span>
              <span>✦</span>
              <span>✧</span>
              <span>✦</span>
            </div>

            <div className="bibit-result__visual">
              <div className="bibit-result__sun">
                ☀️
              </div>

              <div className="bibit-result__ground" />

              <div className="bibit-result__plant">
                <div className="result-leaf result-leaf--one" />
                <div className="result-leaf result-leaf--two" />
                <div className="result-leaf result-leaf--three" />
                <div className="result-stem" />
                <div className="result-pot" />
              </div>

              <div className="bibit-result__badge">
                <Trophy
                  size={17}
                />

                Keputusanmu
              </div>
            </div>

            <div className="bibit-result__content">
              <div className="bibit-result__eyebrow">
                HASIL KEPUTUSAN
              </div>

              <h2>
                {result.score >=
                80
                  ? "Pilihan yang kuat! 🌱"
                  : result.score >=
                    50
                  ? "Pilihanmu masuk akal, tapi..."
                  : "Hmm, coba lihat lagi bukti yang ada."}
              </h2>

              <div className="bibit-score-card">
                <div>
                  <span>
                    SKOR
                  </span>

                  <strong>
                    {
                      result.score
                    }
                  </strong>
                  <small>
                    / 100
                  </small>
                </div>

                <div>
                  <span>
                    REWARD
                  </span>

                  <strong>
                    +{result.xp}
                  </strong>

                  <small>
                    XP
                  </small>
                </div>

                <div>
                  <span>
                    BONUS
                  </span>

                  <strong>
                    +{result.coins}
                  </strong>

                  <small>
                    🪙
                  </small>
                </div>
              </div>

              <div className="bibit-feedback-card">
                <div className="bibit-feedback-card__icon">
                  {result.score >=
                  80
                    ? "🎯"
                    : "💭"}
                </div>

                <div>
                  <span>
                    KONSEKUENSI
                  </span>

                  <p>
                    {
                      getMissionChoice(
                        safeMission,
                        selectedChoice
                      )?.feedback
                    }
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="bibit-primary-button bibit-primary-button--wide"
                onClick={
                  continueToDiscussion
                }
              >
                <span>
                  Lihat Pembahasan
                </span>

                <ArrowRight
                  size={19}
                />
              </button>
            </div>
          </section>
        )}

      {/* ===================================================
          DISCUSSION
      =================================================== */}

      {phase ===
        PHASES.DISCUSSION && (
        <section className="bibit-discussion">
          <div className="bibit-discussion__illustration">
            <div className="bibit-discussion__sun">
              ☀️
            </div>

            <div className="bibit-discussion__field">
              <div className="discussion-plant discussion-plant--bad">
                <span />
                <span />
                <i />
              </div>

              <div className="discussion-plant discussion-plant--good">
                <span />
                <span />
                <span />
                <span />
                <i />
              </div>

              <div className="discussion-ground" />
            </div>

            <div className="bibit-discussion__character">
              🧑‍🌾
            </div>

            <div className="bibit-discussion__bubble">
              <Sparkles
                size={15}
              />

              <span>
                Sekarang kamu tahu
                alasannya.
              </span>
            </div>
          </div>

          <div className="bibit-discussion__content">
            <div className="bibit-kicker">
              <Leaf
                size={15}
              />

              PEMBAHASAN
            </div>

            <h2>
              Jangan tertipu
              penampilan bibit.
            </h2>

            <p className="bibit-discussion__lead">
              Dalam kasus ini, kunci
              keputusan bukan sekadar
              ukuran tanaman. Kamu perlu
              melihat kondisi tanaman
              secara keseluruhan.
            </p>

            <div className="bibit-learning-card">
              <div className="bibit-learning-card__icon">
                🧠
              </div>

              <div>
                <span>
                  YANG PERLU DIINGAT
                </span>

                <strong>
                  {
                    getMissionChoice(
                      safeMission,
                      selectedChoice
                    )?.learning
                  }
                </strong>
              </div>
            </div>

            <div className="bibit-comparison">
              {entities.map(
                (
                  entity,
                  index
                ) => (
                  <div
                    key={
                      entity.id
                    }
                    className={`bibit-comparison-item ${
                      selectedChoice ===
                      entity.id
                        ? "is-selected"
                        : ""
                    }`}
                  >
                    <div className="bibit-comparison-number">
                      {
                        String.fromCharCode(
                          65 +
                            index
                        )
                      }
                    </div>

                    <div>
                      <strong>
                        {
                          entity.label
                        }
                      </strong>

                      <span>
                        {
                          entity.metric
                        }
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>

            <div className="bibit-final-message">
              <div>
                <Trophy
                  size={21}
                />
              </div>

              <p>
                Kamu tidak harus langsung
                tahu semuanya. Yang penting
                adalah belajar membaca bukti
                sebelum mengambil keputusan.
              </p>
            </div>

            <button
              type="button"
              className="bibit-complete-button"
              onClick={
                completeGame
              }
              disabled={finished}
            >
              {finished ? (
                <>
                  <Check
                    size={19}
                  />

                  Menyelesaikan...
                </>
              ) : (
                <>
                  <Trophy
                    size={19}
                  />

                  Selesaikan Studi Kasus
                </>
              )}
            </button>

            <button
              type="button"
              className="bibit-replay-button"
              onClick={
                resetGame
              }
            >
              <RotateCcw
                size={15}
              />

              Mainkan ulang
            </button>
          </div>
        </section>
      )}

      {/* ===================================================
          MOBILE NAVIGATION
      =================================================== */}

      <footer className="bibit-mobile-footer">
        <div className="bibit-mobile-footer__status">
          <span>
            {phase ===
              PHASES.INTRO &&
              "Cerita"}

            {phase ===
              PHASES.OBSERVE &&
              `Observasi ${observedIds.length}/${entities.length}`}

            {phase ===
              PHASES.CHOOSE &&
              "Ambil keputusan"}

            {phase ===
              PHASES.RESULT &&
              "Lihat konsekuensi"}

            {phase ===
              PHASES.DISCUSSION &&
              "Pembahasan"}
          </span>

          <div>
            <i
              className={
                phase ===
                PHASES.INTRO
                  ? "is-active"
                  : ""
              }
            />

            <i
              className={
                phase ===
                PHASES.OBSERVE
                  ? "is-active"
                  : ""
              }
            />

            <i
              className={
                phase ===
                PHASES.CHOOSE
                  ? "is-active"
                  : ""
              }
            />

            <i
              className={
                phase ===
                PHASES.RESULT
                  ? "is-active"
                  : ""
              }
            />

            <i
              className={
                phase ===
                PHASES.DISCUSSION
                  ? "is-active"
                  : ""
              }
            />
          </div>
        </div>
      </footer>
    </div>
  );
}