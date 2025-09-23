import { createContext, useContext, useCallback, useState, useRef, useEffect, type ReactNode } from 'react';
import { Socket } from 'socket.io-client';
import createSocket from "@/store/connect-socket";

interface SocketContextType {
    socket: Socket | null;
    initializeSocket: () => Promise<Socket | null>;
    disconnectSocket: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
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
            return connectedSocket;
        } finally {
            isInitializing.current = false;
        }
    }, []);

    const disconnectSocket = useCallback(() => {
        if (socket) {
            socket.disconnect();
            setSocket(null);
        }
    }, [socket]);

    const value = {
        socket,
        initializeSocket,
        disconnectSocket,
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};