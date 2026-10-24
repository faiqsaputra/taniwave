import * as Phaser from 'phaser';
import { getMissionById } from './missions';

export default class FarmQuestScene extends Phaser.Scene {
  constructor({ onReady, onEntitySelect } = {}) {
    super({ key: 'FarmQuestScene' });

    this.onReady = onReady || (() => {});
    this.onEntitySelect = onEntitySelect || (() => {});

    this.questState = {
      missionId: 'rain-before-planting',
      selectedEntityId: null,
      outcomeId: null,
    };

    this.worldContainer = null;
  }

  create() {
    this.scale.on('resize', this.handleResize, this);

    this.events.once('shutdown', () => {
      this.scale.off('resize', this.handleResize, this);
    });

    this.renderWorld();
    this.onReady();
  }

  setQuestState(nextState) {
    this.questState = {
      ...this.questState,
      ...nextState,
    };

    if (this.sys.isActive()) {
      this.renderWorld();
    }
  }

  handleResize() {
    this.renderWorld();
  }

  put(object) {
    this.worldContainer.add(object);
    return object;
  }

  addText(text, x, y, style = {}, originX = 0, originY = 0) {
    const object = this.add.text(x, y, text, {
      fontFamily: 'Inter, Arial, sans-serif',
      fontSize: '10px',
      color: '#17324D',
      ...style,
    });

    object.setOrigin(originX, originY);

    return this.put(object);
  }

  addRect(x, y, width, height, color, alpha = 1) {
    return this.put(
      this.add.rectangle(x, y, width, height, color, alpha)
    );
  }

  addCircle(x, y, radius, color, alpha = 1) {
    return this.put(
      this.add.circle(x, y, radius, color, alpha)
    );
  }

  addEllipse(x, y, width, height, color, alpha = 1) {
    return this.put(
      this.add.ellipse(x, y, width, height, color, alpha)
    );
  }

  drawCloud(x, y, scale = 1) {
    this.addEllipse(
      x,
      y + 5 * scale,
      65 * scale,
      19 * scale,
      0xffffff,
      0.75
    );

    this.addCircle(
      x - 15 * scale,
      y,
      12 * scale,
      0xffffff,
      0.75
    );

    this.addCircle(
      x + 1 * scale,
      y - 6 * scale,
      15 * scale,
      0xffffff,
      0.75
    );

    this.addCircle(
      x + 18 * scale,
      y + 1 * scale,
      11 * scale,
      0xffffff,
      0.75
    );
  }

  drawFieldIcon(x, y, entity, selected) {
    const wet =
      this.questState.missionId === 'rain-before-planting' &&
      !['inspect-drainage'].includes(this.questState.outcomeId);

    if (wet) {
      this.addEllipse(
        x + 12,
        y + 6,
        23,
        8,
        0x78c1d8,
        0.85
      );

      this.addEllipse(
        x - 13,
        y + 8,
        16,
        6,
        0x78c1d8,
        0.55
      );
    }

    const leafColor = selected ? 0x3e713f : 0x58864b;

    this.addEllipse(
      x - 11,
      y - 3,
      11,
      7,
      leafColor
    );

    this.addEllipse(
      x + 1,
      y - 9,
      12,
      8,
      0x7aa85e
    );

    this.addEllipse(
      x + 12,
      y - 1,
      10,
      7,
      leafColor
    );

    this.addRect(
      x,
      y + 7,
      3,
      13,
      0x8a714f
    );
  }

  drawResourceIcon(x, y, entity) {
    const color = entity.fill || 0xd5e4c7;

    this.addCircle(
      x,
      y - 4,
      14,
      color,
      1
    );

    this.addCircle(
      x,
      y - 4,
      10,
      0xffffff,
      0.25
    );

    this.addEllipse(
      x - 6,
      y - 2,
      7,
      10,
      0xffffff,
      0.42
    );

    this.addRect(
      x - 12,
      y + 15,
      24,
      3,
      0x17324d,
      0.2
    );
  }

  drawProduceIcon(x, y, entity) {
    const color = entity.fill || 0xdce9c9;

    this.addRect(
      x,
      y + 5,
      36,
      21,
      color
    );

    this.addRect(
      x,
      y - 7,
      39,
      4,
      0xffffff,
      0.7
    );

    this.addRect(
      x - 9,
      y + 5,
      2,
      19,
      0xffffff,
      0.38
    );

    this.addRect(
      x + 9,
      y + 5,
      2,
      19,
      0xffffff,
      0.38
    );

    const produceColor =
      entity.id === 'grade-a'
        ? 0x6f9d4e
        : entity.id === 'grade-b'
          ? 0x87a647
          : entity.id === 'grade-reject'
            ? 0xb65d46
            : 0x8a8c68;

    this.addCircle(x - 8, y - 2, 5, produceColor);
    this.addCircle(x + 1, y - 4, 5, produceColor);
    this.addCircle(x + 10, y - 1, 5, produceColor);
  }

  drawEntity(entity, index, x, y, cardWidth, cardHeight) {
    const isSelected =
      this.questState.selectedEntityId === entity.id;

    const isOutcome = Boolean(this.questState.outcomeId);

    const baseColor = entity.fill || 0xe7e9dc;

    const card = this.add.rectangle(
      x + cardWidth / 2,
      y + cardHeight / 2,
      cardWidth,
      cardHeight,
      isSelected ? 0xfff0e9 : baseColor,
      1
    );

    card.setStrokeStyle(
      isSelected ? 3 : 1,
      isSelected ? 0xd85c38 : 0xffffff,
      isSelected ? 1 : 0.8
    );

    this.put(card);

    // Shadow/accent strip.
    this.addRect(
      x + 8,
      y + 9,
      4,
      cardHeight - 18,
      isSelected ? 0xd85c38 : 0x17324d,
      isSelected ? 0.9 : 0.14
    );

    const iconY = y + cardHeight * 0.34;

    if (entity.type === 'field') {
      this.drawFieldIcon(
        x + cardWidth / 2,
        iconY,
        entity,
        isSelected
      );
    } else if (entity.type === 'resource') {
      this.drawResourceIcon(
        x + cardWidth / 2,
        iconY,
        entity
      );
    } else {
      this.drawProduceIcon(
        x + cardWidth / 2,
        iconY,
        entity
      );
    }

    const labelY = y + cardHeight - 25;

    this.addText(
      entity.label,
      x + cardWidth / 2,
      labelY,
      {
        fontSize: cardWidth < 155 ? '9px' : '10px',
        fontStyle: 'bold',
        color: '#17324D',
        align: 'center',
      },
      0.5,
      0.5
    );

    this.addText(
      entity.subtitle,
      x + cardWidth / 2,
      y + cardHeight - 10,
      {
        fontSize: '8px',
        color: '#536568',
        align: 'center',
      },
      0.5,
      0.5
    );

    if (isSelected) {
      this.addCircle(
        x + cardWidth - 13,
        y + 13,
        5,
        0xd85c38
      );
    } else if (isOutcome && index === 0) {
      this.addCircle(
        x + cardWidth - 13,
        y + 13,
        3,
        0x64875d
      );
    }

    // Input zone for mouse and touch.
    const zone = this.add.zone(
      x + cardWidth / 2,
      y + cardHeight / 2,
      cardWidth,
      cardHeight
    );

    zone.setInteractive({ useHandCursor: true });

    zone.on('pointerdown', () => {
      this.onEntitySelect(entity.id);
    });

    this.put(zone);
  }

  renderWorld() {
    if (!this.sys.isActive()) return;

    if (this.worldContainer) {
      this.worldContainer.removeAll(true);
      this.worldContainer.destroy();
    }

    this.worldContainer = this.add.container(0, 0);

    const width = Math.max(300, this.scale.width || 960);
    const height = Math.max(300, this.scale.height || 440);

    const isSmall = width < 560;
    const mission = getMissionById(this.questState.missionId);

    // Background.
    this.addRect(
      width / 2,
      height / 2,
      width,
      height,
      0xeaf2e6
    );

    // Soft hills behind the land.
    this.addEllipse(
      width * 0.18,
      height * 0.49,
      width * 0.72,
      height * 0.35,
      0xd1e1c7,
      0.9
    );

    this.addEllipse(
      width * 0.88,
      height * 0.5,
      width * 0.55,
      height * 0.28,
      0xc0d6b2,
      0.9
    );

    // Ground.
    this.addRect(
      width / 2,
      height * 0.77,
      width,
      height * 0.48,
      0xb9cd91
    );

    // Sun.
    this.addCircle(
      width - (isSmall ? 29 : 55),
      50,
      isSmall ? 11 : 18,
      0xf4c95d,
      0.95
    );

    // Clouds.
    this.drawCloud(width * 0.28, 45, isSmall ? 0.5 : 0.8);

    if (!isSmall) {
      this.drawCloud(width * 0.65, 47, 0.65);
    }

    // Header inside the game world.
    this.addText(
      'TANIWAVE FARM QUEST',
      15,
      13,
      {
        fontSize: isSmall ? '10px' : '13px',
        fontStyle: 'bold',
        color: '#17324D',
      }
    );

    this.addText(
      mission.boardTitle,
      15,
      33,
      {
        fontSize: isSmall ? '8px' : '10px',
        color: '#51685A',
        fontStyle: 'bold',
      }
    );

    const badgeWidth = isSmall ? 104 : 142;
    const badgeX = width - badgeWidth / 2 - 13;

    this.addRect(
      badgeX,
      20,
      badgeWidth,
      24,
      0xffffff,
      0.84
    );

    this.addText(
      mission.boardMeta,
      badgeX,
      14,
      {
        fontSize: isSmall ? '8px' : '9px',
        color: '#17324D',
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: badgeWidth - 12 },
      },
      0.5,
      0
    );

    // Entity board.
    const entities = mission.entities;

    const columns = isSmall ? 2 : 3;
    const rows = Math.ceil(entities.length / columns);

    const horizontalPadding = isSmall ? 12 : 20;
    const horizontalGap = isSmall ? 7 : 12;

    const availableWidth =
      width -
      horizontalPadding * 2 -
      horizontalGap * (columns - 1);

    const cardWidth = availableWidth / columns;

    const cardHeight = isSmall ? 65 : 79;
    const verticalGap = isSmall ? 8 : 12;

    const startY = isSmall ? 103 : 112;

    entities.forEach((entity, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);

      const x =
        horizontalPadding +
        col * (cardWidth + horizontalGap);

      const y =
        startY +
        row * (cardHeight + verticalGap);

      this.drawEntity(
        entity,
        index,
        x,
        y,
        cardWidth,
        cardHeight
      );
    });

    const message = this.questState.outcomeId
      ? 'KEPUTUSAN TERCATAT · AMATI KONSEKUENSINYA'
      : this.questState.selectedEntityId
        ? 'AREA DIPILIH · PERIKSA INFORMASI DI PANEL'
        : 'KETUK AREA UNTUK MEMERIKSA KONDISI';

    this.addText(
      message,
      width / 2,
      height - 13,
      {
        fontSize: isSmall ? '7px' : '9px',
        fontStyle: 'bold',
        color: '#365b43',
        align: 'center',
      },
      0.5,
      0.5
    );
  }
}