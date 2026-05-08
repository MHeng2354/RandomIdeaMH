import { CardRarity, CardType, ShinyRarity } from "../types/Card";

type Rarity = CardRarity | ShinyRarity;

const COMMON_POOL: Rarity[] = ["common"];
const UNCOMMON_POOL: Rarity[] = ["uncommon"];
const RARE_POOL: Rarity[] = ["rare"];
const UltraRARE_POOL: Rarity[] = ["ultraRare"];
const Illustration_RARE_POOL: Rarity[] = [
	"illustrationRare",
	"specialIllustrationRare",
	"hyperRare",
];
const BABY_SHINY_POOL: Rarity[] = ["normalShiny"];
const HIGH_SHINY_POOL: Rarity[] = ["fullShiny"];
const HIGH_SHINY_POOL_2: Rarity[] = ["illustrationShiny"];

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

function isShinyRarity(rarity: Rarity): rarity is ShinyRarity {
	return ["normalShiny", "fullShiny", "illustrationShiny"].includes(
		rarity as string,
	);
}

function getRandomCardByRarityGroup(cards: CardType[], rarities: Rarity[]) {
	const rarity = randomRarity(rarities);

	if (isShinyRarity(rarity)) {
		const pool = cards.filter((card) => card.shinyRarity === rarity);
		const card = randomFromPool(pool, cards);
		return {
			...card,
			isShiny: true,
			shinyType: (rarity === "illustrationShiny"
				? "illustration"
				: "fullArt") as "fullArt" | "illustration",
			shinyRarity: rarity,
		};
	} else {
		const pool = cards.filter((card) => card.rarity === rarity);

		if (pool.length > 0) {
			return randomFromPool(pool, cards);
		}

		const fallbackPool = cards.filter((card) =>
			rarities.includes(card.rarity as Rarity),
		);
		return randomFromPool(fallbackPool, cards);
	}
}

function getGodPackCard(cards: CardType[]) {
	return getRandomCardByRarityGroup(cards, Illustration_RARE_POOL);
}

function openShinyPack(cards: CardType[]) {
	return [
		getRandomCardByRarityGroup(cards, COMMON_POOL),
		getRandomCardByRarityGroup(cards, COMMON_POOL),

		getRandomCardByRarityGroup(cards, UNCOMMON_POOL),
		getRandomCardByRarityGroup(cards, UNCOMMON_POOL),

		getRandomCardByRarityGroup(cards, RARE_POOL),
		getRandomCardByRarityGroup(cards, RARE_POOL),
		getRandomCardByRarityGroup(cards, Illustration_RARE_POOL),
		getRandomCardByRarityGroup(cards, BABY_SHINY_POOL),
		getRandomCardByRarityGroup(cards, HIGH_SHINY_POOL),
		getRandomCardByRarityGroup(cards, HIGH_SHINY_POOL_2),
	];
}

function openShinyGodPack(cards: CardType[]) {
	return [
		getRandomCardByRarityGroup(cards, BABY_SHINY_POOL),
		getRandomCardByRarityGroup(cards, BABY_SHINY_POOL),
		getRandomCardByRarityGroup(cards, BABY_SHINY_POOL),
		getRandomCardByRarityGroup(cards, BABY_SHINY_POOL),

		getRandomCardByRarityGroup(cards, HIGH_SHINY_POOL),
		getRandomCardByRarityGroup(cards, HIGH_SHINY_POOL),
		getRandomCardByRarityGroup(cards, HIGH_SHINY_POOL),

		getRandomCardByRarityGroup(cards, HIGH_SHINY_POOL_2),
		getRandomCardByRarityGroup(cards, HIGH_SHINY_POOL_2),
		getRandomCardByRarityGroup(cards, HIGH_SHINY_POOL_2),
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
			getRandomCardByRarityGroup(cards, UltraRARE_POOL),
			getRandomCardByRarityGroup(cards, UltraRARE_POOL),

			getRandomCardByRarityGroup(cards, Illustration_RARE_POOL),
			getRandomCardByRarityGroup(cards, Illustration_RARE_POOL),
			getRandomCardByRarityGroup(cards, Illustration_RARE_POOL),
			getRandomCardByRarityGroup(cards, Illustration_RARE_POOL),
		],
	};
}
