import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const COMMANDS = [
    { id: 'morning-pulse', icon: '🚦', label: 'View Morning Pulse', action: '/war-room', keywords: ['health', 'pulse', 'status', 'traffic light'] },
    { id: 'rainy-day', icon: '☔', label: 'Declare School Closed (Rainy Day)', action: 'MODAL_RAINY_DAY', keywords: ['closure', 'holiday', 'rain', 'emergency'] },
    { id: 'nep-report', icon: '📄', label: 'Generate NEP Audit Report', action: 'MODAL_NEP', keywords: ['compliance', 'cbse', 'audit', 'report'] },
    { id: 'teacher-health', icon: '🧠', label: 'Open Teacher Health Radar', action: '/war-room', keywords: ['burnout', 'stress', 'velocity', 'support'] },
    { id: 'onboarding', icon: '🚀', label: 'Resume Academic Launch', action: '/onboarding', keywords: ['setup', 'launch', 'year', 'config'] }
];

export default function CommandBar() {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 10);
            setSearch('');
            setActiveIndex(0);
        }
    }, [isOpen]);

    const filteredCommands = COMMANDS.filter(cmd => 
        cmd.label.toLowerCase().includes(search.toLowerCase()) || 
        cmd.keywords.some(k => k.includes(search.toLowerCase()))
    );

    const handleSelect = (cmd) => {
        if (cmd.action.startsWith('/')) {
            navigate(cmd.action);
        } else {
            // In a real app, fire a global event or update a store
            console.log("Triggering Special Action:", cmd.action);
            window.dispatchEvent(new CustomEvent('LUMIQ_ACTION', { detail: cmd.action }));
        }
        setIsOpen(false);
    };

    if (!isOpen) return null;

    return (
        <div className="command-bar-overlay" onClick={() => setIsOpen(false)}>
            <div className="command-bar-container glass-panel aura-glow" onClick={e => e.stopPropagation()}>
                <div className="command-bar-search">
                    <span className="search-icon">🔍</span>
                    <input 
                        ref={inputRef}
                        type="text" 
                        placeholder="What would you like to do? (e.g. 'Rainy Day'...)" 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'ArrowDown') setActiveIndex(prev => (prev + 1) % filteredCommands.length);
                            if (e.key === 'ArrowUp') setActiveIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
                            if (e.key === 'Enter') handleSelect(filteredCommands[activeIndex]);
                        }}
                    />
                    <div className="kbd-hint">ESC</div>
                </div>

                <div className="command-bar-results">
                    {filteredCommands.length > 0 ? (
                        filteredCommands.map((cmd, i) => (
                            <div 
                                key={cmd.id}
                                onClick={() => handleSelect(cmd)}
                                onMouseEnter={() => setActiveIndex(i)}
                                className={`command-item ${i === activeIndex ? 'active' : ''}`}
                            >
                                <span className="command-icon">{cmd.icon}</span>
                                <div className="command-info">
                                    <div className="command-label">{cmd.label}</div>
                                    <div className="command-keywords">{cmd.keywords.join(' • ')}</div>
                                </div>
                                {i === activeIndex && <span className="command-enter">⏎ Enter</span>}
                            </div>
                        ))
                    ) : (
                        <div className="command-empty">
                            No commands found for "{search}"
                        </div>
                    )}
                </div>

                <div className="command-bar-footer">
                    <span><b>↑↓</b> to navigate</span>
                    <span><b>⏎</b> to select</span>
                    <span><b>⌘K</b> to close</span>
                </div>
            </div>
        </div>
    );
}
