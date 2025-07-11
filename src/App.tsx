import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeView } from "@/src/views/Home";
import { Provider } from "react-redux";
import { store } from "@/src/redux/store";
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeView} options={{ title: "" }} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
