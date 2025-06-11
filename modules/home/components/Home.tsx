import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { socket } from "@/common/lib/socket";
import { useModal } from "@/common/recoil/modal";
import { useSetRoomId } from "@/common/recoil/room";
import NotFoundModal from "../modals/NotFound";

const Home = () => {
  const { openModal } = useModal();
  const setAtomRoomId = useSetRoomId();
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const router = useRouter();

  useEffect(() => {
    document.body.style.backgroundColor = "black"; // fallback
  }, []);

  useEffect(() => {
    socket.on("created", (roomIdFromServer) => {
      setAtomRoomId(roomIdFromServer);
      router.push(roomIdFromServer);
    });

    const handleJoinedRoom = (roomIdFromServer: string, failed?: boolean) => {
      if (!failed) {
        setAtomRoomId(roomIdFromServer);
        router.push(roomIdFromServer);
      } else {
        openModal(<NotFoundModal id={roomId} />);
      }
    };

    socket.on("joined", handleJoinedRoom);
    return () => {
      socket.off("created");
      socket.off("joined", handleJoinedRoom);
    };
  }, [openModal, roomId, router, setAtomRoomId]);

  useEffect(() => {
    socket.emit("leave_room");
    setAtomRoomId("");
  }, [setAtomRoomId]);

  const handleCreateRoom = () => {
    socket.emit("create_room", username);
  };

  const handleJoinRoom = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (roomId) socket.emit("join_room", roomId, username);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-black via-blue-950 to-black animate-gradient-xy overflow-hidden relative">
      <div className="absolute inset-0 z-0 opacity-30 bg-[radial-gradient(#00e0ff_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="z-10 backdrop-blur-md shadow-[0_0_30px_rgba(0,255,255,0.2)] border border-white/10 rounded-3xl max-w-md w-full p-10 text-white bg-white/5 animate-float">
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold text-cyan-400 drop-shadow-md tracking-tight">
            SketchSync
          </h1>
          <p className="text-gray-300 text-sm">
            Real-time collaborative whiteboard
          </p>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="text-sm block mb-1 text-cyan-200 font-semibold">
              Your Name
            </label>
            <input
              className="w-full px-4 py-2 bg-transparent border border-cyan-400/40 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-inner placeholder:text-gray-400"
              placeholder="e.g. Alex"
              value={username}
              onChange={(e) => setUsername(e.target.value.slice(0, 15))}
            />
          </div>

          <form onSubmit={handleJoinRoom} className="space-y-3">
            <div>
              <label className="text-sm block mb-1 text-cyan-200 font-semibold">
                Room ID
              </label>
              <input
                className="w-full px-4 py-2 bg-transparent border border-cyan-400/40 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-inner placeholder:text-gray-400"
                placeholder="e.g. abc-123"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-2 rounded-lg shadow-[0_0_12px_#06b6d4] transition"
            >
              Join Room
            </button>
          </form>

          <div className="flex items-center text-sm text-gray-400 gap-2 mt-2">
            <div className="h-px flex-1 bg-gray-600" />
            <span>or</span>
            <div className="h-px flex-1 bg-gray-600" />
          </div>

          <div className="text-center">
            <h3 className="text-sm text-gray-300 mb-2">Create New Room</h3>
            <button
              onClick={handleCreateRoom}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg shadow-[0_0_12px_#22c55e] transition"
            >
              Create Room
            </button>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes gradient-xy {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient-xy {
          background-size: 200% 200%;
          animation: gradient-xy 10s ease infinite;
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-6px);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Home;
