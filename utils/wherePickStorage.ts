import AsyncStorage from "@react-native-async-storage/async-storage";
import { CardType } from "../types/Card";

const WHERE_PICK_SESSION_KEY = "where_pick_session";

export type WherePickSession = {
  cards: CardType[];
  isHighRareSession: boolean;
};

export async function saveWherePickSession(session: WherePickSession) {
  await AsyncStorage.setItem(WHERE_PICK_SESSION_KEY, JSON.stringify(session));
}

export async function loadWherePickSession() {
  const value = await AsyncStorage.getItem(WHERE_PICK_SESSION_KEY);

  if (!value) return null;

  return JSON.parse(value) as WherePickSession;
}

export async function clearWherePickSession() {
  await AsyncStorage.removeItem(WHERE_PICK_SESSION_KEY);
}