import React, { useState } from 'react';

export const LessonLab = () => {
  const [topic, setTopic] = useState('');
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generatePlan = async () => {
    setLoading(true);
    try {
      const response = await apiRequest('/teacher/lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });
      const data = await response.json();
      setPlan(data.lesson_plan);
    } catch (error) {
      console.error("AI Lab Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <h2>AI Lesson Lab</h2>
      <input 
        value={topic} 
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Enter topic (e.g. Photosynthesis)"
        style={{ width: '70%', padding: '10px' }}
      />
      <button onClick={generatePlan} disabled={loading} style={{ padding: '10px 20px' }}>
        {loading ? 'Generating...' : 'Generate Plan'}
      </button>

      {plan && (
        <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '15px' }}>
          <h3>{plan.topic}</h3>
          <p><strong>Duration:</strong> {plan.duration} mins</p>
          <h4>Objectives:</h4>
          <ul>{plan.objectives?.map((obj: string, i: number) => <li key={i}>{obj}</li>)}</ul>
          <h4>Content:</h4>
          <p>{plan.content}</p>
        </div>
      )}
    </div>
  );
};
