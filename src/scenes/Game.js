export class Game extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create() {
    this.score = 0;
    this.lives = 3;
    this.speed = 220;
    this.direction = 1;

    this.combo = 0;
    this.comboScore = 0;

    // BAR
    this.bar = this.add.rectangle(180, 320, 40, 400, 0x444444);

    // FEEDBACK
    this.feedbackText = null;
    this.feedbackY = 240;

    // ZONES
    this.zoneGood = this.add.rectangle(180, 320, 40, 120, 0xffff00);
    this.zoneGood.setAlpha(0.35);

    this.zonePerfect = this.add.rectangle(180, 320, 40, 50, 0x00ff00);
    this.zonePerfect.setAlpha(0.9);

    this.tweens.add({
      targets: this.zonePerfect,
      alpha: { from: 0.6, to: 1 },
      duration: 600,
      yoyo: true,
      repeat: -1
    });

    // MARKER
    this.marker = this.add.rectangle(180, 120, 40, 20, 0xffffff);

    // UI
    this.scoreText = this.add.text(180, 40, 'Score: 0', {
      fontSize: '22px',
      color: '#fff'
    }).setOrigin(0.5);

    this.lifeText = this.add.text(180, 70, 'Lives: 3', {
      fontSize: '18px',
      color: '#fff'
    }).setOrigin(0.5);

    // INPUT
    this.input.on('pointerdown', this.checkTiming, this);
    this.input.keyboard.on('keydown-SPACE', this.checkTiming, this);
  }

  update(time, delta) {
    this.marker.y += this.direction * this.speed * (delta / 1000);
    if (this.marker.y >= 520) this.direction = -1;
    if (this.marker.y <= 120) this.direction = 1;
  }

  checkTiming() {
    const dy = Math.abs(this.marker.y - this.zonePerfect.y);

    if (dy <= 20) {
      this.hit('PERFECT', 12);
    } else if (dy <= 45) {
      this.hit('GOOD', 7);
    } else if (dy <= 70) {
      this.hit('NORMAL', 5);
    } else {
      this.miss();
    }
  }

  hit(type, baseScore) {
    if (type === 'PERFECT') {
      this.combo++;
      this.comboScore += baseScore;

      const comboName = this.getComboName(this.combo);
      this.showFeedback(
        `PERFECT\n${comboName} Combo x${this.combo}`,
        '#00ff00')
       // CAMERA SHAKE (combo arttıkça güçlenir)
      this.cameras.main.shake(
       80,
       Math.min(0.002 + this.combo * 0.0003, 0.01)
      );
     // MINI SLOW MOTION
      this.time.timeScale = 0.9;
      this.time.delayedCall(80, () => {
      this.time.timeScale = 1;
      });
    } else {
      this.applyCombo();
      this.score += baseScore;
      this.showFeedback(type, '#ffff00');
    }

    this.scoreText.setText('Score: ' + this.score);
    this.speed += 15;
  }

  miss() {
    this.applyCombo();
    this.lives--;
    this.lifeText.setText('Lives: ' + this.lives);

    this.showFeedback('MISS', '#ff0000');

    if (this.lives <= 0) {
      this.gameOver();
    }
  }

  applyCombo() {
    if (this.combo === 0) return;

    let multiplier = 1;
    let name = '';

    if (this.combo < 10) {
      multiplier = 1.2;
      name = 'Warm-up';
    } else if (this.combo < 20) {
      multiplier = 1.5;
      name = 'On Fire';
    } else if (this.combo < 50) {
      multiplier = 2;
      name = 'Unstoppable';
    } else {
      multiplier = 3;
      name = 'LEGEND';
    }

    const gained = Math.floor(this.comboScore * multiplier);
    this.score += gained;

    this.showComboResult(name, gained);

    this.combo = 0;
    this.comboScore = 0;
    this.scoreText.setText('Score: ' + this.score);
  }

  showComboResult(name, points) {
    const text = this.add.text(180, 260, `${name}\n+${points}`, {
      fontSize: '26px',
      color: '#ffcc00',
      align: 'center'
    }).setOrigin(0.5);

    this.time.delayedCall(800, () => text.destroy());
  }

  showFeedback(text) {
  if (this.feedbackText) {
    this.feedbackText.destroy();
  }

  const feedbackColor =
    this.combo >= 50 ? '#ff00ff' :
    this.combo >= 20 ? '#ff9900' :
    '#00ff00';

  this.feedbackText = this.add.text(180, this.feedbackY, text, {
    fontSize: '26px',
    color: feedbackColor,
    fontStyle: 'bold',
    align: 'center'
  }).setOrigin(0.5);

  this.feedbackText.setScale(1.6);

  this.tweens.add({
    targets: this.feedbackText,
    scale: 1,
    y: this.feedbackY - 25,
    alpha: 0,
    duration: 600,
    ease: 'Back.easeOut',
    onComplete: () => {
      if (this.feedbackText) {
        this.feedbackText.destroy();
        this.feedbackText = null;
      }
    }
  });
}
  getComboName(combo) {
    if (combo < 10) return 'Warm-up';
    if (combo < 20) return 'On Fire';
    if (combo < 50) return 'Unstoppable';
    return 'LEGEND';
  }

  gameOver() {
    this.input.removeAllListeners();

    this.add.text(180, 300, 'GAME OVER', {
      fontSize: '36px',
      color: '#ff0000'
    }).setOrigin(0.5);

    this.add.text(180, 360, 'Tap or Space to Restart', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.input.once('pointerdown', () => this.scene.restart());
    this.input.keyboard.once('keydown-SPACE', () => this.scene.restart());
  }
}
