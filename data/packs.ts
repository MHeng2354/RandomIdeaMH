import { PackType } from "../types/Card";

export const packs: PackType[] = [
	{
		id: "scarlet-violet",
		name: "Scarlet & Violet",
		setId: "sv1",
		price: 10,
		image: require("../assets/images/packs/scarlet-violet-pack.png"),
	},
	{
		id: "paldea-evolved",
		name: "Paldea Evolved",
		setId: "sv2",
		price: 10,
		image: require("../assets/images/packs/paldea-evolved-pack.png"),
	},
	{
		id: "obsidian-flames",
		name: "Obsidian Flames",
		setId: "sv3",
		price: 10,
		image: require("../assets/images/packs/obsidian-flames-pack.png"),
	},
	{
		id: "paradox-rift",
		name: "Paradox Rift",
		setId: "sv4",
		price: 10,
		image: require("../assets/images/packs/paradox-rift-pack.png"),
	},
	{
		id: "temporal-forces",
		name: "Temporal Forces",
		setId: "sv5",
		price: 10,
		image: require("../assets/images/packs/temporal-forces-pack.png"),
	},
	{
		id: "twilight-masquerade",
		name: "Twilight Masquerade",
		setId: "sv6",
		price: 10,
		image: require("../assets/images/packs/twilight-masquerade-pack.png"),
	},
	{
		id: "paldean-fates",
		name: "Paldean Fates",
		setId: "sv4",
		price: 15,
		image: require("../assets/images/packs/paldean-fates-pack.png"),
		isShinyPack: true,
	},
	{
		id: "shining-fates",
		name: "Shining Fates",
		setId: "swsh45",
		price: 15,
		image: require("../assets/images/packs/shining-fates-pack.png"),
		isShinyPack: true,
	},
];
