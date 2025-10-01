import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Calendar, Plus, Trash2, CreditCard as Edit, Clock, BookOpen, Package, HelpCircle, Save, X, Settings, CheckCircle, AlertCircle } from 'lucide-react';
import { authService } from '../lib/auth';
import { supabase } from '../lib/supabase';

interface Booking {
  id: string;
  serviceId: string;
  serviceName: string;
  date: string;
  time: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  babyAge: string;
  notes: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  createdAt: string;
  spotsReserved: number;
}

interface TimeSlot {
  id: string;
  date: string;
  time: string;
  available: boolean;
  maxSpots: number;
  bookedSpots: number;
}

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  date: string;
  readTime: string;
  published: boolean;
  createdAt: string;
}

interface Service {
  id: string;
  title: string;
  description: string;
  price: string;
  duration: string;
  icon: string;
  maxSpots: number;
  type: 'individual' | 'group';
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalBookings: number;
  lastBooking: string;
  babies: Array<{
    age: string;
    notes: string;
  }>;
}

function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'bookings' | 'slots' | 'clients' | 'blog' | 'services' | 'faq' | 'settings'>('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [settings, setSettings] = useState({
    siteName: 'Petit Kangourou',
    siteDescription: 'Monitrice de portage physiologique certifiée à Versailles. Accompagnement personnalisé pour créer un lien unique avec votre bébé.',
    contactEmail: 'contact@portagedouceur.fr',
    contactPhone: '06 XX XX XX XX',
    address: 'Versailles, France'
  });
  const [originalSettings, setOriginalSettings] = useState(settings);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [newSlot, setNewSlot] = useState({ date: '', time: '', maxSpots: 1 });
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [showPostForm, setShowPostForm] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [showFaqForm, setShowFaqForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; bookingId: string; clientName: string }>({ show: false, bookingId: '', clientName: '' });

  useEffect(() => {
    if (isLoggedIn) {
      loadBookings();
      loadTimeSlots();
      loadBlogPosts();
    loadSettings();
      loadServices();
      loadFaqs();
      loadClients();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings);
    setHasUnsavedChanges(hasChanges);
  }, [settings, originalSettings]);

  const loadSettings = () => {
    const savedSettings = localStorage.getItem('site-settings');
    if (savedSettings) {
      const loadedSettings = JSON.parse(savedSettings);
      setSettings(loadedSettings);
      setOriginalSettings(loadedSettings);
    }
  };

  const saveSettings = () => {
    localStorage.setItem('site-settings', JSON.stringify(settings));
    setOriginalSettings(settings);
    setHasUnsavedChanges(false);
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  const loadBookings = async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data && !error) {
      setBookings(data.map(booking => ({
        id: booking.id,
        serviceId: booking.service_id,
        serviceName: booking.service_name,
        date: booking.date,
        time: booking.time,
        clientName: booking.client_name,
        clientEmail: booking.client_email,
        clientPhone: booking.client_phone,
        babyAge: booking.baby_age,
        notes: booking.notes,
        status: booking.status,
        spotsReserved: booking.spots_reserved || 1,
        createdAt: booking.created_at
      })));
    }
  };

  const loadTimeSlots = async () => {
    const { data, error } = await supabase
      .from('time_slots')
      .select('*')
      .order('date', { ascending: true })
      .order('time', { ascending: true });
    
    if (data && !error) {
      setTimeSlots(data.map(slot => ({
        id: slot.id,
        date: slot.date,
        time: slot.time,
        available: slot.available,
        maxSpots: slot.max_spots,
        bookedSpots: slot.booked_spots
      })));
    }
  };

  const loadBlogPosts = async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data && !error) {
      setBlogPosts(data.map(post => ({
        id: post.id,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        image: post.image,
        date: post.date,
        readTime: post.read_time,
        published: post.published,
        createdAt: post.created_at
      })));
    }
  };

  const loadServices = async () => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('id', { ascending: true });
    
    if (data && !error) {
      setServices(data);
    }
  };

  const loadFaqs = async () => {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .order('order', { ascending: true });
    
    if (data && !error) {
      setFaqs(data);
    }
  };

  const loadClients = () => {
    // Générer la liste des clients à partir des réservations
    const clientsMap = new Map<string, Client>();
    
    bookings.forEach(booking => {
      const clientId = booking.clientEmail;
      if (clientsMap.has(clientId)) {
        const client = clientsMap.get(clientId)!;
        client.totalBookings++;
        if (new Date(booking.createdAt) > new Date(client.lastBooking)) {
          client.lastBooking = booking.createdAt;
        }
        if (booking.babyAge && !client.babies.some(baby => baby.age === booking.babyAge)) {
          client.babies.push({ age: booking.babyAge, notes: booking.notes });
        }
      } else {
        clientsMap.set(clientId, {
          id: clientId,
          name: booking.clientName,
          email: booking.clientEmail,
          phone: booking.clientPhone,
          totalBookings: 1,
          lastBooking: booking.createdAt,
          babies: booking.babyAge ? [{ age: booking.babyAge, notes: booking.notes }] : []
        });
      }
    });
    
    setClients(Array.from(clientsMap.values()));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError(null);

    const { user, error } = await authService.signIn(loginData.email, loginData.password);
    
    setIsLoading(false);
    
    if (error) {
      setLoginError(error);
    } else if (user) {
      setIsLoggedIn(true);
    }
  };

  const handleLogout = async () => {
    await authService.signOut();
    setIsLoggedIn(false);
    setLoginData({ email: '', password: '' });
  };

  const addTimeSlot = async () => {
    if (newSlot.date && newSlot.time) {
      const slotId = `${newSlot.date}-${newSlot.time}`;
      
      const { error } = await supabase
        .from('time_slots')
        .insert([{
          id: slotId,
          date: newSlot.date,
          time: newSlot.time,
          available: true,
          max_spots: newSlot.maxSpots,
          booked_spots: 0
        }]);
      
      if (!error) {
        await loadTimeSlots();
        setNewSlot({ date: '', time: '', maxSpots: 1 });
      } else {
        alert('Erreur lors de l\'ajout du créneau');
      }
    }
  };

  const toggleSlotAvailability = async (slotId: string) => {
    const slot = timeSlots.find(s => s.id === slotId);
    if (!slot) return;
    
    const { error } = await supabase
      .from('time_slots')
      .update({ available: !slot.available })
      .eq('id', slotId);
    
    if (!error) {
      await loadTimeSlots();
    }
  };

  const updateSlotSpots = async (slotId: string, maxSpots: number) => {
    const { error } = await supabase
      .from('time_slots')
      .update({ max_spots: maxSpots })
      .eq('id', slotId);
    
    if (!error) {
      await loadTimeSlots();
    }
  };

  const deleteTimeSlot = async (slotId: string) => {
    const { error } = await supabase
      .from('time_slots')
      .delete()
      .eq('id', slotId);
    
    if (!error) {
      await loadTimeSlots();
    }
  };

  const saveBlogPost = (post: Omit<BlogPost, 'id' | 'createdAt'>) => {
    const newPost: BlogPost = {
      ...post,
      id: editingPost?.id || Date.now().toString(),
      createdAt: editingPost?.createdAt || new Date().toISOString()
    };

    const updatedPosts = editingPost 
      ? blogPosts.map(p => p.id === editingPost.id ? newPost : p)
      : [...blogPosts, newPost];
    
    setBlogPosts(updatedPosts);
    localStorage.setItem('blog-posts', JSON.stringify(updatedPosts));
    setEditingPost(null);
    setShowPostForm(false);
  };

  const deleteBlogPost = (postId: string) => {
    const updatedPosts = blogPosts.filter(p => p.id !== postId);
    setBlogPosts(updatedPosts);
    localStorage.setItem('blog-posts', JSON.stringify(updatedPosts));
  };

  const saveService = (service: Omit<Service, 'id'>) => {
    const newService: Service = {
      ...service,
      id: editingService?.id || Date.now().toString()
    };

    const updatedServices = editingService 
      ? services.map(s => s.id === editingService.id ? newService : s)
      : [...services, newService];
    
    setServices(updatedServices);
    localStorage.setItem('services', JSON.stringify(updatedServices));
    setEditingService(null);
    setShowServiceForm(false);
  };

  const deleteService = (serviceId: string) => {
    const updatedServices = services.filter(s => s.id !== serviceId);
    setServices(updatedServices);
    localStorage.setItem('services', JSON.stringify(updatedServices));
  };

  const addFaq = () => {
    const newFaq: FAQ = {
      id: Date.now().toString(),
      question: 'Nouvelle question',
      answer: 'Réponse à la question',
      order: faqs.length + 1
    };
    const updatedFaqs = [...faqs, newFaq];
    setFaqs(updatedFaqs);
    localStorage.setItem('faqs', JSON.stringify(updatedFaqs));
    setHasUnsavedChanges(true);
  };

  const saveFaq = (faq: Omit<FAQ, 'id'>) => {
    const newFaq: FAQ = {
      ...faq,
      id: editingFaq?.id || Date.now().toString()
    };

    const updatedFaqs = editingFaq 
      ? faqs.map(f => f.id === editingFaq.id ? newFaq : f)
      : [...faqs, newFaq];
    
    setFaqs(updatedFaqs.sort((a, b) => a.order - b.order));
    localStorage.setItem('faqs', JSON.stringify(updatedFaqs));
    setEditingFaq(null);
    setShowFaqForm(false);
  };

  const updateFaq = (faqId: string, field: 'question' | 'answer', value: string) => {
    const updatedFaqs = faqs.map(f => 
      f.id === faqId ? { ...f, [field]: value } : f
    );
    setFaqs(updatedFaqs);
    localStorage.setItem('faqs', JSON.stringify(updatedFaqs));
  };

  const deleteFaq = (faqId: string) => {
    const updatedFaqs = faqs.filter(f => f.id !== faqId);
    setFaqs(updatedFaqs);
    localStorage.setItem('faqs', JSON.stringify(updatedFaqs));
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fff1ee] to-white flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full mx-4">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#c27275] rounded-full flex items-center justify-center mx-auto mb-4">
              <img src="/kangourou.png" alt="Petit Kangourou" className="h-8 w-8 brightness-0 invert" />
            </div>
            <h1 className="text-2xl font-bold text-[#c27275] mb-2">Administration</h1>
            <p className="text-[#c27275]/70">Connectez-vous pour accéder au tableau de bord</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {loginError}
              </div>
            )}
            
            <div>
              <label className="block text-[#c27275] font-medium mb-2">Email</label>
              <input
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                className="w-full px-4 py-3 border border-[#c27275]/20 rounded-lg focus:ring-2 focus:ring-[#c27275] focus:border-transparent"
                placeholder="Email"
                autoComplete="username"
                required
              />
            </div>

            <div>
              <label className="block text-[#c27275] font-medium mb-2">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  className="w-full px-4 py-3 pr-12 border border-[#c27275]/20 rounded-lg focus:ring-2 focus:ring-[#c27275] focus:border-transparent"
                  placeholder="••••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[#c27275]/50 hover:text-[#c27275]"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#c27275] text-white py-3 rounded-lg font-semibold hover:bg-[#c27275] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff1ee] to-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[#c27275] mb-2">Tableau de bord</h1>
            <p className="text-[#c27275]/70">Gestion complète de votre activité</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Déconnexion
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#c27275]/70 text-sm">Réservations</p>
                <p className="text-2xl font-bold text-[#c27275]">{bookings.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-[#c27275]" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#c27275]/70 text-sm">Services</p>
                <p className="text-2xl font-bold text-[#c27275]">{services.length}</p>
              </div>
              <Package className="h-8 w-8 text-[#c27275]" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#c27275]/70 text-sm">Articles</p>
                <p className="text-2xl font-bold text-[#c27275]">{blogPosts.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-[#c27275]" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 bg-white rounded-lg p-1 shadow-lg mb-8">
          {[
            { id: 'bookings', label: 'Réservations', icon: Calendar },
            { id: 'slots', label: 'Créneaux', icon: Clock },
            { id: 'services', label: 'Services', icon: Package },
            { id: 'blog', label: 'Blog', icon: BookOpen },
            { id: 'faq', label: 'FAQ', icon: HelpCircle },
            { id: 'settings', label: 'Paramètres', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#c27275] text-white'
                    : 'text-[#c27275] hover:bg-[#fff1ee]'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content based on active tab */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#c27275]">Réservations</h2>
                <div className="flex gap-2">
                  <select className="px-3 py-2 border border-[#c27275]/20 rounded-lg">
                    <option>Toutes</option>
                    <option>Confirmées</option>
                    <option>En attente</option>
                    <option>Annulées</option>
                  </select>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#c27275]/20">
                      <th className="text-left py-3 px-4 font-semibold text-[#c27275]">Code</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#c27275]">Client</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#c27275]">Service</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#c27275]">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#c27275]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="border-b border-[#c27275]/10 hover:bg-[#fff1ee]">
                        <td className="py-3 px-4 font-mono text-sm">{booking.id}</td>
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium">{booking.clientName}</div>
                            <div className="text-sm text-[#c27275]/70">{booking.clientEmail}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">{booking.serviceName}</td>
                        <td className="py-3 px-4">
                          <div>
                            <div>{formatDate(booking.date)}</div>
                            <div className="text-sm text-[#c27275]/70">{booking.time}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <button 
                            onClick={() => setDeleteConfirm({ show: true, bookingId: booking.id, clientName: booking.clientName })}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer la réservation"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Time Slots Tab */}
          {activeTab === 'slots' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#c27275] mb-4">Gestion des créneaux</h2>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="date"
                    value={newSlot.date}
                    onChange={(e) => setNewSlot({...newSlot, date: e.target.value})}
                    className="px-3 py-2 border border-[#c27275]/20 rounded-lg flex-1"
                  />
                  <input
                    type="time"
                    value={newSlot.time}
                    onChange={(e) => setNewSlot({...newSlot, time: e.target.value})}
                    className="px-3 py-2 border border-[#c27275]/20 rounded-lg flex-1"
                  />
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newSlot.maxSpots}
                    onChange={(e) => setNewSlot({...newSlot, maxSpots: parseInt(e.target.value)})}
                    placeholder="Places"
                    className="px-3 py-2 border border-[#c27275]/20 rounded-lg flex-1 sm:w-24"
                  />
                  <button
                    onClick={addTimeSlot}
                    className="px-4 py-2 bg-[#c27275] text-white rounded-lg hover:bg-[#c27275]/90 flex items-center justify-center gap-2 flex-1 sm:flex-initial"
                  >
                    <Plus className="h-4 w-4" />
                    Ajouter
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {timeSlots.map((slot) => (
                  <div key={slot.id} className="border border-[#c27275]/20 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-semibold text-[#c27275]">{formatDate(slot.date)}</div>
                        <div className="text-lg font-bold">{slot.time}</div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => toggleSlotAvailability(slot.id)}
                          className={`p-1 rounded ${slot.available ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {slot.available ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                        </button>
                        <button
                          onClick={() => deleteTimeSlot(slot.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#c27275]/70">Places max:</span>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={slot.maxSpots}
                          onChange={(e) => updateSlotSpots(slot.id, parseInt(e.target.value))}
                          className="w-16 px-2 py-1 border border-[#c27275]/20 rounded text-center"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#c27275]/70">Réservées:</span>
                        <span className="font-semibold">{slot.bookedSpots}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#c27275]/70">Disponibles:</span>
                        <span className="font-semibold text-green-600">{slot.maxSpots - slot.bookedSpots}</span>
                      </div>
                    </div>
                    
                    <div className={`mt-3 px-2 py-1 rounded text-xs font-medium text-center ${
                      slot.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {slot.available ? 'Disponible' : 'Indisponible'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Clients Tab */}
          {activeTab === 'clients' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#c27275]">Clients</h2>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Rechercher un client..."
                    className="px-3 py-2 border border-[#c27275]/20 rounded-lg"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clients.map((client) => (
                  <div key={client.id} className="border border-[#c27275]/20 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-[#c27275] text-lg">{client.name}</h3>
                        <p className="text-[#c27275]/70 text-sm">{client.email}</p>
                        <p className="text-[#c27275]/70 text-sm">{client.phone}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#c27275]">{client.totalBookings}</div>
                        <div className="text-xs text-[#c27275]/70">réservations</div>
                      </div>
                    </div>
                    
                    {client.babies.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-[#c27275] mb-2">Bébés:</h4>
                        {client.babies.map((baby, index) => (
                          <div key={index} className="text-sm text-[#c27275]/70">
                            • {baby.age}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="text-xs text-[#c27275]/50">
                      Dernière réservation: {formatDateTime(client.lastBooking)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Services Tab */}
          {activeTab === 'services' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#c27275]">Services</h2>
                <button
                  onClick={() => setShowServiceForm(true)}
                  className="px-4 py-2 bg-[#c27275] text-white rounded-lg hover:bg-[#c27275] flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Nouveau service
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {services.map((service) => (
                  <div key={service.id} className="border border-[#c27275]/20 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-[#c27275] text-lg">{service.title}</h3>
                        <p className="text-[#c27275]/70 mb-2">{service.description}</p>
                        <div className="flex gap-4 text-sm">
                          <span className="font-semibold text-[#c27275]">{service.price}</span>
                          <span className="text-[#c27275]/70">{service.duration}</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditingService(service);
                            setShowServiceForm(true);
                          }}
                          className="p-1 text-[#c27275] hover:bg-[#fff1ee] rounded"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteService(service.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#c27275]/70">Places max:</span>
                      <span className="font-semibold">{service.maxSpots}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#c27275]/70">Type:</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        service.type === 'individual' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {service.type === 'individual' ? 'Individuel' : 'Groupe'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Blog Tab */}
          {activeTab === 'blog' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#c27275]">Articles de blog</h2>
                <button
                  onClick={() => setShowPostForm(true)}
                  className="px-4 py-2 bg-[#c27275] text-white rounded-lg hover:bg-[#c27275] flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Nouvel article
                </button>
              </div>
              
              <div className="space-y-4">
                {blogPosts.map((post) => (
                  <div key={post.id} className="border border-[#c27275]/20 rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-[#c27275] text-lg">{post.title}</h3>
                          <span className={`px-2 py-1 rounded text-xs ${
                            post.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {post.published ? 'Publié' : 'Brouillon'}
                          </span>
                        </div>
                        <p className="text-[#c27275]/70 mb-2">{post.excerpt}</p>
                        <div className="flex gap-4 text-sm text-[#c27275]/50">
                          <span>{post.date}</span>
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 ml-4">
                        <button
                          onClick={() => {
                            setEditingPost(post);
                            setShowPostForm(true);
                          }}
                          className="p-1 text-[#c27275] hover:bg-[#fff1ee] rounded"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteBlogPost(post.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAQ Tab */}
          {activeTab === 'faq' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#c27275]">Questions fréquentes</h2>
                <button
                  onClick={() => setShowFaqForm(true)}
                  className="px-4 py-2 bg-[#c27275] text-white rounded-lg hover:bg-[#c27275] flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Nouvelle FAQ
                </button>
              </div>
              
              <div className="space-y-4">
                {faqs.map((faq) => (
                  <div key={faq.id} className="border border-[#c27275]/20 rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-[#c27275] mb-2">{faq.question}</h3>
                        <p className="text-[#c27275]/70">{faq.answer}</p>
                      </div>
                      <div className="flex gap-1 ml-4">
                        <span className="px-2 py-1 bg-[#fff1ee] text-[#c27275] rounded text-sm">#{faq.order}</span>
                        <button
                          onClick={() => {
                            setEditingFaq(faq);
                            setShowFaqForm(true);
                          }}
                          className="p-1 text-[#c27275] hover:bg-[#fff1ee] rounded"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteFaq(faq.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="relative">
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-[#c27275]">Paramètres du site</h2>
                
                {/* Alert bar for unsaved changes */}
                {hasUnsavedChanges && (
                  <div className="bg-orange-100 border-l-4 border-orange-500 p-4 rounded">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-orange-700 font-medium">
                            Vous avez des modifications non sauvegardées
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={saveSettings}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Sauvegarder maintenant
                      </button>
                    </div>
                  </div>
                )}

                {/* Success message */}
                {showSaveSuccess && (
                  <div className="bg-green-100 border-l-4 border-green-500 p-4 rounded">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-green-700 font-medium">
                          Paramètres sauvegardés avec succès !
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-[#c27275] mb-4">Informations générales</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nom du site</label>
                      <input
                        type="text"
                        value={settings.siteName}
                        onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c27275] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email de contact</label>
                      <input
                        type="email"
                        value={settings.contactEmail}
                        onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c27275] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                      <input
                        type="tel"
                        value={settings.contactPhone}
                        onChange={(e) => setSettings({...settings, contactPhone: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c27275] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                      <input
                        type="text"
                        value={settings.address}
                        onChange={(e) => setSettings({...settings, address: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c27275] focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description du site</label>
                    <textarea
                      rows={3}
                      value={settings.siteDescription}
                      onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c27275] focus:border-transparent"
                    />
                  </div>
                  
                  {/* Bouton Sauvegarder */}
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={saveSettings}
                      className="px-6 py-3 bg-[#c27275] text-white rounded-lg hover:bg-[#c27275]/90 flex items-center gap-2 font-medium transition-colors"
                    >
                      <Save className="h-5 w-5" />
                      Sauvegarder les paramètres
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-[#c27275] mb-4">FAQ</h3>
                  <div className="space-y-4">
                    {faqs.map((faq, index) => (
                      <div key={faq.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm text-gray-500">Question {index + 1}</span>
                          <button
                            onClick={() => deleteFaq(faq.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={faq.question}
                          onChange={(e) => updateFaq(faq.id, 'question', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded mb-2 focus:ring-2 focus:ring-[#c27275] focus:border-transparent"
                          placeholder="Question"
                        />
                        <textarea
                          value={faq.answer}
                          onChange={(e) => updateFaq(faq.id, 'answer', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#c27275] focus:border-transparent"
                          placeholder="Réponse"
                          rows={2}
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={addFaq}
                    className="mt-4 px-4 py-2 bg-[#c27275] text-white rounded-lg hover:bg-[#c27275] transition-colors"
                  >
                    Ajouter une FAQ
                  </button>
                </div>
              </div>

              {/* Floating Save Button */}
              {hasUnsavedChanges && (
                <div className="fixed bottom-6 right-6 z-50">
                  <button
                    onClick={saveSettings}
                    className="bg-[#c27275] hover:bg-[#c27275] text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2 font-semibold"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span>Sauvegarder</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modals */}
        {/* Service Form Modal */}
        {showServiceForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-[#c27275]">
                    {editingService ? 'Modifier le service' : 'Nouveau service'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowServiceForm(false);
                      setEditingService(null);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  saveService({
                    title: formData.get('title') as string,
                    description: formData.get('description') as string,
                    price: formData.get('price') as string,
                    duration: formData.get('duration') as string,
                    icon: formData.get('icon') as string,
                    maxSpots: parseInt(formData.get('maxSpots') as string),
                    type: formData.get('type') as 'individual' | 'group'
                  });
                }} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#c27275] font-medium mb-2">Titre *</label>
                      <input
                        name="title"
                        type="text"
                        required
                        defaultValue={editingService?.title}
                        className="w-full px-3 py-2 border border-[#c27275]/20 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-[#c27275] font-medium mb-2">Prix *</label>
                      <input
                        name="price"
                        type="text"
                        required
                        defaultValue={editingService?.price}
                        placeholder="60€"
                        className="w-full px-3 py-2 border border-[#c27275]/20 rounded-lg"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[#c27275] font-medium mb-2">Description *</label>
                    <textarea
                      name="description"
                      required
                      defaultValue={editingService?.description}
                      className="w-full px-3 py-2 border border-[#c27275]/20 rounded-lg h-24"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[#c27275] font-medium mb-2">Durée *</label>
                      <input
                        name="duration"
                        type="text"
                        required
                        defaultValue={editingService?.duration}
                        placeholder="1h30"
                        className="w-full px-3 py-2 border border-[#c27275]/20 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-[#c27275] font-medium mb-2">Places max *</label>
                      <input
                        name="maxSpots"
                        type="number"
                        min="1"
                        max="20"
                        required
                        defaultValue={editingService?.maxSpots || 1}
                        className="w-full px-3 py-2 border border-[#c27275]/20 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-[#c27275] font-medium mb-2">Type *</label>
                      <select
                        name="type"
                        required
                        defaultValue={editingService?.type || 'individual'}
                        className="w-full px-3 py-2 border border-[#c27275]/20 rounded-lg"
                      >
                        <option value="individual">Individuel</option>
                        <option value="group">Groupe</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[#c27275] font-medium mb-2">Icône</label>
                    <select
                      name="icon"
                      defaultValue={editingService?.icon || 'Heart'}
                      className="w-full px-3 py-2 border border-[#c27275]/20 rounded-lg"
                    >
                      <option value="Heart">Cœur</option>
                      <option value="Users">Groupe</option>
                      <option value="Star">Étoile</option>
                      <option value="Clock">Horloge</option>
                    </select>
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowServiceForm(false);
                        setEditingService(null);
                      }}
                      className="flex-1 py-2 bg-gray-200 text-[#c27275] rounded-lg hover:bg-gray-300"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-[#c27275] text-white rounded-lg hover:bg-[#c27275]"
                    >
                      {editingService ? 'Modifier' : 'Créer'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Blog Post Form Modal */}
        {showPostForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-[#c27275]">
                    {editingPost ? 'Modifier l\'article' : 'Nouvel article'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowPostForm(false);
                      setEditingPost(null);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  saveBlogPost({
                    title: formData.get('title') as string,
                    excerpt: formData.get('excerpt') as string,
                    content: formData.get('content') as string,
                    image: formData.get('image') as string,
                    date: formData.get('date') as string,
                    readTime: formData.get('readTime') as string,
                    published: formData.get('published') === 'on'
                  });
                }} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#c27275] font-medium mb-2">Titre *</label>
                      <input
                        name="title"
                        type="text"
                        required
                        defaultValue={editingPost?.title}
                        className="w-full px-3 py-2 border border-[#c27275]/20 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-[#c27275] font-medium mb-2">URL de l'image</label>
                      <input
                        name="image"
                        type="url"
                        defaultValue={editingPost?.image}
                        className="w-full px-3 py-2 border border-[#c27275]/20 rounded-lg"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[#c27275] font-medium mb-2">Résumé *</label>
                    <textarea
                      name="excerpt"
                      required
                      defaultValue={editingPost?.excerpt}
                      className="w-full px-3 py-2 border border-[#c27275]/20 rounded-lg h-20"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[#c27275] font-medium mb-2">Contenu *</label>
                    <textarea
                      name="content"
                      required
                      defaultValue={editingPost?.content}
                      className="w-full px-3 py-2 border border-[#c27275]/20 rounded-lg h-40"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[#c27275] font-medium mb-2">Date *</label>
                      <input
                        name="date"
                        type="text"
                        required
                        defaultValue={editingPost?.date}
                        placeholder="15 Mars 2025"
                        className="w-full px-3 py-2 border border-[#c27275]/20 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-[#c27275] font-medium mb-2">Temps de lecture *</label>
                      <input
                        name="readTime"
                        type="text"
                        required
                        defaultValue={editingPost?.readTime}
                        placeholder="5 min"
                        className="w-full px-3 py-2 border border-[#c27275]/20 rounded-lg"
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center">
                        <input
                          name="published"
                          type="checkbox"
                          defaultChecked={editingPost?.published}
                          className="mr-2"
                        />
                        <span className="text-[#c27275] font-medium">Publier</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPostForm(false);
                        setEditingPost(null);
                      }}
                      className="flex-1 py-2 bg-gray-200 text-[#c27275] rounded-lg hover:bg-gray-300"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-[#c27275] text-white rounded-lg hover:bg-[#c27275]"
                    >
                      {editingPost ? 'Modifier' : 'Créer'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* FAQ Form Modal */}
        {showFaqForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-[#c27275]">
                    {editingFaq ? 'Modifier la FAQ' : 'Nouvelle FAQ'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowFaqForm(false);
                      setEditingFaq(null);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  saveFaq({
                    question: formData.get('question') as string,
                    answer: formData.get('answer') as string,
                    order: parseInt(formData.get('order') as string)
                  });
                }} className="space-y-4">
                  <div>
                    <label className="block text-[#c27275] font-medium mb-2">Question *</label>
                    <input
                      name="question"
                      type="text"
                      required
                      defaultValue={editingFaq?.question}
                      className="w-full px-3 py-2 border border-[#c27275]/20 rounded-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[#c27275] font-medium mb-2">Réponse *</label>
                    <textarea
                      name="answer"
                      required
                      defaultValue={editingFaq?.answer}
                      className="w-full px-3 py-2 border border-[#c27275]/20 rounded-lg h-24"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[#c27275] font-medium mb-2">Ordre d'affichage *</label>
                    <input
                      name="order"
                      type="number"
                      min="1"
                      required
                      defaultValue={editingFaq?.order || faqs.length + 1}
                      className="w-full px-3 py-2 border border-[#c27275]/20 rounded-lg"
                    />
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowFaqForm(false);
                        setEditingFaq(null);
                      }}
                      className="flex-1 py-2 bg-gray-200 text-[#c27275] rounded-lg hover:bg-gray-300"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-[#c27275] text-white rounded-lg hover:bg-[#c27275]"
                    >
                      {editingFaq ? 'Modifier' : 'Créer'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Popup de confirmation de suppression */}
        {deleteConfirm.show && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
              <div className="text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Supprimer la réservation ?
                </h3>
                <p className="text-gray-600">
                  Êtes-vous sûr de vouloir supprimer la réservation de <strong>{deleteConfirm.clientName}</strong> ?
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Cette action est irréversible.
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm({ show: false, bookingId: '', clientName: '' })}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={async () => {
                    // Récupérer la réservation pour connaître le créneau et le nombre de places
                    const booking = bookings.find(b => b.id === deleteConfirm.bookingId);
                    
                    if (booking) {
                      // Supprimer la réservation
                      const { error: deleteError } = await supabase
                        .from('bookings')
                        .delete()
                        .eq('id', deleteConfirm.bookingId);
                      
                      if (!deleteError) {
                        // Libérer les places dans le créneau
                        const slotId = `${booking.date}-${booking.time}`;
                        const slot = timeSlots.find(s => s.id === slotId);
                        
                        if (slot) {
                          await supabase
                            .from('time_slots')
                            .update({ 
                              booked_spots: Math.max(0, slot.bookedSpots - booking.spotsReserved)
                            })
                            .eq('id', slotId);
                        }
                        
                        // Recharger les données
                        await loadBookings();
                        await loadTimeSlots();
                        setDeleteConfirm({ show: false, bookingId: '', clientName: '' });
                      } else {
                        alert('Erreur lors de la suppression');
                      }
                    }
                  }}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPage;