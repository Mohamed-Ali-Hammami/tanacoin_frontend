"use client";
import React from 'react';
import { AuthProvider } from './context/AuthContext';
import './globals.css';
import Navbar from '../components/Navbar';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; errorMessage?: string }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, errorMessage: '' };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, errorMessage: error.message };
    }

    componentDidCatch(error: Error) {
        console.error("Error caught by Error Boundary:", error);
    }

    render() {
        if (this.state.hasError) {
            return <h1>Something went wrong: {this.state.errorMessage}</h1>;
        }

        return this.props.children;
    }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <title>Your Application Title</title>
                <meta name="description" content="Your application description goes here." />
            </head>
            <body>
                <ErrorBoundary>
                    <AuthProvider>
                    <>
                        <Navbar />
                        
                            
                        </>
                        <main>{children}</main>
                    </AuthProvider>
                </ErrorBoundary>
            </body>
        </html>
    );
}
