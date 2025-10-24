import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { User } from '../db/models/User.js';

interface PlayerData {
  id: string;
  username: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number };
  worldId: string;
}

interface BlockUpdate {
  position: { x: number; y: number; z: number };
  blockId: number;
}

// Store players in each world room
const worldPlayers = new Map<string, Map<string, PlayerData>>();

export function initializeMultiplayer(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'blockverse-secret-key') as any;
      socket.data.userId = decoded.userId;

      // Fetch user from database to get characterName
      const user = await User.findById(decoded.userId).select('characterName');
      if (user && user.characterName) {
        socket.data.username = user.characterName;
      } else {
        socket.data.username = 'Player';
      }

      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🎮 Player connected: ${socket.data.username} (${socket.id})`);

    // Join world
    socket.on('join-world', (data: { worldId: string; username: string }) => {
      const { worldId, username } = data;

      // Leave previous world if any
      const rooms = Array.from(socket.rooms);
      rooms.forEach(room => {
        if (room !== socket.id && room.startsWith('world-')) {
          socket.leave(room);
          removePlayerFromWorld(room, socket.id);
        }
      });

      // Join new world room
      const roomName = `world-${worldId}`;
      socket.join(roomName);

      // Initialize world player list if not exists
      if (!worldPlayers.has(roomName)) {
        worldPlayers.set(roomName, new Map());
      }

      // Add player to world
      const playerData: PlayerData = {
        id: socket.id,
        username: username || socket.data.username,
        position: { x: 32, y: 16, z: 32 }, // Default spawn position
        rotation: { x: 0, y: 0 },
        worldId
      };

      worldPlayers.get(roomName)!.set(socket.id, playerData);

      // Send existing players to newly joined player
      const existingPlayers = Array.from(worldPlayers.get(roomName)!.values())
        .filter(p => p.id !== socket.id);

      socket.emit('existing-players', existingPlayers);

      // Notify other players about new player
      socket.to(roomName).emit('player-joined', playerData);

      console.log(`👥 ${username} joined world: ${worldId}`);
    });

    // Player movement
    socket.on('player-move', (data: { position: { x: number; y: number; z: number }; rotation: { x: number; y: number }; worldId: string }) => {
      const roomName = `world-${data.worldId}`;
      const world = worldPlayers.get(roomName);

      if (world && world.has(socket.id)) {
        const player = world.get(socket.id)!;
        player.position = data.position;
        player.rotation = data.rotation;

        // Broadcast to other players in same world
        socket.to(roomName).emit('player-moved', {
          id: socket.id,
          position: data.position,
          rotation: data.rotation
        });
      }
    });

    // Block placed
    socket.on('block-placed', (data: BlockUpdate & { worldId: string }) => {
      const roomName = `world-${data.worldId}`;

      // Broadcast to other players in same world
      socket.to(roomName).emit('block-placed', {
        position: data.position,
        blockId: data.blockId,
        playerId: socket.id
      });
    });

    // Block destroyed
    socket.on('block-destroyed', (data: { position: { x: number; y: number; z: number }; worldId: string }) => {
      const roomName = `world-${data.worldId}`;

      // Broadcast to other players in same world
      socket.to(roomName).emit('block-destroyed', {
        position: data.position,
        playerId: socket.id
      });
    });

    // Player disconnect
    socket.on('disconnect', () => {
      console.log(`👋 Player disconnected: ${socket.data.username} (${socket.id})`);

      // Remove player from all worlds
      worldPlayers.forEach((world, roomName) => {
        if (world.has(socket.id)) {
          world.delete(socket.id);

          // Notify other players
          socket.to(roomName).emit('player-left', { id: socket.id });
        }
      });
    });
  });

  function removePlayerFromWorld(roomName: string, playerId: string) {
    const world = worldPlayers.get(roomName);
    if (world) {
      world.delete(playerId);

      // Clean up empty worlds
      if (world.size === 0) {
        worldPlayers.delete(roomName);
      }
    }
  }

  console.log('🌐 Multiplayer service initialized');

  return io;
}
