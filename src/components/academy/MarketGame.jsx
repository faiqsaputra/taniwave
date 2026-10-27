import Phaser from "phaser";
import { useEffect, useRef } from "react";

const GAME_WIDTH = 960;
const GAME_HEIGHT = 620;

const COLORS = {
  sky: 0xe8f0e7,
  grass: 0xb2c98d,
  grassDark: 0x78985d,

  market: 0xc98d55,
  marketDark: 0x8d5d3d,

  red: 0xc45a50,
  redSoft: 0xf4dddd,

  yellow: 0xd4a017,
  yellowSoft: 0xf8edc9,

  green: 0x4f9460,
  greenSoft: 0xe1f0e3,

  blue: 0x5c91b4,
  blueSoft: 0xe2eff5,

  brown: 0x725039,
  soil: 0x765037,

  white: 0xffffff,
  panel: 0xfffcf7,
  text: 0x263128,
  muted: 0x68736b,
};

/* =========================================================
   MARKET DATA
========================================================= */

const MARKET_CHANNELS = {
  tengkulak: {
    id: "tengkulak",
    title: "Pembeli Langsung",
    subtitle: "Cepat & praktis",
    price: "Rp18.000",
    priceNumber: 18000,
    color: COLORS.red,
    description:
      "Hasil langsung diambil. Kamu tidak perlu mencari pembeli lain.",
    risk:
      "Harga lebih rendah dan kamu bergantung pada satu pembeli.",
  },

  pasar: {
    id: "pasar",
    title: "Pasar Lokal",
    subtitle: "Jual sendiri",
    price: "Rp21.000",
    priceNumber: 21000,
    color: COLORS.yellow,
    description:
      "Kamu bisa mendapatkan harga lebih baik dengan menjual langsung.",
    risk:
      "Perlu waktu, transportasi, dan tenaga untuk menjual.",
  },

  umkm: {
    id: "umkm",
    title: "UMKM Kuliner",
    subtitle: "Pembeli rutin",
    price: "Rp23.000",
    priceNumber: 23000,
    color: COLORS.green,
    description:
      "Pembeli membutuhkan kualitas yang konsisten dan pasokan teratur.",
    risk:
      "Kamu perlu memenuhi kualitas dan menjaga hubungan dengan pembeli.",
  },
};

const DECISIONS = [
  {
    id: "grade",
    title:
      "Sortir dan cari beberapa kanal penjualan",
    description:
      "Pisahkan kualitas dan jangan bergantung pada satu pembeli.",
    score: 100,
    xp: 100,
    coins: 40,
    feedback:
      "Kamu tidak hanya mengejar harga tertinggi. Kamu melihat kualitas dan membandingkan beberapa kanal penjualan.",
    learning:
      "Keputusan usaha tani tidak berhenti di produksi. Pasar, kualitas, dan kanal penjualan juga perlu dibaca.",
  },

  {
    id: "hold",
    title:
      "Tahan seluruh panen",
    description:
      "Simpan semua sampai harga naik lagi.",
    score: 55,
    xp: 100,
    coins: 15,
    feedback:
      "Menahan panen dapat menjadi pilihan, tetapi ada biaya penyimpanan dan risiko kualitas yang harus dihitung.",
    learning:
      "Setiap strategi pasar punya biaya, risiko, dan batas waktu.",
  },

  {
    id: "sell",
    title:
      "Jual semua ke pembeli pertama",
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
];

/* =========================================================
   GAME
========================================================= */

export default function MarketGame({
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

    class MarketScene extends Phaser.Scene {
      constructor() {
        super({
          key: "MarketScene",
        });

        this.observedIds = [];

        this.marketObjects = {};

        this.isDecisionPhase = false;
        this.isResultPhase = false;

        this.player = null;
        this.popup = null;
        this.decisionHint = null;

        this.selectedChannels = [];
      }

      /* =====================================================
         CREATE
      ===================================================== */

      create() {
        this.createBackground();
        this.createMarketEnvironment();
        this.createMarketStalls();
        this.createHarvestCrates();
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
            170,
            GAME_WIDTH,
            340,
            COLORS.sky
          )
          .setDepth(-10);

        /*
         * Ground
         */

        this.add
          .rectangle(
            GAME_WIDTH / 2,
            470,
            GAME_WIDTH,
            300,
            COLORS.grass
          )
          .setDepth(-9);

        /*
         * Ground stripe
         */

        this.add
          .rectangle(
            GAME_WIDTH / 2,
            355,
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
          0xc3d5a5,
          1
        );

        hills.beginPath();

        hills.moveTo(0, 365);
        hills.lineTo(120, 265);
        hills.lineTo(260, 365);
        hills.lineTo(390, 280);
        hills.lineTo(560, 365);
        hills.lineTo(700, 250);
        hills.lineTo(840, 365);
        hills.lineTo(960, 275);
        hills.lineTo(960, 390);
        hills.lineTo(0, 390);

        hills.closePath();

        hills.fillPath();

        hills.setDepth(-7);

        /*
         * Sun
         */

        this.add
          .circle(
            830,
            105,
            43,
            0xf0c75e,
            0.9
          )
          .setDepth(-5);

        /*
         * Clouds
         */

        this.createCloud(
          130,
          110,
          1
        );

        this.createCloud(
          530,
          130,
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
          0.78
        );

        cloud.fillCircle(
          x,
          y,
          27 * scale
        );

        cloud.fillCircle(
          x + 31 * scale,
          y - 12 * scale,
          36 * scale
        );

        cloud.fillCircle(
          x + 65 * scale,
          y,
          24 * scale
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
         MARKET ENVIRONMENT
      ===================================================== */

      createMarketEnvironment() {
        /*
         * Market roof
         */

        const roof =
          this.add.graphics();

        roof.fillStyle(
          COLORS.market,
          1
        );

        roof.fillTriangle(
          120,
          235,
          480,
          105,
          840,
          235
        );

        roof.fillRect(
          120,
          220,
          720,
          32
        );

        roof.setDepth(0);

        /*
         * Market building
         */

        this.add
          .rectangle(
            480,
            300,
            700,
            135,
            0xf1dfc5
          )
          .setDepth(-1);

        /*
         * Pillars
         */

        const pillars =
          this.add.graphics();

        pillars.fillStyle(
          COLORS.marketDark,
          1
        );

        [
          145,
          315,
          480,
          645,
          815,
        ].forEach(
          (x) => {
            pillars.fillRect(
              x,
              225,
              13,
              145
            );
          }
        );

        pillars.setDepth(1);

        /*
         * Market sign
         */

        const sign =
          this.add
            .rectangle(
              480,
              185,
              300,
              55,
              COLORS.panel
            )
            .setStrokeStyle(
              3,
              COLORS.yellow
            );

        sign.setDepth(3);

        this.add
          .text(
            390,
            165,
            "🧺 PASAR TANI",
            {
              fontFamily:
                "Arial",
              fontSize:
                "18px",
              fontStyle:
                "bold",
              color:
                "#263128",
            }
          )
          .setDepth(4);

        this.add
          .text(
            390,
            190,
            "Baca pasar sebelum menjual",
            {
              fontFamily:
                "Arial",
              fontSize:
                "10px",
              color:
                "#68736B",
            }
          )
          .setDepth(4);
      }

      /* =====================================================
         MARKET STALLS
      ===================================================== */

      createMarketStalls() {
        this.createStall(
          220,
          340,
          "tengkulak"
        );

        this.createStall(
          480,
          340,
          "pasar"
        );

        this.createStall(
          740,
          340,
          "umkm"
        );
      }

      createStall(
        x,
        y,
        channelId
      ) {
        const channel =
          MARKET_CHANNELS[
            channelId
          ];

        const container =
          this.add.container(
            x,
            y
          );

        /*
         * Counter
         */

        const counter =
          this.add
            .rectangle(
              0,
              30,
              190,
              70,
              COLORS.marketDark
            )
            .setStrokeStyle(
              2,
              0x67442f
            );

        /*
         * Awning
         */

        const awning =
          this.add.graphics();

        awning.fillStyle(
          channel.color,
          1
        );

        awning.fillRect(
          -95,
          -25,
          190,
          35
        );

        /*
         * Price card
         */

        const price =
          this.add
            .rectangle(
              0,
              -62,
              145,
              48,
              COLORS.panel
            )
            .setStrokeStyle(
              2,
              channel.color
            );

        const title =
          this.add.text(
            -75,
            -82,
            channel.title,
            {
              fontFamily:
                "Arial",
              fontSize:
                "11px",
              fontStyle:
                "bold",
              color:
                "#263128",
            }
          );

        const priceText =
          this.add.text(
            -65,
            -62,
            channel.price,
            {
              fontFamily:
                "Arial",
              fontSize:
                "16px",
              fontStyle:
                "bold",
              color:
                "#263128",
            }
          );

        /*
         * Icon
         */

        const icon =
          this.add.text(
            -16,
            4,
            this.getChannelIcon(
              channelId
            ),
            {
              fontSize:
                "28px",
            }
          );

        container.add([
          counter,
          awning,
          price,
          title,
          priceText,
          icon,
        ]);

        container.setDepth(
          7
        );

        this.marketObjects[
          channelId
        ] = {
          container,
          channel,
        };
      }

      getChannelIcon(
        id
      ) {
        if (
          id === "tengkulak"
        ) {
          return "🤝";
        }

        if (
          id === "pasar"
        ) {
          return "🧺";
        }

        return "🍜";
      }

      /* =====================================================
         HARVEST CRATES
      ===================================================== */

      createHarvestCrates() {
        const crate =
          this.add.graphics();

        crate.fillStyle(
          0xb77b43,
          1
        );

        crate.fillRoundedRect(
          60,
          430,
          130,
          80,
          8
        );

        crate.lineStyle(
          5,
          0x85572f,
          1
        );

        crate.strokeRect(
          70,
          440,
          110,
          60
        );

        crate.setDepth(5);

        this.add
          .text(
            75,
            450,
            "🌶️ 🌶️ 🌶️",
            {
              fontSize:
                "22px",
            }
          )
          .setDepth(6);

        this.add
          .text(
            77,
            482,
            "HASIL PANEN",
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
          )
          .setDepth(6);
      }

      /* =====================================================
         PLAYER
      ===================================================== */

      createPlayer() {
        this.player =
          this.add.container(
            480,
            480
          );

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

        const shirt =
          this.add.graphics();

        shirt.fillStyle(
          0xc89b3c,
          1
        );

        shirt.fillRoundedRect(
          -20,
          5,
          40,
          43,
          12
        );

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

        const hat =
          this.add.graphics();

        hat.fillStyle(
          0x526a3d,
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
         INTERACTION
      ===================================================== */

      createInteractionZones() {
        this.createMarketZone(
          "tengkulak",
          220
        );

        this.createMarketZone(
          "pasar",
          480
        );

        this.createMarketZone(
          "umkm",
          740
        );

        /*
         * Panen
         */

        const harvestZone =
          this.add
            .zone(
              125,
              470,
              150,
              100
            )
            .setInteractive({
              useHandCursor: true,
            });

        harvestZone.on(
          "pointerdown",
          () => {
            this.inspectHarvest();
          }
        );
      }

      createMarketZone(
        id,
        x
      ) {
        const zone =
          this.add
            .zone(
              x,
              340,
              200,
              180
            )
            .setInteractive({
              useHandCursor: true,
            });

        zone.setData(
          "channelId",
          id
        );

        zone.on(
          "pointerover",
          () => {
            if (
              this.isResultPhase
            ) {
              return;
            }

            this.highlightMarket(
              id
            );
          }
        );

        zone.on(
          "pointerout",
          () => {
            this.unhighlightMarket(
              id
            );
          }
        );

        zone.on(
          "pointerdown",
          () => {
            this.inspectMarket(
              id
            );
          }
        );

        this.marketObjects[
          id
        ].zone = zone;
      }

      /* =====================================================
         INSPECT HARVEST
      ===================================================== */

      inspectHarvest() {
        if (
          this.isResultPhase
        ) {
          return;
        }

        if (
          !this.observedIds.includes(
            "stock"
          )
        ) {
          this.observedIds.push(
            "stock"
          );
        }

        this.movePlayerTo(
          125,
          390
        );

        this.showHarvestPopup();

        this.notifyEntity(
          "stock"
        );

        this.checkObservationProgress();
      }

      showHarvestPopup() {
        this.createPopup(
          125,
          320,
          {
            title:
              "HASIL PANEN",
            badge:
              "LAYAK JUAL",
            badgeColor:
              COLORS.green,
            metric:
              "Kualitas masih baik",
            detail:
              "Sebagian besar hasil panen masih berada dalam kondisi yang dapat dipasarkan.",
          }
        );
      }

      /* =====================================================
         INSPECT MARKET
      ===================================================== */

      inspectMarket(
        id
      ) {
        if (
          this.isResultPhase
        ) {
          return;
        }

        if (
          !this.observedIds.includes(
            "market"
          )
        ) {
          this.observedIds.push(
            "market"
          );
        }

        this.movePlayerTo(
          this.marketObjects[
            id
          ].container.x,
          430
        );

        this.showMarketPopup(
          id
        );

        this.notifyEntity(
          "market"
        );

        this.checkObservationProgress();
      }

      showMarketPopup(
        id
      ) {
        const channel =
          MARKET_CHANNELS[
            id
          ];

        this.createPopup(
          this.marketObjects[
            id
          ].container.x,
          260,
          {
            title:
              channel.title,
            badge:
              channel.subtitle,
            badgeColor:
              channel.color,
            metric:
              channel.price,
            detail:
              `${channel.description} ${channel.risk}`,
          }
        );
      }

      /* =====================================================
         COST INSPECTION
      ===================================================== */

      inspectCost() {
        if (
          this.isResultPhase
        ) {
          return;
        }

        if (
          !this.observedIds.includes(
            "cost"
          )
        ) {
          this.observedIds.push(
            "cost"
          );
        }

        this.createPopup(
          820,
          390,
          {
            title:
              "MODAL TERBATAS",
            badge:
              "PERHATIKAN BIAYA",
            badgeColor:
              COLORS.yellow,
            metric:
              "Jangan hanya lihat harga",
            detail:
              "Strategi penjualan juga harus memperhitungkan transportasi, waktu, penyimpanan, dan tenaga.",
          }
        );

        this.notifyEntity(
          "cost"
        );

        this.checkObservationProgress();
      }

      /* =====================================================
         POPUP
      ===================================================== */

      createPopup(
        x,
        y,
        data
      ) {
        if (this.popup) {
          this.popup.destroy();
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
              280,
              140,
              COLORS.panel,
              0.98
            )
            .setStrokeStyle(
              2,
              data.badgeColor
            );

        const badge =
          this.add
            .rectangle(
              -100,
              -52,
              100,
              23,
              data.badgeColor
            );

        const badgeText =
          this.add.text(
            -132,
            -60,
            data.badge,
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
            -132,
            -30,
            data.title,
            {
              fontFamily:
                "Arial",
              fontSize:
                "17px",
              fontStyle:
                "bold",
              color:
                "#263128",
            }
          );

        const metric =
          this.add.text(
            -132,
            -4,
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
            -132,
            20,
            data.detail,
            {
              fontFamily:
                "Arial",
              fontSize:
                "10px",
              color:
                "#68736B",
              wordWrap: {
                width: 245,
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
          50
        );

        popup.setScale(
          0.8
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

      /* =====================================================
         ENTITY
      ===================================================== */

      notifyEntity(
        id
      ) {
        const entity =
          {
            market: {
              id: "market",
              label: "Pasar",
              subtitle: "Harga",
              metric:
                "Turun 20%",
              detail:
                "Harga sedang melemah. Menjual semuanya pada satu waktu meningkatkan ketergantungan pada harga hari ini.",
            },

            stock: {
              id: "stock",
              label:
                "Hasil panen",
              subtitle:
                "Kualitas",
              metric:
                "Layak jual",
              detail:
                "Sebagian besar hasil panen masih berada dalam kondisi yang dapat dipasarkan.",
            },

            cost: {
              id: "cost",
              label: "Biaya",
              subtitle:
                "Operasional",
              metric:
                "Terbatas",
              detail:
                "Modal tambahan terbatas sehingga strategi baru harus memperhatikan biaya.",
            },
          }[id];

        if (
          typeof onEntityObserved ===
          "function"
        ) {
          onEntityObserved(
            entity
          );
        }
      }

      /* =====================================================
         PROGRESS
      ===================================================== */

      checkObservationProgress() {
        /*
         * Minimal tiga bukti:
         * market
         * stock
         * cost
         */

        if (
          this.observedIds.length >=
            3 &&
          !this.isDecisionPhase
        ) {
          this.enterDecisionPhase();
        }
      }

      enterDecisionPhase() {
        this.isDecisionPhase =
          true;

        if (
          this.instructionBox
        ) {
          this.instructionBox.destroy();
        }

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

      /* =====================================================
         DECISION
      ===================================================== */

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
              500,
              60,
              COLORS.panel,
              0.98
            )
            .setStrokeStyle(
              2,
              COLORS.green
            );

        const icon =
          this.add.circle(
            -220,
            0,
            16,
            COLORS.green
          );

        const check =
          this.add.text(
            -226,
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
            -190,
            -18,
            "Kondisi pasar sudah kamu baca",
            {
              fontFamily:
                "Arial",
              fontSize:
                "14px",
              fontStyle:
                "bold",
              color:
                "#263128",
            }
          );

        const subtitle =
          this.add.text(
            -190,
            5,
            "Sekarang pilih strategi penjualanmu.",
            {
              fontFamily:
                "Arial",
              fontSize:
                "10px",
              color:
                "#68736B",
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
         SELECT DECISION
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

        this.showStrategyConsequence(
          choice
        );

        this.time.delayedCall(
          1700,
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

      showStrategyConsequence(
        choice
      ) {
        if (
          choice.id ===
          "grade"
        ) {
          this.animateGradeStrategy();
        }

        if (
          choice.id ===
          "hold"
        ) {
          this.animateHoldStrategy();
        }

        if (
          choice.id ===
          "sell"
        ) {
          this.animateSellStrategy();
        }
      }

      animateGradeStrategy() {
        /*
         * Highlight multiple stalls
         */

        [
          "pasar",
          "umkm",
        ].forEach(
          (id) => {
            const item =
              this.marketObjects[
                id
              ];

            this.tweens.add({
              targets:
                item.container,
              scale: 1.08,
              duration: 400,
              yoyo: true,
              repeat: 1,
              ease: "Back.Out",
            });
          }
        );

        this.createSuccessParticles(
          480,
          340
        );

        this.createFloatingText(
          480,
          290,
          "SORTIR + BANDINKAN",
          COLORS.green
        );
      }

      animateHoldStrategy() {
        this.createFloatingText(
          480,
          290,
          "TUNGGU HARGA",
          COLORS.yellow
        );

        /*
         * Crate gets highlighted
         */

        const crate =
          this.add
            .rectangle(
              125,
              470,
              145,
              90,
              COLORS.yellow,
              0.12
            )
            .setStrokeStyle(
              3,
              COLORS.yellow
            )
            .setDepth(4);

        this.tweens.add({
          targets:
            crate,
          alpha: 0.1,
          duration: 500,
          yoyo: true,
          repeat: 2,
          onComplete: () =>
            crate.destroy(),
        });
      }

      animateSellStrategy() {
        /*
         * First stall becomes highlighted
         */

        const stall =
          this.marketObjects[
            "tengkulak"
          ];

        this.tweens.add({
          targets:
            stall.container,
          scale: 1.1,
          duration: 350,
          yoyo: true,
          repeat: 2,
          ease: "Back.Out",
        });

        this.createFloatingText(
          220,
          290,
          "JUAL CEPAT",
          COLORS.red
        );

        this.createWarningParticles(
          220,
          340
        );
      }

      /* =====================================================
         FLOATING TEXT
      ===================================================== */

      createFloatingText(
        x,
        y,
        text,
        color
      ) {
        const label =
          this.add
            .text(
              x,
              y,
              text,
              {
                fontFamily:
                  "Arial",
                fontSize:
                  "16px",
                fontStyle:
                  "bold",
                color:
                  this.toHex(color),
                stroke:
                  "#FFFFFF",
                strokeThickness:
                  5,
              }
            )
            .setOrigin(0.5)
            .setDepth(80);

        this.tweens.add({
          targets:
            label,
          y:
            y - 45,
          alpha: 0,
          duration: 1300,
          ease: "Cubic.Out",
          onComplete: () =>
            label.destroy(),
        });
      }

      toHex(
        color
      ) {
        return (
          "#" +
          color
            .toString(16)
            .padStart(6, "0")
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
          i < 18;
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
            70
          );

          this.tweens.add({
            targets:
              particle,
            x:
              x +
              Phaser.Math.Between(
                -100,
                100
              ),
            y:
              y +
              Phaser.Math.Between(
                -70,
                30
              ),
            alpha: 0,
            scale: 0,
            duration:
              Phaser.Math.Between(
                500,
                950
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
              COLORS.red
            );

          particle.setDepth(
            70
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
         HIGHLIGHT MARKET
      ===================================================== */

      highlightMarket(
        id
      ) {
        const item =
          this.marketObjects[
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

        item.highlight =
          this.add
            .rectangle(
              item.container.x,
              item.container.y + 5,
              215,
              190,
              item.channel.color,
              0.08
            )
            .setStrokeStyle(
              3,
              item.channel.color,
              0.65
            )
            .setDepth(6);

        this.tweens.add({
          targets:
            item.highlight,
          alpha: 0.16,
          duration: 650,
          yoyo: true,
          repeat: -1,
        });
      }

      unhighlightMarket(
        id
      ) {
        const item =
          this.marketObjects[
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
         PLAYER
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
            0.95
          )
          .setDepth(100);

        this.add
          .text(
            55,
            15,
            "🧺  HARGA TURUN, PANEN TETAP JALAN",
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
            "Baca kualitas, harga, dan biaya sebelum menentukan strategi.",
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
              "0 / 3 BUKTI",
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
              650,
              46,
              COLORS.panel,
              0.96
            )
            .setStrokeStyle(
              1,
              0xd9cdbb
            );

        const text =
          this.add.text(
            -295,
            -10,
            "👆 Amati hasil panen dan beberapa kanal penjualan sebelum memilih strategi.",
            {
              fontFamily:
                "Arial",
              fontSize:
                "12px",
              color:
                "#263128",
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
        Object.values(
          this.marketObjects
        ).forEach(
          (
            item,
            index
          ) => {
            this.tweens.add({
              targets:
                item.container,
              y:
                item.container.y -
                2,
              duration:
                1200 +
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
            `${this.observedIds.length} / 3 BUKTI`
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
        "#E8F0E7",

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
        MarketScene,
      ],
    };

    const game =
      new Phaser.Game(
        config
      );

    gameRef.current =
      game;

    /*
     * Public API untuk Academy.jsx
     */

    game.marketGame = {
      inspect: (
        entityId
      ) => {
        const scene =
          game.scene.getScene(
            "MarketScene"
          );

        if (!scene) {
          return;
        }

        if (
          entityId ===
          "stock"
        ) {
          scene.inspectHarvest();
          return;
        }

        if (
          entityId ===
          "cost"
        ) {
          scene.inspectCost();
          return;
        }

        /*
         * Default:
         * market
         */

        scene.inspectMarket(
          "umkm"
        );
      },

      inspectMarket: (
        channelId
      ) => {
        const scene =
          game.scene.getScene(
            "MarketScene"
          );

        if (!scene) {
          return;
        }

        scene.inspectMarket(
          channelId
        );
      },

      choose: (
        choice
      ) => {
        const scene =
          game.scene.getScene(
            "MarketScene"
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
            "MarketScene"
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
      className="market-game-container"
      style={{
        width: "100%",
        minHeight: GAME_HEIGHT,
        overflow: "hidden",
        borderRadius: 20,
      }}
    />
  );
}