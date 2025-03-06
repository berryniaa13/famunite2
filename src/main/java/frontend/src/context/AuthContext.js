import React, {useContext} from "react";
import  { onAuthStateChanged } from "firebase/auth";

export const AuthContext = React.createContext();
export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userLoggedIn, setUserLoggedIn] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, initializeUser);
        return unsubscribe;
    }, []);


    async function initializeUser(user) {
        if (user) {

            setCurrentUser({ ...user });

            // check if provider is email and password login
            const isEmail = user.providerData.some(
                (provider) => provider.providerId === "password"
            );
            setIsEmailUser(isEmail);

            // check if the auth provider is google or not
            //   const isGoogle = user.providerData.some(
            //     (provider) => provider.providerId === GoogleAuthProvider.PROVIDER_ID
            //   );
            //   setIsGoogleUser(isGoogle);

            setUserLoggedIn(true);
        } else {
            setCurrentUser(null);
            setUserLoggedIn(false);
        }

        setLoading(false);
    }

    const value = {
        userLoggedIn,
        currentUser,
        setCurrentUser
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

