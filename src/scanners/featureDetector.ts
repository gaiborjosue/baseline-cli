import features from 'web-features';
import { FeatureMatch } from '../types';
import { parseJavaScriptWithAST } from './astJavaScriptParser';
import { parseCSSWithAST } from './astCSSParser';
import { parseHTMLWithAST } from './astHTMLParser';

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
      // Use AST-based parsing for JavaScript/TypeScript
      matches.push(...parseJavaScriptWithAST(content, this.getFeatureInfo.bind(this)));
    } else if (fileType === 'css') {
      // Use AST-based parsing for CSS
      matches.push(...parseCSSWithAST(content, this.getFeatureInfo.bind(this)));
    } else if (fileType === 'html') {
      // Use AST-based parsing for HTML
      matches.push(...parseHTMLWithAST(content, this.getFeatureInfo.bind(this)));
    }

    return matches;
  }

  public getFeatureInfo(featureId: string): WebFeature | null {
    return this.featureDatabase.get(featureId) || null;
  }
}
