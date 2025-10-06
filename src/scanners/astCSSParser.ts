import postcss from 'postcss';
import selectorParser from 'postcss-selector-parser';
import { FeatureMatch } from '../types';

interface CSSFeaturePattern {
  type: 'property' | 'selector' | 'at-rule' | 'function';
  pattern: string | RegExp;
  featureId: string;
}

const CSS_FEATURES: CSSFeaturePattern[] = [
  // Layout
  { type: 'property', pattern: 'display', featureId: 'grid' }, // Will check value
  { type: 'property', pattern: 'grid-template-columns', featureId: 'grid' },
  { type: 'property', pattern: 'grid-template-rows', featureId: 'grid' },
  { type: 'property', pattern: 'gap', featureId: 'flexbox-gap' },
  { type: 'property', pattern: 'aspect-ratio', featureId: 'aspect-ratio' },

  // Modern CSS
  { type: 'at-rule', pattern: 'container', featureId: 'container-queries' },
  { type: 'at-rule', pattern: 'layer', featureId: 'cascade-layers' },
  { type: 'at-rule', pattern: 'supports', featureId: 'supports' },

  // Selectors
  { type: 'selector', pattern: ':has', featureId: 'has' },
  { type: 'selector', pattern: ':where', featureId: 'where' },
  { type: 'selector', pattern: ':is', featureId: 'is' },
  { type: 'selector', pattern: '::backdrop', featureId: 'backdrop' },
  { type: 'selector', pattern: '::part', featureId: 'part' },
  { type: 'selector', pattern: ':focus-visible', featureId: 'focus-visible' },

  // Properties
  { type: 'property', pattern: 'backdrop-filter', featureId: 'backdrop-filter' },
  { type: 'property', pattern: 'mix-blend-mode', featureId: 'mix-blend-mode' },
  { type: 'property', pattern: 'object-fit', featureId: 'object-fit' },
  { type: 'property', pattern: 'overscroll-behavior', featureId: 'overscroll-behavior' },
  { type: 'property', pattern: 'scroll-behavior', featureId: 'scroll-behavior' },
  { type: 'property', pattern: 'scroll-snap-type', featureId: 'scroll-snap' },
  { type: 'property', pattern: 'position', featureId: 'sticky' }, // Will check for sticky value
  { type: 'property', pattern: 'contain', featureId: 'css-contain' },
  { type: 'property', pattern: 'content-visibility', featureId: 'content-visibility' },

  // Functions
  { type: 'function', pattern: 'clamp', featureId: 'clamp' },
  { type: 'function', pattern: 'min', featureId: 'min' },
  { type: 'function', pattern: 'max', featureId: 'max' },
  { type: 'function', pattern: 'color-mix', featureId: 'color-mix' },
  { type: 'function', pattern: 'oklch', featureId: 'oklch' },
  { type: 'function', pattern: 'oklab', featureId: 'oklab' },

  // Custom properties
  { type: 'property', pattern: 'color-scheme', featureId: 'color-scheme' },
  { type: 'property', pattern: 'accent-color', featureId: 'accent-color' },
];

export function parseCSSWithAST(
  code: string,
  getFeatureInfo: (id: string) => any
): FeatureMatch[] {
  const matches: FeatureMatch[] = [];
  const detected = new Set<string>();

  try {
    const root = postcss.parse(code);

    root.walkDecls(decl => {
      // Check property names
      const propFeature = CSS_FEATURES.find(
        f => f.type === 'property' && f.pattern === decl.prop
      );

      if (propFeature) {
        // Special handling for display: grid/flex
        if (decl.prop === 'display') {
          if (decl.value.includes('grid') && !detected.has('grid')) {
            addMatch('grid', getFeatureInfo, matches, detected, 'display: grid');
          }
          if (decl.value.includes('flex') && !detected.has('flexbox')) {
            addMatch('flexbox', getFeatureInfo, matches, detected, 'display: flex');
          }
        }
        // Special handling for position: sticky
        else if (decl.prop === 'position' && decl.value === 'sticky' && !detected.has('sticky')) {
          addMatch('sticky', getFeatureInfo, matches, detected, 'position: sticky');
        }
        // Regular property detection
        else if (!detected.has(propFeature.featureId)) {
          addMatch(propFeature.featureId, getFeatureInfo, matches, detected, `${decl.prop}: ${decl.value}`);
        }
      }

      // Check for CSS functions in values
      CSS_FEATURES.filter(f => f.type === 'function').forEach(funcFeature => {
        const funcName = funcFeature.pattern as string;
        const regex = new RegExp(`${funcName}\\s*\\(`, 'i');
        if (regex.test(decl.value) && !detected.has(funcFeature.featureId)) {
          addMatch(funcFeature.featureId, getFeatureInfo, matches, detected, `${funcName}()`);
        }
      });
    });

    // Check at-rules
    root.walkAtRules(atRule => {
      const atRuleFeature = CSS_FEATURES.find(
        f => f.type === 'at-rule' && f.pattern === atRule.name
      );

      if (atRuleFeature && !detected.has(atRuleFeature.featureId)) {
        addMatch(atRuleFeature.featureId, getFeatureInfo, matches, detected, `@${atRule.name}`);
      }
    });

    // Check selectors
    root.walkRules(rule => {
      try {
        selectorParser(selectors => {
          selectors.walk(selector => {
            const selectorStr = selector.toString();

            CSS_FEATURES.filter(f => f.type === 'selector').forEach(selectorFeature => {
              const pattern = selectorFeature.pattern as string;
              if (selectorStr.includes(pattern) && !detected.has(selectorFeature.featureId)) {
                addMatch(selectorFeature.featureId, getFeatureInfo, matches, detected, pattern);
              }
            });
          });
        }).processSync(rule.selector);
      } catch (error) {
        // Skip malformed selectors
      }
    });

  } catch (error) {
    console.warn(`Warning: Could not parse CSS file - ${(error as Error).message}`);
  }

  return matches;
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
