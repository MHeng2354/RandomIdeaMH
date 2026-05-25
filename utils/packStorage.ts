import AsyncStorage from "@react-native-async-storage/async-storage";

const LAST_PACK_KEY = "last_pulled_pack_id";
const GOD_PACK_PULL_COUNT_KEY = "god_pack_pull_count";
const GOD_MODE_ENABLED_KEY = "god_mode_enabled";

export async function saveLastPulledPack(packId: string) {
	await AsyncStorage.setItem(LAST_PACK_KEY, packId);
}

export async function loadLastPulledPack() {
	return await AsyncStorage.getItem(LAST_PACK_KEY);
}

export async function saveGodPackPullCount(pullCount: number) {
	const normalizedPullCount = Math.max(Math.floor(Number(pullCount) || 0), 0);

	await AsyncStorage.setItem(
		GOD_PACK_PULL_COUNT_KEY,
		String(normalizedPullCount),
	);
}

export async function loadGodPackPullCount() {
	const storedValue = await AsyncStorage.getItem(GOD_PACK_PULL_COUNT_KEY);

	if (!storedValue) {
		return 0;
	}

	const parsedValue = Number(storedValue);

	if (!Number.isFinite(parsedValue)) {
		return 0;
	}

	return Math.max(Math.floor(parsedValue), 0);
}

export async function saveGodModeEnabled(enabled: boolean) {
	await AsyncStorage.setItem(GOD_MODE_ENABLED_KEY, String(enabled));
}

export async function loadGodModeEnabled() {
	const storedValue = await AsyncStorage.getItem(GOD_MODE_ENABLED_KEY);

	if (!storedValue) {
		return false;
	}

	return storedValue === "true";
}
