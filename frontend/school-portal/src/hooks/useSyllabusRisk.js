import { useEffect } from 'react';
import { useCurriculumStore } from '../store/useCurriculumStore';

export const useSyllabusRisk = () => {
    const recentUpdates = useCurriculumStore(state => state.recentUpdates);

    useEffect(() => {
        if (recentUpdates.length > 0) {
            const latestUpdate = recentUpdates[0];
            
            // Check if the new velocity is critically low
            if (latestUpdate.new_velocity < 0.85) {
                // In a real app, you might trigger a toast library like react-hot-toast here
                // For this implementation, we dispatch a custom window event or use a local state
                console.warn(`CRITICAL RISK DETECTED: Velocity dropped to ${latestUpdate.new_velocity.toFixed(2)}v for ${latestUpdate.subject_id}`);
                
                // Dispatch event so War Room can show a red pulse or toast
                window.dispatchEvent(new CustomEvent('syllabus_risk_alert', { 
                    detail: latestUpdate 
                }));
            } else if (latestUpdate.new_velocity >= 0.95) {
                console.log(`Great progress! Velocity is healthy at ${latestUpdate.new_velocity.toFixed(2)}v`);
                window.dispatchEvent(new CustomEvent('syllabus_healthy_alert', { 
                    detail: latestUpdate 
                }));
            }
        }
    }, [recentUpdates]);

    return { 
        latestVelocity: recentUpdates.length > 0 ? recentUpdates[0].new_velocity : null,
        lastUpdate: recentUpdates.length > 0 ? recentUpdates[0] : null
    };
};
