import './global.css'
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import ImageGallery from './src/Screens/ImageGallery';
import ImageDetailScreen from './src/Screens/ImageDetailScreen';

const App = () => {
  const Stack = createNativeStackNavigator()
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: false,
      },
    },
  });
  return (
  
   <NavigationContainer>
    <QueryClientProvider client={queryClient}>
    <Stack.Navigator>
      <Stack.Screen name="ImageGallery" component={ImageGallery} />
      <Stack.Screen name="ImageDetail" component={ImageDetailScreen} />
      </Stack.Navigator>
      </QueryClientProvider>
    </NavigationContainer>
  )
}
export default App