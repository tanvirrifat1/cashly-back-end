import colors from 'colors';
import { Server } from 'socket.io';
import { logger } from '../shared/logger';
import { Message } from '../app/modules/message/message.model';
import { Room } from '../app/modules/chatRoom/chatRoom.model';
import { sendNotifications } from './notificationHelper';

export const getRecieverSocketId = (recieverId: string): string | undefined => {
  return userSocketMap[recieverId];
};

const userSocketMap: { [key: string]: string } = {};

const socket = (io: Server) => {
  io.on('connection', socket => {
    console.log('A user connected:', socket.id);

    // Join a chat room
    socket.on('join', roomId => {
      socket.join(roomId);
      console.log(`User joined room: ${roomId}`);
    });

    socket.on('send-message', async ({ roomId, senderId, message }) => {
      try {
        // Save the message to the database
        const newMessage = await Message.create({
          roomId,
          senderId,
          message,
        });

        // Populate the senderId field
        // const populatedMessage = await newMessage.populate('senderId');
        // console.log(newMessage);

        if (newMessage) {
          await Room.updateOne({ _id: roomId }, { $inc: { unreadCount: 1 } });
        }

        io.emit(`receive-message:${newMessage.roomId}`, newMessage);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });

    socket.on('disconnect', () => {
      logger.info(colors.red('A user disconnect'));
    });
  });
};

export const socketHelper = { socket };
