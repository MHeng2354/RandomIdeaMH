import { PackType } from "../types/Card";

export const packs: PackType[] = [
	{
		id: "mega-evolution",
		name: "Mega Evolution",
		setIds: ["me1", "me2", "me2pt5", "me3"],
		price: 10,
		image: require("../assets/images/packs/mega_evolution.png"),
	},
	{
		id: "black-white",
		name: "Black & White",
		setIds: ["zsv10pt5", "rsv10pt5"],
		price: 10,
		image: require("../assets/images/packs/black_white.png"),
	},
	{
		id: "destined-rivals",
		name: "Destined Rivals",
		setIds: ["sv10"],
		price: 10,
		image: require("../assets/images/packs/destined_rivals.png"),
	},
	{
		id: "journey-together",
		name: "Journey Together",
		setIds: ["sv9"],
		price: 10,
		image: require("../assets/images/packs/journey_together.png"),
	},
	{
		id: "lost-origin",
		name: "Lost Origin",
		setIds: ["swsh10", "swsh11"],
		price: 10,
		image: require("../assets/images/packs/lost_origin.png"),
	},
	{
		id: "prismatic-evolution",
		name: "Prismatic Evolution",
		setIds: ["sv7", "sv8", "sv8pt5"],
		price: 10,
		image: require("../assets/images/packs/prismatic_evolution.png"),
	},
	{
		id: "scarlet-violet",
		name: "Scarlet & Violet",
		setIds: ["sv3", "sv5", "sv6"],
		price: 10,
		image: require("../assets/images/packs/scarlet_violet.png"),
	},
	{
		id: "cosmic-eclipse",
		name: "Cosmic Eclipse",
		setIds: ["sm12"],
		price: 10,
		image: require("../assets/images/packs/cosmic_eclipse.png"),
	},
];
