import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, Calendar, Plus, Trash2, Pencil, Clock, BookOpen, Package, HelpCircle, Save, X, Settings, Smartphone, AlertCircle } from 'lucide-react';
import { addDoc, getDoc, getDocs, collection as firestoreCollection, doc as firestoreDoc, limit, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import { authService } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { AdminSlotsCalendar } from '../components/AdminSlotsCalendar';
import { db, ensureAnonymousAuth, storage } from '../lib/firebase';

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
  categories?: string[];
  address?: string;
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
  const [activeTab, setActiveTab] = useState<'bookings' | 'slots' | 'clients' | 'blog' | 'services' | 'faq' | 'settings' | 'mobileApp'>('bookings');
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
    address: 'Versailles, France',
    bannerEnabled: false,
    bannerText: '',
    bannerUrl: ''
  });
  const [originalSettings, setOriginalSettings] = useState(settings);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [newSlot, setNewSlot] = useState({ date: '', time: '', maxSpots: 1, address: '', categories: [] as string[] });
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [showPostForm, setShowPostForm] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [showFaqForm, setShowFaqForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; bookingId: string; clientName: string }>({ show: false, bookingId: '', clientName: '' });

  const [mobileCollection, setMobileCollection] = useState<'news_articles' | 'instructors' | 'videos'>('news_articles');
  const [mobileDocs, setMobileDocs] = useState<Array<{ id: string; data: any }>>([]);
  const [mobileSelectedDocId, setMobileSelectedDocId] = useState<string>('');
  const [mobileDocJson, setMobileDocJson] = useState<string>('');
  const [mobileLoading, setMobileLoading] = useState(false);
  const [mobileError, setMobileError] = useState<string | null>(null);
  const [mobileSaveSuccess, setMobileSaveSuccess] = useState(false);
  const [mobileAdvancedMode, setMobileAdvancedMode] = useState(false);

  const [videoForm, setVideoForm] = useState({
    title: '',
    description: '',
    duration: '',
    difficulty: '',
    age: '',
    imagePath: '',
    imageStoragePath: '',
    videoUrl: '',
    videoStoragePath: ''
  });

  const [newsForm, setNewsForm] = useState({
    tag: '',
    category: '',
    title: '',
    excerpt: '',
    imagePath: '',
    keyPointsText: '',
    publishedAt: ''
  });

  const [instructorForm, setInstructorForm] = useState({
    name: '',
    specialty: '',
    address: '',
    latitude: '',
    longitude: '',
    imagePath: '',
    tagsText: '',
    email: ''
  });

  const [instructorAddressSuggestions, setInstructorAddressSuggestions] = useState<
    Array<{ label: string; latitude?: number; longitude?: number }>
  >([]);
  const instructorAddressDebounceRef = useRef<number | null>(null);

  const fetchInstructorAddressSuggestions = async (q: string) => {
    const queryText = q.trim();
    if (queryText.length < 3) {
      setInstructorAddressSuggestions([]);
      return;
    }

    const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(queryText)}&limit=6`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Erreur API adresse.gouv.fr');
    const json: any = await res.json();
    const features: any[] = Array.isArray(json?.features) ? json.features : [];
    const items = features
      .map((f: any) => {
        const label = (f?.properties?.label ?? '').toString();
        const coords = Array.isArray(f?.geometry?.coordinates) ? f.geometry.coordinates : [];
        const lon = typeof coords?.[0] === 'number' ? coords[0] : undefined;
        const lat = typeof coords?.[1] === 'number' ? coords[1] : undefined;
        return {
          label,
          latitude: lat,
          longitude: lon
        };
      })
      .filter((x: any) => x.label);
    setInstructorAddressSuggestions(items);
  };

  const videoFileInputRef = useRef<HTMLInputElement | null>(null);
  const videoImageFileInputRef = useRef<HTMLInputElement | null>(null);
  const newsImageFileInputRef = useRef<HTMLInputElement | null>(null);
  const instructorImageFileInputRef = useRef<HTMLInputElement | null>(null);

  const uploadToStorage = async (folder: string, file: File) => {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${folder}/${Date.now()}-${safeName}`;
    const ref = storageRef(storage, path);
    await ensureAnonymousAuth();
    await uploadBytes(ref, file);
    const url = await getDownloadURL(ref);
    return { storagePath: path, url };
  };

  const loadMobileCollection = async (collectionName: typeof mobileCollection) => {
    setMobileLoading(true);
    setMobileError(null);
    setMobileSaveSuccess(false);
    setMobileSelectedDocId('');
    setMobileDocJson('');
    try {
      const baseRef = firestoreCollection(db, collectionName);
      const q = collectionName === 'news_articles'
        ? query(baseRef, orderBy('publishedAt', 'desc'), limit(50))
        : collectionName === 'instructors'
          ? query(baseRef, orderBy('name', 'asc'), limit(50))
          : query(baseRef, orderBy('createdAt', 'desc'), limit(50));
      const snap = await getDocs(q);
      const docs = snap.docs.map((d) => ({ id: d.id, data: d.data() }));
      setMobileDocs(docs);
    } catch (e: any) {
      setMobileError(e?.message || 'Erreur lors du chargement Firestore');
      setMobileDocs([]);
    } finally {
      setMobileLoading(false);
    }
  };

  const loadMobileDoc = async (collectionName: typeof mobileCollection, docId: string) => {
    if (!docId) return;
    setMobileLoading(true);
    setMobileError(null);
    setMobileSaveSuccess(false);
    try {
      const ref = firestoreDoc(db, collectionName, docId);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        setMobileError('Document introuvable');
        setMobileDocJson('');
        return;
      }
      setMobileDocJson(JSON.stringify(snap.data(), null, 2));
    } catch (e: any) {
      setMobileError(e?.message || 'Erreur lors du chargement du document');
    } finally {
      setMobileLoading(false);
    }
  };

  const saveMobileDoc = async () => {
    if (!mobileSelectedDocId) {
      setMobileError('Sélectionne un document avant de sauvegarder');
      return;
    }
    setMobileLoading(true);
    setMobileError(null);
    setMobileSaveSuccess(false);
    try {
      await ensureAnonymousAuth();
      const parsed = JSON.parse(mobileDocJson || '{}');
      const ref = firestoreDoc(db, mobileCollection, mobileSelectedDocId);
      await setDoc(ref, parsed, { merge: true });
      setMobileSaveSuccess(true);
      await loadMobileCollection(mobileCollection);
      setTimeout(() => setMobileSaveSuccess(false), 2500);
    } catch (e: any) {
      setMobileError(e?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setMobileLoading(false);
    }
  };

  const addVideo = async () => {
    setMobileLoading(true);
    setMobileError(null);
    setMobileSaveSuccess(false);
    try {
      await ensureAnonymousAuth();
      const payload: any = {
        title: videoForm.title.trim(),
        description: videoForm.description.trim(),
        duration: videoForm.duration.trim(),
        difficulty: videoForm.difficulty.trim(),
        age: videoForm.age.trim(),
        imagePath: videoForm.imagePath.trim(),
        imageStoragePath: videoForm.imageStoragePath.trim(),
        videoUrl: videoForm.videoUrl.trim(),
        videoStoragePath: videoForm.videoStoragePath.trim(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      Object.keys(payload).forEach((k) => {
        const v = payload[k];
        if (typeof v === 'string' && v.length === 0) delete payload[k];
      });

      await ensureAnonymousAuth();
      await addDoc(firestoreCollection(db, 'videos'), payload);
      setMobileSaveSuccess(true);
      setVideoForm({
        title: '',
        description: '',
        duration: '',
        difficulty: '',
        age: '',
        imagePath: '',
        imageStoragePath: '',
        videoUrl: '',
        videoStoragePath: ''
      });
      await loadMobileCollection('videos');
      setTimeout(() => setMobileSaveSuccess(false), 2500);
    } catch (e: any) {
      setMobileError(e?.message || 'Erreur lors de la création de la vidéo');
    } finally {
      setMobileLoading(false);
    }
  };

  const updateVideo = async () => {
    if (!mobileSelectedDocId) {
      setMobileError('Sélectionne une vidéo à gauche avant de modifier');
      return;
    }
    setMobileLoading(true);
    setMobileError(null);
    setMobileSaveSuccess(false);
    try {
      await ensureAnonymousAuth();
      const payload: any = {
        title: videoForm.title.trim(),
        description: videoForm.description.trim(),
        duration: videoForm.duration.trim(),
        difficulty: videoForm.difficulty.trim(),
        age: videoForm.age.trim(),
        imagePath: videoForm.imagePath.trim(),
        imageStoragePath: videoForm.imageStoragePath.trim(),
        videoUrl: videoForm.videoUrl.trim(),
        videoStoragePath: videoForm.videoStoragePath.trim(),
        updatedAt: serverTimestamp()
      };

      Object.keys(payload).forEach((k) => {
        const v = payload[k];
        if (typeof v === 'string' && v.length === 0) delete payload[k];
      });

      const ref = firestoreDoc(db, 'videos', mobileSelectedDocId);
      await setDoc(ref, payload, { merge: true });
      setMobileSaveSuccess(true);
      await loadMobileCollection('videos');
      setTimeout(() => setMobileSaveSuccess(false), 2500);
    } catch (e: any) {
      setMobileError(e?.message || 'Erreur lors de la mise à jour de la vidéo');
    } finally {
      setMobileLoading(false);
    }
  };

  const addNewsArticle = async () => {
    setMobileLoading(true);
    setMobileError(null);
    setMobileSaveSuccess(false);
    try {
      await ensureAnonymousAuth();
      const nowIso = new Date().toISOString();
      const keyPoints = newsForm.keyPointsText
        .split(/\r?\n|,/g)
        .map((s) => s.trim())
        .filter(Boolean);
      const publishedAtIso = newsForm.publishedAt ? new Date(newsForm.publishedAt).toISOString() : nowIso;

      const payload: any = {
        tag: newsForm.tag.trim(),
        category: newsForm.category.trim(),
        title: newsForm.title.trim(),
        excerpt: newsForm.excerpt.trim(),
        imagePath: newsForm.imagePath.trim(),
        keyPoints,
        publishedAt: publishedAtIso,
        createdAt: nowIso,
        updatedAt: nowIso
      };

      Object.keys(payload).forEach((k) => {
        const v = payload[k];
        if (typeof v === 'string' && v.length === 0) delete payload[k];
      });

      await addDoc(firestoreCollection(db, 'news_articles'), payload);
      setMobileSaveSuccess(true);
      setNewsForm({ tag: '', category: '', title: '', excerpt: '', imagePath: '', keyPointsText: '', publishedAt: '' });
      await loadMobileCollection('news_articles');
      setTimeout(() => setMobileSaveSuccess(false), 2500);
    } catch (e: any) {
      setMobileError(e?.message || 'Erreur lors de la création de l’article');
    } finally {
      setMobileLoading(false);
    }
  };

  const updateNewsArticle = async () => {
    if (!mobileSelectedDocId) {
      setMobileError('Sélectionne un article à gauche avant de modifier');
      return;
    }
    setMobileLoading(true);
    setMobileError(null);
    setMobileSaveSuccess(false);
    try {
      await ensureAnonymousAuth();
      const nowIso = new Date().toISOString();
      const keyPoints = newsForm.keyPointsText
        .split(/\r?\n|,/g)
        .map((s) => s.trim())
        .filter(Boolean);
      const payload: any = {
        tag: newsForm.tag.trim(),
        category: newsForm.category.trim(),
        title: newsForm.title.trim(),
        excerpt: newsForm.excerpt.trim(),
        imagePath: newsForm.imagePath.trim(),
        keyPoints,
        publishedAt: newsForm.publishedAt ? new Date(newsForm.publishedAt).toISOString() : undefined,
        updatedAt: nowIso
      };

      Object.keys(payload).forEach((k) => {
        const v = payload[k];
        if (v === undefined) delete payload[k];
        if (typeof v === 'string' && v.length === 0) delete payload[k];
      });

      const ref = firestoreDoc(db, 'news_articles', mobileSelectedDocId);
      await setDoc(ref, payload, { merge: true });
      setMobileSaveSuccess(true);
      await loadMobileCollection('news_articles');
      setTimeout(() => setMobileSaveSuccess(false), 2500);
    } catch (e: any) {
      setMobileError(e?.message || 'Erreur lors de la mise à jour de l’article');
    } finally {
      setMobileLoading(false);
    }
  };

  const addInstructor = async () => {
    setMobileLoading(true);
    setMobileError(null);
    setMobileSaveSuccess(false);
    try {
      await ensureAnonymousAuth();
      const nowIso = new Date().toISOString();
      const tags = instructorForm.tagsText
        .split(/\r?\n|,/g)
        .map((s) => s.trim())
        .filter(Boolean);

      const lat = instructorForm.latitude.trim() ? Number(instructorForm.latitude) : undefined;
      const lng = instructorForm.longitude.trim() ? Number(instructorForm.longitude) : undefined;

      const payload: any = {
        name: instructorForm.name.trim(),
        specialty: instructorForm.specialty.trim(),
        address: instructorForm.address.trim(),
        latitude: Number.isFinite(lat as any) ? lat : undefined,
        longitude: Number.isFinite(lng as any) ? lng : undefined,
        imagePath: instructorForm.imagePath.trim(),
        tags,
        email: instructorForm.email.trim(),
        createdAt: nowIso,
        updatedAt: nowIso
      };

      Object.keys(payload).forEach((k) => {
        const v = payload[k];
        if (v === undefined) delete payload[k];
        if (typeof v === 'string' && v.length === 0) delete payload[k];
      });

      await addDoc(firestoreCollection(db, 'instructors'), payload);
      setMobileSaveSuccess(true);
      setInstructorAddressSuggestions([]);
      setInstructorForm({ name: '', specialty: '', address: '', latitude: '', longitude: '', imagePath: '', tagsText: '', email: '' });
      await loadMobileCollection('instructors');
      setTimeout(() => setMobileSaveSuccess(false), 2500);
    } catch (e: any) {
      setMobileError(e?.message || 'Erreur lors de la création de la monitrice');
    } finally {
      setMobileLoading(false);
    }
  };

  const updateInstructor = async () => {
    if (!mobileSelectedDocId) {
      setMobileError('Sélectionne une monitrice à gauche avant de modifier');
      return;
    }
    setMobileLoading(true);
    setMobileError(null);
    setMobileSaveSuccess(false);
    try {
      await ensureAnonymousAuth();
      const nowIso = new Date().toISOString();
      const tags = instructorForm.tagsText
        .split(/\r?\n|,/g)
        .map((s) => s.trim())
        .filter(Boolean);

      const lat = instructorForm.latitude.trim() ? Number(instructorForm.latitude) : undefined;
      const lng = instructorForm.longitude.trim() ? Number(instructorForm.longitude) : undefined;

      const payload: any = {
        name: instructorForm.name.trim(),
        specialty: instructorForm.specialty.trim(),
        address: instructorForm.address.trim(),
        latitude: Number.isFinite(lat as any) ? lat : undefined,
        longitude: Number.isFinite(lng as any) ? lng : undefined,
        imagePath: instructorForm.imagePath.trim(),
        tags,
        email: instructorForm.email.trim(),
        updatedAt: nowIso
      };

      Object.keys(payload).forEach((k) => {
        const v = payload[k];
        if (v === undefined) delete payload[k];
        if (typeof v === 'string' && v.length === 0) delete payload[k];
      });

      const ref = firestoreDoc(db, 'instructors', mobileSelectedDocId);
      await setDoc(ref, payload, { merge: true });
      setMobileSaveSuccess(true);
      await loadMobileCollection('instructors');
      setTimeout(() => setMobileSaveSuccess(false), 2500);
    } catch (e: any) {
      setMobileError(e?.message || 'Erreur lors de la mise à jour de la monitrice');
    } finally {
      setMobileLoading(false);
    }
  };

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

  const loadSettings = async () => {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 'main')
      .single();
    
    if (data && !error) {
      const loadedSettings = {
        siteName: data.site_name,
        siteDescription: data.site_description,
        contactEmail: data.contact_email,
        contactPhone: data.contact_phone,
        address: data.address,
        bannerEnabled: data.banner_enabled || false,
        bannerText: data.banner_text || '',
        bannerUrl: data.banner_url || ''
      };

      setSettings(loadedSettings);
      setOriginalSettings(loadedSettings);
    }
  };

  const saveSettings = async () => {
    const { error } = await supabase
      .from('site_settings')
      .update({
        site_name: settings.siteName,
        site_description: settings.siteDescription,
        contact_email: settings.contactEmail,
        contact_phone: settings.contactPhone,
        address: settings.address,
        banner_enabled: settings.bannerEnabled,
        banner_text: settings.bannerText,
        banner_url: settings.bannerUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', 'main');
    
    if (!error) {
      setOriginalSettings(settings);
      setHasUnsavedChanges(false);
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
      
      // Déclencher un événement pour notifier les autres composants
      window.dispatchEvent(new Event('settings-updated'));
    } else {
      alert('Erreur lors de la sauvegarde des paramètres');
    }
  };

  const loadBookings = async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data && !error) {
      console.log('📘 AdminPage - bookings chargées', data.map(b => ({ id: b.id, date: b.date, time: b.time, status: b.status })));
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
    
    console.log('🔄 Admin - Chargement créneaux depuis Supabase');
    
    if (error) {
      console.error('❌ Erreur:', error);
      setTimeSlots([]);
      return;
    }
    
    if (data) {
      console.log('📊 Créneaux reçus:', data.length, data);
      
      const now = new Date();
      

      
      // Créer un nouveau tableau pour forcer le re-render et filtrer les créneaux passés
      const newSlots = data
        .map(slot => ({
          id: slot.id,
          date: slot.date,
          time: slot.time,
          available: slot.available,
          maxSpots: slot.max_spots,
          bookedSpots: slot.booked_spots,
          categories: slot.categories || [],
          address: slot.address
        }))
        .filter(slot => {
          // Vérifier si le créneau n'est pas passé
          const slotDateTime = new Date(`${slot.date}T${slot.time}:00`);
          return slotDateTime > now;
        });
      
      console.log('✅ Créneaux mappés et filtrés:', newSlots.length);
      setTimeSlots(newSlots);
    } else {
      console.log('⚠️ Aucune donnée reçue');
      setTimeSlots([]);
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


  const saveBlogPost = async (post: Omit<BlogPost, 'id' | 'createdAt'>) => {
    console.log('💾 Sauvegarde Blog:', post);
    
    if (editingPost) {
      // Mise à jour
      console.log('✏️ Mise à jour Blog:', editingPost.id);
      const { error } = await supabase
        .from('blog_posts')
        .update({
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          image: post.image || '',
          date: post.date,
          read_time: post.readTime || '5 min',
          published: post.published
        })
        .eq('id', editingPost.id);
      
      if (error) {
        console.error('❌ Erreur update Blog:', error);
      } else {
        console.log('✅ Blog mis à jour');
        await loadBlogPosts();
      }
    } else {
      // Création
      console.log('➕ Création Blog');
      const newId = `post-${Date.now()}`;
      const { data, error } = await supabase
        .from('blog_posts')
        .insert([{
          id: newId,
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          image: post.image || '',
          date: post.date,
          read_time: '5 min',
          published: post.published
        }])
        .select();
      
      if (error) {
        console.error('❌ Erreur création Blog:', error);
      } else {
        console.log('✅ Blog créé:', data);
        await loadBlogPosts();
      }
    }
    
    setEditingPost(null);
    setShowPostForm(false);
  };

  const deleteBlogPost = async (postId: string) => {
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', postId);
    
    if (!error) {
      await loadBlogPosts();
    }
  };

  const saveService = async (service: Omit<Service, 'id'>) => {
    if (editingService) {
      // Mise à jour
      const { error } = await supabase
        .from('services')
        .update({
          title: service.title,
          description: service.description,
          price: service.price,
          duration: service.duration,
          icon: service.icon,
          max_spots: service.maxSpots,
          type: service.type
        })
        .eq('id', editingService.id);
      
      if (!error) {
        await loadServices();
      }
    } else {
      // Création
      const newId = crypto.randomUUID();
      const { error } = await supabase
        .from('services')
        .insert([{
          id: newId,
          title: service.title,
          description: service.description,
          price: service.price,
          duration: service.duration,
          icon: service.icon,
          max_spots: service.maxSpots,
          type: service.type
        }]);
      
      if (!error) {
        await loadServices();
      }
    }
    
    setEditingService(null);
    setShowServiceForm(false);
  };

  const deleteService = async (serviceId: string) => {
    const { error} = await supabase
      .from('services')
      .delete()
      .eq('id', serviceId);
    
    if (!error) {
      await loadServices();
    }
  };


  const saveFaq = async (faq: Omit<FAQ, 'id'>) => {
    console.log('💾 Sauvegarde FAQ:', faq);
    
    if (editingFaq && editingFaq.id) {
      // Mise à jour
      console.log('✏️ Mise à jour FAQ:', editingFaq.id);
      const { error } = await supabase
        .from('faqs')
        .update({
          question: faq.question,
          answer: faq.answer,
          order: faq.order
        })
        .eq('id', editingFaq.id);
      
      if (error) {
        console.error('❌ Erreur update FAQ:', error);
      } else {
        console.log('✅ FAQ mise à jour');
        await loadFaqs();
      }
    } else {
      // Création
      console.log('➕ Création nouvelle FAQ');
      const newId = crypto.randomUUID();
      const { data, error } = await supabase
        .from('faqs')
        .insert([{
          id: newId,
          question: faq.question,
          answer: faq.answer,
          order: faq.order
        }])
        .select();
      
      if (error) {
        console.error('❌ Erreur création FAQ:', error);
      } else {
        console.log('✅ FAQ créée:', data);
        await loadFaqs();
      }
    }
    
    setEditingFaq(null);
    setShowFaqForm(false);
  };


  const deleteFaq = async (faqId: string) => {
    const { error } = await supabase
      .from('faqs')
      .delete()
      .eq('id', faqId);
    
    if (!error) {
      await loadFaqs();
    }
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
      <div className="min-h-screen bg-gradient-to-br from-[#fff1ee] to-white flex justify-center pt-16 md:pt-20 pb-8">
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
            { id: 'settings', label: 'Paramètres', icon: Settings },
            { id: 'mobileApp', label: 'Application mobile', icon: Smartphone }
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
              {/* Réservations à venir */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#c27275] mb-4">Réservations à venir</h2>
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
                      {bookings.filter(booking => {
                        // Format de date depuis Supabase: YYYY-MM-DD
                        const bookingDateTime = new Date(`${booking.date}T${booking.time}:00`);
                        return bookingDateTime > new Date();
                      }).map((booking) => (
                        <tr key={booking.id} className="border-b border-[#c27275]/10 hover:bg-[#fff1ee]">
                          <td className="py-3 px-4 font-mono text-sm">{booking.id}</td>
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium">{booking.clientName}</div>
                              <div className="text-sm text-[#c27275]/70">{booking.clientEmail}</div>
                              <div className="text-sm text-[#c27275]/70">{booking.clientPhone}</div>
                              {booking.notes && (
                                <div className="text-sm text-[#c27275] mt-1 italic bg-yellow-50 p-2 rounded">
                                  📝 {booking.notes}
                                </div>
                              )}
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

              {/* Précédentes séances */}
              <div>
                <h2 className="text-2xl font-bold text-[#c27275] mb-4">Précédentes séances</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#c27275]/20">
                        <th className="text-left py-3 px-4 font-semibold text-[#c27275]">Code</th>
                        <th className="text-left py-3 px-4 font-semibold text-[#c27275]">Client</th>
                        <th className="text-left py-3 px-4 font-semibold text-[#c27275]">Service</th>
                        <th className="text-left py-3 px-4 font-semibold text-[#c27275]">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.filter(booking => {
                        // Format de date depuis Supabase: YYYY-MM-DD
                        const bookingDateTime = new Date(`${booking.date}T${booking.time}:00`);
                        return bookingDateTime <= new Date();
                      }).map((booking) => (
                        <tr key={booking.id} className="border-b border-[#c27275]/10 hover:bg-[#fff1ee] opacity-60">
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Time Slots Tab */}
        {activeTab === 'slots' && (
          <div>
            <AdminSlotsCalendar />
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
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditingService(service);
                            setShowServiceForm(true);
                          }}
                          className="p-1 text-[#c27275] hover:bg-[#fff1ee] rounded"
                        >
                          <Pencil className="h-4 w-4" />
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
                      </div>
                      <div className="flex gap-1 ml-4">
                        <button
                          onClick={() => {
                            setEditingPost(post);
                            setShowPostForm(true);
                          }}
                          className="p-1 text-[#c27275] hover:bg-[#fff1ee] rounded"
                        >
                          <Pencil className="h-4 w-4" />
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
                          <Pencil className="h-4 w-4" />
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

          {/* Mobile App Tab */}
          {activeTab === 'mobileApp' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h2 className="text-2xl font-bold text-[#c27275]">Application mobile</h2>
                <div className="flex items-center gap-2">
                  <select
                    value={mobileCollection}
                    onChange={async (e) => {
                      const value = e.target.value as typeof mobileCollection;
                      setMobileCollection(value);
                      setMobileAdvancedMode(false);
                      setMobileDocs([]);
                      setMobileSelectedDocId('');
                      setMobileDocJson('');
                      setMobileError(null);
                      setMobileSaveSuccess(false);

                      setNewsForm({ tag: '', category: '', title: '', excerpt: '', imagePath: '', keyPointsText: '', publishedAt: '' });
                      setInstructorAddressSuggestions([]);
                      setInstructorForm({ name: '', specialty: '', address: '', latitude: '', longitude: '', imagePath: '', tagsText: '', email: '' });
                      setVideoForm({
                        title: '',
                        description: '',
                        duration: '',
                        difficulty: '',
                        age: '',
                        imagePath: '',
                        imageStoragePath: '',
                        videoUrl: '',
                        videoStoragePath: ''
                      });

                      await loadMobileCollection(value);
                    }}
                    className="px-3 py-2 border border-[#c27275]/20 rounded-lg text-[#c27275] bg-white"
                  >
                    <option value="news_articles">news_articles</option>
                    <option value="instructors">instructors</option>
                    <option value="videos">videos</option>
                  </select>
                  <button
                    onClick={() => loadMobileCollection(mobileCollection)}
                    className="px-3 py-2 bg-[#c27275] text-white rounded-lg hover:bg-[#c27275]"
                  >
                    Recharger
                  </button>
                </div>
              </div>

              <div className="p-4 border border-[#c27275]/20 rounded-lg bg-[#fff1ee]/30">
                <div className="text-[#c27275] font-medium mb-1">Firebase / Firestore</div>
                <div className="text-[#c27275]/70 text-sm">
                  Ici tu peux gérer le contenu Firestore de l’application mobile (lecture et modification).
                </div>
              </div>

              {mobileError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {mobileError}
                </div>
              )}

              {mobileSaveSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
                  Sauvegardé.
                </div>
              )}

              {mobileCollection === 'instructors' && (
                <div className="border border-[#c27275]/20 rounded-lg p-4">
                  <div className="font-semibold text-[#c27275] mb-4">
                    {mobileSelectedDocId ? 'Modifier la monitrice' : 'Ajouter une monitrice'}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                      <input
                        type="text"
                        value={instructorForm.name}
                        onChange={(e) => setInstructorForm((s) => ({ ...s, name: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c27275] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Spécialité</label>
                      <input
                        type="text"
                        value={instructorForm.specialty}
                        onChange={(e) => setInstructorForm((s) => ({ ...s, specialty: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c27275] focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={instructorForm.address}
                          onChange={(e) => {
                            const v = e.target.value;
                            setInstructorForm((s) => ({ ...s, address: v, latitude: '', longitude: '' }));
                            if (instructorAddressDebounceRef.current) {
                              window.clearTimeout(instructorAddressDebounceRef.current);
                            }
                            instructorAddressDebounceRef.current = window.setTimeout(async () => {
                              try {
                                await fetchInstructorAddressSuggestions(v);
                              } catch {
                                setInstructorAddressSuggestions([]);
                              }
                            }, 250);
                          }}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c27275] focus:border-transparent"
                          placeholder="Commence à taper une adresse..."
                        />

                        {instructorAddressSuggestions.length > 0 && (
                          <div className="absolute z-10 mt-1 w-full bg-white border border-[#c27275]/20 rounded-lg shadow max-h-56 overflow-auto">
                            {instructorAddressSuggestions.map((sug, idx) => (
                              <button
                                key={`${sug.label}-${idx}`}
                                type="button"
                                onClick={() => {
                                  setInstructorForm((s) => ({
                                    ...s,
                                    address: sug.label,
                                    latitude: sug.latitude !== undefined ? String(sug.latitude) : s.latitude,
                                    longitude: sug.longitude !== undefined ? String(sug.longitude) : s.longitude
                                  }));
                                  setInstructorAddressSuggestions([]);
                                }}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-[#fff1ee]"
                              >
                                {sug.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-[#c27275]/70 mt-1">
                        La latitude/longitude sont remplies automatiquement après sélection.
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Image (URL ou chemin)</label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={instructorForm.imagePath}
                          onChange={(e) => setInstructorForm((s) => ({ ...s, imagePath: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c27275] focus:border-transparent"
                          placeholder="https://..."
                        />
                        <input
                          ref={instructorImageFileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            setMobileLoading(true);
                            setMobileError(null);
                            try {
                              const { url } = await uploadToStorage('instructors/images', f);
                              setInstructorForm((s) => ({ ...s, imagePath: url }));
                              setMobileSaveSuccess(true);
                              setTimeout(() => setMobileSaveSuccess(false), 2500);
                            } catch (err: any) {
                              setMobileError(err?.message || 'Erreur upload image');
                            } finally {
                              setMobileLoading(false);
                              if (instructorImageFileInputRef.current) instructorImageFileInputRef.current.value = '';
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => instructorImageFileInputRef.current?.click()}
                          disabled={mobileLoading}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                        >
                          Upload photo
                        </button>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tags (1 par ligne ou séparés par virgule)</label>
                      <textarea
                        value={instructorForm.tagsText}
                        onChange={(e) => setInstructorForm((s) => ({ ...s, tagsText: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c27275] focus:border-transparent"
                        rows={3}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={instructorForm.email}
                        onChange={(e) => setInstructorForm((s) => ({ ...s, email: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c27275] focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={mobileSelectedDocId ? updateInstructor : addInstructor}
                      disabled={mobileLoading || !instructorForm.name.trim()}
                      className="px-4 py-2 bg-[#c27275] text-white rounded-lg hover:bg-[#c27275] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {mobileSelectedDocId ? 'Enregistrer' : 'Ajouter'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileSelectedDocId('');
                        setMobileDocJson('');
                        setInstructorAddressSuggestions([]);
                        setInstructorForm({ name: '', specialty: '', address: '', latitude: '', longitude: '', imagePath: '', tagsText: '', email: '' });
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      Nouveau
                    </button>
                  </div>
                </div>
              )}

              {mobileCollection === 'instructors' && mobileDocs.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mobileDocs.map((d) => (
                    <div
                      key={d.id}
                      className="border border-[#c27275]/20 rounded-lg p-4 bg-white cursor-pointer hover:bg-[#fff1ee]/40"
                      onClick={async () => {
                        setMobileSelectedDocId(d.id);
                        await loadMobileDoc('instructors', d.id);
                        const data: any = d.data || {};
                        const tags = Array.isArray(data.tags) ? data.tags.map((x: any) => String(x)) : [];
                        setInstructorAddressSuggestions([]);
                        setInstructorForm({
                          name: (data.name ?? '').toString(),
                          specialty: (data.specialty ?? '').toString(),
                          address: (data.address ?? '').toString(),
                          latitude: data.latitude !== undefined && data.latitude !== null ? String(data.latitude) : '',
                          longitude: data.longitude !== undefined && data.longitude !== null ? String(data.longitude) : '',
                          imagePath: (data.imagePath ?? '').toString(),
                          tagsText: tags.join('\n'),
                          email: (data.email ?? '').toString()
                        });
                      }}
                    >
                      {(d.data?.imagePath || '').toString().startsWith('http') && (
                        <img src={d.data.imagePath} alt="" className="w-full h-32 object-cover rounded mb-3" />
                      )}
                      <div className="font-semibold text-[#c27275]">{(d.data?.name ?? d.id).toString()}</div>
                      <div className="text-sm text-[#c27275]/70">{(d.data?.specialty ?? '').toString()}</div>
                      <div className="text-xs text-[#c27275]/60 mt-2">{(d.data?.email ?? '').toString()}</div>
                    </div>
                  ))}
                </div>
              )}

              {mobileCollection === 'news_articles' && (
                <div className="border border-[#c27275]/20 rounded-lg p-4">
                  <div className="font-semibold text-[#c27275] mb-4">
                    {mobileSelectedDocId ? 'Modifier l’article' : 'Ajouter un article'}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tag</label>
                      <input
                        type="text"
                        value={newsForm.tag}
                        onChange={(e) => setNewsForm((s) => ({ ...s, tag: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c27275] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                      <input
                        type="text"
                        value={newsForm.category}
                        onChange={(e) => setNewsForm((s) => ({ ...s, category: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c27275] focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Titre</label>
                      <input
                        type="text"
                        value={newsForm.title}
                        onChange={(e) => setNewsForm((s) => ({ ...s, title: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c27275] focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Extrait</label>
                      <textarea
                        value={newsForm.excerpt}
                        onChange={(e) => setNewsForm((s) => ({ ...s, excerpt: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c27275] focus:border-transparent"
                        rows={3}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Image (URL ou chemin)</label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={newsForm.imagePath}
                          onChange={(e) => setNewsForm((s) => ({ ...s, imagePath: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c27275] focus:border-transparent"
                          placeholder="https://..."
                        />
                        <input
                          ref={newsImageFileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            setMobileLoading(true);
                            setMobileError(null);
                            try {
                              const { url } = await uploadToStorage('news/images', f);
                              setNewsForm((s) => ({ ...s, imagePath: url }));
                              setMobileSaveSuccess(true);
                              setTimeout(() => setMobileSaveSuccess(false), 2500);
                            } catch (err: any) {
                              setMobileError(err?.message || 'Erreur upload image');
                            } finally {
                              setMobileLoading(false);
                              if (newsImageFileInputRef.current) newsImageFileInputRef.current.value = '';
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => newsImageFileInputRef.current?.click()}
                          disabled={mobileLoading}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                        >
                          Upload photo
                        </button>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Points clés (1 par ligne ou séparés par virgule)</label>
                      <textarea
                        value={newsForm.keyPointsText}
                        onChange={(e) => setNewsForm((s) => ({ ...s, keyPointsText: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c27275] focus:border-transparent"
                        rows={4}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Publié le</label>
                      <input
                        type="datetime-local"
                        value={newsForm.publishedAt}
                        onChange={(e) => setNewsForm((s) => ({ ...s, publishedAt: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c27275] focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={mobileSelectedDocId ? updateNewsArticle : addNewsArticle}
                      disabled={mobileLoading || !newsForm.title.trim()}
                      className="px-4 py-2 bg-[#c27275] text-white rounded-lg hover:bg-[#c27275] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {mobileSelectedDocId ? 'Enregistrer' : 'Ajouter'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileSelectedDocId('');
                        setMobileDocJson('');
                        setNewsForm({ tag: '', category: '', title: '', excerpt: '', imagePath: '', keyPointsText: '', publishedAt: '' });
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      Nouveau
                    </button>
                  </div>
                </div>
              )}

              {mobileCollection === 'videos' && (
                <div className="border border-[#c27275]/20 rounded-lg p-4">
                  <div className="font-semibold text-[#c27275] mb-4">
                    {mobileSelectedDocId ? 'Modifier la vidéo' : 'Ajouter une vidéo'}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Titre</label>
                      <input
                        type="text"
                        value={videoForm.title}
                        onChange={(e) => setVideoForm((s) => ({ ...s, title: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c27275] focus:border-transparent"
                        placeholder="Titre affiché dans l’app"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Durée</label>
                      <input
                        type="text"
                        value={videoForm.duration}
                        onChange={(e) => setVideoForm((s) => ({ ...s, duration: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c27275] focus:border-transparent"
                        placeholder="Ex: 12 min"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Difficulté</label>
                      <input
                        type="text"
                        value={videoForm.difficulty}
                        onChange={(e) => setVideoForm((s) => ({ ...s, difficulty: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c27275] focus:border-transparent"
                        placeholder="Ex: Débutant"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Âge</label>
                      <input
                        type="text"
                        value={videoForm.age}
                        onChange={(e) => setVideoForm((s) => ({ ...s, age: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c27275] focus:border-transparent"
                        placeholder="Ex: 0-6 mois"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        value={videoForm.description}
                        onChange={(e) => setVideoForm((s) => ({ ...s, description: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c27275] focus:border-transparent"
                        rows={4}
                        placeholder="Description affichée dans l’app"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Image (URL ou chemin)</label>
                      <input
                        type="text"
                        value={videoForm.imagePath}
                        onChange={(e) => setVideoForm((s) => ({ ...s, imagePath: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c27275] focus:border-transparent"
                        placeholder="Ex: https://... ou assets/..."
                      />
                      <div className="text-xs text-[#c27275]/70 mt-1">Ton modèle Flutter lit aussi `imageUrl` si présent.</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Chemin Storage vidéo</label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={videoForm.videoStoragePath}
                          onChange={(e) => setVideoForm((s) => ({ ...s, videoStoragePath: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c27275] focus:border-transparent"
                          placeholder="Ex: videos/files/mon-fichier.mp4"
                        />
                        <input
                          ref={videoFileInputRef}
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={async (e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            setMobileLoading(true);
                            setMobileError(null);
                            try {
                              const { storagePath, url } = await uploadToStorage('videos/files', f);
                              setVideoForm((s) => ({ ...s, videoStoragePath: storagePath, videoUrl: url }));
                              setMobileSaveSuccess(true);
                              setTimeout(() => setMobileSaveSuccess(false), 2500);
                            } catch (err: any) {
                              setMobileError(err?.message || 'Erreur upload vidéo');
                            } finally {
                              setMobileLoading(false);
                              if (videoFileInputRef.current) videoFileInputRef.current.value = '';
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => videoFileInputRef.current?.click()}
                          disabled={mobileLoading}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                        >
                          Upload vidéo
                        </button>
                      </div>
                      <div className="text-xs text-[#c27275]/70 mt-1">
                        Dans ton app Flutter, l’URL est souvent résolue depuis un storagePath.
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Chemin Storage image</label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={videoForm.imageStoragePath}
                          onChange={(e) => setVideoForm((s) => ({ ...s, imageStoragePath: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c27275] focus:border-transparent"
                          placeholder="Ex: videos/thumbnails/mon-fichier.jpg"
                        />
                        <input
                          ref={videoImageFileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            setMobileLoading(true);
                            setMobileError(null);
                            try {
                              const { storagePath, url } = await uploadToStorage('videos/thumbnails', f);
                              setVideoForm((s) => ({ ...s, imageStoragePath: storagePath, imagePath: url }));
                              setMobileSaveSuccess(true);
                              setTimeout(() => setMobileSaveSuccess(false), 2500);
                            } catch (err: any) {
                              setMobileError(err?.message || 'Erreur upload image');
                            } finally {
                              setMobileLoading(false);
                              if (videoImageFileInputRef.current) videoImageFileInputRef.current.value = '';
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => videoImageFileInputRef.current?.click()}
                          disabled={mobileLoading}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                        >
                          Upload photo
                        </button>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Video URL (optionnel)</label>
                      <input
                        type="text"
                        value={videoForm.videoUrl}
                        onChange={(e) => setVideoForm((s) => ({ ...s, videoUrl: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c27275] focus:border-transparent"
                        placeholder="Ex: https://firebasestorage.googleapis.com/..."
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={mobileSelectedDocId ? updateVideo : addVideo}
                      disabled={mobileLoading || (!videoForm.title.trim() && !videoForm.videoStoragePath.trim() && !videoForm.videoUrl.trim())}
                      className="px-4 py-2 bg-[#c27275] text-white rounded-lg hover:bg-[#c27275] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {mobileSelectedDocId ? 'Enregistrer' : 'Ajouter'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileSelectedDocId('');
                        setMobileDocJson('');
                        setVideoForm({
                          title: '',
                          description: '',
                          duration: '',
                          difficulty: '',
                          age: '',
                          imagePath: '',
                          imageStoragePath: '',
                          videoUrl: '',
                          videoStoragePath: ''
                        });
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      Nouveau
                    </button>
                  </div>
                </div>
              )}

               {mobileCollection === 'videos' && mobileDocs.length > 0 && (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {mobileDocs.map((d) => (
                     <div
                       key={d.id}
                       className="border border-[#c27275]/20 rounded-lg p-4 bg-white cursor-pointer hover:bg-[#fff1ee]/40"
                       onClick={async () => {
                         setMobileSelectedDocId(d.id);
                         await loadMobileDoc('videos', d.id);
                         const data: any = d.data || {};
                         setVideoForm({
                           title: (data.title ?? '').toString(),
                           description: (data.description ?? '').toString(),
                           duration: (data.duration ?? '').toString(),
                           difficulty: (data.difficulty ?? '').toString(),
                           age: (data.age ?? '').toString(),
                           imagePath: (data.imagePath ?? data.imageUrl ?? '').toString(),
                           imageStoragePath: (data.imageStoragePath ?? '').toString(),
                           videoUrl: (data.videoUrl ?? '').toString(),
                           videoStoragePath: (data.videoStoragePath ?? '').toString()
                         });
                       }}
                     >
                       {(d.data?.imagePath || '').toString().startsWith('http') && (
                         <img src={d.data.imagePath} alt="" className="w-full h-32 object-cover rounded mb-3" />
                       )}
                       <div className="font-semibold text-[#c27275]">{(d.data?.title ?? d.id).toString()}</div>
                       <div className="text-sm text-[#c27275]/70">{(d.data?.duration ?? '').toString()}</div>
                       <div className="text-xs text-[#c27275]/60 mt-2">{(d.data?.difficulty ?? '').toString()} {(d.data?.age ?? '').toString()}</div>
                     </div>
                   ))}
                 </div>
               )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="border border-[#c27275]/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-semibold text-[#c27275]">Documents</div>
                    {mobileLoading && <div className="text-xs text-[#c27275]/70">Chargement…</div>}
                  </div>
                  <div className="space-y-2 max-h-[420px] overflow-auto">
                    {mobileDocs.length === 0 && (
                      <div className="text-sm text-[#c27275]/70">Aucun document chargé.</div>
                    )}
                    {mobileDocs.map((d) => (
                      <button
                        key={d.id}
                        onClick={async () => {
                          setMobileSelectedDocId(d.id);
                          await loadMobileDoc(mobileCollection, d.id);

                          if (mobileCollection === 'videos') {
                            const data: any = d.data || {};
                            setVideoForm({
                              title: (data.title ?? '').toString(),
                              description: (data.description ?? '').toString(),
                              duration: (data.duration ?? '').toString(),
                              difficulty: (data.difficulty ?? '').toString(),
                              age: (data.age ?? '').toString(),
                              imagePath: (data.imagePath ?? data.imageUrl ?? '').toString(),
                              imageStoragePath: (data.imageStoragePath ?? '').toString(),
                              videoUrl: (data.videoUrl ?? '').toString(),
                              videoStoragePath: (data.videoStoragePath ?? '').toString()
                            });
                          }

                          if (mobileCollection === 'news_articles') {
                            const data: any = d.data || {};
                            const keyPoints = Array.isArray(data.keyPoints) ? data.keyPoints.map((x: any) => String(x)) : [];
                            const publishedAtRaw = (data.publishedAt ?? '').toString();
                            const publishedAtLocal = publishedAtRaw ? publishedAtRaw.slice(0, 16) : '';
                            setNewsForm({
                              tag: (data.tag ?? '').toString(),
                              category: (data.category ?? '').toString(),
                              title: (data.title ?? '').toString(),
                              excerpt: (data.excerpt ?? '').toString(),
                              imagePath: (data.imagePath ?? '').toString(),
                              keyPointsText: keyPoints.join('\n'),
                              publishedAt: publishedAtLocal
                            });
                          }

                          if (mobileCollection === 'instructors') {
                            const data: any = d.data || {};
                            const tags = Array.isArray(data.tags) ? data.tags.map((x: any) => String(x)) : [];
                            setInstructorAddressSuggestions([]);
                            setInstructorForm({
                              name: (data.name ?? '').toString(),
                              specialty: (data.specialty ?? '').toString(),
                              address: (data.address ?? '').toString(),
                              latitude: data.latitude !== undefined && data.latitude !== null ? String(data.latitude) : '',
                              longitude: data.longitude !== undefined && data.longitude !== null ? String(data.longitude) : '',
                              imagePath: (data.imagePath ?? '').toString(),
                              tagsText: tags.join('\n'),
                              email: (data.email ?? '').toString()
                            });
                          }
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                          mobileSelectedDocId === d.id
                            ? 'bg-[#c27275] text-white border-[#c27275]'
                            : 'bg-white text-[#c27275] border-[#c27275]/20 hover:bg-[#fff1ee]'
                        }`}
                      >
                        <div className="font-mono text-sm">{d.id}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-2 border border-[#c27275]/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-semibold text-[#c27275]">Édition</div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setMobileAdvancedMode((v) => !v)}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                      >
                        {mobileAdvancedMode ? 'Mode simple' : 'Mode avancé'}
                      </button>
                      <button
                        onClick={saveMobileDoc}
                        disabled={mobileLoading || !mobileSelectedDocId}
                        className="px-3 py-2 bg-[#c27275] text-white rounded-lg hover:bg-[#c27275] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Sauvegarder
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-[#c27275]/70 mb-2">
                    Collection: <span className="font-mono">{mobileCollection}</span>
                    {mobileSelectedDocId ? (
                      <> • Doc: <span className="font-mono">{mobileSelectedDocId}</span></>
                    ) : (
                      <> • Sélectionne un document à gauche</>
                    )}
                  </div>
                  {mobileAdvancedMode ? (
                    <textarea
                      value={mobileDocJson}
                      onChange={(e) => setMobileDocJson(e.target.value)}
                      className="w-full min-h-[420px] p-3 font-mono text-sm border border-[#c27275]/20 rounded-lg focus:ring-2 focus:ring-[#c27275] focus:border-transparent"
                      placeholder={`{\n  "title": "..."\n}`}
                    />
                  ) : (
                    <div className="p-4 border border-[#c27275]/20 rounded-lg bg-[#fff1ee]/30 text-sm text-[#c27275]/80">
                      Sélectionne un document à gauche, puis utilise le formulaire au-dessus (vidéos) ou clique sur “Mode avancé” pour éditer le JSON.
                    </div>
                  )}
                </div>
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

                {/* Bandeau d'annonce */}
                <div className="bg-white rounded-lg shadow p-6 mt-6">
                  <h3 className="text-lg font-semibold text-[#c27275] mb-4">Bandeau d'annonce</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Affichez un bandeau en haut du site pour communiquer des informations importantes à vos visiteurs.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="bannerEnabled"
                        checked={settings.bannerEnabled}
                        onChange={(e) => setSettings({...settings, bannerEnabled: e.target.checked})}
                        className="w-5 h-5 text-[#c27275] border-gray-300 rounded focus:ring-[#c27275]"
                      />
                      <label htmlFor="bannerEnabled" className="text-sm font-medium text-gray-700">
                        Activer le bandeau d'annonce
                      </label>
                    </div>
                    
                    {settings.bannerEnabled && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Texte du bandeau
                          </label>
                          <textarea
                            rows={2}
                            value={settings.bannerText}
                            onChange={(e) => setSettings({...settings, bannerText: e.target.value})}
                            placeholder="Ex: 🎉 Offre spéciale : -20% sur tous les ateliers en groupe jusqu'au 31 mars !"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c27275] focus:border-transparent"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Le bandeau sera affiché en haut de toutes les pages du site.
                          </p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Lien URL (optionnel)
                          </label>
                          <input
                            type="url"
                            value={settings.bannerUrl}
                            onChange={(e) => setSettings({...settings, bannerUrl: e.target.value})}
                            placeholder="Ex: /reservation ou https://exemple.com"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c27275] focus:border-transparent"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Si renseigné, le bandeau sera cliquable et redirigera vers cette URL.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {settings.bannerEnabled && settings.bannerText && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-xs font-medium text-gray-700 mb-2">Aperçu :</p>
                        <div className="bg-gradient-to-r from-[#c27275] to-[#d88a8d] text-white py-3 px-4 rounded-lg">
                          <p className="text-sm text-center">{settings.bannerText}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
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
                
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  await saveService({
                    title: formData.get('title') as string,
                    description: formData.get('description') as string,
                    price: editingService?.price || '',
                    duration: editingService?.duration || '',
                    icon: formData.get('icon') as string,
                    maxSpots: parseInt(formData.get('maxSpots') as string),
                    type: formData.get('type') as 'individual' | 'group'
                  });
                }} className="space-y-4">
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
                    <label className="block text-[#c27275] font-medium mb-2">Description *</label>
                    <textarea
                      name="description"
                      required
                      defaultValue={editingService?.description}
                      className="w-full px-3 py-2 border border-[#c27275]/20 rounded-lg h-24"
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
                    <label className="block text-[#c27275] font-medium mb-2">Icône</label>
                    <select
                      name="icon"
                      defaultValue={editingService?.icon || '1.png'}
                      className="w-full px-3 py-2 border border-[#c27275]/20 rounded-lg"
                    >
                      <option value="1.png">Solo</option>
                      <option value="2.png">Duo</option>
                      <option value="3.png">Groupe</option>
                      <option value="coeur.png">Coeur</option>
                      <option value="star.png">Etoile</option>
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
                
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  
                  let imageUrl = editingPost?.image || '';
                  const imageFile = formData.get('imageFile') as File;
                  
                  // Si un fichier est uploadé, l'envoyer à Supabase Storage
                  if (imageFile && imageFile.size > 0) {
                    const fileName = `${Date.now()}-${imageFile.name}`;
                    const { data, error } = await supabase.storage
                      .from('blog-images')
                      .upload(fileName, imageFile);
                    
                    if (!error && data) {
                      const { data: { publicUrl } } = supabase.storage
                        .from('blog-images')
                        .getPublicUrl(fileName);
                      imageUrl = publicUrl;
                    } else {
                      console.error('Erreur upload image:', error);
                      alert('Erreur lors de l\'upload de l\'image');
                      return;
                    }
                  }
                  
                  await saveBlogPost({
                    title: formData.get('title') as string,
                    excerpt: formData.get('excerpt') as string,
                    content: formData.get('content') as string,
                    image: imageUrl,
                    date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
                    readTime: '5 min',
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
                      <label className="block text-[#c27275] font-medium mb-2">Image</label>
                      <input
                        name="imageFile"
                        type="file"
                        accept="image/*"
                        className="w-full px-3 py-2 border border-[#c27275]/20 rounded-lg"
                      />
                      {editingPost?.image && (
                        <div className="mt-2">
                          <img src={editingPost.image} alt="Aperçu" className="h-20 rounded-lg object-cover" />
                        </div>
                      )}
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
                
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  await saveFaq({
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