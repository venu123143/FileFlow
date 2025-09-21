import { useCallback, useState, useRef, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import createSocket from "@/store/connect-socket";

export const useSocket = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const isInitializing = useRef(false);
    const socketRef = useRef<Socket | null>(null);

    // Keep socket ref in sync
    useEffect(() => {
        socketRef.current = socket;
    }, [socket]);

    const initializeSocket = useCallback(async () => {
        if (socketRef.current || isInitializing.current) return socketRef.current;

        isInitializing.current = true;
        try {
            const connectedSocket = await createSocket(import.meta.env.VITE_API_SOCKET_URL);
            setSocket(connectedSocket);
            socketRef.current = connectedSocket;
            return connectedSocket;
        } finally {
            isInitializing.current = false;
        }
    }, []); // No dependencies needed

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
