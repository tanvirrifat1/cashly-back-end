import colors from 'colors';
import { Server } from 'socket.io';
import { logger } from '../shared/logger';
import { Message } from '../app/modules/message/message.model';
import { Room } from '../app/modules/chatRoom/chatRoom.model';

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

// const socket = (io: Server) => {
//   io.on('connection', socket => {
//     logger.info(colors.blue('A user connected'));

//     const userId = socket.handshake.query.userId as string | undefined;

//     if (userId && userId !== 'undefined') {
//       userSocketMap[userId] = socket.id;
//     }

//     // Join a chat room
//     socket.on('join', roomId => {
//       socket.join(roomId);
//       console.log(`User joined room: ${roomId}`);
//     });

//     socket.on('send-message', async ({ roomId, senderId, message }) => {
//       try {
//         // Save the message to the database
//         const newMessage = await Message.create({
//           senderId,
//           message,
//           roomId,
//         });

//         console.log(newMessage);

//         // Populate the senderId field
//         // const populatedMessage = await newMessage.populate('senderId');

//         // Emit the message to all users in the specified chat room

//         console.log(newMessage.roomId.toString());
//         console.log(newMessage.roomId);
//         io.emit(`receive-message:${roomId}`, newMessage);
//       } catch (error) {
//         console.error('Error sending message:', error);
//       }
//     });

//     // // io.emit() is used to send events to all the connected clients
//     // io.emit('getOnlineUsers', Object.keys(userSocketMap));
//     // // io.emit('testmessage', 'test from socketHelper')

//     //disconnect
//     socket.on('disconnect', () => {
//       logger.info(colors.red('A user disconnect'));
//       if (userId && userId !== 'undefined') {
//         delete userSocketMap[userId];
//         io.emit('getOnlineUsers', Object.keys(userSocketMap));
//       }
//     });
//   });
// };
// export const socketHelper = { socket };
