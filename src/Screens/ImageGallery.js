import { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { fetcher } from '~/utils/ApiService';

const { width } = Dimensions.get('window');
const numColumns = 2;
const itemWidth = (width - 32) / numColumns;
const pageSize = 10;

const ImageGallery = ({ navigation }) => {
  const [images, setImages] = useState([]);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const getImages = useMutation({
    mutationFn: async (offsetValue) =>
      fetcher({
        method: 'post',
        url: '/getdata.php',
        data: {
          user_id: '108',
          offset: offsetValue.toString(),
          type: 'popular',
        },
      }),
    onSuccess: (data) => {
      if (data && data.images && Array.isArray(data.images)) {
        setImages((prevImages) => {
          const newImages = refreshing ? data.images : [...prevImages, ...data.images];
          return newImages;
        });
        setOffset((prevOffset) => prevOffset + 1);
        if (data.images.length < pageSize) {
          setHasMore(false);
        }
      } else {
        console.log('No valid images in response, stopping pagination');
        setHasMore(false);
      }
      setIsLoading(false);
      setRefreshing(false);
    },
    onError: (error) => {
      console.error('Error fetching images:', error);
      setIsLoading(false);
      setRefreshing(false);
    },
  });

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = () => {
    if (isLoading || (!hasMore && !refreshing)) {
      return;
    }
    setIsLoading(true);
    getImages.mutate(refreshing ? 0 : offset);
  };

  const renderImageItem = ({ item, index }) => {
    let aspectRatio = 1;
    if (item.width && item.height) {
      aspectRatio = parseInt(item.width) / parseInt(item.height);
    }
    const itemHeight = itemWidth / aspectRatio;

    return (
      <TouchableOpacity
        style={[styles.imageContainer, { marginLeft: index % 2 === 0 ? 0 : 8 }]}
        activeOpacity={0.7}
        onPress={() => {
          navigation.navigate('ImageDetail', { image: item?.xt_image });
        }}>
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: item.xt_image }}
            style={[styles.image, { width: itemWidth, height: itemHeight }]}
            resizeMode="cover"
          />
          <View style={styles.imageShadow} />
        </View>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!hasMore) {
      return (
        <View style={styles.endMessageContainer}>
          <Text style={styles.endMessage}>You've reached the end</Text>
        </View>
      );
    }

    return (
      <View style={styles.footer}>
        {isLoading && !refreshing ? (
          <ActivityIndicator size="small" color="#007AFF" />
        ) : (
          <TouchableOpacity onPress={loadImages} style={styles.loadMoreButton} disabled={isLoading}>
            <Text style={styles.loadMoreText}>Load More</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderEmptyComponent = () => {
    if (getImages.isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading gallery...</Text>
        </View>
      );
    }
    return (
      <View style={styles.noImagesContainer}>
        <Text style={styles.noImagesText}>No images found</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <FlatList
        data={images}
        renderItem={renderImageItem}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        numColumns={numColumns}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyComponent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={4}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  galleryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  listContent: {
    paddingBottom: 24,
  },
  columnWrapper: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  imageContainer: {
    flex: 1,
    maxWidth: itemWidth,
  },
  imageWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#e0e0e0',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    borderRadius: 12,
  },
  imageShadow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  loadMoreButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#FF8A05',
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loadMoreText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: 'black',
  },
  noImagesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImagesText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 16,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#007AFF',
    borderRadius: 20,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  endMessageContainer: {
    padding: 16,
    alignItems: 'center',
  },
  endMessage: {
    color: '#999',
    fontSize: 14,
  },
});

export default ImageGallery;
