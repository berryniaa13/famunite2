// LoginPage.jsx
import React, { useState } from 'react';
import '../styles/login.scss';
import LoginForm from '../components/LoginForm';
import SignUpForm from '../components/SignUpForm';

export default function LoginPage() {
    // state for toggling between login/signup
    const [isSignUp, setIsSignUp] = useState(false);
    // state for that 1.5s “grow” animation on the switch container
    const [isGx, setIsGx] = useState(false);

    const changeForm = (e) => {
        e.preventDefault();
        // trigger the “is-gx” class for 1.5s
        setIsGx(true);
        setTimeout(() => setIsGx(false), 1500);

        // flip between login / signup
        setIsSignUp((prev) => !prev);
    };

    return (
        <div className="login" style={styles.container}>
            <div className={`main ${isGx ? 'is-gx' : ''}`}>
                {/* Sign-Up panel */}
                <div
                    id="a-container"
                    className={`container a-container ${isSignUp ? 'is-txl' : ''}`}
                >
                    {isSignUp ? <SignUpForm /> : <LoginForm/>}
                </div>

                {/* Login panel */}
                {/*<div*/}
                {/*    id="b-container"*/}
                {/*    className={`container b-container ${!isSignUp ? 'is-txl is-z200' : ''}`}*/}
                {/*>*/}
                {/*    /!*<LoginForm />*!/*/}
                {/*</div>*/}

                {/* Switch panel */}
                <div
                    id="switch-cnt"
                    className={`switch ${isSignUp ? 'is-txr' : ''}`}
                >
                    <div className="switch__circle" />
                    <div className="switch__circle switch__circle--t" />

                    <div
                        id="switch-c1"
                        className={`switch__container ${isSignUp ? 'is-hidden' : ''}`}
                    >
                        <h2 className="switch__title">Welcome Back!</h2>
                        <p className="switch__description">
                            To keep connected with us please login with your personal info
                        </p>
                        <button
                            onClick={changeForm}
                            className="switch__button button switch-btn"
                        >
                            SIGN UP
                        </button>
                    </div>

                    <div
                        id="switch-c2"
                        className={`switch__container ${!isSignUp ? 'is-hidden' : ''}`}
                    >
                        <h2 className="switch__title">Hello Friend!</h2>
                        <p className="switch__description">
                            Enter your personal details and start journey with us
                        </p>
                        <button
                            onClick={changeForm}
                            className="switch__button button switch-btn"
                        >
                            SIGN IN
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
const styles = {

}