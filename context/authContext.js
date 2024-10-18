import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from "../firebaesConfig";
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

export const AuthContext = createContext();
export const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(undefined);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (authUser) => {
            if (authUser) {
                const userData = await getUserData(authUser.uid);
                setIsAuthenticated(true);
                setUser({
                    ...authUser,
                    ...userData
                });
            } else {
                setIsAuthenticated(false);
                setUser(null);
            }
            console.log('====================================');
            console.log(user);
            console.log('====================================');

        });
        return unsub;
    }, []);

    const getUserData = async (userId) => {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                username: data?.username || '',
                userId: data?.userId || userId,
                profilePicture: data?.profilePicture || '',
                myList: data?.myList || [],
            };
        }
        return {};
    };

    const addToMyList = async (userId, movie) => {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                myList: arrayUnion(movie)
            });
            setUser(prevUser => ({
                ...prevUser,
                myList: [...(prevUser.myList || []), movie]
            }));
            return { success: true };
        } catch (e) {
            console.error('Error adding movie to myList:', e);
            return { success: false, error: e.message };
        }
    };

    const removeFromMyList = async (userId, movie) => {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                myList: arrayRemove(movie)
            });
            setUser(prevUser => ({
                ...prevUser,
                myList: prevUser.myList.filter(item => item.id !== movie.id)
            }));
            return { success: true };
        } catch (e) {
            console.error('Error removing movie from myList:', e);
            return { success: false, error: e.message };
        }
    };

    const login = async (email, password) => {
        try {
            const response = await signInWithEmailAndPassword(auth, email, password);
            const userData = await getUserData(response.user.uid);
            setUser({
                ...response.user,
                ...userData
            });
            return { success: true };
        } catch (e) {
            let msg = e.message;
            if (msg.includes('(auth/invalid-email)')) msg = 'Invalid email';
            if (msg.includes('(auth/invalid-credential)')) msg = 'Wrong credentials';
            return { success: false, msg };
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            return { success: true };
        } catch (e) {
            return { success: false, msg: e.message, error: e };
        }
    };

    const register = async (email, password, username) => {
        try {
            const response = await createUserWithEmailAndPassword(auth, email, password);
            // console.log('response.user', response?.user);
            await setDoc(doc(db, "users", response?.user?.uid), {
                username,
                userId: response?.user?.uid
            });
            return { success: true, data: response?.user };
        } catch (e) {
            let msg = e.message;
            if (msg.includes('(auth/invalid-email)')) msg = 'Invalid email';
            if (msg.includes('(auth/email-already-in-use)')) msg = 'This email is already in use';

            return { success: false, msg };
        }
    }

    const updateUsername = async (userId, newUsername) => {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                username: newUsername
            });

            const updatedUserDoc = await getDoc(userRef);
            const updatedUserData = updatedUserDoc.data();

            setUser(prevUser => ({
                ...prevUser,
                username: updatedUserData?.username || prevUser.username,
                profilePicture: updatedUserData?.profilePicture || prevUser.profilePicture,
                myList: updatedUserData?.myList || prevUser.myList
            }));

            return { success: true };
        } catch (e) {
            console.error('Error updating username:', e);
            return { success: false, error: e.message };
        }
    };

    const updateProfilePicture = async (userId, newProfilePicture) => {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                profilePicture: newProfilePicture
            });

            const updatedUserDoc = await getDoc(userRef);
            const updatedUserData = updatedUserDoc.data();

            setUser(prevUser => ({
                ...prevUser,
                username: updatedUserData?.username || prevUser.username,
                profilePicture: updatedUserData?.profilePicture || prevUser.profilePicture,
                myList: updatedUserData?.myList || prevUser.myList
            }));

            return { success: true };
        } catch (e) {
            console.error('Error updating profile picture:', e);
            return { success: false, error: e.message };
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout, addToMyList, removeFromMyList, updateUsername, updateProfilePicture }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const value = useContext(AuthContext);

    if (!value) {
        throw new Error('useAuth must be wrapped inside AuthContextProvider');
    }
    return value;
};
