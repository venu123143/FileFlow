import { useCallback, useState, useRef } from 'react';
import { Socket } from 'socket.io-client';
import createSocket from "@/store/connect-socket";

export const useSocket = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const isInitializing = useRef(false);

    const initializeSocket = useCallback(async () => {
        if (socket || isInitializing.current) return socket;

        isInitializing.current = true;
        try {
            const connectedSocket = await createSocket(import.meta.env.VITE_API_SOCKET_URL);
            setSocket(connectedSocket);
            return connectedSocket;
        } finally {
            isInitializing.current = false;
        }
    }, [socket]);

    const disconnectSocket = useCallback(() => {
        if (socket) {
            socket.disconnect();
            setSocket(null);
        }
    }, [socket]);

    return {
        socket,
        initializeSocket,
        disconnectSocket,
    };
};
