import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore'; // ✅ ADD THIS
import { auth, firestore } from '../context/firebaseConfig'; // ✅ ADD firestore
import authService from '../services/authService';
import famUniteLogo from "../assets/FAMUniteLogoNude.png";

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
            width: '500px',
            textAlign: 'center',
            border: '0px solid #ddd',
            padding: '20px',
            backgroundColor: '#F2EBE9',
            // borderRadius: '5px',
            marginTop: '100px',
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
        },

        headerContainer: {
            display: "flex",
            alignItems: "center",
            gap: "10px"
        },
        input: {
            marginBottom: '20px',
            width: '100%',
            height: '40px',
            padding: '0 10px',
            borderRadius: '5px',
            border: '1px solid #ccc'
        },
        button: {
            width: '100%',
            height: '40px',
            backgroundColor: '#12491B',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold'
        },
        signUpButton: {
            width: '100%',
            height: '40px',
            backgroundColor: '#12491B',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold',
            marginTop: '10px'
        },
        error: {
            color: 'red',
            marginBottom: '10px'
        },
        logo: {
            width: "50px", // Adjust logo size
            height: "50px",
        },
        header: {
            fontSize: "24px",
            fontWeight: "bold",
            color: "#12491B",
        },
        pageWrapper: {
            backgroundColor: '#F2EBE9',
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }
    };

    return (
        <div style ={styles.pageWrapper}>
        <div style={styles.container}>
            <div style={styles.headerContainer}>
                <img src={famUniteLogo} alt="FAMUnite Logo" style={styles.logo} />
                <h1 style={styles.header}>Login</h1>
            </div>
            {error && <p style={styles.error}>{error}</p>}
            <form onSubmit={handleLogin} style={{margin: '10px 10px 10px 10px'}}>
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
                <button style={styles.signUpButton} onClick={()=> navigate('/signup')}>Sign Up</button>
            </form>
        </div>
        </div>
    );
}

export default LoginPage;
