/**
 * Игровые объекты: подписи, очки и ключ визуального скина.
 */

export const GOOD_ITEMS = [
  { id: 'g1', label: 'Горячий лид', tier: 'high', skin: 'hot' },
  { id: 'g2', label: 'Квалифицированный лид', tier: 'high', skin: 'qualified' },
  { id: 'g3', label: 'Запрос демо', tier: 'normal', skin: 'demo' },
  { id: 'g4', label: 'Бриф', tier: 'normal', skin: 'brief' },
  { id: 'g5', label: 'Заявка с формы', tier: 'normal', skin: 'form' },
  { id: 'g6', label: 'Целевой клиент', tier: 'normal', skin: 'client' },
];

export const BAD_ITEMS = [
  { id: 'b1', label: 'Спам', skin: 'spam' },
  { id: 'b2', label: 'Бот', skin: 'bot' },
  { id: 'b3', label: 'Фрод', skin: 'fraud' },
  { id: 'b4', label: 'Мусорный лид', skin: 'junk' },
  { id: 'b5', label: 'Случайный клик', skin: 'random_click' },
  { id: 'b6', label: 'Нецелевой трафик', skin: 'noise' },
];

export const SPECIAL_ITEMS = [
  { id: 's1', special: 'golden', label: 'Золотой лид', variant: 'golden', skin: 'golden' },
  { id: 's2', special: 'freeze', label: 'Заморозка мусора', variant: 'freeze', skin: 'freeze' },
  { id: 's3', special: 'shield', label: 'Щит', variant: 'shield', skin: 'shield' },
  { id: 's4', special: 'double', label: 'Удвоение очков', variant: 'double', skin: 'double' },
];

export const GOLDEN_LEAD_POINTS = 45;

export function pointsForGood(tier) {
  return tier === 'high' ? 15 : 10;
}

export function comboMultiplierFromStreak(streak) {
  return 1 + Math.min(3, Math.floor(streak / 2));
}
