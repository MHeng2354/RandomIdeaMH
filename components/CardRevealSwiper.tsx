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
	Pressable,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { CardType } from "../types/Card";

type Props = {
	cards: CardType[];
	isGodPack: boolean;
	onFinish: () => void;
};

const { width } = Dimensions.get("window");
const SWIPE_DISTANCE = 20;

export default function CardRevealSwiper({
	cards,
	isGodPack,
	onFinish,
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

			<Pressable style={styles.nextButton} onPress={goNextRef.current}>
				<Text style={styles.nextButtonText}>
					{isLastCard ? "Finish" : "Reveal Next"}
				</Text>
			</Pressable>
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

const styles = StyleSheet.create({
	container: {
		marginTop: 28,
		width: "100%",
		alignItems: "center",
	},
	title: {
		fontSize: 24,
		fontFamily: FONT.bold,
		marginBottom: 4,
	},
	godTitle: {
		color: "#b8860b",
		fontSize: 30,
	},
	counter: {
		fontSize: 14,
		fontFamily: FONT.semiBold,
		color: "#666",
		marginBottom: 16,
	},
	cardWrapper: {
		width: "82%",
		backgroundColor: "#ffffff",
		borderRadius: 24,
		padding: 14,
		alignItems: "center",
		shadowColor: "#000",
		shadowOpacity: 0.18,
		shadowRadius: 12,
		shadowOffset: { width: 0, height: 6 },
		elevation: 6,
	},
	image: {
		width: "100%",
		aspectRatio: 0.72,
		borderRadius: 16,
	},
	infoBox: {
		width: "100%",
		marginTop: 12,
		alignItems: "center",
	},
	cardName: {
		fontSize: 18,
		fontFamily: FONT.bold,
		textAlign: "center",
	},
	rarity: {
		marginTop: 4,
		fontSize: 14,
		color: "#555",
		fontFamily: FONT.semiBold,
	},
	shinyBadge: {
		marginTop: 6,
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 999,
		backgroundColor: "#ffd24d",
		color: "#663f00",
		fontSize: 12,
		fontFamily: FONT.bold,
	},
	hint: {
		marginTop: 18,
		fontSize: 13,
		color: "#777",
		fontFamily: FONT.regular,
	},
	nextButton: {
		marginTop: 14,
		minWidth: 210,
		backgroundColor: "#3761a8",
		paddingVertical: 14,
		paddingHorizontal: 28,
		borderRadius: 999,
		alignItems: "center",
	},
	nextButtonText: {
		color: "#fff",
		fontSize: 16,
		fontFamily: FONT.bold,
	},
});
