import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface TimeSlot {
  id: string;
  date: string;
  time: string;
  available: boolean;
}

interface BookingSummary {
  date: string;
  time: string;
  status: string;
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

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  useEffect(() => {
    void loadWeekSlots();
  }, [currentWeekStart]);

  const loadWeekSlots = async () => {
    setLoading(true);
    try {
      const startStr = currentWeekStart.toISOString().slice(0, 10);
      const endStr = addDays(currentWeekStart, 6).toISOString().slice(0, 10);

      const { data, error } = await supabase
        .from('time_slots')
        .select('id, date, time, available')
        .gte('date', startStr)
        .lte('date', endStr);

      if (error) {
        console.error('Erreur chargement créneaux (calendar):', error);
        setSlots([]);
        return;
      }

      if (data) {
        setSlots(
          data.map((slot: any) => ({
            id: slot.id,
            date: slot.date,
            time: slot.time,
            available: slot.available
          }))
        );
      } else {
        setSlots([]);
      }

      // Charger les réservations de la semaine pour éviter de supprimer des créneaux déjà réservés
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('date, time, status')
        .gte('date', startStr)
        .lte('date', endStr);

      if (bookingsError) {
        console.error('Erreur chargement réservations (calendar):', bookingsError);
        setBookings([]);
      } else if (bookingsData) {
        setBookings(
          bookingsData.map((b: any) => ({
            date: b.date,
            time: b.time,
            status: b.status
          }))
        );
      } else {
        setBookings([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const getSlotKey = (date: string, time: string) => `${date}_${time}`;

  const toggleSelection = (date: string, time: string) => {
    const key = getSlotKey(date, time);
    const next = new Set(selectedSlots);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSelectedSlots(next);
  };

  const findSlot = (date: string, time: string) => {
    return slots.find((s) => s.date === date && s.time === time) || null;
  };

  const hasBooking = (date: string, time: string) => {
    // On considère qu'un créneau est "réservé" si une booking existe et n'est pas annulée
    return bookings.some(
      (b) => b.date === date && b.time === time && b.status !== 'cancelled'
    );
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
          booked_spots: 0
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
      weekDays.forEach((day) => {
        const dateStr = day.toISOString().slice(0, 10);
        HOURS.forEach((time) => {
          const id = `${dateStr}-${time}`;
          toUpsert.push({
            id,
            date: dateStr,
            time,
            available: true,
            max_spots: 1,
            booked_spots: 0
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
      const startStr = currentWeekStart.toISOString().slice(0, 10);
      const endStr = addDays(currentWeekStart, 6).toISOString().slice(0, 10);

      const { data, error } = await supabase
        .from('time_slots')
        .select('id, date, time')
        .gte('date', startStr)
        .lte('date', endStr);

      if (error || !data) return;

      // Ne pas supprimer les créneaux liés à au moins une réservation non annulée
      const idsToDelete = (data as any[])
        .filter((s) => !hasBooking(s.date, s.time))
        .map((s) => s.id);
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
                  const dateStr = day.toISOString().slice(0, 10);
                  const key = getSlotKey(dateStr, hour);
                  const existing = findSlot(dateStr, hour);
                  const isSelected = selectedSlots.has(key);

                  let className = 'bg-white text-xs text-[#c27275]';
                  if (existing && existing.available) {
                    className = 'bg-green-100 text-[#166534]';
                  }
                  if (!existing) {
                    className = 'bg-gray-50 text-[#c27275]/60';
                  }
                  if (isSelected) {
                    className = 'bg-blue-500 text-white';
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      className={`${className} p-2 text-center hover:bg-[#c27275]/10 transition-colors`}
                      onClick={() => toggleSelection(dateStr, hour)}
                    >
                      {existing && existing.available ? 'Dispo' : '—'}
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
