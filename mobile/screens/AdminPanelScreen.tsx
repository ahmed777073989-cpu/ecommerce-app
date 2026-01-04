import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { useNavigation } from '@react-navigation/native';

const ADMIN_DASHBOARD_URL = 'http://localhost:5173';

export default function AdminPanelScreen() {
  const { user, language } = useAuthStore();
  const navigation = useNavigation();

  const isRTL = language === 'ar';

  const translations = {
    title: language === 'ar' ? 'لوحة الإدارة' : 'Admin Panel',
    adminDashboard: language === 'ar' ? 'لوحة التحكم' : 'Admin Dashboard',
    dashboardDesc: language === 'ar'
      ? 'الوصول إلى لوحة التحكم الكاملة للويب'
      : 'Access the full web admin dashboard',
    products: language === 'ar' ? 'المنتجات' : 'Products',
    accessCodes: language === 'ar' ? 'رموز الوصول' : 'Access Codes',
    users: language === 'ar' ? 'المستخدمون' : 'Users',
    reports: language === 'ar' ? 'التقارير' : 'Reports',
    settings: language === 'ar' ? 'الإعدادات' : 'Settings',
    openDashboard: language === 'ar' ? 'فتح لوحة التحكم' : 'Open Dashboard',
    back: language === 'ar' ? 'عودة' : 'Back',
  };

  const handleOpenDashboard = () => {
    Linking.openURL(ADMIN_DASHBOARD_URL).catch((err) => {
      Alert.alert(
        'Error',
        'Could not open admin dashboard. Please make sure the admin dashboard is running on port 5173.',
      );
    });
  };

  const menuItems = [
    {
      icon: 'cube-outline',
      title: translations.products,
      description: language === 'ar'
        ? 'إدارة المنتجات والأسهم'
        : 'Manage products and inventory',
    },
    {
      icon: 'key-outline',
      title: translations.accessCodes,
      description: language === 'ar'
        ? 'إنشاء وإدارة رموز الوصول'
        : 'Generate and manage access codes',
    },
    {
      icon: 'people-outline',
      title: translations.users,
      description: language === 'ar'
        ? 'إدارة المستخدمين والصلاحيات'
        : 'Manage users and permissions',
    },
    {
      icon: 'bar-chart-outline',
      title: translations.reports,
      description: language === 'ar'
        ? 'عرض التقارير والتحليلات'
        : 'View reports and analytics',
    },
    {
      icon: 'settings-outline',
      title: translations.settings,
      description: language === 'ar'
        ? 'إعدادات النظام والتكوين'
        : 'System settings and configuration',
    },
  ];

  return (
    <View style={[styles.container, isRTL && styles.rtl]}>
      {/* Header */}
      <View style={[styles.header, isRTL && { flexDirection: 'row-reverse' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons
            name={isRTL ? 'chevron-forward' : 'chevron-back'}
            size={24}
            color="#1f2937"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{translations.title}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Open Dashboard Button */}
        <TouchableOpacity
          style={styles.dashboardButton}
          onPress={handleOpenDashboard}
        >
          <View style={styles.dashboardIcon}>
            <Ionicons name="laptop-outline" size={40} color="#2563eb" />
          </View>
          <View style={styles.dashboardInfo}>
            <Text style={styles.dashboardTitle}>{translations.adminDashboard}</Text>
            <Text style={styles.dashboardDesc}>{translations.dashboardDesc}</Text>
          </View>
          <Ionicons
            name={isRTL ? 'chevron-back' : 'chevron-forward'}
            size={24}
            color="#9ca3af"
          />
        </TouchableOpacity>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>
            {language === 'ar' ? 'الإجراءات السريعة' : 'Quick Actions'}
          </Text>

          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, isRTL && styles.rtlItem]}
              onPress={handleOpenDashboard}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIcon}>
                  <Ionicons name={item.icon as any} size={24} color="#2563eb" />
                </View>
                <View style={styles.menuItemContent}>
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                  <Text style={styles.menuItemDesc}>{item.description}</Text>
                </View>
              </View>
              <Ionicons
                name={isRTL ? 'chevron-back' : 'chevron-forward'}
                size={20}
                color="#9ca3af"
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Info */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={24} color="#3b82f6" />
          <Text style={styles.infoText}>
            {language === 'ar'
              ? 'لوحة التحكم الكاملة متاحة على الويب. استخدم هذا الزر للوصول إليها.'
              : 'The full admin dashboard is available on the web. Use the button above to access it.'}
          </Text>
        </View>
      </ScrollView>
    </View>
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
  content: {
    flex: 1,
  },
  dashboardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dashboardIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashboardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  dashboardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  dashboardDesc: {
    fontSize: 14,
    color: '#6b7280',
  },
  menuSection: {
    marginTop: 8,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  rtlItem: {
    flexDirection: 'row-reverse',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemContent: {
    marginLeft: 12,
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  menuItemDesc: {
    fontSize: 13,
    color: '#6b7280',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#eff6ff',
    margin: 16,
    padding: 12,
    borderRadius: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1e40af',
    marginLeft: 12,
    lineHeight: 18,
  },
});
