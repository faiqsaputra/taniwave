import Phaser from "phaser";
import { useEffect, useRef } from "react";

const GAME_WIDTH = 960;
const GAME_HEIGHT = 620;

const COLORS = {
  sky: 0xdcecf2,
  grass: 0x91bd6d,
  grassDark: 0x67954e,
  soil: 0x7b5134,
  soilDark: 0x5e3d29,

  leaf: 0x4f8f42,
  leafDark: 0x356c31,
  stem: 0x5d8f3c,

  yellow: 0xe2b84b,
  red: 0xc84b43,
  water: 0x74b8d8,

  white: 0xffffff,
  panel: 0xfffcf7,
  text: 0x253126,
  muted: 0x647067,

  success: 0x4f9a62,
  warning: 0xd49a3a,
  danger: 0xc45a50,
};

/* =========================================================
   DATA BIBIT
========================================================= */

const SEEDLINGS = {
  a: {
    id: "a",
    title: "Bibit A",
    subtitle: "Pertumbuhan",
    metric: "Terlalu memanjang",
    detail:
      "Batang terlihat tinggi dan kurus dengan jarak antar daun cukup jauh.",
    quality: "warning",
  },

  b: {
    id: "b",
    title: "Bibit B",
    subtitle: "Kondisi",
    metric: "Kokoh & segar",
    detail:
      "Batang terlihat kokoh dan daun berwarna relatif seragam.",
    quality: "good",
  },

  c: {
    id: "c",
    title: "Bibit C",
    subtitle: "Daun",
    metric: "Ada bercak",
    detail:
      "Terlihat bercak pada beberapa bagian daun sehingga perlu pemeriksaan lebih lanjut.",
    quality: "danger",
  },
};

const DECISIONS = [
  {
    id: "b",
    title: "Pilih Bibit B",
    description:
      "Utamakan bibit yang terlihat sehat dan kokoh.",
    score: 100,
    xp: 80,
    coins: 30,
    type: "good",
    feedback:
      "Kamu memilih berdasarkan kondisi tanaman, bukan sekadar tinggi atau ukuran.",
    learning:
      "Bibit sehat biasanya menjadi titik awal yang lebih baik untuk pertumbuhan.",
  },

  {
    id: "a",
    title: "Pilih Bibit A",
    description:
      "Pilih yang paling tinggi agar cepat besar.",
    score: 50,
    xp: 80,
    coins: 10,
    type: "warning",
    feedback:
      "Ukuran tinggi belum tentu berarti bibit lebih siap. Struktur batang dan kondisi keseluruhan perlu diperhatikan.",
    learning:
      "Jangan menyamakan tinggi tanaman dengan kualitas bibit.",
  },

  {
    id: "c",
    title: "Pilih Bibit C",
    description:
      "Coba saja karena daunnya masih banyak.",
    score: 35,
    xp: 80,
    coins: 5,
    type: "bad",
    feedback:
      "Bercak pada daun adalah sinyal untuk diperiksa lebih lanjut sebelum bibit dipindahkan.",
    learning:
      "Amati gejala tanaman sebelum memutuskan.",
  },
];

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
  const containerRef = useRef(null);
  const gameRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    class BibitScene extends Phaser.Scene {
      constructor() {
        super({
          key: "BibitScene",
        });

        this.observedIds = [];
        this.seedlingObjects = {};

        this.isDecisionPhase = false;
        this.isResultPhase = false;

        this.player = null;
        this.popup = null;
        this.decisionHint = null;

        this.sunParticles = [];
      }

      /* =====================================================
         CREATE
      ===================================================== */

      create() {
        this.createBackground();
        this.createNursery();
        this.createSeedlingTables();
        this.createSeedlings();
        this.createPlayer();
        this.createInteractionZones();
        this.createHUD();
        this.createInstructions();

        this.animateEnvironment();
      }

      /* =====================================================
         BACKGROUND
      ===================================================== */

      createBackground() {
        /*
         * Sky
         */

        this.add
          .rectangle(
            GAME_WIDTH / 2,
            150,
            GAME_WIDTH,
            300,
            COLORS.sky
          )
          .setDepth(-10);

        /*
         * Ground
         */

        this.add
          .rectangle(
            GAME_WIDTH / 2,
            460,
            GAME_WIDTH,
            320,
            COLORS.grass
          )
          .setDepth(-9);

        /*
         * Horizon
         */

        this.add
          .rectangle(
            GAME_WIDTH / 2,
            335,
            GAME_WIDTH,
            10,
            COLORS.grassDark
          )
          .setDepth(-8);

        /*
         * Hills
         */

        const hills =
          this.add.graphics();

        hills.fillStyle(
          0x9fc78a,
          1
        );

        hills.beginPath();

        hills.moveTo(0, 350);
        hills.lineTo(130, 255);
        hills.lineTo(280, 350);
        hills.lineTo(420, 240);
        hills.lineTo(590, 350);
        hills.lineTo(740, 255);
        hills.lineTo(900, 350);
        hills.lineTo(960, 290);
        hills.lineTo(960, 380);
        hills.lineTo(0, 380);

        hills.closePath();
        hills.fillPath();

        hills.setDepth(-7);

        /*
         * Sun
         */

        const sun =
          this.add.circle(
            820,
            115,
            42,
            0xf5ce66,
            0.9
          );

        sun.setDepth(-5);

        /*
         * Clouds
         */

        this.createCloud(
          140,
          105,
          1
        );

        this.createCloud(
          510,
          135,
          0.7
        );
      }

      createCloud(
        x,
        y,
        scale = 1
      ) {
        const cloud =
          this.add.graphics();

        cloud.fillStyle(
          COLORS.white,
          0.8
        );

        cloud.fillCircle(
          x,
          y,
          28 * scale
        );

        cloud.fillCircle(
          x + 30 * scale,
          y - 12 * scale,
          36 * scale
        );

        cloud.fillCircle(
          x + 66 * scale,
          y,
          25 * scale
        );

        cloud.fillRoundedRect(
          x - 15 * scale,
          y,
          95 * scale,
          25 * scale,
          12
        );

        cloud.setDepth(-4);
      }

      /* =====================================================
         NURSERY
      ===================================================== */

      createNursery() {
        /*
         * Nursery sign
         */

        const sign =
          this.add.container(
            480,
            285
          );

        const post =
          this.add.graphics();

        post.fillStyle(
          0x765338,
          1
        );

        post.fillRect(
          -5,
          15,
          10,
          80
        );

        const board =
          this.add
            .rectangle(
              0,
              0,
              260,
              58,
              COLORS.panel
            )
            .setStrokeStyle(
              3,
              COLORS.yellow,
              1
            );

        const title =
          this.add.text(
            -100,
            -20,
            "🌱 AREA PEMBIBITAN",
            {
              fontFamily:
                "Arial",
              fontSize:
                "16px",
              fontStyle:
                "bold",
              color:
                "#253126",
            }
          );

        const sub =
          this.add.text(
            -72,
            2,
            "Pilih bibit yang siap tanam",
            {
              fontFamily:
                "Arial",
              fontSize:
                "10px",
              color:
                "#647067",
            }
          );

        sign.add([
          post,
          board,
          title,
          sub,
        ]);

        sign.setDepth(4);
      }

      /* =====================================================
         TABLES
      ===================================================== */

      createSeedlingTables() {
        this.createTable(
          250,
          470
        );

        this.createTable(
          480,
          470
        );

        this.createTable(
          710,
          470
        );
      }

      createTable(
        x,
        y
      ) {
        const table =
          this.add.graphics();

        /*
         * Table top
         */

        table.fillStyle(
          0xa9794e,
          1
        );

        table.fillRoundedRect(
          x - 92,
          y - 20,
          184,
          22,
          8
        );

        /*
         * Legs
         */

        table.fillStyle(
          0x765338,
          1
        );

        table.fillRect(
          x - 70,
          y,
          10,
          55
        );

        table.fillRect(
          x + 60,
          y,
          10,
          55
        );

        table.setDepth(2);

        /*
         * Pot shadow
         */

        this.add
          .ellipse(
            x,
            y - 35,
            90,
            20,
            0x000000,
            0.08
          )
          .setDepth(3);
      }

      /* =====================================================
         SEEDLINGS
      ===================================================== */

      createSeedlings() {
        this.createSeedling(
          "a",
          250,
          420,
          {
            height: 105,
            stemWidth: 5,
            leafScale: 0.8,
          }
        );

        this.createSeedling(
          "b",
          480,
          420,
          {
            height: 72,
            stemWidth: 8,
            leafScale: 1,
          }
        );

        this.createSeedling(
          "c",
          710,
          420,
          {
            height: 78,
            stemWidth: 7,
            leafScale: 0.95,
          }
        );
      }

      createSeedling(
        id,
        x,
        y,
        options
      ) {
        const plant =
          this.add.container(
            x,
            y
          );

        /*
         * Pot
         */

        const pot =
          this.add.graphics();

        pot.fillStyle(
          0xc27a48,
          1
        );

        pot.fillRoundedRect(
          -35,
          5,
          70,
          45,
          8
        );

        pot.fillStyle(
          0x80502f,
          1
        );

        pot.fillEllipse(
          0,
          8,
          58,
          16
        );

        /*
         * Soil
         */

        const soil =
          this.add.graphics();

        soil.fillStyle(
          COLORS.soilDark,
          1
        );

        soil.fillEllipse(
          0,
          6,
          52,
          14
        );

        /*
         * Stem
         */

        const stem =
          this.add.graphics();

        stem.lineStyle(
          options.stemWidth,
          COLORS.stem,
          1
        );

        stem.beginPath();
        stem.moveTo(0, 8);
        stem.lineTo(
          0,
          -options.height
        );
        stem.strokePath();

        /*
         * Leaves
         */

        const leaves =
          this.add.graphics();

        const leafScale =
          options.leafScale;

        leaves.fillStyle(
          COLORS.leaf,
          1
        );

        const leafPositions = [
          [
            -16,
            -options.height +
              20,
          ],
          [
            17,
            -options.height +
              32,
          ],
          [
            -18,
            -options.height +
              48,
          ],
          [
            18,
            -options.height +
              62,
          ],
        ];

        leafPositions.forEach(
          ([lx, ly], index) => {
            leaves.fillEllipse(
              lx,
              ly,
              34 * leafScale,
              16 * leafScale
            );
          }
        );

        /*
         * Special appearance
         */

        if (id === "a") {
          /*
           * Bibit memanjang
           */

          leaves.fillStyle(
            COLORS.leafDark,
            1
          );

          leaves.fillEllipse(
            -20,
            -options.height +
              7,
            27,
            13
          );
        }

        if (id === "c") {
          /*
           * Bercak pada daun
           */

          const spots =
            this.add.graphics();

          spots.fillStyle(
            COLORS.yellow,
            1
          );

          spots.fillCircle(
            -17,
            -options.height +
              18,
            4
          );

          spots.fillCircle(
            18,
            -options.height +
              30,
            4
          );

          spots.fillCircle(
            -18,
            -options.height +
              50,
            3
          );

          plant.add(
            spots
          );
        }

        plant.add([
          pot,
          soil,
          stem,
          leaves,
        ]);

        plant.setDepth(8);

        /*
         * Label
         */

        const label =
          this.add
            .rectangle(
              x,
              y + 78,
              95,
              30,
              COLORS.panel,
              0.95
            )
            .setStrokeStyle(
              1,
              0xd9cdbb
            );

        const labelText =
          this.add.text(
            x - 25,
            y + 68,
            `BIBIT ${id.toUpperCase()}`,
            {
              fontFamily:
                "Arial",
              fontSize:
                "12px",
              fontStyle:
                "bold",
              color:
                "#253126",
            }
          );

        label.setDepth(9);
        labelText.setDepth(10);

        this.seedlingObjects[
          id
        ] = {
          plant,
          label,
        };
      }

      /* =====================================================
         PLAYER
      ===================================================== */

      createPlayer() {
        this.player =
          this.add.container(
            480,
            335
          );

        /*
         * Body
         */

        const body =
          this.add.graphics();

        body.fillStyle(
          0x8d5a45,
          1
        );

        body.fillRoundedRect(
          -21,
          0,
          42,
          58,
          14
        );

        /*
         * Shirt
         */

        const shirt =
          this.add.graphics();

        shirt.fillStyle(
          0xd0a84c,
          1
        );

        shirt.fillRoundedRect(
          -20,
          5,
          40,
          43,
          12
        );

        /*
         * Head
         */

        const head =
          this.add.graphics();

        head.fillStyle(
          0xb97850,
          1
        );

        head.fillCircle(
          0,
          -27,
          20
        );

        /*
         * Hat
         */

        const hat =
          this.add.graphics();

        hat.fillStyle(
          0x4c6b3c,
          1
        );

        hat.fillEllipse(
          0,
          -50,
          56,
          15
        );

        hat.fillRoundedRect(
          -19,
          -66,
          38,
          19,
          8
        );

        this.player.add([
          body,
          shirt,
          head,
          hat,
        ]);

        this.player.setDepth(
          20
        );
      }

      /* =====================================================
         INTERACTION ZONES
      ===================================================== */

      createInteractionZones() {
        this.createSeedlingZone(
          "a",
          250,
          390,
          145,
          145
        );

        this.createSeedlingZone(
          "b",
          480,
          390,
          145,
          145
        );

        this.createSeedlingZone(
          "c",
          710,
          390,
          145,
          145
        );
      }

      createSeedlingZone(
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

        zone.on(
          "pointerover",
          () => {
            if (
              this.isDecisionPhase ||
              this.isResultPhase
            ) {
              return;
            }

            this.highlightSeedling(
              id
            );
          }
        );

        zone.on(
          "pointerout",
          () => {
            this.unhighlightSeedling(
              id
            );
          }
        );

        zone.on(
          "pointerdown",
          () => {
            this.inspectSeedling(
              id,
              zone
            );
          }
        );

        this.seedlingObjects[
          id
        ].zone = zone;
      }

      /* =====================================================
         HIGHLIGHT
      ===================================================== */

      highlightSeedling(
        id
      ) {
        const item =
          this.seedlingObjects[
            id
          ];

        if (!item) {
          return;
        }

        if (
          item.highlight
        ) {
          return;
        }

        const highlight =
          this.add
            .ellipse(
              item.plant.x,
              item.plant.y -
                35,
              125,
              155,
              COLORS.yellow,
              0.13
            )
            .setStrokeStyle(
              3,
              COLORS.yellow,
              0.75
            )
            .setDepth(7);

        item.highlight =
          highlight;

        this.tweens.add({
          targets:
            highlight,
          alpha: 0.3,
          scale: 1.05,
          duration: 650,
          yoyo: true,
          repeat: -1,
        });
      }

      unhighlightSeedling(
        id
      ) {
        const item =
          this.seedlingObjects[
            id
          ];

        if (
          !item?.highlight
        ) {
          return;
        }

        item.highlight.destroy();
        item.highlight =
          null;
      }

      /* =====================================================
         INSPECTION
      ===================================================== */

      inspectSeedling(
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

        this.movePlayerTo(
          zone.x,
          zone.y - 85
        );

        this.showSeedlingPopup(
          id
        );

        if (
          typeof onEntityObserved ===
          "function"
        ) {
          onEntityObserved(
            SEEDLINGS[id]
          );
        }

        if (
          this.observedIds
            .length >= 2
        ) {
          this.time.delayedCall(
            900,
            () => {
              this.enterDecisionPhase();
            }
          );
        }
      }

      /* =====================================================
         POPUP
      ===================================================== */

      showSeedlingPopup(
        id
      ) {
        const data =
          SEEDLINGS[id];

        if (!data) {
          return;
        }

        if (this.popup) {
          this.popup.destroy();
        }

        const positions = {
          a: {
            x: 120,
            y: 285,
          },
          b: {
            x: 350,
            y: 285,
          },
          c: {
            x: 580,
            y: 285,
          },
        };

        const pos =
          positions[id];

        const popup =
          this.add.container(
            pos.x,
            pos.y
          );

        const bg =
          this.add
            .rectangle(
              0,
              0,
              270,
              125,
              COLORS.panel,
              0.98
            )
            .setStrokeStyle(
              2,
              COLORS.yellow,
              1
            );

        const badge =
          this.add
            .rectangle(
              -92,
              -43,
              72,
              23,
              this.getQualityColor(
                data.quality
              ),
              1
            );

        const badgeText =
          this.add.text(
            -116,
            -50,
            this.getQualityLabel(
              data.quality
            ),
            {
              fontFamily:
                "Arial",
              fontSize:
                "9px",
              fontStyle:
                "bold",
              color:
                "#FFFFFF",
            }
          );

        const title =
          this.add.text(
            -116,
            -20,
            data.title,
            {
              fontFamily:
                "Arial",
              fontSize:
                "18px",
              fontStyle:
                "bold",
              color:
                "#253126",
            }
          );

        const metric =
          this.add.text(
            -116,
            5,
            data.metric,
            {
              fontFamily:
                "Arial",
              fontSize:
                "13px",
              fontStyle:
                "bold",
              color:
                "#C45A50",
            }
          );

        const detail =
          this.add.text(
            -116,
            27,
            data.detail,
            {
              fontFamily:
                "Arial",
              fontSize:
                "10px",
              color:
                "#647067",
              wordWrap: {
                width: 235,
              },
              lineSpacing: 2,
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

        popup.setDepth(
          40
        );

        popup.setScale(
          0.85
        );

        this.tweens.add({
          targets:
            popup,
          scale: 1,
          duration: 180,
          ease: "Back.Out",
        });

        this.popup =
          popup;

        this.time.delayedCall(
          4500,
          () => {
            if (
              this.popup ===
              popup
            ) {
              popup.destroy();
              this.popup =
                null;
            }
          }
        );
      }

      getQualityColor(
        quality
      ) {
        if (
          quality === "good"
        ) {
          return COLORS.success;
        }

        if (
          quality === "danger"
        ) {
          return COLORS.danger;
        }

        return COLORS.warning;
      }

      getQualityLabel(
        quality
      ) {
        if (
          quality === "good"
        ) {
          return "SEHAT";
        }

        if (
          quality === "danger"
        ) {
          return "PERLU CEK";
        }

        return "PERHATIKAN";
      }

      /* =====================================================
         PLAYER MOVEMENT
      ===================================================== */

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
          x,
          y,
          duration: 500,
          ease: "Sine.Out",
        });
      }

      /* =====================================================
         DECISION PHASE
      ===================================================== */

      enterDecisionPhase() {
        if (
          this.isDecisionPhase
        ) {
          return;
        }

        this.isDecisionPhase =
          true;

        if (
          typeof onObservationComplete ===
          "function"
        ) {
          onObservationComplete({
            observedIds:
              this.observedIds,
            complete: true,
          });
        }

        this.showDecisionHint();
      }

      showDecisionHint() {
        const hint =
          this.add.container(
            480,
            95
          );

        const bg =
          this.add
            .rectangle(
              0,
              0,
              470,
              58,
              COLORS.panel,
              0.98
            )
            .setStrokeStyle(
              2,
              COLORS.success
            );

        const icon =
          this.add.circle(
            -205,
            0,
            16,
            COLORS.success
          );

        const check =
          this.add.text(
            -211,
            -10,
            "✓",
            {
              fontFamily:
                "Arial",
              fontSize:
                "17px",
              fontStyle:
                "bold",
              color:
                "#FFFFFF",
            }
          );

        const title =
          this.add.text(
            -175,
            -18,
            "Kamu sudah punya cukup bukti",
            {
              fontFamily:
                "Arial",
              fontSize:
                "14px",
              fontStyle:
                "bold",
              color:
                "#253126",
            }
          );

        const subtitle =
          this.add.text(
            -175,
            5,
            "Sekarang tentukan bibit mana yang siap tanam.",
            {
              fontFamily:
                "Arial",
              fontSize:
                "10px",
              color:
                "#647067",
            }
          );

        hint.add([
          bg,
          icon,
          check,
          title,
          subtitle,
        ]);

        hint.setDepth(
          60
        );

        this.decisionHint =
          hint;

        this.tweens.add({
          targets:
            hint,
          y: 100,
          duration: 600,
          yoyo: true,
          repeat: -1,
          ease: "Sine.InOut",
        });
      }

      /* =====================================================
         CHOICE
      ===================================================== */

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
          this.decisionHint
        ) {
          this.decisionHint.destroy();

          this.decisionHint =
            null;
        }

        this.animateChoice(
          choice
        );

        this.time.delayedCall(
          1600,
          () => {
            this.showResult(
              choice
            );
          }
        );
      }

      /* =====================================================
         CONSEQUENCE
      ===================================================== */

      animateChoice(
        choice
      ) {
        const item =
          this.seedlingObjects[
            choice.id
          ];

        if (!item) {
          return;
        }

        /*
         * Good choice
         */

        if (
          choice.id === "b"
        ) {
          this.animateGoodChoice(
            item
          );
          return;
        }

        /*
         * Tall seedling
         */

        if (
          choice.id === "a"
        ) {
          this.animateTallSeedling(
            item
          );
          return;
        }

        /*
         * Spotted seedling
         */

        if (
          choice.id === "c"
        ) {
          this.animateSpottedSeedling(
            item
          );
        }
      }

      /* =====================================================
         GOOD
      ===================================================== */

      animateGoodChoice(
        item
      ) {
        const plant =
          item.plant;

        /*
         * Glow
         */

        const glow =
          this.add
            .ellipse(
              plant.x,
              plant.y -
                35,
              125,
              155,
              COLORS.success,
              0.16
            )
            .setStrokeStyle(
              4,
              COLORS.success,
              0.9
            )
            .setDepth(6);

        this.tweens.add({
          targets:
            glow,
          scale: 1.12,
          alpha: 0,
          duration: 1200,
          onComplete: () =>
            glow.destroy(),
        });

        /*
         * Lift plant
         */

        this.tweens.add({
          targets:
            plant,
          y:
            plant.y - 12,
          duration: 500,
          yoyo: true,
          ease: "Back.Out",
        });

        /*
         * Sparkles
         */

        this.createSuccessParticles(
          plant.x,
          plant.y - 80
        );
      }

      /* =====================================================
         A
      ===================================================== */

      animateTallSeedling(
        item
      ) {
        const plant =
          item.plant;

        this.tweens.add({
          targets:
            plant,
          angle: -4,
          duration: 250,
          yoyo: true,
          repeat: 2,
        });

        this.createWarningParticles(
          plant.x,
          plant.y - 90
        );
      }

      /* =====================================================
         C
      ===================================================== */

      animateSpottedSeedling(
        item
      ) {
        const plant =
          item.plant;

        this.tweens.add({
          targets:
            plant,
          alpha: 0.65,
          duration: 350,
          yoyo: true,
          repeat: 2,
        });

        this.createDangerParticles(
          plant.x,
          plant.y - 75
        );
      }

      /* =====================================================
         PARTICLES
      ===================================================== */

      createSuccessParticles(
        x,
        y
      ) {
        for (
          let i = 0;
          i < 20;
          i++
        ) {
          const particle =
            this.add.star(
              x,
              y,
              5,
              2,
              7,
              COLORS.yellow
            );

          particle.setDepth(
            50
          );

          this.tweens.add({
            targets:
              particle,
            x:
              x +
              Phaser.Math.Between(
                -80,
                80
              ),
            y:
              y +
              Phaser.Math.Between(
                -70,
                20
              ),
            alpha: 0,
            scale: 0,
            duration:
              Phaser.Math.Between(
                500,
                900
              ),
            onComplete: () =>
              particle.destroy(),
          });
        }
      }

      createWarningParticles(
        x,
        y
      ) {
        for (
          let i = 0;
          i < 12;
          i++
        ) {
          const particle =
            this.add.circle(
              x,
              y,
              Phaser.Math.Between(
                2,
                5
              ),
              COLORS.warning
            );

          particle.setDepth(
            50
          );

          this.tweens.add({
            targets:
              particle,
            x:
              x +
              Phaser.Math.Between(
                -60,
                60
              ),
            y:
              y +
              Phaser.Math.Between(
                -50,
                20
              ),
            alpha: 0,
            duration: 700,
            onComplete: () =>
              particle.destroy(),
          });
        }
      }

      createDangerParticles(
        x,
        y
      ) {
        for (
          let i = 0;
          i < 12;
          i++
        ) {
          const particle =
            this.add.circle(
              x,
              y,
              Phaser.Math.Between(
                2,
                5
              ),
              COLORS.danger
            );

          particle.setDepth(
            50
          );

          this.tweens.add({
            targets:
              particle,
            x:
              x +
              Phaser.Math.Between(
                -60,
                60
              ),
            y:
              y +
              Phaser.Math.Between(
                -40,
                30
              ),
            alpha: 0,
            duration: 700,
            onComplete: () =>
              particle.destroy(),
          });
        }
      }

      /* =====================================================
         RESULT
      ===================================================== */

      showResult(
        choice
      ) {
        const result = {
          choice,
          observedIds:
            this.observedIds,
          score:
            choice.score,
          xp: choice.xp,
          coins:
            choice.coins,
        };

        if (
          typeof onResult ===
          "function"
        ) {
          onResult(result);
        }

        if (
          typeof onComplete ===
          "function"
        ) {
          onComplete(result);
        }
      }

      /* =====================================================
         HUD
      ===================================================== */

      createHUD() {
        this.add
          .rectangle(
            480,
            35,
            900,
            54,
            COLORS.text,
            0.94
          )
          .setDepth(100);

        this.add
          .text(
            55,
            15,
            "🌱  PILIH BIBIT YANG SIAP TANAM",
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
          )
          .setDepth(101);

        this.add
          .text(
            55,
            39,
            "Jangan hanya lihat ukuran. Periksa kondisi tanaman.",
            {
              fontFamily:
                "Arial",
              fontSize:
                "10px",
              color:
                "#DCE8D8",
            }
          )
          .setDepth(101);

        this.evidenceCounter =
          this.add
            .text(
              805,
              22,
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
            )
            .setDepth(101);
      }

      /* =====================================================
         INSTRUCTIONS
      ===================================================== */

      createInstructions() {
        const box =
          this.add.container(
            480,
            575
          );

        const bg =
          this.add
            .rectangle(
              0,
              0,
              590,
              46,
              COLORS.panel,
              0.95
            )
            .setStrokeStyle(
              1,
              0xd9cdbb
            );

        const text =
          this.add.text(
            -265,
            -10,
            "👆 Klik minimal 2 bibit untuk membandingkan kondisinya.",
            {
              fontFamily:
                "Arial",
              fontSize:
                "12px",
              color:
                "#253126",
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

      /* =====================================================
         ANIMATION
      ===================================================== */

      animateEnvironment() {
        /*
         * Sun pulse
         */

        const sun =
          this.children.list.find(
            (item) =>
              item.type ===
                "Arc" &&
              item.x ===
                820 &&
              item.y ===
                115
          );

        if (sun) {
          this.tweens.add({
            targets:
              sun,
            scale: 1.08,
            alpha: 0.75,
            duration: 1800,
            yoyo: true,
            repeat: -1,
            ease: "Sine.InOut",
          });
        }

        /*
         * Seedling idle animation
         */

        Object.values(
          this.seedlingObjects
        ).forEach(
          (item, index) => {
            this.tweens.add({
              targets:
                item.plant,
              angle:
                index % 2 === 0
                  ? -1.5
                  : 1.5,
              duration:
                1500 +
                index * 100,
              yoyo: true,
              repeat: -1,
              ease: "Sine.InOut",
            });
          }
        );
      }

      /* =====================================================
         UPDATE
      ===================================================== */

      update() {
        if (
          this.evidenceCounter
        ) {
          this.evidenceCounter.setText(
            `${this.observedIds.length} / 2 BUKTI`
          );
        }
      }
    }

    const config = {
      type: Phaser.AUTO,

      parent:
        containerRef.current,

      width:
        GAME_WIDTH,

      height:
        GAME_HEIGHT,

      backgroundColor:
        "#DCECF2",

      render: {
        antialias: true,
        pixelArt: false,
      },

      scale: {
        mode:
          Phaser.Scale.FIT,

        autoCenter:
          Phaser.Scale.CENTER_BOTH,

        width:
          GAME_WIDTH,

        height:
          GAME_HEIGHT,
      },

      physics: {
        default: "arcade",

        arcade: {
          debug: false,
        },
      },

      scene: [
        BibitScene,
      ],
    };

    const game =
      new Phaser.Game(
        config
      );

    gameRef.current =
      game;

    /*
     * API untuk Academy.jsx
     */

    game.bibitGame = {
      observe: (
        entityId
      ) => {
        const scene =
          game.scene.getScene(
            "BibitScene"
          );

        if (!scene) {
          return;
        }

        const zone =
          scene.seedlingObjects[
            entityId
          ]?.zone;

        if (zone) {
          scene.inspectSeedling(
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
            "BibitScene"
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
            "BibitScene"
          );

        if (!scene) {
          return;
        }

        scene.scene.restart();
      },
    };

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
  }, [
    mission,
    onEntityObserved,
    onObservationComplete,
    onResult,
    onComplete,
    onExit,
  ]);

  return (
    <div
      ref={containerRef}
      className="bibit-game-container"
      style={{
        width: "100%",
        minHeight: 620,
        overflow: "hidden",
        borderRadius: 20,
      }}
    />
  );
}