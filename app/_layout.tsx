import { Stack } from "expo-router";

export default function RootLayout() {
  return (
      <Stack
          screenOptions={{
              headerStyle: {
                  backgroundColor: '#444',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                  fontWeight: 'bold',
              },
          }}>
          <Stack.Screen name="index"
                        options={{
            headerTitle: () => null,
          }}/>
      </Stack>
  );
}
