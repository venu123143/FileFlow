import { useCallback, useState } from 'react';
import { Socket } from 'socket.io-client';
import createSocket from "@/store/connect-socket";

export const useSocket = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    
    const initializeSocket = useCallback(async () => {
        if (socket) return;
        const connectedSocket = await createSocket(import.meta.env.VITE_API_SOCKET_URL);
        setSocket(connectedSocket); // Update state so component re-renders with new socket
        return connectedSocket;
    }, []);

    return {
        socket,
        initializeSocket,
    };
};
