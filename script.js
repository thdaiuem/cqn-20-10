/**
 * CELESTIAL ROMANCE - MAIN COORDINATOR
 * Manages scene transitions, letter page navigation, audio, and UI interactions.
 */

// ====================================================================
// CONFIGURATION: CUSTOMIZE YOUR LETTER CONTENT EASILY HERE
// (Bạn có thể tùy chỉnh tên và nội dung thư tại đây nếu muốn)
// ====================================================================
const LETTER_CONFIG = {
  recipientTitle: "Gửi Em, Vì Sao Đẹp Nhất Của Anh ✨",
  senderName: "Chàng trai của em 💙",
  
  // Danh sách những câu thì thầm ngọt ngào khi chạm vào bó hoa 3D
  romanticWhispers: [
    "Em là ngôi sao sáng nhất trong lòng anh ✨",
    "Mãi thương em, cô gái bé nhỏ của anh 💙",
    "Bó hoa này sẽ không bao giờ tàn phai, như tình cảm anh dành cho em 💐",
    "Cảm ơn em vì đã đến và thắp sáng cuộc đời anh 💫",
    "Chúc mừng ngày 20/11 người con gái tuyệt vời nhất của anh! 🌸",
    "Cười nhiều lên nhé, nụ cười của em là điều quý giá nhất với anh 🥰",
    "Từng vì sao trên bó hoa này đều thay anh nói lời yêu em 🌌",
    "Dù vũ trụ bao la, ánh mắt anh vẫn chỉ hướng về một mình em 💖"
  ]
};

// ====================================================================
// AMBIENT BACKGROUND CANVAS (Canvas 2D Stardust)
// ====================================================================
class AmbientStardust {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.stars = [];
    this.numStars = 180;

    this.resize();
    window.addEventListener('resize', this.resize.bind(this));
    this.createStars();
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createStars() {
    this.stars = [];
    for (let i = 0; i < this.numStars; i++) {
      this.stars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        radius: Math.random() * 1.5 + 0.3,
        alpha: Math.random(),
        speed: Math.random() * 0.015 + 0.005,
        color: Math.random() > 0.4 ? '#00f2fe' : '#ffffff'
      });
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.stars.forEach(star => {
      star.alpha += star.speed;
      if (star.alpha > 1 || star.alpha < 0) {
        star.speed = -star.speed;
      }

      this.ctx.save();
      this.ctx.globalAlpha = Math.abs(Math.sin(star.alpha));
      this.ctx.fillStyle = star.color;
      this.ctx.shadowBlur = 8;
      this.ctx.shadowColor = star.color;
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });

    requestAnimationFrame(this.animate.bind(this));
  }
}

// ====================================================================
// APPLICATION MASTER CONTROLLER
// ====================================================================
document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Ambient 2D Canvas
  new AmbientStardust('ambient-canvas');

  // 2. DOM Elements
  const sceneEnvelope = document.getElementById('scene-envelope');
  const envelope = document.getElementById('envelope');
  const waxSeal = document.getElementById('wax-seal');

  const letterModal = document.getElementById('letter-modal');
  const letterBackdrop = document.getElementById('letter-backdrop');
  const letterPage1 = document.getElementById('letter-page-1');
  const letterPage2 = document.getElementById('letter-page-2');
  const btnNextPage = document.getElementById('btn-next-page');
  const btnPrevPage = document.getElementById('btn-prev-page');
  const btnRevealSurprise = document.getElementById('btn-reveal-surprise');

  const sceneBouquet = document.getElementById('scene-bouquet');
  const whisperContainer = document.getElementById('whisper-container');
  const btnReopenLetter = document.getElementById('btn-reopen-letter');
  const btnBurstLove = document.getElementById('btn-burst-love');
  const btnScreenshot = document.getElementById('btn-screenshot');

  let bouquetEngine = null;
  let whisperTimeout = null;

  // 4. Open Envelope Flow
  const openEnvelope = () => {
    if (envelope.classList.contains('open')) return;

    envelope.classList.add('open');

    // Smooth delay while flap and wax seal animate, then unveil the letter modal
    setTimeout(() => {
      letterModal.classList.remove('hidden');
    }, 750);
  };

  if (waxSeal) waxSeal.addEventListener('click', openEnvelope);
  if (envelope) envelope.addEventListener('click', openEnvelope);

  // 5. Letter Page Flip Navigation (Page 1 <-> Page 2)
  if (btnNextPage) {
    btnNextPage.addEventListener('click', (e) => {
      e.stopPropagation();
      letterPage1.classList.remove('active');
      letterPage1.classList.add('prev-page');

      letterPage2.classList.remove('next-page');
      letterPage2.classList.add('active');

      // Scroll modal container back to top smoothly
      document.getElementById('letter-container').scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (btnPrevPage) {
    btnPrevPage.addEventListener('click', (e) => {
      e.stopPropagation();
      letterPage2.classList.remove('active');
      letterPage2.classList.add('next-page');

      letterPage1.classList.remove('prev-page');
      letterPage1.classList.add('active');

      document.getElementById('letter-container').scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Close modal when backdrop clicked (only after surprise has been shown once)
  if (letterBackdrop) {
    letterBackdrop.addEventListener('click', () => {
      if (!sceneBouquet.classList.contains('hidden')) {
        letterModal.classList.add('hidden');
      }
    });
  }

  // 6. THE GRAND SURPRISE REVEAL: 3D CELESTIAL BOUQUET!
  if (btnRevealSurprise) {
    btnRevealSurprise.addEventListener('click', (e) => {
      e.stopPropagation();

      // Trigger Confetti Celebration in Pink & Blue Aqua Tones
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 140,
          spread: 85,
          origin: { y: 0.6 },
          colors: ['#ff758c', '#ffb3c6', '#00f2fe', '#70f3ff', '#ffffff', '#ffd166']
        });
      }



      // Hide Letter Modal
      letterModal.classList.add('hidden');

      // Transition from Envelope Scene to 3D Bouquet Scene
      sceneEnvelope.classList.remove('active');
      sceneEnvelope.classList.add('hidden');

      setTimeout(() => {
        sceneBouquet.classList.remove('hidden');
        sceneBouquet.classList.add('active');

        // Initialize Three.js Engine if not yet created
        if (!bouquetEngine) {
          bouquetEngine = new window.CelestialBouquet('three-container');
        } else {
          bouquetEngine.onWindowResize();
        }

        // Show welcome whisper
        setTimeout(() => {
          showRomanticWhisper("Dành tặng em bó hoa ngàn sao này... 💙");
        }, 1200);
      }, 500);
    });
  }

  // 7. Re-open Letter button in 3D Scene
  if (btnReopenLetter) {
    btnReopenLetter.addEventListener('click', () => {
      letterModal.classList.remove('hidden');
    });
  }

  // 8. Burst Love / Shooting Star button
  if (btnBurstLove) {
    btnBurstLove.addEventListener('click', () => {
      if (bouquetEngine) {
        bouquetEngine.triggerShootingStar();
        bouquetEngine.triggerHeartBurst(window.innerWidth / 2, window.innerHeight / 2);
      }
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.8 },
          colors: ['#ff758c', '#ffb3c6', '#00f2fe', '#70f3ff', '#ffffff']
        });
      }

      showRomanticWhisper();
    });
  }

  // 9. Screenshot button
  if (btnScreenshot) {
    btnScreenshot.addEventListener('click', () => {
      if (bouquetEngine) {
        bouquetEngine.captureScreenshot();
        showRomanticWhisper("Đã chụp lại khoảnh khắc bó hoa ngàn sao ✨");
      }
    });
  }

  // 11. Romantic Whisper Notification Function
  window.showRomanticWhisper = (customMessage = null) => {
    if (!whisperContainer) return;

    // Remove any existing active whisper
    whisperContainer.innerHTML = '';

    const text = customMessage || LETTER_CONFIG.romanticWhispers[
      Math.floor(Math.random() * LETTER_CONFIG.romanticWhispers.length)
    ];

    const bubble = document.createElement('div');
    bubble.className = 'whisper-bubble';
    bubble.innerHTML = `<span>✨ ${text} ✨</span>`;
    whisperContainer.appendChild(bubble);

    if (whisperTimeout) clearTimeout(whisperTimeout);
    whisperTimeout = setTimeout(() => {
      if (bubble.parentNode) {
        bubble.parentNode.removeChild(bubble);
      }
    }, 3200);
  };
});
