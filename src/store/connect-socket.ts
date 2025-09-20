
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";

const createSocket = (url: string): Promise<Socket> => {
    const startTime = performance.now();
    return new Promise<Socket>((resolve, reject) => {
        const socket = io(url, {
            transports: ['websocket'],
            timeout: 10000,
            autoConnect: false, // Prevent auto-connection
        });

        socket.on('connect', () => {
            const timeTaken = performance.now() - startTime;
            console.log(`Connected in ${timeTaken.toFixed(2)} ms, socket id: ${socket.id}`);
            toast.success(`Connected to server (${socket.id})`);
            resolve(socket);
        });

        socket.on('connect_error', (error) => {
            const endTime = performance.now();
            const duration = endTime - startTime;
            console.error(`Connection error after ${duration.toFixed(2)} ms:`, error);
            toast.error(`Failed to connect: ${error.message || error}`);
            reject(error);
        });

        socket.on('disconnect', (reason) => {
            toast.warning(`Socket disconnected: ${reason}`, { closeButton: true });
            console.warn(`Socket disconnected: ${reason}`);
        });

        socket.on('close', (reason) => {
            toast.warning(`Socket closed: ${reason}`, { closeButton: true });
        });

        socket.connect(); // This is necessary unless autoConnect: false is removed
    });
};

export default createSocket
