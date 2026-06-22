"use client";

import { useState, useEffect } from 'react';

// This component fetches available delivery slots from Supabase and allows user selection
export default function DeliveryCalendar() {
  const [availableDates, setAvailableDates] = useState<{ date: string, slots: string[] }[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Simulate fetching from Supabase
  useEffect(() => {
    const fetchAvailability = async () => {
      setIsLoading(true);
      // Placeholder for Supabase query: 
      // const { data } = await supabase.from('delivery_slots').select('*').gte('date', today);
      
      setTimeout(() => {
        setAvailableDates([
          { date: '2026-06-25', slots: ['09:00 - 12:00', '13:00 - 17:00'] },
          { date: '2026-06-26', slots: ['09:00 - 12:00', '13:00 - 17:00'] },
          { date: '2026-06-27', slots: ['10:00 - 14:00'] },
        ]);
        setIsLoading(false);
      }, 800);
    };

    fetchAvailability();
  }, []);

  const handleConfirm = () => {
    if (selectedDate && selectedSlot) {
      // In a real app, you would pass this to a global state/context or checkout API
      console.log('Selected delivery:', selectedDate, selectedSlot);
      alert(`Delivery scheduled for ${selectedDate} at ${selectedSlot}`);
    }
  };

  return (
    <div className="bg-gray-darker p-8 border border-gray-dark">
      <h2 className="text-2xl font-serif text-foreground mb-6">Schedule Delivery</h2>
      
      {isLoading ? (
        <div className="text-gray-400 animate-pulse">Loading available slots...</div>
      ) : (
        <div className="space-y-6">
          {/* Date Selection */}
          <div>
            <label className="block text-sm uppercase tracking-widest text-gray-300 mb-3">
              Select Date
            </label>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {availableDates.map((day) => (
                <button
                  key={day.date}
                  onClick={() => {
                    setSelectedDate(day.date);
                    setSelectedSlot('');
                  }}
                  className={`flex-shrink-0 px-4 py-3 border transition-colors ${
                    selectedDate === day.date 
                      ? 'border-rose-soft bg-rose-soft/10 text-rose-soft' 
                      : 'border-gray-500 text-gray-400 hover:border-foreground hover:text-foreground'
                  }`}
                >
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </button>
              ))}
            </div>
          </div>

          {/* Time Slot Selection */}
          {selectedDate && (
            <div>
              <label className="block text-sm uppercase tracking-widest text-gray-300 mb-3">
                Select Time
              </label>
              <div className="grid grid-cols-2 gap-3">
                {availableDates.find(d => d.date === selectedDate)?.slots.map(slot => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`px-4 py-3 border transition-colors ${
                      selectedSlot === slot 
                        ? 'border-rose-soft bg-rose-soft/10 text-rose-soft' 
                        : 'border-gray-500 text-gray-400 hover:border-foreground hover:text-foreground'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <button 
            disabled={!selectedDate || !selectedSlot}
            onClick={handleConfirm}
            className="w-full py-4 mt-4 bg-foreground text-background font-medium tracking-widest uppercase hover:bg-rose-soft hover:text-background transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm Delivery Time
          </button>
        </div>
      )}
    </div>
  );
}