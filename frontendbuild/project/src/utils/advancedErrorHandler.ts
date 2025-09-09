/**
 * Gestionnaire d'Erreurs Avancé pour BuildFlow
 * Gère les erreurs spécifiques de lockdown-install.js et spoofer.js
 */

interface ErrorContext {
  timestamp: string;
  userAgent: string;
  url: string;
  errorType: string;
  errorMessage: string;
  stackTrace?: string;
  additionalInfo?: Record<string, any>;
}

class AdvancedErrorHandler {
  private isInitialized = false;
  private errorCount = 0;
  private maxErrors = 10;
  private errorLog: ErrorContext[] = [];
  private ignoredPatterns = [
    /lockdown-install\.js/,
    /spoofer\.js/,
    /SES Removing unpermitted intrinsics/,
    /Removing intrinsics\.%DatePrototype%\.toTemporalInstant/,
    /An unexpected error occurred/
  ];

  init() {
    if (this.isInitialized) return;
    
    console.log('🚀 Initialisation du gestionnaire d\'erreurs avancé...');
    
    // Intercepter les erreurs JavaScript
    window.addEventListener('error', this.handleError.bind(this));
    
    // Intercepter les rejets de promesses
    window.addEventListener('unhandledrejection', this.handlePromiseRejection.bind(this));
    
    // Intercepter les erreurs de sécurité
    window.addEventListener('securitypolicyviolation', this.handleSecurityViolation.bind(this));
    
    // Intercepter les erreurs de console
    this.interceptConsoleErrors();
    
    // Intercepter les erreurs de fetch/XMLHttpRequest
    this.interceptNetworkErrors();
    
    // Gestionnaire pour les erreurs spécifiques
    this.setupSpecificErrorHandlers();
    
    this.isInitialized = true;
    console.log('✅ Gestionnaire d\'erreurs avancé initialisé');
  }

  private handleError(event: ErrorEvent): void {
    const errorContext = this.createErrorContext('JavaScript Error', event.error?.message || event.message);
    
    if (this.shouldIgnoreError(event.error?.message || event.message)) {
      this.handleIgnoredError(errorContext);
      return;
    }
    
    this.logError(errorContext);
    this.displayUserFriendlyError(event.error?.message || event.message);
  }

  private handlePromiseRejection(event: PromiseRejectionEvent): void {
    const errorContext = this.createErrorContext('Promise Rejection', event.reason?.message || String(event.reason));
    
    if (this.shouldIgnoreError(event.reason?.message || String(event.reason))) {
      this.handleIgnoredError(errorContext);
      return;
    }
    
    this.logError(errorContext);
    this.displayUserFriendlyError('Une opération a échoué. Veuillez réessayer.');
  }

  private handleSecurityViolation(event: SecurityPolicyViolationEvent): void {
    const errorContext = this.createErrorContext('Security Policy Violation', event.violatedDirective);
    
    if (this.shouldIgnoreError(event.violatedDirective)) {
      this.handleIgnoredError(errorContext);
      return;
    }
    
    this.logError(errorContext);
    this.displayUserFriendlyError('Problème de sécurité détecté. Veuillez rafraîchir la page.');
  }

  private shouldIgnoreError(message: string): boolean {
    return this.ignoredPatterns.some(pattern => pattern.test(message));
  }

  private handleIgnoredError(errorContext: ErrorContext): void {
    // Log silencieux des erreurs ignorées
    if (this.errorCount < this.maxErrors) {
      this.errorCount++;
      console.log(`🔒 Erreur ignorée (${this.errorCount}/${this.maxErrors}):`, errorContext.errorMessage);
      
      // Ajouter à la liste des erreurs ignorées
      this.errorLog.push({
        ...errorContext,
        errorType: 'IGNORED_' + errorContext.errorType
      });
    }
  }

  private interceptConsoleErrors(): void {
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    
    console.error = (...args: any[]) => {
      const message = args.map(arg => String(arg)).join(' ');
      
      if (this.shouldIgnoreError(message)) {
        console.log('🔒 Erreur console ignorée:', message);
        return;
      }
      
      originalConsoleError.apply(console, args);
    };
    
    console.warn = (...args: any[]) => {
      const message = args.map(arg => String(arg)).join(' ');
      
      if (this.shouldIgnoreError(message)) {
        console.log('🔒 Avertissement console ignoré:', message);
        return;
      }
      
      originalConsoleWarn.apply(console, args);
    };
  }

  private interceptNetworkErrors(): void {
    // Intercepter les erreurs de fetch
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        return await originalFetch(...args);
      } catch (error) {
        const errorContext = this.createErrorContext('Network Error', error instanceof Error ? error.message : String(error));
        this.logError(errorContext);
        throw error;
      }
    };
  }

  private setupSpecificErrorHandlers(): void {
    // Gestionnaire pour les erreurs de lockdown-install.js
    window.addEventListener('error', (event) => {
      if (event.filename?.includes('lockdown-install.js')) {
        event.preventDefault();
        console.log('🔒 Erreur lockdown-install.js interceptée et ignorée');
        this.handleIgnoredError(this.createErrorContext('Lockdown Error', 'lockdown-install.js error'));
      }
    });

    // Gestionnaire pour les erreurs de spoofer.js
    window.addEventListener('error', (event) => {
      if (event.filename?.includes('spoofer.js')) {
        event.preventDefault();
        console.log('🔒 Erreur spoofer.js interceptée et ignorée');
        this.handleIgnoredError(this.createErrorContext('Spoofer Error', 'spoofer.js error'));
      }
    });
  }

  private createErrorContext(errorType: string, errorMessage: string): ErrorContext {
    return {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      errorType,
      errorMessage,
      stackTrace: new Error().stack,
      additionalInfo: {
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        referrer: document.referrer,
        pageTitle: document.title
      }
    };
  }

  private logError(errorContext: ErrorContext): void {
    // Ajouter à la liste des erreurs
    this.errorLog.push(errorContext);
    
    // Limiter la taille de la liste
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-50);
    }
    
    // Log en console pour le débogage
    console.group('🚨 Erreur BuildFlow');
    console.log('Type:', errorContext.errorType);
    console.log('Message:', errorContext.errorMessage);
    console.log('Timestamp:', errorContext.timestamp);
    console.log('URL:', errorContext.url);
    console.groupEnd();
  }

  private displayUserFriendlyError(message: string): void {
    // Créer une notification d'erreur utilisateur
    this.showErrorNotification(message);
  }

  private showErrorNotification(message: string): void {
    // Vérifier si une notification existe déjà
    const existingNotification = document.getElementById('buildflow-error-notification');
    if (existingNotification) {
      existingNotification.remove();
    }

    // Créer la notification
    const notification = document.createElement('div');
    notification.id = 'buildflow-error-notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ef4444;
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      z-index: 10000;
      max-width: 400px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.4;
    `;

    notification.innerHTML = `
      <div style="display: flex; align-items: flex-start; gap: 12px;">
        <div style="font-size: 18px;">⚠️</div>
        <div>
          <div style="font-weight: 600; margin-bottom: 4px;">Erreur détectée</div>
          <div style="opacity: 0.9;">${message}</div>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" style="
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 18px;
          padding: 0;
          margin-left: 8px;
        ">×</button>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto-suppression après 8 secondes
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 8000);
  }

  // Méthodes publiques
  getErrorLog(): ErrorContext[] {
    return [...this.errorLog];
  }

  clearErrorLog(): void {
    this.errorLog = [];
    this.errorCount = 0;
  }

  getErrorStats(): { total: number; ignored: number; critical: number } {
    const total = this.errorLog.length;
    const ignored = this.errorLog.filter(e => e.errorType.startsWith('IGNORED_')).length;
    const critical = total - ignored;
    
    return { total, ignored, critical };
  }

  // Méthode pour tester le gestionnaire
  testErrorHandler(): void {
    console.log('🧪 Test du gestionnaire d\'erreurs...');
    
    // Simuler une erreur
    setTimeout(() => {
      throw new Error('Test error from AdvancedErrorHandler');
    }, 100);
  }

  cleanup(): void {
    if (this.isInitialized) {
      // Restaurer les méthodes originales si nécessaire
      console.log('🧹 Nettoyage du gestionnaire d\'erreurs');
      this.isInitialized = false;
    }
  }
}

// Instance singleton
const advancedErrorHandler = new AdvancedErrorHandler();

// Initialisation automatique
if (typeof window !== 'undefined') {
  // Attendre que le DOM soit prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      advancedErrorHandler.init();
    });
  } else {
    advancedErrorHandler.init();
  }
}

export default advancedErrorHandler;

