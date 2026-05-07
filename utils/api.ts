import { CardType, ShinyRarity } from "../types/Card";

const API_URL = "https://api.pokemontcg.io/v2/cards";

type PokemonApiCard = {
	id: string;
	name: string;
	rarity?: string;
	number?: string;
	cardNumber?: string;
	set?: {
		id?: string;
		name?: string;
	};
	images: {
		small: string;
		large: string;
	};
};

function mapRarity(rarity?: string): CardType["rarity"] {
	if (!rarity) return "common";

	const value = rarity.toLowerCase();

	if (value.includes("hyper rare")) return "hyperRare";
	if (value.includes("special illustration rare"))
		return "specialIllustrationRare";
	if (value.includes("illustration rare")) return "illustrationRare";
	if (value.includes("ultra rare")) return "ultraRare";
	if (value.includes("rare")) return "rare";
	if (value.includes("uncommon")) return "uncommon";

	return "common";
}

function isShinyCard(card: PokemonApiCard, setId: string): boolean {
	const rarityValue = card.rarity?.toLowerCase() ?? "";
	if (rarityValue.includes("shiny")) {
		return true;
	}

	const cardNumber = (card.cardNumber || card.number || "").toUpperCase();
	const setName = card.set?.name?.toLowerCase() ?? "";

	const isShinyVaultNumber = cardNumber.startsWith("SV");
	const isShinyVaultSet = ["swsh45", "sv4", "sv4.5"].includes(
		setId.toLowerCase(),
	);
	const isKnownShinySet = ["hidden fates", "shining fates"].includes(setName);

	if (isShinyVaultNumber && (isShinyVaultSet || isKnownShinySet)) {
		return true;
	}

	return false;
}

function mapShinyRarity(rarity?: string): ShinyRarity {
	if (!rarity) return "normalShiny";

	const value = rarity.toLowerCase();

	// Full art/V-style shiny cards
	if (value.includes("gx") || value.includes("v") || value.includes("vmax")) {
		return "fullShiny";
	}

	// Illustration rare shiny cards
	if (
		value.includes("illustration") ||
		value.includes("secret") ||
		value.includes("special")
	) {
		return "illustrationShiny";
	}

	// Default: normal shiny
	return "normalShiny";
}

export async function fetchCardsBySet(
	setId: string,
	isShinyPack: boolean = false,
): Promise<CardType[]> {
	const query = encodeURIComponent(`set.id:${setId}`);

	const response = await fetch(`${API_URL}?q=${query}&pageSize=500`);

	if (!response.ok) {
		throw new Error("Failed to fetch Pokémon TCG cards");
	}

	const json = await response.json();

	return json.data.map((card: PokemonApiCard) => {
		const canBeShiny = isShinyCard(card, setId);
		return {
			id: card.id,
			name: card.name,
			image: card.images.large || card.images.small,
			rarity: mapRarity(card.rarity),
			isShiny: false,
			shinyType: undefined,
			canBeShiny,
			shinyRarity: canBeShiny ? mapShinyRarity(card.rarity) : undefined,
		};
	});
}
