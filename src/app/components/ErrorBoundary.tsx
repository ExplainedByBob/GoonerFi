"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-2xl border border-[#1e3a5f] bg-[#0f2140] p-6">
          <h2 className="text-lg font-semibold text-[#60a5fa]">
            Something went wrong
          </h2>
          <p className="mt-2 text-sm text-blue-200/70">
            {this.state.error?.message || "An unexpected error occurred"}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="mt-4 rounded bg-[#1e3a5f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2563eb]"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
