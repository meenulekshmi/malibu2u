'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Boxes,
  Repeat,
  Image as ImageIcon,
  Ticket,
  Star,
  Users,
  Settings,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Eye,
  AlertTriangle,
  RefreshCw,
  Search,
  ExternalLink,
  ShieldCheck,
  DollarSign,
  TrendingUp,
  Upload,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { formatDisplayPhoneNumber, normalizeWhatsAppNumber } from '@/lib/whatsapp';

type TabType = 'overview' | 'products' | 'categories' | 'orders' | 'inventory' | 'sell-trade' | 'banners' | 'coupons' | 'reviews' | 'customers' | 'settings';

interface AdminDashboardProps {
  initialProducts: any[];
  initialOrders: any[];
  initialSellRequests: any[];
}

export function AdminDashboardClient({
  initialProducts,
  initialOrders,
  initialSellRequests,
}: AdminDashboardProps) {
  const router = useRouter();

  // State initialization
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Real DB state
  const [products, setProducts] = useState<any[]>(initialProducts);
  const [orders, setOrders] = useState<any[]>(initialOrders);
  const [sellRequests, setSellRequests] = useState<any[]>(initialSellRequests);
  const [categories, setCategories] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [whatsappInput, setWhatsappInput] = useState('');
  const [savingWhatsapp, setSavingWhatsapp] = useState(false);
  const [whatsappMsg, setWhatsappMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Search & Filter local states
  const [searchTerm, setSearchTerm] = useState('');

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>, onComplete: (dataUrl: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert('File is too large. Please select an image under 8MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onComplete(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Modals state
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);

  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any | null>(null);

  const [couponModalOpen, setCouponModalOpen] = useState(false);

  const [orderDetailModal, setOrderDetailModal] = useState<any | null>(null);
  const [sellDetailModal, setSellDetailModal] = useState<any | null>(null);

  // Product Form State
  const [prodForm, setProdForm] = useState({
    id: '',
    name: '',
    slug: '',
    sku: '',
    categoryId: '',
    platform: 'PS5',
    brand: 'PlayStation',
    condition: 'NEW',
    price: '',
    mrp: '',
    discountPrice: '',
    stock: '10',
    lowStockThreshold: '2',
    shortDescription: '',
    description: '',
    specsJson: '',
    imageUrls: [''],
    isFeatured: false,
    isBestSeller: false,
    isPreOrder: false,
    isNewArrival: false,
    isOnSale: false,
    isPreOwned: false,
  });

  // Category Form State
  const [catForm, setCatForm] = useState({
    id: '',
    name: '',
    slug: '',
    image: '',
    description: '',
    isFeatured: false,
    parentId: '',
  });

  // Banner Form State
  const [bannerForm, setBannerForm] = useState({
    id: '',
    title: '',
    subtitle: '',
    image: '',
    buttonText: 'Shop Now',
    buttonUrl: '/shop',
    displayOrder: '0',
    active: true,
  });

  // Coupon Form State
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountPercent: '',
    discountAmount: '',
    minPurchase: '0',
    maxDiscount: '',
    expiryDate: '',
    usageLimit: '',
    active: true,
  });

  // Fetch complete data on mount or tab change
  const safeFetchJson = async (url: string) => {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const text = await res.text();
      return text ? JSON.parse(text) : null;
    } catch (e) {
      return null;
    }
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      const [resProd, resCat, resOrd, resSell, resBan, resCoup, resRev, resCust] = await Promise.all([
        safeFetchJson('/api/admin/products'),
        safeFetchJson('/api/admin/categories'),
        safeFetchJson('/api/admin/orders'),
        safeFetchJson('/api/admin/sell-trade'),
        safeFetchJson('/api/admin/banners'),
        safeFetchJson('/api/admin/coupons'),
        safeFetchJson('/api/admin/reviews'),
        safeFetchJson('/api/admin/customers'),
      ]);

      if (resProd?.products) setProducts(resProd.products);
      if (resCat?.categories) setCategories(resCat.categories);
      if (resOrd?.orders) setOrders(resOrd.orders);
      if (resSell?.requests) setSellRequests(resSell.requests);
      if (resBan?.banners) setBanners(resBan.banners);
      if (resCoup?.coupons) setCoupons(resCoup.coupons);
      if (resRev?.reviews) setReviews(resRev.reviews);
      if (resCust?.customers) setCustomers(resCust.customers);
    } catch (e) {
      console.error('Failed to fetch admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
    if (activeTab === 'settings') {
      fetch('/api/admin/settings')
        .then((res) => res.json())
        .then((data) => {
          if (data?.whatsappNumber) {
            setWhatsappInput(data.whatsappNumber);
          }
        })
        .catch(() => {});
    }
  }, [activeTab]);

  const handleSaveWhatsappSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingWhatsapp(true);
    setWhatsappMsg(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatsappNumber: whatsappInput }),
      });
      const data = await res.json();
      if (res.ok) {
        setWhatsappMsg({ type: 'success', text: 'WhatsApp Support Number saved successfully! Dynamic site updates active.' });
      } else {
        setWhatsappMsg({ type: 'error', text: data?.error || 'Failed to save WhatsApp number' });
      }
    } catch (err: any) {
      setWhatsappMsg({ type: 'error', text: 'Failed to update settings' });
    } finally {
      setSavingWhatsapp(false);
    }
  };

  // Product CRUD handlers
  const handleOpenCreateProduct = () => {
    setEditingProduct(null);
    setProdForm({
      id: '',
      name: '',
      slug: '',
      sku: `SKU-${Math.floor(100000 + Math.random() * 900000)}`,
      categoryId: categories[0]?.id || '',
      platform: 'PS5',
      brand: 'PlayStation',
      condition: 'NEW',
      price: '',
      mrp: '',
      discountPrice: '',
      stock: '10',
      lowStockThreshold: '2',
      shortDescription: '',
      description: '',
      specsJson: '',
      imageUrls: [''],
      isFeatured: false,
      isBestSeller: false,
      isPreOrder: false,
      isNewArrival: false,
      isOnSale: false,
      isPreOwned: false,
    });
    setProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: any) => {
    setEditingProduct(prod);
    setProdForm({
      id: prod.id,
      name: prod.name,
      slug: prod.slug,
      sku: prod.sku,
      categoryId: prod.categoryId,
      platform: prod.platform,
      brand: prod.brand,
      condition: prod.condition,
      price: prod.price?.toString() || '',
      mrp: prod.mrp?.toString() || '',
      discountPrice: prod.discountPrice?.toString() || '',
      stock: prod.stock?.toString() || '0',
      lowStockThreshold: prod.lowStockThreshold?.toString() || '2',
      shortDescription: prod.shortDescription || '',
      description: prod.description || '',
      specsJson: prod.specsJson || '',
      imageUrls: prod.images?.length > 0 ? prod.images.map((i: any) => i.url) : [''],
      isFeatured: Boolean(prod.isFeatured),
      isBestSeller: Boolean(prod.isBestSeller),
      isPreOrder: Boolean(prod.isPreOrder),
      isNewArrival: Boolean(prod.isNewArrival),
      isOnSale: Boolean(prod.isOnSale),
      isPreOwned: Boolean(prod.isPreOwned),
    });
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingProduct ? 'PUT' : 'POST';
    const res = await fetch('/api/admin/products', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prodForm),
    });

    if (res.ok) {
      setProductModalOpen(false);
      refreshData();
      router.refresh();
    } else {
      const text = await res.text();
      let err: any = {};
      try { err = text ? JSON.parse(text) : {}; } catch(e) {}
      alert(`Error saving product: ${err.error || text || 'Unknown error'}`);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    const res = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      refreshData();
      router.refresh();
    }
  };

  // Category CRUD Handlers
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingCategory ? 'PUT' : 'POST';
    const res = await fetch('/api/admin/categories', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(catForm),
    });

    if (res.ok) {
      setCategoryModalOpen(false);
      refreshData();
    } else {
      const text = await res.text();
      let err: any = {};
      try { err = text ? JSON.parse(text) : {}; } catch(e) {}
      alert(`Error: ${err.error || text || 'Failed to save category'}`);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' });
    refreshData();
  };

  // Banner CRUD Handlers
  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingBanner ? 'PUT' : 'POST';
    const res = await fetch('/api/admin/banners', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bannerForm),
    });

    if (res.ok) {
      setBannerModalOpen(false);
      refreshData();
    } else {
      const text = await res.text();
      let err: any = {};
      try { err = text ? JSON.parse(text) : {}; } catch(e) {}
      alert(`Error: ${err.error || text || 'Failed to save banner'}`);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Delete banner?')) return;
    await fetch(`/api/admin/banners?id=${id}`, { method: 'DELETE' });
    refreshData();
  };

  // Coupon CRUD Handlers
  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(couponForm),
    });

    if (res.ok) {
      setCouponModalOpen(false);
      setCouponForm({
        code: '',
        discountType: 'PERCENTAGE',
        discountPercent: '',
        discountAmount: '',
        minPurchase: '0',
        maxDiscount: '',
        expiryDate: '',
        usageLimit: '',
        active: true,
      });
      refreshData();
    } else {
      const text = await res.text();
      let err: any = {};
      try { err = text ? JSON.parse(text) : {}; } catch(e) {}
      alert(`Error: ${err.error || text || 'Failed to save coupon'}`);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('Delete coupon?')) return;
    await fetch(`/api/admin/coupons?id=${id}`, { method: 'DELETE' });
    refreshData();
  };

  // Order Status Update
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    const res = await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: orderId, status }),
    });

    if (res.ok) {
      refreshData();
      if (orderDetailModal) {
        setOrderDetailModal({ ...orderDetailModal, status });
      }
    }
  };

  // Sell Request Update
  const handleUpdateSellRequest = async (id: string, updates: any) => {
    const res = await fetch('/api/admin/sell-trade', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    });

    if (res.ok) {
      refreshData();
      if (sellDetailModal) {
        setSellDetailModal({ ...sellDetailModal, ...updates });
      }
    }
  };

  // Review Moderate
  const handleModerateReview = async (id: string, isApproved: boolean) => {
    await fetch('/api/admin/reviews', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isApproved }),
    });
    refreshData();
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm('Delete review?')) return;
    await fetch(`/api/admin/reviews?id=${id}`, { method: 'DELETE' });
    refreshData();
  };

  // Inventory Stock Quick Update
  const handleUpdateStock = async (id: string, newStock: number) => {
    await fetch('/api/admin/inventory', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, stock: newStock }),
    });
    refreshData();
  };

  // Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingOrders = orders.filter((o) => o.status === 'PROCESSING' || o.status === 'ORDER_PLACED' || o.status === 'ADVANCE_PAID');
  const completedOrders = orders.filter((o) => o.status === 'DELIVERED');
  const pendingSellQuotes = sellRequests.filter((r) => r.status === 'PENDING' || r.status === 'UNDER_REVIEW');
  const lowStockCount = products.filter((p) => p.stock <= (p.lowStockThreshold || 2)).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* Sidebar Navigation */}
      <aside className="lg:col-span-3 space-y-2">
        <div className="p-4 rounded-2xl bg-[#111726] border border-slate-800 space-y-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'overview' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className="w-4 h-4" /> Overview
            </div>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'products' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Package className="w-4 h-4" /> Products
            </div>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono text-cyan-400">
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'categories' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FolderTree className="w-4 h-4" /> Categories
            </div>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono text-cyan-400">
              {categories.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'orders' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-4 h-4" /> Customer Orders
            </div>
            {pendingOrders.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-extrabold">
                {pendingOrders.length} New
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'inventory' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Boxes className="w-4 h-4" /> Stock Inventory
            </div>
            {lowStockCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-mono font-extrabold">
                {lowStockCount} Alert
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('sell-trade')}
            className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'sell-trade' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Repeat className="w-4 h-4" /> Sell & Trade Quotes
            </div>
            {pendingSellQuotes.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-extrabold">
                {pendingSellQuotes.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('banners')}
            className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'banners' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ImageIcon className="w-4 h-4" /> Hero Banners
            </div>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono text-cyan-400">
              {banners.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'coupons' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Ticket className="w-4 h-4" /> Coupons & Promos
            </div>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono text-cyan-400">
              {coupons.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'reviews' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Star className="w-4 h-4" /> Review Moderation
            </div>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono text-cyan-400">
              {reviews.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'customers' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4" /> Customer Directory
            </div>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono text-cyan-400">
              {customers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'settings' ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Settings className="w-4 h-4" /> System Settings
            </div>
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 text-xs space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 font-bold">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Live Sync Active</span>
          </div>
          <p className="text-[11px] text-slate-400">
            All changes update the database and auto-reflect on customer storefront.
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="lg:col-span-9 space-y-6">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#111726] border border-slate-800 space-y-4">
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" /> Store Metrics Overview
              </h2>
              <p className="text-xs text-slate-400">
                Calculated directly from database records. Zero hardcoded statistics.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Gross Sales</span>
                  <p className="text-xl font-black text-emerald-400 font-mono">₹{totalRevenue.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Total Orders</span>
                  <p className="text-xl font-black text-cyan-400 font-mono">{orders.length}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Pending Quotes</span>
                  <p className="text-xl font-black text-amber-400 font-mono">{pendingSellQuotes.length}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Catalog Products</span>
                  <p className="text-xl font-black text-violet-400 font-mono">{products.length}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <div className="p-6 rounded-2xl bg-[#111726] border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Recent Customer Orders</h3>
                  <button onClick={() => setActiveTab('orders')} className="text-xs text-cyan-400 font-bold hover:underline">
                    View All &rarr;
                  </button>
                </div>

                {orders.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">No orders recorded in database yet.</p>
                ) : (
                  <div className="space-y-2">
                    {orders.slice(0, 5).map((ord) => (
                      <div key={ord.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-white font-mono">{ord.id.slice(0, 8)}...</p>
                          <p className="text-[10px] text-slate-400">{ord.user?.name || 'Customer'}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-cyan-400 font-mono">₹{ord.totalAmount.toLocaleString()}</p>
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                            {ord.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pending Sell/Trade Quotes */}
              <div className="p-6 rounded-2xl bg-[#111726] border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Pending Sell & Trade Quotes</h3>
                  <button onClick={() => setActiveTab('sell-trade')} className="text-xs text-cyan-400 font-bold hover:underline">
                    View All &rarr;
                  </button>
                </div>

                {sellRequests.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">No sell/trade requests submitted yet.</p>
                ) : (
                  <div className="space-y-2">
                    {sellRequests.slice(0, 5).map((req) => (
                      <div key={req.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-white">{req.itemName}</p>
                          <p className="text-[10px] text-slate-400">{req.fullName} ({req.platform})</p>
                        </div>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                          {req.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#111726] border border-slate-800">
              <div>
                <h2 className="text-xl font-extrabold text-white">Product Catalog Management</h2>
                <p className="text-xs text-slate-400">Add, edit, pricing, stock, images, and publish store products.</p>
              </div>
              <button
                onClick={handleOpenCreateProduct}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-500/20 hover:brightness-110"
              >
                <Plus className="w-4 h-4" /> Add New Product
              </button>
            </div>

            {/* Product Table */}
            <div className="p-6 rounded-2xl bg-[#111726] border border-slate-800 overflow-x-auto">
              {products.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <Package className="w-12 h-12 text-slate-600 mx-auto" />
                  <h3 className="text-lg font-bold text-white">No products available yet.</h3>
                  <p className="text-xs text-slate-400">Add your first product to display it on the customer storefront.</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs text-slate-300 border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-mono">
                      <th className="py-3 px-2">Item</th>
                      <th className="py-3 px-2">SKU</th>
                      <th className="py-3 px-2">Platform</th>
                      <th className="py-3 px-2">Condition</th>
                      <th className="py-3 px-2">Price</th>
                      <th className="py-3 px-2">Stock</th>
                      <th className="py-3 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {products.map((p) => {
                      const primaryImage = p.images?.find((i: any) => i.isPrimary)?.url || p.images?.[0]?.url || 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db';
                      return (
                        <tr key={p.id} className="hover:bg-slate-900/60 transition-colors">
                          <td className="py-3 px-2 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-900 overflow-hidden relative shrink-0">
                              <Image src={primaryImage} alt={p.name} fill className="object-cover" />
                            </div>
                            <span className="font-bold text-white truncate max-w-[180px]">{p.name}</span>
                          </td>
                          <td className="py-3 px-2 font-mono text-slate-400">{p.sku}</td>
                          <td className="py-3 px-2 font-mono text-cyan-400">{p.platform}</td>
                          <td className="py-3 px-2 font-mono text-emerald-400">{p.condition}</td>
                          <td className="py-3 px-2 font-bold font-mono text-white">₹{p.price.toLocaleString()}</td>
                          <td className="py-3 px-2 font-mono">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.stock <= p.lowStockThreshold ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-slate-800 text-slate-300'}`}>
                              {p.stock}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right space-x-2">
                            <button
                              onClick={() => handleOpenEditProduct(p)}
                              className="p-1.5 rounded-lg bg-slate-800 text-cyan-400 hover:bg-slate-700"
                              title="Edit Product"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-1.5 rounded-lg bg-slate-800 text-red-400 hover:bg-slate-700"
                              title="Delete Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* CATEGORIES TAB */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-6 rounded-2xl bg-[#111726] border border-slate-800">
              <div>
                <h2 className="text-xl font-extrabold text-white">Category & Platform Management</h2>
                <p className="text-xs text-slate-400">Organize gaming catalog categories and parent/child subcategories.</p>
              </div>
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setCatForm({ id: '', name: '', slug: '', image: '', description: '', isFeatured: false, parentId: '' });
                  setCategoryModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-500/20"
              >
                + Add Category
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {categories.length === 0 ? (
                <div className="col-span-full p-8 text-center bg-[#111726] rounded-2xl border border-slate-800">
                  <p className="text-xs text-slate-400">No categories created yet.</p>
                </div>
              ) : (
                categories.map((cat) => (
                  <div key={cat.id} className="p-4 rounded-xl bg-[#111726] border border-slate-800 space-y-3 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">{cat.name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">/ {cat.slug}</p>
                      <p className="text-xs text-slate-300 mt-1 line-clamp-2">{cat.description || 'No description'}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-[10px] font-mono text-cyan-400">{cat._count?.products || 0} Products</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingCategory(cat);
                            setCatForm({
                              id: cat.id,
                              name: cat.name,
                              slug: cat.slug,
                              image: cat.image || '',
                              description: cat.description || '',
                              isFeatured: cat.isFeatured,
                              parentId: cat.parentId || '',
                            });
                            setCategoryModalOpen(true);
                          }}
                          className="text-cyan-400 hover:underline"
                        >
                          Edit
                        </button>
                        <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-400 hover:underline">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#111726] border border-slate-800">
              <h2 className="text-xl font-extrabold text-white">Real Customer Orders</h2>
              <p className="text-xs text-slate-400">Manage 50% Cashfree advance payments and 50% remaining COD deliveries.</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#111726] border border-slate-800 overflow-x-auto">
              {orders.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400">No customer orders recorded yet.</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs text-slate-300">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-mono">
                      <th className="py-3 px-2">Order ID</th>
                      <th className="py-3 px-2">Customer</th>
                      <th className="py-3 px-2">Total</th>
                      <th className="py-3 px-2">50% Advance</th>
                      <th className="py-3 px-2">50% COD</th>
                      <th className="py-3 px-2">Status</th>
                      <th className="py-3 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-900/60">
                        <td className="py-3 px-2 font-mono font-bold text-white">{o.id.slice(0, 8)}...</td>
                        <td className="py-3 px-2">
                          <p className="font-bold text-white">{o.user?.name || 'Valued Gamer'}</p>
                          <p className="text-[10px] text-slate-400">{o.user?.email}</p>
                        </td>
                        <td className="py-3 px-2 font-bold font-mono text-white">₹{o.totalAmount.toLocaleString()}</td>
                        <td className="py-3 px-2 font-mono text-cyan-400">₹{o.advanceAmount.toLocaleString()}</td>
                        <td className="py-3 px-2 font-mono text-amber-400">₹{o.remainingCodAmount.toLocaleString()}</td>
                        <td className="py-3 px-2">
                          <select
                            value={o.status}
                            onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                            className="bg-slate-900 border border-slate-700 text-[11px] text-white rounded px-2 py-1 focus:outline-none focus:border-cyan-400 font-mono"
                          >
                            <option value="ORDER_PLACED">ORDER_PLACED</option>
                            <option value="ADVANCE_PAID">ADVANCE_PAID</option>
                            <option value="PROCESSING">PROCESSING</option>
                            <option value="PACKED">PACKED</option>
                            <option value="SHIPPED">SHIPPED</option>
                            <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <button
                            onClick={() => setOrderDetailModal(o)}
                            className="px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 text-[11px] font-bold"
                          >
                            View Order
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* INVENTORY TAB */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#111726] border border-slate-800">
              <h2 className="text-xl font-extrabold text-white">Stock Inventory Control</h2>
              <p className="text-xs text-slate-400">Monitor stock levels, set threshold alerts, and adjust quantities.</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#111726] border border-slate-800 overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-mono">
                    <th className="py-3 px-2">Product Name</th>
                    <th className="py-3 px-2">SKU</th>
                    <th className="py-3 px-2">Platform</th>
                    <th className="py-3 px-2">Current Stock</th>
                    <th className="py-3 px-2">Low Stock Threshold</th>
                    <th className="py-3 px-2 text-right">Quick Adjust</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-900/60">
                      <td className="py-3 px-2 font-bold text-white">{p.name}</td>
                      <td className="py-3 px-2 font-mono text-slate-400">{p.sku}</td>
                      <td className="py-3 px-2 font-mono text-cyan-400">{p.platform}</td>
                      <td className="py-3 px-2 font-mono">
                        <span className={`px-2 py-0.5 rounded font-bold ${p.stock <= p.lowStockThreshold ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-300'}`}>
                          {p.stock} units
                        </span>
                      </td>
                      <td className="py-3 px-2 font-mono text-slate-400">{p.lowStockThreshold}</td>
                      <td className="py-3 px-2 text-right space-x-1">
                        <button
                          onClick={() => handleUpdateStock(p.id, Math.max(0, p.stock - 1))}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-mono font-bold"
                        >
                          -1
                        </button>
                        <button
                          onClick={() => handleUpdateStock(p.id, p.stock + 1)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-mono font-bold"
                        >
                          +1
                        </button>
                        <button
                          onClick={() => handleUpdateStock(p.id, p.stock + 10)}
                          className="px-2 py-1 rounded bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 font-mono font-bold"
                        >
                          +10
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SELL & TRADE TAB */}
        {activeTab === 'sell-trade' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#111726] border border-slate-800">
              <h2 className="text-xl font-extrabold text-white">Sell & Trade Customer Quotes</h2>
              <p className="text-xs text-slate-400">Evaluate customer gaming gear, send cash/credit offers, and manage pickup statuses.</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#111726] border border-slate-800 overflow-x-auto">
              {sellRequests.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <Repeat className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400">No sell/trade requests submitted yet.</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs text-slate-300">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-mono">
                      <th className="py-3 px-2">Customer</th>
                      <th className="py-3 px-2">Item</th>
                      <th className="py-3 px-2">Platform</th>
                      <th className="py-3 px-2">Payout Choice</th>
                      <th className="py-3 px-2">Valuation</th>
                      <th className="py-3 px-2">Status</th>
                      <th className="py-3 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {sellRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-900/60">
                        <td className="py-3 px-2">
                          <p className="font-bold text-white">{req.fullName}</p>
                          <p className="text-[10px] text-slate-400">{req.phone}</p>
                        </td>
                        <td className="py-3 px-2 font-bold text-cyan-300">{req.itemName}</td>
                        <td className="py-3 px-2 font-mono">{req.platform}</td>
                        <td className="py-3 px-2 font-mono text-emerald-400">{req.payoutChoice}</td>
                        <td className="py-3 px-2 font-mono text-amber-300">₹{req.estimatedCash || 0} Cash / ₹{req.estimatedCredit || 0} Credit</td>
                        <td className="py-3 px-2">
                          <select
                            value={req.status}
                            onChange={(e) => handleUpdateSellRequest(req.id, { status: e.target.value })}
                            className="bg-slate-900 border border-slate-700 text-[11px] text-white rounded px-2 py-1 focus:outline-none focus:border-cyan-400 font-mono"
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                            <option value="OFFER_SENT">OFFER_SENT</option>
                            <option value="ACCEPTED">ACCEPTED</option>
                            <option value="REJECTED">REJECTED</option>
                            <option value="PICKUP_SCHEDULED">PICKUP_SCHEDULED</option>
                            <option value="RECEIVED">RECEIVED</option>
                            <option value="COMPLETED">COMPLETED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <button
                            onClick={() => setSellDetailModal(req)}
                            className="px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 text-[11px] font-bold"
                          >
                            Inspect Quote
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* HERO BANNERS TAB */}
        {activeTab === 'banners' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-6 rounded-2xl bg-[#111726] border border-slate-800">
              <div>
                <h2 className="text-xl font-extrabold text-white">Homepage Hero Banner System</h2>
                <p className="text-xs text-slate-400">Manage store promotional slides displayed on homepage hero area.</p>
              </div>
              <button
                onClick={() => {
                  setEditingBanner(null);
                  setBannerForm({ id: '', title: '', subtitle: '', image: '', buttonText: 'Shop Now', buttonUrl: '/shop', displayOrder: '0', active: true });
                  setBannerModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-500/20"
              >
                + Add Banner
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {banners.length === 0 ? (
                <div className="col-span-full p-8 text-center bg-[#111726] rounded-2xl border border-slate-800">
                  <p className="text-xs text-slate-400">No active promotional banners. The storefront will display the default Malibu2u hero section.</p>
                </div>
              ) : (
                banners.map((b) => (
                  <div key={b.id} className="p-4 rounded-xl bg-[#111726] border border-slate-800 space-y-3">
                    <div className="relative h-32 rounded-lg bg-slate-900 overflow-hidden">
                      <Image src={b.image} alt={b.title} fill className="object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{b.title}</h4>
                      <p className="text-xs text-cyan-400">{b.subtitle}</p>
                    </div>
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-[10px] font-mono text-slate-400">Order: {b.displayOrder}</span>
                      <button onClick={() => handleDeleteBanner(b.id)} className="text-red-400 hover:underline">
                        Delete Banner
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* COUPONS TAB */}
        {activeTab === 'coupons' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-6 rounded-2xl bg-[#111726] border border-slate-800">
              <div>
                <h2 className="text-xl font-extrabold text-white">Promo Coupons & Discounts</h2>
                <p className="text-xs text-slate-400">Create discount codes validated server-side during checkout.</p>
              </div>
              <button
                onClick={() => setCouponModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-500/20"
              >
                + Create Coupon
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-[#111726] border border-slate-800 overflow-x-auto">
              {coupons.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">No active promo coupons found.</div>
              ) : (
                <table className="w-full text-left text-xs text-slate-300">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-mono">
                      <th className="py-3 px-2">Code</th>
                      <th className="py-3 px-2">Discount</th>
                      <th className="py-3 px-2">Min Order</th>
                      <th className="py-3 px-2">Used Count</th>
                      <th className="py-3 px-2">Status</th>
                      <th className="py-3 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {coupons.map((c) => (
                      <tr key={c.id}>
                        <td className="py-3 px-2 font-mono font-bold text-cyan-400">{c.code}</td>
                        <td className="py-3 px-2 font-bold text-emerald-400">
                          {c.discountType === 'PERCENTAGE' ? `${c.discountPercent}% OFF` : `₹${c.discountAmount} OFF`}
                        </td>
                        <td className="py-3 px-2 font-mono">₹{c.minPurchase}</td>
                        <td className="py-3 px-2 font-mono">{c.usedCount} times</td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                            {c.active ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <button onClick={() => handleDeleteCoupon(c.id)} className="text-red-400 hover:underline">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* REVIEWS TAB */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#111726] border border-slate-800">
              <h2 className="text-xl font-extrabold text-white">Review Moderation</h2>
              <p className="text-xs text-slate-400">Only approved customer reviews appear publicly on product pages.</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#111726] border border-slate-800 overflow-x-auto">
              {reviews.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">No customer reviews submitted yet.</div>
              ) : (
                <table className="w-full text-left text-xs text-slate-300">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-mono">
                      <th className="py-3 px-2">Product</th>
                      <th className="py-3 px-2">Customer</th>
                      <th className="py-3 px-2">Rating</th>
                      <th className="py-3 px-2">Comment</th>
                      <th className="py-3 px-2">Approved</th>
                      <th className="py-3 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {reviews.map((r) => (
                      <tr key={r.id}>
                        <td className="py-3 px-2 font-bold text-white">{r.product?.name || 'Product'}</td>
                        <td className="py-3 px-2 text-slate-400">{r.userName}</td>
                        <td className="py-3 px-2 font-mono text-amber-400">{r.rating} / 5★</td>
                        <td className="py-3 px-2 italic text-slate-300 max-w-xs truncate">&ldquo;{r.comment}&rdquo;</td>
                        <td className="py-3 px-2 font-mono">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.isApproved ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                            {r.isApproved ? 'APPROVED' : 'PENDING'}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right space-x-2">
                          {!r.isApproved && (
                            <button
                              onClick={() => handleModerateReview(r.id, true)}
                              className="px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded font-bold hover:bg-emerald-500/30"
                            >
                              Approve
                            </button>
                          )}
                          <button onClick={() => handleDeleteReview(r.id)} className="text-red-400 hover:underline">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* CUSTOMERS TAB */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#111726] border border-slate-800">
              <h2 className="text-xl font-extrabold text-white">Registered Customers</h2>
              <p className="text-xs text-slate-400">View customer order activity and account metrics.</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#111726] border border-slate-800 overflow-x-auto">
              {customers.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">No registered customers yet.</div>
              ) : (
                <table className="w-full text-left text-xs text-slate-300">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-mono">
                      <th className="py-3 px-2">Customer Name</th>
                      <th className="py-3 px-2">Email</th>
                      <th className="py-3 px-2">Role</th>
                      <th className="py-3 px-2">Orders Placed</th>
                      <th className="py-3 px-2">Total Spent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {customers.map((c) => (
                      <tr key={c.id}>
                        <td className="py-3 px-2 font-bold text-white">{c.name}</td>
                        <td className="py-3 px-2 font-mono text-cyan-400">{c.email}</td>
                        <td className="py-3 px-2 font-mono">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.role === 'ADMIN' ? 'bg-violet-500/20 text-violet-300' : 'bg-slate-800 text-slate-300'}`}>
                            {c.role}
                          </span>
                        </td>
                        <td className="py-3 px-2 font-mono">{c.orderCount} orders</td>
                        <td className="py-3 px-2 font-bold font-mono text-emerald-400">₹{c.totalSpent.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#111726] border border-slate-800 space-y-4">
              <h2 className="text-xl font-extrabold text-white">Malibu2u Platform Configuration</h2>
              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <h4 className="font-bold text-cyan-400">Cashfree PG Integration Status</h4>
                  <p className="text-slate-400">50% Advance Online + 50% COD configuration is active.</p>
                </div>

                <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h4 className="font-bold text-emerald-400 text-sm flex items-center gap-2">
                        WhatsApp Support Phone Number Configuration
                      </h4>
                      <p className="text-slate-400 text-xs mt-0.5">
                        Configure the phone number to receive customer inquiries, order tracking chats, and sell/trade quotes.
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/30">
                      ADMIN CONTROL ONLY
                    </span>
                  </div>

                  <form onSubmit={handleSaveWhatsappSettings} className="space-y-4">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        Support WhatsApp Phone Number *
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          required
                          value={whatsappInput}
                          onChange={(e) => setWhatsappInput(e.target.value)}
                          placeholder="e.g. +91 98765 43210 or 9876543210"
                          className="flex-1 p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-emerald-400"
                        />
                        <button
                          type="submit"
                          disabled={savingWhatsapp}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-slate-950 font-extrabold text-xs transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 shrink-0"
                        >
                          {savingWhatsapp ? 'Saving Changes...' : 'Save Support Number'}
                        </button>
                      </div>
                    </div>

                    {whatsappMsg && (
                      <div className={`p-3 rounded-xl text-xs font-bold ${whatsappMsg.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                        {whatsappMsg.text}
                      </div>
                    )}

                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs space-y-1 font-mono">
                      <p className="text-slate-400 text-[11px]">
                        Normalized WhatsApp Target:{' '}
                        <code className="text-emerald-300 font-bold">
                          {normalizeWhatsAppNumber(whatsappInput) || 'Invalid / Missing'}
                        </code>
                      </p>
                      <p className="text-slate-400 text-[11px]">
                        Customer UI Display:{' '}
                        <code className="text-cyan-300 font-bold">
                          {formatDisplayPhoneNumber(whatsappInput) || 'Not Configured'}
                        </code>
                      </p>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* CREATE / EDIT PRODUCT MODAL */}
      {productModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-[#111726] border border-slate-800 rounded-3xl max-w-3xl w-full p-6 space-y-6 max-h-[85vh] overflow-y-auto my-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-extrabold text-white">
                {editingProduct ? 'Edit Store Product' : 'Add New Store Product'}
              </h3>
              <button onClick={() => setProductModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={prodForm.name}
                    onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-400"
                    placeholder="e.g. PlayStation 5 DualSense Wireless Controller"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">SKU Code *</label>
                  <input
                    type="text"
                    required
                    value={prodForm.sku}
                    onChange={(e) => setProdForm({ ...prodForm, sku: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">Category *</label>
                  <select
                    value={prodForm.categoryId}
                    onChange={(e) => setProdForm({ ...prodForm, categoryId: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-400"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Platform *</label>
                  <select
                    value={prodForm.platform}
                    onChange={(e) => setProdForm({ ...prodForm, platform: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-400 font-mono"
                  >
                    <option value="PS5">PS5</option>
                    <option value="PS4">PS4</option>
                    <option value="XBOX_SERIES">XBOX_SERIES</option>
                    <option value="XBOX_ONE">XBOX_ONE</option>
                    <option value="NINTENDO_SWITCH">NINTENDO_SWITCH</option>
                    <option value="PC">PC</option>
                    <option value="ACCESSORIES">ACCESSORIES</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Condition *</label>
                  <select
                    value={prodForm.condition}
                    onChange={(e) => setProdForm({ ...prodForm, condition: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="NEW">Brand New</option>
                    <option value="MINT_PREOWNED">Mint Pre-Owned</option>
                    <option value="GOOD_PREOWNED">Good Pre-Owned</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={prodForm.price}
                    onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">MRP Price (₹)</label>
                  <input
                    type="number"
                    value={prodForm.mrp}
                    onChange={(e) => setProdForm({ ...prodForm, mrp: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    value={prodForm.stock}
                    onChange={(e) => setProdForm({ ...prodForm, stock: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Low Stock Limit</label>
                  <input
                    type="number"
                    value={prodForm.lowStockThreshold}
                    onChange={(e) => setProdForm({ ...prodForm, lowStockThreshold: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">Product Images</label>
                {prodForm.imageUrls.map((url, idx) => (
                  <div key={idx} className="space-y-1 mb-3 p-2 bg-slate-950/60 border border-slate-800 rounded-xl">
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-purple-600/30 border border-purple-500/40 text-purple-300 font-bold hover:bg-purple-600/50 transition-all text-[11px]">
                        <Upload className="w-3 h-3" />
                        <span>Upload File</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleImageFileUpload(e, (dataUrl) => {
                              const updated = [...prodForm.imageUrls];
                              updated[idx] = dataUrl;
                              setProdForm({ ...prodForm, imageUrls: updated });
                            })
                          }
                        />
                      </label>
                      <input
                        type="text"
                        placeholder="https://... or paste image address"
                        value={url}
                        onChange={(e) => {
                          const updated = [...prodForm.imageUrls];
                          updated[idx] = e.target.value;
                          setProdForm({ ...prodForm, imageUrls: updated });
                        }}
                        className="flex-1 p-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-400"
                      />
                      {idx === 0 && <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded-lg text-[10px] font-bold shrink-0">Primary</span>}
                    </div>
                    {url && (
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 mt-1">
                        <img src={url} alt="Product Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setProdForm({ ...prodForm, imageUrls: [...prodForm.imageUrls, ''] })}
                  className="text-xs text-cyan-400 hover:underline font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Another Product Image Slot
                </button>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Full Description</label>
                <textarea
                  rows={3}
                  value={prodForm.description}
                  onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={prodForm.isFeatured}
                    onChange={(e) => setProdForm({ ...prodForm, isFeatured: e.target.checked })}
                    className="rounded accent-cyan-400"
                  />
                  Featured
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={prodForm.isNewArrival}
                    onChange={(e) => setProdForm({ ...prodForm, isNewArrival: e.target.checked })}
                    className="rounded accent-cyan-400"
                  />
                  New Arrival
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={prodForm.isOnSale}
                    onChange={(e) => setProdForm({ ...prodForm, isOnSale: e.target.checked })}
                    className="rounded accent-cyan-400"
                  />
                  On Sale
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={prodForm.isPreOwned}
                    onChange={(e) => setProdForm({ ...prodForm, isPreOwned: e.target.checked })}
                    className="rounded accent-cyan-400"
                  />
                  Pre-Owned Badge
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-extrabold"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE CATEGORY MODAL */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-[#111726] border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto my-auto shadow-2xl">
            <h3 className="text-lg font-extrabold text-white">Create Category</h3>
            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white"
                  placeholder="e.g. PlayStation 5"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-bold">Category Image</label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-600/30 border border-purple-500/40 text-purple-300 font-bold hover:bg-purple-600/50 transition-all text-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload File</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleImageFileUpload(e, (dataUrl) =>
                            setCatForm({ ...catForm, image: dataUrl })
                          )
                        }
                      />
                    </label>
                    <span className="text-slate-500 text-[10px] font-bold">OR</span>
                  </div>

                  <input
                    type="text"
                    placeholder="Or paste image URL (https://...)"
                    value={catForm.image}
                    onChange={(e) => setCatForm({ ...catForm, image: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                  />

                  {catForm.image && (
                    <div className="relative w-full h-24 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 mt-1">
                      <img
                        src={catForm.image}
                        alt="Category Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setCategoryModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold">
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE BANNER MODAL */}
      {bannerModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-[#111726] border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto my-auto shadow-2xl">
            <h3 className="text-lg font-extrabold text-white">Add Hero Promotional Banner</h3>
            <form onSubmit={handleSaveBanner} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Banner Title *</label>
                <input
                  type="text"
                  required
                  value={bannerForm.title}
                  onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white"
                  placeholder="e.g. ULTIMATE GAMING DEALS"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={bannerForm.subtitle}
                  onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white"
                  placeholder="e.g. Get up to 40% off on PS5 games"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">Banner Image *</label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-600/30 border border-purple-500/40 text-purple-300 font-bold hover:bg-purple-600/50 transition-all text-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload File from Computer/Phone</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleImageFileUpload(e, (dataUrl) =>
                            setBannerForm({ ...bannerForm, image: dataUrl })
                          )
                        }
                      />
                    </label>
                    <span className="text-slate-500 text-[10px] font-bold">OR</span>
                  </div>

                  <input
                    type="text"
                    required
                    placeholder="Or paste image web address (https://...)"
                    value={bannerForm.image}
                    onChange={(e) => setBannerForm({ ...bannerForm, image: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs"
                  />

                  {bannerForm.image && (
                    <div className="relative w-full h-32 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 mt-1">
                      <img
                        src={bannerForm.image}
                        alt="Banner Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setBannerModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold">
                  Save Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE COUPON MODAL */}
      {couponModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-[#111726] border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto my-auto shadow-2xl">
            <h3 className="text-lg font-extrabold text-white">Create Promo Coupon</h3>
            <form onSubmit={handleSaveCoupon} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Coupon Code (Uppercase)</label>
                <input
                  type="text"
                  required
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono"
                  placeholder="e.g. GAMER10"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Discount Type</label>
                <select
                  value={couponForm.discountType}
                  onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono"
                >
                  <option value="PERCENTAGE">PERCENTAGE (%)</option>
                  <option value="FIXED">FIXED AMOUNT (₹)</option>
                </select>
              </div>
              {couponForm.discountType === 'PERCENTAGE' ? (
                <div>
                  <label className="block text-slate-400 mb-1">Discount Percentage (%)</label>
                  <input
                    type="number"
                    value={couponForm.discountPercent}
                    onChange={(e) => setCouponForm({ ...couponForm, discountPercent: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-slate-400 mb-1">Discount Amount (₹)</label>
                  <input
                    type="number"
                    value={couponForm.discountAmount}
                    onChange={(e) => setCouponForm({ ...couponForm, discountAmount: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono"
                  />
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setCouponModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold">
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
