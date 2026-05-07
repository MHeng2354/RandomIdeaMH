import {
	Poppins_400Regular,
	Poppins_600SemiBold,
	Poppins_700Bold,
	useFonts,
} from "@expo-google-fonts/poppins";
import { useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Image,
	Pressable,
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { GameContext } from "../../context/GameContext";
import { packs } from "../../data/packs";
import { CardType } from "../../types/Card";
import { fetchCardsBySet } from "../../utils/api";
import { generateWherePickCards } from "../../utils/wherePickLogic";
import { saveWherePickSession } from "../../utils/wherePickStorage";

export default function WonderMiss() {
	const router = useRouter();
	const { ancestors, spendAncestors } = useContext(GameContext);

	const [fontsLoaded] = useFonts({
		Poppins_400Regular,
		Poppins_600SemiBold,
		Poppins_700Bold,
	});

	const [allCards, setAllCards] = useState<CardType[]>([]);
	const [wonderMissCards, setWonderMissCards] = useState<CardType[]>([]);
	const [isHighRareSession, setIsHighRareSession] = useState(false);
	const [loading, setLoading] = useState(true);
	const [starting, setStarting] = useState(false);

	useEffect(() => {
		loadCards();
	}, []);

	const loadCards = async () => {
		try {
			const results = await Promise.all(
				packs.map((pack) => fetchCardsBySet(pack.setId, pack.isShinyPack)),
			);

			const mergedCards = results.flat();
			const generated = generateWherePickCards(mergedCards);

			setAllCards(mergedCards);
			setWonderMissCards(generated.cards);
			setIsHighRareSession(generated.isHighRareSession);
		} catch {
			Alert.alert("Error", "Failed to load WonderMiss cards.");
		} finally {
			setLoading(false);
		}
	};

	const refreshSelection = () => {
		if (allCards.length === 0) return;

		const generated = generateWherePickCards(allCards);

		setWonderMissCards(generated.cards);
		setIsHighRareSession(generated.isHighRareSession);
	};

	const startWonderMiss = async () => {
		if (wonderMissCards.length !== 6) {
			Alert.alert("Error", "WonderMiss cards are not ready.");
			return;
		}

		const ok = spendAncestors(10);

		if (!ok) {
			Alert.alert(
				"Not Enough Ancestors",
				"You need 10 Ancestors for WonderMiss.",
			);
			return;
		}

		setStarting(true);

		await saveWherePickSession({
			cards: wonderMissCards,
			isHighRareSession,
		});

		setStarting(false);
		router.push("/wondermiss-play");
	};

	if (!fontsLoaded || loading) {
		return (
			<SafeAreaView style={styles.safeArea}>
				<View style={styles.center}>
					<ActivityIndicator size="large" color="#e3350d" />
					<Text style={styles.loadingTitle}>WonderMiss</Text>
					<Text style={styles.loadingText}>
						{!fontsLoaded ? "Loading fonts..." : "Loading WonderMiss cards..."}
					</Text>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<ScrollView contentContainerStyle={styles.container}>
			<Text style={styles.title}>WonderMiss</Text>

			<View style={styles.statusBox}>
				<Text style={styles.statusText}>Ancestors: {ancestors}</Text>
				<Text style={styles.costText}>Cost: 10 Ancestors</Text>
			</View>

			<Text style={styles.subtitle}>Choose this 6-card selection?</Text>

			{isHighRareSession && (
				<Text style={styles.specialText}>Special WonderMiss Selection!</Text>
			)}

			<View style={styles.cardGrid}>
				{wonderMissCards.map((card, index) => (
					<View key={`${card.id}-${index}`} style={styles.card}>
						<Image
							source={{ uri: card.image }}
							style={styles.cardImage}
							resizeMode="cover"
						/>
						<Text style={styles.cardName} numberOfLines={1}>
							{card.name}
						</Text>
						<Text style={styles.rarity} numberOfLines={1}>
							{formatRarity(card.rarity)}
						</Text>
					</View>
				))}
			</View>

			<View style={styles.buttonRow}>
				<Pressable
					style={[styles.actionButton, styles.startButton]}
					onPress={startWonderMiss}
					disabled={starting}
				>
					{starting ? (
						<ActivityIndicator color="#fff" />
					) : (
						<Text style={styles.buttonText}>Start</Text>
					)}
				</Pressable>

				<Pressable
					style={[styles.actionButton, styles.refreshButton]}
					onPress={refreshSelection}
					disabled={starting}
				>
					<Text style={styles.buttonText}>Refresh</Text>
				</Pressable>
			</View>
		</ScrollView>
	);
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

	return labels[rarity];
}

const FONT = {
	regular: "Poppins_400Regular",
	semiBold: "Poppins_600SemiBold",
	bold: "Poppins_700Bold",
};

const styles = StyleSheet.create({
	container: {
		paddingHorizontal: 16,
		paddingTop: 14,
		paddingBottom: 24,
		backgroundColor: "#fff",
		alignItems: "center",
	},
	center: {
		flex: 1,
		backgroundColor: "#fff",
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 20,
	},
	loadingText: {
		marginTop: 6,
		fontSize: 15,
		color: "#555",
		fontFamily: FONT.regular,
		textAlign: "center",
	},
	loadingTitle: {
		marginTop: 14,
		fontSize: 26,
		color: "#111",
		fontFamily: FONT.bold,
	},
	title: {
		fontSize: 26,
		fontFamily: FONT.bold,
		marginBottom: 8,
	},
	statusBox: {
		width: "100%",
		backgroundColor: "#f7f7f7",
		borderRadius: 16,
		paddingVertical: 10,
		paddingHorizontal: 14,
		alignItems: "center",
		marginBottom: 10,
	},
	statusText: {
		fontSize: 16,
		fontFamily: FONT.semiBold,
	},
	costText: {
		marginTop: 2,
		fontSize: 13,
		color: "#666",
		fontFamily: FONT.regular,
	},
	subtitle: {
		fontSize: 16,
		fontFamily: FONT.bold,
		marginBottom: 8,
	},
	specialText: {
		backgroundColor: "#b8860b",
		color: "#fff",
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 999,
		fontSize: 12,
		fontFamily: FONT.bold,
		marginBottom: 8,
	},
	cardGrid: {
		width: "100%",
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
	},
	card: {
		width: "31.5%",
		backgroundColor: "#f6f6f6",
		borderRadius: 12,
		padding: 6,
		alignItems: "center",
		marginBottom: 8,
	},
	cardImage: {
		width: "100%",
		aspectRatio: 0.72,
		borderRadius: 8,
	},
	cardName: {
		marginTop: 4,
		fontSize: 10,
		fontFamily: FONT.semiBold,
		textAlign: "center",
		width: "100%",
	},
	rarity: {
		marginTop: 1,
		fontSize: 9,
		color: "#666",
		fontFamily: FONT.regular,
		textAlign: "center",
		width: "100%",
	},
	buttonRow: {
		width: "100%",
		flexDirection: "row",
		gap: 10,
		marginTop: 8,
	},
	actionButton: {
		flex: 1,
		paddingVertical: 13,
		borderRadius: 999,
		alignItems: "center",
	},
	startButton: {
		backgroundColor: "#e3350d",
	},
	refreshButton: {
		backgroundColor: "#3761a8",
	},
	buttonText: {
		color: "#fff",
		fontSize: 15,
		fontFamily: FONT.bold,
	},
	safeArea: {
		flex: 1,
		backgroundColor: "#fff",
	},
});
