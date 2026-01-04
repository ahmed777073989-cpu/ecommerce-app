import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProductsStore } from '../store/productsStore';
import { productsApi } from '../api/products';
import ProductCard from '../components/ProductCard';
import { useAuthStore } from '../store/authStore';

export default function HomeScreen({ navigation }: any) {
  const { user, logout, language, setLanguage } = useAuthStore();
  const {
    products,
    categories,
    loading,
    searchQuery,
    selectedCategory,
    selectedTag,
    sortBy,
    page,
    total,
    setProducts,
    setCategories,
    setLoading,
    setError,
    setSearchQuery,
    setSelectedCategory,
    setSelectedTag,
    setSortBy,
    setPage,
    resetFilters,
  } = useProductsStore();

  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [activeTab, setActiveTab] = useState<'browse' | 'search' | 'profile'>('browse');

  const isRTL = language === 'ar';

  const translations = {
    browse: language === 'ar' ? 'تصفح' : 'Browse',
    search: language === 'ar' ? 'بحث' : 'Search',
    profile: language === 'ar' ? 'الملف الشخصي' : 'Profile',
    all: language === 'ar' ? 'الكل' : 'All',
    new: language === 'ar' ? 'جديد' : 'New',
    comingSoon: language === 'ar' ? 'قريباً' : 'Coming Soon',
    orderToBuy: language === 'ar' ? 'اطلب للشراء' : 'Order to Buy',
    searchPlaceholder: language === 'ar' ? 'ابحث عن المنتجات...' : 'Search products...',
    noProducts: language === 'ar' ? 'لا توجد منتجات' : 'No products found',
    loadMore: language === 'ar' ? 'تحميل المزيد' : 'Load More',
    welcome: language === 'ar' ? 'مرحباً' : 'Welcome',
    logout: language === 'ar' ? 'تسجيل الخروج' : 'Logout',
    sort: language === 'ar' ? 'ترتيب حسب' : 'Sort By',
    newest: language === 'ar' ? 'الأحدث' : 'Newest',
    priceLow: language === 'ar' ? 'السعر: من الأقل' : 'Price: Low to High',
    priceHigh: language === 'ar' ? 'السعر: من الأعلى' : 'Price: High to Low',
    trending: language === 'ar' ? 'الأكثر شيوعاً' : 'Trending',
  };

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [searchQuery, selectedCategory, selectedTag, sortBy, page]);

  const loadCategories = async () => {
    try {
      const data = await productsApi.getCategories();
      setCategories(data);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load categories');
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params: any = {
        search: searchQuery || undefined,
        category: selectedCategory || undefined,
        tag: selectedTag || undefined,
        sortBy,
        page,
        limit: 20,
      };

      const response = await productsApi.getProducts(params);

      if (page === 1) {
        setProducts(response.products);
      } else {
        setProducts([...products, ...response.products]);
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    loadProducts();
  };

  const handleLoadMore = () => {
    if (products.length < total && !loading) {
      setPage(page + 1);
    }
  };

  const handleCategoryPress = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
  };

  const handleTagPress = (tag: string | null) => {
    setSelectedTag(tag);
  };

  const handleLogout = () => {
    Alert.alert(
      language === 'ar' ? 'تأكيد' : 'Confirm',
      language === 'ar' ? 'هل تريد تسجيل الخروج؟' : 'Are you sure you want to logout?',
      [
        { text: language === 'ar' ? 'إلغاء' : 'Cancel', style: 'cancel' },
        {
          text: language === 'ar' ? 'نعم' : 'Yes',
          onPress: async () => {
            await logout();
            navigation.replace('Splash' as never);
          },
        },
      ]
    );
  };

  const renderBrowseTab = () => (
    <ScrollView
      style={[styles.tabContent, isRTL && styles.rtl]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
      onMomentumScrollEnd={({ nativeEvent }) => {
        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
        const paddingToBottom = 20;
        if (
          layoutMeasurement.height + contentOffset.y >=
          contentSize.height - paddingToBottom
        ) {
          handleLoadMore();
        }
      }}
    >
      {/* Categories Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={isRTL ? styles.rtlContainer : null}
      >
        <TouchableOpacity
          style={[
            styles.categoryChip,
            selectedCategory === null && styles.categoryChipActive,
          ]}
          onPress={() => handleCategoryPress(null)}
        >
          <Text
            style={[
              styles.categoryText,
              selectedCategory === null && styles.categoryTextActive,
            ]}
          >
            {translations.all}
          </Text>
        </TouchableOpacity>

        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && styles.categoryChipActive,
            ]}
            onPress={() => handleCategoryPress(category.id)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextActive,
              ]}
            >
              {language === 'ar' ? category.nameAr : category.nameEn}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tags */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tagsContainer}
        contentContainerStyle={isRTL ? styles.rtlContainer : null}
      >
        <TouchableOpacity
          style={[
            styles.tagChip,
            selectedTag === null && styles.tagChipActive,
          ]}
          onPress={() => handleTagPress(null)}
        >
          <Text
            style={[
              styles.tagText,
              selectedTag === null && styles.tagTextActive,
            ]}
          >
            {translations.all}
          </Text>
        </TouchableOpacity>

        {[
          { id: 'new', label: translations.new },
          { id: 'coming_soon', label: translations.comingSoon },
          { id: 'order_to_buy', label: translations.orderToBuy },
        ].map((tag) => (
          <TouchableOpacity
            key={tag.id}
            style={[
              styles.tagChip,
              selectedTag === tag.id && styles.tagChipActive,
            ]}
            onPress={() => handleTagPress(tag.id)}
          >
            <Text
              style={[
                styles.tagText,
                selectedTag === tag.id && styles.tagTextActive,
              ]}
            >
              {tag.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sort */}
      <View style={[styles.sortContainer, isRTL && { flexDirection: 'row-reverse' }]}>
        <Text style={styles.sortLabel}>{translations.sort}:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.sortOptions}
          contentContainerStyle={isRTL ? styles.rtlContainer : null}
        >
          {[
            { id: 'newest', label: translations.newest },
            { id: 'price_asc', label: translations.priceLow },
            { id: 'price_desc', label: translations.priceHigh },
            { id: 'trending', label: translations.trending },
          ].map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.sortChip,
                sortBy === option.id && styles.sortChipActive,
              ]}
              onPress={() => setSortBy(option.id)}
            >
              <Text
                style={[
                  styles.sortText,
                  sortBy === option.id && styles.sortTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Products */}
      {products.length === 0 && !loading ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="pricetag-outline" size={60} color="#9ca3af" />
          <Text style={styles.emptyText}>{translations.noProducts}</Text>
        </View>
      ) : (
        <View style={styles.productsContainer}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} language={language} />
          ))}
          {loading && page > 1 && (
            <ActivityIndicator style={styles.loader} size="large" color="#2563eb" />
          )}
        </View>
      )}
    </ScrollView>
  );

  const renderSearchTab = () => (
    <View style={[styles.tabContent, isRTL && styles.rtl]}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, isRTL && { textAlign: 'right' }]}
          placeholder={translations.searchPlaceholder}
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#9ca3af" />
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {products.length === 0 && !loading ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={60} color="#9ca3af" />
            <Text style={styles.emptyText}>{translations.noProducts}</Text>
          </View>
        ) : (
          <View style={styles.productsContainer}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} language={language} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );

  const renderProfileTab = () => (
    <ScrollView style={[styles.tabContent, isRTL && styles.rtl]}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color="#fff" />
        </View>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userPhone}>{user?.phone}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user?.role}</Text>
        </View>
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => setLanguage(language === 'en' ? 'ar' : 'en')}
        >
          <Ionicons name="language" size={24} color="#4b5563" />
          <Text style={styles.menuText}>
            {language === 'en' ? 'Switch to Arabic' : 'التبديل للإنجليزية'}
          </Text>
          <Ionicons
            name={isRTL ? 'chevron-back' : 'chevron-forward'}
            size={20}
            color="#9ca3af"
          />
        </TouchableOpacity>

        {(user?.role === 'admin' || user?.role === 'super_admin') && (
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('AdminPanel' as never)}
          >
            <Ionicons name="settings" size={24} color="#4b5563" />
            <Text style={styles.menuText}>
              {language === 'ar' ? 'لوحة التحكم' : 'Admin Panel'}
            </Text>
            <Ionicons
              name={isRTL ? 'chevron-back' : 'chevron-forward'}
              size={20}
              color="#9ca3af"
            />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="help-circle-outline" size={24} color="#4b5563" />
          <Text style={styles.menuText}>
            {language === 'ar' ? 'مساعدة' : 'Help & Support'}
          </Text>
          <Ionicons
            name={isRTL ? 'chevron-back' : 'chevron-forward'}
            size={20}
            color="#9ca3af"
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="information-circle-outline" size={24} color="#4b5563" />
          <Text style={styles.menuText}>
            {language === 'ar' ? 'حول التطبيق' : 'About'}
          </Text>
          <Ionicons
            name={isRTL ? 'chevron-back' : 'chevron-forward'}
            size={20}
            color="#9ca3af"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#dc2626" />
        <Text style={styles.logoutText}>{translations.logout}</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, isRTL && { flexDirection: 'row-reverse' }]}>
        <Text style={styles.headerTitle}>
          {activeTab === 'profile' && user?.name ? `${translations.welcome}, ${user.name.split(' ')[0]}` : translations.browse}
        </Text>
        {activeTab !== 'search' && (
          <TouchableOpacity onPress={() => setActiveTab('search')}>
            <Ionicons name="search" size={24} color="#1f2937" />
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, isRTL && styles.rtlTabs]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'browse' && styles.tabActive]}
          onPress={() => setActiveTab('browse')}
        >
          <Ionicons
            name="grid-outline"
            size={24}
            color={activeTab === 'browse' ? '#2563eb' : '#9ca3af'}
          />
          <Text
            style={[styles.tabText, activeTab === 'browse' && styles.tabTextActive]}
          >
            {translations.browse}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'search' && styles.tabActive]}
          onPress={() => setActiveTab('search')}
        >
          <Ionicons
            name="search"
            size={24}
            color={activeTab === 'search' ? '#2563eb' : '#9ca3af'}
          />
          <Text
            style={[styles.tabText, activeTab === 'search' && styles.tabTextActive]}
          >
            {translations.search}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'profile' && styles.tabActive]}
          onPress={() => setActiveTab('profile')}
        >
          <Ionicons
            name="person-outline"
            size={24}
            color={activeTab === 'profile' ? '#2563eb' : '#9ca3af'}
          />
          <Text
            style={[styles.tabText, activeTab === 'profile' && styles.tabTextActive]}
          >
            {translations.profile}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'browse' && renderBrowseTab()}
      {activeTab === 'search' && renderSearchTab()}
      {activeTab === 'profile' && renderProfileTab()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
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
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  rtlTabs: {
    flexDirection: 'row-reverse',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 4,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9ca3af',
  },
  tabTextActive: {
    color: '#2563eb',
  },
  tabContent: {
    flex: 1,
  },
  rtl: {
    textAlign: 'right',
  },
  categoriesContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  rtlContainer: {
    flexDirection: 'row-reverse',
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#2563eb',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  categoryTextActive: {
    color: '#fff',
  },
  tagsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fef3c7',
    borderRadius: 16,
    marginRight: 8,
  },
  tagChipActive: {
    backgroundColor: '#f59e0b',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#92400e',
  },
  tagTextActive: {
    color: '#fff',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sortLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginRight: 8,
  },
  sortOptions: {
    flex: 1,
  },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    marginRight: 8,
  },
  sortChipActive: {
    backgroundColor: '#2563eb',
  },
  sortText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  sortTextActive: {
    color: '#fff',
  },
  productsContainer: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 12,
  },
  loader: {
    paddingVertical: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#fff',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 12,
  },
  roleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#dbeafe',
    borderRadius: 16,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    textTransform: 'capitalize',
  },
  menuSection: {
    marginTop: 16,
    backgroundColor: '#fff',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    marginHorizontal: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    marginTop: 32,
    paddingVertical: 16,
    backgroundColor: '#fee2e2',
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
    marginLeft: 8,
  },
});
