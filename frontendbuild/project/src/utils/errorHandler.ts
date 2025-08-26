/**
 * Gestionnaire d'erreurs global pour capturer les erreurs JavaScript non capturées
 */

interface ErrorInfo {
  message: string;
  stack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  error?: Error;
}

class GlobalErrorHandler {
  private isInitialized = false;

  init() {
    if (this.isInitialized) return;
    
    // Capturer les erreurs JavaScript non capturées
    window.addEventListener('error', this.handleError.bind(this));
    
    // Capturer les rejets de promesses non gérés
    window.addEventListener('unhandledrejection', this.handlePromiseRejection.bind(this));
    
    // Capturer les erreurs de sécurité
    window.addEventListener('securitypolicyviolation', this.handleSecurityViolation.bind(this));
    
    // Capturer les erreurs de console
    this.interceptConsoleErrors();
    
    this.isInitialized = true;
    console.log('GlobalErrorHandler initialisé');
  }

  private handleError(event: ErrorEvent) {
    const errorInfo: ErrorInfo = {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    };

    console.error('Erreur JavaScript capturée:', errorInfo);
    
    // En mode développement, afficher plus de détails
    if (process.env.NODE_ENV === 'development') {
      console.group('Détails de l\'erreur:');
      console.error('Message:', errorInfo.message);
      console.error('Fichier:', errorInfo.filename);
      console.error('Ligne:', errorInfo.lineno);
      console.error('Colonne:', errorInfo.colno);
      if (errorInfo.error) {
        console.error('Stack trace:', errorInfo.error.stack);
      }
      console.groupEnd();
    }

    // Empêcher la propagation de l'erreur
    event.preventDefault();
  }

  private handlePromiseRejection(event: PromiseRejectionEvent) {
    console.error('Promesse rejetée non gérée:', event.reason);
    
    // En mode développement, afficher plus de détails
    if (process.env.NODE_ENV === 'development') {
      console.group('Détails de la promesse rejetée:');
      console.error('Raison:', event.reason);
      if (event.reason instanceof Error) {
        console.error('Stack trace:', event.reason.stack);
      }
      console.groupEnd();
    }

    // Empêcher la propagation de l'erreur
    event.preventDefault();
  }

  private handleSecurityViolation(event: SecurityPolicyViolationEvent) {
    console.warn('Violation de politique de sécurité:', {
      violatedDirective: event.violatedDirective,
      blockedURI: event.blockedURI,
      sourceFile: event.sourceFile,
      lineNumber: event.lineNumber
    });
  }

  private interceptConsoleErrors() {
    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = (...args: any[]) => {
      // Log l'erreur originale
      originalError.apply(console, args);
      
      // Capturer les erreurs spécifiques
      const errorMessage = args.join(' ');
      if (errorMessage.includes('spoofer.js') || errorMessage.includes('lockdown-install.js')) {
        console.warn('Erreur de sécurité détectée, tentative de résolution...');
        this.handleSecurityError(errorMessage);
      }
    };

    console.warn = (...args: any[]) => {
      // Log l'avertissement original
      originalWarn.apply(console, args);
      
      // Capturer les avertissements spécifiques
      const warningMessage = args.join(' ');
      if (warningMessage.includes('SES') || warningMessage.includes('intrinsics')) {
        console.info('Avertissement de sécurité détecté, normal en mode strict');
      }
    };
  }

  private handleSecurityError(errorMessage: string) {
    // Ces erreurs sont souvent liées à des extensions de navigateur ou des politiques de sécurité
    // Elles ne sont généralement pas critiques pour le fonctionnement de l'application
    
    if (errorMessage.includes('spoofer.js')) {
      console.info('Erreur spoofer.js détectée - probablement liée à une extension de navigateur');
    }
    
    if (errorMessage.includes('lockdown-install.js')) {
      console.info('Erreur lockdown-install.js détectée - probablement liée à une politique de sécurité');
    }
  }

  // Méthode pour nettoyer les gestionnaires d'erreurs
  cleanup() {
    if (!this.isInitialized) return;
    
    window.removeEventListener('error', this.handleError.bind(this));
    window.removeEventListener('unhandledrejection', this.handlePromiseRejection.bind(this));
    window.removeEventListener('securitypolicyviolation', this.handleSecurityViolation.bind(this));
    
    this.isInitialized = false;
    console.log('GlobalErrorHandler nettoyé');
  }
}

// Créer une instance singleton
const globalErrorHandler = new GlobalErrorHandler();

export default globalErrorHandler;

