import {
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { useRouter } from "expo-router";
import { useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { GameContext } from "../context/GameContext";
import { CardType } from "../types/Card";
import {
  clearWherePickSession,
  loadWherePickSession,
} from "../utils/wherePickStorage";

export default function WherePickPlay() {
  const router = useRouter();
  const { addCards } = useContext(GameContext);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const [cards, setCards] = useState<CardType[]>([]);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [isHighRareSession, setIsHighRareSession] = useState(false);
  const [loading, setLoading] = useState(true);
  const [shuffling, setShuffling] = useState(true);
  const [claimed, setClaimed] = useState(false);

  const shuffleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const session = await loadWherePickSession();

    if (!session) {
      Alert.alert("No Session", "Please start WherePick again.");
      router.replace("/(tabs)/wondermiss");
      return;
    }

    setCards(session.cards);
    setIsHighRareSession(session.isHighRareSession);
    setLoading(false);
    runShuffleAnimation(session.cards);
  };

  const runShuffleAnimation = (sessionCards: CardType[]) => {
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
  };

  const chooseCard = async (card: CardType) => {
    if (shuffling || selectedCard) return;

    setSelectedCard(card);

    if (!claimed) {
      addCards([card]);
      setClaimed(true);
      await clearWherePickSession();
    }
  };

  const backToWherePick = () => {
    router.replace("/(tabs)/wondermiss");
  };

  const translateX = shuffleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 8],
  });

  if (!fontsLoaded || loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Preparing WherePick...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>WherePick</Text>

      {isHighRareSession && (
        <Text style={styles.specialText}>Special High Rare Session!</Text>
      )}

      <Text style={styles.subtitle}>
        {shuffling
          ? "Shuffling cards..."
          : selectedCard
          ? "All cards revealed!"
          : "Choose one card"}
      </Text>

      <Animated.View style={[styles.cardGrid, { transform: [{ translateX }] }]}>
        {cards.map((card, index) => {
          const isSelected = selectedCard?.id === card.id;
          const shouldReveal = !!selectedCard;

          return (
            <Pressable
              key={`${card.id}-${index}`}
              style={[
                styles.cardBox,
                isSelected && styles.selectedBox,
                selectedCard && !isSelected && styles.unselectedBox,
              ]}
              onPress={() => chooseCard(card)}
              disabled={shuffling || !!selectedCard}
            >
              {shouldReveal ? (
                <>
                  <Image
                    source={{ uri: card.image }}
                    style={styles.cardImage}
                    resizeMode="cover"
                  />
                  {isSelected && <Text style={styles.selectedLabel}>Your Pick</Text>}
                </>
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

      {selectedCard && (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>You got:</Text>
          <Text style={styles.cardName}>{selectedCard.name}</Text>
          <Text style={styles.rarity}>{formatRarity(selectedCard.rarity)}</Text>

          <Pressable style={styles.doneButton} onPress={backToWherePick}>
            <Text style={styles.doneButtonText}>End WherePick</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: FONT.regular,
  },
  title: {
    fontSize: 30,
    fontFamily: FONT.bold,
    marginBottom: 8,
  },
  specialText: {
    backgroundColor: "#b8860b",
    color: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    fontSize: 13,
    fontFamily: FONT.bold,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 17,
    fontFamily: FONT.semiBold,
    color: "#555",
    marginBottom: 20,
  },
  cardGrid: {
    width: "100%",
    maxWidth: 420,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  cardBox: {
    width: "29%",
    aspectRatio: 0.72,
    backgroundColor: "#f4f4f4",
    borderRadius: 14,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedBox: {
    borderColor: "#ffcc00",
    borderWidth: 4,
  },
  unselectedBox: {
    opacity: 0.75,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  selectedLabel: {
    position: "absolute",
    bottom: 6,
    backgroundColor: "#e3350d",
    color: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    fontSize: 10,
    fontFamily: FONT.bold,
    overflow: "hidden",
  },
  resultBox: {
    marginTop: 24,
    width: "100%",
    alignItems: "center",
  },
  resultTitle: {
    fontSize: 15,
    color: "#666",
    fontFamily: FONT.regular,
  },
  cardName: {
    marginTop: 4,
    fontSize: 20,
    fontFamily: FONT.bold,
    textAlign: "center",
  },
  rarity: {
    marginTop: 4,
    fontSize: 14,
    color: "#666",
    fontFamily: FONT.semiBold,
    textAlign: "center",
  },
  doneButton: {
    marginTop: 18,
    minWidth: 220,
    backgroundColor: "#e3350d",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 999,
    alignItems: "center",
  },
  doneButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: FONT.bold,
  },
});