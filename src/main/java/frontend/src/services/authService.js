// import { doc, getDoc } from 'firebase/firestore';
// import { firestore } from '../context/firebaseConfig'; // Ensure this path is correct

// const authService = {
//     getUserRole: async (uid) => {
//         try {
//             console.log("Fetching role for UID:", uid); // Debugging
//             const userDocRef = doc(firestore, 'User', uid); // Ensure collection name is correct
//             const docSnap = await getDoc(userDocRef);
//
//             if (docSnap.exists()) {
//                 const userData = docSnap.data();
//                 const userRoles = userData.role;
//
//                 if (userRoles && userRoles.length > 0) {
//                     console.log("User role found:", userRoles); // Debugging
//                     return userRoles[0]; // Return the first role
//                 } else {
//                     throw new Error(`User has no roles assigned (UID: ${uid})`);
//                 }
//             } else {
//                 throw new Error(`User not found in Firestore (UID: ${uid})`);
//             }
//         } catch (error) {
//             console.error("Error fetching user role:", error);
//             throw error;
//         }
//     }
// };
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '../context/firebaseConfig'; // Ensure this path is correct

const authService = {
    getUserRoleByEmail: async (email) => {
        try {
            console.log("Querying with email:", email); // Debugging line

            const userQuery = query(
                collection(firestore, 'User'), // 'users' collection
                where('email', '==', email) // Ensure this matches the field name in Firestore
            );

            const querySnapshot = await getDocs(userQuery);

            console.log('Query snapshot:', querySnapshot); // Debugging line
            console.log('Query snapshot empty:', querySnapshot.empty); // Debugging line

            if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0]; // The first matching user document
                const userData = userDoc.data();
                const userRoles = userData.role; // Assuming 'role' is an array
                if (userRoles && userRoles.length > 0) {
                    console.log("User roles:", userRoles); // Debugging line
                    return userRoles[0]; // Return the first role
                } else {
                    throw new Error('User role not found');
                }
            } else {
                throw new Error('User not found in Firestore');
            }
        } catch (error) {
            console.error("Error fetching user role by email:", error);
            throw error;
        }
    }
};

export default authService;






