import { ImageSourcePropType } from "react-native";

export type CardRarity =
	| "common"
	| "uncommon"
	| "rare"
	| "ultraRare"
	| "illustrationRare"
	| "specialIllustrationRare"
	| "hyperRare";

export type ShinyRarity = "normalShiny" | "fullShiny" | "illustrationShiny";

export type CardType = {
	id: string;
	name: string;
	image: string;
	rarity: CardRarity;
	isShiny?: boolean;
	shinyType?: "fullArt" | "illustration";
	shinyRarity?: ShinyRarity;
	canBeShiny?: boolean;
};

export type PackType = {
	id: string;
	name: string;
	setId: string;
	price: number;
	image: ImageSourcePropType;
};
