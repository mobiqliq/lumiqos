import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const history = useHistory();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            // Note: If you are not using a proxy, you may need the full URL (e.g., http://localhost:3000/auth/login)
            const response = await fetch('/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Adhering to the new payload: access_token and user object
                localStorage.setItem('access_token', data.access_token);
                localStorage.setItem('user_profile', JSON.stringify(data.user));
                
                console.log('Login successful for:', data.user.name);
                history.push('/dashboard'); 
            } else {
                setError(data.message || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            setError('Network error: Could not reach the authentication service.');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center' }}>
            <h2>XceliQOS Login</h2>
            {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}
            <form onSubmit={handleLogin}>
                <div style={{ marginBottom: '15px' }}>
                    <label>Email:</label><br/>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>Password:</label><br/>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                </div>
                <button type="submit" style={{ padding: '10px 20px' }}>Login</button>
            </form>
        </div>
    );
};

export default LoginPage;
