# Real-Time Employee Tracking Implementation Guide

## Overview
This guide explains how the real-time employee tracking system works using Socket.IO for live location updates on Google Maps.

## How It Works

### 1. **Socket Connection**
- Socket connects to: `https://62-72-24-4.sslip.io`
- Automatically connects when the Employee Tracking page loads
- Shows connection status in the UI (green = connected, red = disconnected)

### 2. **Tracking Workflow**

#### Step 1: Select an Active Ride
1. Click the "Track Ride" button
2. Modal opens showing all active rides from the API: `/rides/active`
3. Each ride shows:
   - Employee name (Driver/Passenger)
   - Status (STARTED/Active)
   - Speed, Battery level
   - Last update time

#### Step 2: Join the Ride Room
When you select a ride, the system:
```javascript
socketService.joinRideRoom(rideId, userId, 'admin');
```

**Socket Event Sent:**
```javascript
{
  event: 'joinRideRoom',
  data: {
    rideId: 8,      // The ride ID
    userId: 7,      // The user/rider ID
    role: 'admin'   // Your role
  }
}
```

#### Step 3: Listen for Location Updates
The system listens to multiple socket events:

**1. `roomAdded`** - Confirmation that you joined the room
```javascript
// Response from server
{
  message: "Successfully joined ride room",
  rideId: 8
}
```

**2. `updatePassengers`** - Main location update event
```javascript
{
  lat: "24.8607",     // or 24.8607 (string or number)
  long: "67.0011",    // Longitude
  rideId: 8,          // Optional
  userId: 7,          // Optional
  speed: 45           // Optional
}
```

**3. `locationUpdate`** - Alternative location event
Same format as `updatePassengers`

**4. `rideUpdate`** - General ride updates
```javascript
{
  rideId: 8,
  location: {
    lat: 24.8607,
    lng: 67.0011
  },
  speed: 45,
  status: "STARTED"
}
```

#### Step 4: Update the Map
When a location update is received:
1. Validates the ride ID matches current tracking
2. Parses coordinates (handles both `long` and `lng`)
3. Updates the employee marker on Google Maps
4. Pans the map to the new location smoothly
5. Updates the side panel with speed, battery, coordinates

### 3. **Code Structure**

#### Files Modified:
```
src/
├── services/
│   └── socketService.ts          # Socket connection & room management
├── components/
│   ├── EmployeeTracking.tsx      # Main map component
│   └── TrackEmployeeModal.tsx    # Ride selection modal
└── apis/user/
    └── api.ts                    # API types & functions
```

#### Key Functions:

**socketService.ts**
```typescript
connect()                          // Connect to socket server
joinRideRoom(rideId, userId, role) // Join a specific ride room
leaveRideRoom(rideId, userId)      // Leave the room
on(event, callback)                // Listen to events
```

**EmployeeTracking.tsx**
```typescript
setupSocketEventListeners()        // Setup all socket listeners
handleLocationUpdate(data)          // Process location updates
handleEmployeeSelect()              // Join room when ride selected
stopTracking()                      // Leave room & cleanup
```

## Testing

### Test Mode
If socket is not receiving data, you can enable **Test Mode**:
1. Select a ride
2. Click "Enable Test Mode" button
3. System will simulate location updates around Karachi every 3 seconds

**Test locations cycle through:**
- Karachi city center: 24.8607, 67.0011
- Clifton: 24.8949, 67.0300
- Saddar: 24.8411, 66.9978
- Defence: 24.8790, 67.0400
- Gulshan: 24.8300, 67.0200
- North Karachi: 24.9100, 67.0500

### Expected Socket Data Format

The socket may send data in various formats. The system handles:

```javascript
// Format 1: Simple coordinates
{
  lat: "24.8607",
  long: "67.0011"
}

// Format 2: With ride info
{
  lat: 24.8607,
  lng: 67.0011,
  rideId: 8,
  userId: 7,
  speed: 45
}

// Format 3: Nested in location object
{
  rideId: 8,
  location: {
    lat: 24.8607,
    lng: 67.0011
  }
}
```

## Debugging

### Console Logs
The system includes emoji-prefixed logs for easy debugging:

```
🎯 Selected ride 8 for employee John Doe
🔌 Joining ride room 8 for user 7
✅ Successfully joined ride room
📍 Received location update: { lat: 24.8607, long: 67.0011 }
✅ Updating location to: 24.8607, 67.0011
🗺️ Map centered to new location
```

### Common Issues

**Issue:** "Socket not connected"
- **Solution:** Check network connection, verify socket URL is reachable

**Issue:** "No location updates received"
- **Solution:** 
  1. Check console for `roomAdded` confirmation
  2. Verify backend is sending `updatePassengers` events
  3. Enable Test Mode to verify UI updates work

**Issue:** "Invalid coordinates"
- **Solution:** Check data format in console, ensure lat/lng are valid numbers

## Socket Events Reference

### Outgoing Events (Client → Server)
| Event | Data | Description |
|-------|------|-------------|
| `joinRideRoom` | `{ rideId, userId, role }` | Join a ride's room |
| `leaveRideRoom` | `{ rideId, userId }` | Leave a ride's room |

### Incoming Events (Server → Client)
| Event | Data | Description |
|-------|------|-------------|
| `roomAdded` | `{ message, rideId }` | Room join confirmation |
| `updatePassengers` | `{ lat, long, rideId, userId }` | Location update |
| `locationUpdate` | `{ lat, lng, rideId }` | Alternative location event |
| `rideUpdate` | `{ rideId, location, speed }` | General ride update |
| `roomLeft` | `{ message, rideId }` | Room leave confirmation |
| `error` | `{ message }` | Error notification |

## UI Features

### Connection Status Panel
- **Green dot**: Socket connected ✅
- **Red dot**: Socket disconnected ❌
- Shows currently tracked ride
- Shows test mode status

### Map Features
- Google Maps with custom markers
- Employee marker with status indicator (🟢 Active, 🟡 Break, ⚫ Offline)
- Info window on marker click
- Auto-pan to new location
- Traffic layer (from initial socket data)

### Side Panel
Displays for selected employee:
- Name & Role
- Status (Active/On Break/Offline)
- Last Update time
- Speed (km/h)
- Battery level (%)
- Current coordinates

## API Integration

### Get Active Rides
```
GET /api/rides/active
Authorization: Bearer <token>

Response:
{
  data: [
    {
      id: 8,
      riderId: 7,
      creatorId: 7,
      driverName: "John Doe",
      driverEmail: "john@example.com",
      status: "STARTED",
      speed: 0,
      batteryLevel: 100,
      startLat: 24.8607,
      startLong: 67.0011,
      ...
    }
  ],
  hasError: false,
  message: "Success"
}
```

## Next Steps

1. **Real Data**: Remove the Test Mode auto-start to use only socket data
2. **Error Handling**: Add retry logic for failed socket connections
3. **Notifications**: Add toast notifications for important events
4. **History**: Store location history and draw path on map
5. **Multiple Rides**: Support tracking multiple rides simultaneously
6. **Performance**: Throttle location updates if too frequent

## Troubleshooting Checklist

- [ ] Socket connected (check console)
- [ ] `joinRideRoom` event sent (check Network tab)
- [ ] `roomAdded` confirmation received
- [ ] Backend is sending `updatePassengers` events
- [ ] Location data has valid lat/lng coordinates
- [ ] RideId in updates matches selected ride
- [ ] Google Maps API key is valid
- [ ] No console errors

---

**Built with:**
- Socket.IO Client v4.8.1
- Google Maps JavaScript API
- React 19.1.1
- TypeScript 5.8.3

