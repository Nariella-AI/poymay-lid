import React from 'react';

function getVerdict(score) {
  if (score <= 25) {
    return {
      title: 'Есть куда расти',
      text: 'Сейчас воронка «шумит»: много случайного внимания и мало предсказуемого результата. Сфокусируй источники и качество — и цифры полезут вверх.',
    };
  }
  if (score <= 55) {
    return {
      title: 'Сильная попытка',
      text: 'Ты уже чувствуешь ритм: есть точные решения и здравый скепсис к мусору. Осталось дожать дисциплину в самый напряжённый момент раунда.',
    };
  }
  if (score <= 120) {
    return {
      title: 'Ты в топе по конверсии внимания',
      text: 'Стабильный сбор, комбо и работа с риском — это уровень команды, которой доверяют лиды. Такой результат можно смело показывать на питче.',
    };
  }
  return {
    title: 'Абсолютный стандарт качества',
    text: 'Ты ловишь смысл, а не шум: редкий уровень для промо-формата. Если так же выстроить процесс в продакшене — воронка станет активом бренда.',
  };
}

export default function EndScreen({ score, reason, stats, onRestart, soundOn, onToggleSound }) {
  const verdict = getVerdict(score);
  const reasonText =
    reason === 'lives'
      ? 'Жизни закончились — слишком много мусора прошло через воронку. Возьми реванш: щит и заморозка помогут пережить риск.'
      : 'Время вышло. Зафиксируй лучший результат и забери ещё один заход — финал раунда любит тех, кто не сбавляет темп.';

  const good = stats?.good ?? 0;
  const bad = stats?.bad ?? 0;
  const bestCombo = stats?.bestCombo ?? 1;

  return (
    <div className="screen screen--end">
      <div className="screen__glow screen__glow--1" aria-hidden="true" />
      <div className="screen__glow screen__glow--3" aria-hidden="true" />
      <div className="hero-card hero-card--end">
        <p className="hero-eyebrow">Раунд завершён</p>
        <h2 className="hero-title hero-title--sm">{verdict.title}</h2>
        <p className="end-score">
          <span className="end-score__label">Итоговый счёт</span>
          <span className="end-score__value">{score}</span>
        </p>

        <div className="end-stats">
          <div className="end-stat">
            <span className="end-stat__label">Поймано хороших лидов</span>
            <span className="end-stat__value">{good}</span>
          </div>
          <div className="end-stat">
            <span className="end-stat__label">Поймано мусора</span>
            <span className="end-stat__value end-stat__value--warn">{bad}</span>
          </div>
          <div className="end-stat">
            <span className="end-stat__label">Лучший комбо-множитель</span>
            <span className="end-stat__value">×{bestCombo}</span>
          </div>
        </div>

        <p className="end-reason">{reasonText}</p>
        <p className="end-verdict">{verdict.text}</p>
        <div className="end-sound-row">
          <button
            type="button"
            className="hud__sound hud__sound--in-card"
            onClick={onToggleSound}
            aria-pressed={soundOn}
            aria-label={soundOn ? 'Выключить озвучку' : 'Включить озвучку'}
          >
            Звук: {soundOn ? 'вкл' : 'выкл'}
          </button>
        </div>
        <button type="button" className="btn btn--primary btn--wide" onClick={onRestart}>
          Играть снова
        </button>
      </div>
    </div>
  );
}
