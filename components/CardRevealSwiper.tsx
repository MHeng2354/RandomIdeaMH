import {
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { useEffect, useRef, useState } from "react";
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
const SWIPE_DISTANCE = 90;

export default function CardRevealSwiper({ cards, isGodPack, onFinish }: Props) {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const [index, setIndex] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const currentCard = cards[index];
  const isLastCard = index === cards.length - 1;

  useEffect(() => {
    playEnterAnimation();
  }, [index]);

  const playEnterAnimation = () => {
    translateX.setValue(0);
    scale.setValue(0.9);
    opacity.setValue(0);

    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const goNext = () => {
    if (isLastCard) {
      onFinish();
      return;
    }

    Animated.parallel([
      Animated.timing(translateX, {
        toValue: -width,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIndex((prev) => prev + 1);
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => {
        return Math.abs(gesture.dx) > 10;
      },
      onPanResponderMove: (_, gesture) => {
        translateX.setValue(gesture.dx);
      },
      onPanResponderRelease: (_, gesture) => {
        if (Math.abs(gesture.dx) > SWIPE_DISTANCE) {
          goNext();
          return;
        }

        Animated.spring(translateX, {
          toValue: 0,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  const rotate = translateX.interpolate({
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
            opacity,
            transform: [{ translateX }, { rotate }, { scale }],
          },
        ]}
      >
        <Image source={{ uri: currentCard.image }} style={styles.image} resizeMode="contain" />

        <View style={styles.infoBox}>
          <Text style={styles.cardName}>{currentCard.name}</Text>
          <Text style={styles.rarity}>{formatRarity(currentCard.rarity)}</Text>
        </View>
      </Animated.View>

      <Text style={styles.hint}>
        {isLastCard ? "Swipe or tap Finish" : "Swipe card to reveal next"}
      </Text>

      <Pressable style={styles.nextButton} onPress={goNext}>
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