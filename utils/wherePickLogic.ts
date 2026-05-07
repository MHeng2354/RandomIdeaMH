import { CardType } from "../types/Card";

type Rarity = CardType["rarity"];

const COMMON_POOL: Rarity[] = ["common"];
const UNCOMMON_POOL: Rarity[] = ["uncommon"];
const RARE_POOL: Rarity[] = ["rare", "ultraRare"];
const HIGH_RARE_POOL: Rarity[] = [
  "illustrationRare",
  "specialIllustrationRare",
  "hyperRare",
];

const NORMAL_POOL: Rarity[] = [
  ...COMMON_POOL,
  ...UNCOMMON_POOL,
  ...RARE_POOL,
];

function randomFromPool(pool: CardType[], fallback: CardType[]) {
  const source = pool.length > 0 ? pool : fallback;
  return source[Math.floor(Math.random() * source.length)];
}

function getCardByRarityGroup(cards: CardType[], rarities: Rarity[]) {
  const pool = cards.filter((card) => rarities.includes(card.rarity));
  return randomFromPool(pool, cards);
}

function shuffleCards(cards: CardType[]) {
  return [...cards].sort(() => Math.random() - 0.5);
}

export function generateWherePickCards(cards: CardType[]) {
  const isHighRareSession = Math.random() < 0.05;

  if (isHighRareSession) {
    return {
      isHighRareSession,
      cards: shuffleCards(
        Array.from({ length: 6 }, () => getCardByRarityGroup(cards, HIGH_RARE_POOL))
      ),
    };
  }

  const highRareCard = getCardByRarityGroup(cards, HIGH_RARE_POOL);

  const normalCards = Array.from({ length: 5 }, () =>
    getCardByRarityGroup(cards, NORMAL_POOL)
  );

  return {
    isHighRareSession,
    cards: shuffleCards([highRareCard, ...normalCards]),
  };
}