import { Component, type ReactNode, type ErrorInfo } from "react";

interface Props {
  children: ReactNode;
  title: string;
}

interface State {
  hasError: boolean;
}

export default class WidgetErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[WidgetErrorBoundary] "${this.props.title}" failed:`, error.message, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-48 gap-2 text-sm text-muted-foreground">
          <p className="font-semibold">{this.props.title}</p>
          <p>This widget encountered an error.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
