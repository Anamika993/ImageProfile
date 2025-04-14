import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { fetcher } from '~/utils/ApiService';

const { width } = Dimensions.get('window');
const numColumns = 2;
const itemWidth = (width - 24) / numColumns; // 24 accounts for padding

const ImageGallery = ({navigation}) => {
  const [images, setImages] = useState([]);
  const [offset, setOffset] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
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
      console.log('Fetched images:', data);

      if (data && data.images) {
        if (data.images.length === 0) {
          setHasMore(false);
        } else {
          setImages((prevImages) =>
            offset === 0 ? data.images : [...prevImages, ...data.images]
          );
          setOffset((prevOffset) => prevOffset + data.images.length);
        }
      } else {
        console.log('Invalid data format or no images:', data);
        setHasMore(false);
      }

      setIsLoadingMore(false);
    },
    onError: (error) => {
      console.error('Error fetching images:', error);
      setIsLoadingMore(false);
      setHasMore(false);
    },
  });

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    getImages.mutate(offset);
  };

  const renderImageItem = ({ item }) => {
    let aspectRatio = 1;

    if (item.width && item.height) {
      aspectRatio = parseInt(item.width) / parseInt(item.height);
    }

    const itemHeight = itemWidth / aspectRatio;

    return (
      <TouchableOpacity style={styles.imageContainer} onPress={()=>{navigation.navigate('ImageDetail', { image: item?.xt_image })}}>
        <Image
          source={{ uri: item.xt_image }}
          style={[styles.image, { width: itemWidth - 8, height: itemHeight }]}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;

    return (
      <View style={styles.footer}>
        <ActivityIndicator animating size="large" />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {images.length > 0 ? (
        <FlatList
          data={images}
          renderItem={renderImageItem}
          keyExtractor={(item, index) => item.id || index.toString()}
          numColumns={numColumns}
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            if (hasMore && !isLoadingMore) {
              loadImages();
            }
          }}
          ListFooterComponent={renderFooter}
        />
      ) : getImages.isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Loading images...</Text>
        </View>
      ) : (
        <View style={styles.noImagesContainer}>
          <Text>No images found</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingBottom: 16,
  },
  imageContainer: {
    flex: 1,
    alignItems: 'center',
    aspectRatio: 2 / 2,
  },
  image: {
    backgroundColor: '#e0e0e0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImagesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    paddingVertical: 20,
    borderTopWidth: 1,
    borderColor: '#CED0CE',
  },
});

export default ImageGallery;