import React, { useEffect } from 'react'
import { Slot, useSegments, useRouter } from "expo-router";
import { AuthContextProvider, useAuth } from '../context/authContext';

const MainLayout = () => {
    const { isAuthenticated, user } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (typeof isAuthenticated == "undefined") return;
        const inAuthGroup = segments[0] === '(auth)';
        if (isAuthenticated && !inAuthGroup) {
            if (user && user.profilePicture) {
                router.replace('Home');
            } else if (user && !user.profilePicture) {
                router.replace('addprofileimg');
            }
        } else if (isAuthenticated === false) {
            router.replace('Welcome');
        }
    }, [isAuthenticated, user]);
    return <Slot />
}

export default function RootLayout() {
    return (
        <AuthContextProvider>
            <MainLayout />
        </AuthContextProvider>
    )
}
