import React from 'react';

function IcoMonitor() {
  return (
    <svg className="fi-ico" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="4" width="18" height="12" rx="2" fill="currentColor" opacity="0.4" />
      <rect x="5" y="6" width="14" height="8" rx="1" fill="currentColor" opacity="0.25" />
      <path d="M9 20h6M12 16v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IcoCheck() {
  return (
    <svg className="fi-ico fi-ico--sm" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.25" />
      <path
        d="M8 12l2.5 2.5L16 9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IcoEnvelope() {
  return (
    <svg className="fi-ico" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 8l9 6 9-6" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IcoBot() {
  return (
    <svg className="fi-ico" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="6" y="7" width="12" height="10" rx="2" fill="currentColor" opacity="0.3" />
      <circle cx="9" cy="11" r="1.2" fill="currentColor" />
      <circle cx="15" cy="11" r="1.2" fill="currentColor" />
      <path d="M9 14h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M12 5v2M9 4h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function IcoWarn() {
  return (
    <svg className="fi-ico" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 4l10 16H2z" fill="currentColor" opacity="0.3" />
      <path d="M12 9v5M12 17h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IcoTrash() {
  return (
    <svg className="fi-ico fi-ico--trash" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M8 9V7a2 2 0 012-2h4a2 2 0 012 2v2M6 9h12l-1 11H7z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M10 13v4M14 13v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <ellipse cx="12" cy="21" rx="7" ry="2" fill="currentColor" opacity="0.12" />
    </svg>
  );
}

function IcoSnow() {
  return (
    <svg className="fi-ico" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2v20M5 6l14 12M5 18L19 6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.75"
      />
    </svg>
  );
}

function IcoShield() {
  return (
    <svg className="fi-ico" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3l8 4v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V7z"
        fill="currentColor"
        opacity="0.28"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}

function SkinBody({ label, skin }) {
  switch (skin) {
    case 'hot':
      return (
        <>
          <div className="fi-hot__orb" aria-hidden="true" />
          <span className="fi-hot__label">{label}</span>
          <span className="fi-hot__tag">важно</span>
        </>
      );
    case 'qualified':
      return (
        <>
          <div className="fi-row fi-row--top">
            <IcoCheck />
            <span className="fi-badge">качество</span>
          </div>
          <span className="fi-label">{label}</span>
        </>
      );
    case 'demo':
      return (
        <>
          <IcoMonitor />
          <span className="fi-label">{label}</span>
          <div className="fi-demo__bars" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </>
      );
    case 'brief':
      return (
        <>
          <div className="fi-brief__stack" aria-hidden="true">
            <span />
            <span />
          </div>
          <span className="fi-label">{label}</span>
        </>
      );
    case 'form':
      return (
        <>
          <div className="fi-form__fields" aria-hidden="true">
            <span className="fi-form__line" />
            <span className="fi-form__line fi-form__line--short" />
            <span className="fi-form__line" />
          </div>
          <span className="fi-label">{label}</span>
        </>
      );
    case 'client':
      return (
        <>
          <div className="fi-client">
            <div className="fi-client__avatar" aria-hidden="true" />
            <div className="fi-client__lines">
              <span className="fi-client__line" />
              <span className="fi-client__line fi-client__line--sm" />
            </div>
          </div>
          <span className="fi-label">{label}</span>
        </>
      );
    case 'golden':
      return (
        <>
          <div className="fi-golden__shine" aria-hidden="true" />
          <span className="fi-golden__crown" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M12 4l2.5 5L20 6l-1.5 10h-13L4 6l5.5 3z" />
            </svg>
          </span>
          <span className="fi-label fi-label--gold">{label}</span>
          <span className="fi-golden__rare">редкий</span>
        </>
      );
    case 'freeze':
      return (
        <>
          <IcoSnow />
          <span className="fi-label">{label}</span>
        </>
      );
    case 'shield':
      return (
        <>
          <IcoShield />
          <span className="fi-label">{label}</span>
        </>
      );
    case 'double':
      return (
        <>
          <span className="fi-double__x" aria-hidden="true">
            ×2
          </span>
          <span className="fi-label">{label}</span>
        </>
      );
    case 'spam':
      return (
        <>
          <IcoEnvelope />
          <span className="fi-label">{label}</span>
          <span className="fi-bad__tag">нежелательно</span>
        </>
      );
    case 'bot':
      return (
        <>
          <IcoBot />
          <span className="fi-label">{label}</span>
        </>
      );
    case 'fraud':
      return (
        <>
          <IcoWarn />
          <span className="fi-label">{label}</span>
          <span className="fi-bad__tag fi-bad__tag--risk">риск</span>
        </>
      );
    case 'junk':
      return (
        <>
          <IcoTrash />
          <span className="fi-label">{label}</span>
        </>
      );
    case 'random_click':
      return (
        <div className="fi-glitch" aria-hidden="true">
          <span className="fi-glitch__layer">{label}</span>
          <span className="fi-glitch__layer fi-glitch__layer--b">{label}</span>
        </div>
      );
    case 'noise':
      return (
        <>
          <div className="fi-noise__dots" aria-hidden="true" />
          <span className="fi-label">{label}</span>
        </>
      );
    default:
      return <span className="fi-label">{label}</span>;
  }
}

export default function FallingItem({ label, variant, skin, style }) {
  const sk = skin || variant || 'good';

  return (
    <div className={`falling-item falling-item--${variant} falling-item--skin-${sk}`} style={style}>
      <div className="falling-item__inner">
        <SkinBody label={label} skin={sk} />
      </div>
    </div>
  );
}
