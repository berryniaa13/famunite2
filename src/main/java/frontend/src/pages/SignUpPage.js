import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc, serverTimestamp, collection } from 'firebase/firestore';
import { auth, firestore } from '../context/firebaseConfig';
import famUniteLogo from "../assets/FAMUniteLogoNude.png";

function SignUpPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [contactInfo, setContactInfo] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [organization, setOrganization] = useState('');
    const [error, setError] = useState('');

    const handleSignUp = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(firestore, "User", user.uid), {
                email: email,
                role: role,
                contact_info: contactInfo,
                name: name,
                status: "Active",
                created_at: serverTimestamp(),
                updated_at: serverTimestamp(),
            });

            if (role === "Organization Liaison" && organization) {
                await setDoc(doc(collection(firestore, "Organizations"), organization), {
                    name: organization,
                    created_at: serverTimestamp(),
                    created_by: user.uid,
                });
            }

            if (role === "Student") {
                navigate('/student-dashboard');
            } else if (role === "Organization Liaison") {
                navigate('/organization-liason-dashboard');
            } else if (role === "Event Moderator") {
                navigate('/event-moderator-dashboard');
            }
        } catch (error) {
            setError("Failed to create account. Try again.");
            console.error("Sign-up error:", error.message);
        }
    };

    const styles = {
        container: {
            margin: '0 auto',
            width: '500px',
            textAlign: 'center',
            padding: '20px',
            backgroundColor: '#F2EBE9',
            marginTop: '100px',
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
        },
        input: {
            marginBottom: '15px',
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
        <div style={styles.pageWrapper}>
            <div style={styles.container}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <img src={famUniteLogo} alt="FAMUnite Logo" style={styles.logo} />
                    <h1 style={styles.header}>Sign Up</h1>
                </div>
                {error && <p style={styles.error}>{error}</p>}
                <form onSubmit={handleSignUp} style={{margin: '10px'}}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={styles.input}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={styles.input}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        style={styles.input}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={styles.input}
                    />
                    <input
                        type="text"
                        placeholder="Phone Number"
                        value={contactInfo}
                        onChange={(e) => setContactInfo(e.target.value)}
                        style={styles.input}
                    />
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        style={styles.input}
                        required
                    >
                        <option value="">Select Role</option>
                        <option value="Student">Student</option>
                        <option value="Organization Liaison">Organization Liaison</option>
                        <option value="Event Moderator">Event Moderator</option>
                    </select>
                    {role === "Organization Liaison" && (
                        <input
                            type="text"
                            placeholder="Organization Name"
                            value={organization}
                            onChange={(e) => setOrganization(e.target.value)}
                            style={styles.input}
                            required
                        />
                    )}
                    <button type="submit" style={styles.button}>Sign Up</button>
                </form>
            </div>
        </div>
    );
}

export default SignUpPage;
