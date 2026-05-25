import {
	Poppins_400Regular,
	Poppins_600SemiBold,
	Poppins_700Bold,
	useFonts,
} from "@expo-google-fonts/poppins";
import { Audio } from "expo-av";
import { useRouter } from "expo-router";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Animated,
	Image,
	Platform,
	Pressable,
	StyleSheet,
	Text,
	useWindowDimensions,
	View,
} from "react-native";
import { GameContext } from "../context/GameContext";
import { CardType } from "../types/Card";
import {
	clearWherePickSession,
	loadWherePickSession,
} from "../utils/wherePickStorage";

const HIGH_RARE_RARITIES = new Set<CardType["rarity"]>([
	"illustrationRare",
	"specialIllustrationRare",
	"hyperRare",
]);

export default function WonderMissPlay() {
	const router = useRouter();
	const { addCards } = useContext(GameContext);
	const [fontsLoaded] = useFonts({
		Poppins_400Regular,
		Poppins_600SemiBold,
		Poppins_700Bold,
	});
	const { width } = useWindowDimensions();
	const isCompact = width < 380;

	const [cards, setCards] = useState<CardType[]>([]);
	const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
	const [isHighRareSession, setIsHighRareSession] = useState(false);
	const [loading, setLoading] = useState(true);
	const [shuffling, setShuffling] = useState(true);
	const [claimed, setClaimed] = useState(false);
	const [revealedCards, setRevealedCards] = useState<Set<string>>(new Set());
	const [revealing, setRevealing] = useState(false);

	const shuffleAnim = useRef(new Animated.Value(0)).current;
	const wonderMissSoundRef = useRef<Audio.Sound | null>(null);

	const runShuffleAnimation = useCallback(
		(sessionCards: CardType[]) => {
			let count = 0;
			const interval = setInterval(() => {
				setCards((prev) => [...prev].sort(() => Math.random() - 0.5));
				count += 1;

				Animated.sequence([
					Animated.timing(shuffleAnim, {
						toValue: 1,
						duration: 80,
						useNativeDriver: true,
					}),
					Animated.timing(shuffleAnim, {
						toValue: 0,
						duration: 80,
						useNativeDriver: true,
					}),
				]).start();

				if (count >= 10) {
					clearInterval(interval);
					setCards([...sessionCards].sort(() => Math.random() - 0.5));
					setShuffling(false);
				}
			}, 150);
		},
		[shuffleAnim],
	);

	const init = useCallback(async () => {
		const session = await loadWherePickSession();
		if (!session) {
			Alert.alert("No Session", "Please start WonderMiss again.");
			router.replace("/(tabs)/wondermiss");
			return;
		}

		setCards(session.cards);
		setIsHighRareSession(session.isHighRareSession);
		setLoading(false);
		runShuffleAnimation(session.cards);
	}, [router, runShuffleAnimation]);

	useEffect(() => {
		init();
	}, [init]);

	useEffect(() => {
		let active = true;

		void (async () => {
			try {
				await Audio.setAudioModeAsync({
					playsInSilentModeIOS: true,
					staysActiveInBackground: false,
				});
				const { sound } = await Audio.Sound.createAsync(
					require("../assets/sounds/wondermiss-fallback.wav"),
				);

				if (active) {
					wonderMissSoundRef.current = sound;
				}
			} catch {
				// Ignore sound loading failures.
			}
		})();

		return () => {
			active = false;
			void wonderMissSoundRef.current?.unloadAsync();
			wonderMissSoundRef.current = null;
		};
	}, []);

	const isHighRareCard = (card: CardType) =>
		HIGH_RARE_RARITIES.has(card.rarity);

	const playWonderMissSound = async () => {
		const sound = wonderMissSoundRef.current;

		if (!sound) {
			return;
		}

		try {
			await sound.stopAsync();
			await sound.setPositionAsync(0);
			await sound.setVolumeAsync(0);
			await sound.playAsync();

			for (let step = 1; step <= 4; step += 1) {
				await sound.setVolumeAsync(step / 4);
				await new Promise((resolve) => setTimeout(resolve, 35));
			}

			await new Promise((resolve) => setTimeout(resolve, 140));

			for (let step = 3; step >= 0; step -= 1) {
				await sound.setVolumeAsync(step / 4);
				await new Promise((resolve) => setTimeout(resolve, 35));
			}
		} catch {
			// Ignore playback failures.
		}
	};

	const chooseCard = async (card: CardType) => {
		if (shuffling || selectedCard || revealing) return;

		setSelectedCard(card);
		setRevealing(true);
		await revealCardsSequentially(card);
	};

	const revealCardsSequentially = async (selectedCard: CardType) => {
		const otherCards = cards.filter((c) => c.id !== selectedCard.id);
		const shuffledOthers = [...otherCards].sort(() => Math.random() - 0.5);

		for (const card of shuffledOthers) {
			await new Promise((resolve) => setTimeout(resolve, 700));
			setRevealedCards((prev) => new Set(prev).add(card.id));
		}

		await new Promise((resolve) => setTimeout(resolve, 700));
		setRevealedCards((prev) => new Set(prev).add(selectedCard.id));

		if (!isHighRareCard(selectedCard)) {
			void playWonderMissSound();
		}

		if (!claimed) {
			addCards([selectedCard]);
			setClaimed(true);
			await clearWherePickSession();
		}

		setRevealing(false);
	};

	const backToWonderMiss = () => {
		router.replace("/(tabs)/wondermiss");
	};

	const translateX = shuffleAnim.interpolate({
		inputRange: [0, 1],
		outputRange: [0, 8],
	});

	if (!fontsLoaded || loading) {
		return (
			<View style={styles.center}>
				<ActivityIndicator size="large" color="#2563eb" />
				<Text style={styles.loadingText}>Preparing WonderMiss...</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<View style={styles.heroCard}>
				<Text style={[styles.title, isCompact && styles.compactTitle]}>
					WonderMiss
				</Text>
				<Text style={[styles.subtitle, isCompact && styles.compactSubtitle]}>
					{shuffling
						? "Shuffling cards..."
						: revealing
							? "Revealing cards..."
							: selectedCard
								? "All cards revealed!"
								: "Choose one card to reveal."}
				</Text>
				{isHighRareSession && (
					<View style={styles.sessionBadge}>
						<Text style={styles.sessionBadgeText}>
							Special high-rare session
						</Text>
					</View>
				)}
			</View>

			<Animated.View style={[styles.cardGrid, { transform: [{ translateX }] }]}>
				{cards.map((card, index) => {
					const isSelected = selectedCard?.id === card.id;
					const isRevealed = revealedCards.has(card.id);

					return (
						<Pressable
							key={`${card.id}-${index}`}
							style={[
								styles.cardBox,
								isCompact && styles.compactCardBox,
								isSelected && isRevealed && styles.selectedBox,
								selectedCard &&
									!isSelected &&
									isRevealed &&
									styles.unselectedBox,
							]}
							onPress={() => chooseCard(card)}
							disabled={shuffling || !!selectedCard || revealing}
						>
							{isRevealed ? (
								<View style={styles.revealedCardWrap}>
									<Image
										source={{ uri: card.image }}
										style={styles.cardImage}
										resizeMode="cover"
									/>
									{isSelected && (
										<View style={styles.selectedLabel}>
											<Text style={styles.selectedLabelText}>Your pick</Text>
										</View>
									)}
								</View>
							) : (
								<Image
									source={require("../assets/images/card-back.png")}
									style={styles.cardImage}
									resizeMode="cover"
								/>
							)}
						</Pressable>
					);
				})}
			</Animated.View>

			{selectedCard && !revealing && (
				<View style={styles.resultBox}>
					<Text style={styles.resultTitle}>You got:</Text>
					<Text style={styles.cardName}>{selectedCard.name}</Text>
					<Text style={styles.rarity}>{formatRarity(selectedCard.rarity)}</Text>
					<Pressable
						style={[styles.doneButton, isCompact && styles.compactDoneButton]}
						onPress={backToWonderMiss}
					>
						<Text style={styles.doneButtonText}>End WonderMiss</Text>
					</Pressable>
				</View>
			)}
		</View>
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

const ACCENT_FONT_FAMILY = Platform.select({
	android: "sans-serif",
	ios: "System",
	default: "sans-serif",
});

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f3f6fb",
		paddingHorizontal: 18,
		paddingTop: 28,
		paddingBottom: 24,
		alignItems: "center",
	},
	center: {
		flex: 1,
		backgroundColor: "#f3f6fb",
		alignItems: "center",
		justifyContent: "center",
	},
	loadingText: {
		marginTop: 12,
		fontSize: 15,
		fontFamily: FONT.regular,
		color: "#475569",
	},
	heroCard: {
		width: "100%",
		backgroundColor: "#0f172a",
		borderRadius: 28,
		padding: 20,
		shadowColor: "#0f172a",
		shadowOpacity: 0.14,
		shadowRadius: 18,
		shadowOffset: { width: 0, height: 12 },
		elevation: 8,
	},
	title: {
		fontSize: 28,
		fontFamily: FONT.bold,
		color: "#ffffff",
	},
	compactTitle: {
		fontSize: 24,
	},
	subtitle: {
		marginTop: 8,
		fontSize: 15,
		fontFamily: FONT.semiBold,
		color: "#cbd5e1",
	},
	compactSubtitle: {
		fontSize: 14,
	},
	sessionBadge: {
		marginTop: 14,
		alignSelf: "flex-start",
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 999,
		backgroundColor: "rgba(59,130,246,0.18)",
	},
	sessionBadgeText: {
		fontSize: 12,
		fontFamily: FONT.bold,
		color: "#ffffff",
	},
	cardGrid: {
		width: "100%",
		maxWidth: 460,
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
		marginTop: 20,
	},
	cardBox: {
		width: "31.5%",
		aspectRatio: 0.72,
		backgroundColor: "#ffffff",
		borderRadius: 22,
		overflow: "hidden",
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 2,
		borderColor: "transparent",
		shadowColor: "#0f172a",
		shadowOpacity: 0.08,
		shadowRadius: 14,
		shadowOffset: { width: 0, height: 10 },
		elevation: 5,
		marginBottom: 12,
	},
	compactCardBox: {
		width: "48%",
	},
	selectedBox: {
		borderColor: "#f59e0b",
	},
	unselectedBox: {
		opacity: 0.7,
	},
	revealedCardWrap: {
		width: "100%",
		height: "100%",
	},
	cardImage: {
		width: "100%",
		height: "100%",
	},
	selectedLabel: {
		position: "absolute",
		bottom: 10,
		left: 10,
		right: 10,
		paddingVertical: 4,
		paddingHorizontal: 8,
		borderRadius: 999,
		backgroundColor: "rgba(15,23,42,0.85)",
	},
	selectedLabelText: {
		fontSize: 10,
		fontFamily: FONT.bold,
		color: "#ffffff",
	},
	resultBox: {
		marginTop: 24,
		width: "100%",
		backgroundColor: "#ffffff",
		borderRadius: 24,
		padding: 20,
		alignItems: "center",
		shadowColor: "#0f172a",
		shadowOpacity: 0.08,
		shadowRadius: 16,
		shadowOffset: { width: 0, height: 10 },
		elevation: 5,
	},
	resultTitle: {
		fontSize: 13,
		color: "#475569",
		fontFamily: FONT.regular,
	},
	cardName: {
		marginTop: 8,
		fontSize: 22,
		fontFamily: ACCENT_FONT_FAMILY,
		color: "#0f172a",
		textAlign: "center",
	},
	rarity: {
		marginTop: 6,
		fontSize: 14,
		fontFamily: FONT.semiBold,
		color: "#2563eb",
	},
	doneButton: {
		marginTop: 18,
		minWidth: 220,
		backgroundColor: "#2563eb",
		paddingVertical: 14,
		paddingHorizontal: 30,
		borderRadius: 999,
		alignItems: "center",
	},
	compactDoneButton: {
		alignSelf: "stretch",
		minWidth: 0,
		width: "100%",
	},
	doneButtonText: {
		color: "#ffffff",
		fontSize: 16,
		fontFamily: FONT.bold,
	},
});
