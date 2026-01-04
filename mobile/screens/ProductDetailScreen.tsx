import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { productsApi, Product, Comment } from '../api/products';
import { useAuthStore } from '../store/authStore';

type RouteParams = {
  ProductDetail: { productId: string };
};

export default function ProductDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'ProductDetail'>>();
  const { productId } = route.params;
  const { user, language, token } = useAuthStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [rating, setRating] = useState(5);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const isRTL = language === 'ar';

  const translations = {
    back: language === 'ar' ? 'عودة' : 'Back',
    views: language === 'ar' ? 'مشاهدات' : 'Views',
    likes: language === 'ar' ? 'إعجابات' : 'Likes',
    comments: language === 'ar' ? 'التعليقات' : 'Comments',
    inStock: language === 'ar' ? 'متوفر' : 'In Stock',
    outOfStock: language === 'ar' ? 'غير متوفر' : 'Out of Stock',
    lowStock: language === 'ar' ? 'مخزون منخفض' : 'Low Stock',
    orderNow: language === 'ar' ? 'اطلب الآن' : 'Order Now',
    chat: language === 'ar' ? 'دردشة' : 'Chat',
    askAI: language === 'ar' ? 'اسأل الذكاء الاصطناعي' : 'Ask AI',
    addComment: language === 'ar' ? 'أضف تعليقاً' : 'Add a comment',
    submit: language === 'ar' ? 'إرسال' : 'Submit',
    new: language === 'ar' ? 'جديد' : 'New',
    comingSoon: language === 'ar' ? 'قريباً' : 'Coming Soon',
    orderToBuy: language === 'ar' ? 'اطلب للشراء' : 'Order to Buy',
    noComments: language === 'ar' ? 'لا توجد تعليقات' : 'No comments yet',
    cost: language === 'ar' ? 'التكلفة' : 'Cost',
    description: language === 'ar' ? 'الوصف' : 'Description',
  };

  useEffect(() => {
    globalThis.__token__ = token || '';
    loadProduct();
    loadComments();
  }, [token]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await productsApi.getProduct(productId);
      setProduct(data);
      await productsApi.incrementViews(productId);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const response = await productsApi.getComments(productId);
      setComments(response.comments);
    } catch (error: any) {
      console.error('Failed to load comments:', error);
    }
  };

  const handleLike = async () => {
    if (!user) {
      Alert.alert('Error', 'Please login to like products');
      return;
    }

    try {
      const result = await productsApi.toggleLike(productId);
      if (product) {
        setProduct({
          ...product,
          likes: result.likesCount,
        });
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to like product');
    }
  };

  const handleSubmitComment = async () => {
    if (!user) {
      Alert.alert('Error', 'Please login to add comments');
      return;
    }

    if (!commentText.trim()) {
      Alert.alert('Error', 'Please enter a comment');
      return;
    }

    try {
      setSubmittingComment(true);
      const newComment = await productsApi.addComment(productId, commentText, rating);
      setComments([newComment, ...comments]);
      setCommentText('');
      setRating(5);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#dc2626" />
        <Text style={styles.errorText}>Product not found</Text>
      </View>
    );
  }

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  return (
    <ScrollView style={[styles.container, isRTL && styles.rtl]}>
      {/* Header */}
      <View style={[styles.header, isRTL && { flexDirection: 'row-reverse' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons
            name={isRTL ? 'chevron-forward' : 'chevron-back'}
            size={24}
            color="#1f2937"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {language === 'ar' ? 'تفاصيل المنتج' : 'Product Details'}
        </Text>
        <TouchableOpacity onPress={handleLike}>
          <Ionicons name="heart" size={24} color={product.likes > 0 ? '#ef4444' : '#9ca3af'} />
        </TouchableOpacity>
      </View>

      {/* Image Gallery */}
      <View style={styles.imageGallery}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / 300);
            setCurrentImageIndex(index);
          }}
        >
          {product.images.map((image, index) => (
            <Image
              key={index}
              source={{ uri: image || 'https://placehold.co/600x600' }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ))}
        </ScrollView>

        {product.images.length > 1 && (
          <View style={styles.imageDots}>
            {product.images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  currentImageIndex === index && styles.dotActive,
                ]}
              />
            ))}
          </View>
        )}
      </View>

      {/* Product Info */}
      <View style={[styles.productInfo, isRTL && { alignItems: 'flex-end' }]}>
        <View style={[styles.titleRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <View style={styles.titleLeft}>
            <Text style={styles.title}>{product.title}</Text>
            <Text style={styles.category}>
              {language === 'ar' ? product.category?.nameAr : product.category?.nameEn}
            </Text>
          </View>
          <Text style={styles.price}>
            {product.currency} {product.price}
          </Text>
        </View>

        {/* Tags */}
        <View style={[styles.tagsRow, isRTL && { flexDirection: 'row-reverse' }]}>
          {product.tags.map((tag) => (
            <View
              key={tag}
              style={[
                styles.tag,
                tag === 'new' && styles.tagNew,
                tag === 'coming_soon' && styles.tagComingSoon,
                tag === 'order_to_buy' && styles.tagOrderToBuy,
              ]}
            >
              <Text style={styles.tagText}>
                {tag === 'new' && translations.new}
                {tag === 'coming_soon' && translations.comingSoon}
                {tag === 'order_to_buy' && translations.orderToBuy}
              </Text>
            </View>
          ))}
        </View>

        {/* Stock Status */}
        <View style={[styles.stockStatus, isRTL && { flexDirection: 'row-reverse' }]}>
          {product.stockCount === 0 ? (
            <Text style={styles.outOfStock}>{translations.outOfStock}</Text>
          ) : product.stockCount < 10 ? (
            <Text style={styles.lowStock}>
              {translations.lowStock}: {product.stockCount}
            </Text>
          ) : (
            <Text style={styles.inStock}>{translations.inStock}</Text>
          )}
        </View>

        {/* Stats */}
        <View style={[styles.statsRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <View style={styles.stat}>
            <Ionicons name="heart" size={20} color="#ef4444" />
            <Text style={styles.statText}>{product.likes} {translations.likes}</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="eye" size={20} color="#6b7280" />
            <Text style={styles.statText}>{product.viewsCount} {translations.views}</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="chatbubble" size={20} color="#2563eb" />
            <Text style={styles.statText}>{comments.length} {translations.comments}</Text>
          </View>
        </View>

        {/* Short Description */}
        {product.shortDescription && (
          <View>
            <Text style={styles.sectionTitle}>{translations.description}</Text>
            <Text style={styles.shortDescription}>{product.shortDescription}</Text>
          </View>
        )}

        {/* Full Description */}
        {product.fullDescription && (
          <View>
            <Text style={styles.sectionTitle}>
              {language === 'ar' ? 'الوصف الكامل' : 'Full Description'}
            </Text>
            <Text style={styles.fullDescription}>{product.fullDescription}</Text>
          </View>
        )}

        {/* Admin: Cost */}
        {isAdmin && product.cost && (
          <View style={styles.costSection}>
            <Text style={styles.costLabel}>{translations.cost}:</Text>
            <Text style={styles.costValue}>
              {product.currency} {product.cost}
            </Text>
          </View>
        )}
      </View>

      {/* Comments Section */}
      <View style={styles.commentsSection}>
        <Text style={styles.sectionTitle}>{translations.comments} ({comments.length})</Text>

        {/* Add Comment */}
        {user && (
          <View style={styles.addCommentForm}>
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.starButton}
                >
                  <Ionicons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={24}
                    color="#fbbf24"
                  />
                </TouchableOpacity>
              ))}
            </View>
            <View style={[styles.commentInputRow, isRTL && { flexDirection: 'row-reverse' }]}>
              <TextInput
                style={[styles.commentInput, isRTL && { textAlign: 'right' }]}
                placeholder={translations.addComment}
                placeholderTextColor="#9ca3af"
                value={commentText}
                onChangeText={setCommentText}
                multiline
              />
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmitComment}
                disabled={!commentText.trim() || submittingComment}
              >
                {submittingComment ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="send" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Comments List */}
        {comments.length === 0 ? (
          <View style={styles.noCommentsContainer}>
            <Ionicons name="chatbubble-outline" size={40} color="#9ca3af" />
            <Text style={styles.noCommentsText}>{translations.noComments}</Text>
          </View>
        ) : (
          <View style={styles.commentsList}>
            {comments.map((comment) => (
              <View key={comment.id} style={[styles.commentItem, isRTL && styles.rtl]}>
                <View style={styles.commentHeader}>
                  <View style={styles.commentAuthor}>
                    <Ionicons name="person-circle" size={32} color="#2563eb" />
                    <View style={styles.authorInfo}>
                      <Text style={styles.authorName}>{comment.user?.name || 'User'}</Text>
                      <View style={styles.commentRating}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Ionicons
                            key={star}
                            name={star <= comment.rating ? 'star' : 'star-outline'}
                            size={12}
                            color="#fbbf24"
                          />
                        ))}
                      </View>
                    </View>
                  </View>
                  <Text style={styles.commentDate}>
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.commentText}>{comment.text}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={[styles.actionButtons, isRTL && { flexDirection: 'row-reverse' }]}>
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton]}
          disabled={product.stockCount === 0 || !product.available}
        >
          <Ionicons name="cart" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>{translations.orderNow}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
          <Ionicons name="chatbubble-ellipses" size={20} color="#2563eb" />
          <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
            {translations.chat}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.tertiaryButton]}>
          <Ionicons name="sparkles" size={20} color="#8b5cf6" />
          <Text style={[styles.actionButtonText, styles.tertiaryButtonText]}>
            {translations.askAI}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Spacer for bottom padding */}
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  rtl: {
    textAlign: 'right',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  imageGallery: {
    position: 'relative',
    backgroundColor: '#fff',
  },
  productImage: {
    width: 300,
    height: 300,
  },
  imageDots: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  dotActive: {
    backgroundColor: '#2563eb',
  },
  productInfo: {
    padding: 16,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleLeft: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: '#6b7280',
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2563eb',
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagNew: {
    backgroundColor: '#10b981',
  },
  tagComingSoon: {
    backgroundColor: '#6b7280',
  },
  tagOrderToBuy: {
    backgroundColor: '#f59e0b',
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
  },
  stockStatus: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  inStock: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  outOfStock: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
  },
  lowStock: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f59e0b',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#6b7280',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  shortDescription: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  fullDescription: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 22,
  },
  costSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  costLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginRight: 8,
  },
  costValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#dc2626',
  },
  commentsSection: {
    padding: 16,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  addCommentForm: {
    marginBottom: 16,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  starButton: {
    padding: 2,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1f2937',
    maxHeight: 100,
  },
  submitButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noCommentsContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noCommentsText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
  },
  commentsList: {
    gap: 12,
  },
  commentItem: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
  },
  rtl: {
    textAlign: 'right',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  commentAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  commentRating: {
    flexDirection: 'row',
  },
  commentDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  commentText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    padding: 16,
    backgroundColor: '#fff',
    marginTop: 8,
    position: 'sticky',
    bottom: 0,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
  },
  secondaryButton: {
    backgroundColor: '#dbeafe',
  },
  tertiaryButton: {
    backgroundColor: '#f3e8ff',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButtonText: {
    color: '#2563eb',
  },
  tertiaryButtonText: {
    color: '#8b5cf6',
  },
  bottomSpacer: {
    height: 8,
  },
});
