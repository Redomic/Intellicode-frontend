import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useSubmitSolution } from '../../services/api';
import useBehaviorTracking from '../../hooks/useBehaviorTracking';
import BehaviorFeedback from './BehaviorFeedback';
import BehaviorPrivacyControls from './BehaviorPrivacyControls';

/**
 * CodeEditor - Right panel with code editor and execution controls
 */
const CodeEditor = ({ 
  question, 
  language, 
  onLanguageChange
}) => {
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('code');
  const [editorTheme, setEditorTheme] = useState('intellit-dark');
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [showBehaviorFeedback, setShowBehaviorFeedback] = useState(process.env.NODE_ENV === 'development');
  const [showPrivacyControls, setShowPrivacyControls] = useState(false);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  
  // API hooks
  const submitSolutionHook = useSubmitSolution();
  
  // Behavior tracking
  const behaviorTracking = useBehaviorTracking({
    autoStart: true,
    questionKey: question?.id,
    trackingEnabled: true,
    analysisOptions: {
      pauseThreshold: 500,
      burstThreshold: 150,
      flowStateThreshold: 40,
      analysisWindow: 60000
    }
  });
  
  // Combined loading state
  const isApiLoading = submitSolutionHook.loading;

  // Language templates
  const getLanguageTemplate = (lang, question) => {
    const templates = {
      python: question?.pythonTemplate || `def solution(${question?.functionSignature?.python || 'nums'}):\n    # Write your code here\n    pass\n\n# Test your solution\nif __name__ == "__main__":\n    # Add test cases here\n    pass`,
      java: question?.javaTemplate || `class Solution {\n    public ${question?.functionSignature?.java || 'int[] solution(int[] nums)'} {\n        // Write your code here\n        \n    }\n\n    public static void main(String[] args) {\n        Solution sol = new Solution();\n        // Add test cases here\n    }\n}`
    };
    return templates[lang] || '';
  };

  // Monaco Editor configuration
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    
    // Define custom theme
    monaco.editor.defineTheme('intellit-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: 'a1a1aa', fontStyle: 'italic' },
        { token: 'keyword', foreground: '60a5fa', fontStyle: 'bold' },
        { token: 'string', foreground: '34d399' },
        { token: 'number', foreground: 'f59e0b' },
        { token: 'type', foreground: 'a78bfa' },
        { token: 'function', foreground: 'fbbf24' },
        { token: 'variable', foreground: 'e4e4e7' },
        { token: 'operator', foreground: 'f87171' },
        { token: 'delimiter', foreground: 'd4d4d8' },
      ],
      colors: {
        'editor.background': '#18181b',
        'editor.foreground': '#e4e4e7',
        'editor.lineHighlightBackground': '#27272a',
        'editor.selectionBackground': '#3f3f46',
        'editor.inactiveSelectionBackground': '#27272a',
        'editorCursor.foreground': '#60a5fa',
        'editorLineNumber.foreground': '#71717a',
        'editorLineNumber.activeForeground': '#a1a1aa',
        'editorIndentGuide.background': '#3f3f46',
        'editorIndentGuide.activeBackground': '#71717a',
        'editorWhitespace.foreground': '#3f3f46',
        'editorBracketMatch.background': '#3f3f46',
        'editorBracketMatch.border': '#60a5fa',
        'scrollbar.shadow': '#00000033',
        'scrollbarSlider.background': '#52525b66',
        'scrollbarSlider.hoverBackground': '#71717a99',
        'scrollbarSlider.activeBackground': '#a1a1aa99',
      }
    });
    
    // Set the theme
    monaco.editor.setTheme('intellit-dark');
    
    // Configure editor options
    editor.updateOptions({
      fontSize: 14,
      fontFamily: 'JetBrains Mono, Monaco, Menlo, "Ubuntu Mono", monospace',
      lineHeight: 20,
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      lineNumbers: 'on',
      renderWhitespace: 'boundary',
      automaticLayout: true,
      suggestOnTriggerCharacters: true,
      quickSuggestions: true,
      snippetSuggestions: 'inline',
      formatOnPaste: true,
      formatOnType: true,
      autoIndent: 'advanced',
      bracketPairColorization: { enabled: true },
      guides: {
        bracketPairs: true,
        indentation: true,
      },
      matchBrackets: 'always',
      folding: true,
      foldingStrategy: 'indentation',
      showFoldingControls: 'mouseover',
    });

    // Add custom key bindings
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleSubmit();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleRunCode();
    });

    // Setup behavior tracking
    setupBehaviorTracking(editor, monaco);

    // Setup language-specific features
    setupLanguageFeatures(monaco, language);
  };

  // Setup behavior tracking for Monaco Editor
  const setupBehaviorTracking = (editor, monaco) => {
    // Always setup event listeners - the hook will handle initialization state
    console.log('Setting up behavior tracking event listeners...');

    // Track keydown events
    editor.onKeyDown((e) => {
      try {
        const keystrokeEvent = {
          key: e.browserEvent.key,
          keyCode: e.browserEvent.keyCode,
          ctrlKey: e.browserEvent.ctrlKey,
          shiftKey: e.browserEvent.shiftKey,
          altKey: e.browserEvent.altKey,
          metaKey: e.browserEvent.metaKey,
          timestamp: new Date(),
          target: {
            value: editor.getValue(),
            selectionStart: null, // Monaco handles this differently
            selectionEnd: null
          }
        };

        // Record keystroke in behavior tracking system
        behaviorTracking.recordKeystroke(keystrokeEvent);

        // Also record special behavior events
        if (e.browserEvent.ctrlKey || e.browserEvent.metaKey) {
          const key = e.browserEvent.key.toLowerCase();
          switch (key) {
            case 'c':
              behaviorTracking.recordBehaviorEvent?.('COPY_PASTE', { action: 'copy' });
              break;
            case 'v':
              behaviorTracking.recordBehaviorEvent?.('COPY_PASTE', { action: 'paste' });
              break;
            case 'z':
              behaviorTracking.recordBehaviorEvent?.('UNDO_REDO', { action: e.browserEvent.shiftKey ? 'redo' : 'undo' });
              break;
            case 's':
              behaviorTracking.recordBehaviorEvent?.('CODE_EXECUTION', { action: 'save' });
              break;
            default:
              break;
          }
        }
      } catch (error) {
        console.warn('Error recording keystroke event:', error);
      }
    });

    // Track cursor position changes
    editor.onDidChangeCursorPosition((e) => {
      try {
        behaviorTracking.recordBehaviorEvent?.('CURSOR_MOVEMENT', {
          position: e.position,
          reason: e.reason,
          source: e.source
        });
      } catch (error) {
        console.warn('Error recording cursor movement:', error);
      }
    });

    // Track content changes
    editor.onDidChangeModelContent((e) => {
      try {
        const changes = e.changes.map(change => ({
          range: change.range,
          rangeLength: change.rangeLength,
          text: change.text
        }));

        behaviorTracking.recordBehaviorEvent?.('CODE_EDIT', {
          changes,
          contentLength: editor.getValue().length,
          lineCount: editor.getModel()?.getLineCount() || 0
        });
      } catch (error) {
        console.warn('Error recording content change:', error);
      }
    });

    // Track focus events
    editor.onDidFocusEditorWidget(() => {
      behaviorTracking.recordBehaviorEvent?.('EDITOR_FOCUS', { focused: true });
    });

    editor.onDidBlurEditorWidget(() => {
      behaviorTracking.recordBehaviorEvent?.('EDITOR_FOCUS', { focused: false });
    });

    console.log('Behavior tracking setup complete for Monaco Editor');
  };

  // Setup language-specific linting and IntelliSense
  const setupLanguageFeatures = (monaco, lang) => {
    if (lang === 'python') {
      // Python-specific configuration
      monaco.languages.setLanguageConfiguration('python', {
        comments: {
          lineComment: '#',
          blockComment: ['"""', '"""']
        },
        brackets: [
          ['{', '}'],
          ['[', ']'],
          ['(', ')']
        ],
        autoClosingPairs: [
          { open: '{', close: '}' },
          { open: '[', close: ']' },
          { open: '(', close: ')' },
          { open: '"', close: '"', notIn: ['string'] },
          { open: "'", close: "'", notIn: ['string', 'comment'] }
        ],
        surroundingPairs: [
          { open: '{', close: '}' },
          { open: '[', close: ']' },
          { open: '(', close: ')' },
          { open: '"', close: '"' },
          { open: "'", close: "'" }
        ],
        indentationRules: {
          increaseIndentPattern: /^.*:\s*$/,
          decreaseIndentPattern: /^(return|break|continue|pass|raise)\b.*$/
        }
      });

      // Add Python snippets
      monaco.languages.registerCompletionItemProvider('python', {
        provideCompletionItems: (model, position) => {
          const suggestions = [
            {
              label: 'def',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: 'def ${1:function_name}(${2:parameters}):\n    ${3:pass}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Function definition'
            },
            {
              label: 'class',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: 'class ${1:ClassName}:\n    def __init__(self${2:, parameters}):\n        ${3:pass}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Class definition'
            },
            {
              label: 'if',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: 'if ${1:condition}:\n    ${2:pass}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'If statement'
            },
            {
              label: 'for',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: 'for ${1:item} in ${2:iterable}:\n    ${3:pass}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'For loop'
            },
            {
              label: 'while',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: 'while ${1:condition}:\n    ${2:pass}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'While loop'
            },
            {
              label: 'try',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: 'try:\n    ${1:pass}\nexcept ${2:Exception} as ${3:e}:\n    ${4:pass}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Try-except block'
            }
          ];
          return { suggestions };
        }
      });
    } else if (lang === 'java') {
      // Java-specific configuration
      monaco.languages.setLanguageConfiguration('java', {
        comments: {
          lineComment: '//',
          blockComment: ['/*', '*/']
        },
        brackets: [
          ['{', '}'],
          ['[', ']'],
          ['(', ')']
        ],
        autoClosingPairs: [
          { open: '{', close: '}' },
          { open: '[', close: ']' },
          { open: '(', close: ')' },
          { open: '"', close: '"', notIn: ['string'] },
          { open: "'", close: "'", notIn: ['string', 'comment'] }
        ],
        surroundingPairs: [
          { open: '{', close: '}' },
          { open: '[', close: ']' },
          { open: '(', close: ')' },
          { open: '"', close: '"' },
          { open: "'", close: "'" }
        ]
      });

      // Add Java snippets
      monaco.languages.registerCompletionItemProvider('java', {
        provideCompletionItems: (model, position) => {
          const suggestions = [
            {
              label: 'public method',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: 'public ${1:void} ${2:methodName}(${3:parameters}) {\n    ${4:// TODO}\n}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Public method'
            },
            {
              label: 'private method',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: 'private ${1:void} ${2:methodName}(${3:parameters}) {\n    ${4:// TODO}\n}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Private method'
            },
            {
              label: 'for loop',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: 'for (${1:int i = 0}; ${2:i < length}; ${3:i++}) {\n    ${4:// TODO}\n}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'For loop'
            },
            {
              label: 'enhanced for',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: 'for (${1:Type} ${2:item} : ${3:collection}) {\n    ${4:// TODO}\n}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Enhanced for loop'
            },
            {
              label: 'if statement',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: 'if (${1:condition}) {\n    ${2:// TODO}\n}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'If statement'
            },
            {
              label: 'try-catch',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: 'try {\n    ${1:// TODO}\n} catch (${2:Exception} ${3:e}) {\n    ${4:// Handle exception}\n}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Try-catch block'
            }
          ];
          return { suggestions };
        }
      });
    }
  };

  // Handle code change from Monaco Editor
  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  // Format code
  const formatCode = () => {
    if (editorRef.current) {
      editorRef.current.trigger('source', 'editor.action.formatDocument');
    }
  };

  // Update code when language or question changes
  useEffect(() => {
    const newCode = getLanguageTemplate(language, question);
    setCode(newCode);
    setOutput('');
    
    // Update Monaco editor language
    if (monacoRef.current && editorRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        monacoRef.current.editor.setModelLanguage(model, language);
        setupLanguageFeatures(monacoRef.current, language);
      }
    }

    // Restart behavior tracking for new question (only if question ID changes)
    if (question?.id && behaviorTracking.isTracking && 
        behaviorTracking.currentSession?.questionKey !== String(question.id)) {
      behaviorTracking.endTracking().then(() => {
        behaviorTracking.startTracking(String(question.id));
      });
    }
  }, [language, question?.id]); // Only depend on question ID, not the entire object

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSettingsDropdown && !event.target.closest('.relative')) {
        setShowSettingsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettingsDropdown]);

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('Running code...');
    
    // Simulate code execution (replace with actual execution later)
    setTimeout(() => {
      const success = Math.random() > 0.3; // 70% success rate for simulation
      const result = {
        success,
        executionTime: Math.random() * 1000 + 500,
        codeLength: code.length
      };
      
      if (success) {
        setOutput('Output:\nCode executed successfully!\n\nNote: This is a mock execution. Integrate with a code execution service for real results.');
      } else {
        const error = 'Runtime Error: Index out of bounds on line 5';
        setOutput(`Output:\n❌ ${error}\n\nNote: This is a simulated error.`);
      }
      
      setIsRunning(false);
    }, 1500);
  };

  const handleSubmit = async () => {
    if (!question?.id || !code.trim()) {
      setOutput('Error: Please write some code before submitting.');
      return;
    }

    setIsRunning(true);
    setOutput('Submitting solution...');
    setActiveTab('result');
    
    try {
      const submissionData = {
        problemId: question.id,
        code: code,
        language: language,
        testCases: question.examples || []
      };

      const result = await submitSolutionHook.execute(submissionData);
      
      if (result.success) {
        setOutput(
          `Submission Result:\n✅ All test cases passed!\n\n` +
          `Runtime: ${result.runtime || '42ms'} (beats ${result.runtimePercentile || '95.23'}% of submissions)\n` +
          `Memory: ${result.memory || '14.2MB'} (beats ${result.memoryPercentile || '88.47'}% of submissions)\n\n` +
          `Score: ${result.score || 100}/100`
        );
      } else {
        setOutput(
          `Submission Result:\n❌ ${result.failed || 0} test case(s) failed\n\n` +
          `Error: ${result.error || 'Unknown error occurred'}\n\n` +
          `Test case ${result.failedTestCase || 1}:\n` +
          `Input: ${result.failedInput || 'N/A'}\n` +
          `Expected: ${result.expected || 'N/A'}\n` +
          `Got: ${result.actual || 'N/A'}`
        );
      }
    } catch (error) {
      console.error('Submission failed:', error);
      setOutput(
        `Submission Failed:\n❌ Network error or server is unavailable\n\n` +
        `Please check your connection and try again.\n` +
        `Error: ${error.message || 'Unknown error'}`
      );
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setCode(getLanguageTemplate(language, question));
    setOutput('');
  };

  const tabs = [
    { id: 'code', label: 'Code' },
    { id: 'testcases', label: 'Test Cases' },
    { id: 'problems', label: 'Problems' },
    { id: 'result', label: 'Result' }
  ];

  // Toggle minimap
  const toggleMinimap = () => {
    if (editorRef.current) {
      const currentOptions = editorRef.current.getOptions();
      const minimapEnabled = !currentOptions.get('minimap').enabled;
      editorRef.current.updateOptions({
        minimap: { enabled: minimapEnabled }
      });
    }
  };

  // Change font size
  const changeFontSize = (delta) => {
    if (editorRef.current) {
      const currentOptions = editorRef.current.getOptions();
      const currentSize = currentOptions.get('fontSize');
      const newSize = Math.max(10, Math.min(24, currentSize + delta));
      editorRef.current.updateOptions({ fontSize: newSize });
    }
  };

  return (
    <div className="h-full bg-zinc-900 flex flex-col">
      {/* Editor Actions */}
      <div className="bg-zinc-800 border-b border-zinc-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Settings Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                className="
                  p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700
                  border border-zinc-600 hover:border-zinc-500 rounded
                  transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500
                "
                title="Editor Settings"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>

              {showSettingsDropdown && (
                <div className="absolute left-0 top-full mt-1 w-48 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg z-10">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        changeFontSize(-1);
                        setShowSettingsDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 transition-colors duration-200"
                    >
                      <span className="flex items-center justify-between">
                        Decrease Font Size
                        <kbd className="text-xs bg-zinc-700 px-1 rounded">A-</kbd>
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        changeFontSize(1);
                        setShowSettingsDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 transition-colors duration-200"
                    >
                      <span className="flex items-center justify-between">
                        Increase Font Size
                        <kbd className="text-xs bg-zinc-700 px-1 rounded">A+</kbd>
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        toggleMinimap();
                        setShowSettingsDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 transition-colors duration-200"
                    >
                      Toggle Minimap
                    </button>
                    <button
                      onClick={() => {
                        formatCode();
                        setShowSettingsDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 transition-colors duration-200"
                    >
                      <span className="flex items-center justify-between">
                        Format Code
                        <kbd className="text-xs bg-zinc-700 px-1 rounded">Alt+Shift+F</kbd>
                      </span>
                    </button>
                    {/* Development-only behavior tracking controls */}
                    {process.env.NODE_ENV === 'development' && (
                      <>
                        <div className="border-t border-zinc-600 my-1"></div>
                        <button
                          onClick={() => {
                            setShowBehaviorFeedback(!showBehaviorFeedback);
                            setShowSettingsDropdown(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 transition-colors duration-200"
                        >
                          <span className="flex items-center justify-between">
                            {showBehaviorFeedback ? 'Hide' : 'Show'} Dev Metrics
                            <div className={`w-2 h-2 rounded-full ${behaviorTracking.isTracking ? 'bg-green-400' : 'bg-gray-400'}`} />
                          </span>
                        </button>
                        <button
                          onClick={() => {
                            behaviorTracking.toggleTracking();
                            setShowSettingsDropdown(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 transition-colors duration-200"
                        >
                          <span className="flex items-center justify-between">
                            {behaviorTracking.isTracking ? 'Stop' : 'Start'} Tracking
                            <span className="text-xs text-zinc-500">
                              {behaviorTracking.isTracking ? 'ON' : 'OFF'}
                            </span>
                          </span>
                        </button>
                        <button
                          onClick={() => {
                            setShowPrivacyControls(true);
                            setShowSettingsDropdown(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 transition-colors duration-200"
                        >
                          <span className="flex items-center justify-between">
                            Privacy Settings
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={handleReset}
              className="
                px-3 py-1 text-sm text-zinc-400 hover:text-zinc-200 
                border border-zinc-600 hover:border-zinc-500 rounded
                transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500
              "
            >
              Reset
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleRunCode}
              disabled={isRunning || isApiLoading}
              className="
                px-4 py-1 text-sm bg-green-600 hover:bg-green-700 disabled:bg-green-800 
                text-white rounded transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-green-500
              "
            >
              {isRunning ? 'Running...' : 'Run'}
            </button>
            <button
              onClick={handleSubmit}
              disabled={isRunning || isApiLoading}
              className="
                px-4 py-1 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 
                text-white rounded transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
            >
              {isApiLoading ? 'Submitting...' : isRunning ? 'Running...' : 'Submit'}
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-zinc-700">
        <div className="flex">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-3 text-sm font-medium transition-colors duration-200
                border-b-2 focus:outline-none
                ${activeTab === tab.id
                  ? 'text-blue-400 border-blue-400 bg-zinc-800/50'
                  : 'text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-zinc-800/30'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'code' && (
          <div className="flex-1 flex flex-col">
            {/* Monaco Editor */}
            <div className="flex-1 border border-zinc-700 rounded overflow-hidden">
              <Editor
                height="100%"
                language={language}
                value={code}
                theme={editorTheme}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                options={{
                  minimap: { enabled: true },
                  fontSize: 14,
                  fontFamily: 'JetBrains Mono, Monaco, Menlo, "Ubuntu Mono", monospace',
                  lineHeight: 20,
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  lineNumbers: 'on',
                  renderWhitespace: 'boundary',
                  automaticLayout: true,
                  suggestOnTriggerCharacters: true,
                  quickSuggestions: {
                    other: true,
                    comments: true,
                    strings: true
                  },
                  parameterHints: { enabled: true },
                  snippetSuggestions: 'inline',
                  formatOnPaste: true,
                  formatOnType: true,
                  autoIndent: 'advanced',
                  bracketPairColorization: { enabled: true },
                  guides: {
                    bracketPairs: true,
                    indentation: true,
                  },
                  matchBrackets: 'always',
                  folding: true,
                  foldingStrategy: 'indentation',
                  showFoldingControls: 'mouseover',
                  contextmenu: true,
                  selectOnLineNumbers: true,
                  roundedSelection: false,
                  readOnly: false,
                  cursorStyle: 'line',
                  mouseWheelZoom: true,
                  padding: { top: 10, bottom: 10 },
                  smoothScrolling: true,
                  cursorBlinking: 'blink',
                  cursorSmoothCaretAnimation: true,
                }}
                loading={
                  <div className="flex items-center justify-center h-full bg-zinc-800">
                    <div className="text-zinc-400">Loading editor...</div>
                  </div>
                }
              />
            </div>

            {/* Output Area */}
            {output && (
              <div className="border-t border-zinc-700 p-4 bg-zinc-800/50">
                <h4 className="text-zinc-100 font-medium mb-2">Output:</h4>
                <pre className="text-zinc-300 text-sm bg-zinc-900 p-3 rounded border border-zinc-700 overflow-auto max-h-32">
                  {output}
                </pre>
              </div>
            )}
          </div>
        )}

        {activeTab === 'testcases' && (
          <div className="flex-1 p-4 overflow-y-auto">
            <h4 className="text-zinc-100 font-medium mb-4">Test Cases</h4>
            <div className="space-y-4">
              {question?.examples?.map((example, index) => (
                <div key={index} className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-zinc-100 font-medium">Test Case {index + 1}</h5>
                    <button className="text-xs text-blue-400 hover:text-blue-300">
                      Run Test
                    </button>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-zinc-400">Input:</span>
                      <pre className="text-zinc-200 bg-zinc-900 p-2 rounded mt-1 overflow-x-auto">
                        {example.input}
                      </pre>
                    </div>
                    
                    <div>
                      <span className="text-zinc-400">Expected Output:</span>
                      <pre className="text-zinc-200 bg-zinc-900 p-2 rounded mt-1 overflow-x-auto">
                        {example.output}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Add Custom Test Case */}
              <div className="border-2 border-dashed border-zinc-600 rounded-lg p-4 text-center">
                <button className="text-zinc-400 hover:text-zinc-200 transition-colors duration-200">
                  <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Custom Test Case
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'problems' && (
          <div className="flex-1 p-4 overflow-y-auto">
            <h4 className="text-zinc-100 font-medium mb-4">Problems</h4>
            <div className="space-y-3">
              {/* Mock syntax/linting problems */}
              <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-3">
                <div className="flex items-start space-x-3">
                  <div className="w-4 h-4 bg-red-500 rounded-full flex-shrink-0 mt-0.5"></div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-red-400 text-sm font-medium">Syntax Error</span>
                      <span className="text-zinc-500 text-xs">Line 12</span>
                    </div>
                    <p className="text-zinc-300 text-sm">Missing colon at end of function definition</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-3">
                <div className="flex items-start space-x-3">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full flex-shrink-0 mt-0.5"></div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-yellow-400 text-sm font-medium">Warning</span>
                      <span className="text-zinc-500 text-xs">Line 8</span>
                    </div>
                    <p className="text-zinc-300 text-sm">Unused variable 'temp'</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-3">
                <div className="flex items-start space-x-3">
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex-shrink-0 mt-0.5"></div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-blue-400 text-sm font-medium">Info</span>
                      <span className="text-zinc-500 text-xs">General</span>
                    </div>
                    <p className="text-zinc-300 text-sm">Consider using list comprehension for better performance</p>
                  </div>
                </div>
              </div>

              {/* Keyboard Shortcuts */}
              <div className="mt-8 pt-4 border-t border-zinc-700">
                <h5 className="text-zinc-100 font-medium mb-3">Keyboard Shortcuts</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-300">Run Code</span>
                    <kbd className="px-2 py-1 bg-zinc-700 text-zinc-300 rounded text-xs">Ctrl+Enter</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-300">Submit</span>
                    <kbd className="px-2 py-1 bg-zinc-700 text-zinc-300 rounded text-xs">Ctrl+S</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-300">Format Code</span>
                    <kbd className="px-2 py-1 bg-zinc-700 text-zinc-300 rounded text-xs">Alt+Shift+F</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-300">Auto Complete</span>
                    <kbd className="px-2 py-1 bg-zinc-700 text-zinc-300 rounded text-xs">Ctrl+Space</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-300">Toggle Comment</span>
                    <kbd className="px-2 py-1 bg-zinc-700 text-zinc-300 rounded text-xs">Ctrl+/</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-300">Find</span>
                    <kbd className="px-2 py-1 bg-zinc-700 text-zinc-300 rounded text-xs">Ctrl+F</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-300">Find & Replace</span>
                    <kbd className="px-2 py-1 bg-zinc-700 text-zinc-300 rounded text-xs">Ctrl+H</kbd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'result' && (
          <div className="flex-1 p-4 overflow-y-auto">
            <h4 className="text-zinc-100 font-medium mb-4">Submission Results</h4>
            {output ? (
              <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                <pre className="text-zinc-300 text-sm whitespace-pre-wrap">
                  {output}
                </pre>
              </div>
            ) : (
              <div className="text-center text-zinc-400 py-8">
                <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>No results yet. Run or submit your code to see results here.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Behavior Feedback Component - Development Only */}
      {showBehaviorFeedback && (
        <BehaviorFeedback
          isVisible={showBehaviorFeedback}
          analyzer={behaviorTracking.analyzer}
          behaviorTracker={behaviorTracking.behaviorTracker}
          position="bottom-right"
          compact={false}
        />
      )}

      {/* Privacy Controls Modal - Development Only */}
      {process.env.NODE_ENV === 'development' && (
        <BehaviorPrivacyControls
          isVisible={showPrivacyControls}
          onClose={() => setShowPrivacyControls(false)}
          behaviorTracker={behaviorTracking.behaviorTracker}
        />
      )}
    </div>
  );
};

export default CodeEditor;
