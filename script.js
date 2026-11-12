/**
 * ============================================================================
 * GIGIKU SEHAT, SENYUMKU HEBAT! - Mini Dental Show Interactive Game
 * Vanilla JavaScript (ES6+) • Modular Architecture • Zero Dependencies
 * ============================================================================
 */

(() => {
  "use strict";

  /* ==========================================================================
     1. BANK PERTANYAAN (12 KARTU MAKANAN & MINUMAN EDUKATIF)
     ========================================================================== */
  const QUESTION_BANK = [
    {
      id: 1,
      name: "Apel",
      emoji: "🍎",
      answer: "DO",
      explanation:
        "Buah utuh merupakan pilihan yang baik untuk tubuh dan gigi. Mengunyah apel juga membantu merangsang aliran air liur alami. Yuk, makan buah!"
    },
    {
      id: 2,
      name: "Wortel",
      emoji: "🥕",
      answer: "DO",
      explanation:
        "Sayuran renyah seperti wortel kaya vitamin dan serat yang baik untuk kesehatan tubuh serta gusi. Mengunyah sayuran juga membantu produksi air liur!"
    },
    {
      id: 3,
      name: "Air putih",
      emoji: "💧",
      answer: "DO",
      explanation:
        "Air putih membantu membersihkan sisa makanan di mulut, menjaga mulut tetap lembap, dan tidak mengandung gula sama sekali."
    },
    {
      id: 4,
      name: "Jambu",
      emoji: "🍐",
      answer: "DO",
      explanation:
        "Buah jambu kaya akan vitamin C yang sangat baik untuk menjaga kesehatan gusi dan jaringan penyangga gigi kita."
    },
    {
      id: 5,
      name: "Telur",
      emoji: "🥚",
      answer: "DO",
      explanation:
        "Telur mengandung protein, fosfor, dan vitamin D yang membantu tubuh menyerap kalsium agar gigi dan tulang tetap kuat."
    },
    {
      id: 6,
      name: "Susu tawar tanpa gula",
      emoji: "🥛",
      answer: "DO",
      explanation:
        "Susu tanpa tambahan gula mengandung kalsium dan fosfor yang baik untuk menjaga kekuatan email gigi dan tulang."
    },
    {
      id: 7,
      name: "Permen",
      emoji: "🍬",
      answer: "DONT",
      explanation:
        "Permen mengandung gula tinggi yang dapat digunakan bakteri di mulut untuk menghasilkan asam penyebab gigi berlubang."
    },
    {
      id: 8,
      name: "Cokelat manis",
      emoji: "🍫",
      answer: "DONT",
      explanation:
        "Cokelat manis mengandung banyak gula tambahan yang mudah menempel di permukaan gigi. Yuk, batasi dan minum air putih setelahnya!"
    },
    {
      id: 9,
      name: "Minuman bersoda",
      emoji: "🥤",
      answer: "DONT",
      explanation:
        "Minuman bersoda umumnya mengandung gula tinggi dan sifat asam yang dapat mengikis lapisan pelindung (email) gigi."
    },
    {
      id: 10,
      name: "Donat manis",
      emoji: "🍩",
      answer: "DONT",
      explanation:
        "Donat manis kaya akan gula dan tepung olahan yang mudah terselip di sela-sela gigi dan menjadi makanan bagi bakteri."
    },
    {
      id: 11,
      name: "Minuman manis",
      emoji: "🧃",
      answer: "DONT",
      explanation:
        "Minuman kemasan atau sirup manis mengandung banyak gula cair yang dapat membasahi seluruh sela gigi dan memicu asam."
    },
    {
      id: 12,
      name: "Permen lengket",
      emoji: "🍭",
      answer: "DONT",
      explanation:
        "Permen lengket sangat mudah menempel lama di lekukan gigi geraham dan sulit dibersihkan hanya dengan berkumur."
    }
  ];

  const TOTAL_QUESTIONS = QUESTION_BANK.length; // Selalu tampilkan seluruh 12 pertanyaan
  const MAX_PLAYERS = 3;
  const POINTS_PER_CORRECT = 10;
  const STORAGE_KEY_SOUND = "dentalGameSoundEnabled";

  /* ==========================================================================
     2. MODUL SOUND EFFECT (WEB AUDIO API SYNTHESIZER)
     ========================================================================== */
  const SoundFX = (() => {
    let audioCtx = null;
    let soundEnabled = true;

    try {
      const saved = localStorage.getItem(STORAGE_KEY_SOUND);
      if (saved !== null) {
        soundEnabled = saved === "true";
      }
    } catch (_) {}

    function getContext() {
      if (!soundEnabled) return null;
      if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          audioCtx = new AudioContextClass();
        }
      }
      if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume().catch(() => {});
      }
      return audioCtx;
    }

    function playTone(freq, type, duration, startTimeOffset = 0, volume = 0.18) {
      const ctx = getContext();
      if (!ctx) return;

      const now = ctx.currentTime + startTimeOffset;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(volume, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.02);
    }

    return {
      isEnabled() {
        return soundEnabled;
      },

      toggle() {
        soundEnabled = !soundEnabled;
        try {
          localStorage.setItem(STORAGE_KEY_SOUND, String(soundEnabled));
        } catch (_) {}
        if (soundEnabled) {
          this.click();
        }
        return soundEnabled;
      },

      click() {
        playTone(580, "sine", 0.08, 0, 0.16);
        playTone(860, "triangle", 0.07, 0.03, 0.12);
      },

      cardPop() {
        playTone(440, "sine", 0.09, 0, 0.12);
        playTone(660, "sine", 0.11, 0.05, 0.14);
      },

      correct() {
        playTone(523.25, "triangle", 0.14, 0.0, 0.22);
        playTone(659.25, "triangle", 0.14, 0.1, 0.22);
        playTone(783.99, "triangle", 0.16, 0.2, 0.24);
        playTone(1046.5, "sine", 0.42, 0.3, 0.28);
      },

      wrong() {
        playTone(349.23, "sine", 0.18, 0.0, 0.18);
        playTone(293.66, "triangle", 0.32, 0.15, 0.2);
      },

      nextTurn() {
        playTone(440, "triangle", 0.12, 0.0, 0.18);
        playTone(554.37, "triangle", 0.12, 0.1, 0.18);
        playTone(659.25, "triangle", 0.28, 0.2, 0.22);
      },

      grandVictory() {
        const notes = [
          { f: 523.25, d: 0.14, t: 0.0 },
          { f: 659.25, d: 0.14, t: 0.13 },
          { f: 783.99, d: 0.14, t: 0.26 },
          { f: 1046.5, d: 0.28, t: 0.39 },
          { f: 783.99, d: 0.14, t: 0.68 },
          { f: 1046.5, d: 0.55, t: 0.82 }
        ];
        notes.forEach((n) => playTone(n.f, "triangle", n.d, n.t, 0.25));
      }
    };
  })();

  /* ==========================================================================
     3. MODUL CONFETTI PERAYAAN (HTML5 CANVAS)
     ========================================================================== */
  const ConfettiFX = (() => {
    const canvas = document.getElementById("confetti-canvas");
    const ctx = canvas.getContext("2d");
    let particles = [];
    let animId = null;

    const COLORS = ["#22c55e", "#0ea5e9", "#facc15", "#f97316", "#ec4899", "#a855f7"];

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    window.addEventListener("resize", resize);
    resize();

    function createParticles(count) {
      for (let i = 0; i < count; i++) {
        particles.push({
          x: window.innerWidth * (0.2 + Math.random() * 0.6),
          y: window.innerHeight * 0.35,
          vx: (Math.random() - 0.5) * 18,
          vy: -(Math.random() * 14 + 6),
          size: Math.random() * 10 + 7,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 12,
          gravity: 0.36,
          opacity: 1
        });
      }
    }

    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.rotation += p.rotationSpeed;
        p.opacity -= 0.008;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.65);
        ctx.restore();
      });

      particles = particles.filter((p) => p.opacity > 0 && p.y < canvas.height + 40);

      if (particles.length > 0) {
        animId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        animId = null;
      }
    }

    return {
      burst(count = 75) {
        createParticles(count);
        if (!animId) {
          animId = requestAnimationFrame(render);
        }
      },
      clear() {
        particles = [];
        if (animId) {
          cancelAnimationFrame(animId);
          animId = null;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
  })();

  /* ==========================================================================
     4. STATE PERMAINAN & REFERENSI DOM
     ========================================================================== */
  const state = {
    playerCount: 1, // Default: 1 pemain (bisa diatur 1, 2, atau 3 pemain)
    players: [
      { name: "PEMAIN 1", avatar: "🧒", score: 0 },
      { name: "PEMAIN 2", avatar: "👧", score: 0 },
      { name: "PEMAIN 3", avatar: "🦸", score: 0 }
    ],
    deck: [],
    currentPlayerIndex: 0,
    currentQuestionInRound: 0,
    globalQuestionIndex: 0,
    isAnsweringAllowed: false,
    isFocusFullscreen: false
  };

  // Referensi Layar
  const screens = {
    start: document.getElementById("screen-start"),
    howto: document.getElementById("screen-howto"),
    players: document.getElementById("screen-players"),
    game: document.getElementById("screen-game"),
    results: document.getElementById("screen-results")
  };

  // Referensi Elemen Game Utama
  const dom = {
    playersSetupGrid: document.getElementById("players-setup-grid"),
    playersSubtitle: document.getElementById("players-subtitle"),
    btnStartRoundLabel: document.getElementById("btn-start-round-label"),

    hudOverallProgress: document.getElementById("hud-overall-progress"),
    hudPlayerAvatar: document.getElementById("hud-player-avatar"),
    hudPlayerName: document.getElementById("hud-player-name"),
    hudRoundText: document.getElementById("hud-round-text"),
    hudRoundDots: document.getElementById("hud-round-dots"),
    hudScoreValue: document.getElementById("hud-score-value"),
    liveScoreboard: document.getElementById("live-scoreboard"),

    foodCard: document.getElementById("food-card"),
    cardNumberTag: document.getElementById("card-number-tag"),
    cardEmoji: document.getElementById("card-emoji"),
    cardName: document.getElementById("card-name"),

    zoneDo: document.getElementById("zone-do"),
    zoneDont: document.getElementById("zone-dont"),

    feedbackModal: document.getElementById("feedback-modal"),
    feedbackCard: document.getElementById("feedback-card"),
    feedbackIcon: document.getElementById("feedback-icon"),
    feedbackHeadline: document.getElementById("feedback-headline"),
    feedbackPoints: document.getElementById("feedback-points"),
    feedbackFoodEmoji: document.getElementById("feedback-food-emoji"),
    feedbackFoodName: document.getElementById("feedback-food-name"),
    feedbackCategoryTag: document.getElementById("feedback-category-tag"),
    feedbackExplanation: document.getElementById("feedback-explanation"),
    btnNextQuestion: document.getElementById("btn-next-question"),

    turnModal: document.getElementById("turn-modal"),
    turnRoundBadge: document.getElementById("turn-round-badge"),
    turnAvatar: document.getElementById("turn-avatar"),
    turnHeadline: document.getElementById("turn-headline"),
    turnSubtext: document.getElementById("turn-subtext"),
    btnStartTurn: document.getElementById("btn-start-turn"),
    btnStartTurnLabel: document.getElementById("btn-start-turn-label"),

    podiumGrid: document.getElementById("podium-grid"),

    btnSoundToggle: document.getElementById("btn-sound-toggle"),
    soundIcon: document.getElementById("sound-icon"),
    soundLabel: document.getElementById("sound-label"),
    btnFullscreen: document.getElementById("btn-fullscreen"),
    btnExitFullscreenFloat: document.getElementById("btn-exit-fullscreen-float")
  };

  /* ==========================================================================
     5. FUNGSI UTILITAS & FAIR PLAY SHUFFLE
     ========================================================================== */
  function shuffleDeck(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function showScreen(screenKey) {
    Object.values(screens).forEach((el) => el.classList.remove("active"));
    if (screens[screenKey]) {
      screens[screenKey].classList.add("active");
    }
    dom.feedbackModal.classList.add("hidden");
    dom.turnModal.classList.add("hidden");
  }

  function getQuestionsPerPlayer() {
    return Math.floor(TOTAL_QUESTIONS / state.playerCount);
  }

  function getHeroTitle(score) {
    const maxScore = getQuestionsPerPlayer() * POINTS_PER_CORRECT;
    const ratio = maxScore > 0 ? score / maxScore : 0;
    if (ratio >= 1) return "SUPER DENTAL HERO!";
    if (ratio >= 0.75) return "GIGI HEBAT!";
    if (ratio >= 0.5) return "CALON PAHLAWAN GIGI!";
    return "TETAP SEMANGAT, PAHLAWAN!";
  }

  /* ==========================================================================
     6. PENGATURAN JUMLAH PEMAIN (DEFAULT 1 PEMAIN) & MULAI PERMAINAN
     ========================================================================== */
  function setPlayerCount(count) {
    const validCount = Math.max(1, Math.min(MAX_PLAYERS, Number(count) || 1));
    state.playerCount = validCount;
    const qPerPlayer = getQuestionsPerPlayer();

    // Update tombol jumlah pemain aktif
    document.querySelectorAll(".count-btn").forEach((btn) => {
      const btnCount = Number(btn.getAttribute("data-count"));
      btn.classList.toggle("active", btnCount === validCount);
    });

    // Update grid kartu setup pemain
    dom.playersSetupGrid.className = `players-grid count-${validCount}`;
    for (let i = 0; i < MAX_PLAYERS; i++) {
      const cardEl = document.getElementById(`setup-card-${i}`);
      if (cardEl) {
        cardEl.classList.toggle("hidden-card", i >= validCount);
      }
    }

    // Update teks informasi sesuai jumlah pemain (selalu total 12 kartu)
    if (validCount === 1) {
      dom.playersSubtitle.textContent = `Mode 1 Pemain: Jawab seluruh ${TOTAL_QUESTIONS} kartu makanan untuk meraih gelar Pahlawan Gigi Sehat!`;
      dom.btnStartRoundLabel.textContent = "MULAI PERMAINAN";
    } else {
      dom.playersSubtitle.textContent = `${validCount} Peserta bermain bergantian menjawab seluruh ${TOTAL_QUESTIONS} kartu (masing-masing ${qPerPlayer} kartu!)`;
      dom.btnStartRoundLabel.textContent = "MULAI ROUND 1";
    }
  }

  function readPlayerSetupInputs() {
    for (let i = 0; i < MAX_PLAYERS; i++) {
      const inputEl = document.getElementById(`input-player-${i}`);
      const rawName = inputEl ? inputEl.value.trim() : "";
      state.players[i].name = rawName ? rawName.toUpperCase() : `PEMAIN ${i + 1}`;
      state.players[i].score = 0;
    }
  }

  function buildLiveScoreboardDOM() {
    dom.liveScoreboard.className = `live-scoreboard count-${state.playerCount}`;
    dom.liveScoreboard.innerHTML = "";

    for (let i = 0; i < state.playerCount; i++) {
      const p = state.players[i];
      const pill = document.createElement("div");
      pill.className = `mini-score-pill ${i === state.currentPlayerIndex ? "active" : ""}`;
      pill.id = `live-pill-${i}`;
      pill.innerHTML = `
        <span class="mini-avatar" id="live-avatar-${i}">${p.avatar}</span>
        <span class="mini-name" id="live-name-${i}">${escapeHTML(p.name)}</span>
        <strong class="mini-pts" id="live-pts-${i}">${p.score} Poin</strong>
      `;
      dom.liveScoreboard.appendChild(pill);
    }
  }

  function buildProgressDotsDOM() {
    const qPerPlayer = getQuestionsPerPlayer();
    dom.hudRoundDots.innerHTML = "";
    for (let i = 0; i < qPerPlayer; i++) {
      const dot = document.createElement("span");
      dot.className = "dot";
      dom.hudRoundDots.appendChild(dot);
    }
  }

  function startNewGameSession() {
    readPlayerSetupInputs();

    // Selalu tampilkan seluruh 12 kartu pertanyaan yang tersedia secara acak
    state.deck = shuffleDeck(QUESTION_BANK);

    state.currentPlayerIndex = 0;
    state.currentQuestionInRound = 0;
    state.globalQuestionIndex = 0;
    state.isAnsweringAllowed = false;

    ConfettiFX.clear();
    buildProgressDotsDOM();
    buildLiveScoreboardDOM();
    showScreen("game");
    renderCurrentQuestion();
  }

  /* ==========================================================================
     7. RENDER PERTANYAAN & HUD GAME UTAMA
     ========================================================================== */
  function updateLiveScoreboard() {
    for (let i = 0; i < state.playerCount; i++) {
      const pill = document.getElementById(`live-pill-${i}`);
      const avatar = document.getElementById(`live-avatar-${i}`);
      const name = document.getElementById(`live-name-${i}`);
      const pts = document.getElementById(`live-pts-${i}`);

      if (pill) {
        pill.classList.toggle("active", i === state.currentPlayerIndex);
      }
      if (avatar) avatar.textContent = state.players[i].avatar;
      if (name) name.textContent = state.players[i].name;
      if (pts) pts.textContent = `${state.players[i].score} Poin`;
    }
  }

  function renderProgressDots() {
    const dots = dom.hudRoundDots.querySelectorAll(".dot");
    dots.forEach((dot, idx) => {
      dot.classList.remove("done", "active");
      if (idx < state.currentQuestionInRound) {
        dot.classList.add("done");
      } else if (idx === state.currentQuestionInRound) {
        dot.classList.add("active");
      }
    });
  }

  function renderCurrentQuestion() {
    const activePlayer = state.players[state.currentPlayerIndex];
    const currentCard = state.deck[state.globalQuestionIndex];
    const qPerPlayer = getQuestionsPerPlayer();

    // Update HUD Header
    dom.hudOverallProgress.textContent = `Kartu ${state.globalQuestionIndex + 1} / ${state.deck.length}`;
    dom.hudPlayerAvatar.textContent = activePlayer.avatar;
    dom.hudPlayerName.textContent = activePlayer.name;

    if (state.playerCount === 1) {
      dom.hudRoundText.textContent = `PERTANYAAN ${state.currentQuestionInRound + 1} / ${qPerPlayer}`;
    } else {
      dom.hudRoundText.textContent = `RONDE ${state.currentPlayerIndex + 1} • SOAL ${state.currentQuestionInRound + 1}/${qPerPlayer}`;
    }

    dom.hudScoreValue.textContent = `${activePlayer.score} POIN`;

    renderProgressDots();
    updateLiveScoreboard();

    // Reset posisi dan animasi kartu makanan
    dom.foodCard.style.transform = "";
    dom.foodCard.classList.remove("card-fly-left", "card-fly-right", "card-pop-in");
    void dom.foodCard.offsetWidth;

    dom.cardNumberTag.textContent = `KARTU #${state.globalQuestionIndex + 1} DARI ${state.deck.length}`;
    dom.cardEmoji.textContent = currentCard.emoji;
    dom.cardName.textContent = currentCard.name;
    dom.foodCard.classList.add("card-pop-in");

    SoundFX.cardPop();
    state.isAnsweringAllowed = true;
  }

  /* ==========================================================================
     8. EVALUASI JAWABAN & MODAL FEEDBACK EDUKATIF
     ========================================================================== */
  function submitAnswer(chosenCategory) {
    if (!state.isAnsweringAllowed) return;
    state.isAnsweringAllowed = false;

    const currentCard = state.deck[state.globalQuestionIndex];
    const activePlayer = state.players[state.currentPlayerIndex];
    const isCorrect = chosenCategory === currentCard.answer;

    dom.foodCard.classList.remove("card-pop-in");
    if (chosenCategory === "DO") {
      dom.foodCard.classList.add("card-fly-left");
    } else {
      dom.foodCard.classList.add("card-fly-right");
    }

    if (isCorrect) {
      activePlayer.score += POINTS_PER_CORRECT;
      SoundFX.correct();
      ConfettiFX.burst(70);
    } else {
      SoundFX.wrong();
    }

    dom.hudScoreValue.textContent = `${activePlayer.score} POIN`;
    updateLiveScoreboard();

    setTimeout(() => {
      showFeedbackModal(isCorrect, currentCard);
    }, 260);
  }

  function showFeedbackModal(isCorrect, card) {
    dom.feedbackCard.classList.remove("feedback-correct", "feedback-wrong");
    dom.feedbackCard.classList.add(isCorrect ? "feedback-correct" : "feedback-wrong");

    if (isCorrect) {
      dom.feedbackIcon.textContent = "🎉🦷✨";
      dom.feedbackHeadline.textContent = "HEBAT! JAWABAN KAMU BENAR!";
      dom.feedbackPoints.textContent = `+${POINTS_PER_CORRECT} POIN`;
    } else {
      dom.feedbackIcon.textContent = "💡🦷";
      dom.feedbackHeadline.textContent = "YUK, BELAJAR LAGI!";
      dom.feedbackPoints.textContent = "+0 POIN";
    }

    dom.feedbackFoodEmoji.textContent = card.emoji;
    dom.feedbackFoodName.textContent = card.name;

    if (card.answer === "DO") {
      dom.feedbackCategoryTag.textContent = "✅ DO • PILIHAN BAIK UNTUK GIGI";
      dom.feedbackCategoryTag.className = "category-pill pill-do";
    } else {
      dom.feedbackCategoryTag.textContent = "❌ DON'T • PERLU DIBATASI";
      dom.feedbackCategoryTag.className = "category-pill pill-dont";
    }

    dom.feedbackExplanation.textContent = card.explanation;
    dom.feedbackModal.classList.remove("hidden");
    dom.btnNextQuestion.focus();
  }

  function advanceToNextStep() {
    SoundFX.click();
    dom.feedbackModal.classList.add("hidden");

    state.globalQuestionIndex += 1;
    state.currentQuestionInRound += 1;

    // Cek apakah seluruh 12 kartu sesi ini telah selesai dijawab
    if (state.globalQuestionIndex >= state.deck.length) {
      showFinalResults();
      return;
    }

    // Cek apakah pemain saat ini sudah menyelesaikan jatah pertanyaannya
    const qPerPlayer = getQuestionsPerPlayer();
    if (state.currentQuestionInRound >= qPerPlayer) {
      state.currentPlayerIndex += 1;
      state.currentQuestionInRound = 0;
      showTurnTransitionModal();
      return;
    }

    renderCurrentQuestion();
  }

  function showTurnTransitionModal() {
    const nextPlayer = state.players[state.currentPlayerIndex];
    const roundNumber = state.currentPlayerIndex + 1;
    const qPerPlayer = getQuestionsPerPlayer();

    SoundFX.nextTurn();
    dom.turnRoundBadge.textContent = `RONDE ${roundNumber} DARI ${state.playerCount}`;
    dom.turnAvatar.textContent = nextPlayer.avatar;
    dom.turnHeadline.textContent = `GILIRAN ${nextPlayer.name}!`;
    dom.turnSubtext.textContent = `Ayo beri tepuk tangan meriah! ${nextPlayer.name} siap menjawab ${qPerPlayer} kartu makanan berikutnya!`;
    dom.btnStartTurnLabel.textContent = `MULAI RONDE ${roundNumber}!`;

    dom.turnModal.classList.remove("hidden");
    dom.btnStartTurn.focus();
  }

  /* ==========================================================================
     9. LAYAR HASIL AKHIR & PERINGKAT PAHLAWAN GIGI SEHAT
     ========================================================================== */
  function showFinalResults() {
    showScreen("results");
    SoundFX.grandVictory();
    ConfettiFX.burst(130);

    const activePlayers = state.players.slice(0, state.playerCount);
    const rankedPlayers = activePlayers
      .map((p, originalIdx) => ({ ...p, originalIdx }))
      .sort((a, b) => b.score - a.score);

    const medals =
      state.playerCount === 1
        ? ["🏆 PAHLAWAN GIGI SEHAT"]
        : ["🥇 PERINGKAT 1", "🥈 PERINGKAT 2", "🥉 PERINGKAT 3"];

    dom.podiumGrid.className = `podium-grid count-${state.playerCount}`;
    dom.podiumGrid.innerHTML = "";

    rankedPlayers.forEach((player, idx) => {
      const card = document.createElement("div");
      card.className = `podium-card ${idx === 0 ? "rank-1" : ""}`;

      const heroTitle = getHeroTitle(player.score);

      card.innerHTML = `
        <div class="rank-medal">${medals[idx] || "🏅 PESERTA"}</div>
        <div class="podium-avatar" aria-hidden="true">${player.avatar}</div>
        <div class="podium-name">${escapeHTML(player.name)}</div>
        <div class="podium-score">${player.score} POIN</div>
        <div class="podium-title-badge">🦷 ${heroTitle}</div>
      `;

      dom.podiumGrid.appendChild(card);
    });
  }

  /* ==========================================================================
     10. DRAG AND DROP (MOUSE + LAYAR SENTUH VIA POINTER EVENTS)
     ========================================================================== */
  function initCardDragAndDrop() {
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let currentHoverZone = null;

    function checkZoneOverlap(clientX, clientY) {
      const doRect = dom.zoneDo.getBoundingClientRect();
      const dontRect = dom.zoneDont.getBoundingClientRect();

      const inDo =
        clientX >= doRect.left &&
        clientX <= doRect.right &&
        clientY >= doRect.top &&
        clientY <= doRect.bottom;

      const inDont =
        clientX >= dontRect.left &&
        clientX <= dontRect.right &&
        clientY >= dontRect.top &&
        clientY <= dontRect.bottom;

      dom.zoneDo.classList.toggle("drag-over", inDo);
      dom.zoneDont.classList.toggle("drag-over", inDont);

      if (inDo) return "DO";
      if (inDont) return "DONT";
      return null;
    }

    dom.foodCard.addEventListener("pointerdown", (e) => {
      if (!state.isAnsweringAllowed) return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      currentHoverZone = null;
      dom.foodCard.classList.add("dragging");
      dom.foodCard.setPointerCapture(e.pointerId);
    });

    dom.foodCard.addEventListener("pointermove", (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const rotate = Math.max(-18, Math.min(18, dx * 0.06));

      dom.foodCard.style.transform = `translate(${dx}px, ${dy}px) rotate(${rotate}deg)`;

      currentHoverZone = checkZoneOverlap(e.clientX, e.clientY);
      if (!currentHoverZone) {
        if (dx < -130) {
          dom.zoneDo.classList.add("drag-over");
          currentHoverZone = "DO";
        } else if (dx > 130) {
          dom.zoneDont.classList.add("drag-over");
          currentHoverZone = "DONT";
        }
      }
    });

    function finishDrag() {
      if (!isDragging) return;
      isDragging = false;
      dom.foodCard.classList.remove("dragging");
      dom.zoneDo.classList.remove("drag-over");
      dom.zoneDont.classList.remove("drag-over");

      if (currentHoverZone) {
        submitAnswer(currentHoverZone);
      } else {
        dom.foodCard.style.transform = "";
      }
      currentHoverZone = null;
    }

    dom.foodCard.addEventListener("pointerup", finishDrag);
    dom.foodCard.addEventListener("pointercancel", finishDrag);
  }

  /* ==========================================================================
     11. FULLSCREEN FOKUS BERSIH (CLEAN MODE) & KONTROL SUARA
     ========================================================================== */
  function updateSoundUI() {
    const enabled = SoundFX.isEnabled();
    dom.btnSoundToggle.classList.toggle("active", enabled);
    dom.btnSoundToggle.setAttribute("aria-pressed", String(enabled));
    dom.soundIcon.textContent = enabled ? "🔊" : "🔇";
    dom.soundLabel.textContent = enabled ? "Suara: ON" : "Suara: OFF";
  }

  function applyFocusFullscreenState(isActive) {
    state.isFocusFullscreen = isActive;
    document.body.classList.toggle("fullscreen-focus", isActive);
  }

  function enterFocusFullscreen() {
    SoundFX.click();
    applyFocusFullscreenState(true);
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  }

  function exitFocusFullscreen() {
    SoundFX.click();
    applyFocusFullscreenState(false);
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  }

  function toggleFullscreen() {
    if (state.isFocusFullscreen || document.fullscreenElement) {
      exitFocusFullscreen();
    } else {
      enterFocusFullscreen();
    }
  }

  document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement && state.isFocusFullscreen) {
      applyFocusFullscreenState(false);
    } else if (document.fullscreenElement && !state.isFocusFullscreen) {
      applyFocusFullscreenState(true);
    }
  });

  /* ==========================================================================
     12. EVENT LISTENERS & SHORTCUT OPERATOR PANGGUNG
     ========================================================================== */
  function bindEvents() {
    document.getElementById("btn-start-game").addEventListener("click", () => {
      SoundFX.click();
      showScreen("players");
    });

    document.getElementById("btn-how-to-play").addEventListener("click", () => {
      SoundFX.click();
      showScreen("howto");
    });

    document.getElementById("btn-back-start").addEventListener("click", () => {
      SoundFX.click();
      showScreen("start");
    });

    document.getElementById("btn-howto-ready").addEventListener("click", () => {
      SoundFX.click();
      showScreen("players");
    });

    document.getElementById("btn-players-back").addEventListener("click", () => {
      SoundFX.click();
      showScreen("start");
    });

    // Pemilih Jumlah Pemain (1, 2, atau 3 Pemain)
    document.querySelectorAll(".count-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        SoundFX.click();
        const chosenCount = Number(btn.getAttribute("data-count"));
        setPlayerCount(chosenCount);
      });
    });

    // Interaksi Maskot di Halaman Depan
    document.getElementById("start-mascot").addEventListener("click", () => {
      SoundFX.correct();
      ConfettiFX.burst(40);
    });

    // Pemilih Avatar Pemain
    document.querySelectorAll(".avatar-opt").forEach((btn) => {
      btn.addEventListener("click", () => {
        SoundFX.click();
        const playerIdx = Number(btn.getAttribute("data-player"));
        const avatarChar = btn.getAttribute("data-avatar");

        state.players[playerIdx].avatar = avatarChar;
        const previewEl = document.getElementById(`avatar-preview-${playerIdx}`);
        if (previewEl) previewEl.textContent = avatarChar;

        btn.parentElement.querySelectorAll(".avatar-opt").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });

    // Mulai Permainan / Round 1
    document.getElementById("btn-start-round-1").addEventListener("click", () => {
      SoundFX.nextTurn();
      startNewGameSession();
    });

    // Tombol Pilihan DO dan DON'T
    dom.zoneDo.addEventListener("click", () => {
      submitAnswer("DO");
    });

    dom.zoneDont.addEventListener("click", () => {
      submitAnswer("DONT");
    });

    // Tombol Lanjutkan pada Modal Feedback
    dom.btnNextQuestion.addEventListener("click", advanceToNextStep);

    // Tombol Mulai Giliran Pemain Berikutnya
    dom.btnStartTurn.addEventListener("click", () => {
      SoundFX.click();
      dom.turnModal.classList.add("hidden");
      renderCurrentQuestion();
    });

    // Tombol Hasil Akhir
    document.getElementById("btn-play-again").addEventListener("click", () => {
      SoundFX.click();
      showScreen("players");
    });

    document.getElementById("btn-home-end").addEventListener("click", () => {
      SoundFX.click();
      ConfettiFX.clear();
      showScreen("start");
    });

    // Top Control Bar (Operator Controls)
    document.getElementById("btn-home-top").addEventListener("click", () => {
      SoundFX.click();
      ConfettiFX.clear();
      showScreen("start");
    });

    document.getElementById("btn-logo-home").addEventListener("click", () => {
      SoundFX.click();
      ConfettiFX.clear();
      showScreen("start");
    });

    document.getElementById("btn-restart-top").addEventListener("click", () => {
      SoundFX.click();
      ConfettiFX.clear();
      showScreen("players");
    });

    dom.btnSoundToggle.addEventListener("click", () => {
      SoundFX.toggle();
      updateSoundUI();
    });

    dom.btnFullscreen.addEventListener("click", toggleFullscreen);
    dom.btnExitFullscreenFloat.addEventListener("click", exitFocusFullscreen);

    // Shortcut Keyboard untuk Operator di Atas Panggung
    window.addEventListener("keydown", (e) => {
      const activeTag = document.activeElement ? document.activeElement.tagName : "";
      if (activeTag === "INPUT" || activeTag === "TEXTAREA") return;

      if (e.key === "Escape" && state.isFocusFullscreen) {
        exitFocusFullscreen();
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        SoundFX.toggle();
        updateSoundUI();
      } else if (!dom.feedbackModal.classList.contains("hidden")) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          advanceToNextStep();
        }
      } else if (!dom.turnModal.classList.contains("hidden")) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          dom.btnStartTurn.click();
        }
      } else if (screens.game.classList.contains("active") && state.isAnsweringAllowed) {
        if (e.key === "ArrowLeft" || e.key === "1") {
          e.preventDefault();
          submitAnswer("DO");
        } else if (e.key === "ArrowRight" || e.key === "2") {
          e.preventDefault();
          submitAnswer("DONT");
        }
      }
    });
  }

  /* ==========================================================================
     13. INISIALISASI APLIKASI
     ========================================================================== */
  function init() {
    setPlayerCount(1); // Default adalah 1 pemain
    updateSoundUI();
    initCardDragAndDrop();
    bindEvents();
  }

  init();
})();
