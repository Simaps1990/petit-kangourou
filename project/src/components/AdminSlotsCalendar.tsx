import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface TimeSlot {
  id: string;
  date: string;
  time: string;
  available: boolean;
  categories?: string[];
  maxSpots?: number;
}

interface BookingSummary {
  date: string;
  time: string;
  status: string;
  clientName?: string;
}

function getWeekStart(date: Date) {
  const d = new Date(date);
  const day = d.getDay() || 7; // 1-7, Monday=1
  if (day !== 1) {
    d.setDate(d.getDate() - (day - 1));
  }
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function addWeeks(date: Date, weeks: number) {
  return addDays(date, weeks * 7);
}

// Utiliser une clé de date locale en format YYYY-MM-DD pour éviter les décalages liés aux fuseaux horaires
function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Créneaux d'1 heure, en continu de 9h à 17h, tous les jours
const HOURS: string[] = [
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00'
];

const CATEGORY_CONFIG = {
  individual: {
    id: 'individual',
    label: "Atelier individuel",
    // Bleu
    color: '#3b82f6'
  },
  couple: {
    id: 'couple',
    label: "Atelier en couple",
    // Rouge
    color: '#ef4444'
  },
  group: {
    id: 'group',
    label: "Atelier en groupe",
    // Violet (spécifique demandé pour ateliers en groupe)
    color: '#a855f7'
  },
  home: {
    id: 'home',
    label: 'Suivi à domicile',
    // Noir
    color: '#111827'
  },
  premium: {
    id: 'premium',
    label: 'Pack Premium',
    // Vert
    color: '#22c55e'
  }
} as const;

type CategoryId = keyof typeof CATEGORY_CONFIG;

const DEFAULT_CATEGORIES: CategoryId[] = ['individual', 'couple', 'home', 'premium'];

function formatDayLabel(date: Date) {
  return date.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
}

export function AdminSlotsCalendar() {
  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart(new Date()));
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  // Par défaut : toutes les catégories sauf "group"
  const [selectedCategories, setSelectedCategories] = useState<Set<CategoryId>>(
    new Set<CategoryId>(DEFAULT_CATEGORIES)
  );

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  useEffect(() => {
    void loadWeekSlots();
  }, [currentWeekStart]);

  const loadWeekSlots = async () => {
    setLoading(true);
    try {
      const startStr = formatDateKey(currentWeekStart);
      const endStr = formatDateKey(addDays(currentWeekStart, 6));

      const { data, error } = await supabase
        .from('time_slots')
        .select('id, date, time, available, categories, max_spots')
        .gte('date', startStr)
        .lte('date', endStr);

      if (error) {
        console.error('Erreur chargement créneaux (calendar):', error);
        setSlots([]);
        return;
      }

      if (data) {
        console.log('📅 AdminSlotsCalendar - time_slots semaine', { startStr, endStr, raw: data });
        setSlots(
          data.map((slot: any) => ({
            id: slot.id,
            date: slot.date,
            time: slot.time,
            available: slot.available,
            categories: slot.categories || [],
            maxSpots: slot.max_spots
          }))
        );
      } else {
        setSlots([]);
      }

      // Charger les réservations de la semaine pour éviter de supprimer des créneaux déjà réservés
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('date, time, status, client_name')
        .gte('date', startStr)
        .lte('date', endStr);

      if (bookingsError) {
        console.error('Erreur chargement réservations (calendar):', bookingsError);
        setBookings([]);
      } else if (bookingsData) {
        console.log('📘 AdminSlotsCalendar - bookings semaine', { startStr, endStr, raw: bookingsData });
        setBookings(
          bookingsData.map((b: any) => ({
            date: b.date,
            time: b.time,
            status: b.status,
            clientName: b.client_name
          }))
        );
      } else {
        setBookings([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleCategorySelection = (id: CategoryId) => {
    setSelectedCategories((prev) => {
      let next = new Set(prev);

      if (id === 'group') {
        // Cas particulier : "en groupe" exclusif, 6 places
        if (next.has('group')) {
          // Si on décoche "groupe", revenir aux catégories par défaut
          next = new Set<CategoryId>(DEFAULT_CATEGORIES);
        } else {
          // Si on coche "groupe", ne garder que cette catégorie
          next = new Set<CategoryId>(['group']);
        }
      } else {
        // Autres catégories : simple toggle, sans toucher à "group" si déjà sélectionné
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }

        // Si on enlève tout par erreur, revenir au défaut (éviter set vide)
        if (next.size === 0) {
          next = new Set<CategoryId>(DEFAULT_CATEGORIES);
        }
      }

      // Si des créneaux sont sélectionnés, appliquer immédiatement les catégories mises à jour
      if (selectedSlots.size > 0) {
        void (async () => {
          setLoading(true);
          try {
            const idsToUpdate: string[] = [];
            selectedSlots.forEach((key) => {
              const [date, time] = key.split('_');
              const existing = findSlot(date, time);
              if (existing) {
                idsToUpdate.push(existing.id);
              }
            });

            if (idsToUpdate.length === 0) return;

            const categories = Array.from(next);
            const max_spots = next.has('group') ? 6 : 1;

            // Mise à jour immédiate de l'état local pour un retour visuel instantané
            setSlots((prev) =>
              prev.map((slot) =>
                idsToUpdate.includes(slot.id)
                  ? { ...slot, categories, maxSpots: max_spots }
                  : slot
              )
            );

            const { error } = await supabase
              .from('time_slots')
              .update({ categories, max_spots })
              .in('id', idsToUpdate);

            if (error) {
              console.error('Erreur mise à jour catégories (toggleCategorySelection):', error);
            }
          } finally {
            setLoading(false);
          }
        })();
      }

      return next;
    });
  };

  const getSlotKey = (date: string, time: string) => `${date}_${time}`;

  const toggleSelection = (date: string, time: string) => {
    const key = getSlotKey(date, time);
    const next = new Set(selectedSlots);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSelectedSlots(next);

    // Si un seul créneau est sélectionné, synchroniser les catégories avec ce créneau
    if (next.size === 1) {
      const [onlyKey] = Array.from(next.values());
      const [d, t] = onlyKey.split('_');
      const slot = findSlot(d, t);
      if (slot && slot.categories && slot.categories.length > 0) {
        setSelectedCategories(new Set(slot.categories as CategoryId[]));
      } else {
        setSelectedCategories(new Set(DEFAULT_CATEGORIES));
      }
    }
  };

  const findSlot = (date: string, time: string) => {
    return slots.find((s) => s.date === date && s.time === time) || null;
  };

  const hasBooking = (date: string, time: string) => {
    // On considère qu'un créneau est "réservé" si une booking existe et n'est pas annulée
    const match = bookings.find(
      (b) => b.date === date && b.time === time && b.status !== 'cancelled'
    );

    if (match) {
      console.log('🔒 hasBooking -> créneau protégé', { date, time, booking: match });
      return true;
    }

    return false;
  };

  const addSelected = async () => {
    if (selectedSlots.size === 0) return;

    setLoading(true);
    try {
      const toUpsert: any[] = [];

      selectedSlots.forEach((key) => {
        const [date, time] = key.split('_');
        const existing = findSlot(date, time);
        if (existing && existing.available) return;

        const id = `${date}-${time}`;
        toUpsert.push({
          id,
          date,
          time,
          available: true,
          max_spots: 1,
          booked_spots: 0,
          categories: Array.from(selectedCategories)
        });
      });

      if (toUpsert.length === 0) return;

      const { error } = await supabase
        .from('time_slots')
        .upsert(toUpsert, { onConflict: 'id' });

      if (error) {
        console.error('Erreur ajout créneaux (calendar):', error);
      } else {
        await loadWeekSlots();
      }
    } finally {
      setLoading(false);
    }
  };

  const removeSelected = async () => {
    if (selectedSlots.size === 0) return;

    setLoading(true);
    try {
      const idsToDelete: string[] = [];
      selectedSlots.forEach((key) => {
        const [date, time] = key.split('_');
        const existing = findSlot(date, time);
        // Ne pas supprimer les créneaux qui ont déjà une réservation
        if (existing && existing.available && !hasBooking(date, time)) {
          idsToDelete.push(existing.id);
        }
      });

      if (idsToDelete.length === 0) return;

      const { error } = await supabase
        .from('time_slots')
        .delete()
        .in('id', idsToDelete);

      if (error) {
        console.error('Erreur suppression créneaux (calendar):', error);
      } else {
        await loadWeekSlots();
      }
    } finally {
      setLoading(false);
    }
  };

  const addWholeWeek = async () => {
    setLoading(true);
    try {
      const toUpsert: any[] = [];
      const now = new Date();

      weekDays.forEach((day) => {
        const dateStr = formatDateKey(day);
        HOURS.forEach((time) => {
          // Si on est sur la semaine actuelle, ne créer que les créneaux strictement futurs
          const slotDateTime = new Date(day);
          const [h, m] = time.split(':').map(Number);
          slotDateTime.setHours(h, m, 0, 0);

          // Si la semaine est en cours et que le créneau est passé, on le saute
          const isCurrentWeek = formatDateKey(getWeekStart(now)) === formatDateKey(currentWeekStart);
          if (isCurrentWeek && slotDateTime <= now) {
            return;
          }

          const id = `${dateStr}-${time}`;
          toUpsert.push({
            id,
            date: dateStr,
            time,
            available: true,
            max_spots: 1,
            booked_spots: 0,
            categories: Array.from(selectedCategories)
          });
        });
      });

      const { error } = await supabase
        .from('time_slots')
        .upsert(toUpsert, { onConflict: 'id' });

      if (error) {
        console.error('Erreur ajout semaine (calendar):', error);
      } else {
        await loadWeekSlots();
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteWholeWeek = async () => {
    setLoading(true);
    try {
      const startStr = formatDateKey(currentWeekStart);
      const endStr = formatDateKey(addDays(currentWeekStart, 6));

      const { data, error } = await supabase
        .from('time_slots')
        .select('id, date, time')
        .gte('date', startStr)
        .lte('date', endStr);

      if (error || !data) return;

      // Ne pas supprimer les créneaux liés à au moins une réservation non annulée
      const deletable: any[] = [];
      const protectedSlots: any[] = [];

      (data as any[]).forEach((s) => {
        if (hasBooking(s.date, s.time)) {
          protectedSlots.push(s);
        } else {
          deletable.push(s);
        }
      });

      const idsToDelete = deletable.map((s) => s.id);
      console.log('🧹 AdminSlotsCalendar - deleteWholeWeek', {
        startStr,
        endStr,
        totalSlots: data.length,
        deletable,
        protectedSlots,
      });
      if (idsToDelete.length === 0) return;

      const { error: delError } = await supabase
        .from('time_slots')
        .delete()
        .in('id', idsToDelete);

      if (delError) {
        console.error('Erreur suppression semaine (calendar):', delError);
      } else {
        await loadWeekSlots();
      }
    } finally {
      setLoading(false);
    }
  };
  const canAddSelected = selectedSlots.size > 0;
  const canRemoveSelected = selectedSlots.size > 0;

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, -1))}
            className="px-3 py-2 rounded-lg bg-[#c27275]/10 text-[#c27275] text-sm"
          >
            Semaine précédente
          </button>
          <button
            onClick={() => setCurrentWeekStart(getWeekStart(new Date()))}
            className="px-3 py-2 rounded-lg bg-[#c27275] text-white text-sm font-semibold"
          >
            Semaine actuelle
          </button>
          <button
            onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}
            className="px-3 py-2 rounded-lg bg-[#c27275]/10 text-[#c27275] text-sm"
          >
            Semaine suivante
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={addWholeWeek}
            className="px-3 py-2 rounded-lg bg-green-600 text-white text-sm"
            disabled={loading}
          >
            Ajouter toute la semaine (créneaux 1h)
          </button>
          <button
            onClick={addSelected}
            className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm disabled:opacity-50"
            disabled={loading || !canAddSelected}
          >
            Ajouter sélection
          </button>
          <button
            onClick={removeSelected}
            className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm disabled:opacity-50"
            disabled={loading || !canRemoveSelected}
          >
            Supprimer sélection
          </button>
          <button
            onClick={deleteWholeWeek}
            className="px-3 py-2 rounded-lg bg-red-700 text-white text-sm"
            disabled={loading}
          >
            Supprimer toute la semaine
          </button>
        </div>
      </div>

      {/* Sélection globale des catégories pour les créneaux ajoutés / mis à jour */}
      <div className="mb-4 p-3 rounded-lg bg-[#fff1ee] border border-[#c27275]/20 flex flex-wrap items-center gap-3">
        <span className="text-xs font-medium text-[#c27275] mr-2">
          Catégories appliquées aux créneaux :
        </span>
        {Object.values(CATEGORY_CONFIG).map((cat) => (
          <label key={cat.id} className="flex items-center gap-1 text-xs text-[#c27275]">
            <input
              type="checkbox"
              checked={selectedCategories.has(cat.id)}
              onChange={() => toggleCategorySelection(cat.id)}
              className="w-3 h-3 rounded border-[#c27275]/40 text-[#c27275]"
            />
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ backgroundColor: cat.color }}
            ></span>
            <span>{cat.label}</span>
          </label>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-[#c27275]/20 overflow-hidden">
        <div className="px-4 py-3 border-b border-[#fff1ee] flex items-center justify-between">
          <span className="font-semibold text-[#c27275]">
            Semaine du {currentWeekStart.toLocaleDateString('fr-FR')}
          </span>
          {loading && <span className="text-xs text-[#c27275]/70">Chargement...</span>}
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            <div className="grid grid-cols-8 gap-px bg-[#fff1ee]">
              <div className="bg-white p-2 text-xs font-medium text-[#c27275]/70 text-center">Heure</div>
              {weekDays.map((day, idx) => (
                <div key={idx} className="bg-white p-2 text-xs font-medium text-[#c27275] text-center">
                  {formatDayLabel(day)}
                </div>
              ))}
            </div>
            {HOURS.map((hour) => (
              <div key={hour} className="grid grid-cols-8 gap-px bg-[#fff1ee]">
                <div className="bg-white p-2 text-xs font-medium text-[#c27275]/70 text-center">
                  {hour}
                </div>
                {weekDays.map((day, idx) => {
                  const dateStr = formatDateKey(day);
                  const key = getSlotKey(dateStr, hour);
                  const existing = findSlot(dateStr, hour);
                  const isSelected = selectedSlots.has(key);

                  const bookingForSlot = bookings.find(
                    (b) => b.date === dateStr && b.time === hour && b.status !== 'cancelled'
                  );

                  let className = 'bg-white text-xs text-[#c27275]';

                  if (isSelected) {
                    // Créneau sélectionné : bleu ciel clair
                    className = 'bg-sky-200 text-[#0f172a]';
                  } else if (bookingForSlot) {
                    // Créneau réservé : fond doré
                    className = 'bg-yellow-300 text-black';
                  } else if (existing && existing.available) {
                    // Créneau disponible sans réservation : vert clair
                    className = 'bg-green-100 text-[#166534]';
                  } else {
                    // Aucun créneau ou non disponible : gris
                    className = 'bg-gray-50 text-[#c27275]/60';
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      className={`${className} p-2 text-center hover:bg-[#c27275]/10 transition-colors`}
                      onClick={() => toggleSelection(dateStr, hour)}
                    >
                      <div className="text-[11px] leading-tight">
                        {(() => {
                          if (bookingForSlot) {
                            return bookingForSlot.clientName || 'Réservé';
                          }
                          return existing && existing.available ? 'Dispo' : '—';
                        })()}
                      </div>
                      {existing && existing.available && existing.categories && existing.categories.length > 0 && (
                        <div className="mt-1 flex justify-center gap-1">
                          {existing.categories.map((catId) => {
                            const config = CATEGORY_CONFIG[catId as CategoryId];
                            if (!config) return null;
                            return (
                              <span
                                key={catId}
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: config.color }}
                              ></span>
                            );
                          })}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
