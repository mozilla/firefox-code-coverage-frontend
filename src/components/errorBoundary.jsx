import Raven from 'raven-js';
import { Component } from 'react';
import GenericErrorMessage from './genericErrorMessage';

class ErrorBoundary extends Component {
  state = { hasError: false }

  componentDidCatch(error) {
    this.setState({ hasError: true });
    Raven.captureException(error);
  }

  render() {
    if (this.state.hasError) {
      return <GenericErrorMessage />;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
