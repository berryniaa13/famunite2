import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '../context/firebaseConfig';

const authService = {
    getUserRoleByEmail: async (email) => {
        if (!email) {
            console.error("No email provided to getUserRoleByEmail.");
            return null;
        }

        try {
            console.log("Querying role for email:", email);

            const q = query(
                collection(firestore, 'User'),
                where('email', '==', email)
            );
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                console.warn(`No user document found for email: ${email}`);
                return null;
            }

            const userData = querySnapshot.docs[0].data();

            if (!userData.role || typeof userData.role !== 'string') {
                console.warn(`Role is missing or invalid for email: ${email}`);
                return null;
            }

            console.log(`User role for email ${email}: ${userData.role}`);
            return userData.role;

        } catch (error) {
            console.error("Error fetching user role by email:", error);
            throw error;
        }
    }
};

export default authService;

