import React, { Component, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public message = '';

    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by boundary:', error.message, errorInfo);
        this.message = error.message;
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-error-background p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{
                            duration: 0.4,
                            ease: [0.25, 0.46, 0.45, 0.94],
                            staggerChildren: 0.1
                        }}
                        className="max-w-md w-full"
                    >
                        <Card className="bg-error-container border-border shadow-lg">
                            <CardContent className="p-8 text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{
                                        delay: 0.2,
                                        duration: 0.5,
                                        type: "spring",
                                        stiffness: 200
                                    }}
                                    className="w-16 h-16 bg-error-icon-background rounded-full flex items-center justify-center mx-auto mb-6"
                                >
                                    <AlertTriangle className="w-8 h-8 text-error-icon" />
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3, duration: 0.3 }}
                                >
                                    <h1 className="text-2xl font-bold text-foreground mb-4">
                                        Something went wrong
                                    </h1>
                                    <p className="text-muted-foreground mb-6 leading-relaxed">
                                        We're sorry, but something unexpected happened. Please try refreshing the page.
                                        {this.message && (
                                            <motion.span
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.5, duration: 0.3 }}
                                                className="block mt-2 text-sm font-mono bg-muted p-2 rounded-md"
                                            >
                                                {this.message}
                                            </motion.span>
                                        )}
                                    </p>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4, duration: 0.3 }}
                                >
                                    <Button
                                        onClick={() => window.location.reload()}
                                        variant="default"
                                        className="w-full"
                                    >
                                        <RotateCcw className="w-4 h-4 mr-2" />
                                        Refresh Page
                                    </Button>
                                </motion.div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            );
        }

        return this.props.children;
    }
}