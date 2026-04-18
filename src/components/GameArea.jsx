import React from 'react';
import FallingItem from './FallingItem.jsx';

/** Мини-салют при золотом лиде: частицы + вспышка + крупная подпись (без canvas) */
function GoldenSalute({ leftPct, topPx }) {
  const up = 22;
  const side = 32;
  return (
    <div className="golden-salute" style={{ left: `${leftPct}%`, top: `${topPx}px` }}>
      <div className="golden-salute__veil" aria-hidden="true" />
      <div className="golden-salute__flash" aria-hidden="true" />
      <div className="golden-salute__catcher-burst" aria-hidden="true" />
      <p className="golden-salute__title">Золотой лид!</p>
      {Array.from({ length: up }).map((_, i) => (
        <span
          key={`u-${i}`}
          className="golden-salute__spark golden-salute__spark--up"
          style={{ ['--a']: `${(360 / up) * i}deg` }}
        />
      ))}
      {Array.from({ length: side }).map((_, i) => (
        <span
          key={`s-${i}`}
          className="golden-salute__spark golden-salute__spark--side"
          style={{ ['--b']: `${(360 / side) * i}deg` }}
        />
      ))}
      {Array.from({ length: 14 }).map((_, i) => (
        <span
          key={`g-${i}`}
          className="golden-salute__glow-dot"
          style={{ ['--c']: `${i * 26}deg`, ['--t']: `${0.05 + i * 0.02}s` }}
        />
      ))}
    </div>
  );
}

export default function GameArea({
  gameAreaRef,
  items,
  catcherX,
  catcherYRatio,
  catcherFx,
  toasts,
  bursts,
  goldenSalute,
  dangerLives,
  urgentTimer,
  freezeActive,
  finaleMode,
  onTouchLeftStart,
  onTouchLeftEnd,
  onTouchRightStart,
  onTouchRightEnd,
}) {
  const areaCls = ['game-area'];
  if (dangerLives) areaCls.push('game-area--danger');
  if (urgentTimer) areaCls.push('game-area--finale');
  if (freezeActive) areaCls.push('game-area--freeze');
  if (finaleMode) areaCls.push('game-area--rush');

  const catcherCls = ['catcher', 'catcher--active'];
  if (catcherFx === 'good') catcherCls.push('catcher--pop-good');
  if (catcherFx === 'golden') catcherCls.push('catcher--pop-good', 'catcher--pop-golden');
  if (catcherFx === 'bad') catcherCls.push('catcher--pop-bad');
  if (catcherFx === 'shield') catcherCls.push('catcher--pop-shield');

  return (
    <div className="game-shell">
      <div className={areaCls.join(' ')} ref={gameAreaRef}>
        <div className="game-area__grid" aria-hidden="true" />
        <div className="game-area__vignette" aria-hidden="true" />
        <div className="game-area__sheen" aria-hidden="true" />
        {urgentTimer && <div className="game-area__finale-pulse" aria-hidden="true" />}

        {bursts.map((b) => (
          <div
            key={b.id}
            className={`fx-burst fx-burst--${b.kind}`}
            style={{ left: `${b.leftPct}%`, top: `${b.topPx}px` }}
          />
        ))}

        {goldenSalute && (
          <GoldenSalute leftPct={goldenSalute.leftPct} topPx={goldenSalute.topPx} />
        )}

        {items.map((item) => (
          <FallingItem
            key={item.instanceId}
            label={item.label}
            variant={item.variant}
            skin={item.skin}
            style={{
              left: `${item.xPercent}%`,
              top: `${item.y}px`,
            }}
          />
        ))}

        <div className="game-area__toasts">
          {toasts.map((t) => (
            <div key={t.id} className={`float-toast float-toast--${t.tone}`}>
              {t.text}
            </div>
          ))}
        </div>

        <div
          className={catcherCls.join(' ')}
          style={{
            left: `${catcherX * 100}%`,
            bottom: `${catcherYRatio * 100}%`,
          }}
        >
          <div className="catcher__halo" aria-hidden="true" />
          <div className="catcher__funnel" aria-hidden="true">
            <div className="catcher__funnel-inner" />
          </div>
          <div className="catcher__body">
            <div className="catcher__chip">
              <span className="catcher__dot" />
              <span className="catcher__label">Модуль захвата</span>
            </div>
            <span className="catcher__sub">лиды</span>
          </div>
          <div className="catcher__glow" aria-hidden="true" />
        </div>
      </div>

      <div className="touch-bar">
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
            onTouchLeftStart();
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            onTouchLeftEnd();
          }}
          onPointerCancel={() => onTouchLeftEnd()}
          onPointerLeave={(e) => {
            if (e.buttons === 0) onTouchLeftEnd();
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
            onTouchRightStart();
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            onTouchRightEnd();
          }}
          onPointerCancel={() => onTouchRightEnd()}
          onPointerLeave={(e) => {
            if (e.buttons === 0) onTouchRightEnd();
          }}
        >
          Вправо
          <span className="touch-btn__icon" aria-hidden="true">
            ›
          </span>
        </button>
      </div>
    </div>
  );
}
