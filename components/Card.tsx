import { Image, StyleSheet, Text, View } from "react-native";
import { CardType } from "../types/Card";

function getShinyRarityLabel(shinyRarity?: string): string {
	switch (shinyRarity) {
		case "fullShiny":
			return "FULL SHINY";
		case "illustrationShiny":
			return "ILLUSTRATION SHINY";
		case "normalShiny":
		default:
			return "SHINY";
	}
}

function formatRarity(rarity: CardType["rarity"]) {
	const labels: Record<CardType["rarity"], string> = {
		common: "Common",
		uncommon: "Uncommon",
		rare: "Rare",
		ultraRare: "Ultra Rare",
		illustrationRare: "Illustration Rare",
		specialIllustrationRare: "Special Illustration Rare",
		hyperRare: "Hyper Rare",
	};

	return labels[rarity] || "Common";
}

export default function Card({ card }: { card: CardType }) {
	return (
		<View style={styles.card}>
			<View style={styles.imageWrapper}>
				<Image
					source={{ uri: card.image }}
					style={styles.image}
					resizeMode="cover"
				/>
				<View style={styles.imageGlow} />
				{card.isShiny && (
					<View style={styles.shinyBadge}>
						<Text style={styles.shinyText}>
							{getShinyRarityLabel(card.shinyRarity)}
						</Text>
					</View>
				)}
			</View>
			<Text style={styles.name}>{card.name}</Text>
			<Text style={styles.rarity}>{formatRarity(card.rarity)}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		width: 150,
		alignItems: "center",
		margin: 10,
		paddingTop: 12,
		paddingBottom: 14,
		paddingHorizontal: 10,
		borderRadius: 24,
		backgroundColor: "#ffffff",
		shadowColor: "#0f172a",
		shadowOpacity: 0.12,
		shadowRadius: 14,
		shadowOffset: { width: 0, height: 10 },
		elevation: 8,
	},
	imageWrapper: {
		position: "relative",
		borderRadius: 20,
		overflow: "hidden",
		backgroundColor: "#eef3ff",
		padding: 4,
	},
	image: {
		width: 122,
		height: 172,
		borderRadius: 16,
	},
	imageGlow: {
		position: "absolute",
		top: 8,
		left: 8,
		right: 8,
		height: 64,
		borderRadius: 16,
		backgroundColor: "rgba(59,130,246,0.12)",
	},
	shinyBadge: {
		position: "absolute",
		left: 10,
		top: 10,
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 999,
		backgroundColor: "rgba(184, 134, 11, 0.95)",
	},
	shinyText: {
		color: "#fffdf3",
		fontSize: 9,
		fontWeight: "800",
		letterSpacing: 0.3,
	},
	name: {
		marginTop: 12,
		fontSize: 14,
		fontWeight: "700",
		textAlign: "center",
		color: "#111827",
	},
	rarity: {
		marginTop: 4,
		fontSize: 12,
		fontWeight: "600",
		color: "#4b5563",
	},
});
