import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../context/firebaseConfig'; // Import your Firebase auth instance
import { signInWithEmailAndPassword } from 'firebase/auth';
import authService from '../services/authService';

function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            console.log("Querying with email:", email); // Debugging line

            // Fetch the user's role from Firestore
            const userRole = await authService.getUserRoleByEmail(user.email); // Use email directly
            localStorage.setItem('userRole', userRole); // Store role in localStorage

            // Redirect user to the dashboard based on their role
            if (userRole === 'Admin') {
                navigate('/admin-dashboard'); // Admin dashboard route
            }
            else if(userRole === 'Organization Liason')
            {
                navigate('/organization-liason-dashboard')
            }
            else if(userRole === 'Event Moderator')
            {
                navigate('/event-moderator-dashboard')
            }
            else {
                navigate('/student-dashboard'); // student dashboard route
            }

            console.log('Logged in user:', user);
        } catch (error) {
            setError('Failed to login. Please check your credentials.');
            console.error('Login error:', error.message); // Log the Firebase error message
        }
    };



    // Inline CSS
    const styles = {
        container: {
            margin: '0 auto',
            width: '300px',
            textAlign: 'center',
            border: '1px solid #ddd',
            padding: '20px',
            borderRadius: '5px',
            marginTop: '100px'
        },
        input: {
            marginBottom: '10px',
            width: '100%',
            height: '40px',
            padding: '0 10px',
            borderRadius: '5px',
            border: '1px solid #ccc'
        },
        button: {
            width: '100%',
            height: '40px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
        },
        error: {
            color: 'red',
            marginBottom: '10px'
        }
    };

    return (
        <div style={styles.container}>
            <h1>Login</h1>
            {error && <p style={styles.error}>{error}</p>}
            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={styles.input}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={styles.input}
                />
                <button type="submit" style={styles.button}>Login</button>
            </form>
        </div>
    );
}

export default LoginPage;
