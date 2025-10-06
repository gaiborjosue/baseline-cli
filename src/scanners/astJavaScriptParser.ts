import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import { FeatureMatch } from '../types';

interface FeaturePattern {
  type: 'Identifier' | 'CallExpression' | 'NewExpression' | 'MemberExpression';
  name: string;
  featureId: string;
}

const JS_FEATURES: FeaturePattern[] = [
  // APIs and Objects
  { type: 'Identifier', name: 'fetch', featureId: 'fetch' },
  { type: 'Identifier', name: 'Promise', featureId: 'promise' },
  { type: 'NewExpression', name: 'IntersectionObserver', featureId: 'intersection-observer' },
  { type: 'NewExpression', name: 'ResizeObserver', featureId: 'resize-observer' },
  { type: 'NewExpression', name: 'MutationObserver', featureId: 'mutation-observer' },
  { type: 'NewExpression', name: 'WebSocket', featureId: 'websockets' },
  { type: 'NewExpression', name: 'Map', featureId: 'map' },
  { type: 'NewExpression', name: 'Set', featureId: 'set' },
  { type: 'NewExpression', name: 'WeakMap', featureId: 'weakmap' },
  { type: 'NewExpression', name: 'WeakSet', featureId: 'weakset' },
  { type: 'NewExpression', name: 'Proxy', featureId: 'proxy' },
  { type: 'NewExpression', name: 'BroadcastChannel', featureId: 'broadcastchannel' },
  { type: 'Identifier', name: 'Symbol', featureId: 'symbol' },
  { type: 'Identifier', name: 'Reflect', featureId: 'reflect' },
  { type: 'Identifier', name: 'BigInt', featureId: 'bigint' },

  // Storage
  { type: 'Identifier', name: 'localStorage', featureId: 'localstorage' },
  { type: 'Identifier', name: 'sessionStorage', featureId: 'localstorage' },
  { type: 'Identifier', name: 'IndexedDB', featureId: 'indexeddb' },

  // Navigator APIs
  { type: 'MemberExpression', name: 'navigator.serviceWorker', featureId: 'service-workers' },
  { type: 'MemberExpression', name: 'navigator.geolocation', featureId: 'geolocation' },
  { type: 'MemberExpression', name: 'navigator.mediaDevices', featureId: 'mediadevices' },
  { type: 'MemberExpression', name: 'navigator.share', featureId: 'web-share' },
  { type: 'MemberExpression', name: 'navigator.clipboard', featureId: 'async-clipboard' },

  // Other APIs
  { type: 'Identifier', name: 'requestAnimationFrame', featureId: 'requestanimationframe' },
  { type: 'NewExpression', name: 'Notification', featureId: 'notifications' },
  { type: 'NewExpression', name: 'MediaRecorder', featureId: 'mediarecorder' },
  { type: 'MemberExpression', name: 'history.pushState', featureId: 'history' },
  { type: 'Identifier', name: 'WebGL2RenderingContext', featureId: 'webgl2' },
  { type: 'Identifier', name: 'WebGLRenderingContext', featureId: 'webgl' },
];

export function parseJavaScriptWithAST(
  code: string,
  getFeatureInfo: (id: string) => any
): FeatureMatch[] {
  const matches: FeatureMatch[] = [];
  const detected = new Set<string>();

  try {
    const ast = parse(code, {
      sourceType: 'unambiguous',
      plugins: [
        'jsx',
        'typescript',
        'decorators-legacy',
        'classProperties',
        'dynamicImport',
        'optionalChaining',
        'nullishCoalescingOperator'
      ],
      errorRecovery: true
    });

    traverse(ast, {
      // Detect new Constructor() calls
      NewExpression(path) {
        const calleeName = getCalleeName(path.node.callee);
        if (calleeName) {
          const feature = JS_FEATURES.find(
            f => f.type === 'NewExpression' && f.name === calleeName
          );
          if (feature && !detected.has(feature.featureId)) {
            const featureInfo = getFeatureInfo(feature.featureId);
            if (featureInfo) {
              matches.push(createMatch(feature.featureId, featureInfo, calleeName));
              detected.add(feature.featureId);
            }
          }
        }
      },

      // Detect function calls like fetch()
      CallExpression(path) {
        const calleeName = getCalleeName(path.node.callee);
        if (calleeName) {
          const feature = JS_FEATURES.find(
            f => f.type === 'CallExpression' && f.name === calleeName
          );
          if (feature && !detected.has(feature.featureId)) {
            const featureInfo = getFeatureInfo(feature.featureId);
            if (featureInfo) {
              matches.push(createMatch(feature.featureId, featureInfo, calleeName));
              detected.add(feature.featureId);
            }
          }
        }
      },

      // Detect identifiers like Promise, Symbol
      Identifier(path) {
        const name = path.node.name;
        const feature = JS_FEATURES.find(
          f => f.type === 'Identifier' && f.name === name
        );
        if (feature && !detected.has(feature.featureId)) {
          // Make sure it's not a variable declaration
          if (path.parent.type !== 'VariableDeclarator' || path.parent.id !== path.node) {
            const featureInfo = getFeatureInfo(feature.featureId);
            if (featureInfo) {
              matches.push(createMatch(feature.featureId, featureInfo, name));
              detected.add(feature.featureId);
            }
          }
        }
      },

      // Detect member expressions like navigator.serviceWorker
      MemberExpression(path) {
        const memberPath = getMemberPath(path.node);
        const feature = JS_FEATURES.find(
          f => f.type === 'MemberExpression' && f.name === memberPath
        );
        if (feature && !detected.has(feature.featureId)) {
          const featureInfo = getFeatureInfo(feature.featureId);
          if (featureInfo) {
            matches.push(createMatch(feature.featureId, featureInfo, memberPath));
            detected.add(feature.featureId);
          }
        }
      },

      // Detect async functions
      Function(path) {
        if (path.node.async && !detected.has('async-functions')) {
          const featureInfo = getFeatureInfo('async-functions');
          if (featureInfo) {
            matches.push(createMatch('async-functions', featureInfo, 'async function'));
            detected.add('async-functions');
          }
        }
      },

      // Detect arrow functions
      ArrowFunctionExpression(path) {
        if (!detected.has('arrow-functions')) {
          const featureInfo = getFeatureInfo('arrow-functions');
          if (featureInfo) {
            matches.push(createMatch('arrow-functions', featureInfo, '=>'));
            detected.add('arrow-functions');
          }
        }
      },

      // Detect classes
      ClassDeclaration(path) {
        if (!detected.has('class')) {
          const featureInfo = getFeatureInfo('class');
          if (featureInfo) {
            matches.push(createMatch('class', featureInfo, 'class'));
            detected.add('class');
          }
        }
      },

      // Detect destructuring
      ObjectPattern(path) {
        if (!detected.has('destructuring-assignment')) {
          const featureInfo = getFeatureInfo('destructuring-assignment');
          if (featureInfo) {
            matches.push(createMatch('destructuring-assignment', featureInfo, '{ destructuring }'));
            detected.add('destructuring-assignment');
          }
        }
      },

      ArrayPattern(path) {
        if (!detected.has('destructuring')) {
          const featureInfo = getFeatureInfo('destructuring');
          if (featureInfo) {
            matches.push(createMatch('destructuring', featureInfo, '[ destructuring ]'));
            detected.add('destructuring');
          }
        }
      },

      // Detect spread operator
      SpreadElement(path) {
        if (!detected.has('spread')) {
          const featureInfo = getFeatureInfo('spread');
          if (featureInfo) {
            matches.push(createMatch('spread', featureInfo, '...spread'));
            detected.add('spread');
          }
        }
      },

      // Detect template literals
      TemplateLiteral(path) {
        if (path.node.expressions.length > 0 && !detected.has('template-literals')) {
          const featureInfo = getFeatureInfo('template-literals');
          if (featureInfo) {
            matches.push(createMatch('template-literals', featureInfo, '`${template}`'));
            detected.add('template-literals');
          }
        }
      }
    });
  } catch (error) {
    // If parsing fails, silently continue (file might have syntax errors)
    console.warn(`Warning: Could not parse JavaScript file - ${(error as Error).message}`);
  }

  return matches;
}

function getCalleeName(callee: any): string | null {
  if (callee.type === 'Identifier') {
    return callee.name;
  }
  if (callee.type === 'MemberExpression') {
    return getMemberPath(callee);
  }
  return null;
}

function getMemberPath(node: any): string {
  const parts: string[] = [];
  let current = node;

  while (current) {
    if (current.type === 'MemberExpression') {
      if (current.property.type === 'Identifier') {
        parts.unshift(current.property.name);
      }
      current = current.object;
    } else if (current.type === 'Identifier') {
      parts.unshift(current.name);
      break;
    } else {
      break;
    }
  }

  return parts.join('.');
}

function createMatch(
  featureId: string,
  featureInfo: any,
  pattern: string
): FeatureMatch {
  return {
    featureId,
    featureName: featureInfo.name,
    status: getFeatureStatus(featureInfo),
    baselineDate: getBaselineDate(featureInfo),
    matchedPattern: pattern
  };
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
