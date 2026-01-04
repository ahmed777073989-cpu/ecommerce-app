import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../api/products';

interface ProductCardProps {
  product: Product;
  language?: 'en' | 'ar';
}

export default function ProductCard({ product, language = 'en' }: ProductCardProps) {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate('ProductDetail' as never, { productId: product.id } as never);
  };

  const isRTL = language === 'ar';

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        styles.card,
        isRTL && { flexDirection: 'row-reverse' },
      ]}
    >
      <Image
        source={{ uri: product.images[0] || 'https://placehold.co/200x200' }}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={[styles.content, isRTL && { alignItems: 'flex-end' }]}>
        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>

        <View style={[styles.priceRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <Text style={styles.price}>
            {product.currency} {product.price}
          </Text>
          {product.tags.includes('new') && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>New</Text>
            </View>
          )}
        </View>

        <View style={[styles.statsRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <View style={styles.stat}>
            <Ionicons name="heart-outline" size={16} color="#666" />
            <Text style={styles.statText}>{product.likes}</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="chatbubble-outline" size={16} color="#666" />
            <Text style={styles.statText}>{product.comments?.length || 0}</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="eye-outline" size={16} color="#666" />
            <Text style={styles.statText}>{product.viewsCount}</Text>
          </View>
        </View>

        <View style={[styles.stockRow, isRTL && { justifyContent: 'flex-end' }]}>
          {product.stockCount === 0 ? (
            <Text style={styles.outOfStock}>Out of Stock</Text>
          ) : product.stockCount < 10 ? (
            <Text style={styles.lowStock}>Only {product.stockCount} left</Text>
          ) : (
            <Text style={styles.inStock}>In Stock</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 120,
    height: 120,
  },
  content: {
    flex: 1,
    padding: 12,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2563eb',
    marginRight: 8,
  },
  badge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  statText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  stockRow: {
    marginTop: 'auto',
  },
  outOfStock: {
    fontSize: 12,
    fontWeight: '600',
    color: '#dc2626',
  },
  lowStock: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f59e0b',
  },
  inStock: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },
});
