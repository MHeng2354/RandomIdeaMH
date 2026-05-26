import { CardType } from "../types/Card";

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
	if (value.includes("ultra rare")) return "ultraRare";
	if (value.includes("rare")) return "rare";
	if (value.includes("uncommon")) return "uncommon";

	return "common";
}

function normalizeSetIds(setIds: string | string[]): string[] {
	const normalized = Array.isArray(setIds) ? setIds : [setIds];

	return [...new Set(normalized.map((setId) => setId.trim()).filter(Boolean))];
}

const fetchCache = new Map<string, Promise<CardType[]>>();

async function fetchCardsBySingleSet(setId: string): Promise<CardType[]> {
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
			return {
				id: card.id,
				name: card.name,
				image: card.images.large || card.images.small,
				rarity: mapRarity(card.rarity),
			};
		});
	})();

	fetchCache.set(setId, request);

	request.catch(() => {
		fetchCache.delete(setId);
	});

	return request;
}

export async function fetchCardsBySet(
	setIds: string | string[],
): Promise<CardType[]> {
	const normalizedSetIds = normalizeSetIds(setIds);
	const results = await Promise.all(
		normalizedSetIds.map((setId) => fetchCardsBySingleSet(setId)),
	);
	const mergedCards = results.flat();
	const uniqueCards = new Map<string, CardType>();

	for (const card of mergedCards) {
		if (!uniqueCards.has(card.id)) {
			uniqueCards.set(card.id, card);
		}
	}

	return Array.from(uniqueCards.values());
}
