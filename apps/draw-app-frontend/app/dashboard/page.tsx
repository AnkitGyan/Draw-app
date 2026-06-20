"use client";

import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { Plus, LogIn, LogOut } from "lucide-react";
import axios from "axios";
import { HTTP_BACKEND } from "@/config";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Dashboard() {
  const router = useRouter();

  const [createRoomName, setCreateRoomName] = useState("");
  const [joinRoomName, setJoinRoomName] = useState("");
  const [loading, setLoading] = useState(false);

  async function createRoom() {
    if (!createRoomName.trim()) return;

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      await axios.post(
        `${HTTP_BACKEND}/room`,
        {
          name: createRoomName,
        },
        {
          headers: {
            Authorization: token,
          },
        }
      );

      router.push(`/canvas/${createRoomName}`);
    } catch (e: any) {
      alert(
        e?.response?.data?.message ||
          "Unable to create room"
      );
    } finally {
      setLoading(false);
    }
  }

  async function joinRoom() {
    if (!joinRoomName.trim()) return;

    try {
      const res = await axios.get(
        `${HTTP_BACKEND}/room/${joinRoomName}`
      );

      if (res.data.roomId) {
        router.push(`/canvas/${joinRoomName}`);
      }
    } catch (e: any) {
      alert(
        e?.response?.data?.message ||
          "Room not found"
      );
    }
  }

  function logout() {
    localStorage.removeItem("token");
    router.push("/signin");
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-5xl">

        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">
              Dashboard
            </h1>

            <p className="mt-2 text-muted-foreground">
              Create a new room or join an existing one.
            </p>
          </div>

          <Button variant="outline" onClick={logout} size="lg">
            Logout
            <LogOut className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">

          {/* Create Room */}

          <Card className="p-8">
            <h2 className="text-2xl font-semibold">
              Create Room
            </h2>

            <p className="mt-2 text-muted-foreground">
              Start collaborating instantly.
            </p>

            <input
              value={createRoomName}
              onChange={(e) =>
                setCreateRoomName(e.target.value)
              }
              placeholder="Enter room name"
              className="mt-6 w-full rounded-lg border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
            />

            <Button
              variant="primary"
              className="mt-6 w-full"
              onClick={createRoom}
              size="lg"
            >
              Create Room
              <Plus className="ml-2 h-4 w-4" />
            </Button>
          </Card>

          {/* Join Room */}

          <Card className="p-8">
            <h2 className="text-2xl font-semibold">
              Join Room
            </h2>

            <p className="mt-2 text-muted-foreground">
              Join an existing collaboration room.
            </p>

            <input
              value={joinRoomName}
              onChange={(e) =>
                setJoinRoomName(e.target.value)
              }
              placeholder="Enter room name"
              className="mt-6 w-full rounded-lg border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
            />

            <Button
              variant="secondary"
              className="mt-6 w-full"
              onClick={joinRoom}
              size="lg"
            >
              Join Room
              <LogIn className="ml-2 h-4 w-4" />
            </Button>
          </Card>

        </div>
      </div>
    </div>
  );
}