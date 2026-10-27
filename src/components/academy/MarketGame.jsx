import Phaser from "phaser";
import { useEffect, useRef } from "react";

const GAME_WIDTH = 960;
const GAME_HEIGHT = 620;

/* =========================================================
   COLORS
========================================================= */

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
  panelDark: 0x263128,

  text: 0x263128,
  muted: 0x68736b,

  border: 0xd9cdbb,
};

/* =========================================================
   MARKET DATA
========================================================= */

const DEFAULT_MARKET_CHANNELS = {
  tengkulak: {
    id: "tengkulak",
    title: "Pembeli Langsung",
    shortTitle: "Tengkulak",
    subtitle: "Cepat & praktis",

    price: 18000,

    /*
     * Biaya tambahan per kg.
     */
    costPerKg: 0,

    /*
     * Kapasitas pembelian.
     */
    capacity: 100,

    /*
     * Semakin tinggi dependency,
     * semakin besar ketergantungan pada kanal ini.
     */
    dependency: 80,

    risk: 25,

    color: COLORS.red,

    description:
      "Hasil langsung diambil. Kamu tidak perlu mencari pembeli lain.",

    riskDescription:
      "Harga lebih rendah dan kamu bergantung pada satu pembeli.",

    icon: "🤝",
  },

  pasar: {
    id: "pasar",
    title: "Pasar Lokal",
    shortTitle: "Pasar",

    subtitle: "Jual sendiri",

    price: 21000,

    /*
     * Transportasi + biaya lapak sederhana.
     */
    costPerKg: 1500,

    capacity: 60,

    dependency: 45,

    risk: 45,

    color: COLORS.yellow,

    description:
      "Kamu bisa mendapatkan harga lebih baik dengan menjual langsung.",

    riskDescription:
      "Perlu waktu, transportasi, dan tenaga untuk menjual.",

    icon: "🧺",
  },

  umkm: {
    id: "umkm",
    title: "UMKM Kuliner",
    shortTitle: "UMKM",

    subtitle: "Pembeli rutin",

    price: 23000,

    /*
     * Sortir + packing + transportasi.
     */
    costPerKg: 2500,

    capacity: 40,

    dependency: 30,

    risk: 60,

    color: COLORS.green,

    description:
      "Pembeli membutuhkan kualitas yang konsisten dan pasokan teratur.",

    riskDescription:
      "Kamu perlu memenuhi kualitas dan menjaga hubungan dengan pembeli.",

    icon: "🍜",
  },
};

/* =========================================================
   DEFAULT HARVEST
========================================================= */

const DEFAULT_HARVEST = {
  crop: "Cabai",
  total: 100,

  quality: {
    gradeA: 60,
    gradeB: 30,
    gradeC: 10,
  },

  condition: "Sebagian besar hasil panen masih layak jual.",

  description:
    "Panen hari ini cukup baik, tetapi kualitas berbeda-beda sehingga perlu disortir sebelum dijual.",
};

/* =========================================================
   DECISIONS
========================================================= */

const DEFAULT_DECISIONS = [
  {
    id: "grade",

    title: "Sortir & bagi ke beberapa kanal",

    description:
      "Pisahkan kualitas lalu bandingkan beberapa kanal penjualan.",

    strategy: "diversify",

    /*
     * Distribusi sederhana untuk simulation.
     *
     * 40 kg → UMKM
     * 40 kg → Pasar
     * 20 kg → Tengkulak
     */
    allocation: {
      tengkulak: 20,
      pasar: 40,
      umkm: 40,
    },

    baseScore: 100,
    xp: 100,
    coins: 40,

    feedback:
      "Kamu tidak hanya mengejar harga tertinggi. Kamu mempertimbangkan kualitas, biaya, kapasitas pembeli, dan beberapa kanal penjualan.",

    learning:
      "Petani tidak harus bergantung pada satu pembeli. Membandingkan kanal dapat membantu meningkatkan posisi tawar dan mengurangi risiko.",
  },

  {
    id: "hold",

    title: "Tahan seluruh panen",

    description:
      "Simpan semua hasil panen sampai harga naik lagi.",

    strategy: "hold",

    allocation: {
      tengkulak: 0,
      pasar: 0,
      umkm: 0,
    },

    baseScore: 55,
    xp: 70,
    coins: 15,

    feedback:
      "Menahan panen dapat memberi peluang mendapatkan harga lebih tinggi, tetapi penyimpanan memiliki biaya dan risiko kualitas.",

    learning:
      "Harga masa depan belum tentu naik. Menyimpan hasil panen berarti mengambil risiko tambahan.",
  },

  {
    id: "sell",

    title: "Jual semua ke pembeli pertama",

    description:
      "Yang penting hasil panen cepat terjual.",

    strategy: "quick_sell",

    allocation: {
      tengkulak: 100,
      pasar: 0,
      umkm: 0,
    },

    baseScore: 35,
    xp: 50,
    coins: 5,

    feedback:
      "Menjual cepat memang praktis, tetapi kamu kehilangan kesempatan membandingkan harga dan mengurangi ketergantungan pada satu pembeli.",

    learning:
      "Kecepatan menjual bukan satu-satunya ukuran keputusan yang baik. Harga bersih, risiko, dan posisi tawar juga penting.",
  },
];

/* =========================================================
   HELPERS
========================================================= */

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/* =========================================================
   COMPONENT
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

    /* =====================================================
       MISSION NORMALIZATION
    ===================================================== */

    const missionData = mission || {};

    const marketChannels = {
      ...DEFAULT_MARKET_CHANNELS,
      ...(missionData.marketChannels || {}),
    };

    const harvest = {
      ...DEFAULT_HARVEST,
      ...(missionData.harvest || {}),
      quality: {
        ...DEFAULT_HARVEST.quality,
        ...(missionData.harvest?.quality || {}),
      },
    };

    const decisions =
      missionData.decisions ||
      DEFAULT_DECISIONS;

    /* =====================================================
       PHASER SCENE
    ===================================================== */

    class MarketScene extends Phaser.Scene {
      constructor() {
        super({
          key: "MarketScene",
        });

        /* -----------------------------------------------
           GAME STATE
        ----------------------------------------------- */

        this.gameState = "OBSERVING";

        /*
         * OBSERVING
         * DECISION
         * CONSEQUENCE
         * RESULT
         */

        this.observedIds = [];

        this.marketObjects = {};

        this.player = null;

        this.popup = null;

        this.decisionHint = null;

        this.resultPanel = null;

        this.costObject = null;

        this.evidenceCounter = null;

        this.instructionBox = null;

        this.selectedChoice = null;

        this.lastResult = null;
      }

      /* =====================================================
         CREATE
      ===================================================== */

      create() {
        this.createBackground();

        this.createMarketEnvironment();

        this.createMarketStalls();

        this.createHarvestCrates();

        this.createCostStation();

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
         * Roof
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
         * Building
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
          marketChannels[
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
            channel.shortTitle ||
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
            formatRupiah(
              channel.price
            ),
            {
              fontFamily:
                "Arial",
              fontSize:
                "15px",
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
            channel.icon ||
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
         HARVEST
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
            `${harvest.total} KG PANEN`,
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
         COST STATION
      ===================================================== */

      createCostStation() {
        const station =
          this.add.container(
            830,
            465
          );

        const bg =
          this.add
            .rectangle(
              0,
              0,
              145,
              82,
              COLORS.panel
            )
            .setStrokeStyle(
              2,
              COLORS.yellow
            );

        const icon =
          this.add.text(
            -55,
            -27,
            "🚚",
            {
              fontSize:
                "25px",
            }
          );

        const title =
          this.add.text(
            -22,
            -27,
            "BIAYA",
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

        const subtitle =
          this.add.text(
            -55,
            2,
            "Transport & operasional",
            {
              fontFamily:
                "Arial",
              fontSize:
                "9px",
              color:
                "#68736B",
            }
          );

        const amount =
          this.add.text(
            -55,
            20,
            "Perlu dihitung",
            {
              fontFamily:
                "Arial",
              fontSize:
                "10px",
              fontStyle:
                "bold",
              color:
                "#D4A017",
            }
          );

        station.add([
          bg,
          icon,
          title,
          subtitle,
          amount,
        ]);

        station.setDepth(
          8
        );

        this.costObject =
          station;
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
        /*
         * Harvest
         */

        const harvestZone =
          this.add
            .zone(
              125,
              470,
              170,
              110
            )
            .setInteractive({
              useHandCursor: true,
            });

        harvestZone.on(
          "pointerover",
          () => {
            this.highlightObject(
              harvestZone,
              COLORS.green
            );
          }
        );

        harvestZone.on(
          "pointerout",
          () => {
            this.removeObjectHighlight(
              harvestZone
            );
          }
        );

        harvestZone.on(
          "pointerdown",
          () => {
            this.inspectHarvest();
          }
        );

        /*
         * Market channels
         */

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
         * Cost
         */

        const costZone =
          this.add
            .zone(
              830,
              465,
              160,
              100
            )
            .setInteractive({
              useHandCursor: true,
            });

        costZone.on(
          "pointerover",
          () => {
            this.highlightObject(
              costZone,
              COLORS.yellow
            );
          }
        );

        costZone.on(
          "pointerout",
          () => {
            this.removeObjectHighlight(
              costZone
            );
          }
        );

        costZone.on(
          "pointerdown",
          () => {
            this.inspectCost();
          }
        );

        this.costObject.zone =
          costZone;
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
              this.gameState ===
              "RESULT"
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

      highlightObject(
        zone,
        color
      ) {
        if (
          zone.getData(
            "highlight"
          )
        ) {
          return;
        }

        const highlight =
          this.add
            .rectangle(
              zone.x,
              zone.y,
              zone.input.hitArea.width,
              zone.input.hitArea.height,
              color,
              0.08
            )
            .setStrokeStyle(
              2,
              color,
              0.5
            )
            .setDepth(4);

        zone.setData(
          "highlight",
          highlight
        );
      }

      removeObjectHighlight(
        zone
      ) {
        const highlight =
          zone.getData(
            "highlight"
          );

        if (highlight) {
          highlight.destroy();

          zone.setData(
            "highlight",
            null
          );
        }
      }

      /* =====================================================
         OBSERVATION
      ===================================================== */

      inspectHarvest() {
        if (
          this.gameState !==
          "OBSERVING"
        ) {
          return;
        }

        this.addEvidence(
          "stock"
        );

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
          250,
          420,
          {
            title:
              "HASIL PANEN",

            badge:
              `${harvest.total} KG`,

            badgeColor:
              COLORS.green,

            metric:
              "Kualitas masih baik",

            detail:
              `Grade A: ${harvest.quality.gradeA} kg • Grade B: ${harvest.quality.gradeB} kg • Grade C: ${harvest.quality.gradeC} kg. ${harvest.description}`,
          }
        );
      }

      /* =====================================================
         MARKET INSPECTION
      ===================================================== */

      inspectMarket(
        id
      ) {
        if (
          this.gameState !==
          "OBSERVING"
        ) {
          return;
        }

        const item =
          this.marketObjects[
            id
          ];

        if (!item) {
          return;
        }

        this.addEvidence(
          "market"
        );

        this.movePlayerTo(
          item.container.x,
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
          marketChannels[
            id
          ];

        const estimatedGross =
          channel.price *
          Math.min(
            channel.capacity,
            harvest.total
          );

        const estimatedCost =
          channel.costPerKg *
          Math.min(
            channel.capacity,
            harvest.total
          );

        const estimatedNet =
          estimatedGross -
          estimatedCost;

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
              `${formatRupiah(channel.price)} / kg`,

            detail:
              `Kapasitas ${channel.capacity} kg. Biaya sekitar ${formatRupiah(channel.costPerKg)} / kg. Jika seluruh kapasitas digunakan, perkiraan hasil bersih ${formatRupiah(estimatedNet)}.`,
          }
        );
      }

      /* =====================================================
         COST INSPECTION
      ===================================================== */

      inspectCost() {
        if (
          this.gameState !==
          "OBSERVING"
        ) {
          return;
        }

        this.addEvidence(
          "cost"
        );

        this.showCostPopup();

        this.notifyEntity(
          "cost"
        );

        this.checkObservationProgress();
      }

      showCostPopup() {
        this.createPopup(
          650,
          430,
          {
            title:
              "BIAYA OPERASIONAL",

            badge:
              "JANGAN LIHAT HARGA SAJA",

            badgeColor:
              COLORS.yellow,

            metric:
              "Harga jual − biaya = hasil bersih",

            detail:
              "Setiap kanal membutuhkan biaya yang berbeda. Transportasi, sortir, packing, waktu, dan penyimpanan dapat mengurangi keuntungan.",
          }
        );
      }

      /* =====================================================
         EVIDENCE
      ===================================================== */

      addEvidence(
        id
      ) {
        if (
          !this.observedIds.includes(
            id
          )
        ) {
          this.observedIds.push(
            id
          );
        }
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

          this.popup =
            null;
        }

        /*
         * Keep popup inside screen.
         */

        const popupX =
          clamp(
            x,
            160,
            GAME_WIDTH - 160
          );

        const popupY =
          clamp(
            y,
            175,
            GAME_HEIGHT - 130
          );

        const popup =
          this.add.container(
            popupX,
            popupY
          );

        const bg =
          this.add
            .rectangle(
              0,
              0,
              300,
              150,
              COLORS.panel,
              0.99
            )
            .setStrokeStyle(
              2,
              data.badgeColor
            );

        const badge =
          this.add
            .rectangle(
              -112,
              -57,
              105,
              23,
              data.badgeColor
            );

        const badgeText =
          this.add.text(
            -145,
            -65,
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
            -145,
            -38,
            data.title,
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

        const metric =
          this.add.text(
            -145,
            -11,
            data.metric,
            {
              fontFamily:
                "Arial",
              fontSize:
                "12px",
              fontStyle:
                "bold",
              color:
                this.toHex(
                  data.badgeColor
                ),
            }
          );

        const detail =
          this.add.text(
            -145,
            15,
            data.detail,
            {
              fontFamily:
                "Arial",
              fontSize:
                "9px",
              color:
                "#68736B",
              wordWrap: {
                width: 270,
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
          200
        );

        popup.setScale(
          0.82
        );

        this.tweens.add({
          targets:
            popup,

          scale: 1,

          duration: 180,

          ease:
            "Back.Out",
        });

        this.popup =
          popup;

        /*
         * V2 tetap auto-close agar tidak menghalangi
         * permainan terlalu lama.
         */

        this.time.delayedCall(
          5000,
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
        const entities = {
          market: {
            id: "market",

            label: "Pasar",

            subtitle:
              "Harga",

            metric:
              "Harga sedang melemah",

            detail:
              "Bandingkan beberapa kanal sebelum menjual.",
          },

          stock: {
            id: "stock",

            label:
              "Hasil panen",

            subtitle:
              "Kualitas",

            metric:
              `${harvest.total} kg`,

            detail:
              "Kualitas hasil panen berbeda-beda sehingga perlu diperhatikan sebelum menentukan kanal.",
          },

          cost: {
            id: "cost",

            label:
              "Biaya",

            subtitle:
              "Operasional",

            metric:
              "Perlu dihitung",

            detail:
              "Biaya transportasi, sortir, packing, dan waktu memengaruhi keuntungan bersih.",
          },
        };

        const entity =
          entities[id];

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
         OBSERVATION PROGRESS
      ===================================================== */

      checkObservationProgress() {
        if (
          this.observedIds.length >=
            3 &&
          this.gameState ===
            "OBSERVING"
        ) {
          this.enterDecisionPhase();
        }
      }

      enterDecisionPhase() {
        this.gameState =
          "DECISION";

        if (
          this.instructionBox
        ) {
          this.instructionBox.destroy();

          this.instructionBox =
            null;
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

        this.showEvidenceSummary();
      }

      /* =====================================================
         EVIDENCE SUMMARY
      ===================================================== */

      showEvidenceSummary() {
        const panel =
          this.add.container(
            100,
            105
          );

        const bg =
          this.add
            .rectangle(
              0,
              0,
              190,
              110,
              COLORS.panel,
              0.97
            )
            .setStrokeStyle(
              2,
              COLORS.green
            );

        const title =
          this.add.text(
            -82,
            -48,
            "✓ BUKTI TERKUMPUL",
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

        const lines = [
          "✓ Hasil panen",
          "✓ Harga kanal",
          "✓ Biaya operasional",
        ];

        const evidenceText =
          this.add.text(
            -82,
            -20,
            lines.join("\n"),
            {
              fontFamily:
                "Arial",
              fontSize:
                "10px",
              color:
                "#68736B",
              lineSpacing:
                5,
            }
          );

        panel.add([
          bg,
          title,
          evidenceText,
        ]);

        panel.setDepth(
          120
        );

        this.tweens.add({
          targets:
            panel,

          alpha: {
            from: 0,
            to: 1,
          },

          duration: 250,
        });

        this.time.delayedCall(
          2800,
          () => {
            if (
              panel.active
            ) {
              panel.destroy();
            }
          }
        );
      }

      /* =====================================================
         DECISION HINT
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
          150
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

          ease:
            "Sine.InOut",
        });
      }

      /* =====================================================
         SELECT DECISION
      ===================================================== */

      selectChoice(
        choice
      ) {
        if (
          this.gameState !==
          "DECISION"
        ) {
          return;
        }

        if (!choice) {
          return;
        }

        /*
         * Find actual decision data.
         */

        const decision =
          typeof choice ===
          "string"
            ? decisions.find(
                (item) =>
                  item.id ===
                  choice
              )
            : choice;

        if (!decision) {
          return;
        }

        this.selectedChoice =
          decision;

        this.gameState =
          "CONSEQUENCE";

        if (
          this.decisionHint
        ) {
          this.decisionHint.destroy();

          this.decisionHint =
            null;
        }

        if (
          this.popup
        ) {
          this.popup.destroy();

          this.popup =
            null;
        }

        this.showStrategyConsequence(
          decision
        );

        this.time.delayedCall(
          1800,
          () => {
            this.showResult(
              decision
            );
          }
        );
      }

      /* =====================================================
         SIMULATION ENGINE
      ===================================================== */

      calculateDecision(
        choice
      ) {
        const allocation =
          choice.allocation || {
            tengkulak: 0,
            pasar: 0,
            umkm: 0,
          };

        const totalAllocated =
          Object.values(
            allocation
          ).reduce(
            (sum, value) =>
              sum + value,
            0
          );

        /*
         * Revenue
         */

        let revenue = 0;

        /*
         * Operational cost
         */

        let operationalCost = 0;

        /*
         * Capacity penalty
         */

        let capacityPenalty = 0;

        Object.entries(
          allocation
        ).forEach(
          ([
            channelId,
            quantity,
          ]) => {
            const channel =
              marketChannels[
                channelId
              ];

            if (!channel) {
              return;
            }

            const sellable =
              Math.min(
                quantity,
                channel.capacity
              );

            revenue +=
              sellable *
              channel.price;

            operationalCost +=
              sellable *
              channel.costPerKg;

            if (
              quantity >
              channel.capacity
            ) {
              capacityPenalty +=
                (quantity -
                  channel.capacity) *
                1000;
            }
          }
        );

        /*
         * Unsold stock
         */

        const unsold =
          Math.max(
            0,
            harvest.total -
              totalAllocated
          );

        /*
         * Holding cost for unsold product.
         */

        const holdingCost =
          unsold * 500;

        operationalCost +=
          holdingCost;

        /*
         * Quick sell has almost no operational cost.
         */

        /*
         * Net profit
         */

        const netProfit =
          revenue -
          operationalCost -
          capacityPenalty;

        /*
         * Dependency
         */

        let dependency = 100;

        if (
          totalAllocated >
          0
        ) {
          let weightedDependency =
            0;

          Object.entries(
            allocation
          ).forEach(
            ([
              channelId,
              quantity,
            ]) => {
              const channel =
                marketChannels[
                  channelId
                ];

              if (!channel) {
                return;
              }

              weightedDependency +=
                quantity *
                channel.dependency;
            }
          );

          dependency =
            weightedDependency /
            totalAllocated;
        }

        /*
         * Risk
         */

        let risk = 0;

        if (
          totalAllocated >
          0
        ) {
          let weightedRisk = 0;

          Object.entries(
            allocation
          ).forEach(
            ([
              channelId,
              quantity,
            ]) => {
              const channel =
                marketChannels[
                  channelId
                ];

              if (!channel) {
                return;
              }

              weightedRisk +=
                quantity *
                channel.risk;
            }
          );

          risk =
            weightedRisk /
            totalAllocated;
        }

        /*
         * Diversification
         */

        const activeChannels =
          Object.values(
            allocation
          ).filter(
            (value) =>
              value > 0
          ).length;

        let diversification =
          activeChannels === 3
            ? 100
            : activeChannels === 2
            ? 70
            : 25;

        /*
         * Profit score
         */

        const maxPotentialProfit =
          harvest.total *
            Math.max(
              ...Object.values(
                marketChannels
              ).map(
                (channel) =>
                  channel.price -
                  channel.costPerKg
              )
            );

        const profitRatio =
          maxPotentialProfit >
          0
            ? netProfit /
              maxPotentialProfit
            : 0;

        const profitScore =
          clamp(
            profitRatio * 100,
            0,
            100
          );

        /*
         * Final score
         */

        let score =
          profitScore * 0.4 +
          diversification * 0.25 +
          (100 - dependency) *
            0.2 +
          (100 - risk) *
            0.15;

        /*
         * Strategy-specific adjustment.
         */

        if (
          choice.strategy ===
          "hold"
        ) {
          score -= 10;
        }

        if (
          choice.strategy ===
          "quick_sell"
        ) {
          score -= 15;
        }

        score = clamp(
          Math.round(score),
          0,
          100
        );

        /*
         * XP
         */

        const xpMultiplier =
          score >= 85
            ? 1
            : score >= 65
            ? 0.85
            : 0.7;

        const xp = Math.round(
          choice.xp *
            xpMultiplier
        );

        /*
         * Coins
         */

        const coins = Math.max(
          5,
          Math.round(
            choice.coins *
              (score / 100)
          )
        );

        return {
          revenue,
          operationalCost,
          capacityPenalty,
          holdingCost,
          netProfit,
          unsold,
          dependency,
          risk,
          diversification,
          profitScore,
          score,
          xp,
          coins,
          totalAllocated,
          activeChannels,
        };
      }

      /* =====================================================
         CONSEQUENCE
      ===================================================== */

      showStrategyConsequence(
        choice
      ) {
        if (
          choice.strategy ===
          "diversify"
        ) {
          this.animateGradeStrategy();
          return;
        }

        if (
          choice.strategy ===
          "hold"
        ) {
          this.animateHoldStrategy();
          return;
        }

        if (
          choice.strategy ===
          "quick_sell"
        ) {
          this.animateSellStrategy();
        }
      }

      /* =====================================================
         DIVERSIFICATION
      ===================================================== */

      animateGradeStrategy() {
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

              ease:
                "Back.Out",
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
          "SORTIR + BANDINGKAN",
          COLORS.green
        );

        this.createAllocationLabels();
      }

      createAllocationLabels() {
        const allocation =
          this.selectedChoice
            ?.allocation;

        if (!allocation) {
          return;
        }

        Object.entries(
          allocation
        ).forEach(
          ([
            channelId,
            quantity,
          ]) => {
            if (
              quantity <=
              0
            ) {
              return;
            }

            const item =
              this.marketObjects[
                channelId
              ];

            if (!item) {
              return;
            }

            const label =
              this.add
                .text(
                  item.container.x,
                  400,
                  `${quantity} kg`,
                  {
                    fontFamily:
                      "Arial",
                    fontSize:
                      "11px",
                    fontStyle:
                      "bold",
                    color:
                      "#FFFFFF",
                    backgroundColor:
                      "#263128",
                    padding: {
                      left: 7,
                      right: 7,
                      top: 4,
                      bottom: 4,
                    },
                  }
                )
                .setOrigin(
                  0.5
                )
                .setDepth(
                  90
                );

            this.tweens.add({
              targets:
                label,

              y: 375,

              duration: 800,

              ease:
                "Cubic.Out",
            });
          }
        );
      }

      /* =====================================================
         HOLD
      ===================================================== */

      animateHoldStrategy() {
        this.createFloatingText(
          480,
          290,
          "TAHAN PANEN",
          COLORS.yellow
        );

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

          onComplete:
            () =>
              crate.destroy(),
        });

        this.createWarningParticles(
          125,
          470
        );
      }

      /* =====================================================
         QUICK SELL
      ===================================================== */

      animateSellStrategy() {
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

          ease:
            "Back.Out",
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
                  this.toHex(
                    color
                  ),

                stroke:
                  "#FFFFFF",

                strokeThickness:
                  5,
              }
            )
            .setOrigin(
              0.5
            )
            .setDepth(
              180
            );

        this.tweens.add({
          targets:
            label,

          y:
            y - 45,

          alpha: 0,

          duration: 1300,

          ease:
            "Cubic.Out",

          onComplete:
            () =>
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
            .padStart(
              6,
              "0"
            )
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
            170
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

            onComplete:
              () =>
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
            170
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

            onComplete:
              () =>
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
        const simulation =
          this.calculateDecision(
            choice
          );

        const result = {
          choice,

          observedIds:
            this.observedIds,

          score:
            simulation.score,

          xp:
            simulation.xp,

          coins:
            simulation.coins,

          simulation,
        };

        this.lastResult =
          result;

        this.gameState =
          "RESULT";

        this.showResultPanel(
          result
        );

        if (
          typeof onResult ===
          "function"
        ) {
          onResult(
            result
          );
        }

        if (
          typeof onComplete ===
          "function"
        ) {
          onComplete(
            result
          );
        }
      }

      /* =====================================================
         RESULT PANEL
      ===================================================== */

      showResultPanel(
        result
      ) {
        if (
          this.resultPanel
        ) {
          this.resultPanel.destroy();
        }

        const {
          choice,
          simulation,
        } = result;

        const panel =
          this.add.container(
            480,
            350
          );

        const bg =
          this.add
            .rectangle(
              0,
              0,
              570,
              350,
              COLORS.panel,
              0.99
            )
            .setStrokeStyle(
              3,
              this.getScoreColor(
                simulation.score
              )
            );

        const title =
          this.add.text(
            -250,
            -155,
            "HASIL KEPUTUSANMU",
            {
              fontFamily:
                "Arial",
              fontSize:
                "20px",
              fontStyle:
                "bold",
              color:
                "#263128",
            }
          );

        const strategy =
          this.add.text(
            -250,
            -125,
            choice.title,
            {
              fontFamily:
                "Arial",
              fontSize:
                "11px",
              color:
                "#68736B",
            }
          );

        /*
         * Score
         */

        const score =
          this.add.text(
            150,
            -140,
            `${simulation.score}`,
            {
              fontFamily:
                "Arial",
              fontSize:
                "38px",
              fontStyle:
                "bold",
              color:
                this.toHex(
                  this.getScoreColor(
                    simulation.score
                  )
                ),
            }
          );

        const scoreLabel =
          this.add.text(
            150,
            -98,
            "SKOR",
            {
              fontFamily:
                "Arial",
              fontSize:
                "9px",
              fontStyle:
                "bold",
              color:
                "#68736B",
            }
          );

        /*
         * Financial summary
         */

        const financialBg =
          this.add
            .rectangle(
              0,
              -35,
              500,
              105,
              COLORS.greenSoft
            )
            .setStrokeStyle(
              1,
              COLORS.green
            );

        const revenueText =
          this.add.text(
            -225,
            -65,
            `Pendapatan  ${formatRupiah(
              simulation.revenue
            )}`,
            {
              fontFamily:
                "Arial",
              fontSize:
                "11px",
              color:
                "#263128",
            }
          );

        const costText =
          this.add.text(
            -225,
            -40,
            `Biaya          ${formatRupiah(
              simulation.operationalCost
            )}`,
            {
              fontFamily:
                "Arial",
              fontSize:
                "11px",
              color:
                "#263128",
            }
          );

        const profitText =
          this.add.text(
            -225,
            -15,
            `Profit bersih  ${formatRupiah(
              simulation.netProfit
            )}`,
            {
              fontFamily:
                "Arial",
              fontSize:
                "13px",
              fontStyle:
                "bold",
              color:
                "#263128",
            }
          );

        /*
         * Risk
         */

        const riskText =
          this.add.text(
            -225,
            45,
            `Risiko pasar: ${this.getRiskLabel(
              simulation.risk
            )}`,
            {
              fontFamily:
                "Arial",
              fontSize:
                "10px",
              color:
                "#263128",
            }
          );

        const dependencyText =
          this.add.text(
            15,
            45,
            `Ketergantungan: ${this.getRiskLabel(
              simulation.dependency
            )}`,
            {
              fontFamily:
                "Arial",
              fontSize:
                "10px",
              color:
                "#263128",
            }
          );

        /*
         * Learning
         */

        const feedback =
          this.add.text(
            -225,
            88,
            choice.feedback,
            {
              fontFamily:
                "Arial",
              fontSize:
                "10px",
              color:
                "#68736B",
              wordWrap: {
                width: 450,
              },
              lineSpacing:
                2,
            }
          );

        /*
         * Reward
         */

        const reward =
          this.add.text(
            -225,
            140,
            `+${simulation.xp} XP     +${simulation.coins} COIN`,
            {
              fontFamily:
                "Arial",
              fontSize:
                "13px",
              fontStyle:
                "bold",
              color:
                "#D4A017",
            }
          );

        panel.add([
          bg,
          title,
          strategy,
          score,
          scoreLabel,
          financialBg,
          revenueText,
          costText,
          profitText,
          riskText,
          dependencyText,
          feedback,
          reward,
        ]);

        panel.setDepth(
          300
        );

        panel.setScale(
          0.8
        );

        this.tweens.add({
          targets:
            panel,

          scale: 1,

          duration: 350,

          ease:
            "Back.Out",
        });

        this.resultPanel =
          panel;
      }

      getScoreColor(
        score
      ) {
        if (
          score >= 80
        ) {
          return COLORS.green;
        }

        if (
          score >= 60
        ) {
          return COLORS.yellow;
        }

        return COLORS.red;
      }

      getRiskLabel(
        value
      ) {
        if (
          value <= 35
        ) {
          return "RENDAH";
        }

        if (
          value <= 65
        ) {
          return "SEDANG";
        }

        return "TINGGI";
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
        if (
          !this.player
        ) {
          return;
        }

        this.tweens.add({
          targets:
            this.player,

          x,

          y,

          duration: 500,

          ease:
            "Sine.Out",
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
          .setDepth(
            100
          );

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
          .setDepth(
            101
          );

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
          .setDepth(
            101
          );

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
            .setDepth(
              101
            );
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
              COLORS.border
            );

        const text =
          this.add.text(
            -295,
            -10,
            "👆 Amati hasil panen, kanal penjualan, dan biaya sebelum memilih strategi.",
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
         ENVIRONMENT ANIMATION
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

              ease:
                "Sine.InOut",
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

    /* =======================================================
       PHASER CONFIG
    ======================================================= */

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

      scene: [
        MarketScene,
      ],
    };

    /* =======================================================
       CREATE GAME
    ======================================================= */

    const game =
      new Phaser.Game(
        config
      );

    gameRef.current =
      game;

    /* =======================================================
       PUBLIC API
    ======================================================= */

    game.marketGame = {
      /*
       * Generic inspection API.
       *
       * Compatible dengan Academy.jsx lama.
       */

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

        if (
          marketChannels[
            entityId
          ]
        ) {
          scene.inspectMarket(
            entityId
          );
          return;
        }

        /*
         * Backward compatibility:
         * jika Academy lama mengirim
         * "market", gunakan UMKM.
         */

        if (
          entityId ===
          "market"
        ) {
          scene.inspectMarket(
            "umkm"
          );
        }
      },

      /*
       * Inspect specific market channel.
       */

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

      /*
       * Choose decision.
       *
       * Bisa menerima:
       * - object decision
       * - string ID
       */

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

      /*
       * Replay game.
       */

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

      /*
       * Exit.
       */

      exit: () => {
        if (
          typeof onExit ===
          "function"
        ) {
          onExit();
        }
      },

      /*
       * Get current game state.
       */

      getState: () => {
        const scene =
          game.scene.getScene(
            "MarketScene"
          );

        if (!scene) {
          return null;
        }

        return {
          state:
            scene.gameState,

          observedIds:
            scene.observedIds,

          selectedChoice:
            scene.selectedChoice,

          result:
            scene.lastResult,
        };
      },
    };

    /* =======================================================
       CLEANUP
    ======================================================= */

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
    /*
     * Sengaja mempertahankan dependency ini agar
     * perubahan mission/callback dapat membuat instance
     * baru ketika diperlukan.
     */
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
        minHeight:
          GAME_HEIGHT,
        overflow:
          "hidden",
        borderRadius: 20,
      }}
    />
  );
}