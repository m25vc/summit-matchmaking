
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarClock } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface TimeSlot {
  time: string;
  selected: boolean;
}

interface TimeSlotSelectorProps {
  onComplete: (selectedSlots: {[date: string]: string[]}) => void;
  onBack: () => void;
}

export default function TimeSlotSelector({ onComplete, onBack }: TimeSlotSelectorProps) {
  // Fixed dates for day 1 and day 2
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(today);
  
  // Generate time slots from 9 AM to 3 PM in 30-minute increments
  const generateTimeSlots = () => {
    const slots: TimeSlot[] = [];
    for (let hour = 9; hour < 15; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push({
          time: timeString,
          selected: false
        });
      }
    }
    return slots;
  };
  
  // State to track selected time slots for each day
  const [day1Slots, setDay1Slots] = useState<TimeSlot[]>(generateTimeSlots());
  const [day2Slots, setDay2Slots] = useState<TimeSlot[]>(generateTimeSlots());
  
  // Toggle selection for a time slot
  const toggleTimeSlot = (daySlots: TimeSlot[], setDaySlots: React.Dispatch<React.SetStateAction<TimeSlot[]>>, index: number) => {
    const updatedSlots = [...daySlots];
    updatedSlots[index].selected = !updatedSlots[index].selected;
    setDaySlots(updatedSlots);
  };
  
  // Handle submission of selected time slots
  const handleSubmit = () => {
    const selectedSlots = {
      [format(today, 'yyyy-MM-dd')]: day1Slots.filter(slot => slot.selected).map(slot => slot.time),
      [format(tomorrow, 'yyyy-MM-dd')]: day2Slots.filter(slot => slot.selected).map(slot => slot.time)
    };
    onComplete(selectedSlots);
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Select Your Availability</h2>
        <p className="text-gray-500">Please select 30-minute blocks when you're available</p>
      </div>
      
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex-1 border rounded-md p-4">
          <h3 className="font-medium flex items-center mb-3">
            <CalendarClock className="mr-2 h-5 w-5" />
            Day 1: {format(today, 'EEEE, MMMM d')}
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
                {slot.time}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="flex-1 border rounded-md p-4">
          <h3 className="font-medium flex items-center mb-3">
            <CalendarClock className="mr-2 h-5 w-5" />
            Day 2: {format(tomorrow, 'EEEE, MMMM d')}
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
                {slot.time}
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={[...day1Slots, ...day2Slots].filter(slot => slot.selected).length === 0}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
