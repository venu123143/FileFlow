
import { io, Socket } from "socket.io-client";
import { getAuthState } from '@/store/auth.store';

const createSocket = (url: string): Promise<Socket> => {
    const startTime = performance.now();
    const { token } = getAuthState();
    return new Promise<Socket>((resolve, reject) => {
        const socket = io(url, {
            transports: ['websocket'],
            timeout: 10000,
            autoConnect: false, // Prevent auto-connection
            reconnection: true, // Disable automatic reconnection
            reconnectionAttempts: 2,
            reconnectionDelay: 1000,
            auth: {
                token: token?.access_token
            }
        });

        socket.on('connect', () => {
            const timeTaken = performance.now() - startTime;
            console.log(`Connected in ${timeTaken.toFixed(2)} ms, socket id: ${socket.id}`);
            resolve(socket);
        });

        socket.on('connect_error', (error) => {
            console.error(`Failed to connect: ${error.message || error}`);
            reject(error);
        });

        socket.on('disconnect', (reason) => {
            console.warn(`Socket disconnected: ${reason}`);
        });

        socket.on('close', (reason) => {
            console.warn(`Socket closed: ${reason}`);
        });

        socket.connect(); // This is necessary unless autoConnect: false is removed
    });
};

export default createSocket
