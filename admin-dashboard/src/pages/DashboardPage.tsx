import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { adminApi } from '../api/auth';
import { productsApi } from '../api/products';
import { FiCode, FiUsers, FiPackage, FiBarChart, FiFileText } from 'react-icons/fi';

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('access-codes');
  const [codes, setCodes] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    role: 'user',
    validDays: 30,
    usesAllowed: 1,
    count: 1,
    note: '',
  });

  useEffect(() => {
    if (activeTab === 'access-codes') {
      loadCodes();
    } else if (activeTab === 'products') {
      loadProducts();
    }
  }, [activeTab]);

  const loadCodes = async () => {
    try {
      const response = await adminApi.listCodes();
      setCodes(response.data);
    } catch (error) {
      console.error('Error loading codes:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await productsApi.getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleGenerateCodes = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      await adminApi.generateCodes(formData);
      alert('Access codes generated successfully!');
      loadCodes();
      setFormData({
        role: 'user',
        validDays: 30,
        usesAllowed: 1,
        count: 1,
        note: '',
      });
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Failed to generate codes');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              {user?.name} ({user?.role})
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow p-4">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('access-codes')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    activeTab === 'access-codes'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FiCode />
                  Access Codes
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    activeTab === 'users'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FiUsers />
                  Users
                </button>
                <button
                  onClick={() => setActiveTab('products')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    activeTab === 'products'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FiPackage />
                  Products
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    activeTab === 'analytics'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FiBarChart />
                  Analytics
                </button>
                <button
                  onClick={() => setActiveTab('audit-logs')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    activeTab === 'audit-logs'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FiFileText />
                  Audit Logs
                </button>
              </nav>
            </div>
          </div>

          <div className="md:col-span-4">
            <div className="bg-white rounded-lg shadow p-6">
              {activeTab === 'access-codes' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Access Code Manager</h2>

                  <div className="mb-8 bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Generate New Codes</h3>
                    <form onSubmit={handleGenerateCodes} className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Role
                        </label>
                        <select
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Valid Days
                        </label>
                        <input
                          type="number"
                          value={formData.validDays}
                          onChange={(e) =>
                            setFormData({ ...formData, validDays: parseInt(e.target.value) })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          min="1"
                          max="3650"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Uses Allowed
                        </label>
                        <input
                          type="number"
                          value={formData.usesAllowed}
                          onChange={(e) =>
                            setFormData({ ...formData, usesAllowed: parseInt(e.target.value) })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          min="1"
                          max="1000"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Count
                        </label>
                        <input
                          type="number"
                          value={formData.count}
                          onChange={(e) =>
                            setFormData({ ...formData, count: parseInt(e.target.value) })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          min="1"
                          max="100"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Note (Optional)
                        </label>
                        <input
                          type="text"
                          value={formData.note}
                          onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="e.g., For Q1 2024 users"
                        />
                      </div>

                      <div className="col-span-2">
                        <button
                          type="submit"
                          disabled={isGenerating}
                          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                        >
                          {isGenerating ? 'Generating...' : 'Generate Codes'}
                        </button>
                      </div>
                    </form>
                  </div>

                  <h3 className="text-lg font-semibold mb-4">All Access Codes</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Code
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Role
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Uses
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Valid Until
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {codes.map((code) => (
                          <tr key={code.id}>
                            <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">
                              {code.code}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                {code.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {code.usesCount} / {code.usesAllowed}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {new Date(code.validUntil).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                  code.isUsed
                                    ? 'bg-gray-100 text-gray-800'
                                    : 'bg-green-100 text-green-800'
                                }`}
                              >
                                {code.isUsed ? 'Used' : 'Active'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Users</h2>
                  <p className="text-gray-600">User management coming in Phase 1.5</p>
                </div>
              )}

              {activeTab === 'products' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Products Overview</h2>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-600 font-medium">Total Products</p>
                      <p className="text-3xl font-bold text-blue-900">{products.length}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-600 font-medium">Available</p>
                      <p className="text-3xl font-bold text-green-900">{products.filter(p => p.available).length}</p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <p className="text-sm text-orange-600 font-medium">Low Stock</p>
                      <p className="text-3xl font-bold text-orange-900">{products.filter(p => p.stockCount > 0 && p.stockCount < 10).length}</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-600 font-medium">Out of Stock</p>
                      <p className="text-3xl font-bold text-red-900">{products.filter(p => p.stockCount === 0).length}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Low Stock Alerts</h3>
                      {products.filter(p => p.stockCount > 0 && p.stockCount < 10).length === 0 ? (
                        <p className="text-gray-500">No low stock items</p>
                      ) : (
                        <div className="space-y-2">
                          {products
                            .filter(p => p.stockCount > 0 && p.stockCount < 10)
                            .slice(0, 5)
                            .map(product => (
                              <div key={product.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                                <div>
                                  <p className="font-medium">{product.title}</p>
                                  <p className="text-sm text-gray-500">{product.stockCount} units left</p>
                                </div>
                                <button
                                  onClick={() => navigate('/products')}
                                  className="px-3 py-1 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700"
                                >
                                  Update Stock
                                </button>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Recently Added</h3>
                      {products.length === 0 ? (
                        <p className="text-gray-500">No products yet</p>
                      ) : (
                        <div className="space-y-2">
                          {products
                            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                            .slice(0, 5)
                            .map(product => (
                              <div key={product.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                <img
                                  src={product.images[0] || 'https://via.placeholder.com/60'}
                                  alt=""
                                  className="w-12 h-12 rounded object-cover"
                                />
                                <div className="flex-1">
                                  <p className="font-medium">{product.title}</p>
                                  <p className="text-sm text-gray-500">
                                    {product.currency} {product.price}
                                  </p>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  product.available
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {product.available ? 'Available' : 'Unavailable'}
                                </span>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 text-center">
                    <button
                      onClick={() => navigate('/products')}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Manage Products
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'analytics' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Analytics</h2>
                  <p className="text-gray-600">Analytics dashboard coming in Phase 2</p>
                </div>
              )}

              {activeTab === 'audit-logs' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Audit Logs</h2>
                  <p className="text-gray-600">Audit logs viewer coming in Phase 1.5</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
