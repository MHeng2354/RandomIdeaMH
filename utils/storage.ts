import AsyncStorage from "@react-native-async-storage/async-storage";
import { CardType } from "../types/Card";

export type StoredUser = {
	displayName: string;
	email: string;
	password: string;
};

export const saveCollection = async (collection: CardType[]) => {
	await AsyncStorage.setItem("collection", JSON.stringify(collection));
};

export const loadCollection = async (): Promise<CardType[]> => {
	const data = await AsyncStorage.getItem("collection");
	return data ? JSON.parse(data) : [];
};

export const saveUser = async (user: StoredUser | null) => {
	if (!user) {
		await AsyncStorage.removeItem("user");
		return;
	}

	await AsyncStorage.setItem("user", JSON.stringify(user));
};

export const loadUser = async (): Promise<StoredUser | null> => {
	const data = await AsyncStorage.getItem("user");
	return data ? JSON.parse(data) : null;
};
