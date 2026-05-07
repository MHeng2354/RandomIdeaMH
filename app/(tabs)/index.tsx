import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useContext } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { GameContext } from "../../context/GameContext";

export default function HomeScreen() {
  const router = useRouter();
  const { ancestors, collection } = useContext(GameContext);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff4b2b" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroDecoration} />

          <View style={styles.heroTop}>
            <View style={styles.heroTextBox}>
              <Text style={styles.heroTitle}>Welcome back!</Text>
              <Text style={styles.heroSubtitle}>
                Your collection is shining brighter than ever.
              </Text>
              <Text style={styles.heroDescription}>
                Open packs, unlock shinies, and build the ultimate team.
              </Text>
            </View>

            <View style={styles.sparkleBadge}>
              <Ionicons name="sparkles" size={30} color="#ffd84d" />
            </View>
          </View>

          <View style={styles.featureBadge}>
            <Text style={styles.featureText}>
              Featured: Shiny pulls are on the rise
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Ancestors</Text>
              <Text style={styles.statValue}>{ancestors}</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Collection</Text>
              <Text style={styles.statValue}>{collection.length}</Text>
            </View>
          </View>
        </View>

        <View style={styles.featureRow}>
          <Pressable
            style={[styles.featureCard, styles.packCard]}
            onPress={() => router.push("/(tabs)/pack")}
          >
            <Ionicons name="file-tray-full" size={25} color="#fff" />
            <Text style={styles.featureCardTitle}>Packs</Text>
            <Text style={styles.featureCardText}>
              Open bundles, chase rares, and collect your favorites.
            </Text>
          </Pressable>

          <Pressable
            style={[styles.featureCard, styles.wonderCard]}
            onPress={() => router.push("/(tabs)/wondermiss")}
          >
            <Ionicons name="flash" size={26} color="#fff" />
            <Text style={styles.featureCardTitle}>WonderMiss</Text>
            <Text style={styles.featureCardText}>
              Take a chance on high-volatility pulls with big rewards.
            </Text>
          </Pressable>
        </View>

        <View style={styles.actionRow}>
          <Pressable
            style={styles.actionButton}
            onPress={() => router.push("/(tabs)/pack")}
          >
            <Text style={styles.actionButtonText}>Browse Packs</Text>
          </Pressable>

          <Pressable
            style={styles.actionButton}
            onPress={() => router.push("/(tabs)/collection")}
          >
            <Text style={styles.actionButtonText}>View Collection</Text>
          </Pressable>

          <Pressable
            style={styles.actionButton}
            onPress={() => router.push("/(tabs)/wondermiss")}
          >
            <Text style={styles.actionButtonText}>Try WonderMiss</Text>
          </Pressable>
        </View>

        <View style={styles.missionCard}>
          <Text style={styles.missionTitle}>Today’s mission</Text>
          <Text style={styles.missionText}>
            Open a shiny pack, grow your collection, and see if luck is on your
            side.
          </Text>

          <View style={styles.missionTagRow}>
            <View style={styles.missionTag}>
              <Text style={styles.missionTagText}>+0.2% shiny boost</Text>
            </View>

            <View style={styles.missionTag}>
              <Text style={styles.missionTagText}>Top pulls highlighted</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const FONT = {
  regular: "Poppins_400Regular",
  medium: "Poppins_500Medium",
  semiBold: "Poppins_600SemiBold",
  bold: "Poppins_700Bold",
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#eef4ff",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#eef4ff",
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 26,
  },
  heroCard: {
    width: "100%",
    backgroundColor: "#12265a",
    borderRadius: 28,
    padding: 26,
    overflow: "hidden",
  },
  heroDecoration: {
    position: "absolute",
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    top: -8,
    right: -10,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  heroTextBox: {
    flex: 1,
    paddingRight: 12,
  },
  heroTitle: {
    fontSize: 28,
    lineHeight: 36,
    color: "#fff",
    fontFamily: FONT.bold,
  },
  heroSubtitle: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 22,
    color: "#d9e3ff",
    fontFamily: FONT.regular,
  },
  heroDescription: {
    marginTop: 18,
    fontSize: 15,
    lineHeight: 24,
    color: "#aebdec",
    fontFamily: FONT.regular,
  },
  sparkleBadge: {
    width: 72,
    height: 72,
    borderRadius: 26,
    backgroundColor: "rgba(255, 255, 255, 0.11)",
    alignItems: "center",
    justifyContent: "center",
  },
  featureBadge: {
    marginTop: 24,
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.13)",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 16,
  },
  featureText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: FONT.bold,
  },
  statsRow: {
    flexDirection: "row",
    gap: 14,
    marginTop: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#354577",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 20,
  },
  statLabel: {
    fontSize: 13,
    color: "#aebdec",
    fontFamily: FONT.regular,
  },
  statValue: {
    marginTop: 10,
    fontSize: 31,
    color: "#fff",
    fontFamily: FONT.bold,
  },
  featureRow: {
    flexDirection: "row",
    gap: 14,
    marginTop: 20,
  },
  featureCard: {
    flex: 1,
    minHeight: 158,
    borderRadius: 20,
    padding: 18,
    justifyContent: "space-between",
  },
  packCard: {
    backgroundColor: "#ff815c",
  },
  wonderCard: {
    backgroundColor: "#4e84f5",
  },
  featureCardTitle: {
    marginTop: 12,
    fontSize: 18,
    color: "#fff",
    fontFamily: FONT.bold,
  },
  featureCardText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: "#fff",
    fontFamily: FONT.regular,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#ff4b2b",
    borderRadius: 15,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 13,
    textAlign: "center",
    fontFamily: FONT.bold,
  },
  missionCard: {
    marginTop: 20,
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 22,
  },
  missionTitle: {
    fontSize: 19,
    color: "#12265a",
    fontFamily: FONT.bold,
  },
  missionText: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 23,
    color: "#65708d",
    fontFamily: FONT.regular,
  },
  missionTagRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  missionTag: {
    flex: 1,
    backgroundColor: "#f4f7ff",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  missionTagText: {
    fontSize: 11,
    color: "#4260a8",
    fontFamily: FONT.bold,
  },
});