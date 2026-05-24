import { CardType, ShinyRarity } from "../types/Card";

const API_URL = "https://api.pokemontcg.io/v2/cards";

type PokemonApiCard = {
	id: string;
	name: string;
	rarity?: string;
	number?: string;
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
	if (value.includes("shiny ultra rare")) return "ultraRare";
	if (value.includes("ultra rare")) return "ultraRare";
	if (value.includes("shiny rare")) return "rare";
	if (value.includes("rare")) return "rare";
	if (value.includes("uncommon")) return "uncommon";

	return "common";
}

function isShinyCard(card: PokemonApiCard, selectedSetId: string): boolean {
	const rarity = card.rarity?.toLowerCase() ?? "";
	const cardNumber = card.number?.toUpperCase() ?? "";
	const setId = card.set?.id?.toLowerCase() ?? selectedSetId.toLowerCase();
	const setName = card.set?.name?.toLowerCase() ?? "";

	const hasShinyRarity =
		rarity.includes("shiny rare") ||
		rarity.includes("shiny ultra rare") ||
		rarity.includes("shiny vault") ||
		rarity.includes("shiny");

	const isShinyVaultCardNumber = cardNumber.startsWith("SV");

	const isShinySet =
		setId === "sv4pt5" ||
		setId === "swsh45sv" ||
		setName.includes("paldean fates") ||
		setName.includes("shiny vault") ||
		setName.includes("shining fates") ||
		setName.includes("hidden fates");

	return hasShinyRarity || (isShinyVaultCardNumber && isShinySet);
}

function mapShinyRarity(card: PokemonApiCard): ShinyRarity {
	const rarity = card.rarity?.toLowerCase() ?? "";

	if (
		rarity.includes("special illustration") ||
		rarity.includes("illustration") ||
		rarity.includes("hyper")
	) {
		return "illustrationShiny";
	}

	if (rarity.includes("shiny ultra rare") || rarity.includes("ultra rare")) {
		return "fullShiny";
	}

	return "normalShiny";
}

const fetchCache = new Map<string, Promise<CardType[]>>();

export async function fetchCardsBySet(setId: string): Promise<CardType[]> {
	const cached = fetchCache.get(setId);

	if (cached) {
		return cached;
	}

	const request = (async () => {
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
				shinyRarity: canBeShiny ? mapShinyRarity(card) : undefined,
			};
		});
	})();

	fetchCache.set(setId, request);

	request.catch(() => {
		fetchCache.delete(setId);
	});

	return request;
}
