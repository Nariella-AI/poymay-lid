import React from 'react';

export default function StartScreen({ onStart }) {
  return (
    <div className="screen screen--start">
      <div className="screen__glow screen__glow--1" aria-hidden="true" />
      <div className="screen__glow screen__glow--2" aria-hidden="true" />
      <div className="screen__ribbon" aria-hidden="true" />
      <div className="hero-card hero-card--start">
        <div className="hero-kicker">
          <span className="hero-kicker__dot" />
          <span>Цифровой спецпроект для воронки и лидогенерации</span>
        </div>
        <h1 className="hero-title">Поймай лид</h1>
        <p className="hero-subtitle">
          Лови только качественные лиды, собирай комбо и бонусы. Мусор режет результат и жизни — как в
          реальной воронке, только быстрее и нагляднее.
        </p>

        <div className="howto-block">
          <h2 className="howto-block__title">Как играть</h2>
          <ol className="howto-list">
            <li>Управляй ловцом влево и вправо: на ПК — стрелки или клавиши бокового шага; на телефоне — кнопки внизу.</li>
            <li>Собирай качественные лиды подряд — растёт комбо и множитель очков.</li>
            <li>Лови золотых лидов и редкие бонусы: заморозка, щит, удвоение очков.</li>
            <li>Избегай мусора: он отнимает очки и жизнь. Щит один раз спасёт от ошибки.</li>
            <li>У тебя 45 секунд и три жизни; к финалу темп растёт — держи концентрацию.</li>
          </ol>
        </div>

        <ul className="rules-list rules-list--compact">
          <li>
            <span className="rules-dot rules-dot--good" />
            Комбо сбрасывается, если пойман мусор или упущен хороший лид.
          </li>
          <li>
            <span className="rules-dot rules-dot--bad" />
            Показатели на экране — счёт, время, жизни, комбо и активные бонусы.
          </li>
        </ul>

        <div className="hero-cta">
          <button type="button" className="btn btn--primary" onClick={onStart}>
            Начать игру
          </button>
          <p className="hero-hint">
            Рекомендуем портретную ориентацию на телефоне — так удобнее всего играть одной рукой.
          </p>
        </div>
      </div>
    </div>
  );
}
