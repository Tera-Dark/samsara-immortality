import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="h-screen w-screen bg-slate-50 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                    <h1 className="text-4xl font-serif text-red-500 mb-4">心魔入侵</h1>
                    <p className="mb-4">系统运转出现异常，请尝试刷新页面重入轮回。</p>
                    <div className="bg-white p-4 rounded text-xs font-mono text-left max-w-2xl overflow-auto mb-8 text-red-400">
                        {this.state.error && this.state.error.toString()}
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 border border-slate-200 hover:bg-slate-100 transition-colors"
                    >
                        重启系统
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
