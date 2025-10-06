import features from 'web-features';
import { FeatureMatch } from '../types';

interface WebFeature {
  name: string;
  status?: {
    baseline?: string | boolean;
    baseline_high_date?: string;
    baseline_low_date?: string;
  };
  spec?: string | string[];
  caniuse?: string | string[];
}

export class FeatureDetector {
  private featureDatabase: Map<string, WebFeature>;

  constructor() {
    this.featureDatabase = new Map();
    this.loadFeatures();
  }

  private loadFeatures(): void {
    // Load features from web-features package
    const featureData = (features as any).features;

    if (featureData) {
      for (const [id, feature] of Object.entries(featureData)) {
        this.featureDatabase.set(id, feature as WebFeature);
      }
    }
  }

  public detectFeatures(content: string, fileType: 'js' | 'ts' | 'css' | 'html'): FeatureMatch[] {
    const matches: FeatureMatch[] = [];

    if (fileType === 'js' || fileType === 'ts') {
      matches.push(...this.detectJavaScriptFeatures(content));
    } else if (fileType === 'css') {
      matches.push(...this.detectCSSFeatures(content));
    } else if (fileType === 'html') {
      matches.push(...this.detectHTMLFeatures(content));
    }

    return matches;
  }

  private detectJavaScriptFeatures(content: string): FeatureMatch[] {
    const matches: FeatureMatch[] = [];

    // Common Web APIs to detect
    const jsPatterns = [
      { pattern: /\bfetch\s*\(/g, featureId: 'fetch' },
      { pattern: /\bPromise\b/g, featureId: 'promise' },
      { pattern: /\basync\s+function/g, featureId: 'async-functions' },
      { pattern: /\bawait\s+/g, featureId: 'async-functions' },
      { pattern: /\bIntersectionObserver\b/g, featureId: 'intersection-observer' },
      { pattern: /\bResizeObserver\b/g, featureId: 'resize-observer' },
      { pattern: /\bMutationObserver\b/g, featureId: 'mutation-observer' },
      { pattern: /\bnavigator\.serviceWorker\b/g, featureId: 'service-workers' },
      { pattern: /\bWeb(GL|GL2)RenderingContext\b/g, featureId: 'webgl' },
      { pattern: /\bWebSocket\b/g, featureId: 'websockets' },
      { pattern: /\bIndexedDB\b/g, featureId: 'indexeddb' },
      { pattern: /\blocalStorage\b/g, featureId: 'localstorage' },
      { pattern: /\bsessionStorage\b/g, featureId: 'localstorage' },
      { pattern: /\bnavigator\.geolocation\b/g, featureId: 'geolocation' },
      { pattern: /\bnavigator\.mediaDevices\b/g, featureId: 'mediadevices' },
      { pattern: /\bMediaRecorder\b/g, featureId: 'mediarecorder' },
      { pattern: /\bnew\s+Notification\s*\(/gi, featureId: 'notifications' },
      { pattern: /\bhistory\.pushState\b/g, featureId: 'history' },
      { pattern: /\brequestAnimationFrame\b/gi, featureId: 'requestanimationframe' },
      { pattern: /\bBroadcastChannel\b/g, featureId: 'broadcastchannel' },
      { pattern: /\b(?:const|let)\s+\[/g, featureId: 'destructuring' },
      { pattern: /\b(?:const|let)\s+\{/g, featureId: 'destructuring-assignment' },
      { pattern: /=>/g, featureId: 'arrow-functions' },
      { pattern: /\bclass\s+\w+/g, featureId: 'class' },
      { pattern: /\bSymbol\b/g, featureId: 'symbol' },
      { pattern: /\bnew\s+Map\b/g, featureId: 'map' },
      { pattern: /\bnew\s+Set\b/g, featureId: 'set' },
      { pattern: /\bnew\s+WeakMap\b/g, featureId: 'weakmap' },
      { pattern: /\bnew\s+WeakSet\b/g, featureId: 'weakset' },
      { pattern: /\bnew\s+Proxy\b/g, featureId: 'proxy' },
      { pattern: /\bReflect\./g, featureId: 'reflect' },
      { pattern: /\.\.\./g, featureId: 'spread' },
      { pattern: /`[^`]*\$\{/g, featureId: 'template-literals' }
    ];

    for (const { pattern, featureId } of jsPatterns) {
      const regex = new RegExp(pattern);
      let match;

      while ((match = regex.exec(content)) !== null) {
        const featureInfo = this.getFeatureInfo(featureId);
        if (featureInfo) {
          matches.push({
            featureId,
            featureName: featureInfo.name,
            status: this.getFeatureStatus(featureInfo),
            baselineDate: this.getBaselineDate(featureInfo),
            matchedPattern: match[0]
          });
        }
      }
    }

    return matches;
  }

  private detectCSSFeatures(content: string): FeatureMatch[] {
    const matches: FeatureMatch[] = [];

    const cssPatterns = [
      { pattern: /display:\s*grid/gi, featureId: 'grid' },
      { pattern: /display:\s*flex/gi, featureId: 'flexbox' },
      { pattern: /@container/gi, featureId: 'container-queries' },
      { pattern: /:has\(/gi, featureId: 'has' },
      { pattern: /::backdrop/gi, featureId: 'backdrop' },
      { pattern: /@layer/gi, featureId: 'cascade-layers' },
      { pattern: /color-mix\(/gi, featureId: 'color-mix' },
      { pattern: /\bclamp\(/gi, featureId: 'clamp' },
      { pattern: /aspect-ratio:/gi, featureId: 'aspect-ratio' },
      { pattern: /gap:/gi, featureId: 'flexbox-gap' },
      { pattern: /backdrop-filter:/gi, featureId: 'backdrop-filter' },
      { pattern: /@supports/gi, featureId: 'supports' }
    ];

    for (const { pattern, featureId } of cssPatterns) {
      const regex = new RegExp(pattern);
      let match;

      while ((match = regex.exec(content)) !== null) {
        const featureInfo = this.getFeatureInfo(featureId);
        if (featureInfo) {
          matches.push({
            featureId,
            featureName: featureInfo.name,
            status: this.getFeatureStatus(featureInfo),
            baselineDate: this.getBaselineDate(featureInfo),
            matchedPattern: match[0]
          });
        }
      }
    }

    return matches;
  }

  private detectHTMLFeatures(content: string): FeatureMatch[] {
    const matches: FeatureMatch[] = [];

    const htmlPatterns = [
      { pattern: /<dialog/gi, featureId: 'dialog' },
      { pattern: /<details/gi, featureId: 'details' },
      { pattern: /<template/gi, featureId: 'template' },
      { pattern: /loading=["']lazy["']/gi, featureId: 'loading-lazy' },
      { pattern: /<picture/gi, featureId: 'picture' },
      { pattern: /type=["']module["']/gi, featureId: 'es6-module' }
    ];

    for (const { pattern, featureId } of htmlPatterns) {
      const regex = new RegExp(pattern);
      let match;

      while ((match = regex.exec(content)) !== null) {
        const featureInfo = this.getFeatureInfo(featureId);
        if (featureInfo) {
          matches.push({
            featureId,
            featureName: featureInfo.name,
            status: this.getFeatureStatus(featureInfo),
            baselineDate: this.getBaselineDate(featureInfo),
            matchedPattern: match[0]
          });
        }
      }
    }

    return matches;
  }

  private getFeatureInfo(featureId: string): WebFeature | null {
    return this.featureDatabase.get(featureId) || null;
  }

  private getFeatureStatus(feature: WebFeature): 'baseline' | 'limited' | 'experimental' {
    if (!feature.status?.baseline) {
      return 'experimental';
    }

    if (feature.status.baseline === 'high' || feature.status.baseline === true) {
      return 'baseline';
    }

    if (feature.status.baseline === 'low') {
      return 'limited';
    }

    return 'experimental';
  }

  private getBaselineDate(feature: WebFeature): string | undefined {
    return feature.status?.baseline_high_date || feature.status?.baseline_low_date;
  }
}
