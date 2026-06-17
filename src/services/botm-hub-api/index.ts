import {
  type IVerifyPlayerResponse,
  type IFetchMatchResponse,
} from "@/types/botm-hub-api";

const BASE_URL = "https://botm-hub-api.vercel.app";

export async function verifyOsuPlayer(
  player: string | number,
  type: "username" | "id" = "username"
): Promise<IVerifyPlayerResponse> {
  const response = await fetch(
    `${BASE_URL}/api/verify-player?player=${encodeURIComponent(player)}&type=${type}`
  );

  if (!response.ok) {
    throw new Error("Ошибка при соединении с сервером проверки");
  }

  return response.json();
}

export async function fetchOsuMatch(
  matchId: number | string
): Promise<IFetchMatchResponse> {
  const response = await fetch(`${BASE_URL}/api/match?id=${matchId}`);

  if (!response.ok) {
    let errorText = `Ошибка сервера: ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData.error) errorText = errorData.error;
    } catch (error) {
      console.error("For some reason botm-hub-api returned not JSON:", error);
    }

    if (response.status === 404 || errorText.includes("404")) {
      throw new Error("Лобби с таким ID не существует!");
    }
    if (response.status === 401 || errorText.includes("401")) {
      throw new Error("Это приватное лобби! API osu! не даёт к нему доступ!");
    }
    throw new Error(errorText);
  }

  return response.json();
}
