import { io, Socket } from 'socket.io-client';

// Socket connection configuration
const SOCKET_URL = 'https://62-72-24-4.sslip.io';

// Location update interface
export interface LocationUpdate {
  lat: string | number;
  long: string | number;
  lng?: string | number;
  rideId?: number;
  userId?: number;
  speed?: number;
  heading?: number;
  timestamp?: string;
}

// Socket events interface
interface SocketEvents {
  // Outgoing events (what we send to backend)
  joinRideRoom: (data: { rideId: number; userId: number; role: string }) => void;
  leaveRideRoom: (data: { rideId: number; userId: number }) => void;
  
  // Incoming events (what backend sends to us)
  roomAdded: (data: any) => void;
  updatePassengers: (data: LocationUpdate) => void;
  roomLeft: (data: any) => void;
  error: (data: any) => void;
}

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  // Initialize socket connection
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      this.socket = io(SOCKET_URL, {
        transports: ['websocket'],
        timeout: 10000,
        forceNew: true,
      });

      // Connection event handlers
      this.socket.on('connect', () => {
        console.log('✅ Socket connected successfully!');
        console.log('🔗 Socket ID:', this.socket?.id);
        console.log('🌐 Socket URL:', SOCKET_URL);
        console.log('📡 Transport:', this.socket?.io.engine.transport.name);
        this.isConnected = true;
        this.reconnectAttempts = 0;
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
        console.error('🔍 Error details:', {
          message: error.message,
          description: (error as any).description,
          context: (error as any).context,
          type: (error as any).type
        });
        this.isConnected = false;
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('🔌 Socket disconnected. Reason:', reason);
        console.log('📊 Connection stats:', {
          wasConnected: this.isConnected,
          reconnectAttempts: this.reconnectAttempts,
          maxAttempts: this.maxReconnectAttempts
        });
        this.isConnected = false;
        
        // Attempt to reconnect if not manually disconnected
        if (reason !== 'io client disconnect' && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          setTimeout(() => {
            console.log(`🔄 Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            this.connect();
          }, 5000);
        }
      });

      // Add general event logging for debugging
      this.socket.onAny((eventName, ...args) => {
        console.log(`🎯 Raw Socket Event: "${eventName}"`, args);
      });

      // Set up timeout for connection
      setTimeout(() => {
        if (!this.isConnected) {
          reject(new Error('Connection timeout'));
        }
      }, 10000);
    });
  }

  // Disconnect socket
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Join a ride room
  joinRideRoom(rideId: number, userId: number, role: string = 'admin'): void {
    if (!this.socket || !this.isConnected) {
      console.error('❌ Socket not connected. Cannot join ride room.');
      console.error('🔍 Socket status:', {
        socketExists: !!this.socket,
        isConnected: this.isConnected,
        socketConnected: this.socket?.connected
      });
      return;
    }

    const joinData = { rideId, userId, role };
    console.log('🚀 Emitting joinRideRoom event:', joinData);
    console.log('📡 Socket connection status:', {
      connected: this.socket.connected,
      id: this.socket.id,
      transport: this.socket.io.engine.transport.name
    });
    
    this.socket.emit('joinRideRoom', joinData);
  }

  // Note: We don't send location updates - backend handles this automatically
  // We only receive location updates via 'updatePassengers' events

  // Leave a ride room
  leaveRideRoom(rideId: number, userId: number): void {
    if (!this.socket || !this.isConnected) {
      console.error('Socket not connected. Cannot leave ride room.');
      return;
    }

    console.log('Leaving ride room:', { rideId, userId });
    this.socket.emit('leaveRideRoom', { rideId, userId });
  }

  // Listen to socket events
  on(event: string, callback: (...args: any[]) => void): void {
    if (!this.socket) {
      console.error('Socket not initialized. Cannot listen to events.');
      return;
    }

    // Enhanced logging for debugging
    this.socket.on(event, (...args: any[]) => {
      console.log(`🔌 Socket Event Received: "${event}"`, args);
      callback(...args);
    });
  }

  // Remove event listener
  off(event: string, callback?: (...args: any[]) => void): void {
    if (!this.socket) return;
    
    if (callback) {
      this.socket.off(event, callback);
    } else {
      this.socket.off(event);
    }
  }

  // Get connection status
  getConnectionStatus(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  // Get socket instance (for advanced usage)
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
export type { SocketEvents };
