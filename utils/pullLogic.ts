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

export type PackPullResult = {
	cards: CardType[];
	isGodPack: boolean;
};

function randomFromPool(pool: CardType[], fallback: CardType[]) {
	const source = pool.length > 0 ? pool : fallback;
	return source[Math.floor(Math.random() * source.length)];
}

function randomRarity(rarities: Rarity[]) {
	return rarities[Math.floor(Math.random() * rarities.length)];
}

function getRandomCardByRarityGroup(cards: CardType[], rarities: Rarity[]) {
	const rarity = randomRarity(rarities);
	const pool = cards.filter((card) => card.rarity === rarity);

	if (pool.length > 0) {
		return randomFromPool(pool, cards);
	}

	const fallbackPool = cards.filter((card) => rarities.includes(card.rarity));
	return randomFromPool(fallbackPool, cards);
}

function getGodPackCard(cards: CardType[]) {
	return getRandomCardByRarityGroup(cards, HIGH_RARE_POOL);
}

export function openPack(
	cards: CardType[],
	godPackChance: number,
): PackPullResult {
	const chance = Math.min(godPackChance, 1);
	const isGodPack = Math.random() < chance;

	if (isGodPack) {
		return {
			isGodPack: true,
			cards: Array.from({ length: 12 }, () => getGodPackCard(cards)),
		};
	}

	return {
		isGodPack: false,
		cards: [
			getRandomCardByRarityGroup(cards, COMMON_POOL),
			getRandomCardByRarityGroup(cards, COMMON_POOL),

			getRandomCardByRarityGroup(cards, UNCOMMON_POOL),
			getRandomCardByRarityGroup(cards, UNCOMMON_POOL),

			getRandomCardByRarityGroup(cards, RARE_POOL),
			getRandomCardByRarityGroup(cards, RARE_POOL),
			getRandomCardByRarityGroup(cards, RARE_POOL),
			getRandomCardByRarityGroup(cards, RARE_POOL),

			getRandomCardByRarityGroup(cards, HIGH_RARE_POOL),
			getRandomCardByRarityGroup(cards, HIGH_RARE_POOL),
			getRandomCardByRarityGroup(cards, HIGH_RARE_POOL),
			getRandomCardByRarityGroup(cards, HIGH_RARE_POOL),
		],
	};
}
