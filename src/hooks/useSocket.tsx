import { useCallback, useState, useRef } from 'react';
import { Socket } from 'socket.io-client';
import createSocket from "@/store/connect-socket";
import { toast } from 'sonner';

// Global socket instance to prevent multiple connections
let globalSocket: Socket | null = null;

export const useSocket = () => {
    const [socket, setSocket] = useState<Socket | null>(globalSocket);
    const isInitializing = useRef(false);

    const initializeSocket = useCallback(async () => {
        if (globalSocket || isInitializing.current) {
            setSocket(globalSocket);
            return globalSocket;
        }

        isInitializing.current = true;
        try {
            const connectedSocket = await createSocket(import.meta.env.VITE_API_SOCKET_URL);
            globalSocket = connectedSocket;
            setSocket(connectedSocket);
            return connectedSocket;

        } catch (error) {
            toast.error('Failed to initialize socket');
        } finally {
            isInitializing.current = false;
        }
    }, []);

    const disconnectSocket = useCallback(() => {
        if (globalSocket) {
            globalSocket.disconnect();
            globalSocket = null;
            setSocket(null);
        }
    }, []);

    return {
        socket,
        initializeSocket,
        disconnectSocket,
    };
};
