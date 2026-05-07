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

export default function Card({ card }: { card: CardType }) {
	return (
		<View style={styles.card}>
			<View style={styles.imageWrapper}>
				<Image source={{ uri: card.image }} style={styles.image} />
				{card.isShiny && (
					<View style={styles.shinyBadge}>
						<Text style={styles.shinyText}>
							{getShinyRarityLabel(card.shinyRarity)}
						</Text>
					</View>
				)}
			</View>
			<Text style={styles.name}>{card.name}</Text>
			<Text style={styles.rarity}>{card.rarity}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		alignItems: "center",
		margin: 10,
	},
	imageWrapper: {
		position: "relative",
	},
	image: {
		width: 120,
		height: 170,
		borderRadius: 10,
	},
	shinyBadge: {
		position: "absolute",
		top: 8,
		right: 8,
		backgroundColor: "rgba(255, 214, 77, 0.95)",
		borderRadius: 8,
		paddingHorizontal: 6,
		paddingVertical: 2,
	},
	shinyText: {
		color: "#663f00",
		fontSize: 10,
		fontWeight: "700",
	},
	name: {
		marginTop: 8,
		fontSize: 14,
		fontWeight: "600",
		textAlign: "center",
	},
	rarity: {
		fontSize: 12,
		color: "#555",
	},
});
