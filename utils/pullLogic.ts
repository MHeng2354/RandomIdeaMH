import { CardType } from "../types/Card";

type Rarity = CardType["rarity"];

type ShinyType = "fullArt" | "illustration";

const COMMON_POOL: Rarity[] = ["common"];
const UNCOMMON_POOL: Rarity[] = ["uncommon"];
const RARE_POOL: Rarity[] = ["rare", "ultraRare"];
const HIGH_RARE_POOL: Rarity[] = [
	"illustrationRare",
	"specialIllustrationRare",
	"hyperRare",
];
const BABY_SHINY_POOL: Rarity[] = ["rare", "ultraRare"];
const HIGH_SHINY_POOL: Rarity[] = HIGH_RARE_POOL;
const HIGH_SHINY_POOL_2: Rarity[] = HIGH_RARE_POOL;

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

function randomBoolean(chance: number) {
	return Math.random() < chance;
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

function asShiny(card: CardType, illustrationChance: number): CardType {
	const shinyType: ShinyType = randomBoolean(illustrationChance)
		? "illustration"
		: "fullArt";

	return {
		...card,
		isShiny: true,
		shinyType,
		shinyRarity: card.shinyRarity,
	};
}

function getShinyCardByRarityGroup(
	cards: CardType[],
	rarities: Rarity[],
	illustrationChance: number,
) {
	// Filter only cards that can be shiny
	const shinyCards = cards.filter((card) => card.canBeShiny);

	// If no shiny cards available, fall back to any card
	const pool = shinyCards.length > 0 ? shinyCards : cards;

	return asShiny(
		getRandomCardByRarityGroupFromPool(pool, rarities),
		illustrationChance,
	);
}

function getRandomCardByRarityGroupFromPool(
	cards: CardType[],
	rarities: Rarity[],
) {
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

function openShinyPack(cards: CardType[]) {
	return [
		getRandomCardByRarityGroup(cards, COMMON_POOL),
		getRandomCardByRarityGroup(cards, COMMON_POOL),

		getRandomCardByRarityGroup(cards, UNCOMMON_POOL),
		getRandomCardByRarityGroup(cards, UNCOMMON_POOL),

		getRandomCardByRarityGroup(cards, RARE_POOL),
		getRandomCardByRarityGroup(cards, RARE_POOL),
		getRandomCardByRarityGroup(cards, HIGH_RARE_POOL),
		getShinyCardByRarityGroup(cards, BABY_SHINY_POOL, 0.3),
		getShinyCardByRarityGroup(cards, HIGH_SHINY_POOL, 0.1),
		getShinyCardByRarityGroup(cards, HIGH_SHINY_POOL_2, 0.3),
	];
}

function openShinyGodPack(cards: CardType[]) {
	return [
		asShiny(getRandomCardByRarityGroup(cards, COMMON_POOL), 0.3),
		asShiny(getRandomCardByRarityGroup(cards, COMMON_POOL), 0.3),

		asShiny(getRandomCardByRarityGroup(cards, UNCOMMON_POOL), 0.3),
		asShiny(getRandomCardByRarityGroup(cards, UNCOMMON_POOL), 0.3),

		asShiny(getRandomCardByRarityGroup(cards, RARE_POOL), 0.3),
		asShiny(getRandomCardByRarityGroup(cards, RARE_POOL), 0.3),
		asShiny(getRandomCardByRarityGroup(cards, HIGH_RARE_POOL), 0.3),
		asShiny(getRandomCardByRarityGroup(cards, BABY_SHINY_POOL), 1),
		asShiny(getRandomCardByRarityGroup(cards, HIGH_SHINY_POOL), 1),
		asShiny(getRandomCardByRarityGroup(cards, HIGH_SHINY_POOL_2), 1),
	];
}

export function openPack(
	cards: CardType[],
	godPackChance: number,
	isShinyPack = false,
): PackPullResult {
	const chance = Math.min(godPackChance, 1);
	const godChance = isShinyPack ? 0.1 : chance;
	const isGodPack = Math.random() < godChance;

	if (isGodPack && isShinyPack) {
		return {
			isGodPack: true,
			cards: openShinyGodPack(cards),
		};
	}

	if (isGodPack) {
		return {
			isGodPack: true,
			cards: Array.from({ length: 12 }, () => getGodPackCard(cards)),
		};
	}

	if (isShinyPack) {
		return {
			isGodPack: false,
			cards: openShinyPack(cards),
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
