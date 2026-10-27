import React, { useEffect, useRef, useState } from "react";
import Phaser from "phaser";

/* =========================================================
   CABAI GAME
   Smart Academy
   Case: Cabai Setelah Hujan
========================================================= */

/*
  Props yang didukung:

  <CabaiGame
    mission={mission}
    onComplete={handleComplete}
    onBack={handleBack}
  />

  mission bisa berasal dari MISSIONS di Academy.jsx.
*/


/* =========================================================
   GAME CONFIG
========================================================= */

const GAME_CONFIG = {
  theme: {
    bg: "#111611",
    panel: "#193326",
    panelDark: "#13271e",
    green: "#315d3e",
    greenLight: "#7eb85a",
    soil: "#704a2d",
    soilLight: "#8a5d38",
    sky: "#b9dbe8",
    mountain: "#9dbb9b",
    mountainDark: "#789d7b",
    yellow: "#f1c84b",
    orange: "#ef613d",
    white: "#f7f4e9",
    muted: "#9da69e",
    danger: "#e96b50",
    success: "#83bd59",
  },

  /* =======================================================
     ASSET CONFIG

     Nanti kalau punya aset PNG/SVG sendiri,
     cukup ganti path di sini.

     Jangan ubah logic Phaser.
  ======================================================= */

  assets: {
    farmer: null,
    soil: null,
    chili: null,
    cloud: null,
    mountain: null,
  },

  /* =======================================================
     HOTSPOT / BUKTI
  ======================================================= */

  evidence: [
    {
      id: "soil",
      title: "Kondisi Tanah",
      short: "Tanah terlalu basah",
      description:
        "Permukaan tanah masih jenuh air. Sebelum melakukan tindakan lain, kondisi air di sekitar akar perlu diperiksa.",
      icon: "💧",
    },

    {
      id: "leaf",
      title: "Daun Cabai",
      short: "Beberapa daun menguning",
      description:
        "Daun bagian bawah mulai menguning. Ini merupakan tanda yang perlu diamati, bukan diagnosis tunggal.",
      icon: "🌱",
    },
  ],

  /* =======================================================
     DECISION
  ======================================================= */

  decisions: [
    {
      id: "drain",
      title: "Periksa dan buka drainase",
      description:
        "Kurangi genangan sebelum memberikan input tambahan.",
      score: 100,
      coins: 30,
      feedback:
        "Keputusanmu tepat. Kamu memeriksa kondisi lingkungan akar terlebih dahulu sebelum memberikan perlakuan.",
      learning:
        "Kenali penyebab masalah sebelum menambah pupuk atau air.",
    },

    {
      id: "fertilize",
      title: "Langsung tambah pupuk",
      description:
        "Berikan nutrisi agar daun cepat hijau.",
      score: 45,
      coins: 10,
      feedback:
        "Nutrisi bukan selalu jawaban pertama. Saat tanah terlalu basah, kondisi air dan akar sebaiknya diperiksa terlebih dahulu.",
      learning:
        "Jangan menambah input sebelum memahami kondisi lahan.",
    },

    {
      id: "water",
      title: "Tambah penyiraman",
      description:
        "Sirami tanaman supaya tidak kekurangan air.",
      score: 20,
      coins: 5,
      feedback:
        "Tanah sudah menunjukkan kondisi terlalu basah. Menambah air justru dapat memperburuk kondisi.",
      learning:
        "Gunakan kondisi tanah sebagai bukti sebelum menyiram.",
    },
  ],
};


/* =========================================================
   UTILITY
========================================================= */

const clamp = (value, min, max) =>
  Math.max(min, Math.min(max, value));


/* =========================================================
   CABAI SCENE
========================================================= */

class CabaiScene extends Phaser.Scene {
  constructor() {
    super("CabaiScene");

    this.w = 0;
    this.h = 0;

    this.isPortrait = false;

    this.evidenceFound = new Set();

    this.hotspots = [];
    this.sceneObjects = [];

    this.onEvidenceFound = null;
    this.onDecisionReady = null;
  }

  init(data) {
    this.onEvidenceFound = data.onEvidenceFound;
    this.onDecisionReady = data.onDecisionReady;
  }

  create() {
    this.setupInput();

    this.renderScene();

    this.scale.on(
      Phaser.Scale.Events.RESIZE,
      this.handleResize,
      this
    );
  }

  shutdown() {
    this.scale.off(
      Phaser.Scale.Events.RESIZE,
      this.handleResize,
      this
    );
  }

  setupInput() {
    this.input.on(
      "gameobjectdown",
      (pointer, gameObject) => {
        if (gameObject.__hotspotId) {
          this.collectEvidence(
            gameObject.__hotspotId
          );
        }
      }
    );
  }

  handleResize(gameSize) {
    if (!gameSize) return;

    const width = Math.max(
      1,
      Math.round(gameSize.width)
    );

    const height = Math.max(
      1,
      Math.round(gameSize.height)
    );

    this.w = width;
    this.h = height;

    this.isPortrait =
      height > width;

    this.renderScene();
  }


  /* =======================================================
     MAIN RENDER
  ======================================================= */

  renderScene() {
    if (!this.scale) return;

    this.w =
      Math.round(this.scale.width) ||
      this.w ||
      800;

    this.h =
      Math.round(this.scale.height) ||
      this.h ||
      500;

    this.isPortrait =
      this.h > this.w;

    this.clearScene();

    this.drawBackground();

    if (this.isPortrait) {
      this.drawPortraitLayout();
    } else {
      this.drawLandscapeLayout();
    }

    this.drawHotspots();

    this.drawInstruction();

    this.drawProgress();

    this.bringUIToTop();
  }


  /* =======================================================
     CLEAR
  ======================================================= */

  clearScene() {
    this.hotspots = [];

    this.sceneObjects.forEach(
      (object) => {
        if (
          object &&
          object.destroy &&
          object.active
        ) {
          object.destroy();
        }
      }
    );

    this.sceneObjects = [];
  }


  addObject(object) {
    if (object) {
      this.sceneObjects.push(object);
    }

    return object;
  }


  /* =======================================================
     BACKGROUND
  ======================================================= */

  drawBackground() {
    const bg = this.add
      .rectangle(
        this.w / 2,
        this.h / 2,
        this.w,
        this.h,
        Phaser.Display.Color.HexStringToColor(
          GAME_CONFIG.theme.bg
        ).color
      );

    this.addObject(bg);


    /* SKY */

    const skyHeight = this.isPortrait
      ? this.h * 0.48
      : this.h * 0.64;

    const sky = this.add.rectangle(
      this.w / 2,
      skyHeight / 2,
      this.w,
      skyHeight,
      Phaser.Display.Color.HexStringToColor(
        GAME_CONFIG.theme.sky
      ).color
    );

    this.addObject(sky);


    /* SUN */

    const sun = this.add.circle(
      this.w * 0.82,
      this.h * 0.14,
      clamp(
        this.w * 0.055,
        18,
        34
      ),
      0xf2d56c
    );

    this.addObject(sun);


    /* CLOUDS */

    this.drawCloud(
      this.w * 0.18,
      this.h * 0.17,
      0.9
    );

    this.drawCloud(
      this.w * 0.62,
      this.h * 0.20,
      0.72
    );


    /* MOUNTAINS */

    const mountainY =
      skyHeight * 0.70;

    this.drawMountainRange(
      mountainY
    );


    /* GROUND */

    const groundTop = skyHeight;

    const ground = this.add.rectangle(
      this.w / 2,
      groundTop +
        (this.h - groundTop) / 2,
      this.w,
      this.h - groundTop,
      Phaser.Display.Color.HexStringToColor(
        "#91bd62"
      ).color
    );

    this.addObject(ground);
  }


  drawMountainRange(y) {
    const graphics =
      this.add.graphics();

    graphics.fillStyle(
      Phaser.Display.Color.HexStringToColor(
        GAME_CONFIG.theme.mountain
      ).color,
      1
    );

    const points = [
      {
        x: -this.w * 0.10,
        y: y + this.h * 0.08,
      },
      {
        x: this.w * 0.13,
        y: y - this.h * 0.16,
      },
      {
        x: this.w * 0.34,
        y: y + this.h * 0.08,
      },
      {
        x: this.w * 0.51,
        y: y - this.h * 0.21,
      },
      {
        x: this.w * 0.69,
        y: y + this.h * 0.06,
      },
      {
        x: this.w * 0.87,
        y: y - this.h * 0.14,
      },
      {
        x: this.w * 1.10,
        y: y + this.h * 0.08,
      },
    ];

    graphics.beginPath();

    graphics.moveTo(
      points[0].x,
      points[0].y
    );

    points.slice(1).forEach(
      (point) => {
        graphics.lineTo(
          point.x,
          point.y
        );
      }
    );

    graphics.lineTo(
      this.w * 1.1,
      this.h
    );

    graphics.lineTo(
      -this.w * 0.1,
      this.h
    );

    graphics.closePath();

    graphics.fillPath();

    this.addObject(graphics);
  }


  drawCloud(x, y, scale = 1) {
    const container =
      this.add.container(x, y);

    const color = 0xffffff;

    const parts = [
      [0, 0, 17],
      [20, 2, 23],
      [-19, 5, 13],
      [40, 8, 13],
    ];

    parts.forEach(
      ([px, py, radius]) => {
        container.add(
          this.add.circle(
            px * scale,
            py * scale,
            radius * scale,
            color,
            0.88
          )
        );
      }
    );

    this.addObject(container);
  }


  /* =======================================================
     LANDSCAPE
  ======================================================= */

  drawLandscapeLayout() {
    const top =
      this.h * 0.28;

    const bottom =
      this.h * 0.88;

    const gardenY =
      (top + bottom) / 2;

    const gardenHeight =
      bottom - top;

    const leftX =
      this.w * 0.24;

    const rightX =
      this.w * 0.76;

    const gardenWidth =
      Math.min(
        this.w * 0.34,
        300
      );


    /* LEFT BED */

    this.drawGardenBed(
      leftX,
      gardenY,
      gardenWidth,
      gardenHeight
    );


    /* RIGHT BED */

    this.drawGardenBed(
      rightX,
      gardenY,
      gardenWidth,
      gardenHeight
    );


    /* FARMER */

    this.drawFarmer(
      this.w / 2,
      gardenY + this.h * 0.03,
      Math.min(
        this.w,
        this.h
      ) * 0.11
    );
  }


  /* =======================================================
     PORTRAIT
  ======================================================= */

  drawPortraitLayout() {
    const availableHeight =
      this.h * 0.70;

    const gardenWidth =
      this.w * 0.70;

    const gardenHeight =
      clamp(
        this.h * 0.18,
        90,
        150
      );

    const leftX =
      this.w * 0.29;

    const rightX =
      this.w * 0.71;

    const gardenY =
      this.h * 0.60;


    /*
      Portrait dibuat bertingkat:

      langit
        ↓
      kebun kiri + kanan
        ↓
      farmer tengah
        ↓
      instruction

      Jadi tidak ada elemen yang dipaksa
      masuk ke rasio landscape.
    */

    this.drawGardenBed(
      leftX,
      gardenY,
      gardenWidth,
      gardenHeight
    );

    this.drawGardenBed(
      rightX,
      gardenY,
      gardenWidth,
      gardenHeight
    );

    this.drawFarmer(
      this.w / 2,
      gardenY + gardenHeight * 0.08,
      clamp(
        this.w * 0.10,
        30,
        54
      )
    );
  }


  /* =======================================================
     GARDEN BED
  ======================================================= */

  drawGardenBed(
    x,
    y,
    width,
    height
  ) {
    const graphics =
      this.add.graphics();

    graphics.fillStyle(
      Phaser.Display.Color.HexStringToColor(
        GAME_CONFIG.theme.soil
      ).color,
      1
    );

    graphics.fillRoundedRect(
      x - width / 2,
      y - height / 2,
      width,
      height,
      12
    );

    graphics.fillStyle(
      Phaser.Display.Color.HexStringToColor(
        GAME_CONFIG.theme.soilLight
      ).color,
      0.4
    );

    for (
      let row = 0;
      row < 3;
      row++
    ) {
      const rowY =
        y -
        height * 0.25 +
        row * height * 0.25;

      graphics.lineStyle(
        3,
        0x53361f,
        0.35
      );

      graphics.beginPath();

      graphics.moveTo(
        x - width * 0.42,
        rowY
      );

      graphics.lineTo(
        x + width * 0.42,
        rowY
      );

      graphics.strokePath();
    }

    this.addObject(graphics);


    /* CHILI PLANTS */

    const plantCount =
      this.isPortrait
        ? 4
        : 5;

    for (
      let i = 0;
      i < plantCount;
      i++
    ) {
      const px =
        x -
        width * 0.34 +
        i *
          (width * 0.17);

      const py =
        y +
        (i % 2 === 0
          ? -height * 0.06
          : height * 0.10);

      this.drawChiliPlant(
        px,
        py,
        clamp(
          height * 0.16,
          12,
          25
        )
      );
    }


    /* WATER PUDDLE */

    const puddle =
      this.add.ellipse(
        x +
          width * 0.34,
        y +
          height * 0.30,
        width * 0.18,
        height * 0.12,
        0x67a9c3,
        0.9
      );

    this.addObject(puddle);
  }


  /* =======================================================
     CHILI PLANT
  ======================================================= */

  drawChiliPlant(
    x,
    y,
    size
  ) {
    const container =
      this.add.container(x, y);

    const graphics =
      this.add.graphics();


    /* STEM */

    graphics.lineStyle(
      Math.max(2, size * 0.13),
      0x315f35,
      1
    );

    graphics.beginPath();

    graphics.moveTo(
      0,
      size * 0.7
    );

    graphics.lineTo(
      0,
      -size * 0.4
    );

    graphics.strokePath();


    /* LEAVES */

    graphics.fillStyle(
      0x4d963f,
      1
    );

    graphics.fillEllipse(
      -size * 0.38,
      -size * 0.25,
      size * 0.75,
      size * 0.40
    );

    graphics.fillEllipse(
      size * 0.35,
      -size * 0.15,
      size * 0.75,
      size * 0.40
    );

    graphics.fillEllipse(
      0,
      -size * 0.55,
      size * 0.75,
      size * 0.42
    );


    /* CHILI */

    graphics.fillStyle(
      GAME_CONFIG.theme.orange,
      1
    );

    graphics.fillEllipse(
      -size * 0.22,
      size * 0.25,
      size * 0.18,
      size * 0.55
    );

    graphics.fillEllipse(
      size * 0.25,
      size * 0.20,
      size * 0.18,
      size * 0.55
    );


    container.add(
      graphics
    );

    this.addObject(container);
  }


  /* =======================================================
     FARMER
  ======================================================= */

  drawFarmer(
    x,
    y,
    size
  ) {
    const container =
      this.add.container(x, y);

    const graphics =
      this.add.graphics();


    /* BODY */

    graphics.fillStyle(
      0xc58e4c,
      1
    );

    graphics.fillRoundedRect(
      -size * 0.30,
      size * 0.05,
      size * 0.60,
      size * 0.70,
      8
    );


    /* SHIRT */

    graphics.fillStyle(
      0x486e39,
      1
    );

    graphics.fillRoundedRect(
      -size * 0.28,
      size * 0.15,
      size * 0.56,
      size * 0.50,
      7
    );


    /* HEAD */

    graphics.fillStyle(
      0xb97d4b,
      1
    );

    graphics.fillCircle(
      0,
      -size * 0.18,
      size * 0.25
    );


    /* HAT */

    graphics.fillStyle(
      0x526f36,
      1
    );

    graphics.fillEllipse(
      0,
      -size * 0.43,
      size * 0.70,
      size * 0.25
    );

    graphics.fillStyle(
      0x334d29,
      1
    );

    graphics.fillRect(
      -size * 0.25,
      -size * 0.50,
      size * 0.50,
      size * 0.16
    );


    /* LEGS */

    graphics.fillStyle(
      0x60422e,
      1
    );

    graphics.fillRoundedRect(
      -size * 0.25,
      size * 0.68,
      size * 0.18,
      size * 0.45,
      5
    );

    graphics.fillRoundedRect(
      size * 0.07,
      size * 0.68,
      size * 0.18,
      size * 0.45,
      5
    );


    container.add(
      graphics
    );

    this.addObject(container);
  }


  /* =======================================================
     HOTSPOTS
  ======================================================= */

  drawHotspots() {
    const positions =
      this.isPortrait
        ? [
            {
              id: "soil",
              x: this.w * 0.29,
              y: this.h * 0.58,
            },
            {
              id: "leaf",
              x: this.w * 0.71,
              y: this.h * 0.57,
            },
          ]
        : [
            {
              id: "soil",
              x: this.w * 0.24,
              y: this.h * 0.59,
            },
            {
              id: "leaf",
              x: this.w * 0.76,
              y: this.h * 0.56,
            },
          ];


    positions.forEach(
      (position) => {
        const found =
          this.evidenceFound.has(
            position.id
          );

        const radius =
          this.isPortrait
            ? clamp(
                this.w * 0.07,
                22,
                34
              )
            : clamp(
                this.w * 0.035,
                22,
                34
              );


        const ring =
          this.add.circle(
            position.x,
            position.y,
            radius,
            0xffffff,
            0.96
          );

        ring.setStrokeStyle(
          3,
          found
            ? 0x83bd59
            : 0xf1c84b,
          1
        );

        ring.setInteractive({
          useHandCursor: true,
        });

        ring.__hotspotId =
          position.id;

        this.addObject(ring);


        const icon =
          position.id === "soil"
            ? "💧"
            : "🌱";

        const text =
          this.add.text(
            position.x,
            position.y,
            found
              ? "✓"
              : icon,
            {
              fontFamily:
                "Arial, sans-serif",
              fontSize:
                this.isPortrait
                  ? "18px"
                  : "20px",
              color: found
                ? "#315d3e"
                : "#76551c",
            }
          );

        text.setOrigin(
          0.5
        );

        this.addObject(text);


        if (!found) {
          this.tweens.add({
            targets: ring,
            scaleX: 1.12,
            scaleY: 1.12,
            duration: 900,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut",
          });
        }
      }
    );
  }


  /* =======================================================
     COLLECT EVIDENCE
  ======================================================= */

  collectEvidence(id) {
    if (
      this.evidenceFound.has(id)
    ) {
      return;
    }

    this.evidenceFound.add(id);

    this.showEvidencePopup(
      id
    );

    if (
      this.onEvidenceFound
    ) {
      this.onEvidenceFound(
        id,
        this.evidenceFound.size
      );
    }

    if (
      this.evidenceFound.size >=
      GAME_CONFIG.evidence.length
    ) {
      this.time.delayedCall(
        900,
        () => {
          if (
            this.onDecisionReady
          ) {
            this.onDecisionReady();
          }
        }
      );
    }
  }


  /* =======================================================
     EVIDENCE POPUP
  ======================================================= */

  showEvidencePopup(id) {
    const evidence =
      GAME_CONFIG.evidence.find(
        (item) =>
          item.id === id
      );

    if (!evidence) return;


    const width =
      this.isPortrait
        ? this.w * 0.84
        : Math.min(
            this.w * 0.42,
            430
          );

    const height =
      this.isPortrait
        ? 170
        : 155;


    const x =
      this.w / 2;

    const y =
      this.isPortrait
        ? this.h * 0.26
        : this.h * 0.50;


    const container =
      this.add.container(
        x,
        y
      );


    const shadow =
      this.add.rectangle(
        5,
        7,
        width,
        height,
        0x000000,
        0.20
      );

    const panel =
      this.add.rectangle(
        0,
        0,
        width,
        height,
        0xf7f4e9
      );

    panel.setStrokeStyle(
      3,
      0xd5a63b,
      1
    );


    const icon =
      this.add.text(
        -width / 2 + 24,
        -height / 2 + 22,
        evidence.icon,
        {
          fontSize:
            "25px",
        }
      );

    const title =
      this.add.text(
        -width / 2 + 60,
        -height / 2 + 22,
        evidence.title,
        {
          fontFamily:
            "Arial, sans-serif",
          fontSize:
            this.isPortrait
              ? "15px"
              : "16px",
          fontStyle:
            "bold",
          color:
            "#193326",
        }
      );


    const description =
      this.add.text(
        -width / 2 + 24,
        -height / 2 + 58,
        evidence.description,
        {
          fontFamily:
            "Arial, sans-serif",
          fontSize:
            this.isPortrait
              ? "11px"
              : "12px",
          color:
            "#58635a",
          wordWrap: {
            width:
              width - 48,
          },
          lineSpacing: 4,
        }
      );


    const button =
      this.add.rectangle(
        width / 2 - 62,
        height / 2 - 25,
        90,
        32,
        0x315d3e
      );

    button.setInteractive({
      useHandCursor: true,
    });


    const buttonText =
      this.add.text(
        width / 2 - 62,
        height / 2 - 25,
        "LANJUT",
        {
          fontFamily:
            "Arial, sans-serif",
          fontSize:
            "11px",
          fontStyle:
            "bold",
          color:
            "#ffffff",
        }
      );

    buttonText.setOrigin(
      0.5
    );


    container.add([
      shadow,
      panel,
      icon,
      title,
      description,
      button,
      buttonText,
    ]);


    this.addObject(
      container
    );


    button.on(
      "pointerdown",
      () => {
        container.destroy();
      }
    );


    container.setDepth(100);

    container.setScale(0.85);
    container.setAlpha(0);

    this.tweens.add({
      targets: container,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 220,
      ease: "Back.easeOut",
    });
  }


  /* =======================================================
     INSTRUCTION
  ======================================================= */

  drawInstruction() {
    const text =
      this.evidenceFound.size <
      GAME_CONFIG.evidence.length
        ? "Temukan 2 bukti: cek tanah, daun, dan drainase."
        : "Semua bukti ditemukan. Tentukan keputusanmu.";

    const width =
      this.isPortrait
        ? this.w * 0.82
        : Math.min(
            this.w * 0.46,
            440
          );

    const y =
      this.isPortrait
        ? this.h * 0.88
        : this.h * 0.91;


    const panel =
      this.add.rectangle(
        this.w / 2,
        y,
        width,
        38,
        0xf7f4e9,
        0.98
      );

    panel.setStrokeStyle(
      1,
      0xe3d7bd,
      1
    );

    this.addObject(panel);


    const textObject =
      this.add.text(
        this.w / 2,
        y,
        `💡 ${text}`,
        {
          fontFamily:
            "Arial, sans-serif",
          fontSize:
            this.isPortrait
              ? "10px"
              : "11px",
          color:
            "#193326",
          align: "center",
          wordWrap: {
            width:
              width - 20,
          },
        }
      );

    textObject.setOrigin(
      0.5
    );

    this.addObject(
      textObject
    );
  }


  /* =======================================================
     PROGRESS
  ======================================================= */

  drawProgress() {
    const padding =
      this.isPortrait
        ? 12
        : 18;

    const text =
      this.add.text(
        padding,
        padding,
        "01  AMATI KEBUN",
        {
          fontFamily:
            "Arial, sans-serif",
          fontSize:
            this.isPortrait
              ? "12px"
              : "14px",
          fontStyle:
            "bold",
          color:
            "#f7f4e9",
        }
      );

    this.addObject(
      text
    );


    const progress =
      this.add.text(
        this.w - padding,
        padding,
        `${this.evidenceFound.size}/${GAME_CONFIG.evidence.length} BUKTI`,
        {
          fontFamily:
            "Arial, sans-serif",
          fontSize:
            this.isPortrait
              ? "11px"
              : "12px",
          fontStyle:
            "bold",
          color:
            "#f7f4e9",
          backgroundColor:
            "#315d3e",
          padding: {
            left: 10,
            right: 10,
            top: 7,
            bottom: 7,
          },
        }
      );

    progress.setOrigin(
      1,
      0
    );

    this.addObject(
      progress
    );
  }


  /* =======================================================
     UI DEPTH
  ======================================================= */

  bringUIToTop() {
    this.children.list.forEach(
      (object) => {
        if (
          object.__hotspotId
        ) {
          object.setDepth(20);
        }
      }
    );
  }
}


/* =========================================================
   REACT COMPONENT
========================================================= */

export default function CabaiGame({
  mission,
  onComplete,
  onBack,
}) {
  const gameParentRef =
    useRef(null);

  const gameRef =
    useRef(null);

  const [evidenceCount, setEvidenceCount] =
    useState(0);

  const [decisionOpen, setDecisionOpen] =
    useState(false);

  const [selectedDecision, setSelectedDecision] =
    useState(null);

  const [completed, setCompleted] =
    useState(false);

  const [orientation, setOrientation] =
    useState(
      typeof window !== "undefined" &&
        window.innerWidth >
          window.innerHeight
        ? "landscape"
        : "portrait"
    );


  /* =======================================================
     ORIENTATION
  ======================================================= */

  useEffect(() => {
    const updateOrientation =
      () => {
        if (
          typeof window ===
          "undefined"
        ) {
          return;
        }

        setOrientation(
          window.innerWidth >
            window.innerHeight
            ? "landscape"
            : "portrait"
        );
      };

    updateOrientation();

    window.addEventListener(
      "resize",
      updateOrientation
    );

    window.addEventListener(
      "orientationchange",
      updateOrientation
    );

    return () => {
      window.removeEventListener(
        "resize",
        updateOrientation
      );

      window.removeEventListener(
        "orientationchange",
        updateOrientation
      );
    };
  }, []);


  /* =======================================================
     CREATE PHASER
  ======================================================= */

  useEffect(() => {
    if (
      !gameParentRef.current
    ) {
      return;
    }

    if (gameRef.current) {
      return;
    }


    const parent =
      gameParentRef.current;


    const getSize =
      () => {
        const rect =
          parent.getBoundingClientRect();

        return {
          width: Math.max(
            1,
            Math.round(
              rect.width ||
                parent.clientWidth ||
                800
            )
          ),

          height: Math.max(
            1,
            Math.round(
              rect.height ||
                parent.clientHeight ||
                500
            )
          ),
        };
      };


    const initial =
      getSize();


    const game =
      new Phaser.Game({
        type: Phaser.AUTO,

        parent,

        width:
          initial.width,

        height:
          initial.height,

        backgroundColor:
          GAME_CONFIG.theme.bg,

        render: {
          antialias: true,
          pixelArt: false,
          roundPixels: true,
        },

        scale: {
          mode: Phaser.Scale.RESIZE,

          autoCenter:
            Phaser.Scale.CENTER_BOTH,

          width:
            initial.width,

          height:
            initial.height,
        },

        input: {
          active: true,
        },

        scene: [
          CabaiScene,
        ],
      });


    game.scene.start(
      "CabaiScene",
      {
        onEvidenceFound: (
          id,
          count
        ) => {
          setEvidenceCount(
            count
          );
        },

        onDecisionReady: () => {
          setDecisionOpen(
            true
          );
        },
      }
    );


    gameRef.current =
      game;


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
  }, []);


  /* =======================================================
     DECISION
  ======================================================= */

  const handleDecision =
    (decision) => {
      setSelectedDecision(
        decision
      );
      setDecisionOpen(
        false
      );
    };


  /* =======================================================
     COMPLETE
  ======================================================= */

  const handleComplete =
    () => {
      setCompleted(
        true
      );

      const result = {
        missionId:
          mission?.id ||
          "cabai-hujan",

        score:
          selectedDecision?.score ||
          0,

        xp:
          selectedDecision?.xp ||
          mission?.xp ||
          80,

        coins:
          selectedDecision?.coins ||
          0,

        completed: true,
      };


      if (
        onComplete
      ) {
        onComplete(
          result
        );
      }
    };


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className={`cabai-game-shell ${orientation}`}
    >

      {/* ===================================================
          TOP BAR
      =================================================== */}

      <header
        className="cabai-game-header"
      >
        <button
          type="button"
          className="cabai-back-button"
          onClick={onBack}
          aria-label="Kembali"
        >
          ←
        </button>

        <div className="cabai-header-title">
          <span>
            {mission?.category ||
              "BUDIDAYA"}
          </span>

          <strong>
            {mission?.title ||
              "Cabai Setelah Hujan"}
          </strong>
        </div>

        <div className="cabai-header-progress">
          {evidenceCount}/2 bukti
        </div>
      </header>


      {/* ===================================================
          GAME AREA
      =================================================== */}

      <main
        className="cabai-game-main"
      >
        <div
          className="cabai-game-frame"
        >
          <div
            ref={
              gameParentRef
            }
            className="cabai-phaser-container"
          />
        </div>
      </main>


      {/* ===================================================
          DECISION MODAL
      =================================================== */}

      {decisionOpen && (
        <div
          className="cabai-overlay"
        >
          <div
            className="cabai-decision-card"
          >
            <div className="cabai-decision-badge">
              BUKTI LENGKAP
            </div>

            <h2>
              Saatnya ambil keputusan
            </h2>

            <p>
              Hujan sudah berlangsung
              beberapa hari. Tanah
              terlalu basah dan ada
              perubahan pada daun.
            </p>

            <div className="cabai-decision-list">
              {GAME_CONFIG.decisions.map(
                (decision) => (
                  <button
                    key={
                      decision.id
                    }
                    type="button"
                    className="cabai-decision-option"
                    onClick={() =>
                      handleDecision(
                        decision
                      )
                    }
                  >
                    <div>
                      <strong>
                        {
                          decision.title
                        }
                      </strong>

                      <span>
                        {
                          decision.description
                        }
                      </span>
                    </div>

                    <b>
                      →
                    </b>
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}


      {/* ===================================================
          RESULT
      =================================================== */}

      {selectedDecision &&
        !completed && (
          <div
            className="cabai-overlay"
          >
            <div
              className="cabai-result-card"
            >
              <div className="cabai-result-icon">
                {selectedDecision.score >=
                80
                  ? "🌱"
                  : "💡"}
              </div>

              <span className="cabai-result-label">
                KEPUTUSANMU
              </span>

              <h2>
                {
                  selectedDecision.title
                }
              </h2>

              <div className="cabai-result-score">
                +{selectedDecision.score} SCORE
              </div>

              <p>
                {
                  selectedDecision.feedback
                }
              </p>

              <div className="cabai-learning-box">
                <strong>
                  Yang kamu pelajari
                </strong>

                <span>
                  {
                    selectedDecision.learning
                  }
                </span>
              </div>

              <button
                type="button"
                className="cabai-practice-button"
                onClick={
                  handleComplete
                }
              >
                🌱 Siap Praktik
              </button>

              <small>
                Sekarang coba amati
                kondisi tanamanmu
                sendiri di dunia nyata.
              </small>
            </div>
          </div>
        )}


      {/* ===================================================
          COMPLETED
      =================================================== */}

      {completed && (
        <div
          className="cabai-overlay"
        >
          <div
            className="cabai-result-card"
          >
            <div className="cabai-result-icon">
              🎉
            </div>

            <span className="cabai-result-label">
              CASE SELESAI
            </span>

            <h2>
              Kamu siap mencoba!
            </h2>

            <p>
              Game selesai. Sekarang
              waktunya membawa keputusan
              ini ke kebun, lahan, atau
              lingkunganmu.
            </p>

            <div className="cabai-reward-grid">
              <div>
                <strong>
                  +{selectedDecision?.score ||
                    0}
                </strong>
                <span>
                  Score
                </span>
              </div>

              <div>
                <strong>
                  +{selectedDecision?.coins ||
                    0}
                </strong>
                <span>
                  Coins
                </span>
              </div>

              <div>
                <strong>
                  +{selectedDecision?.xp ||
                    mission?.xp ||
                    80}
                </strong>
                <span>
                  XP
                </span>
              </div>
            </div>

            <button
              type="button"
              className="cabai-practice-button"
              onClick={onBack}
            >
              Kembali ke Academy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}