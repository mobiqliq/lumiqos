export async function sarvamTranslateIntent(transcribedText, language = 'hi-IN') {
    console.log(`[Sarvam AI] Processing ${language} input: "${transcribedText}"`);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const lowerText = transcribedText.toLowerCase();

    if (lowerText.includes('absent') || lowerText.includes('एब्सेंट') || lowerText.includes('छुट्टी')) {
        return {
            intent: 'MARK_ATTENDANCE',
            action: 'MARK_ABSENT',
            entities: ['Aarav', 'Priya', 'Karthik'].filter(name => lowerText.includes(name.toLowerCase()) || transcribedText.includes(name))
        };
    }

    if (lowerText.includes('homework') || lowerText.includes('assignment') || lowerText.includes('होमवर्क')) {
        return {
            intent: 'CREATE_ASSIGNMENT',
            action: 'REMIND_HOMEWORK',
            entities: ['Algebra Worksheet 4']
        };
    }

    return {
        intent: 'UNKNOWN',
        action: null,
        entities: []
    };
}
