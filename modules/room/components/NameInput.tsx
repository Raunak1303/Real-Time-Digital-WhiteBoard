import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { socket } from "@/common/lib/socket";
import { useModal } from "@/common/recoil/modal";
import { useSetRoomId } from "@/common/recoil/room";
import NotFoundModal from "@/modules/home/modals/NotFound";

const NameInput = () => {
  const setRoomId = useSetRoomId();
  const { openModal } = useModal();

  const [name, setName] = useState("");
  const router = useRouter();
  const roomId = (router.query.roomId || "").toString();

  useEffect(() => {
    if (!roomId) return;

    socket.emit("check_room", roomId);

    socket.on("room_exists", (exists) => {
      if (!exists) router.push("/");
    });

    return () => {
      socket.off("room_exists");
    };
  }, [roomId, router]);

  useEffect(() => {
    const handleJoined = (roomIdFromServer: string, failed?: boolean) => {
      if (failed) {
        router.push("/");
        openModal(<NotFoundModal id={roomIdFromServer} />);
      } else {
        setRoomId(roomIdFromServer);
      }
    };

    socket.on("joined", handleJoined);
    return () => {
      socket.off("joined", handleJoined);
    };
  }, [openModal, router, setRoomId]);

  const handleJoinRoom = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    socket.emit("join_room", roomId, name);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-black via-blue-950 to-black animate-gradient-xy overflow-hidden relative">
      <div className="absolute inset-0 z-0 opacity-30 bg-[radial-gradient(#00e0ff_1px,transparent_1px)] bg-[size:40px_40px]" />

      <form
        onSubmit={handleJoinRoom}
        className="z-10 backdrop-blur-md shadow-[0_0_30px_rgba(0,255,255,0.2)] border border-white/10 rounded-3xl max-w-md w-full p-10 text-white bg-white/5 animate-float"
      >
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold text-cyan-400 drop-shadow-md tracking-tight">
            SketchSync
          </h1>
          <p className="text-gray-300 text-sm">
            Join Room: <span className="font-mono text-white">{roomId}</span>
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
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 15))}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-2 rounded-lg shadow-[0_0_12px_#06b6d4] transition"
          >
            Enter Room
          </button>
        </div>
      </form>

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

export default NameInput;
