import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Baby, Check, Search, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { emailService } from '../lib/email';

interface TimeSlot {
  id: string;
  date: string;
  time: string;
  available: boolean;
  maxSpots: number;
  bookedSpots: number;
  categories: string[];
  address: string;
}

interface Booking {
  id: string;
  serviceId: string;
  serviceName: string;
  date: string;
  time: string;
  address: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  babyAge: string;
  notes: string;
  status: 'confirmed' | 'pending';
  createdAt: string;
}

function BookingPage() {
  const [step, setStep] = useState<'category' | 'slot' | 'details' | 'confirmation' | 'search'>('category');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [clientDetails, setClientDetails] = useState({
    name: '',
    email: '',
    phone: '',
    babyAge: '',
    notes: ''
  });
  const [spotsRequested, setSpotsRequested] = useState(1);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [searchCode, setSearchCode] = useState('');
  const [foundBooking, setFoundBooking] = useState<Booking | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  useEffect(() => {
    loadTimeSlots();
  }, []);

  const loadTimeSlots = async () => {
    const { data, error } = await supabase
      .from('time_slots')
      .select('*')
      .eq('available', true)
      .order('date', { ascending: true })
      .order('time', { ascending: true });
    
    if (error) {
      console.error('Erreur chargement créneaux:', error);
      setTimeSlots([]);
      return;
    }
    
    if (data) {
      console.log('📅 Créneaux chargés depuis Supabase:', data.length);
      
      const now = new Date();
      
      // Mapper et filtrer les créneaux qui ont encore des places disponibles ET qui ne sont pas passés
      const mappedSlots = data.map(slot => ({
        id: slot.id,
        date: slot.date,
        time: slot.time,
        available: slot.available,
        maxSpots: slot.max_spots,
        bookedSpots: slot.booked_spots,
        categories: slot.categories || [],
        address: slot.address || ''
      }));
      
      const availableSlots = mappedSlots.filter(slot => {
        const spotsLeft = slot.maxSpots - slot.bookedSpots;
        
        // Vérifier si le créneau n'est pas passé
        // Format de date depuis Supabase: YYYY-MM-DD
        const slotDateTime = new Date(`${slot.date}T${slot.time}:00`);
        
        return spotsLeft > 0 && slotDateTime > now;
      });
      
      console.log('✅ Créneaux disponibles:', availableSlots.length);
      setTimeSlots(availableSlots);
    } else {
      setTimeSlots([]);
    }
  };


  const generateBookingCode = (): string => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCategorySelect = async (category: string) => {
    setSelectedCategory(category);
    setStep('slot');
    // Recharger les créneaux pour avoir les données à jour
    await loadTimeSlots();
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setSpotsRequested(1); // Réinitialiser à 1 place
    setStep('details');
  };

  const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
      'individual': 'Atelier individuel',
      'couple': 'Atelier en couple',
      'group': 'Atelier en groupe',
      'home': 'Suivi à domicile'
    };
    return labels[category] || category;
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCategory || !selectedSlot) return;

    const bookingId = generateBookingCode();
    const newBooking: Booking = {
      id: bookingId,
      serviceId: selectedCategory,
      serviceName: getCategoryLabel(selectedCategory),
      date: selectedSlot.date,
      time: selectedSlot.time,
      address: selectedSlot.address,
      clientName: clientDetails.name,
      clientEmail: clientDetails.email,
      clientPhone: clientDetails.phone,
      babyAge: clientDetails.babyAge,
      notes: clientDetails.notes,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    // Sauvegarder dans Supabase
    const { error: insertError } = await supabase
      .from('bookings')
      .insert([{
        id: bookingId,
        service_id: selectedCategory,
        service_name: getCategoryLabel(selectedCategory),
        date: selectedSlot.date,
        time: selectedSlot.time,
        client_name: clientDetails.name,
        client_email: clientDetails.email,
        client_phone: clientDetails.phone,
        baby_age: clientDetails.babyAge,
        notes: clientDetails.notes,
        status: 'confirmed',
        spots_reserved: spotsRequested
      }]);

    if (insertError) {
      console.error('Erreur sauvegarde réservation:', insertError);
      alert('Erreur lors de la réservation. Veuillez réessayer.');
      return;
    }

    // Mettre à jour le nombre de places réservées dans le créneau
    const { error: updateError } = await supabase
      .from('time_slots')
      .update({ 
        booked_spots: selectedSlot.bookedSpots + spotsRequested 
      })
      .eq('id', selectedSlot.id);

    if (updateError) {
      console.error('Erreur mise à jour créneau:', updateError);
    }
    
    // Recharger les créneaux pour mettre à jour l'affichage
    await loadTimeSlots();
    
    setBooking(newBooking);
    setStep('confirmation');

    // Envoyer les emails de confirmation (ne pas bloquer si erreur)
    emailService.sendBookingConfirmation({
      clientName: clientDetails.name,
      clientEmail: clientDetails.email,
      serviceName: getCategoryLabel(selectedCategory),
      date: formatDate(selectedSlot.date),
      time: selectedSlot.time,
      bookingCode: bookingId,
      price: ''
    }).catch(err => console.log('Info: Email client non envoyé', err));

    // Envoyer notification admin (ne pas bloquer si erreur)
    emailService.sendAdminNotification({
      clientName: clientDetails.name,
      clientEmail: clientDetails.email,
      serviceName: getCategoryLabel(selectedCategory),
      date: formatDate(selectedSlot.date),
      time: selectedSlot.time,
      bookingCode: bookingId,
      price: ''
    }).catch(err => console.log('Info: Email admin non envoyé', err));
  };

  const handleSearchBooking = async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', searchCode)
      .single();
    
    if (data && !error) {
      // Mapper les noms de colonnes
      setFoundBooking({
        id: data.id,
        serviceId: data.service_id,
        serviceName: data.service_name,
        date: data.date,
        time: data.time,
        address: data.address || '',
        clientName: data.client_name,
        clientEmail: data.client_email,
        clientPhone: data.client_phone,
        babyAge: data.baby_age,
        notes: data.notes,
        status: data.status,
        createdAt: data.created_at
      });
    } else {
      setFoundBooking(null);
      alert('Aucune réservation trouvée avec ce code');
    }
  };

  const generateCalendarEvent = (booking: Booking) => {
    const startDate = new Date(`${booking.date}T${booking.time}`);
    const endDate = new Date(startDate.getTime() + 90 * 60000); // +1h30
    
    const event = {
      title: `Consultation Portage - ${booking.serviceName}`,
      start: startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
      end: endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
      description: `Rendez-vous avec Paola - Portage Douceur\\nService: ${booking.serviceName}\\nClient: ${booking.clientName}`,
      location: 'Versailles, France'
    };

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Portage Douceur//Booking//FR
BEGIN:VEVENT
UID:${booking.id}@portagedouceur.fr
DTSTART:${event.start}
DTEND:${event.end}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rdv-portage-${booking.id}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const groupSlotsByDate = (slots: TimeSlot[]) => {
    return slots.reduce((groups, slot) => {
      const date = slot.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(slot);
      return groups;
    }, {} as Record<string, TimeSlot[]>);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff1ee] to-white py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#c27275] mb-4">Réservation</h1>
          <p className="text-[#c27275]/70">Planifiez votre consultation de portage physiologique</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-white rounded-full p-1 shadow-lg">
            <button
              onClick={() => setStep('category')}
              className={`px-6 py-2 rounded-full transition-all duration-300 ${
                step !== 'search' ? 'bg-[#c27275] text-white' : 'text-[#c27275] hover:bg-[#fff1ee]'
              }`}
            >
              Nouvelle réservation
            </button>
            <button
              onClick={() => setStep('search')}
              className={`px-6 py-2 rounded-full transition-all duration-300 ${
                step === 'search' ? 'bg-[#c27275] text-white' : 'text-[#c27275] hover:bg-[#fff1ee]'
              }`}
            >
              Retrouver ma réservation
            </button>
          </div>
        </div>

        {/* Search Booking */}
        {step === 'search' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
            <div className="text-center mb-6">
              <Search className="h-16 w-16 text-[#c27275] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#c27275] mb-2">Retrouver ma réservation</h2>
              <p className="text-[#c27275]/70">Saisissez votre code de réservation</p>
            </div>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Code de réservation (ex: ABC123)"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                className="w-full p-3 border border-[#c27275]/20 rounded-lg focus:ring-2 focus:ring-[#c27275] focus:border-transparent"
              />
              <button
                onClick={handleSearchBooking}
                className="w-full bg-[#c27275] text-white py-3 rounded-lg font-semibold hover:bg-[#c27275] transition-colors"
              >
                Rechercher
              </button>
            </div>

            {foundBooking && (
              <div className="mt-6 p-4 bg-[#fff1ee] rounded-lg">
                <h3 className="font-semibold text-[#c27275] mb-2">Réservation trouvée</h3>
                <div className="space-y-2 text-sm text-[#c27275]/80">
                  <p><strong>Catégorie:</strong> {foundBooking.serviceName}</p>
                  <p><strong>Date:</strong> {formatDate(foundBooking.date)}</p>
                  <p><strong>Heure:</strong> {foundBooking.time}</p>
                  {foundBooking.address && <p><strong>Lieu:</strong> {foundBooking.address}</p>}
                  <p><strong>Client:</strong> {foundBooking.clientName}</p>
                  <p><strong>Email:</strong> {foundBooking.clientEmail}</p>
                  <p><strong>Statut:</strong> 
                    <span className="text-green-600 font-semibold ml-1">
                      {foundBooking.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => generateCalendarEvent(foundBooking)}
                  className="mt-4 flex items-center justify-center w-full bg-[#c27275] text-white py-2 rounded-lg hover:bg-[#c27275] transition-colors"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Ajouter au calendrier
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 1: Category Selection */}
        {step === 'category' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { id: 'individual', label: 'Atelier individuel', description: 'Un accompagnement personnalisé pour vous et votre bébé', icon: '1.png' },
                { id: 'couple', label: 'Atelier en couple', description: 'Apprenez ensemble les techniques de portage', icon: '2.png' },
                { id: 'group', label: 'Atelier en groupe', description: 'Partagez cette expérience avec d\'autres parents', icon: '3.png' },
                { id: 'home', label: 'Suivi à domicile', description: 'Je me déplace chez vous pour un accompagnement sur mesure', icon: 'coeur.png' }
              ].map((category) => (
                <div
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl cursor-pointer transform hover:-translate-y-2 transition-all duration-300 border border-transparent hover:border-[#c27275]/20"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-[#c27275] rounded-lg flex items-center justify-center flex-shrink-0">
                      <img src={`/${category.icon}`} alt={category.label} className="h-6 w-6 brightness-0 invert" />
                    </div>
                    <h3 className="text-xl font-bold text-[#c27275]">{category.label}</h3>
                  </div>
                  <p className="text-[#c27275]/70">{category.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Time Slot Selection */}
        {step === 'slot' && selectedCategory && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#c27275] mb-2">Choisissez votre créneau</h2>
              <p className="text-[#c27275]/70">Catégorie sélectionnée: {getCategoryLabel(selectedCategory)}</p>
            </div>

            <div className="space-y-6">
              {Object.entries(groupSlotsByDate(timeSlots.filter(slot => slot.available && slot.categories.includes(selectedCategory)))).map(([date, slots]) => (
                <div key={date} className="border-b border-[#fff1ee] pb-4">
                  <h3 className="font-semibold text-[#c27275] mb-3 capitalize">
                    {formatDate(date)}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {slots.map((slot) => {
                      const spotsLeft = slot.maxSpots - slot.bookedSpots;
                      return (
                        <button
                          key={slot.id}
                          onClick={() => handleSlotSelect(slot)}
                          className="p-3 bg-[#fff1ee] hover:bg-[#c27275] hover:text-white text-[#c27275] rounded-lg transition-all duration-300 font-medium flex flex-col items-center gap-1"
                        >
                          <span className="text-lg">{slot.time}</span>
                          {slot.address && <span className="text-xs opacity-70">{slot.address}</span>}
                          <span className="text-xs opacity-70">{spotsLeft} place{spotsLeft > 1 ? 's' : ''}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Client Details */}
        {step === 'details' && selectedCategory && selectedSlot && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#c27275] mb-2">Vos informations</h2>
              <div className="bg-[#fff1ee] p-4 rounded-lg">
                <p><strong>Catégorie:</strong> {getCategoryLabel(selectedCategory)}</p>
                <p><strong>Date:</strong> {formatDate(selectedSlot.date)}</p>
                <p><strong>Heure:</strong> {selectedSlot.time}</p>
                {selectedSlot.address && <p><strong>Adresse:</strong> {selectedSlot.address}</p>}
              </div>
            </div>

            <form onSubmit={handleSubmitBooking} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[#c27275] font-medium mb-2">Nom complet *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-[#c27275]/50" />
                    <input
                      type="text"
                      required
                      value={clientDetails.name}
                      onChange={(e) => setClientDetails({...clientDetails, name: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border border-[#c27275]/20 rounded-lg focus:ring-2 focus:ring-[#c27275] focus:border-transparent"
                      placeholder="Votre nom"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#c27275] font-medium mb-2">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-[#c27275]/50" />
                    <input
                      type="email"
                      required
                      value={clientDetails.email}
                      onChange={(e) => setClientDetails({...clientDetails, email: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border border-[#c27275]/20 rounded-lg focus:ring-2 focus:ring-[#c27275] focus:border-transparent"
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#c27275] font-medium mb-2">Téléphone *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-5 w-5 text-[#c27275]/50" />
                    <input
                      type="tel"
                      required
                      value={clientDetails.phone}
                      onChange={(e) => setClientDetails({...clientDetails, phone: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border border-[#c27275]/20 rounded-lg focus:ring-2 focus:ring-[#c27275] focus:border-transparent"
                      placeholder="06 XX XX XX XX"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#c27275] font-medium mb-2">Âge de bébé</label>
                  <div className="relative">
                    <Baby className="absolute left-3 top-3 h-5 w-5 text-[#c27275]/50" />
                    <input
                      type="text"
                      value={clientDetails.babyAge}
                      onChange={(e) => setClientDetails({...clientDetails, babyAge: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border border-[#c27275]/20 rounded-lg focus:ring-2 focus:ring-[#c27275] focus:border-transparent"
                      placeholder="ex: 3 mois"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#c27275] font-medium mb-2">Nombre de places *</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedSlot.maxSpots - selectedSlot.bookedSpots}
                    required
                    value={spotsRequested}
                    onChange={(e) => setSpotsRequested(Math.min(parseInt(e.target.value) || 1, selectedSlot.maxSpots - selectedSlot.bookedSpots))}
                    className="w-full px-4 py-3 border border-[#c27275]/20 rounded-lg focus:ring-2 focus:ring-[#c27275] focus:border-transparent"
                  />
                  <p className="text-xs text-[#c27275]/60 mt-1">
                    Places disponibles : {selectedSlot.maxSpots - selectedSlot.bookedSpots}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-[#c27275] font-medium mb-2">Notes ou demandes particulières</label>
                <textarea
                  value={clientDetails.notes}
                  onChange={(e) => setClientDetails({...clientDetails, notes: e.target.value})}
                  className="w-full p-3 border border-[#c27275]/20 rounded-lg focus:ring-2 focus:ring-[#c27275] focus:border-transparent h-24 resize-none"
                  placeholder="Dites-nous en plus sur vos besoins..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep('slot')}
                  className="flex-1 py-3 bg-gray-200 text-[#c27275] rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Retour
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#c27275] text-white rounded-lg font-semibold hover:bg-[#c27275] transition-colors"
                >
                  Confirmer la réservation
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 'confirmation' && booking && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-[#c27275] mb-2">Réservation confirmée !</h2>
              <p className="text-[#c27275]/70">Votre consultation a été enregistrée avec succès</p>
            </div>

            <div className="bg-[#fff1ee] p-6 rounded-lg mb-6">
              <div className="text-2xl font-bold text-[#c27275] mb-4">
                Code de réservation: {booking.id}
              </div>
              <div className="space-y-2 text-[#c27275]">
                <p><strong>Catégorie:</strong> {booking.serviceName}</p>
                <p><strong>Date:</strong> {formatDate(booking.date)}</p>
                <p><strong>Heure:</strong> {booking.time}</p>
                {booking.address && <p><strong>Lieu:</strong> {booking.address}</p>}
                <p><strong>Client:</strong> {booking.clientName}</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[#c27275]/70">
                Merci de noter le code de réservation !
              </p>
              <p className="text-[#c27275]/70">
                Je vous recontacterai par email d'ici 48 heures
              </p>
              
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => generateCalendarEvent(booking)}
                  className="flex items-center px-6 py-3 bg-[#c27275] text-white rounded-lg hover:bg-[#c27275] transition-colors"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Ajouter au calendrier
                </button>
                <button
                  onClick={() => {
                    setStep('category');
                    setSelectedCategory('');
                    setSelectedSlot(null);
                    setClientDetails({name: '', email: '', phone: '', babyAge: '', notes: ''});
                    setBooking(null);
                  }}
                  className="px-6 py-3 bg-gray-200 text-[#c27275] rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Nouvelle réservation
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingPage;