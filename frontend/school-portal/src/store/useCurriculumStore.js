import { create } from 'zustand';
import { io } from 'socket.io-client';

// Connect to the backend WebSocket Gateway (school-service runs on 3001)
const socket = io('http://localhost:3001', {
    autoConnect: false // We will connect manually when the user logs in
});

export const useCurriculumStore = create((set, get) => ({
    masterCalendar: [],
    recentUpdates: [],
    isConnected: false,
    socket: socket,

    connectSocket: () => {
        if (!socket.connected) {
            socket.connect();
            set({ isConnected: true });
            
            socket.on('lesson_completed', (data) => {
                // Update the state instantly when a teacher completes a lesson
                const updates = get().recentUpdates;
                set({ 
                    recentUpdates: [data, ...updates].slice(0, 50) // Keep last 50 updates
                });
            });

            socket.on('calendar_updated', (data) => {
                // Refresh master calendar if a core shift occurs
                console.log('Calendar was live-updated by another admin:', data);
            });
        }
    },

    disconnectSocket: () => {
        if (socket.connected) {
            socket.disconnect();
            set({ isConnected: false });
        }
    },

    setMasterCalendar: (calendar) => set({ masterCalendar: calendar }),

    // Local Manipulation Logic for "What-If" preview
    // When the principal drags a holiday or edits the calendar, we locally manipulate the masterCalendar
    previewHolidayShift: (startDate, endDate) => {
        const currentCal = get().masterCalendar;
        const previewCal = currentCal.map(day => {
            if (day.date >= startDate && day.date <= endDate) {
                return { ...day, is_working_day: false, day_type: 'Holiday' };
            }
            return day;
        });

        // Compute simulated casualty or deficit (simplified local logic here, can be robust)
        let lostDays = 0;
        previewCal.forEach(d => {
            if (d.date >= startDate && d.date <= endDate && d.is_working_day === false) {
                lostDays++;
            }
        });

        return { previewCal, lostDays };
    }
}));
