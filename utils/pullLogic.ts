import { CardRarity, CardType } from "../types/Card";

const COMMON_POOL: CardRarity[] = ["common"];
const UNCOMMON_POOL: CardRarity[] = ["uncommon"];
const RARE_POOL: CardRarity[] = ["rare"];
const UltraRARE_POOL: CardRarity[] = ["ultraRare"];
const Illustration_RARE_POOL: CardRarity[] = [
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

function getRandomCardByRarityGroup(cards: CardType[], rarities: CardRarity[]) {
	const rarity = rarities[Math.floor(Math.random() * rarities.length)];
	const pool = cards.filter((card) => card.rarity === rarity);

	if (pool.length > 0) {
		return randomFromPool(pool, cards);
	}

	const fallbackPool = cards.filter((card) => rarities.includes(card.rarity));
	return randomFromPool(fallbackPool, cards);
}

function getGodPackCard(cards: CardType[]) {
	return getRandomCardByRarityGroup(cards, Illustration_RARE_POOL);
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
			getRandomCardByRarityGroup(cards, UltraRARE_POOL),
			getRandomCardByRarityGroup(cards, UltraRARE_POOL),

			getRandomCardByRarityGroup(cards, Illustration_RARE_POOL),
			getRandomCardByRarityGroup(cards, Illustration_RARE_POOL),
			getRandomCardByRarityGroup(cards, Illustration_RARE_POOL),
			getRandomCardByRarityGroup(cards, Illustration_RARE_POOL),
		],
	};
}
