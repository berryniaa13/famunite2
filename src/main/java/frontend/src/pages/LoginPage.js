import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore'; // ✅ ADD THIS
import { auth, firestore } from '../context/firebaseConfig'; // ✅ ADD firestore
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

            console.log("User logged in:", user.email, user.uid);

            // ✅ TEMPORARY FIX: Ensure user profile exists with correct UID
            await setDoc(doc(firestore, "User", user.uid), {
                email: user.email,
                //role: "Organization Liaison" // Or whatever role this user should have
            }, { merge: true }); // Use merge:true so it doesn't overwrite existing data

            // 🔍 Now retrieve the role for routing
            const userRole = await authService.getUserRoleByEmail(user.email);
            console.log("User role:", userRole);

            if (!userRole) {
                alert("Your profile is not set up yet. Contact admin.");
                return;
            }

            localStorage.setItem('userRole', userRole);

            switch (userRole) {
                case 'Admin':
                    navigate('/admin-dashboard');
                    break;
                case 'Organization Liaison':
                    navigate('/organization-liason-dashboard');
                    break;
                case 'Event Moderator':
                    navigate('/event-moderator-dashboard');
                    break;
                case 'Student':
                    navigate('/student-dashboard');
                    break;
                default:
                    setError('Unauthorized role or missing role. Contact admin.');
                    break;
            }

        } catch (error) {
            setError('Failed to login. Please check your credentials.');
            console.error('Login error:', error.message);
        }
    };


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
                    name="email"
                    id="email"
                    autoComplete="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={styles.input}
                    required
                />
                <input
                    type="password"
                    name="password"
                    id="password"
                    autoComplete="current-password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={styles.input}
                    required
                />
                <button type="submit" style={styles.button}>Login</button>
            </form>
        </div>
    );
}

export default LoginPage;
