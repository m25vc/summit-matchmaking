import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarClock } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface TimeSlot {
  time: string;
  selected: boolean;
  displayTime: string;
}

interface TimeSlotSelectorProps {
  onComplete: (selectedSlots: {[date: string]: string[]}) => void;
  onBack?: () => void;
  initialTimeSlots?: {[date: string]: string[]};
  showBackButton?: boolean;
}

export default function TimeSlotSelector({ 
  onComplete, 
  onBack, 
  initialTimeSlots = {},
  showBackButton = true 
}: TimeSlotSelectorProps) {
  // Fixed dates for day 1 and day 2
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(today);
  
  const todayStr = format(today, 'yyyy-MM-dd');
  const tomorrowStr = format(tomorrow, 'yyyy-MM-dd');
  
  // Function to convert 24-hour time to 12-hour format
  const formatTo12Hour = (time24: string): string => {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };
  
  // Generate time slots from 9 AM to 3 PM in 30-minute increments
  const generateTimeSlots = (dateStr: string) => {
    const slots: TimeSlot[] = [];
    const initialSlotsForDate = initialTimeSlots[dateStr] || [];
    
    for (let hour = 9; hour < 15; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push({
          time: timeString, // Store in 24-hour format for backend
          displayTime: formatTo12Hour(timeString), // Display in 12-hour format
          selected: initialSlotsForDate.includes(timeString)
        });
      }
    }
    return slots;
  };
  
  // State to track selected time slots for each day
  const [day1Slots, setDay1Slots] = useState<TimeSlot[]>(() => generateTimeSlots(todayStr));
  const [day2Slots, setDay2Slots] = useState<TimeSlot[]>(() => generateTimeSlots(tomorrowStr));
  
  // Toggle selection for a time slot
  const toggleTimeSlot = (daySlots: TimeSlot[], setDaySlots: React.Dispatch<React.SetStateAction<TimeSlot[]>>, index: number) => {
    const updatedSlots = [...daySlots];
    updatedSlots[index].selected = !updatedSlots[index].selected;
    setDaySlots(updatedSlots);
  };
  
  // Handle submission of selected time slots
  const handleSubmit = () => {
    const selectedSlots = {
      [todayStr]: day1Slots.filter(slot => slot.selected).map(slot => slot.time),
      [tomorrowStr]: day2Slots.filter(slot => slot.selected).map(slot => slot.time)
    };
    onComplete(selectedSlots);
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Select Your Unavailability</h2>
        <p className="text-gray-500">Please select 30-minute blocks when you're unavailable</p>
      </div>
      
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex-1 border rounded-md p-4">
          <h3 className="font-medium flex items-center mb-3">
            <CalendarClock className="mr-2 h-5 w-5" />
            Day 1
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {day1Slots.map((slot, index) => (
              <Button
                key={`day1-${index}`}
                type="button"
                variant={slot.selected ? "default" : "outline"}
                onClick={() => toggleTimeSlot(day1Slots, setDay1Slots, index)}
                className="text-sm h-10"
              >
                {slot.displayTime}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="flex-1 border rounded-md p-4">
          <h3 className="font-medium flex items-center mb-3">
            <CalendarClock className="mr-2 h-5 w-5" />
            Day 2
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {day2Slots.map((slot, index) => (
              <Button
                key={`day2-${index}`}
                type="button"
                variant={slot.selected ? "default" : "outline"}
                onClick={() => toggleTimeSlot(day2Slots, setDay2Slots, index)}
                className="text-sm h-10"
              >
                {slot.displayTime}
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex justify-between pt-4">
        {showBackButton && onBack && (
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
          >
            Back
          </Button>
        )}
        {!showBackButton && <div></div>}
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={[...day1Slots, ...day2Slots].filter(slot => slot.selected).length === 0}
        >
          {showBackButton ? 'Continue' : 'Save Availability'}
        </Button>
      </div>
    </div>
  );
}
