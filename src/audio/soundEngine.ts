class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;

  // --- VOLUME CONTROLS (Defaults: End of Time BGM 18%, All Voices 20%) ---
  private bgmVolume: number = 0.18;      // 18% default End of Time background music volume
  private scriptureVolume: number = 0.20; // 20% default voice volume (all voices 20%)
  private sfxVolume: number = 0.30;

  // --- END OF TIME: APOCALYPTIC CELESTIAL TRUMPETS & SERAPHIC PAD BGM ---
  private endTimesInterval: number | null = null;
  private endTimesGainNode: GainNode | null = null;
  private isEndTimesMusicActive: boolean = false;
  private currentEndTimesMeasure: number = 0;

  // Cached system voices for natural realistic speech
  private cachedVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        try {
          this.cachedVoices = window.speechSynthesis.getVoices() || [];
        } catch (e) {
          // Ignore
        }
      };
      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.35, this.ctx.currentTime);
    }
    if (muted) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  }

  public getMuted() {
    return this.isMuted;
  }

  public getBgmVolume(): number {
    return this.bgmVolume;
  }

  public setBgmVolume(val: number) {
    this.bgmVolume = Math.max(0, Math.min(1, val));
    if (this.endTimesGainNode && this.ctx) {
      try {
        this.endTimesGainNode.gain.setValueAtTime(this.bgmVolume, this.ctx.currentTime);
      } catch (e) {
        // Ignore
      }
    }
  }

  public getScriptureVolume(): number {
    return this.scriptureVolume;
  }

  public setScriptureVolume(val: number) {
    this.scriptureVolume = Math.max(0, Math.min(1, val));
  }

  public getSfxVolume(): number {
    return this.sfxVolume;
  }

  public setSfxVolume(val: number) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
  }

  public startRainAudio(_volume = 0.05) {
    // Soft atmospheric rain for midnight stage
  }

  public stopRainAudio() {
    // No-op
  }

  public playDragonDefeat() {
    this.playCelestialTrumpet();
    this.playCleansingChime();
  }

  // --- END OF TIME: APOCALYPTIC CELESTIAL BACKGROUND MUSIC SYNTHESIZER ---
  // Awe-inspiring, holy, and majestic: Cathedral Organ drone, Seraphic choir pads,
  // Harp of the Redeemed (Rev 14:2), and the Golden Trumpets of Revelation (Rev 11:15)
  private playEndTimesCelestialPad(
    freq: number,
    startTime: number,
    duration: number = 3.6,
    velocity: number = 0.08
  ) {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const padFilter = this.ctx.createBiquadFilter();
      const padGain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(freq, startTime);
      osc2.frequency.setValueAtTime(freq * 1.0025, startTime); // Celestial shimmering chorus

      padFilter.type = 'lowpass';
      padFilter.frequency.setValueAtTime(950, startTime);
      padFilter.frequency.exponentialRampToValueAtTime(1400, startTime + duration * 0.5);
      padFilter.frequency.exponentialRampToValueAtTime(700, startTime + duration);

      // Majestic swell and reverent release
      padGain.gain.setValueAtTime(0.0001, startTime);
      padGain.gain.linearRampToValueAtTime(velocity, startTime + 0.6);
      padGain.gain.exponentialRampToValueAtTime(velocity * 0.75, startTime + duration * 0.7);
      padGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc1.connect(padFilter);
      osc2.connect(padFilter);
      padFilter.connect(padGain);

      if (this.endTimesGainNode) {
        padGain.connect(this.endTimesGainNode);
      } else {
        padGain.connect(this.masterGain);
      }

      osc1.start(startTime);
      osc2.start(startTime);
      osc1.stop(startTime + duration + 0.05);
      osc2.stop(startTime + duration + 0.05);
    } catch (e) {
      // Ignore
    }
  }

  // Golden Revelation Trumpet / Shofar Fanfare Synthesizer (Resonant brass overtones)
  private playEndTimesTrumpetNote(
    freq: number,
    startTime: number,
    duration: number = 1.4,
    velocity: number = 0.16
  ) {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const brassFilter = this.ctx.createBiquadFilter();
      const noteGain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(freq, startTime);
      osc2.frequency.setValueAtTime(freq * 1.001, startTime);

      // Resonant trumpet filter envelope
      brassFilter.type = 'bandpass';
      brassFilter.frequency.setValueAtTime(1800, startTime);
      brassFilter.Q.setValueAtTime(2.2, startTime);
      brassFilter.frequency.exponentialRampToValueAtTime(900, startTime + duration);

      noteGain.gain.setValueAtTime(0.0001, startTime);
      noteGain.gain.linearRampToValueAtTime(velocity, startTime + 0.06); // Fast brass attack
      noteGain.gain.exponentialRampToValueAtTime(velocity * 0.65, startTime + duration * 0.5);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc1.connect(brassFilter);
      osc2.connect(brassFilter);
      brassFilter.connect(noteGain);

      if (this.endTimesGainNode) {
        noteGain.connect(this.endTimesGainNode);
      } else {
        noteGain.connect(this.masterGain);
      }

      osc1.start(startTime);
      osc2.start(startTime);
      osc1.stop(startTime + duration + 0.05);
      osc2.stop(startTime + duration + 0.05);
    } catch (e) {
      // Ignore
    }
  }

  // Harp of the Redeemed Sparkling Arpeggio Note (Revelation 14:2)
  private playEndTimesHarpPluck(
    freq: number,
    startTime: number,
    duration: number = 1.8,
    velocity: number = 0.12
  ) {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const osc = this.ctx.createOscillator();
      const harpFilter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      harpFilter.type = 'lowpass';
      harpFilter.frequency.setValueAtTime(3200, startTime);
      harpFilter.frequency.exponentialRampToValueAtTime(400, startTime + duration);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(velocity, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(harpFilter);
      harpFilter.connect(gain);

      if (this.endTimesGainNode) {
        gain.connect(this.endTimesGainNode);
      } else {
        gain.connect(this.masterGain);
      }

      osc.start(startTime);
      osc.stop(startTime + duration + 0.05);
    } catch (e) {
      // Ignore
    }
  }

  // End of Time Epic Measures:
  // Solemn Midnight Vigil (Dm) -> The Great Gathering (Bb) -> The Word of God (F) ->
  // The Throne of Glory (C) -> The War in Heaven (Gm) -> Victory of the Lamb (A / D)
  private getEndTimesThemeMeasures() {
    const D2 = 73.42, F2 = 87.31, G2 = 98.00, A2 = 110.00, Bb2 = 116.54, C3 = 130.81, D3 = 146.83, E3 = 164.81, F3 = 174.61, G3 = 196.00, A3 = 220.00, Bb3 = 233.08;
    const C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23, G4 = 392.00, A4 = 440.00, Bb4 = 466.16, B4 = 493.88, C5 = 523.25, D5 = 587.33;

    return [
      // Measure 1: "The Midnight Cry: Behold, the Bridegroom Comes!" (D minor)
      {
        bass: D2,
        padChords: [D3, F3, A3, D4],
        harpNotes: [
          { freq: D4, time: 0.0 }, { freq: F4, time: 0.2 }, { freq: A4, time: 0.4 }, { freq: D5, time: 0.6 },
        ],
        trumpets: [
          { freq: A3, time: 0.8, dur: 0.4, vel: 0.16 },
          { freq: D4, time: 1.25, dur: 0.5, vel: 0.18 },
          { freq: F4, time: 1.8, dur: 0.9, vel: 0.22 },
        ],
      },
      // Measure 2: "The Gathering of the Elect: The First Resurrection" (Bb Major)
      {
        bass: Bb2,
        padChords: [D3, F3, Bb3, D4],
        harpNotes: [
          { freq: Bb3, time: 0.0 }, { freq: D4, time: 0.2 }, { freq: F4, time: 0.4 }, { freq: Bb4, time: 0.6 },
        ],
        trumpets: [
          { freq: F4, time: 0.2, dur: 0.4, vel: 0.17 },
          { freq: G4, time: 0.7, dur: 0.4, vel: 0.17 },
          { freq: A4, time: 1.2, dur: 0.4, vel: 0.19 },
          { freq: Bb4, time: 1.7, dur: 0.95, vel: 0.23 }, // Resonant high trumpet of Zion
        ],
      },
      // Measure 3: "The Throne of Grace & The Scroll of Truth" (F Major -> C Major)
      {
        bass: F2,
        padChords: [C3, F3, A3, C4],
        harpNotes: [
          { freq: F3, time: 0.0 }, { freq: A3, time: 0.2 }, { freq: C4, time: 0.4 }, { freq: F4, time: 0.6 },
        ],
        trumpets: [
          { freq: A4, time: 0.1, dur: 0.45, vel: 0.18 },
          { freq: G4, time: 0.65, dur: 0.45, vel: 0.17 },
          { freq: F4, time: 1.2, dur: 0.5, vel: 0.19 },
          { freq: E4, time: 1.8, dur: 0.8, vel: 0.17 },
        ],
      },
      // Measure 4: "The War in Heaven: Michael & His Angels Prevail!" (G minor -> A Major)
      {
        bass: G2,
        padChords: [D3, G3, Bb3, D4],
        harpNotes: [
          { freq: G3, time: 0.0 }, { freq: Bb3, time: 0.2 }, { freq: D4, time: 0.4 }, { freq: G4, time: 0.6 },
        ],
        trumpets: [
          { freq: D4, time: 0.1, dur: 0.35, vel: 0.17 },
          { freq: G4, time: 0.5, dur: 0.4, vel: 0.19 },
          { freq: Bb4, time: 0.95, dur: 0.45, vel: 0.21 },
          { freq: A4, time: 1.5, dur: 1.1, vel: 0.24 }, // Triumphant trumpet hold
        ],
      },
      // Measure 5: "The King on the White Horse Descends (Rev 19:11)" (D minor -> D Major Triumph)
      {
        bass: D2,
        padChords: [D3, F3, A3, D4, F4],
        harpNotes: [
          { freq: D4, time: 0.0 }, { freq: F4, time: 0.18 }, { freq: A4, time: 0.36 }, { freq: D5, time: 0.54 }, { freq: C5, time: 0.72 },
        ],
        trumpets: [
          { freq: D4, time: 0.0, dur: 0.3, vel: 0.18 },
          { freq: F4, time: 0.35, dur: 0.3, vel: 0.19 },
          { freq: A4, time: 0.7, dur: 0.4, vel: 0.21 },
          { freq: D5, time: 1.2, dur: 1.3, vel: 0.25 }, // Sovereign King fanfare
        ],
      },
      // Measure 6: "Holy, Holy, Holy: The Eternal Kingdom of God" (A Major -> D)
      {
        bass: A2,
        padChords: [E3, A3, C4, E4],
        harpNotes: [
          { freq: A3, time: 0.0 }, { freq: C4, time: 0.2 }, { freq: E4, time: 0.4 }, { freq: A4, time: 0.6 },
        ],
        trumpets: [
          { freq: C5, time: 0.1, dur: 0.4, vel: 0.19 },
          { freq: B4, time: 0.6, dur: 0.4, vel: 0.18 },
          { freq: A4, time: 1.1, dur: 0.45, vel: 0.20 },
          { freq: D4, time: 1.7, dur: 0.95, vel: 0.22 },
        ],
      },
    ];
  }

  // Starts the End of Time Apocalyptic Background Music
  public startEndTimesBGM(volume?: number) {
    this.stopEndTimesBGM();
    this.initCtx();
    if (!this.ctx || this.isMuted) return;

    this.isEndTimesMusicActive = true;
    const effectiveVolume = volume !== undefined ? volume : this.bgmVolume;

    this.endTimesGainNode = this.ctx.createGain();
    this.endTimesGainNode.gain.setValueAtTime(effectiveVolume, this.ctx.currentTime);
    this.endTimesGainNode.connect(this.masterGain || this.ctx.destination);

    const measures = this.getEndTimesThemeMeasures();
    this.currentEndTimesMeasure = 0;

    const playNextMeasure = () => {
      if (!this.ctx || !this.isEndTimesMusicActive || this.isMuted) return;
      const now = this.ctx.currentTime;
      const m = measures[this.currentEndTimesMeasure];

      // 1. Cathedral Sub-Bass & Seraphic Choir Pad
      this.playEndTimesCelestialPad(m.bass * 2, now, 3.2, 0.09);
      if (m.padChords.length > 0) {
        m.padChords.forEach((chordFreq, idx) => {
          this.playEndTimesCelestialPad(chordFreq, now + idx * 0.08, 3.0, 0.05);
        });
      }

      // 2. Harps of the Redeemed Cascades
      if (m.harpNotes) {
        m.harpNotes.forEach((h) => {
          this.playEndTimesHarpPluck(h.freq, now + h.time, 2.0, 0.12);
        });
      }

      // 3. Golden Trumpets of Revelation
      if (m.trumpets) {
        m.trumpets.forEach((t) => {
          this.playEndTimesTrumpetNote(t.freq, now + t.time, t.dur, t.vel);
        });
      }

      this.currentEndTimesMeasure = (this.currentEndTimesMeasure + 1) % measures.length;
    };

    playNextMeasure();
    this.endTimesInterval = window.setInterval(playNextMeasure, 2800);
  }

  public isBgmPlaying(): boolean {
    return this.isEndTimesMusicActive;
  }

  public toggleBgm(): boolean {
    if (this.isEndTimesMusicActive) {
      this.stopEndTimesBGM();
      return false;
    } else {
      this.startEndTimesBGM();
      return true;
    }
  }

  public startStageMusic(_stage?: string) {
    this.startEndTimesBGM();
  }

  public startBattleAcousticBGM(_volume?: number) {
    this.startEndTimesBGM(_volume);
  }

  public stopAmbientMusic() {
    this.stopEndTimesBGM();
  }

  public stopBattleAcousticBGM() {
    this.stopEndTimesBGM();
  }

  public stopEndTimesBGM() {
    this.isEndTimesMusicActive = false;
    if (this.endTimesInterval) {
      clearInterval(this.endTimesInterval);
      this.endTimesInterval = null;
    }
    if (this.endTimesGainNode && this.ctx) {
      try {
        this.endTimesGainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.3);
        const nodeToDisconnect = this.endTimesGainNode;
        setTimeout(() => {
          try {
            nodeToDisconnect.disconnect();
          } catch (e) {
            // Ignore
          }
        }, 350);
        this.endTimesGainNode = null;
      } catch (e) {
        this.endTimesGainNode = null;
      }
    }
  }

  // --- REALISTIC HUMAN VOICE SELECTION HELPER ---
  private getBestRealisticVoice(
    gender: 'female' | 'male' | 'elder' | 'angel' | 'demon_male' | 'demon_female' = 'elder'
  ): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    const voices =
      this.cachedVoices.length > 0
        ? this.cachedVoices
        : window.speechSynthesis.getVoices() || [];
    if (voices.length === 0) return null;

    const enVoices = voices.filter(
      (v) => v.lang && (v.lang.startsWith('en') || v.lang.includes('US') || v.lang.includes('GB'))
    );
    const pool = enVoices.length > 0 ? enVoices : voices;

    // Search for high fidelity, neural, natural human voices first
    const naturalKeywords = [
      'natural',
      'neural',
      'online',
      'premium',
      'enhanced',
      'samantha',
      'serena',
      'daniel',
      'karen',
      'david',
      'george',
      'jenny',
      'guy',
      'oliver',
      'moira',
      'victoria',
      'alex',
      'tom',
    ];

    if (gender === 'female' || gender === 'demon_female') {
      const femaleCandidates = pool.filter((v) => {
        const name = v.name.toLowerCase();
        return (
          name.includes('female') ||
          name.includes('samantha') ||
          name.includes('serena') ||
          name.includes('karen') ||
          name.includes('jenny') ||
          name.includes('aria') ||
          name.includes('victoria') ||
          name.includes('zira') ||
          name.includes('ava')
        );
      });
      if (femaleCandidates.length > 0) {
        const topNatural = femaleCandidates.find((v) =>
          naturalKeywords.some((k) => v.name.toLowerCase().includes(k))
        );
        return topNatural || femaleCandidates[0];
      }
    }

    if (gender === 'male' || gender === 'demon_male' || gender === 'elder') {
      const maleCandidates = pool.filter((v) => {
        const name = v.name.toLowerCase();
        return (
          name.includes('male') ||
          name.includes('david') ||
          name.includes('daniel') ||
          name.includes('guy') ||
          name.includes('christopher') ||
          name.includes('alex') ||
          name.includes('george') ||
          name.includes('tom') ||
          name.includes('oliver')
        );
      });
      if (maleCandidates.length > 0) {
        const topNatural = maleCandidates.find((v) =>
          naturalKeywords.some((k) => v.name.toLowerCase().includes(k))
        );
        return topNatural || maleCandidates[0];
      }
    }

    if (gender === 'angel') {
      const radiantVoice = pool.find((v) => {
        const name = v.name.toLowerCase();
        return (
          name.includes('natural') ||
          name.includes('serena') ||
          name.includes('samantha') ||
          name.includes('neural') ||
          name.includes('aria')
        );
      });
      if (radiantVoice) return radiantVoice;
    }

    // Default fallback to first natural voice or standard English voice
    const fallbackNatural = pool.find((v) =>
      naturalKeywords.some((k) => v.name.toLowerCase().includes(k))
    );
    return fallbackNatural || pool[0];
  }

  public speakScripture(
    verseText: string,
    verseRefOrCallback?: string | (() => void),
    onComplete?: () => void
  ) {
    if (typeof verseRefOrCallback === 'function') {
      return this.speakScriptureLivelyVoice(verseText, undefined, verseRefOrCallback);
    }
    return this.speakScriptureLivelyVoice(verseText, verseRefOrCallback, onComplete);
  }

  // --- 3. REALISTIC SCRIPTURE VOICE & CATHEDRAL HARMONICS ---
  public speakScriptureLivelyVoice(
    verseText: string,
    verseRef?: string,
    onComplete?: () => void
  ) {
    if (this.isMuted) {
      if (onComplete) onComplete();
      return;
    }
    this.initCtx();

    // 1. Play celestial harp sparkle & cathedral bell in Web Audio
    this.playLivingScriptureHarmonics();

    // Prepare clean text for natural reading
    const cleanText = verseText.replace(/[“”"']/g, '').trim();
    const speechContent = verseRef ? `${cleanText}. From ${verseRef}.` : cleanText;
    const wordCount = speechContent.split(/\s+/).length;
    const estimatedDurationMs = Math.max(3200, wordCount * 330 + 1400);

    let completionHandled = false;
    const triggerComplete = () => {
      if (!completionHandled) {
        completionHandled = true;
        if (onComplete) onComplete();
      }
    };

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel(); // cancel any pending speech

        const utterance = new SpeechSynthesisUtterance(speechContent);
        const naturalVoice = this.getBestRealisticVoice('female');
        if (naturalVoice) {
          utterance.voice = naturalVoice;
        }

        // Natural, warm, realistic human speech inflection
        utterance.pitch = 1.0;  // True human pitch (no artificial distortion)
        utterance.rate = 0.98;   // Natural conversational cadence
        utterance.volume = 0.20; // Strictly 20% voice volume

        utterance.onend = () => triggerComplete();
        utterance.onerror = () => triggerComplete();

        setTimeout(triggerComplete, estimatedDurationMs);
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        setTimeout(triggerComplete, estimatedDurationMs);
      }
    } else {
      setTimeout(triggerComplete, estimatedDurationMs);
    }
  }

  // Alias for backward compatibility
  public speakScriptureElderVoice(verseText: string, verseRef?: string, onComplete?: () => void) {
    this.speakScriptureLivelyVoice(verseText, verseRef, onComplete);
  }

  // Heavenly harmonic resonance for scripture proclamation
  private playLivingScriptureHarmonics() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [392.00, 493.88, 587.33, 783.99, 987.77];
      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        gain.gain.setValueAtTime(0.12, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 1.8);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 1.85);
      });
    } catch (e) {
      // Ignore
    }
  }

  // --- DEMONIC VOICE SYNTHESIZER (REALISTIC HUMAN VOICE, NATURAL TIMBRE, 20% VOLUME) ---
  public speakDemonicTaunt(
    quoteText: string,
    voiceType: 'greed' | 'lust' | 'cowardice' | 'sloth' | 'general' = 'general'
  ) {
    if (this.isMuted) return;
    this.initCtx();

    // 1. Play thematic sound effect
    if (voiceType === 'greed') {
      this.playGreedBoastFX();
    } else if (voiceType === 'lust') {
      this.playLustTemptationFX();
    } else if (voiceType === 'cowardice') {
      this.playCowardiceAnnoyFX();
    } else {
      this.playDemonicTaunt();
    }

    // 2. Synthesize with natural human realistic voices
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();

        const cleanQuote = quoteText.replace(/[“”"']/g, '').trim();
        const utterance = new SpeechSynthesisUtterance(cleanQuote);

        if (voiceType === 'greed' || voiceType === 'general') {
          const maleVoice = this.getBestRealisticVoice('demon_male');
          if (maleVoice) utterance.voice = maleVoice;
          utterance.pitch = 0.95; // Natural deep confident masculine human tone
          utterance.rate = 0.96;
        } else if (voiceType === 'lust') {
          const femaleVoice = this.getBestRealisticVoice('demon_female');
          if (femaleVoice) utterance.voice = femaleVoice;
          utterance.pitch = 1.02; // Natural silky feminine human tone
          utterance.rate = 0.94;
        } else if (voiceType === 'cowardice') {
          const eerieVoice = this.getBestRealisticVoice('male');
          if (eerieVoice) utterance.voice = eerieVoice;
          utterance.pitch = 1.0; // Natural human taunting tone
          utterance.rate = 0.96;
        } else {
          const darkVoice = this.getBestRealisticVoice('demon_male');
          if (darkVoice) utterance.voice = darkVoice;
          utterance.pitch = 0.94;
          utterance.rate = 0.95;
        }

        utterance.volume = 0.20; // Strictly 20% voice volume
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        // Fallback handled
      }
    }
  }

  // --- ANGEL OF THE LORD PROCLAMATION VOICE (REALISTIC, RADIANT, REVERENT) ---
  public speakAngelProclamation(quoteText: string, onComplete?: () => void) {
    if (this.isMuted) {
      if (onComplete) onComplete();
      return;
    }
    this.initCtx();

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const cleanText = quoteText.replace(/[“”"']/g, '').trim();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        const angelVoice = this.getBestRealisticVoice('angel');
        if (angelVoice) utterance.voice = angelVoice;

        utterance.pitch = 1.02;
        utterance.rate = 0.96;
        utterance.volume = 0.20; // 20% volume

        utterance.onend = () => {
          if (onComplete) onComplete();
        };
        utterance.onerror = () => {
          if (onComplete) onComplete();
        };

        window.speechSynthesis.speak(utterance);
      } catch (e) {
        if (onComplete) onComplete();
      }
    } else {
      if (onComplete) onComplete();
    }
  }

  // Greed sound effect: Clinking gold coins & boastful bass chord
  public playGreedBoastFX() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      // Boastful brass synth
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(82, now + 0.35);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.45);

      // Gold coin jingle
      [1400, 1800, 2200].forEach((freq, i) => {
        if (!this.ctx || !this.masterGain) return;
        const coin = this.ctx.createOscillator();
        const cGain = this.ctx.createGain();
        coin.type = 'sine';
        coin.frequency.setValueAtTime(freq, now + i * 0.08);
        cGain.gain.setValueAtTime(0.15, now + i * 0.08);
        cGain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.2);
        coin.connect(cGain);
        cGain.connect(this.masterGain);
        coin.start(now + i * 0.08);
        coin.stop(now + i * 0.08 + 0.22);
      });
    } catch (e) {
      // Ignore
    }
  }

  // Lust sound effect: Seductive whisper & alluring chime
  public playLustTemptationFX() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      [523.25, 622.25, 783.99, 932.33].forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
        gain.gain.setValueAtTime(0.14, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.6);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.65);
      });
    } catch (e) {
      // Ignore
    }
  }

  // Cowardice sound effect: Annoying screechy mocking buzzer
  public playCowardiceAnnoyFX() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      [800, 920, 1100, 900, 1200].forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);
        gain.gain.setValueAtTime(0.12, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.08);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.09);
      });
    } catch (e) {
      // Ignore
    }
  }

  // --- 4. FIGHTING SOUND EFFECTS (REDESIGNED & PUNCHY) ---
  public playSwordSlash() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;

      // 1. Metal Blade Impact Sound
      const blade = this.ctx.createOscillator();
      const bladeGain = this.ctx.createGain();
      blade.type = 'triangle';
      blade.frequency.setValueAtTime(840, now);
      blade.frequency.exponentialRampToValueAtTime(140, now + 0.16);

      bladeGain.gain.setValueAtTime(0.28, now);
      bladeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      blade.connect(bladeGain);
      bladeGain.connect(this.masterGain);
      blade.start(now);
      blade.stop(now + 0.19);

      // 2. High-speed steel swish (noise buffer)
      const bufferSize = this.ctx.sampleRate * 0.18;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2600, now);
      filter.frequency.exponentialRampToValueAtTime(600, now + 0.17);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.3, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.masterGain);

      noise.start(now);
      noise.stop(now + 0.18);
    } catch (e) {
      // Ignore
    }
  }

  public playLightningStrike() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;

      // Sharp electric arc
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(960, now);
      osc.frequency.linearRampToValueAtTime(80, now + 0.32);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.4);

      this.playThunder();
    } catch (e) {
      // Ignore
    }
  }

  public playWallOfFire() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.linearRampToValueAtTime(360, now + 0.35);

      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.46);
    } catch (e) {
      // Ignore
    }
  }

  // Demonic laughter / sinister enemy curse sound
  public playDemonicTaunt() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      // 3 laughing pitch drops ("Ha - ha - ha!")
      [0, 0.16, 0.32].forEach((timeOffset, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';

        const baseF = 240 - idx * 25;
        osc.frequency.setValueAtTime(baseF, now + timeOffset);
        osc.frequency.exponentialRampToValueAtTime(baseF * 0.4, now + timeOffset + 0.14);

        gain.gain.setValueAtTime(0.22, now + timeOffset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.14);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now + timeOffset);
        osc.stop(now + timeOffset + 0.15);
      });
    } catch (e) {
      // Ignore
    }
  }

  // Cleansing Chime when enemy is defeated & curses washed away
  public playCleansingChime() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const chords = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C E G C E
    chords.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0.16, this.ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + idx * 0.08 + 1.4);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(this.ctx.currentTime + idx * 0.08);
      osc.stop(this.ctx.currentTime + idx * 0.08 + 1.45);
    });
  }

  // --- 5. SHARING WORD SOUND EFFECTS ---
  public playGospelShare() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    // Heavenly harp glissando
    const harpNotes = [392.00, 493.88, 587.33, 783.99, 987.77, 1174.66];
    harpNotes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.06);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.06 + 0.6);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(this.ctx.currentTime + idx * 0.06);
      osc.stop(this.ctx.currentTime + idx * 0.06 + 0.65);
    });
  }

  public playSoulSaved() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    this.playGospelShare();
    setTimeout(() => {
      this.playScriptureBell();
    }, 250);
  }

  public playHolyHeal() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const chords = [523.25, 659.25, 783.99, 1046.5];
    chords.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.07);

      gain.gain.setValueAtTime(0.14, this.ctx.currentTime + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.07 + 0.4);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(this.ctx.currentTime + idx * 0.07);
      osc.stop(this.ctx.currentTime + idx * 0.07 + 0.42);
    });
  }

  public playOilPickup() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.08 + 0.25);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(this.ctx.currentTime + idx * 0.08);
      osc.stop(this.ctx.currentTime + idx * 0.08 + 0.26);
    });
  }

  public playTalentPickup() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const chord = [440, 554.37, 659.25, 880];
    chord.forEach((freq, i) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.06);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.06 + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(this.ctx.currentTime + i * 0.06);
      osc.stop(this.ctx.currentTime + i * 0.06 + 0.36);
    });
  }

  public playScriptureBell() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const freqs = [392.0, 587.33, 783.99, 1174.66];
    freqs.forEach((f) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 2.0);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 2.1);
    });
  }

  public playLanternTrim() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(440, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.26);
  }

  public playThunder() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = this.ctx.sampleRate * 1.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 1.4);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.5);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    whiteNoise.start();
    whiteNoise.stop(this.ctx.currentTime + 1.5);
  }

  public playCelestialTrumpet() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const fanfare = [
      { note: 261.63, time: 0, dur: 0.2 },
      { note: 392.00, time: 0.22, dur: 0.2 },
      { note: 523.25, time: 0.44, dur: 0.3 },
      { note: 659.25, time: 0.76, dur: 0.35 },
      { note: 783.99, time: 1.13, dur: 0.9 },
    ];

    fanfare.forEach((f) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f.note, this.ctx.currentTime + f.time);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime + f.time);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + f.time + f.dur);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, this.ctx.currentTime + f.time);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      osc.start(this.ctx.currentTime + f.time);
      osc.stop(this.ctx.currentTime + f.time + f.dur + 0.05);
    });
  }

  public playFootstep() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140 + Math.random() * 40, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(0.035, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.07);
    } catch (e) {
      // Ignore
    }
  }

  public playDamage() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(120, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.16);
  }

  public playErrorBuzz() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, this.ctx.currentTime);
    osc.frequency.setValueAtTime(80, this.ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.23);
  }
}

export const soundEngine = new SoundEngine();
