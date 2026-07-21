import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import toast from 'react-hot-toast';

export interface SecurityViolationCallback {
  (violationType: 'tab_switch' | 'background' | 'split_screen' | 'back_button'): void;
}

class NativeSecurityService {
  private isMonitoring = false;
  private violationCallback: SecurityViolationCallback | null = null;
  private appStateListener: any = null;
  private backButtonListener: any = null;

  public isNative(): boolean {
    return Capacitor.isNativePlatform();
  }

  public async startMonitoring(onViolation: SecurityViolationCallback) {
    this.violationCallback = onViolation;
    if (this.isMonitoring) return;
    this.isMonitoring = true;

    if (this.isNative()) {
      // Listen for app going to background or inactive (e.g. split screen / home pressed)
      this.appStateListener = await App.addListener('appStateChange', ({ isActive }) => {
        if (!isActive && this.isMonitoring) {
          console.warn('Security Violation: App went to background or split-screen');
          this.triggerViolation('background');
        }
      });

      // Prevent back button exits during exam
      this.backButtonListener = await App.addListener('backButton', () => {
        if (this.isMonitoring) {
          toast.error('Back button is disabled during active assessments.', { icon: '🚫' });
          this.triggerViolation('back_button');
        }
      });
    } else {
      // Web fallback: visibility change
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
      window.addEventListener('blur', this.handleBlur);
    }
  }

  public async stopMonitoring() {
    this.isMonitoring = false;
    this.violationCallback = null;

    if (this.isNative()) {
      if (this.appStateListener) {
        await this.appStateListener.remove();
        this.appStateListener = null;
      }
      if (this.backButtonListener) {
        await this.backButtonListener.remove();
        this.backButtonListener = null;
      }
    } else {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
      window.removeEventListener('blur', this.handleBlur);
    }
  }

  private handleVisibilityChange = () => {
    if (document.hidden && this.isMonitoring) {
      this.triggerViolation('tab_switch');
    }
  };

  private handleBlur = () => {
    if (this.isMonitoring) {
      this.triggerViolation('tab_switch');
    }
  };

  private triggerViolation(type: 'tab_switch' | 'background' | 'split_screen' | 'back_button') {
    if (this.violationCallback) {
      this.violationCallback(type);
    }
  }
}

export const nativeSecurity = new NativeSecurityService();
