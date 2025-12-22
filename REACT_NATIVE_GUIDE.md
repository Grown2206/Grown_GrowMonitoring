# React Native / Expo Migration Guide

This guide explains how to convert the Grow Monitoring System to a mobile app using React Native and Expo.

## Architecture Overview

The current web application is built with:
- React + TypeScript
- Material-UI for components
- React Router for navigation
- REST API + WebSockets for backend communication

## Migration Strategy

### Option 1: Expo + React Native Paper (Recommended)

**Pros:**
- Fastest development
- Built-in development tools
- Easy deployment to App Store / Play Store
- Over-the-air updates
- Similar Material Design components

**Setup Steps:**

```bash
# 1. Install Expo CLI
npm install -g expo-cli

# 2. Create new Expo project
npx create-expo-app grow-monitor-mobile --template tabs
cd grow-monitor-mobile

# 3. Install dependencies
npx expo install react-native-paper react-native-vector-icons
npx expo install @react-navigation/native @react-navigation/stack
npx expo install react-native-gesture-handler react-native-reanimated
npx expo install react-native-screens react-native-safe-area-context
npx expo install axios @react-native-async-storage/async-storage

# 4. Install charts and additional libraries
npm install react-native-chart-kit react-native-svg
npm install expo-camera expo-image-picker expo-notifications
```

### Component Migration Map

| Web Component | Mobile Equivalent | Notes |
|--------------|------------------|-------|
| Material-UI Box | React Native Paper Surface/View | Basic container |
| Material-UI Card | React Native Paper Card | Cards |
| Material-UI Button | React Native Paper Button | Buttons |
| Material-UI TextField | React Native Paper TextInput | Form inputs |
| Material-UI Grid | React Native View + Flexbox | Layout |
| Material-UI Dialog | React Native Paper Dialog | Modals |
| Material-UI Chip | React Native Paper Chip | Tags |
| Material-UI Slider | React Native Slider | Sliders |
| Recharts | react-native-chart-kit | Charts |

### File Structure

```
mobile/
├── App.tsx                    # Main app entry
├── app.json                   # Expo configuration
├── src/
│   ├── navigation/
│   │   └── AppNavigator.tsx   # Navigation setup
│   ├── screens/              # Pages → Screens
│   │   ├── Dashboard.tsx
│   │   ├── Plants.tsx
│   │   ├── Sensors.tsx
│   │   ├── Simulation.tsx
│   │   ├── VPDCalculator.tsx
│   │   └── ...
│   ├── components/           # Reusable components
│   │   ├── PlantCard.tsx
│   │   ├── SensorCard.tsx
│   │   └── ...
│   ├── services/             # API services (reusable!)
│   │   └── api.ts           # Same API calls
│   ├── contexts/             # Contexts (reusable!)
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── types/                # TypeScript types (reusable!)
│   │   └── index.ts
│   └── theme/
│       └── theme.ts          # Theme configuration
└── assets/                   # Images, icons, etc.
```

### Code Conversion Examples

#### 1. Dashboard Screen

**Web (Material-UI):**
```tsx
import { Box, Card, CardContent, Typography, Grid } from '@mui/material';

export function Dashboard() {
  return (
    <Box>
      <Typography variant="h4">Dashboard</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography>Content</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
```

**Mobile (React Native Paper):**
```tsx
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';

export function Dashboard() {
  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineLarge">Dashboard</Text>
      <View style={styles.row}>
        <Card style={styles.card}>
          <Card.Content>
            <Text>Content</Text>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  card: { width: '48%', margin: '1%' },
});
```

#### 2. API Service (Identical!)

The API service can be reused with minimal changes:

```typescript
// services/api.ts - Works in both web and mobile!
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Only change

const API_URL = 'http://your-server-ip:3001'; // Use device IP for testing

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token'); // Changed from localStorage
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// All API functions remain the same!
export const plantsAPI = {
  getAll: () => api.get('/plants'),
  // ... etc
};
```

#### 3. Theme Configuration

**React Native Paper Theme:**
```typescript
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2e7d32',
    secondary: '#ff6f00',
    background: '#f5f5f5',
  },
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#66bb6a',
    secondary: '#ffa726',
    background: '#121212',
  },
};
```

### Navigation Setup

```typescript
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Dashboard } from './screens/Dashboard';
import { Plants } from './screens/Plants';
// ... other screens

const Stack = createStackNavigator();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="Plants" component={Plants} />
        <Stack.Screen name="Sensors" component={Sensors} />
        <Stack.Screen name="Simulation" component={Simulation} />
        <Stack.Screen name="VPD" component={VPDCalculator} />
        {/* ... other screens */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### WebSocket Connection

```typescript
import { useEffect, useState } from 'react';

export function useWebSocket(url: string) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const socket = new WebSocket(url);

    socket.onopen = () => console.log('Connected');
    socket.onmessage = (event) => setData(JSON.parse(event.data));
    socket.onerror = (error) => console.error('WebSocket error:', error);

    setWs(socket);

    return () => socket.close();
  }, [url]);

  return { ws, data };
}
```

### Push Notifications

```typescript
import * as Notifications from 'expo-notifications';

// Request permission
async function registerForPushNotifications() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    alert('Permission not granted!');
    return;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log('Push token:', token);
  return token;
}

// Send notification to server
async function sendPushToken(token: string) {
  await api.post('/users/push-token', { token });
}
```

### Camera Integration for Photo Gallery

```typescript
import * as ImagePicker from 'expo-image-picker';

async function takePhoto() {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();

  if (status !== 'granted') {
    alert('Permission needed!');
    return;
  }

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });

  if (!result.canceled) {
    // Upload photo
    const formData = new FormData();
    formData.append('photo', {
      uri: result.assets[0].uri,
      type: 'image/jpeg',
      name: 'plant-photo.jpg',
    } as any);

    await api.post('/photos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
}
```

## Build & Deploy

### Development

```bash
# Start development server
npx expo start

# Scan QR code with Expo Go app (iOS/Android)
```

### Production Build

```bash
# Configure app.json
{
  "expo": {
    "name": "Grow Monitor",
    "slug": "grow-monitor",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#2e7d32"
    },
    "android": {
      "package": "com.yourcompany.growmonitor",
      "versionCode": 1
    },
    "ios": {
      "bundleIdentifier": "com.yourcompany.growmonitor",
      "buildNumber": "1.0.0"
    }
  }
}

# Build Android APK
eas build --platform android --profile preview

# Build iOS IPA
eas build --platform ios --profile preview

# Submit to stores
eas submit --platform android
eas submit --platform ios
```

## Shared Code Strategy

Keep these modules shared between web and mobile:
- ✅ `src/types/` - TypeScript interfaces
- ✅ `src/services/api.ts` - API calls (with storage adapter)
- ✅ `src/contexts/` - React contexts (with minor adjustments)
- ✅ Business logic and calculations
- ❌ UI components (different libraries)
- ❌ Routing (different systems)

## Performance Tips

1. **Optimize Images**: Use `react-native-fast-image`
2. **Memoization**: Use `React.memo()` for expensive components
3. **FlatList**: Use instead of map() for long lists
4. **Code Splitting**: Lazy load screens
5. **Reduce Re-renders**: Use `useCallback` and `useMemo`

## Testing on Device

```bash
# iOS Simulator (Mac only)
npx expo start --ios

# Android Emulator
npx expo start --android

# Physical device via Expo Go
npx expo start
# Scan QR code with Expo Go app
```

## Next Steps

1. ✅ Set up Expo project
2. ✅ Install dependencies
3. ✅ Create navigation structure
4. ✅ Convert one screen as template (Dashboard)
5. ✅ Implement API service
6. ✅ Add authentication
7. ✅ Convert remaining screens
8. ✅ Add camera & notifications
9. ✅ Test on device
10. ✅ Build & deploy

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [React Navigation](https://reactnavigation.org/)
- [Expo EAS Build](https://docs.expo.dev/build/introduction/)
