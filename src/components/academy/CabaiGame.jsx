import Phaser from "phaser";
import { useEffect, useRef } from "react";

/**
 * ============================================================
 * CABAI GAME
 * SMART ACADEMY
 * Case: Cabai Setelah Hujan
 *
 * FLOW:
 *
 * 01. Observe kebun
 * 02. Cari minimal 2 bukti
 * 03. Pilih keputusan
 * 04. Lihat konsekuensi
 * 05. Dapatkan reward
 * 06. Praktik di dunia nyata
 *
 * Designed for:
 * - Desktop
 * - Tablet
 * - Mobile landscape
 *
 * Logical resolution:
 * 1280 x 720
 * Aspect ratio:
 * 16:9
 * ============================================================
 */

const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;

const COLORS = {
  sky: 0xbdd9e7,
  skyDark: 0x9fc5d8,

  grass: 0x91bd62,
  grassDark: 0x6f9d4d,
  grassLight: 0xaed276,

  soil: 0x7b5134,
  soilDark: 0x5e3d29,
  soilLight: 0x95643f,

  leaf: 0x4f8f42,
  leafDark: 0x356c31,
  leafLight: 0x76aa52,

  chili: 0xd94f3f,
  chiliDark: 0xb93b32,

  water: 0x64b7dc,
  waterLight: 0x9cdbf2,

  yellow: 0xe5b83e,
  yellowLight: 0xffd965,

  cream: 0xfffcf7,
  creamDark: 0xf4ecdf,

  ink: 0x203027,
  muted: 0x657168,

  green: 0x4e9a61,
  greenDark: 0x367849,

  orange: 0xed713d,
  red: 0xc84d45,

  white: 0xffffff,

  navy: 0x203b2c,
};

/* ============================================================
   EVIDENCE
============================================================ */

const EVIDENCE = {
  soil: {
    id: "soil",
    title: "Tanah",
    subtitle: "KELEMBAPAN",
    metric: "Terlalu basah",
    detail:
      "Permukaan tanah masih jenuh air. Kondisinya belum kembali ke kelembapan yang ideal.",
  },

  leaf: {
    id: "leaf",
    title: "Daun cabai",
    subtitle: "GEJALA",
    metric: "Mulai menguning",
    detail:
      "Beberapa daun bagian bawah tampak menguning. Ini adalah gejala yang perlu diamati, bukan diagnosis tunggal.",
  },

  drainage: {
    id: "drainage",
    title: "Drainase",
    subtitle: "ALIRAN AIR",
    metric: "Kurang lancar",
    detail:
      "Ada genangan kecil di sisi bedengan. Air perlu memiliki jalur keluar agar tidak terus mengendap.",
  },
};

/* ============================================================
   DECISIONS
============================================================ */

const DECISIONS = [
  {
    id: "drain",
    title: "Periksa dan buka jalur drainase",
    short:
      "Kurangi genangan sebelum memberi input tambahan.",
    score: 100,
    xp: 80,
    coins: 30,
    type: "good",

    feedback:
      "Kamu memprioritaskan kondisi lingkungan akar terlebih dahulu. Setelah air terkendali, observasi berikutnya menjadi lebih masuk akal.",

    learning:
      "Kenali penyebab masalah sebelum menambah pupuk atau air.",
  },

  {
    id: "fertilize",
    title: "Langsung tambah pupuk",
    short:
      "Berikan nutrisi agar daun cepat hijau.",
    score: 45,
    xp: 80,
    coins: 10,
    type: "warning",

    feedback:
      "Nutrisi bukan selalu jawaban pertama. Saat tanah terlalu basah, kondisi air dan akar sebaiknya diperiksa lebih dulu.",

    learning:
      "Jangan menambah input sebelum memahami kondisi lahan.",
  },

  {
    id: "water",
    title: "Tambah penyiraman",
    short:
      "Sirami tanaman supaya tidak kekurangan air.",
    score: 20,
    xp: 80,
    coins: 5,
    type: "bad",

    feedback:
      "Kondisi tanah menunjukkan air sudah berlebih. Menambah air akan membuat kondisi yang sedang bermasalah semakin berat.",

    learning:
      "Gunakan kondisi tanah sebagai bukti sebelum menyiram.",
  },
];

/* ============================================================
   HELPERS
============================================================ */

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/* ============================================================
   REACT COMPONENT
============================================================ */

export default function CabaiGame({
  mission,
  onEntityObserved,
  onObservationComplete,
  onResult,
  onComplete,
  onExit,
}) {
  const containerRef = useRef(null);
  const gameRef = useRef(null);

  const callbacksRef = useRef({
    onEntityObserved,
    onObservationComplete,
    onResult,
    onComplete,
    onExit,
  });

  useEffect(() => {
    callbacksRef.current = {
      onEntityObserved,
      onObservationComplete,
      onResult,
      onComplete,
      onExit,
    };
  }, [
    onEntityObserved,
    onObservationComplete,
    onResult,
    onComplete,
    onExit,
  ]);

  useEffect(() => {
    if (!containerRef.current) {
      return undefined;
    }

    /*
     * Jangan membuat Phaser dua kali.
     */
    if (gameRef.current) {
      gameRef.current.destroy(true);
      gameRef.current = null;
    }

    let sceneInstance = null;

    /* ========================================================
       PHASER SCENE
    ======================================================== */

    class CabaiScene extends Phaser.Scene {
      constructor() {
        super({
          key: "CabaiScene",
        });

        this.observedIds = [];
        this.entityObjects = {};
        this.waterPools = [];
        this.rainDrops = [];
        this.plants = [];

        this.isDecisionPhase = false;
        this.isResultPhase = false;

        this.entityPopup = null;
        this.decisionPanel = null;
        this.resultPanel = null;
        this.toast = null;

        this.player = null;

        this.evidenceCounter = null;
        this.phaseText = null;
      }

      /* ======================================================
         CREATE
      ====================================================== */

      create() {
        sceneInstance = this;

        this.createBackground();
        this.createWeather();
        this.createMountains();
        this.createField();
        this.createPlants();
        this.createDrainage();
        this.createPlayer();

        this.createHUD();
        this.createInteractionZones();
        this.createInstructions();

        this.animateEnvironment();

        /*
         * Prevent browser context menu
         * ketika long press di mobile.
         */
        this.input.mouse?.disableContextMenu();

        /*
         * Keyboard fallback untuk desktop.
         */
        this.input.keyboard?.on(
          "keydown-ESC",
          () => {
            callbacksRef.current.onExit?.();
          }
        );
      }

      /* ======================================================
         BACKGROUND
      ====================================================== */

      createBackground() {
        const { width, height } = this.scale;

        /*
         * Base.
         */
        this.add
          .rectangle(
            width / 2,
            height / 2,
            width,
            height,
            COLORS.grass
          )
          .setDepth(-20);

        /*
         * Sky.
         */
        this.add
          .rectangle(
            width / 2,
            160,
            width,
            320,
            COLORS.sky
          )
          .setDepth(-19);

        /*
         * Ground.
         */
        this.add
          .rectangle(
            width / 2,
            500,
            width,
            440,
            COLORS.grass
          )
          .setDepth(-18);

        /*
         * Horizon.
         */
        this.add
          .rectangle(
            width / 2,
            350,
            width,
            12,
            COLORS.grassDark
          )
          .setDepth(-17);

        /*
         * Sun.
         */
        const sun = this.add
          .circle(
            1120,
            115,
            46,
            COLORS.yellowLight,
            0.9
          )
          .setDepth(-15);

        this.tweens.add({
          targets: sun,
          alpha: 0.65,
          scale: 1.08,
          duration: 1800,
          yoyo: true,
          repeat: -1,
          ease: "Sine.InOut",
        });

        /*
         * Clouds.
         */
        this.createCloud(145, 110, 1);
        this.createCloud(720, 125, 0.8);
        this.createCloud(1030, 180, 0.65);
      }

      /* ======================================================
         CLOUD
      ====================================================== */

      createCloud(x, y, scale = 1) {
        const cloud = this.add.graphics();

        cloud.fillStyle(
          COLORS.white,
          0.86
        );

        cloud.fillCircle(
          x,
          y,
          30 * scale
        );

        cloud.fillCircle(
          x + 35 * scale,
          y - 12 * scale,
          40 * scale
        );

        cloud.fillCircle(
          x + 72 * scale,
          y,
          29 * scale
        );

        cloud.fillRoundedRect(
          x - 15 * scale,
          y,
          105 * scale,
          27 * scale,
          14
        );

        cloud.setDepth(-10);
      }

      /* ======================================================
         MOUNTAINS
      ====================================================== */

      createMountains() {
        const mountains =
          this.add.graphics();

        mountains.fillStyle(
          0x9dbb9c,
          1
        );

        mountains.beginPath();

        mountains.moveTo(0, 355);
        mountains.lineTo(135, 245);
        mountains.lineTo(265, 355);

        mountains.lineTo(410, 220);
        mountains.lineTo(570, 355);

        mountains.lineTo(735, 245);
        mountains.lineTo(900, 355);

        mountains.lineTo(1060, 230);
        mountains.lineTo(1280, 350);

        mountains.lineTo(1280, 370);
        mountains.lineTo(0, 370);

        mountains.closePath();
        mountains.fillPath();

        mountains.setDepth(-8);
      }

      /* ======================================================
         WEATHER
      ====================================================== */

      createWeather() {
        for (let i = 0; i < 48; i++) {
          const drop = this.add.rectangle(
            Phaser.Math.Between(
              20,
              GAME_WIDTH - 20
            ),
            Phaser.Math.Between(
              30,
              335
            ),
            2,
            Phaser.Math.Between(
              9,
              17
            ),
            COLORS.waterLight,
            0.42
          );

          drop.setDepth(-1);

          this.rainDrops.push(drop);
        }
      }

      /* ======================================================
         FIELD
      ====================================================== */

      createField() {
        /*
         * Left bed.
         */
        this.createBed(
          315,
          470,
          420,
          130
        );

        /*
         * Right bed.
         */
        this.createBed(
          910,
          470,
          420,
          130
        );

        /*
         * Walking path.
         */
        this.add
          .rectangle(
            640,
            500,
            90,
            260,
            0xc7a77d
          )
          .setDepth(0);

        /*
         * Path stones.
         */
        for (let i = 0; i < 5; i++) {
          this.add
            .ellipse(
              640,
              410 + i * 48,
              45,
              20,
              0xe1c59a,
              0.8
            )
            .setDepth(1);
        }

        /*
         * Soil texture.
         */
        for (let i = 0; i < 80; i++) {
          const side =
            i % 2 === 0;

          const x = side
            ? Phaser.Math.Between(125, 505)
            : Phaser.Math.Between(770, 1150);

          const y =
            Phaser.Math.Between(
              420,
              530
            );

          this.add
            .circle(
              x,
              y,
              Phaser.Math.Between(
                1,
                3
              ),
              COLORS.soilDark,
              0.3
            )
            .setDepth(2);
        }
      }

      /* ======================================================
         BED
      ====================================================== */

      createBed(
        x,
        y,
        width,
        height
      ) {
        const graphics =
          this.add.graphics();

        graphics.fillStyle(
          COLORS.soil,
          1
        );

        graphics.fillRoundedRect(
          x - width / 2,
          y - height / 2,
          width,
          height,
          24
        );

        graphics.lineStyle(
          5,
          COLORS.soilDark,
          0.38
        );

        graphics.strokeRoundedRect(
          x - width / 2,
          y - height / 2,
          width,
          height,
          24
        );

        graphics.setDepth(0);
      }

      /* ======================================================
         PLANTS
      ====================================================== */

      createPlants() {
        const positions = [
          [150, 445],
          [225, 480],
          [305, 430],
          [380, 480],
          [455, 440],

          [780, 445],
          [850, 480],
          [930, 430],
          [1010, 480],
          [1090, 440],
        ];

        positions.forEach(
          ([x, y], index) => {
            const plant =
              this.createPepperPlant(
                x,
                y,
                index
              );

            this.plants.push(
              plant
            );
          }
        );
      }

      /* ======================================================
         PEPPER PLANT
      ====================================================== */

      createPepperPlant(
        x,
        y,
        index
      ) {
        const plant =
          this.add.container(
            x,
            y
          );

        /*
         * Stem.
         */
        const stem =
          this.add.graphics();

        stem.lineStyle(
          8,
          COLORS.leafDark,
          1
        );

        stem.beginPath();
        stem.moveTo(0, 20);
        stem.lineTo(0, -62);
        stem.strokePath();

        /*
         * Leaves.
         */
        const leaves =
          this.add.graphics();

        leaves.fillStyle(
          COLORS.leaf,
          1
        );

        leaves.fillEllipse(
          -20,
          -38,
          42,
          21
        );

        leaves.fillEllipse(
          21,
          -47,
          42,
          21
        );

        leaves.fillEllipse(
          -20,
          -12,
          39,
          19
        );

        leaves.fillEllipse(
          20,
          -18,
          39,
          19
        );

        /*
         * Yellow leaves.
         */
        if (
          index === 1 ||
          index === 4 ||
          index === 8
        ) {
          leaves.fillStyle(
            COLORS.yellow,
            1
          );

          leaves.fillEllipse(
            -20,
            -12,
            39,
            19
          );
        }

        /*
         * Chili.
         */
        const chili =
          this.add.graphics();

        chili.fillStyle(
          COLORS.chili,
          1
        );

        chili.fillRoundedRect(
          -7,
          -82,
          12,
          33,
          8
        );

        chili.rotation = -0.2;

        /*
         * Stem top.
         */
        const top =
          this.add.graphics();

        top.fillStyle(
          COLORS.leafDark,
          1
        );

        top.fillCircle(
          0,
          -72,
          7
        );

        plant.add([
          stem,
          leaves,
          chili,
          top,
        ]);

        plant.setDepth(5);

        plant.setScale(
          0.85 +
            (index % 3) *
              0.07
        );

        plant.setData(
          "index",
          index
        );

        /*
         * Subtle animation.
         */
        this.tweens.add({
          targets: plant,
          angle:
            index % 2 === 0
              ? 1.5
              : -1.5,
          duration:
            1800 +
            index * 100,
          yoyo: true,
          repeat: -1,
          ease: "Sine.InOut",
        });

        return plant;
      }

      /* ======================================================
         DRAINAGE
      ====================================================== */

      createDrainage() {
        const channel =
          this.add.graphics();

        channel.fillStyle(
          COLORS.soilDark,
          0.8
        );

        channel.fillRoundedRect(
          80,
          530,
          170,
          25,
          12
        );

        channel.fillRoundedRect(
          1060,
          530,
          150,
          25,
          12
        );

        channel.setDepth(3);

        /*
         * Puddles.
         */
        this.createPuddle(
          145,
          505,
          105,
          34
        );

        this.createPuddle(
          1125,
          505,
          100,
          32
        );
      }

      createPuddle(
        x,
        y,
        width,
        height
      ) {
        const puddle =
          this.add.ellipse(
            x,
            y,
            width,
            height,
            COLORS.water,
            0.78
          );

        puddle.setDepth(4);

        this.waterPools.push(
          puddle
        );
      }

      /* ======================================================
         PLAYER
      ====================================================== */

      createPlayer() {
        this.player =
          this.add.container(
            640,
            380
          );

        /*
         * Body.
         */
        const body =
          this.add.graphics();

        body.fillStyle(
          0x8d5a45,
          1
        );

        body.fillRoundedRect(
          -25,
          -2,
          50,
          72,
          16
        );

        /*
         * Shirt.
         */
        const shirt =
          this.add.graphics();

        shirt.fillStyle(
          0xd0a84c,
          1
        );

        shirt.fillRoundedRect(
          -24,
          5,
          48,
          52,
          14
        );

        /*
         * Head.
         */
        const head =
          this.add.graphics();

        head.fillStyle(
          0xb97850,
          1
        );

        head.fillCircle(
          0,
          -35,
          24
        );

        /*
         * Face.
         */
        const face =
          this.add.graphics();

        face.fillStyle(
          0x2c211b,
          1
        );

        face.fillEllipse(
          -8,
          -39,
          6,
          8
        );

        face.fillEllipse(
          8,
          -39,
          6,
          8
        );

        /*
         * Hat.
         */
        const hat =
          this.add.graphics();

        hat.fillStyle(
          0x4c6b3c,
          1
        );

        hat.fillEllipse(
          0,
          -62,
          75,
          22
        );

        hat.fillRoundedRect(
          -25,
          -84,
          50,
          28,
          10
        );

        /*
         * Arm.
         */
        const arm =
          this.add.graphics();

        arm.lineStyle(
          12,
          0x8d5a45,
          1
        );

        arm.beginPath();

        arm.moveTo(
          -20,
          20
        );

        arm.lineTo(
          -42,
          42
        );

        arm.strokePath();

        this.player.add([
          body,
          shirt,
          head,
          face,
          hat,
          arm,
        ]);

        this.player.setDepth(15);

        this.tweens.add({
          targets: this.player,
          y: 376,
          duration: 1200,
          yoyo: true,
          repeat: -1,
          ease: "Sine.InOut",
        });
      }

      /* ======================================================
         INTERACTION ZONES
      ====================================================== */

      createInteractionZones() {
        /*
         * Tanah.
         */
        this.createEntityZone(
          "soil",
          325,
          475,
          250,
          120
        );

        /*
         * Daun.
         */
        this.createEntityZone(
          "leaf",
          225,
          425,
          210,
          170
        );

        /*
         * Drainage.
         */
        this.createEntityZone(
          "drainage",
          1110,
          510,
          250,
          100
        );
      }

      createEntityZone(
        id,
        x,
        y,
        width,
        height
      ) {
        const zone =
          this.add
            .zone(
              x,
              y,
              width,
              height
            )
            .setInteractive({
              useHandCursor: true,
            });

        zone.setData(
          "entityId",
          id
        );

        /*
         * Mobile touch.
         */
        zone.on(
          "pointerdown",
          () => {
            this.inspectEntity(
              id,
              zone
            );
          }
        );

        /*
         * Desktop hover.
         */
        zone.on(
          "pointerover",
          () => {
            if (
              !this.isDecisionPhase &&
              !this.isResultPhase
            ) {
              this.showHighlight(
                zone
              );
            }
          }
        );

        zone.on(
          "pointerout",
          () => {
            this.hideHighlight(
              zone
            );
          }
        );

        this.entityObjects[id] =
          zone;
      }

      /* ======================================================
         INSPECT ENTITY
      ====================================================== */

      inspectEntity(
        id,
        zone
      ) {
        if (
          this.isDecisionPhase ||
          this.isResultPhase
        ) {
          return;
        }

        if (
          !this.observedIds.includes(
            id
          )
        ) {
          this.observedIds.push(
            id
          );
        }

        const evidence =
          EVIDENCE[id];

        if (!evidence) {
          return;
        }

        /*
         * React callback.
         */
        callbacksRef.current.onEntityObserved?.(
          evidence
        );

        /*
         * Move player.
         */
        this.movePlayerTo(
          zone.x,
          zone.y - 70
        );

        /*
         * Popup.
         */
        this.showEntityPopup(
          id
        );

        /*
         * Update counter.
         */
        this.updateEvidenceCounter();

        /*
         * Kalau sudah 2 bukti.
         */
        if (
          this.observedIds.length >=
          2
        ) {
          this.time.delayedCall(
            900,
            () => {
              this.enterDecisionPhase();
            }
          );
        }
      }

      /* ======================================================
         HIGHLIGHT
      ====================================================== */

      showHighlight(zone) {
        if (
          zone.getData(
            "highlight"
          )
        ) {
          return;
        }

        const highlight =
          this.add
            .ellipse(
              zone.x,
              zone.y,
              zone.width * 0.75,
              zone.height * 0.45,
              COLORS.yellow,
              0.12
            )
            .setStrokeStyle(
              4,
              COLORS.yellowLight,
              0.9
            )
            .setDepth(10);

        zone.setData(
          "highlight",
          highlight
        );

        this.tweens.add({
          targets: highlight,
          scale: 1.06,
          alpha: 0.25,
          duration: 650,
          yoyo: true,
          repeat: -1,
          ease: "Sine.InOut",
        });
      }

      hideHighlight(zone) {
        const highlight =
          zone.getData(
            "highlight"
          );

        if (!highlight) {
          return;
        }

        highlight.destroy();

        zone.setData(
          "highlight",
          null
        );
      }

      /* ======================================================
         ENTITY POPUP
      ====================================================== */

      showEntityPopup(id) {
        const entity =
          EVIDENCE[id];

        if (!entity) {
          return;
        }

        if (this.entityPopup) {
          this.entityPopup.destroy();
        }

        /*
         * Popup ditempatkan di area yang
         * tidak menutupi terlalu banyak kebun.
         */
        let x = 640;
        let y = 180;

        if (id === "soil") {
          x = 350;
          y = 235;
        }

        if (id === "leaf") {
          x = 225;
          y = 235;
        }

        if (id === "drainage") {
          x = 1030;
          y = 250;
        }

        const popup =
          this.add.container(
            x,
            y
          );

        const bg =
          this.add
            .rectangle(
              0,
              0,
              310,
              142,
              COLORS.cream,
              0.98
            )
            .setStrokeStyle(
              3,
              COLORS.yellow,
              1
            );

        const badge =
          this.add
            .rectangle(
              -115,
              -47,
              80,
              23,
              COLORS.navy,
              1
            );

        const badgeText =
          this.add.text(
            -148,
            -57,
            entity.subtitle,
            {
              fontFamily:
                "Arial",
              fontSize:
                "10px",
              fontStyle:
                "bold",
              color:
                "#FFFFFF",
              letterSpacing:
                1,
            }
          );

        const title =
          this.add.text(
            -135,
            -25,
            entity.title,
            {
              fontFamily:
                "Arial",
              fontSize:
                "19px",
              fontStyle:
                "bold",
              color:
                "#203027",
            }
          );

        const metric =
          this.add.text(
            -135,
            5,
            entity.metric,
            {
              fontFamily:
                "Arial",
              fontSize:
                "14px",
              fontStyle:
                "bold",
              color:
                "#C84D45",
            }
          );

        const detail =
          this.add.text(
            -135,
            31,
            entity.detail,
            {
              fontFamily:
                "Arial",
              fontSize:
                "11px",
              color:
                "#657168",
              wordWrap: {
                width: 270,
              },
              lineSpacing:
                3,
            }
          );

        popup.add([
          bg,
          badge,
          badgeText,
          title,
          metric,
          detail,
        ]);

        popup.setDepth(100);

        popup.setScale(0.85);
        popup.alpha = 0;

        this.tweens.add({
          targets: popup,
          scale: 1,
          alpha: 1,
          duration: 220,
          ease: "Back.Out",
        });

        this.entityPopup =
          popup;

        /*
         * Auto close.
         */
        this.time.delayedCall(
          4500,
          () => {
            if (
              this.entityPopup ===
              popup
            ) {
              this.tweens.add({
                targets: popup,
                alpha: 0,
                duration: 150,
                onComplete: () => {
                  popup.destroy();

                  if (
                    this.entityPopup ===
                    popup
                  ) {
                    this.entityPopup =
                      null;
                  }
                },
              });
            }
          }
        );
      }

      /* ======================================================
         PLAYER MOVEMENT
      ====================================================== */

      movePlayerTo(
        x,
        y
      ) {
        if (!this.player) {
          return;
        }

        this.tweens.add({
          targets:
            this.player,
          x: clamp(
            x,
            80,
            GAME_WIDTH - 80
          ),
          y: clamp(
            y,
            300,
            500
          ),
          duration: 450,
          ease: "Sine.Out",
        });
      }

      /* ======================================================
         DECISION PHASE
      ====================================================== */

      enterDecisionPhase() {
        if (
          this.isDecisionPhase
        ) {
          return;
        }

        this.isDecisionPhase =
          true;

        callbacksRef.current.onObservationComplete?.(
          {
            observedIds:
              this.observedIds,
            complete: true,
          }
        );

        /*
         * Tutup popup.
         */
        if (this.entityPopup) {
          this.entityPopup.destroy();
          this.entityPopup =
            null;
        }

        /*
         * Instruksi hilang.
         */
        if (
          this.instructionBox
        ) {
          this.instructionBox.destroy();
          this.instructionBox =
            null;
        }

        this.showDecisionToast();

        this.time.delayedCall(
          700,
          () => {
            this.createDecisionPanel();
          }
        );
      }

      /* ======================================================
         DECISION TOAST
      ====================================================== */

      showDecisionToast() {
        const toast =
          this.add.container(
            GAME_WIDTH / 2,
            112
          );

        const bg =
          this.add
            .rectangle(
              0,
              0,
              430,
              62,
              COLORS.green,
              0.98
            )
            .setStrokeStyle(
              3,
              COLORS.white,
              0.85
            );

        const title =
          this.add.text(
            -180,
            -18,
            "✓  BUKTI CUKUP!",
            {
              fontFamily:
                "Arial",
              fontSize:
                "16px",
              fontStyle:
                "bold",
              color:
                "#FFFFFF",
            }
          );

        const text =
          this.add.text(
            -180,
            5,
            "Sekarang tentukan tindakanmu.",
            {
              fontFamily:
                "Arial",
              fontSize:
                "12px",
              color:
                "#EAF6ED",
            }
          );

        toast.add([
          bg,
          title,
          text,
        ]);

        toast.setDepth(120);

        toast.setScale(0.8);
        toast.alpha = 0;

        this.tweens.add({
          targets: toast,
          scale: 1,
          alpha: 1,
          duration: 220,
          ease: "Back.Out",
        });

        this.time.delayedCall(
          1600,
          () => {
            this.tweens.add({
              targets: toast,
              alpha: 0,
              y: 95,
              duration: 180,
              onComplete: () =>
                toast.destroy(),
            });
          }
        );
      }

      /* ======================================================
         DECISION PANEL
      ====================================================== */

      createDecisionPanel() {
        if (this.decisionPanel) {
          this.decisionPanel.destroy();
        }

        const panel =
          this.add.container(
            GAME_WIDTH / 2,
            510
          );

        /*
         * Panel backdrop.
         */
        const backdrop =
          this.add
            .rectangle(
              0,
              0,
              1160,
              350,
              COLORS.cream,
              0.98
            )
            .setStrokeStyle(
              3,
              0xdcc9a6,
              1
            );

        /*
         * Header.
         */
        const eyebrow =
          this.add.text(
            -530,
            -150,
            "PILIH KEPUTUSAN",
            {
              fontFamily:
                "Arial",
              fontSize:
                "11px",
              fontStyle:
                "bold",
              color:
                "#A87919",
              letterSpacing:
                2,
            }
          );

        const title =
          this.add.text(
            -530,
            -127,
            "Apa langkah pertamamu?",
            {
              fontFamily:
                "Arial",
              fontSize:
                "25px",
              fontStyle:
                "bold",
              color:
                "#203027",
            }
          );

        const subtitle =
          this.add.text(
            -530,
            -95,
            "Pilih berdasarkan bukti yang kamu temukan.",
            {
              fontFamily:
                "Arial",
              fontSize:
                "13px",
              color:
                "#657168",
            }
          );

        panel.add([
          backdrop,
          eyebrow,
          title,
          subtitle,
        ]);

        /*
         * Cards.
         */
        DECISIONS.forEach(
          (choice, index) => {
            const card =
              this.createDecisionCard(
                choice,
                index
              );

            panel.add(card);
          }
        );

        panel.setDepth(150);

        panel.setScale(0.92);
        panel.alpha = 0;

        this.tweens.add({
          targets: panel,
          scale: 1,
          alpha: 1,
          duration: 260,
          ease: "Back.Out",
        });

        this.decisionPanel =
          panel;
      }

      /* ======================================================
         DECISION CARD
      ====================================================== */

      createDecisionCard(
        choice,
        index
      ) {
        const positions = [
          -370,
          0,
          370,
        ];

        const card =
          this.add.container(
            positions[index],
            65
          );

        let border =
          0xd8d0c3;

        if (
          choice.type ===
          "good"
        ) {
          border =
            0x82b78e;
        }

        if (
          choice.type ===
          "warning"
        ) {
          border =
            0xe1b65c;
        }

        if (
          choice.type ===
          "bad"
        ) {
          border =
            0xd4877f;
        }

        const bg =
          this.add
            .rectangle(
              0,
              0,
              330,
              190,
              COLORS.white,
              1
            )
            .setStrokeStyle(
              3,
              border,
              1
            );

        /*
         * Number.
         */
        const number =
          this.add
            .circle(
              -135,
              -65,
              20,
              COLORS.creamDark
            );

        const numberText =
          this.add.text(
            -141,
            -75,
            String(
              index + 1
            ),
            {
              fontFamily:
                "Arial",
              fontSize:
                "15px",
              fontStyle:
                "bold",
              color:
                "#A87919",
            }
          );

        /*
         * Title.
         */
        const title =
          this.add.text(
            -105,
            -80,
            choice.title,
            {
              fontFamily:
                "Arial",
              fontSize:
                "15px",
              fontStyle:
                "bold",
              color:
                "#203027",
              wordWrap: {
                width: 205,
              },
              lineSpacing: 2,
            }
          );

        /*
         * Description.
         */
        const description =
          this.add.text(
            -135,
            -25,
            choice.short,
            {
              fontFamily:
                "Arial",
              fontSize:
                "11px",
              color:
                "#657168",
              wordWrap: {
                width: 270,
              },
              lineSpacing: 3,
            }
          );

        /*
         * CTA.
         */
        const button =
          this.add
            .rectangle(
              0,
              65,
              270,
              42,
              COLORS.navy,
              1
            )
            .setInteractive({
              useHandCursor:
                true,
            });

        const buttonText =
          this.add
            .text(
              -72,
              54,
              "PILIH INI  →",
              {
                fontFamily:
                  "Arial",
                fontSize:
                  "12px",
                fontStyle:
                  "bold",
                color:
                  "#FFFFFF",
              }
            );

        card.add([
          bg,
          number,
          numberText,
          title,
          description,
          button,
          buttonText,
        ]);

        /*
         * Hover.
         */
        button.on(
          "pointerover",
          () => {
            bg.setFillStyle(
              0xfffbf2
            );

            button.setFillStyle(
              COLORS.green
            );

            card.setScale(
              1.025
            );
          }
        );

        button.on(
          "pointerout",
          () => {
            bg.setFillStyle(
              COLORS.white
            );

            button.setFillStyle(
              COLORS.navy
            );

            card.setScale(
              1
            );
          }
        );

        /*
         * Touch/click.
         */
        button.on(
          "pointerdown",
          () => {
            this.selectChoice(
              choice
            );
          }
        );

        return card;
      }

      /* ======================================================
         SELECT CHOICE
      ====================================================== */

      selectChoice(
        choice
      ) {
        if (
          this.isResultPhase
        ) {
          return;
        }

        this.isResultPhase =
          true;

        if (
          this.decisionPanel
        ) {
          this.decisionPanel.destroy();

          this.decisionPanel =
            null;
        }

        this.runConsequence(
          choice
        );
      }

      /* ======================================================
         CONSEQUENCE
      ====================================================== */

      runConsequence(
        choice
      ) {
        /*
         * Disable interaction
         * sementara animasi berjalan.
         */
        this.input.enabled =
          false;

        if (
          choice.id ===
          "drain"
        ) {
          this.animateDrainageSuccess();
        }

        if (
          choice.id ===
          "fertilize"
        ) {
          this.animateFertilize();
        }

        if (
          choice.id ===
          "water"
        ) {
          this.animateMoreWater();
        }

        this.time.delayedCall(
          1700,
          () => {
            this.showResult(
              choice
            );
          }
        );
      }

      /* ======================================================
         GOOD CONSEQUENCE
      ====================================================== */

      animateDrainageSuccess() {
        /*
         * Puddles menyusut.
         */
        this.waterPools.forEach(
          (pool) => {
            this.tweens.add({
              targets: pool,
              scaleX: 0.15,
              scaleY: 0.4,
              alpha: 0.15,
              duration: 1000,
              ease: "Sine.In",
            });
          }
        );

        /*
         * Water flow.
         */
        const flow =
          this.add.graphics();

        flow.lineStyle(
          8,
          COLORS.water,
          0.9
        );

        flow.beginPath();

        flow.moveTo(
          110,
          505
        );

        flow.lineTo(
          220,
          520
        );

        flow.lineTo(
          340,
          535
        );

        flow.strokePath();

        flow.setDepth(25);

        this.tweens.add({
          targets: flow,
          alpha: 0,
          x: 50,
          duration: 1300,
          onComplete: () =>
            flow.destroy(),
        });

        /*
         * Green particles.
         */
        this.createParticles(
          640,
          430,
          COLORS.green
        );

        /*
         * Success label.
         */
        this.showFloatingMessage(
          "✓ AIR MULAI TERKENDALI",
          COLORS.green
        );
      }

      /* ======================================================
         FERTILIZE
      ====================================================== */

      animateFertilize() {
        /*
         * Fertilizer particles.
         */
        for (
          let i = 0;
          i < 18;
          i++
        ) {
          const particle =
            this.add.circle(
              Phaser.Math.Between(
                150,
                470
              ),
              410,
              Phaser.Math.Between(
                3,
                6
              ),
              COLORS.yellow,
              1
            );

          particle.setDepth(25);

          this.tweens.add({
            targets:
              particle,

            y:
              particle.y +
              Phaser.Math.Between(
                40,
                90
              ),

            alpha: 0,

            duration: 700,

            onComplete: () =>
              particle.destroy(),
          });
        }

        /*
         * Water tetap ada.
         */
        this.waterPools.forEach(
          (pool) => {
            this.tweens.add({
              targets: pool,
              scale: 1.1,
              alpha: 0.9,
              duration: 500,
              yoyo: true,
            });
          }
        );

        this.showFloatingMessage(
          "⚠ TANAH MASIH TERLALU BASAH",
          COLORS.warning
        );
      }

      /* ======================================================
         MORE WATER
      ====================================================== */

      animateMoreWater() {
        for (
          let i = 0;
          i < 25;
          i++
        ) {
          const splash =
            this.add.circle(
              Phaser.Math.Between(
                110,
                1170
              ),
              Phaser.Math.Between(
                420,
                525
              ),
              Phaser.Math.Between(
                3,
                7
              ),
              COLORS.water,
              0.85
            );

          splash.setDepth(25);

          this.tweens.add({
            targets:
              splash,

            y:
              splash.y -
              Phaser.Math.Between(
                20,
                50
              ),

            alpha: 0,

            duration: 650,

            onComplete: () =>
              splash.destroy(),
          });
        }

        this.waterPools.forEach(
          (pool) => {
            this.tweens.add({
              targets: pool,
              scaleX: 1.4,
              scaleY: 1.2,
              alpha: 1,
              duration: 650,
            });
          }
        );

        this.showFloatingMessage(
          "💧 AIR SEMAKIN BERLEBIH",
          COLORS.red
        );
      }

      /* ======================================================
         FLOATING MESSAGE
      ====================================================== */

      showFloatingMessage(
        message,
        color
      ) {
        const text =
          this.add.text(
            GAME_WIDTH / 2,
            350,
            message,
            {
              fontFamily:
                "Arial",
              fontSize:
                "20px",
              fontStyle:
                "bold",
              color:
                "#FFFFFF",
              backgroundColor:
                Phaser.Display.Color.IntegerToColor(
                  color
                ).rgba,
              padding: {
                left: 18,
                right: 18,
                top: 12,
                bottom: 12,
              },
            }
          );

        text.setOrigin(
          0.5
        );

        text.setDepth(200);

        text.alpha = 0;

        this.tweens.add({
          targets: text,
          alpha: 1,
          y: 325,
          duration: 220,
          ease: "Back.Out",
        });

        this.tweens.add({
          targets: text,
          alpha: 0,
          y: 285,
          delay: 900,
          duration: 450,
          onComplete: () =>
            text.destroy(),
        });
      }

      /* ======================================================
         RESULT
      ====================================================== */

      showResult(
        choice
      ) {
        callbacksRef.current.onResult?.(
          {
            choice,
            observedIds:
              this.observedIds,
          }
        );

        callbacksRef.current.onComplete?.(
          {
            choice,
            observedIds:
              this.observedIds,
            score:
              choice.score,
            xp:
              choice.xp,
            coins:
              choice.coins,
          }
        );

        this.createResultPanel(
          choice
        );
      }

      /* ======================================================
         RESULT PANEL
      ====================================================== */

      createResultPanel(
        choice
      ) {
        const panel =
          this.add.container(
            GAME_WIDTH / 2,
            GAME_HEIGHT / 2
          );

        /*
         * Dim background.
         */
        const dim =
          this.add.rectangle(
            0,
            0,
            GAME_WIDTH,
            GAME_HEIGHT,
            0x142018,
            0.58
          );

        /*
         * Main card.
         */
        const bg =
          this.add
            .rectangle(
              0,
              0,
              620,
              470,
              COLORS.cream,
              1
            )
            .setStrokeStyle(
              4,
              choice.type ===
                "good"
                ? COLORS.green
                : choice.type ===
                  "warning"
                ? COLORS.warning
                : COLORS.red,
              1
            );

        /*
         * Result icon.
         */
        const iconBg =
          this.add.circle(
            0,
            -160,
            45,
            choice.type ===
              "good"
              ? COLORS.green
              : choice.type ===
                "warning"
              ? COLORS.warning
              : COLORS.red
          );

        const icon =
          this.add.text(
            -15,
            -180,
            choice.type ===
              "good"
              ? "✓"
              : choice.type ===
                "warning"
              ? "!"
              : "×",
            {
              fontFamily:
                "Arial",
              fontSize:
                "34px",
              fontStyle:
                "bold",
              color:
                "#FFFFFF",
            }
          );

        /*
         * Heading.
         */
        const heading =
          this.add.text(
            0,
            -105,
            choice.type ===
              "good"
              ? "Keputusan bagus!"
              : choice.type ===
                "warning"
              ? "Ada yang perlu dipikirkan"
              : "Belum tepat",
            {
              fontFamily:
                "Arial",
              fontSize:
                "27px",
              fontStyle:
                "bold",
              color:
                "#203027",
            }
          );

        heading.setOrigin(
          0.5
        );

        /*
         * Feedback.
         */
        const feedback =
          this.add.text(
            0,
            -55,
            choice.feedback,
            {
              fontFamily:
                "Arial",
              fontSize:
                "14px",
              color:
                "#657168",
              align:
                "center",
              wordWrap: {
                width: 500,
              },
              lineSpacing:
                5,
            }
          );

        feedback.setOrigin(
          0.5
        );

        /*
         * Learning.
         */
        const learningBg =
          this.add
            .rectangle(
              0,
              45,
              500,
              82,
              COLORS.creamDark,
              1
            )
            .setStrokeStyle(
              2,
              0xe3d6c3,
              1
            );

        const learningTitle =
          this.add.text(
            -220,
            20,
            "🌱 YANG PERLU DIINGAT",
            {
              fontFamily:
                "Arial",
              fontSize:
                "11px",
              fontStyle:
                "bold",
              color:
                "#A87919",
            }
          );

        const learning =
          this.add.text(
            -220,
            43,
            choice.learning,
            {
              fontFamily:
                "Arial",
              fontSize:
                "12px",
              color:
                "#203027",
              wordWrap: {
                width: 440,
              },
              lineSpacing:
                3,
            }
          );

        /*
         * Rewards.
         */
        const rewardY = 135;

        const xpText =
          this.add.text(
            -170,
            rewardY,
            `⚡ +${choice.xp} XP`,
            {
              fontFamily:
                "Arial",
              fontSize:
                "17px",
              fontStyle:
                "bold",
              color:
                "#A87919",
            }
          );

        const coinText =
          this.add.text(
            40,
            rewardY,
            `🪙 +${choice.coins}`,
            {
              fontFamily:
                "Arial",
              fontSize:
                "17px",
              fontStyle:
                "bold",
              color:
                "#A87919",
            }
          );

        /*
         * Practice CTA.
         */
        const practiceButton =
          this.add
            .rectangle(
              0,
              200,
              390,
              52,
              COLORS.green,
              1
            )
            .setInteractive({
              useHandCursor:
                true,
            });

        const practiceText =
          this.add.text(
            0,
            186,
            "🌱  LANJUT PRAKTIK DI KEBUN",
            {
              fontFamily:
                "Arial",
              fontSize:
                "14px",
              fontStyle:
                "bold",
              color:
                "#FFFFFF",
            }
          );

        practiceText.setOrigin(
          0.5
        );

        panel.add([
          dim,
          bg,
          iconBg,
          icon,
          heading,
          feedback,
          learningBg,
          learningTitle,
          learning,
          xpText,
          coinText,
          practiceButton,
          practiceText,
        ]);

        panel.setDepth(
          300
        );

        panel.setScale(
          0.82
        );

        panel.alpha = 0;

        this.tweens.add({
          targets: panel,
          scale: 1,
          alpha: 1,
          duration: 300,
          ease: "Back.Out",
        });

        /*
         * CTA behavior.
         *
         * onComplete sudah dipanggil sebelumnya
         * supaya Academy bisa menyimpan progress.
         *
         * Tombol ini hanya memberitahu parent
         * bahwa user ingin masuk praktik.
         */
        practiceButton.on(
          "pointerover",
          () => {
            practiceButton.setFillStyle(
              COLORS.greenDark
            );
          }
        );

        practiceButton.on(
          "pointerout",
          () => {
            practiceButton.setFillStyle(
              COLORS.green
            );
          }
        );

        practiceButton.on(
          "pointerdown",
          () => {
            callbacksRef.current.onExit?.();
          }
        );

        this.resultPanel =
          panel;
      }

      /* ======================================================
         PARTICLES
      ====================================================== */

      createParticles(
        x,
        y,
        color
      ) {
        for (
          let i = 0;
          i < 24;
          i++
        ) {
          const particle =
            this.add.circle(
              x,
              y,
              Phaser.Math.Between(
                3,
                6
              ),
              color,
              1
            );

          particle.setDepth(
            250
          );

          this.tweens.add({
            targets:
              particle,

            x:
              x +
              Phaser.Math.Between(
                -110,
                110
              ),

            y:
              y +
              Phaser.Math.Between(
                -100,
                60
              ),

            alpha: 0,

            scale: 0,

            duration:
              Phaser.Math.Between(
                500,
                950
              ),

            ease:
              "Quad.Out",

            onComplete: () =>
              particle.destroy(),
          });
        }
      }

      /* ======================================================
         HUD
      ====================================================== */

      createHUD() {
        /*
         * Top bar.
         */
        const bar =
          this.add
            .rectangle(
              GAME_WIDTH / 2,
              42,
              GAME_WIDTH - 36,
              68,
              COLORS.navy,
              0.97
            )
            .setStrokeStyle(
              2,
              0x36553f,
              1
            );

        bar.setDepth(100);

        /*
         * Small label.
         */
        const label =
          this.add.text(
            52,
            18,
            "SMART ACADEMY  •  BUDIDAYA",
            {
              fontFamily:
                "Arial",
              fontSize:
                "10px",
              fontStyle:
                "bold",
              color:
                "#B8C8B8",
              letterSpacing:
                1.5,
            }
          );

        label.setDepth(
          101
        );

        /*
         * Title.
         */
        const title =
          this.add.text(
            52,
            38,
            "Cabai Setelah Hujan",
            {
              fontFamily:
                "Arial",
              fontSize:
                "19px",
              fontStyle:
                "bold",
              color:
                "#FFFFFF",
            }
          );

        title.setDepth(
          101
        );

        /*
         * Phase.
         */
        this.phaseText =
          this.add.text(
            420,
            32,
            "01  •  AMATI",
            {
              fontFamily:
                "Arial",
              fontSize:
                "12px",
              fontStyle:
                "bold",
              color:
                "#E8F1E8",
            }
          );

        this.phaseText.setDepth(
          101
        );

        /*
         * Evidence pill.
         */
        const counterBg =
          this.add
            .rectangle(
              1140,
              42,
              190,
              42,
              0x2e4d39,
              1
            );

        counterBg.setDepth(
          101
        );

        this.evidenceCounter =
          this.add.text(
            1060,
            32,
            "0 / 2 BUKTI",
            {
              fontFamily:
                "Arial",
              fontSize:
                "13px",
              fontStyle:
                "bold",
              color:
                "#FFFFFF",
            }
          );

        this.evidenceCounter.setOrigin(
          0.5
        );

        this.evidenceCounter.setDepth(
          102
        );
      }

      /* ======================================================
         EVIDENCE COUNTER
      ====================================================== */

      updateEvidenceCounter() {
        if (
          !this.evidenceCounter
        ) {
          return;
        }

        const count =
          this.observedIds.length;

        this.evidenceCounter.setText(
          `${count} / 2 BUKTI`
        );

        if (count >= 2) {
          this.evidenceCounter.setColor(
            "#DDF3E1"
          );

          this.phaseText?.setText(
            "02  •  PILIH KEPUTUSAN"
          );
        }
      }

      /* ======================================================
         INSTRUCTIONS
      ====================================================== */

      createInstructions() {
        const box =
          this.add.container(
            GAME_WIDTH / 2,
            655
          );

        const bg =
          this.add
            .rectangle(
              0,
              0,
              610,
              42,
              COLORS.cream,
              0.96
            )
            .setStrokeStyle(
              2,
              0xd9cdbb,
              1
            );

        const text =
          this.add.text(
            -275,
            -11,
            "👆 Temukan 2 bukti: cek tanah, daun, dan drainase.",
            {
              fontFamily:
                "Arial",
              fontSize:
                "12px",
              fontStyle:
                "bold",
              color:
                "#203027",
            }
          );

        box.add([
          bg,
          text,
        ]);

        box.setDepth(
          90
        );

        this.instructionBox =
          box;
      }

      /* ======================================================
         ENVIRONMENT ANIMATION
      ====================================================== */

      animateEnvironment() {
        /*
         * Rain.
         */
        this.rainDrops.forEach(
          (drop) => {
            this.tweens.add({
              targets: drop,

              y: {
                from:
                  Phaser.Math.Between(
                    -30,
                    280
                  ),

                to:
                  Phaser.Math.Between(
                    320,
                    520
                  ),
              },

              duration:
                Phaser.Math.Between(
                  700,
                  1150
                ),

              repeat: -1,

              delay:
                Phaser.Math.Between(
                  0,
                  1000
                ),

              onRepeat: () => {
                drop.x =
                  Phaser.Math.Between(
                    20,
                    GAME_WIDTH - 20
                  );
              },
            });
          }
        );

        /*
         * Water pulse.
         */
        this.waterPools.forEach(
          (pool) => {
            this.tweens.add({
              targets: pool,

              scaleX: 1.06,
              scaleY: 0.94,

              duration: 1100,

              yoyo: true,

              repeat: -1,

              ease:
                "Sine.InOut",
            });
          }
        );
      }

      /* ======================================================
         UPDATE
      ====================================================== */

      update() {
        /*
         * Counter terus sinkron.
         */
        if (
          this.evidenceCounter &&
          !this.isResultPhase
        ) {
          this.evidenceCounter.setText(
            `${this.observedIds.length} / 2 BUKTI`
          );
        }
      }
    }

    /* ========================================================
       PHASER CONFIG
    ======================================================== */

    const config = {
      type: Phaser.AUTO,

      parent:
        containerRef.current,

      width:
        GAME_WIDTH,

      height:
        GAME_HEIGHT,

      backgroundColor:
        "#91BD62",

      transparent:
        false,

      /*
       * Rendering.
       */
      render: {
        antialias: true,
        pixelArt: false,
        roundPixels: false,
      },

      /*
       * Scaling.
       *
       * FIT menjaga rasio 16:9.
       *
       * Tidak ada stretch.
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

        expandParent:
          false,

        autoRound:
          true,
      },

      /*
       * Input.
       */
      input: {
        activePointers: 3,
      },

      /*
       * Physics.
       */
      physics: {
        default:
          "arcade",

        arcade: {
          debug: false,
        },
      },

      scene: [
        CabaiScene,
      ],
    };

    /* ========================================================
       CREATE GAME
    ======================================================== */

    const game =
      new Phaser.Game(
        config
      );

    gameRef.current =
      game;

    /*
     * Expose API untuk Academy.jsx.
     */
    game.cabaiGame = {
      observe: (
        entityId
      ) => {
        const scene =
          game.scene.getScene(
            "CabaiScene"
          );

        if (!scene) {
          return;
        }

        const zone =
          scene.entityObjects[
            entityId
          ];

        if (zone) {
          scene.inspectEntity(
            entityId,
            zone
          );
        }
      },

      choose: (
        choice
      ) => {
        const scene =
          game.scene.getScene(
            "CabaiScene"
          );

        if (!scene) {
          return;
        }

        scene.selectChoice(
          choice
        );
      },

      replay: () => {
        const scene =
          game.scene.getScene(
            "CabaiScene"
          );

        if (!scene) {
          return;
        }

        scene.scene.restart();
      },

      exit: () => {
        callbacksRef.current.onExit?.();
      },
    };

    /* ========================================================
       RESIZE HANDLER
    ======================================================== */

    const handleResize =
      () => {
        if (
          gameRef.current
        ) {
          try {
            gameRef.current.scale.refresh();
          } catch (error) {
            console.warn(
              "[CabaiGame] resize error:",
              error
            );
          }
        }
      };

    window.addEventListener(
      "resize",
      handleResize
    );

    window.addEventListener(
      "orientationchange",
      handleResize
    );

    /* ========================================================
       CLEANUP
    ======================================================== */

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );

      window.removeEventListener(
        "orientationchange",
        handleResize
      );

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
  }, [mission?.id]);

  /* ==========================================================
     REACT CONTAINER
  ========================================================== */

  return (
    <div
      ref={containerRef}
      className="cabai-game-container"
      style={{
        width: "100%",
        maxWidth: "1280px",
        aspectRatio: "16 / 9",
        minHeight: 0,
        margin: "0 auto",
        overflow: "hidden",
        position: "relative",
        background: "#91BD62",
        borderRadius: "20px",
        touchAction: "none",
      }}
    />
  );
}