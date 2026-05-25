import {
	Poppins_400Regular,
	Poppins_600SemiBold,
	Poppins_700Bold,
	useFonts,
} from "@expo-google-fonts/poppins";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	Animated,
	Dimensions,
	Image,
	PanResponder,
	Platform,
	Pressable,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { CardType } from "../types/Card";

type Props = {
	cards: CardType[];
	isGodPack: boolean;
	packLabel: string;
	onFinish: () => void;
	onSkip: () => void;
};

const { width } = Dimensions.get("window");
const SWIPE_DISTANCE = 20;

export default function CardRevealSwiper({
	cards,
	isGodPack,
	packLabel,
	onFinish,
	onSkip,
}: Props) {
	const [fontsLoaded] = useFonts({
		Poppins_400Regular,
		Poppins_600SemiBold,
		Poppins_700Bold,
	});

	const [index, setIndex] = useState(0);
	const dragOffset = useRef(new Animated.Value(0)).current;
	const goNextRef = useRef<() => void>(() => {});

	const currentCard = cards[index];
	const isLastCard = index === cards.length - 1;
	const isLastCardRef = useRef(isLastCard);

	useEffect(() => {
		setIndex(0);
	}, [cards]);

	useEffect(() => {
		dragOffset.setValue(0);
	}, [index, dragOffset]);

	useEffect(() => {
		isLastCardRef.current = isLastCard;
	}, [isLastCard]);

	const goNext = useCallback(() => {
		if (isLastCardRef.current) {
			onFinish();
			return;
		}

		dragOffset.stopAnimation();

		Animated.timing(dragOffset, {
			toValue: -width,
			duration: 180,
			useNativeDriver: true,
		}).start(() => {
			dragOffset.setValue(0);
			setIndex((prev) => prev + 1);
		});
	}, [dragOffset, onFinish]);

	useEffect(() => {
		goNextRef.current = goNext;
	}, [goNext]);

	const panResponder = useRef(
		PanResponder.create({
			onStartShouldSetPanResponder: () => true,
			onMoveShouldSetPanResponder: () => true,
			onMoveShouldSetPanResponderCapture: () => true,
			onShouldBlockNativeResponder: () => false,
			onPanResponderMove: (_, gesture) => {
				dragOffset.setValue(gesture.dx);
			},
			onPanResponderRelease: (_, gesture) => {
				if (Math.abs(gesture.dx) > SWIPE_DISTANCE || isLastCardRef.current) {
					goNextRef.current();
					return;
				}

				Animated.spring(dragOffset, {
					toValue: 0,
					friction: 6,
					tension: 80,
					useNativeDriver: true,
				}).start();
			},
		}),
	).current;

	const rotate = dragOffset.interpolate({
		inputRange: [-width, 0, width],
		outputRange: ["-12deg", "0deg", "12deg"],
	});

	if (!fontsLoaded || !currentCard) {
		return null;
	}

	return (
		<View style={styles.container}>
			<Text style={[styles.title, isGodPack && styles.godTitle]}>
				{isGodPack ? "GOD PACK!" : "Card Reveal"}
			</Text>

			<Text style={styles.packLabel}>{packLabel}</Text>

			<Text style={styles.counter}>
				Card {index + 1} / {cards.length}
			</Text>

			<Animated.View
				{...panResponder.panHandlers}
				style={[
					styles.cardWrapper,
					{
						transform: [{ translateX: dragOffset }, { rotate }],
					},
				]}
			>
				<Image
					source={{ uri: currentCard.image }}
					style={styles.image}
					resizeMode="contain"
				/>

				<View style={styles.infoBox}>
					<Text style={styles.cardName}>{currentCard.name}</Text>
					<Text style={styles.rarity}>{formatRarity(currentCard.rarity)}</Text>
					{currentCard.isShiny && (
						<Text style={styles.shinyBadge}>
							{getShinyRarityLabel(currentCard.shinyRarity)}
						</Text>
					)}
				</View>
			</Animated.View>

			<Text style={styles.hint}>
				{isLastCard ? "Swipe or tap Finish" : "Swipe card to reveal next"}
			</Text>

			<View style={styles.buttonRow}>
				<Pressable style={styles.skipButton} onPress={onSkip}>
					<Text style={styles.skipButtonText}>Skip Reveal</Text>
				</Pressable>

				<Pressable style={styles.nextButton} onPress={goNextRef.current}>
					<Text style={styles.nextButtonText}>
						{isLastCard ? "Finish" : "Reveal Next"}
					</Text>
				</Pressable>
			</View>
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
		marginTop: 28,
		width: "100%",
		alignItems: "center",
		paddingHorizontal: 4,
	},
	title: {
		fontSize: 28,
		fontFamily: FONT.bold,
		marginBottom: 6,
		color: "#0f172a",
	},
	godTitle: {
		color: "#b8860b",
		fontSize: 30,
	},
	packLabel: {
		fontSize: 14,
		fontFamily: FONT.semiBold,
		color: "#0f172a",
		marginBottom: 12,
		paddingHorizontal: 14,
		paddingVertical: 6,
		borderRadius: 999,
		backgroundColor: "rgba(59,130,246,0.08)",
	},
	counter: {
		fontSize: 14,
		fontFamily: FONT.semiBold,
		color: "#64748b",
		marginBottom: 16,
		paddingHorizontal: 14,
		paddingVertical: 6,
		borderRadius: 999,
		backgroundColor: "rgba(59,130,246,0.08)",
	},
	cardWrapper: {
		width: "83%",
		backgroundColor: "#ffffff",
		borderRadius: 28,
		padding: 16,
		alignItems: "center",
		shadowColor: "#0f172a",
		shadowOpacity: 0.14,
		shadowRadius: 18,
		shadowOffset: { width: 0, height: 12 },
		elevation: 10,
		borderWidth: 1,
		borderColor: "rgba(59,130,246,0.12)",
	},
	image: {
		width: "100%",
		aspectRatio: 0.72,
		borderRadius: 20,
		backgroundColor: "#eef3ff",
	},
	infoBox: {
		width: "100%",
		marginTop: 14,
		alignItems: "center",
	},
	cardName: {
		fontSize: 20,
		fontFamily: ACCENT_FONT_FAMILY,
		textAlign: "center",
		color: "#0f172a",
	},
	rarity: {
		marginTop: 6,
		fontSize: 14,
		color: "#475569",
		fontFamily: FONT.semiBold,
	},
	shinyBadge: {
		marginTop: 12,
		paddingHorizontal: 12,
		paddingVertical: 7,
		borderRadius: 999,
		backgroundColor: "#b8860b",
	},
	hint: {
		marginTop: 16,
		fontSize: 14,
		color: "#64748b",
		fontFamily: FONT.regular,
	},
	buttonRow: {
		flexDirection: "row",
		gap: 12,
		marginTop: 16,
		width: "83%",
		justifyContent: "center",
		alignItems: "center",
		alignSelf: "center",
	},
	nextButton: {
		flex: 1,
		minWidth: 0,
		backgroundColor: "#0f73ff",
		paddingVertical: 14,
		paddingHorizontal: 18,
		borderRadius: 999,
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#0f73ff",
		shadowOpacity: 0.24,
		shadowRadius: 14,
		shadowOffset: { width: 0, height: 8 },
		elevation: 8,
	},
	nextButtonText: {
		color: "#fff",
		fontSize: 16,
		fontFamily: FONT.bold,
		textAlign: "center",
	},
	skipButton: {
		flex: 1,
		minWidth: 0,
		backgroundColor: "#ffffff",
		paddingVertical: 14,
		paddingHorizontal: 18,
		borderRadius: 999,
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 1,
		borderColor: "rgba(15,23,42,0.12)",
	},
	skipButtonText: {
		color: "#0f172a",
		fontSize: 14,
		fontFamily: FONT.bold,
		textAlign: "center",
	},
});
