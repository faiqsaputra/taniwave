import { useCallback, useEffect, useRef, useState } from "react";
import Phaser from "phaser";

/**
 * =========================================================
 * TANIWAVE SMART ACADEMY
 * PhaserGame.jsx v2
 *
 * Fokus:
 * - Mobile landscape
 * - 16:9 game viewport
 * - Fullscreen support
 * - Screen Orientation API
 * - Touch friendly
 * - Desktop tetap normal
 * - React <-> Phaser bridge
 * =========================================================
 */

const COLORS = {
  sky: 0xb7d39f,
  skyLight: 0xdcebd0,
  ground: 0x739763,
  groundDark: 0x557b56,
  soil: 0x8c6747,
  soilDark: 0x6d4d35,

  green: 0x55745b,
  greenDark: 0x385541,

  gold: 0xc89b3c,
  goldLight: 0xe4c875,

  white: 0xfffdf8,
  ink: 0x24332b,
  muted: 0x718078,

  water: 0x72b7d9,
  waterDark: 0x4c91b8,

  red: 0xd95d4f,
};

const ENTITY_ICONS = {
  soil: "💧",
  plant: "🌶️",
  drainage: "🚰",
  seedling: "🌱",
  market: "🏪",
  harvest: "🧺",
  cost: "💰",
};

const RESULT_COLORS = {
  excellent: 0x55745b,
  partial: 0xc89b3c,
  poor: 0xd95d4f,
};

const GAME_WIDTH = 960;
const GAME_HEIGHT = 540;
const GAME_RATIO = GAME_WIDTH / GAME_HEIGHT;

function safeNumber(value, fallback = 50) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return Math.max(0, Math.min(100, number));
}

function getEntityIcon(entity) {
  return ENTITY_ICONS[entity?.type] || "🔎";
}

/* =========================================================
   ORIENTATION HELPERS
========================================================= */

function isMobileDevice() {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.matchMedia("(pointer: coarse)").matches ||
    /Android|iPhone|iPad|iPod/i.test(
      navigator.userAgent
    )
  );
}

function isPortrait() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.innerHeight > window.innerWidth;
}

async function requestLandscape() {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    /*
     * Fullscreen terlebih dahulu.
     *
     * Sebagian browser hanya mengizinkan
     * orientation.lock() setelah fullscreen.
     */
    const element = document.documentElement;

    if (
      !document.fullscreenElement &&
      element.requestFullscreen
    ) {
      await element.requestFullscreen();
    }
  } catch (error) {
    console.info(
      "Fullscreen tidak tersedia:",
      error
    );
  }

  try {
    if (
      screen.orientation &&
      screen.orientation.lock
    ) {
      await screen.orientation.lock(
        "landscape"
      );

      return true;
    }
  } catch (error) {
    console.info(
      "Orientation lock tidak tersedia:",
      error
    );
  }

  return false;
}

async function exitGameFullscreen() {
  try {
    if (
      document.fullscreenElement &&
      document.exitFullscreen
    ) {
      await document.exitFullscreen();
    }
  } catch (error) {
    console.info(
      "Gagal keluar fullscreen:",
      error
    );
  }

  try {
    if (
      screen.orientation &&
      screen.orientation.unlock
    ) {
      screen.orientation.unlock();
    }
  } catch (error) {
    console.info(
      "Gagal unlock orientation:",
      error
    );
  }
}

/* =========================================================
   PHASER SCENE
========================================================= */

class AcademyScene extends Phaser.Scene {
  constructor() {
    super("AcademyScene");

    this.mission = null;
    this.callbacks = {};

    this.entityObjects = [];
    this.observedEntities = new Set();

    this.selectedEntity = null;

    this.gameState = "observation";

    this.width = GAME_WIDTH;
    this.height = GAME_HEIGHT;

    this.scaleFactor = 1;
  }

  init(data) {
    this.mission = data?.mission || {};
    this.callbacks = data?.callbacks || {};

    this.entityObjects = [];
    this.observedEntities = new Set();

    this.selectedEntity = null;

    this.gameState = "observation";
  }

  create() {
    this.width = GAME_WIDTH;
    this.height = GAME_HEIGHT;

    this.createWorld();
    this.createHeader();
    this.createFarmer();
    this.createMissionEntities();
    this.createInstruction();

    this.scale.on(
      "resize",
      this.handleResize,
      this
    );

    this.events.once(
      "shutdown",
      () => {
        this.scale.off(
          "resize",
          this.handleResize,
          this
        );
      }
    );

    this.events.once(
      "destroy",
      () => {
        this.scale.off(
          "resize",
          this.handleResize,
          this
        );
      }
    );
  }

  /* =======================================================
     WORLD
  ======================================================= */

  createWorld() {
    const width = GAME_WIDTH;
    const height = GAME_HEIGHT;

    /*
     * Background
     */
    this.add
      .rectangle(
        width / 2,
        height / 2,
        width,
        height,
        COLORS.sky
      )
      .setOrigin(0.5);

    /*
     * Sun
     */
    this.add
      .circle(
        width - 85,
        70,
        34,
        COLORS.goldLight
      )
      .setAlpha(0.9);

    /*
     * Clouds
     */
    this.createCloud(115, 80, 0.9);
    this.createCloud(
      width * 0.56,
      100,
      0.7
    );

    /*
     * Hills
     */
    this.add
      .ellipse(
        width * 0.25,
        height * 0.52,
        width * 0.72,
        height * 0.28,
        0x8eb17b
      );

    this.add
      .ellipse(
        width * 0.78,
        height * 0.54,
        width * 0.78,
        height * 0.3,
        0x86a974
      );

    /*
     * Main field
     */
    this.add
      .ellipse(
        width / 2,
        height * 0.76,
        width * 1.2,
        height * 0.48,
        COLORS.ground
      );

    /*
     * Soil
     */
    this.createSoilBed(
      width * 0.12,
      height * 0.64,
      width * 0.76,
      height * 0.2
    );

    /*
     * Soil rows
     */
    for (let i = 0; i < 4; i += 1) {
      this.add
        .rectangle(
          width * 0.18,
          height * 0.62 +
            i * 22,
          width * 0.64,
          4,
          COLORS.soilDark
        )
        .setAlpha(0.25);
    }

    /*
     * Grass
     */
    for (let i = 0; i < 18; i += 1) {
      const x =
        Phaser.Math.Between(
          25,
          width - 25
        );

      const y =
        Phaser.Math.Between(
          height * 0.58,
          height * 0.92
        );

      this.createGrass(x, y);
    }

    /*
     * Rain puddles
     */
    if (
      this.mission.id ===
      "cabai-hujan"
    ) {
      this.createPuddle(
        width * 0.19,
        height * 0.73
      );

      this.createPuddle(
        width * 0.81,
        height * 0.73
      );
    }
  }

  createCloud(x, y, scale = 1) {
    const cloud =
      this.add.container(x, y);

    const parts = [
      [-28, 8, 18],
      [-8, -4, 25],
      [18, 4, 20],
      [38, 9, 14],
    ];

    parts.forEach(
      ([dx, dy, radius]) => {
        cloud.add(
          this.add
            .circle(
              dx * scale,
              dy * scale,
              radius * scale,
              COLORS.white
            )
            .setAlpha(0.65)
        );
      }
    );

    return cloud;
  }

  createSoilBed(
    x,
    y,
    width,
    height
  ) {
    this.add
      .ellipse(
        x + width / 2,
        y,
        width,
        height,
        COLORS.soil
      )
      .setAlpha(0.95);

    this.add
      .ellipse(
        x + width / 2,
        y - 5,
        width * 0.95,
        height * 0.65,
        0x9b7450
      )
      .setAlpha(0.6);
  }

  createGrass(x, y) {
    const graphics =
      this.add.graphics();

    graphics.lineStyle(
      2,
      0x3f6946,
      0.65
    );

    graphics.beginPath();

    graphics.moveTo(
      x,
      y + 5
    );

    graphics.lineTo(
      x - 3,
      y - 5
    );

    graphics.moveTo(
      x,
      y + 5
    );

    graphics.lineTo(
      x + 3,
      y - 4
    );

    graphics.strokePath();
  }

  createPuddle(x, y) {
    const puddle =
      this.add
        .ellipse(
          x,
          y,
          95,
          26,
          COLORS.water
        )
        .setAlpha(0.42);

    puddle.setInteractive(
      new Phaser.Geom.Ellipse(
        0,
        0,
        95,
        26
      ),
      Phaser.Geom.Ellipse.Contains
    );

    puddle.on(
      "pointerdown",
      () => {
        this.flashMessage(
          "💧 Genangan terdeteksi",
          COLORS.waterDark
        );
      }
    );
  }

  /* =======================================================
     FARMER
  ======================================================= */

  createFarmer() {
    const x =
      GAME_WIDTH * 0.5;

    const y =
      GAME_HEIGHT * 0.73;

    const farmer =
      this.add.container(
        x,
        y
      );

    /*
     * Shadow
     */
    farmer.add(
      this.add
        .ellipse(
          0,
          40,
          55,
          15,
          0x26352a
        )
        .setAlpha(0.18)
    );

    /*
     * Body
     */
    farmer.add(
      this.add.ellipse(
        0,
        5,
        42,
        55,
        COLORS.greenDark
      )
    );

    /*
     * Head
     */
    farmer.add(
      this.add.circle(
        0,
        -35,
        25,
        0xc8875c
      )
    );

    /*
     * Hat
     */
    farmer.add(
      this.add.ellipse(
        0,
        -58,
        62,
        17,
        COLORS.gold
      )
    );

    farmer.add(
      this.add.rectangle(
        0,
        -66,
        32,
        20,
        COLORS.gold
      )
    );

    /*
     * Eyes
     */
    farmer.add(
      this.add.circle(
        -8,
        -35,
        2.5,
        COLORS.ink
      )
    );

    farmer.add(
      this.add.circle(
        8,
        -35,
        2.5,
        COLORS.ink
      )
    );

    /*
     * Basket
     */
    farmer.add(
      this.add
        .rectangle(
          30,
          8,
          22,
          17,
          COLORS.gold
        )
        .setRotation(-0.15)
    );

    farmer.setDepth(20);

    this.farmer = farmer;
  }

  /* =======================================================
     ENTITIES
  ======================================================= */

  createMissionEntities() {
    const entities =
      Array.isArray(
        this.mission.entities
      )
        ? this.mission.entities
        : [];

    entities.forEach(
      (entity, index) => {
        this.createEntity(
          entity,
          index,
          entities.length
        );
      }
    );
  }

  createEntity(
    entity,
    index,
    total
  ) {
    /*
     * Default positions.
     *
     * Kita sengaja menggunakan
     * logical 960x540 canvas.
     */
    const positions = [
      {
        x: 20,
        y: 55,
      },
      {
        x: 50,
        y: 51,
      },
      {
        x: 80,
        y: 55,
      },
    ];

    const fallback =
      positions[index] ||
      positions[
        positions.length - 1
      ];

    const position =
      entity.position ||
      fallback;

    const x =
      GAME_WIDTH *
      (safeNumber(
        position.x,
        fallback.x
      ) / 100);

    const y =
      GAME_HEIGHT *
      (safeNumber(
        position.y,
        fallback.y
      ) / 100);

    const container =
      this.add.container(
        x,
        y
      );

    /*
     * Highlight ring
     */
    const ring =
      this.add
        .circle(
          0,
          0,
          38,
          COLORS.gold
        )
        .setAlpha(0.12);

    container.add(ring);

    /*
     * Icon
     */
    const icon =
      this.add
        .text(
          0,
          0,
          getEntityIcon(entity),
          {
            fontFamily:
              "Arial, sans-serif",
            fontSize: "46px",
            align: "center",
          }
        )
        .setOrigin(0.5);

    container.add(icon);

    /*
     * Label
     */
    const labelWidth =
      Math.max(
        76,
        Math.min(
          150,
          entity.label.length * 8
        )
      );

    const labelBackground =
      this.add
        .rectangle(
          0,
          48,
          labelWidth,
          24,
          COLORS.white
        )
        .setStrokeStyle(
          1,
          COLORS.ink,
          0.1
        )
        .setAlpha(0.96);

    container.add(
      labelBackground
    );

    const label =
      this.add
        .text(
          0,
          48,
          entity.label,
          {
            fontFamily:
              "Inter, Arial, sans-serif",
            fontSize: "11px",
            fontStyle: "bold",
            color: "#24332b",
            align: "center",
          }
        )
        .setOrigin(0.5);

    container.add(label);

    /*
     * Touch hit area dibuat lebih besar
     * supaya nyaman di layar HP.
     */
    container.setSize(
      110,
      110
    );

    container.setInteractive(
      new Phaser.Geom.Rectangle(
        -55,
        -35,
        110,
        110
      ),
      Phaser.Geom.Rectangle.Contains
    );

    container.input.cursor =
      "pointer";

    /*
     * Desktop hover
     */
    container.on(
      "pointerover",
      () => {
        if (
          this.observedEntities.has(
            entity.id
          )
        ) {
          return;
        }

        container.setScale(
          1.08
        );

        ring.setAlpha(0.25);
      }
    );

    container.on(
      "pointerout",
      () => {
        container.setScale(1);

        if (
          !this.observedEntities.has(
            entity.id
          )
        ) {
          ring.setAlpha(
            0.12
          );
        }
      }
    );

    /*
     * Touch / click
     */
    container.on(
      "pointerdown",
      () => {
        this.observeEntity(
          entity,
          container,
          ring
        );
      }
    );

    container.setDepth(15);

    this.entityObjects.push({
      entity,
      container,
      ring,
      icon,
      label,
    });

    /*
     * Pulse
     */
    this.tweens.add({
      targets: ring,

      scale: {
        from: 1,
        to: 1.12,
      },

      alpha: {
        from: 0.12,
        to: 0.04,
      },

      duration: 1200,

      yoyo: true,
      repeat: -1,

      ease: "Sine.easeInOut",
    });
  }

  /* =======================================================
     OBSERVATION
  ======================================================= */

  observeEntity(
    entity,
    container,
    ring
  ) {
    if (
      this.observedEntities.has(
        entity.id
      )
    ) {
      this.showEntityDetail(
        entity
      );

      return;
    }

    this.observedEntities.add(
      entity.id
    );

    /*
     * Selected visual
     */
    ring.setFillStyle(
      COLORS.green,
      0.25
    );

    container.setScale(
      1.05
    );

    this.tweens.add({
      targets: container,
      scale: 1,
      duration: 180,
      ease: "Back.easeOut",
    });

    /*
     * Check
     */
    const check =
      this.add
        .text(
          30,
          -30,
          "✓",
          {
            fontFamily:
              "Arial, sans-serif",
            fontSize: "18px",
            fontStyle: "bold",
            color: "#55745b",
            backgroundColor:
              "#ffffff",
            padding: {
              left: 3,
              right: 3,
              top: 1,
              bottom: 1,
            },
          }
        )
        .setOrigin(0.5);

    container.add(check);

    this.showEntityDetail(
      entity
    );

    this.updateObservationProgress();

    const required =
      this.getRequiredObservations();

    if (
      this.observedEntities.size >=
      required
    ) {
      this.enableDecision();
    }
  }

  showEntityDetail(entity) {
    this.callbacks.onEntityObserved?.(
      entity,
      this.observedEntities.size
    );

    this.createEntityPopup(
      entity
    );
  }

  getRequiredObservations() {
    const total =
      this.mission.entities
        ?.length || 0;

    return Math.min(
      2,
      total
    );
  }

  updateObservationProgress() {
    if (
      !this.progressText
    ) {
      return;
    }

    const total =
      this.getRequiredObservations();

    const current =
      Math.min(
        this.observedEntities.size,
        total
      );

    this.progressText.setText(
      `🔎 ${current}/${total} bukti`
    );
  }

  /* =======================================================
     DECISION
  ======================================================= */

  enableDecision() {
    if (
      this.gameState ===
      "decision"
    ) {
      return;
    }

    this.gameState =
      "decision";

    this.instructionText?.setText(
      "✓ Bukti cukup! Pilih keputusanmu."
    );

    this.flashMessage(
      "🔎 Observasi selesai!",
      COLORS.green
    );

    this.callbacks.onObservationComplete?.(
      {
        observedIds: [
          ...this.observedEntities,
        ],
      }
    );
  }

  selectChoice(choice) {
    if (
      this.gameState !==
      "decision"
    ) {
      return;
    }

    this.gameState =
      "consequence";

    this.entityObjects.forEach(
      ({ container }) => {
        container.disableInteractive();
      }
    );

    this.showConsequence(
      choice
    );

    this.time.delayedCall(
      1200,
      () => {
        this.finishMission(
          choice
        );
      }
    );
  }

  showConsequence(choice) {
    const result =
      choice.result ||
      "partial";

    const resultColor =
      RESULT_COLORS[result] ||
      COLORS.gold;

    let message =
      "Keputusanmu sedang diterapkan...";

    if (
      result === "excellent"
    ) {
      message =
        "🌱 Kondisi kebun membaik!";
    }

    if (
      result === "partial"
    ) {
      message =
        "🤔 Ada dampak yang perlu dipertimbangkan.";
    }

    if (
      result === "poor"
    ) {
      message =
        "⚠️ Kondisi tanaman berisiko memburuk.";
    }

    this.flashMessage(
      message,
      resultColor
    );

    this.animateConsequence(
      choice
    );
  }

  animateConsequence(choice) {
    if (
      this.mission.id ===
        "cabai-hujan" &&
      choice.id ===
        "drain"
    ) {
      this.createDrainageAnimation();
      return;
    }

    if (
      this.mission.id ===
        "cabai-hujan" &&
      choice.id ===
        "water"
    ) {
      this.createRainAnimation();
      return;
    }

    this.createParticleBurst(
      GAME_WIDTH * 0.5,
      GAME_HEIGHT * 0.55,
      choice.result ===
        "poor"
        ? "⚠️"
        : "✨"
    );
  }

  createDrainageAnimation() {
    const water =
      this.add.text(
        GAME_WIDTH * 0.7,
        GAME_HEIGHT * 0.7,
        "💧",
        {
          fontSize: "28px",
        }
      );

    this.tweens.add({
      targets: water,

      x:
        GAME_WIDTH * 0.88,

      y:
        GAME_HEIGHT * 0.78,

      alpha: 0,

      duration: 900,

      ease: "Power2",

      onComplete: () => {
        water.destroy();
      },
    });

    this.createParticleBurst(
      GAME_WIDTH * 0.5,
      GAME_HEIGHT * 0.55,
      "🌱"
    );
  }

  createRainAnimation() {
    for (
      let i = 0;
      i < 15;
      i += 1
    ) {
      const drop =
        this.add.text(
          Phaser.Math.Between(
            20,
            GAME_WIDTH - 20
          ),
          -20,
          "💧",
          {
            fontSize: "18px",
          }
        );

      this.tweens.add({
        targets: drop,

        y:
          GAME_HEIGHT * 0.75,

        alpha: 0,

        duration:
          Phaser.Math.Between(
            500,
            900
          ),

        delay: i * 45,

        onComplete: () => {
          drop.destroy();
        },
      });
    }
  }

  createParticleBurst(
    x,
    y,
    text
  ) {
    for (
      let i = 0;
      i < 8;
      i += 1
    ) {
      const particle =
        this.add.text(
          x,
          y,
          text,
          {
            fontSize: "20px",
          }
        );

      this.tweens.add({
        targets: particle,

        x:
          x +
          Phaser.Math.Between(
            -70,
            70
          ),

        y:
          y +
          Phaser.Math.Between(
            -70,
            20
          ),

        alpha: 0,

        duration: 700,

        ease: "Power2",

        onComplete: () => {
          particle.destroy();
        },
      });
    }
  }

  /* =======================================================
     RESULT
  ======================================================= */

  finishMission(choice) {
    this.gameState =
      "result";

    const score =
      Number(choice.score) || 0;

    const baseXp =
      Number(
        this.mission.reward?.baseXp
      ) ||
      Number(
        this.mission.xp
      ) ||
      0;

    const xp = baseXp;

    const coins =
      Number(choice.coins) ||
      Number(
        this.mission.reward
          ?.coins?.[
          choice.result
        ]
      ) ||
      0;

    const result = {
      missionId:
        this.mission.id,

      score,

      xp,

      coins,

      result:
        choice.result ||
        "partial",

      choiceId:
        choice.id,

      choiceLabel:
        choice.label,

      feedback:
        choice.feedback ||
        "",

      learning:
        choice.learning ||
        "",

      observedIds: [
        ...this.observedEntities,
      ],

      completedAt:
        new Date().toISOString(),
    };

    this.showResult(
      result
    );

    this.callbacks.onComplete?.(
      result
    );
  }

  showResult(result) {
    const color =
      RESULT_COLORS[
        result.result
      ] ||
      COLORS.gold;

    this.flashMessage(
      `🏆 +${result.xp} XP   🪙 +${result.coins}`,
      color
    );

    this.callbacks.onResult?.(
      result
    );
  }

  /* =======================================================
     HEADER / HUD
  ======================================================= */

  createHeader() {
    const background =
      this.add
        .rectangle(
          GAME_WIDTH / 2,
          38,
          GAME_WIDTH,
          76,
          COLORS.white
        )
        .setAlpha(0.96);

    background.setDepth(50);

    /*
     * Category
     */
    const category =
      this.add
        .text(
          24,
          17,
          this.mission.category ||
            "ACADEMY",
          {
            fontFamily:
              "Inter, Arial, sans-serif",

            fontSize: "11px",

            fontStyle:
              "bold",

            color:
              "#9f7624",

            letterSpacing: 1,
          }
        )
        .setOrigin(0, 0);

    category.setDepth(51);

    /*
     * Title
     */
    const title =
      this.add
        .text(
          24,
          39,
          this.mission.title ||
            "Smart Academy",
          {
            fontFamily:
              "Inter, Arial, sans-serif",

            fontSize: "20px",

            fontStyle:
              "bold",

            color:
              "#24332b",

            resolution: 2,

            wordWrap: {
              width: 520,
            },
          }
        )
        .setOrigin(0, 0);

    title.setDepth(51);

    /*
     * Progress pill
     */
    const pill =
      this.add
        .rectangle(
          GAME_WIDTH - 70,
          38,
          105,
          36,
          0xe9ede6
        )
        .setOrigin(0.5);

    pill.setDepth(51);

    this.progressText =
      this.add
        .text(
          GAME_WIDTH - 70,
          38,
          "🔎 0/2 bukti",
          {
            fontFamily:
              "Inter, Arial, sans-serif",

            fontSize: "11px",

            fontStyle:
              "bold",

            color:
              "#24332b",

            align:
              "center",
          }
        )
        .setOrigin(0.5);

    this.progressText.setDepth(
      52
    );

    this.updateObservationProgress();
  }

  createInstruction() {
    this.instructionText =
      this.add
        .text(
          GAME_WIDTH / 2,
          GAME_HEIGHT - 25,
          "🔎 Klik objek di kebun untuk mengumpulkan bukti",
          {
            fontFamily:
              "Inter, Arial, sans-serif",

            fontSize: "13px",

            fontStyle:
              "bold",

            color:
              "#ffffff",

            backgroundColor:
              "#385541",

            padding: {
              left: 18,
              right: 18,
              top: 10,
              bottom: 10,
            },

            align:
              "center",

            wordWrap: {
              width: 560,
            },
          }
        )
        .setOrigin(0.5);

    this.instructionText.setDepth(
      100
    );
  }

  /* =======================================================
     ENTITY POPUP
  ======================================================= */

  createEntityPopup(entity) {
    if (
      this.entityPopup
    ) {
      this.entityPopup.destroy();
    }

    const popupWidth =
      Math.min(
        420,
        GAME_WIDTH - 80
      );

    const popupHeight = 155;

    const x =
      GAME_WIDTH / 2;

    /*
     * Popup sedikit ke bawah
     * supaya tidak menutupi header.
     */
    const y =
      GAME_HEIGHT * 0.43;

    const container =
      this.add.container(
        x,
        y
      );

    const shadow =
      this.add
        .rectangle(
          5,
          7,
          popupWidth,
          popupHeight,
          0x26352a
        )
        .setAlpha(0.18);

    const background =
      this.add
        .rectangle(
          0,
          0,
          popupWidth,
          popupHeight,
          COLORS.white
        )
        .setStrokeStyle(
          2,
          COLORS.gold,
          0.55
        );

    const icon =
      this.add
        .text(
          -popupWidth / 2 + 30,
          -popupHeight / 2 + 28,
          getEntityIcon(entity),
          {
            fontSize:
              "30px",
          }
        )
        .setOrigin(0.5);

    const title =
      this.add
        .text(
          -popupWidth / 2 + 65,
          -popupHeight / 2 + 17,
          entity.label,
          {
            fontFamily:
              "Inter, Arial, sans-serif",

            fontSize:
              "16px",

            fontStyle:
              "bold",

            color:
              "#24332b",
          }
        )
        .setOrigin(0, 0);

    const metric =
      this.add
        .text(
          -popupWidth / 2 + 65,
          -popupHeight / 2 + 42,
          `${entity.subtitle || ""} · ${
            entity.metric || ""
          }`,
          {
            fontFamily:
              "Inter, Arial, sans-serif",

            fontSize:
              "10px",

            fontStyle:
              "bold",

            color:
              "#9f7624",
          }
        )
        .setOrigin(0, 0);

    const detail =
      this.add
        .text(
          -popupWidth / 2 + 20,
          -popupHeight / 2 + 75,
          entity.detail ||
            "Amati kondisi objek ini.",
          {
            fontFamily:
              "Inter, Arial, sans-serif",

            fontSize:
              "11px",

            color:
              "#718078",

            wordWrap: {
              width:
                popupWidth - 40,
            },

            lineSpacing: 4,
          }
        )
        .setOrigin(0, 0);

    const close =
      this.add
        .text(
          popupWidth / 2 - 20,
          -popupHeight / 2 + 16,
          "×",
          {
            fontFamily:
              "Arial, sans-serif",

            fontSize:
              "24px",

            fontStyle:
              "bold",

            color:
              "#718078",
          }
        )
        .setOrigin(0.5);

    close.setInteractive({
      useHandCursor: true,
    });

    close.on(
      "pointerdown",
      () => {
        container.destroy();

        this.entityPopup =
          null;
      }
    );

    container.add([
      shadow,
      background,
      icon,
      title,
      metric,
      detail,
      close,
    ]);

    container.setDepth(
      200
    );

    container.setAlpha(0);
    container.setScale(
      0.94
    );

    this.tweens.add({
      targets: container,

      alpha: 1,

      scale: 1,

      duration: 180,

      ease: "Back.easeOut",
    });

    this.entityPopup =
      container;

    this.time.delayedCall(
      4500,
      () => {
        if (
          this.entityPopup ===
          container
        ) {
          container.destroy();

          this.entityPopup =
            null;
        }
      }
    );
  }

  /* =======================================================
     FEEDBACK
  ======================================================= */

  flashMessage(
    message,
    backgroundColor = COLORS.green
  ) {
    if (
      this.flashContainer
    ) {
      this.flashContainer.destroy();
    }

    const container =
      this.add.container(
        GAME_WIDTH / 2,
        92
      );

    const text =
      this.add
        .text(
          0,
          0,
          message,
          {
            fontFamily:
              "Inter, Arial, sans-serif",

            fontSize:
              "13px",

            fontStyle:
              "bold",

            color:
              "#ffffff",

            backgroundColor:
              `#${backgroundColor
                .toString(16)
                .padStart(6, "0")}`,

            padding: {
              left: 16,
              right: 16,
              top: 9,
              bottom: 9,
            },

            align:
              "center",

            wordWrap: {
              width: 520,
            },
          }
        )
        .setOrigin(0.5);

    container.add(text);

    container.setDepth(
      250
    );

    container.setAlpha(0);

    this.tweens.add({
      targets: container,

      alpha: 1,

      y: 104,

      duration: 180,

      ease: "Power2",
    });

    this.flashContainer =
      container;

    this.time.delayedCall(
      1700,
      () => {
        if (
          this.flashContainer ===
          container
        ) {
          this.tweens.add({
            targets: container,

            alpha: 0,

            y: 92,

            duration: 180,

            onComplete: () => {
              container.destroy();

              if (
                this.flashContainer ===
                container
              ) {
                this.flashContainer =
                  null;
              }
            },
          });
        }
      }
    );
  }

  /* =======================================================
     RESPONSIVE
  ======================================================= */

  handleResize(gameSize) {
    /*
     * Jangan mengubah logical world.
     *
     * Phaser menggunakan:
     * 960 x 540
     *
     * kemudian Scale.FIT yang
     * menyesuaikan canvas ke device.
     */
    this.width =
      GAME_WIDTH;

    this.height =
      GAME_HEIGHT;

    /*
     * Popup tetap berada di tengah.
     */
    if (
      this.entityPopup &&
      this.entityPopup.active
    ) {
      this.entityPopup.setPosition(
        GAME_WIDTH / 2,
        GAME_HEIGHT * 0.43
      );
    }

    if (
      this.flashContainer &&
      this.flashContainer.active
    ) {
      this.flashContainer.setPosition(
        GAME_WIDTH / 2,
        104
      );
    }
  }
}

/* =========================================================
   REACT COMPONENT
========================================================= */

export default function PhaserGame({
  mission,
  onComplete,
  onExit,
  onEntityObserved,
  onObservationComplete,
  onResult,
}) {
  const containerRef =
    useRef(null);

  const gameRef =
    useRef(null);

  const [isMobile, setIsMobile] =
    useState(false);

  const [portrait, setPortrait] =
    useState(false);

  const [orientationRequested, setOrientationRequested] =
    useState(false);

  /*
   * Callback terbaru
   */
  const callbacksRef =
    useRef({
      onComplete,
      onExit,
      onEntityObserved,
      onObservationComplete,
      onResult,
    });

  useEffect(() => {
    callbacksRef.current = {
      onComplete,
      onExit,
      onEntityObserved,
      onObservationComplete,
      onResult,
    };
  }, [
    onComplete,
    onExit,
    onEntityObserved,
    onObservationComplete,
    onResult,
  ]);

  /* =======================================================
     DEVICE DETECTION
  ======================================================= */

  useEffect(() => {
    const updateDeviceState =
      () => {
        const mobile =
          isMobileDevice();

        setIsMobile(mobile);
        setPortrait(
          mobile && isPortrait()
        );
      };

    updateDeviceState();

    window.addEventListener(
      "resize",
      updateDeviceState
    );

    window.addEventListener(
      "orientationchange",
      updateDeviceState
    );

    if (
      screen.orientation
    ) {
      screen.orientation.addEventListener(
        "change",
        updateDeviceState
      );
    }

    return () => {
      window.removeEventListener(
        "resize",
        updateDeviceState
      );

      window.removeEventListener(
        "orientationchange",
        updateDeviceState
      );

      if (
        screen.orientation
      ) {
        screen.orientation.removeEventListener(
          "change",
          updateDeviceState
        );
      }
    };
  }, []);

  /* =======================================================
     REQUEST LANDSCAPE
  ======================================================= */

  const enterLandscape =
    useCallback(
      async () => {
        if (!isMobile) {
          return;
        }

        setOrientationRequested(
          true
        );

        await requestLandscape();

        /*
         * Browser membutuhkan
         * sedikit waktu untuk
         * mengganti viewport.
         */
        window.setTimeout(
          () => {
            setPortrait(
              isPortrait()
            );
          },
          250
        );
      },
      [isMobile]
    );

  /* =======================================================
     AUTO REQUEST
  ======================================================= */

  useEffect(() => {
    if (
      !isMobile ||
      !portrait ||
      orientationRequested
    ) {
      return;
    }

    /*
     * Coba otomatis.
     *
     * Kalau browser menolak karena
     * belum ada user gesture,
     * overlay akan muncul.
     */
    enterLandscape();
  }, [
    isMobile,
    portrait,
    orientationRequested,
    enterLandscape,
  ]);

  /* =======================================================
     PHASER INSTANCE
  ======================================================= */

  useEffect(() => {
    if (
      !containerRef.current ||
      !mission
    ) {
      return;
    }

    if (
      gameRef.current
    ) {
      return;
    }

    const parent =
      containerRef.current;

    const config = {
      type: Phaser.AUTO,

      parent,

      /*
       * Logical resolution.
       *
       * Jangan menggunakan
       * width: "100%"
       * height: "100%"
       * karena itu membuat
       * world ikut portrait.
       */
      width:
        GAME_WIDTH,

      height:
        GAME_HEIGHT,

      backgroundColor:
        "#b7d39f",

      /*
       * FIT mempertahankan
       * aspect ratio 16:9.
       */
      scale: {
        mode:
          Phaser.Scale.FIT,

        autoCenter:
          Phaser.Scale.CENTER_BOTH,

        width:
          GAME_WIDTH,

        height:
          GAME_HEIGHT,

        expand:
          false,
      },

      render: {
        antialias: true,

        pixelArt:
          false,

        roundPixels:
          true,

        powerPreference:
          "high-performance",
      },

      physics: {
        default:
          "arcade",

        arcade: {
          debug: false,
        },
      },

      scene:
        AcademyScene,
    };

    const game =
      new Phaser.Game(
        config
      );

    gameRef.current =
      game;

    game.scene.start(
      "AcademyScene",
      {
        mission,

        callbacks: {
          onComplete:
            (result) => {
              callbacksRef.current
                .onComplete?.(
                  result
                );
            },

          onExit:
            () => {
              callbacksRef.current
                .onExit?.();
            },

          onEntityObserved:
            (
              entity,
              count
            ) => {
              callbacksRef.current
                .onEntityObserved?.(
                  entity,
                  count
                );
            },

          onObservationComplete:
            (data) => {
              callbacksRef.current
                .onObservationComplete?.(
                  data
                );
            },

          onResult:
            (result) => {
              callbacksRef.current
                .onResult?.(
                  result
                );
            },
        },
      }
    );

    return () => {
      if (
        gameRef.current
      ) {
        gameRef.current.destroy(
          true
        );

        gameRef.current =
          null;
      }
    };
  }, [mission]);

  /* =======================================================
     EXIT
  ======================================================= */

  const handleExit =
    useCallback(
      async () => {
        await exitGameFullscreen();

        callbacksRef.current
          .onExit?.();
      },
      []
    );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className={[
        "phaser-game-shell",
        isMobile
          ? "is-mobile"
          : "",
        portrait
          ? "is-portrait"
          : "is-landscape",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        ref={containerRef}
        className="phaser-container"
        style={{
          width: "100%",
          height: "100%",
          overflow: "hidden",
          position: "relative",
          touchAction:
            "none",
        }}
      />

      {/*
       * MOBILE PORTRAIT OVERLAY
       *
       * Hanya muncul kalau browser
       * tidak berhasil mengunci
       * orientation.
       */}
      {isMobile &&
        portrait && (
          <div
            className="phaser-orientation-overlay"
            role="dialog"
            aria-modal="true"
          >
            <div className="orientation-card">
              <div className="orientation-icon">
                📱
              </div>

              <div className="orientation-rotate">
                ↻
              </div>

              <h2>
                Putar HP kamu
              </h2>

              <p>
                Smart Academy
                dimainkan dalam
                mode landscape
                supaya kebun dan
                objek permainan
                terlihat lebih jelas.
              </p>

              <button
                type="button"
                onClick={
                  enterLandscape
                }
              >
                ▶ Mulai dalam Landscape
              </button>

              <button
                type="button"
                className="orientation-exit"
                onClick={
                  handleExit
                }
              >
                Kembali ke Academy
              </button>
            </div>
          </div>
        )}

      {/*
       * DESKTOP EXIT
       */}
      {!isMobile && (
        <button
          type="button"
          className="phaser-exit-button"
          onClick={
            handleExit
          }
          aria-label="Kembali ke Academy"
        >
          ←
        </button>
      )}
    </div>
  );
}
