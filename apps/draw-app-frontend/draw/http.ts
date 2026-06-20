import { HTTP_BACKEND } from "@/config";
import axios from "axios";

export async function getExistingShapes(roomId: string) {
  try {
    const res = await axios.get(
      `${HTTP_BACKEND}/chats/${roomId}`
    );

    const messages = res.data.messages ?? [];

    const shapes = messages
      .map((msg: { message: string }) => {
        try {
          const parsed = JSON.parse(msg.message);
          return parsed.shape;
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    return shapes;
  } catch (error) {
    console.error("Failed to fetch shapes:", error);
    return [];
  }
}

