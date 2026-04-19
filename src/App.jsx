import React, { useCallback, useEffect, useRef, useState } from 'react';
import StartScreen from './components/StartScreen.jsx';
import GameArea from './components/GameArea.jsx';
import HUD from './components/HUD.jsx';
import EndScreen from './components/EndScreen.jsx';
import {
  BAD_ITEMS,
  GOLDEN_LEAD_POINTS,
  GOOD_ITEMS,
  SPECIAL_ITEMS,
  comboMultiplierFromStreak,
  pointsForGood,
} from './data/items.js';
import { cancelSpeech, speakRu } from './utils/speech.js';

const GAME_DURATION = 45;
const INITIAL_LIVES = 3;
const BAD_SCORE = 10;
const FREEZE_MS = 3800;
const DOUBLE_MS = 5200;

const CATCHER_BOTTOM_FRAC = 0.03;
const ITEM_HIT_HEIGHT = 56;
const CATCHER_HIT_HEIGHT = 62;
/** Совпадает с CSS: `.touch-bar { display: none }` при min-width: 1024px */
const DESKTOP_TOUCH_BAR_HIDDEN_MQ = '(min-width: 1024px)';

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}

function missResetsCombo(it) {
  if (it.kind === 'good') return true;
  if (it.kind === 'special' && it.special === 'golden') return true;
  return false;
}

function createSpawn(gameWidth) {
  const margin = 12;
  const usable = Math.max(gameWidth - margin * 2, 40);
  const xPx = margin + Math.random() * usable;
  const xPercent = (xPx / gameWidth) * 100;
  const r = Math.random();

  if (r < 0.07) {
    const def = pickRandom(SPECIAL_ITEMS);
    return {
      instanceId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      kind: 'special',
      special: def.special,
      label: def.label,
      variant: def.variant,
      skin: def.skin,
      xPercent,
      y: -ITEM_HIT_HEIGHT,
    };
  }

  const isGood = Math.random() < 0.56;
  if (isGood) {
    const def = pickRandom(GOOD_ITEMS);
    return {
      instanceId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      kind: 'good',
      label: def.label,
      tier: def.tier,
      variant: def.tier === 'high' ? 'good-high' : 'good',
      skin: def.skin,
      xPercent,
      y: -ITEM_HIT_HEIGHT,
    };
  }
  const def = pickRandom(BAD_ITEMS);
  return {
    instanceId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    kind: 'bad',
    label: def.label,
    variant: 'bad',
    skin: def.skin,
    xPercent,
    y: -ITEM_HIT_HEIGHT,
  };
}

export default function App() {
  const [phase, setPhase] = useState('start');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [items, setItems] = useState([]);
  const [catcherX, setCatcherX] = useState(0.5);
  const [endReason, setEndReason] = useState('time');
  const [finalStats, setFinalStats] = useState({
    good: 0,
    bad: 0,
    bestCombo: 1,
  });

  const [comboStreak, setComboStreak] = useState(0);
  const [comboMult, setComboMult] = useState(1);
  const [shields, setShields] = useState(0);

  const [toasts, setToasts] = useState([]);
  const [bursts, setBursts] = useState([]);
  const [catcherFx, setCatcherFx] = useState(null);
  const [goldenSalute, setGoldenSalute] = useState(null);
  const [soundOn, setSoundOn] = useState(true);
  const [startedAt, setStartedAt] = useState(null);
  const [desktopTouchFallback, setDesktopTouchFallback] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia(DESKTOP_TOUCH_BAR_HIDDEN_MQ).matches
  );

  const gameAreaRef = useRef(null);
  const inputRef = useRef({ left: false, right: false });
  const spawnAccRef = useRef(0);
  const rafRef = useRef(0);
  const lastTsRef = useRef(null);
  const timeLeftRef = useRef(GAME_DURATION);
  const catcherXRef = useRef(0.5);
  const velRef = useRef(0);
  const itemsRef = useRef([]);

  const streakRef = useRef(0);
  const statsRef = useRef({ good: 0, bad: 0, bestCombo: 1 });
  const freezeEndRef = useRef(0);
  const doubleEndRef = useRef(0);
  const shieldsRef = useRef(0);
  const toastKeyRef = useRef(0);
  const burstKeyRef = useRef(0);
  /** Разрешение на speechSynthesis после клика «Начать игру» / «Играть снова». */
  const speechUnlockedRef = useRef(false);
  const soundOnRef = useRef(true);

  const toggleSound = useCallback(() => {
    setSoundOn((prev) => {
      const next = !prev;
      soundOnRef.current = next;
      if (!next) cancelSpeech();
      return next;
    });
  }, []);

  useEffect(() => {
    soundOnRef.current = soundOn;
  }, [soundOn]);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_TOUCH_BAR_HIDDEN_MQ);
    const sync = () => setDesktopTouchFallback(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const pushToast = useCallback((text, tone) => {
    const id = ++toastKeyRef.current;
    setToasts((prev) => [...prev.slice(-3), { id, text, tone }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, 1550);
  }, []);

  const pushBurst = useCallback((leftPct, topPx, kind) => {
    const id = ++burstKeyRef.current;
    setBursts((prev) => [...prev, { id, leftPct, topPx, kind }]);
    window.setTimeout(() => {
      setBursts((prev) => prev.filter((x) => x.id !== id));
    }, 550);
  }, []);

  const bumpCatcher = useCallback((kind) => {
    setCatcherFx(kind);
    window.setTimeout(() => setCatcherFx(null), 220);
  }, []);

  const resetCombo = useCallback(() => {
    streakRef.current = 0;
    setComboStreak(0);
    setComboMult(1);
  }, []);

  const resetGame = useCallback(() => {
    setScore(0);
    setLives(INITIAL_LIVES);
    setTimeLeft(GAME_DURATION);
    timeLeftRef.current = GAME_DURATION;
    itemsRef.current = [];
    setItems([]);
    catcherXRef.current = 0.5;
    velRef.current = 0;
    setCatcherX(0.5);
    spawnAccRef.current = 0;
    lastTsRef.current = null;
    streakRef.current = 0;
    setComboStreak(0);
    setComboMult(1);
    statsRef.current = { good: 0, bad: 0, bestCombo: 1 };
    freezeEndRef.current = 0;
    doubleEndRef.current = 0;
    shieldsRef.current = 0;
    setShields(0);
    setToasts([]);
    setBursts([]);
    setCatcherFx(null);
    setGoldenSalute(null);
    setStartedAt(null);
  }, []);

  const startGame = useCallback(() => {
    resetGame();
    setStartedAt(Date.now());
    speechUnlockedRef.current = true;
    speakRu('Игра началась', soundOnRef.current, true);
    setPhase('playing');
  }, [resetGame]);

  const endGame = useCallback((reason) => {
    speakRu('Игра окончена', soundOnRef.current, speechUnlockedRef.current);
    setFinalStats({ ...statsRef.current });
    setEndReason(reason);
    setPhase('end');
    inputRef.current.left = false;
    inputRef.current.right = false;
  }, []);

  const restartGame = useCallback(() => {
    resetGame();
    setStartedAt(Date.now());
    speechUnlockedRef.current = true;
    speakRu('Игра началась', soundOnRef.current, true);
    setPhase('playing');
  }, [resetGame]);

  useEffect(() => {
    if (phase !== 'playing') {
      document.body.classList.remove('game-active');
      return undefined;
    }
    document.body.classList.add('game-active');

    const onKeyDown = (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        inputRef.current.left = true;
        e.preventDefault();
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        inputRef.current.right = true;
        e.preventDefault();
      }
    };
    const onKeyUp = (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') inputRef.current.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') inputRef.current.right = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      document.body.classList.remove('game-active');
    };
  }, [phase]);

  const touchLeftStart = useCallback(() => {
    inputRef.current.left = true;
  }, []);
  const touchLeftEnd = useCallback(() => {
    inputRef.current.left = false;
  }, []);
  const touchRightStart = useCallback(() => {
    inputRef.current.right = true;
  }, []);
  const touchRightEnd = useCallback(() => {
    inputRef.current.right = false;
  }, []);

  /** Таймер только через Date.now(); RAF не меняет timeLeft. */
  useEffect(() => {
    if (phase !== 'playing' || startedAt == null) return undefined;

    let timerId = 0;

    const syncTimerFromWallClock = () => {
      const remaining = Math.max(
        0,
        GAME_DURATION - Math.floor((Date.now() - startedAt) / 1000)
      );
      timeLeftRef.current = remaining;
      setTimeLeft(remaining);

      if (remaining === 0) {
        if (timerId) {
          window.clearInterval(timerId);
          timerId = 0;
        }
        endGame('time');
      }
    };

    syncTimerFromWallClock();
    timerId = window.setInterval(syncTimerFromWallClock, 250);

    return () => {
      if (timerId) window.clearInterval(timerId);
    };
  }, [phase, startedAt, endGame]);

  useEffect(() => {
    if (phase !== 'playing') return undefined;

    const tick = (ts) => {
      const remaining = timeLeftRef.current;

      const el = gameAreaRef.current;
      if (!el) {
        lastTsRef.current = ts;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const rect = el.getBoundingClientRect();
      const W = rect.width;
      const H = rect.height;
      if (W < 8 || H < 8) {
        lastTsRef.current = ts;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = Math.min(100, Math.max(0, ts - lastTsRef.current));
      lastTsRef.current = ts;

      const now = Date.now();
      const frozen = now < freezeEndRef.current;
      const doubled = now < doubleEndRef.current;

      const progress = 1 - remaining / GAME_DURATION;
      const eased = Math.max(0, progress - 0.04) / 0.96;
      const tensionBoost = Math.pow(eased, 1.52);

      let fallMul = 0.1 + tensionBoost * 0.48;
      if (remaining <= 6) {
        fallMul *= 1 + (6 - remaining) * 0.12;
      }
      if (frozen) {
        fallMul *= 0.4;
      }

      const fallSpeed = fallMul * H;

      let spawnIntervalMs = Math.max(230, 1050 - tensionBoost * 620);
      if (remaining <= 6) {
        spawnIntervalMs *= 0.84;
      }

      const spawns = [];
      spawnAccRef.current += dt;
      while (spawnAccRef.current >= spawnIntervalMs) {
        spawnAccRef.current -= spawnIntervalMs;
        spawns.push(createSpawn(W));
      }

      const maxVel = 1.05 * (W / 320);
      const dir = (inputRef.current.right ? 1 : 0) + (inputRef.current.left ? -1 : 0);
      const targetVel = dir * maxVel;
      const k = 14;
      velRef.current += (targetVel - velRef.current) * Math.min(1, (k * dt) / 1000);
      if (dir === 0) {
        velRef.current *= Math.pow(0.82, dt / 16.67);
      }
      catcherXRef.current = Math.min(
        0.93,
        Math.max(0.07, catcherXRef.current + velRef.current * (dt / 1000))
      );
      setCatcherX(catcherXRef.current);

      const catcherCenterPx = catcherXRef.current * W;
      const catcherHalf = W * 0.11;
      const itemHalf = W * 0.19;

      const floorY = H - CATCHER_BOTTOM_FRAC * H;
      const catcherTop = floorY - CATCHER_HIT_HEIGHT;
      const catchZoneTop = catcherTop - 10;
      const catchZoneBot = catcherTop + 28;

      let scoreAdd = 0;
      let lifeLost = 0;

      const prevItems = itemsRef.current;
      const moved = prevItems
        .concat(spawns)
        .map((it) => ({ ...it, y: it.y + (fallSpeed * dt) / 1000 }));

      const kept = [];

      for (const it of moved) {
        const itemCenterPx = (it.xPercent / 100) * W;
        const overlapX =
          Math.abs(catcherCenterPx - itemCenterPx) < catcherHalf + itemHalf * 0.92;
        const inBand = it.y + ITEM_HIT_HEIGHT >= catchZoneTop && it.y <= catchZoneBot;

        if (overlapX && inBand) {
          const burstTop = Math.min(H - 48, Math.max(40, catcherTop - 20));
          const burstLeft = catcherXRef.current * 100;

          if (it.kind === 'good') {
            const base = pointsForGood(it.tier);
            const prevMult = comboMultiplierFromStreak(streakRef.current);
            streakRef.current += 1;
            const newMult = comboMultiplierFromStreak(streakRef.current);
            setComboStreak(streakRef.current);
            setComboMult(newMult);
            if (newMult > statsRef.current.bestCombo) statsRef.current.bestCombo = newMult;

            const pts = Math.round(base * newMult * (doubled ? 2 : 1));
            scoreAdd += pts;
            statsRef.current.good += 1;
            pushBurst(burstLeft, burstTop, 'good');
            bumpCatcher('good');
            const comboUp = newMult > prevMult && newMult >= 2;
            if (comboUp) {
              pushToast(`Комбо ×${newMult}`, 'combo');
            } else if (it.tier === 'high') {
              pushToast('Сильный лид', 'good');
            } else {
              pushToast('Отлично', 'good');
            }
          } else if (it.kind === 'bad') {
            resetCombo();
            if (shieldsRef.current > 0) {
              shieldsRef.current -= 1;
              setShields(0);
              pushToast('Щит погасил ошибку', 'shield');
              pushBurst(burstLeft, burstTop, 'shield');
              bumpCatcher('shield');
            } else {
              scoreAdd -= BAD_SCORE;
              lifeLost += 1;
              statsRef.current.bad += 1;
              pushBurst(burstLeft, burstTop, 'bad');
              bumpCatcher('bad');
              pushToast('Осторожно, мусор', 'bad');
              speakRu('Осторожно', soundOnRef.current, speechUnlockedRef.current);
            }
          } else if (it.kind === 'special') {
            if (it.special === 'golden') {
              const prevMult = comboMultiplierFromStreak(streakRef.current);
              streakRef.current += 1;
              const newMult = comboMultiplierFromStreak(streakRef.current);
              setComboStreak(streakRef.current);
              setComboMult(newMult);
              if (newMult > statsRef.current.bestCombo) statsRef.current.bestCombo = newMult;

              const pts = Math.round(GOLDEN_LEAD_POINTS * newMult * (doubled ? 2 : 1));
              scoreAdd += pts;
              statsRef.current.good += 1;
              const sid = Date.now();
              setGoldenSalute({ id: sid, leftPct: burstLeft, topPx: burstTop });
              window.setTimeout(() => {
                setGoldenSalute((cur) => (cur && cur.id === sid ? null : cur));
              }, 2800);
              bumpCatcher('golden');
              pushToast('Золотой лид!', 'good');
              speakRu('Золотой лид!', soundOnRef.current, speechUnlockedRef.current);
              if (newMult > prevMult && newMult >= 2) {
                pushToast(`Комбо ×${newMult}`, 'combo');
              }
            } else if (it.special === 'freeze') {
              freezeEndRef.current = now + FREEZE_MS;
              const prevMult = comboMultiplierFromStreak(streakRef.current);
              streakRef.current += 1;
              const newMult = comboMultiplierFromStreak(streakRef.current);
              setComboStreak(streakRef.current);
              setComboMult(newMult);
              if (newMult > statsRef.current.bestCombo) statsRef.current.bestCombo = newMult;
              pushBurst(burstLeft, burstTop, 'freeze');
              bumpCatcher('good');
              pushToast('Заморозка мусора', 'info');
              if (newMult > prevMult && newMult >= 2) {
                pushToast(`Комбо ×${newMult}`, 'combo');
              }
            } else if (it.special === 'shield') {
              shieldsRef.current = 1;
              setShields(1);
              const prevMult = comboMultiplierFromStreak(streakRef.current);
              streakRef.current += 1;
              const newMult = comboMultiplierFromStreak(streakRef.current);
              setComboStreak(streakRef.current);
              setComboMult(newMult);
              if (newMult > statsRef.current.bestCombo) statsRef.current.bestCombo = newMult;
              pushBurst(burstLeft, burstTop, 'shield');
              bumpCatcher('good');
              pushToast('Щит активен', 'info');
              if (newMult > prevMult && newMult >= 2) {
                pushToast(`Комбо ×${newMult}`, 'combo');
              }
            } else if (it.special === 'double') {
              doubleEndRef.current = now + DOUBLE_MS;
              const prevMult = comboMultiplierFromStreak(streakRef.current);
              streakRef.current += 1;
              const newMult = comboMultiplierFromStreak(streakRef.current);
              setComboStreak(streakRef.current);
              setComboMult(newMult);
              if (newMult > statsRef.current.bestCombo) statsRef.current.bestCombo = newMult;
              pushBurst(burstLeft, burstTop, 'double');
              bumpCatcher('good');
              pushToast('Удвоение очков', 'info');
              if (newMult > prevMult && newMult >= 2) {
                pushToast(`Комбо ×${newMult}`, 'combo');
              }
            }
          }
          continue;
        }

        if (it.y > H + 36) {
          if (missResetsCombo(it)) {
            resetCombo();
            pushToast('Мимо', 'bad');
          }
          continue;
        }

        kept.push(it);
      }

      itemsRef.current = kept;
      setItems(kept);

      if (scoreAdd !== 0) {
        setScore((s) => Math.max(0, s + scoreAdd));
      }
      if (lifeLost > 0) {
        setLives((lv) => {
          const n = Math.max(0, lv - lifeLost);
          if (n <= 0) {
            queueMicrotask(() => endGame('lives'));
          }
          return n;
        });
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      lastTsRef.current = null;
      spawnAccRef.current = 0;
    };
  }, [phase, endGame, resetCombo, pushToast, pushBurst, bumpCatcher]);

  const urgentTimer = timeLeft <= 6;
  const dangerLives = lives <= 1;
  const hudNow = Date.now();
  const freezeActive = hudNow < freezeEndRef.current;
  const doubleActive = hudNow < doubleEndRef.current;

  const topTimerBarStyle = (urgent) => ({
    width: 'min(1120px, 100%)',
    boxSizing: 'border-box',
    flexShrink: 0,
    textAlign: 'center',
    padding: '10px 14px',
    fontSize: 'clamp(1.2rem, 3.8vw, 1.65rem)',
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '0.04em',
    color: urgent ? '#ffb4b4' : 'rgba(255, 255, 255, 0.95)',
    background: 'linear-gradient(180deg, rgba(12, 18, 42, 0.92), rgba(12, 18, 42, 0.75))',
    borderBottom: urgent
      ? '2px solid rgba(255, 80, 80, 0.45)'
      : '1px solid rgba(255, 255, 255, 0.12)',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.35)',
  });

  return (
    <div className={`app ${phase === 'playing' && urgentTimer ? 'app--finale' : ''}`}>
      {phase === 'start' && <StartScreen onStart={startGame} />}
      {phase === 'playing' && (
        <div
          className="screen screen--game"
          style={{
            alignItems: 'stretch',
            justifyContent: 'flex-start',
            flex: 1,
            minHeight: 0,
            width: '100%',
            maxWidth: 560,
            alignSelf: 'center',
            boxSizing: 'border-box',
          }}
        >
          <div className="play-layout">
            <div
              style={topTimerBarStyle(urgentTimer)}
              role="status"
              aria-live="polite"
              aria-label={`Оставшееся время: ${formatTime(timeLeft)}`}
            >
              Время: {formatTime(timeLeft)}
            </div>
            <HUD
              score={score}
              timeLeft={timeLeft}
              lives={lives}
              comboStreak={comboStreak}
              comboMult={comboMult}
              shields={shields}
              freezeActive={freezeActive}
              doubleActive={doubleActive}
              urgentTimer={urgentTimer}
              dangerLives={dangerLives}
              soundOn={soundOn}
              onToggleSound={toggleSound}
            />
            <GameArea
              gameAreaRef={gameAreaRef}
              items={items}
              catcherX={catcherX}
              catcherYRatio={CATCHER_BOTTOM_FRAC}
              catcherFx={catcherFx}
              toasts={toasts}
              bursts={bursts}
              goldenSalute={goldenSalute}
              dangerLives={dangerLives}
              urgentTimer={urgentTimer}
              freezeActive={freezeActive}
              finaleMode={urgentTimer}
              onTouchLeftStart={touchLeftStart}
              onTouchLeftEnd={touchLeftEnd}
              onTouchRightStart={touchRightStart}
              onTouchRightEnd={touchRightEnd}
            />
            {desktopTouchFallback && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 14,
                  width: '100%',
                  flexShrink: 0,
                  paddingBottom: 'env(safe-area-inset-bottom)',
                }}
              >
                <button
                  type="button"
                  className="touch-btn touch-btn--left"
                  aria-label="Влево"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    try {
                      e.currentTarget.setPointerCapture(e.pointerId);
                    } catch {
                      /* нет поддержки */
                    }
                    touchLeftStart();
                  }}
                  onPointerUp={(e) => {
                    e.preventDefault();
                    touchLeftEnd();
                  }}
                  onPointerCancel={() => touchLeftEnd()}
                  onPointerLeave={(e) => {
                    if (e.buttons === 0) touchLeftEnd();
                  }}
                >
                  <span className="touch-btn__icon" aria-hidden="true">
                    ‹
                  </span>
                  Влево
                </button>
                <button
                  type="button"
                  className="touch-btn touch-btn--right"
                  aria-label="Вправо"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    try {
                      e.currentTarget.setPointerCapture(e.pointerId);
                    } catch {
                      /* нет поддержки */
                    }
                    touchRightStart();
                  }}
                  onPointerUp={(e) => {
                    e.preventDefault();
                    touchRightEnd();
                  }}
                  onPointerCancel={() => touchRightEnd()}
                  onPointerLeave={(e) => {
                    if (e.buttons === 0) touchRightEnd();
                  }}
                >
                  Вправо
                  <span className="touch-btn__icon" aria-hidden="true">
                    ›
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {phase === 'end' && (
        <>
          <div
            style={topTimerBarStyle(false)}
            role="status"
            aria-label={`Время на момент окончания: ${formatTime(timeLeft)}`}
          >
            Время: {formatTime(timeLeft)}
          </div>
          <EndScreen
            score={score}
            reason={endReason}
            stats={finalStats}
            onRestart={restartGame}
            soundOn={soundOn}
            onToggleSound={toggleSound}
          />
        </>
      )}
    </div>
  );
}
