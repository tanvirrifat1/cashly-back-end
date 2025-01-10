import colors from 'colors';
import { Server } from 'socket.io';
import { logger } from '../shared/logger';

export const getRecieverSocketId = (recieverId: string): string | undefined => {
  console.log(userSocketMap, 'userSocketMap');
  return userSocketMap[recieverId];
};

const userSocketMap: { [key: string]: string } = {};

const socket = (io: Server) => {
  io.on('connection', socket => {
    logger.info(colors.blue('A user connected'));

    const userId = socket.handshake.query.userId as string | undefined;

    if (userId && userId !== 'undefined') {
      userSocketMap[userId] = socket.id;
    }

    // io.emit() is used to send events to all the connected clients
    io.emit('getOnlineUsers', Object.keys(userSocketMap));
    // io.emit('testmessage', 'test from socketHelper')
    console.log(userSocketMap, 'userSocketMap');

    //disconnect
    socket.on('disconnect', () => {
      logger.info(colors.red('A user disconnect'));
      if (userId && userId !== 'undefined') {
        delete userSocketMap[userId];
        io.emit('getOnlineUsers', Object.keys(userSocketMap));
      }
    });
  });
};
export const socketHelper = { socket };
