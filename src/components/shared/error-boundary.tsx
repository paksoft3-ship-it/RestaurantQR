"use client";

import { Component, type ReactNode } from "react";
import { ErrorState } from "@/components/shared/states";

interface Props {
  /** Short label describing the contained widget, used in the fallback copy. */
  label?: string;
  fallback?: ReactNode;
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Contains render errors from a single widget so one failure never blanks the
 * surrounding page. Use to wrap independent admin/dashboard widgets.
 */
export class WidgetBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <ErrorState
            title={this.props.label ? `Couldn't load ${this.props.label}` : "Couldn't load this widget"}
            description="This section failed to load. The rest of the page is unaffected."
          />
        )
      );
    }
    return this.props.children;
  }
}
