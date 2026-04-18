import React from 'react';

function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}

export default function HUD({
  score,
  timeLeft,
  lives,
  comboStreak,
  comboMult,
  shields,
  freezeActive,
  doubleActive,
  urgentTimer,
  dangerLives,
  soundOn,
  onToggleSound,
}) {
  const cls = ['hud'];
  if (dangerLives) cls.push('hud--danger');
  if (urgentTimer) cls.push('hud--finale');

  return (
    <div className={cls.join(' ')}>
      <div className="hud__inner">
        <div className="hud__left">
          <div className="hud__score-block">
            <span className="hud__label">Счёт</span>
            <span className="hud__value hud__value--score">{score}</span>
          </div>
          <div className="hud__combo-block">
            <span className="hud__label">Комбо</span>
            <div className="hud__combo-row">
              <span className="hud__combo-mult">×{comboMult}</span>
              {comboStreak > 0 && (
                <span className="hud__combo-streak">цепочка {comboStreak}</span>
              )}
            </div>
          </div>
        </div>

        <div className="hud__cell hud__cell--center">
          <span className="hud__label">Время</span>
          <span
            className={`hud__value hud__value--time ${urgentTimer ? 'hud__value--urgent' : ''}`}
          >
            {formatTime(timeLeft)}
          </span>
          {urgentTimer && <span className="hud__finale-hint">финальный рывок</span>}
        </div>

        <div className="hud__right">
          <div className="hud__lives-row">
            <span className="hud__label">Жизни</span>
            <span className="hud__lives" aria-label={`Жизней: ${lives}`}>
              {Array.from({ length: 3 }).map((_, i) => (
                <span
                  key={i}
                  className={`hud__life ${i < lives ? 'hud__life--on' : 'hud__life--off'}`}
                />
              ))}
            </span>
          </div>
          <div className="hud__badges">
            {shields > 0 && (
              <span className="hud__pill hud__pill--shield" title="Щит готов">
                Щит
              </span>
            )}
            {freezeActive && (
              <span className="hud__pill hud__pill--freeze">Заморозка</span>
            )}
            {doubleActive && (
              <span className="hud__pill hud__pill--double">Удвоение</span>
            )}
          </div>
          <button
            type="button"
            className="hud__sound"
            onClick={onToggleSound}
            aria-pressed={soundOn}
            aria-label={soundOn ? 'Выключить озвучку' : 'Включить озвучку'}
          >
            Звук: {soundOn ? 'вкл' : 'выкл'}
          </button>
        </div>
      </div>
    </div>
  );
}
