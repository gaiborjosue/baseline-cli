import { parseDocument } from 'htmlparser2';
import { Element, isTag } from 'domhandler';
import { FeatureMatch } from '../types';

interface HTMLFeaturePattern {
  type: 'element' | 'attribute';
  pattern: string;
  featureId: string;
  attributeName?: string;
}

const HTML_FEATURES: HTMLFeaturePattern[] = [
  // HTML Elements
  { type: 'element', pattern: 'dialog', featureId: 'dialog' },
  { type: 'element', pattern: 'details', featureId: 'details' },
  { type: 'element', pattern: 'template', featureId: 'template' },
  { type: 'element', pattern: 'picture', featureId: 'picture' },
  { type: 'element', pattern: 'search', featureId: 'search-element' },
  { type: 'element', pattern: 'slot', featureId: 'slot' },

  // Attributes
  { type: 'attribute', pattern: 'loading', attributeName: 'lazy', featureId: 'loading-lazy' },
  { type: 'attribute', pattern: 'type', attributeName: 'module', featureId: 'es6-module' },
  { type: 'attribute', pattern: 'enterkeyhint', attributeName: '', featureId: 'enterkeyhint' },
  { type: 'attribute', pattern: 'inert', attributeName: '', featureId: 'inert' },
  { type: 'attribute', pattern: 'popover', attributeName: '', featureId: 'popover' },
  { type: 'attribute', pattern: 'contenteditable', attributeName: 'plaintext-only', featureId: 'contenteditable-plaintext-only' },
];

export function parseHTMLWithAST(
  code: string,
  getFeatureInfo: (id: string) => any
): FeatureMatch[] {
  const matches: FeatureMatch[] = [];
  const detected = new Set<string>();

  try {
    const dom = parseDocument(code, {
      lowerCaseAttributeNames: true,
      lowerCaseTags: true
    });

    walkDOM(dom.children, (node) => {
      if (isTag(node)) {
        const element = node as Element;

        // Check element names
        const elementFeature = HTML_FEATURES.find(
          f => f.type === 'element' && f.pattern === element.name
        );

        if (elementFeature && !detected.has(elementFeature.featureId)) {
          addMatch(elementFeature.featureId, getFeatureInfo, matches, detected, `<${element.name}>`);
        }

        // Check attributes
        const attrs = element.attribs || {};
        Object.keys(attrs).forEach(attrName => {
          const attrValue = attrs[attrName];

          HTML_FEATURES.filter(f => f.type === 'attribute').forEach(attrFeature => {
            // Check if attribute exists
            if (attrFeature.pattern === attrName && !detected.has(attrFeature.featureId)) {
              // If specific value is required, check it
              if (attrFeature.attributeName) {
                if (attrValue === attrFeature.attributeName) {
                  addMatch(attrFeature.featureId, getFeatureInfo, matches, detected, `${attrName}="${attrValue}"`);
                }
              } else {
                // Attribute just needs to exist
                addMatch(attrFeature.featureId, getFeatureInfo, matches, detected, attrName);
              }
            }
          });

          // Special check for loading="lazy"
          if (attrName === 'loading' && attrValue === 'lazy' && !detected.has('loading-lazy')) {
            addMatch('loading-lazy', getFeatureInfo, matches, detected, 'loading="lazy"');
          }

          // Special check for type="module"
          if (attrName === 'type' && attrValue === 'module' && element.name === 'script' && !detected.has('es6-module')) {
            addMatch('es6-module', getFeatureInfo, matches, detected, 'type="module"');
          }
        });
      }
    });

  } catch (error) {
    console.warn(`Warning: Could not parse HTML file - ${(error as Error).message}`);
  }

  return matches;
}

function walkDOM(nodes: any[], callback: (node: any) => void): void {
  nodes.forEach(node => {
    callback(node);
    if (node.children && node.children.length > 0) {
      walkDOM(node.children, callback);
    }
  });
}

function addMatch(
  featureId: string,
  getFeatureInfo: (id: string) => any,
  matches: FeatureMatch[],
  detected: Set<string>,
  pattern: string
): void {
  const featureInfo = getFeatureInfo(featureId);
  if (featureInfo) {
    matches.push({
      featureId,
      featureName: featureInfo.name,
      status: getFeatureStatus(featureInfo),
      baselineDate: getBaselineDate(featureInfo),
      matchedPattern: pattern
    });
    detected.add(featureId);
  }
}

function getFeatureStatus(feature: any): 'baseline' | 'limited' | 'experimental' {
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

function getBaselineDate(feature: any): string | undefined {
  return feature.status?.baseline_high_date || feature.status?.baseline_low_date;
}
