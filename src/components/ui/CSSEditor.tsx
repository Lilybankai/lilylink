'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CodeBracketIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline';
import { Button, Card, Alert } from '@/components/ui';

interface CSSEditorProps {
  value: string;
  onChange: (css: string) => void;
  className?: string;
  placeholder?: string;
  height?: string;
}

interface CSSError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning';
}

interface CSSHint {
  property: string;
  description: string;
  example: string;
}

const CSS_HINTS: CSSHint[] = [
  {
    property: 'background',
    description: 'Set background color or image',
    example: 'background: linear-gradient(45deg, #ff6b6b, #4ecdc4);',
  },
  {
    property: 'border-radius',
    description: 'Round the corners of elements',
    example: 'border-radius: 12px;',
  },
  {
    property: 'box-shadow',
    description: 'Add shadow effects',
    example: 'box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);',
  },
  {
    property: 'transform',
    description: 'Apply transformations',
    example: 'transform: scale(1.05) rotate(2deg);',
  },
  {
    property: 'transition',
    description: 'Smooth animations',
    example: 'transition: all 0.3s ease;',
  },
  {
    property: 'font-family',
    description: 'Change font family',
    example: 'font-family: "Inter", sans-serif;',
  },
  {
    property: 'color',
    description: 'Set text color',
    example: 'color: #6b46c1;',
  },
  {
    property: 'padding',
    description: 'Add internal spacing',
    example: 'padding: 16px 24px;',
  },
  {
    property: 'margin',
    description: 'Add external spacing',
    example: 'margin: 8px 0;',
  },
  {
    property: 'opacity',
    description: 'Set transparency',
    example: 'opacity: 0.8;',
  },
];

const CSS_TEMPLATES = [
  {
    name: 'Glassmorphism Effect',
    css: `/* Glassmorphism effect for links */
.link-button {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 16px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
}

.link-button:hover {
  background: rgba(255, 255, 255, 0.35);
  transform: translateY(-2px);
  transition: all 0.3s ease;
}`,
  },
  {
    name: 'Neon Glow Effect',
    css: `/* Neon glow effect */
.link-button {
  background: #1a1a1a;
  color: #00ff88;
  border: 2px solid #00ff88;
  border-radius: 8px;
  box-shadow: 
    0 0 10px #00ff88,
    0 0 20px #00ff88,
    0 0 40px #00ff88;
  text-shadow: 0 0 10px #00ff88;
}

.link-button:hover {
  box-shadow: 
    0 0 20px #00ff88,
    0 0 40px #00ff88,
    0 0 80px #00ff88;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}`,
  },
  {
    name: 'Gradient Animation',
    css: `/* Animated gradient background */
.page-background {
  background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.link-button {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.link-button:hover {
  background: rgba(255, 255, 255, 1);
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}`,
  },
  {
    name: 'Neumorphism Style',
    css: `/* Neumorphism design */
.page-background {
  background: #e0e0e0;
}

.link-button {
  background: #e0e0e0;
  border-radius: 20px;
  box-shadow: 
    20px 20px 60px #bebebe,
    -20px -20px 60px #ffffff;
  border: none;
  padding: 20px;
  transition: all 0.3s ease;
}

.link-button:hover {
  box-shadow: 
    inset 20px 20px 60px #bebebe,
    inset -20px -20px 60px #ffffff;
}

.link-button:active {
  box-shadow: 
    inset 5px 5px 10px #bebebe,
    inset -5px -5px 10px #ffffff;
}`,
  },
];

// Simple CSS parser for basic validation
const validateCSS = (css: string): CSSError[] => {
  const errors: CSSError[] = [];
  const lines = css.split('\n');

  let inRuleSet = false;
  let braceCount = 0;
  let inComment = false;

  lines.forEach((line, lineIndex) => {
    const trimmedLine = line.trim();

    // Skip empty lines
    if (!trimmedLine) return;

    // Handle comments
    if (trimmedLine.includes('/*')) inComment = true;
    if (trimmedLine.includes('*/')) inComment = false;
    if (inComment) return;

    // Count braces
    const openBraces = (line.match(/{/g) || []).length;
    const closeBraces = (line.match(/}/g) || []).length;
    braceCount += openBraces - closeBraces;

    if (openBraces > 0) inRuleSet = true;
    if (closeBraces > 0 && braceCount === 0) inRuleSet = false;

    // Basic validation rules
    if (
      inRuleSet &&
      !trimmedLine.includes(':') &&
      !trimmedLine.includes('}') &&
      !trimmedLine.includes('{')
    ) {
      if (!trimmedLine.startsWith('@') && !trimmedLine.startsWith('/*')) {
        errors.push({
          line: lineIndex + 1,
          column: 1,
          message: 'CSS property should contain a colon (:)',
          severity: 'warning',
        });
      }
    }

    // Check for missing semicolons
    if (
      inRuleSet &&
      trimmedLine.includes(':') &&
      !trimmedLine.endsWith(';') &&
      !trimmedLine.endsWith('{') &&
      !trimmedLine.endsWith('}')
    ) {
      errors.push({
        line: lineIndex + 1,
        column: line.length,
        message: 'Missing semicolon (;)',
        severity: 'warning',
      });
    }

    // Check for invalid property names (very basic)
    if (trimmedLine.includes(':')) {
      const property = trimmedLine.split(':')[0].trim();
      if (
        property &&
        !property.match(/^[a-z-]+$/) &&
        !property.startsWith('-')
      ) {
        errors.push({
          line: lineIndex + 1,
          column: 1,
          message: 'Invalid property name',
          severity: 'error',
        });
      }
    }
  });

  // Check for unmatched braces
  if (braceCount !== 0) {
    errors.push({
      line: lines.length,
      column: 1,
      message: 'Unmatched braces',
      severity: 'error',
    });
  }

  return errors;
};

export function CSSEditor({
  value,
  onChange,
  className = '',
  placeholder = 'Enter your custom CSS...',
  height = '400px',
}: CSSEditorProps) {
  const [errors, setErrors] = useState<CSSError[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'templates' | 'hints'>(
    'editor'
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Validate CSS on change
  useEffect(() => {
    const validationErrors = validateCSS(value);
    setErrors(validationErrors);
  }, [value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  const insertTemplate = useCallback(
    (template: (typeof CSS_TEMPLATES)[0]) => {
      const currentValue = value;
      const newValue = currentValue
        ? `${currentValue}\n\n${template.css}`
        : template.css;
      onChange(newValue);
    },
    [value, onChange]
  );

  const formatCSS = useCallback(() => {
    // Simple CSS formatter
    const formatted = value
      .replace(/\s*{\s*/g, ' {\n  ')
      .replace(/;\s*/g, ';\n  ')
      .replace(/\s*}\s*/g, '\n}\n\n')
      .replace(/,\s*/g, ',\n')
      .trim();

    onChange(formatted);
  }, [value, onChange]);

  const clearCSS = useCallback(() => {
    onChange('');
  }, [onChange]);

  const renderEditor = () => (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            onClick={formatCSS}
            variant="secondary"
            size="sm"
            className="flex items-center gap-2"
          >
            <DocumentTextIcon className="w-4 h-4" />
            Format
          </Button>

          <Button
            onClick={clearCSS}
            variant="secondary"
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowPathIcon className="w-4 h-4" />
            Clear
          </Button>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          {errors.length > 0 ? (
            <span className="flex items-center gap-1 text-amber-600">
              <ExclamationTriangleIcon className="w-4 h-4" />
              {errors.length} issue{errors.length > 1 ? 's' : ''}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircleIcon className="w-4 h-4" />
              Valid CSS
            </span>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className={`
            w-full p-4 border border-gray-300 rounded-lg font-mono text-sm
            focus:ring-2 focus:ring-purple-500 focus:border-transparent
            resize-none
          `}
          style={{ height }}
          spellCheck={false}
        />

        {/* Line numbers would go here in a more advanced implementation */}
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="space-y-2">
          {errors.map((error, index) => (
            <Alert
              key={index}
              type={error.severity === 'error' ? 'error' : 'warning'}
              message={`Line ${error.line}: ${error.message}`}
            />
          ))}
        </div>
      )}
    </div>
  );

  const renderTemplates = () => (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">
        Choose from pre-built CSS templates to get started quickly:
      </div>

      <div className="space-y-3">
        {CSS_TEMPLATES.map((template, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">{template.name}</h4>
              <Button
                onClick={() => insertTemplate(template)}
                variant="primary"
                size="sm"
              >
                Insert
              </Button>
            </div>

            <pre className="text-xs text-gray-600 bg-gray-50 p-3 rounded overflow-x-auto">
              {template.css.slice(0, 200)}...
            </pre>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderHints = () => (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">
        Common CSS properties you can use to customize your page:
      </div>

      <div className="space-y-3">
        {CSS_HINTS.map((hint, index) => (
          <Card key={index} className="p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <LightBulbIcon className="w-4 h-4 text-yellow-500" />
                <code className="font-semibold text-purple-600">
                  {hint.property}
                </code>
              </div>

              <p className="text-sm text-gray-600">{hint.description}</p>

              <pre className="text-xs text-gray-700 bg-gray-50 p-2 rounded">
                {hint.example}
              </pre>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderPreview = () => (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">
        Preview how your custom CSS affects the page styling:
      </div>

      <Card className="p-6">
        <div ref={previewRef}>
          {/* Inject custom CSS */}
          <style dangerouslySetInnerHTML={{ __html: value }} />

          {/* Sample content */}
          <div className="space-y-4">
            <div className="page-background p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-2">Sample Page Title</h2>
              <p className="text-gray-600 mb-4">
                This is a sample description to show how your custom CSS affects
                the page styling.
              </p>

              <div className="space-y-3">
                <div className="link-button p-4 rounded-lg bg-white border border-gray-200 cursor-pointer">
                  Sample Link Button
                </div>
                <div className="link-button p-4 rounded-lg bg-white border border-gray-200 cursor-pointer">
                  Another Link Button
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CodeBracketIcon className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-900">
            Custom CSS Editor
          </h3>
        </div>

        <Button
          onClick={() => setShowPreview(!showPreview)}
          variant="secondary"
          size="sm"
          className="flex items-center gap-2"
        >
          <EyeIcon className="w-4 h-4" />
          {showPreview ? 'Hide' : 'Show'} Preview
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'editor', label: 'CSS Editor' },
            { id: 'templates', label: 'Templates' },
            { id: 'hints', label: 'CSS Hints' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm transition-all duration-200
                ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className={showPreview ? 'grid grid-cols-2 gap-6' : ''}>
        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'editor' && renderEditor()}
              {activeTab === 'templates' && renderTemplates()}
              {activeTab === 'hints' && renderHints()}
            </motion.div>
          </AnimatePresence>
        </div>

        {showPreview && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            {renderPreview()}
          </motion.div>
        )}
      </div>
    </div>
  );
}
