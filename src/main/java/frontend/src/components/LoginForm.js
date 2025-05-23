import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { auth, firestore } from '../context/firebaseConfig';
import famUniteLogo from "../assets/FAMUniteLogoNude.png";
import "../styles/login.scss"

function LoginForm() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(""); // Clear previous error

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            console.log("User logged in:", user.email, user.uid);

            const userRef = doc(firestore, "User", user.uid);
            const userDoc = await getDoc(userRef, { source: 'server' }); // Force fresh fetch

            if (!userDoc.exists()) {
                await signOut(auth);
                setError("User profile not found. Contact admin.");
                return;
            }

            const userData = userDoc.data();
            console.log("Fetched user status:", userData.status);

            if (userData.status !== "Active") {
                await signOut(auth);
                setError("Your account is inactive. Please contact an admin.");
                return;
            }

            // Get role from Firestore via helper
            //const userRole = await authService.getUserRoleByEmail(user.email);
            const userRole = userData.role;
            console.log("User role:", userRole);

            if (!userRole) {
                await signOut(auth);
                setError("Your profile is missing a role. Contact admin.");
                return;
            }

            localStorage.setItem('userRole', userRole);

            // Navigate based on role
            switch (userRole) {
                case 'Admin':
                    navigate('/admin-dashboard');
                    break;
                case 'Organization Liaison':
                    navigate('/organization-liaison-dashboard');
                    break;
                case 'Event Moderator':
                    navigate('/event-moderator-dashboard');
                    break;
                case 'Student':
                    navigate('/student-dashboard');
                    break;
                default:
                    await signOut(auth);
                    setError('Unauthorized role. Contact admin.');
                    break;
            }

        } catch (error) {
            console.error('Login error:', error.message);
            setError('Failed to login. Please check your credentials.');
        }
    };

    const styles = {
        container: {
            margin: '0 auto',
            width: '500px',
            textAlign: 'center',
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
            backgroundColor: 'var(--primary-green)',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold'
        },
        signUpButton: {
            width: '100%',
            height: '40px',
            backgroundColor: 'var(--primary-green)',
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
            width: "50px",
            height: "50px",
        },
        header: {
            fontSize: "24px",
            fontWeight: "bold",
            color: "var(--primary-green)",
        },
        // pageWrapper: {
        //     backgroundColor: 'var(--nude)',
        //     minHeight: '100vh',
        //     display: 'flex',
        //     justifyContent: 'center',
        //     alignItems: 'center'
        // }
    };

    return (
        <div>
            <div className={"login form"}>
                <div style={styles.headerContainer}>
                    <img src={famUniteLogo} alt="FAMUnite Logo" style={styles.logo} />
                    <h1 style={styles.header}>Login</h1>
                </div>
                {error && <p style={styles.error}>{error}</p>}
                <form onSubmit={handleLogin} style={{ margin: '10px' }}>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={styles.input}
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={styles.input}
                        required
                    />
                    <button type="submit" style={styles.button}>Login</button>
                </form>
            </div>
        </div>
    );
}

export default LoginForm;
