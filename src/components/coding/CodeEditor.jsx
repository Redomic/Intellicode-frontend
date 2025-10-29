import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useSubmitSolution, useRunCode } from '../../services/api';
import useBehaviorTracking from '../../hooks/useBehaviorTracking';
import useSession from '../../hooks/useSession';
import BehaviorFeedback from './BehaviorFeedback';
import BehaviorPrivacyControls from './BehaviorPrivacyControls';
import SubmissionResult from './SubmissionResult';
import SubmissionHistory from './SubmissionHistory';
import SubmissionSuccessModal from './SubmissionSuccessModal';
import { LoadingButton } from '../ui/InlineLoading';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axios';

/**
 * CodeEditor - Right panel with code editor and execution controls
 */
const CodeEditor = ({ 
  question, 
  language, 
  onLanguageChange,
  location,
  onCodeChange,
  latestHint = null  // New prop: latest hint for code highlighting
}) => {
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [submissionResult, setSubmissionResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('code');
  const [editorTheme, setEditorTheme] = useState('intellit-dark');
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [showBehaviorFeedback, setShowBehaviorFeedback] = useState(process.env.NODE_ENV === 'development');
  const [showPrivacyControls, setShowPrivacyControls] = useState(false);
  const [codeInitialized, setCodeInitialized] = useState(false);
  const [customTestCases, setCustomTestCases] = useState([]);
  const [runningTestIndex, setRunningTestIndex] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalData, setSuccessModalData] = useState(null);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationsRef = useRef([]);  // Track Monaco decorations for highlights
  const navigate = useNavigate();
  
  // API hooks
  const submitSolutionHook = useSubmitSolution();
  const runCodeHook = useRunCode();
  
  // Session management
  const {
    currentSession,
    needsRecovery,
    recoveryData,
    trackCodeChange,
    endSession
  } = useSession();
  
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
  const isApiLoading = submitSolutionHook.loading || runCodeHook.loading;

  // Language templates - Use templates from database or fallback
  const getLanguageTemplate = (lang, question) => {
    // First try to use code_templates from database
    if (question?.code_templates && question.code_templates[lang]) {
      return question.code_templates[lang];
    }
    
    // Fallback to default_code if available
    if (question?.default_code) {
      return question.default_code;
    }
    
    // Last resort: generic templates
    const templates = {
      python: question?.pythonTemplate || `def solution(${question?.functionSignature?.python || 'nums'}):\n    # Write your code here\n    pass\n\n# Test your solution\nif __name__ == "__main__":\n    # Add test cases here\n    pass`,
      java: question?.javaTemplate || `class Solution {\n    public ${question?.functionSignature?.java || 'int[] solution(int[] nums)'} {\n        // Write your code here\n        \n    }\n\n    public static void main(String[] args) {\n        Solution sol = new Solution();\n        // Add test cases here\n    }\n}`
    };
    return templates[lang] || '';
  };

  // Extract code snippets from hint text (backticks and triple backticks)
  const extractCodeSnippets = (hintText) => {
    if (!hintText) return [];
    
    const snippets = [];
    
    // Extract triple backtick code blocks - split into individual lines
    const blockRegex = /```(?:python|java|javascript|cpp|c)?\s*\n([\s\S]*?)```/g;
    let match;
    while ((match = blockRegex.exec(hintText)) !== null) {
      if (match[1]?.trim()) {
        // Split multi-line blocks into individual lines for better matching
        const lines = match[1].split('\n').map(l => l.trim()).filter(l => l.length > 3 && !l.startsWith('#'));
        snippets.push(...lines);
      }
    }
    
    // Extract inline code (single backticks) - ONLY what's inside backticks
    // Match backtick, then content, then closing backtick
    const inlineRegex = /`([^`\n]+?)`/g;
    while ((match = inlineRegex.exec(hintText)) !== null) {
      const snippet = match[1].trim();
      
      // Skip numbers, single characters, and plain English
      if (snippet.length < 2 || /^\d+\.?\d*$/.test(snippet)) continue;
      
      // Only include if it looks like code (has operators, parentheses, keywords, etc.)
      if (/[()=<>{}[\]]|return|if|def|class|for|while|max_of_left|min_of_right|m \+|n \+/.test(snippet)) {
        snippets.push(snippet);
      }
    }
    
    // Extract "line N" or "line where you X" references
    const lineRefRegex = /\b(?:line|Line)\s+(?:where you\s+)?(?:(\d+)|`([^`]+)`)/g;
    while ((match = lineRefRegex.exec(hintText)) !== null) {
      if (match[1]) {
        snippets.push(`line ${match[1]}`);
      } else if (match[2]) {
        snippets.push(match[2].trim());
      }
    }
    
    console.log('🎨 Extracted snippets:', snippets);
    return snippets;
  };

  // Find matching lines in code for a snippet
  const findMatchingLines = (codeText, snippet) => {
    if (!codeText || !snippet) return [];
    
    const codeLines = codeText.split('\n');
    const matches = [];
    
    // Clean up snippet for matching (remove extra whitespace, normalize)
    const cleanSnippet = snippet
      .replace(/\s+/g, ' ')
      .replace(/["""]/g, '"')  // Normalize quotes
      .replace(/[''']/g, "'")
      .trim();
    
    // Skip if snippet is too short or just whitespace/comments
    if (cleanSnippet.length < 3) return [];
    
    codeLines.forEach((line, index) => {
      const cleanLine = line
        .replace(/\s+/g, ' ')
        .replace(/["""]/g, '"')
        .replace(/[''']/g, "'")
        .trim();
      
      // Skip empty lines or pure comments
      if (!cleanLine || cleanLine.startsWith('#') || cleanLine.startsWith('//')) {
        return;
      }
      
      // Check if line contains the snippet (need substantial overlap)
      const lineContainsSnippet = cleanLine.includes(cleanSnippet);
      const snippetContainsLine = cleanSnippet.includes(cleanLine) && cleanLine.length >= 5;
      
      // For line numbers like "line 30", extract and match
      const lineNumMatch = snippet.match(/line\s+(\d+)/i);
      if (lineNumMatch) {
        const targetLine = parseInt(lineNumMatch[1]);
        if (targetLine === index + 1) {
          matches.push(index + 1);
          return;
        }
      }
      
      if (lineContainsSnippet || snippetContainsLine) {
        matches.push(index + 1);  // Monaco uses 1-based line numbers
      }
    });
    
    return matches;
  };

  // Clear all code highlights
  const clearHighlights = () => {
    if (editorRef.current && decorationsRef.current.length > 0) {
      decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, []);
      console.log('🎨 Cleared code highlights');
    }
  };

  // Highlight lines in Monaco editor
  const highlightCodeLines = (snippets) => {
    if (!editorRef.current || !monacoRef.current || !code) return;
    
    console.log('🎨 Highlighting code from hint:', { snippetsCount: snippets.length });
    
    // Clear previous decorations
    clearHighlights();
    
    // Find all lines to highlight
    const linesToHighlight = new Set();
    snippets.forEach(snippet => {
      const matches = findMatchingLines(code, snippet);
      matches.forEach(lineNum => linesToHighlight.add(lineNum));
    });
    
    console.log('🎨 Lines to highlight:', Array.from(linesToHighlight));
    
    if (linesToHighlight.size === 0) return;
    
    // Create decorations for highlighted lines
    const decorations = Array.from(linesToHighlight).map(lineNumber => ({
      range: new monacoRef.current.Range(lineNumber, 1, lineNumber, 1),
      options: {
        isWholeLine: true,
        className: 'highlighted-code-line',
        glyphMarginClassName: 'highlighted-glyph-margin'
      }
    }));
    
    // Apply decorations (persistent until cleared)
    decorationsRef.current = editorRef.current.deltaDecorations([], decorations);
    
    // Scroll to first highlighted line
    if (linesToHighlight.size > 0) {
      const firstLine = Math.min(...Array.from(linesToHighlight));
      editorRef.current.revealLineInCenter(firstLine);
    }
    
    console.log('🎨 Highlights will persist until code changes or new hint arrives');
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
    const newCode = value || '';
    setCode(newCode);
    
    // Notify parent component of code change
    if (onCodeChange) {
      onCodeChange(newCode);
    }
  };

  // Format code
  const formatCode = () => {
    if (editorRef.current) {
      editorRef.current.trigger('source', 'editor.action.formatDocument');
    }
  };

  // Initialize code from session snapshots or template
  useEffect(() => {
    const initializeCode = async () => {
      let codeToSet = '';
      let shouldRestoreFromSession = false;

      // Priority 1: Check for code snapshots in current session
      if (currentSession?.code_snapshots && currentSession.code_snapshots.length > 0 && !codeInitialized) {
        // Get the most recent snapshot
        const snapshots = [...currentSession.code_snapshots].sort((a, b) => 
          new Date(b.timestamp) - new Date(a.timestamp)
        );
        const latestSnapshot = snapshots[0];
        
        if (latestSnapshot?.code) {
          codeToSet = latestSnapshot.code;
          shouldRestoreFromSession = true;
          
          console.log('📸 Restoring code from latest snapshot:', {
            sessionId: currentSession.sessionId,
            codeLength: codeToSet.length,
            timestamp: latestSnapshot.timestamp,
            language: latestSnapshot.language || language
          });
        }
      }
      
      // Priority 2: Check recovery data
      if (!codeToSet && needsRecovery && recoveryData?.lastCode?.code && 
          recoveryData.sessionId === currentSession?.id &&
          !codeInitialized) {
        
        codeToSet = recoveryData.lastCode.code;
        shouldRestoreFromSession = true;
        
        console.log('🔄 Restoring code from session recovery:', {
          sessionId: recoveryData.sessionId,
          codeLength: codeToSet.length,
          language: recoveryData.lastCode.language || language
        });
      }
        
      // Priority 3: Check currentCode field
      if (!codeToSet && currentSession?.currentCode && !codeInitialized) {
        codeToSet = currentSession.currentCode;
        shouldRestoreFromSession = true;
        
        console.log('🔄 Restoring code from current session:', {
          sessionId: currentSession.id,
          codeLength: codeToSet.length
        });
      }
        
      // Priority 4: Use default template
      if (!codeToSet) {
        codeToSet = getLanguageTemplate(language, question);
        console.log('📝 Using default template for question:', question?.id);
      }

      setCode(codeToSet);
      setOutput('');
      setCodeInitialized(true);
      
      // Notify parent component of initial code
      if (onCodeChange && codeToSet) {
        onCodeChange(codeToSet);
        console.log('📤 Notified parent of initial code:', codeToSet.length, 'chars');
      }
      
      // Show restoration message if code was restored
      if (shouldRestoreFromSession && codeToSet.trim() !== getLanguageTemplate(language, question).trim()) {
        console.log('✅ Code successfully restored from previous session');
      }
      
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
    };

    initializeCode();
  }, [language, question?.id, needsRecovery, recoveryData, currentSession?.id, currentSession?.code_snapshots]);

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

  // Highlight code when new hint arrives
  useEffect(() => {
    if (!latestHint || !code || !editorRef.current) return;
    
    console.log('🎨 New hint received, analyzing for code references...');
    
    // Small delay to ensure editor is ready
    setTimeout(() => {
      const snippets = extractCodeSnippets(latestHint);
      if (snippets.length > 0) {
        console.log('🎨 Found code snippets in hint:', snippets);
        highlightCodeLines(snippets);
      } else {
        console.log('🎨 No code snippets found in hint');
      }
    }, 100);
  }, [latestHint]);

  // Clear highlights when code changes (user is editing)
  useEffect(() => {
    // Only clear if user is actively editing (not on initial load)
    if (codeInitialized && decorationsRef.current.length > 0) {
      console.log('🎨 Code changed, clearing highlights...');
      clearHighlights();
    }
  }, [code, codeInitialized]);

  // Code snapshots are now only saved on Run or Submit actions (removed auto-save)
  // This reduces unnecessary database operations and API calls

  const handleRunCode = async () => {
    if (!question?.sample_test_cases || question.sample_test_cases.length === 0) {
      setSubmissionResult({
        success: false,
        status: 'Error',
        passed_count: 0,
        total_count: 0,
        error_message: 'No test cases available for this question.'
      });
      setActiveTab('result');
      return;
    }

    if (!code.trim()) {
      setSubmissionResult({
        success: false,
        status: 'Error',
        passed_count: 0,
        total_count: 0,
        error_message: 'Please write some code before running.'
      });
      setActiveTab('result');
      return;
    }

    setIsRunning(true);
    setSubmissionResult(null);
    setActiveTab('result');
    
    try {
      // Use only sample test cases for running (not full submission)
      const testCases = question.sample_test_cases.map(tc => ({
        input: tc.input,
        expected_output: tc.expected_output || tc.output
      }));

      const runData = {
        code: code,
        language: language,
        test_cases: testCases,
        question_id: question.id,
        question_title: question.title,
        problem_statement: question.description || question.problem_statement_text || question.problem_statement || ''
      };

      const result = await runCodeHook.execute(runData);
      
      // Set the result for the new component
      setSubmissionResult(result);
      
      // Save code snapshot on Run action
      if (currentSession && trackCodeChange) {
        try {
          await trackCodeChange(code, language);
        } catch (error) {
          console.warn('Failed to save code snapshot:', error);
        }
      }
      
      // Save last run state to session
      if (currentSession?.sessionId) {
        try {
          await axiosInstance.post(`/sessions/${currentSession.sessionId}/last-run`, {
            code,
            language,
            status: result.status,
            passed_count: result.passed_count,
            total_count: result.total_count,
            runtime_ms: result.runtime_ms,
            error_message: result.error_message,
            test_results: result.test_results
          });
          console.log('💾 Saved last run state to session');
        } catch (error) {
          console.warn('Failed to save last run state:', error);
        }
      }
      
      // Track code execution event
      if (currentSession) {
        try {
          behaviorTracking.recordBehaviorEvent?.('CODE_EXECUTION', { 
            action: 'run',
            status: result.status,
            passed: result.passed_count,
            total: result.total_count
          });
        } catch (error) {
          console.warn('Failed to track code execution:', error);
        }
      }
      
    } catch (error) {
      console.error('Code execution failed:', error);
      setSubmissionResult({
        success: false,
        status: 'Execution Failed',
        passed_count: 0,
        total_count: question.sample_test_cases.length,
        error_message: error.response?.data?.detail || error.message || 'Unknown error occurred. Please check your code and try again.'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!question?.id || !code.trim()) {
      setSubmissionResult({
        success: false,
        status: 'Error',
        passed_count: 0,
        total_count: 0,
        error_message: 'Please write some code before submitting.'
      });
      setActiveTab('result');
      return;
    }

    if (!question?.sample_test_cases || question.sample_test_cases.length === 0) {
      setSubmissionResult({
        success: false,
        status: 'Error',
        passed_count: 0,
        total_count: 0,
        error_message: 'No test cases available for this question.'
      });
      setActiveTab('result');
      return;
    }

    setIsRunning(true);
    setSubmissionResult(null);
    setActiveTab('result');
    
    try {
      // Prepare test cases from question data
      const testCases = question.sample_test_cases.map(tc => ({
        input: tc.input,
        expected_output: tc.expected_output || tc.output
      }));

      const submissionData = {
        code: code,
        language: language,
        question_key: String(question.id),
        question_title: question.title || 'Coding Challenge',
        test_cases: testCases,
        session_id: currentSession?.sessionId || currentSession?.id,
        roadmap_id: question.course || null,
        difficulty: question.difficulty || question.leetcode_difficulty || 'Medium',
        function_name: null  // Auto-detect from code
      };

      const result = await submitSolutionHook.execute(submissionData);
      
      // Set the result for the new component
      setSubmissionResult(result);
      
      // Save code snapshot on Submit action
      if (currentSession && trackCodeChange) {
        try {
          await trackCodeChange(code, language);
        } catch (error) {
          console.warn('Failed to save code snapshot:', error);
        }
      }
      
      // Track submission event
      if (currentSession) {
        try {
          behaviorTracking.recordBehaviorEvent?.('CODE_SUBMISSION', { 
            action: 'submit',
            status: result.success ? 'accepted' : 'failed'
          });
        } catch (error) {
          console.warn('Failed to track submission:', error);
        }
      }

      // Show success modal if submission is accepted
      if (result.success) {
        setSuccessModalData({
          questionTitle: question.title,
          runtime: result.runtime_ms,
          runtimePercentile: result.runtime_percentile,
          memoryKb: result.memory_kb,
          memoryPercentile: result.memory_percentile
        });
        setShowSuccessModal(true);
        
        // No need to sync progress to localStorage anymore
        // Backend is the source of truth and will be fetched on next roadmap page load
        if (question.course) {
          console.log('✅ Roadmap progress updated in backend for course:', question.course);
        }
      }
    } catch (error) {
      console.error('Submission failed:', error);
      setSubmissionResult({
        success: false,
        status: 'Submission Failed',
        passed_count: 0,
        total_count: question.sample_test_cases.length,
        error_message: error.response?.data?.detail || error.message || 'Network error occurred. Please check your connection and try again.'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setCode(getLanguageTemplate(language, question));
    setOutput('');
    setSubmissionResult(null);
  };

  const handleContinueCoding = () => {
    setShowSuccessModal(false);
    setSuccessModalData(null);
    // User can continue coding - modal just closes
  };

  const handleEndSessionFromSuccess = async () => {
    setShowSuccessModal(false);
    setSuccessModalData(null);
    
    // End the coding session
    try {
      await endSession('problem_completed', {
        reason: 'User completed problem and chose to end session',
        questionId: question?.id,
        questionTitle: question?.title
      });
      console.log('Session ended successfully after problem completion');
    } catch (error) {
      console.error('Failed to end session:', error);
    }
    
    // Navigate back to appropriate page
    const roadmapId = question?.course || location.pathname.match(/\/challenge\/([^\/]+)\//)?.[1];
    if (roadmapId) {
      navigate(`/roadmap/${roadmapId}`);
    } else {
      navigate('/dashboard');
    }
  };

  const handleRunSingleTest = async (testCase, index) => {
    if (!code.trim()) {
      setSubmissionResult({
        success: false,
        status: 'Error',
        passed_count: 0,
        total_count: 1,
        error_message: 'Please write some code before running.'
      });
      setActiveTab('result');
      return;
    }

    setRunningTestIndex(index);
    setSubmissionResult(null);
    setActiveTab('result');
    
    try {
      const runData = {
        code: code,
        language: language,
        test_cases: [{
          input: testCase.input,
          expected_output: testCase.expected_output || testCase.output
        }],
        question_id: question.id
      };

      const result = await runCodeHook.execute(runData);
      setSubmissionResult(result);
    } catch (error) {
      console.error('Test execution failed:', error);
      setSubmissionResult({
        success: false,
        status: 'Test Execution Failed',
        passed_count: 0,
        total_count: 1,
        error_message: error.response?.data?.detail || error.message || 'Unknown error occurred'
      });
    } finally {
      setRunningTestIndex(null);
    }
  };

  const handleAddCustomTestCase = () => {
    setCustomTestCases([
      ...customTestCases,
      { input: '', expected_output: '', custom: true }
    ]);
  };

  const handleUpdateCustomTestCase = (index, field, value) => {
    const updated = [...customTestCases];
    updated[index][field] = value;
    setCustomTestCases(updated);
  };

  const handleRemoveCustomTestCase = (index) => {
    setCustomTestCases(customTestCases.filter((_, i) => i !== index));
  };

  const tabs = [
    { id: 'code', label: 'Code' },
    { id: 'testcases', label: 'Test Cases' },
    { id: 'result', label: 'Result' },
    { id: 'submissions', label: 'Submissions' }
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
            <LoadingButton
              onClick={handleRunCode}
              isLoading={isRunning}
              loadingText="Running..."
              variant="ghost"
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700"
            >
              Run
            </LoadingButton>
            <LoadingButton
              onClick={handleSubmit}
              isLoading={isApiLoading}
              loadingText="Submitting..."
              variant="ghost"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700"
            >
              Submit
            </LoadingButton>
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
                    <LoadingSpinner size="lg" variant="accent" text="Loading editor..." />
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
              {/* Sample Test Cases */}
              {(question?.sample_test_cases || question?.examples || []).map((example, index) => (
                <div key={`sample-${index}`} className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-zinc-100 font-medium">
                      Test Case {index + 1}
                      {example.example_number && <span className="text-xs text-zinc-400 ml-2">(Example {example.example_number})</span>}
                    </h5>
                    <LoadingButton
                      onClick={() => handleRunSingleTest(example, index)}
                      isLoading={runningTestIndex === index}
                      loadingText="Running..."
                      variant="ghost"
                      size="xs"
                      className="text-xs text-blue-400 hover:text-blue-300 px-3 py-1"
                    >
                      Run Test
                    </LoadingButton>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-zinc-400">Input:</span>
                      <pre className="text-zinc-200 bg-zinc-900 p-2 rounded mt-1 overflow-x-auto font-mono text-xs">
                        {example.input}
                      </pre>
                    </div>
                    
                    <div>
                      <span className="text-zinc-400">Expected Output:</span>
                      <pre className="text-zinc-200 bg-zinc-900 p-2 rounded mt-1 overflow-x-auto font-mono text-xs">
                        {example.expected_output || example.output}
                      </pre>
                    </div>
                    
                    {example.explanation && (
                      <div>
                        <span className="text-zinc-400">Explanation:</span>
                        <p className="text-zinc-300 mt-1 text-xs">{example.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Custom Test Cases */}
              {customTestCases.map((testCase, index) => (
                <div key={`custom-${index}`} className="bg-zinc-800/50 rounded-lg p-4 border border-blue-700/50">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-zinc-100 font-medium">
                      Custom Test Case {index + 1}
                    </h5>
                    <div className="flex items-center space-x-2">
                      <LoadingButton
                        onClick={() => handleRunSingleTest(testCase, (question?.sample_test_cases?.length || 0) + index)}
                        isLoading={runningTestIndex === ((question?.sample_test_cases?.length || 0) + index)}
                        loadingText="Running..."
                        variant="ghost"
                        size="xs"
                        className="text-xs text-blue-400 hover:text-blue-300 px-3 py-1"
                      >
                        Run Test
                      </LoadingButton>
                      <button
                        onClick={() => handleRemoveCustomTestCase(index)}
                        className="text-xs text-red-400 hover:text-red-300 px-2 py-1"
                      >
                        Remove
                </button>
              </div>
            </div>
                  
                  <div className="space-y-2 text-sm">
                  <div>
                      <label className="text-zinc-400 block mb-1">Input:</label>
                      <textarea
                        value={testCase.input}
                        onChange={(e) => handleUpdateCustomTestCase(index, 'input', e.target.value)}
                        placeholder='e.g., x = 123 or nums = [1,2,3]'
                        className="w-full bg-zinc-900 text-zinc-200 p-2 rounded border border-zinc-600 focus:border-blue-500 focus:outline-none font-mono text-xs"
                        rows={2}
                      />
              </div>
              
                  <div>
                      <label className="text-zinc-400 block mb-1">Expected Output:</label>
                      <textarea
                        value={testCase.expected_output}
                        onChange={(e) => handleUpdateCustomTestCase(index, 'expected_output', e.target.value)}
                        placeholder='e.g., 321 or [3,2,1]'
                        className="w-full bg-zinc-900 text-zinc-200 p-2 rounded border border-zinc-600 focus:border-blue-500 focus:outline-none font-mono text-xs"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Add Custom Test Case Button */}
              <div className="border-2 border-dashed border-zinc-600 rounded-lg p-4 text-center hover:border-zinc-500 transition-colors">
                <button
                  onClick={handleAddCustomTestCase}
                  className="text-zinc-400 hover:text-zinc-200 transition-colors duration-200 w-full"
                >
                  <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Custom Test Case
                </button>
              </div>
            </div>
          </div>
        )}


        {activeTab === 'result' && (
          <div className="flex-1 overflow-hidden">
            <SubmissionResult 
              result={submissionResult} 
              isRunning={isRunning || runningTestIndex !== null}
              questionId={question?.id}
            />
              </div>
            )}

        {activeTab === 'submissions' && (
          <div className="flex-1 overflow-hidden">
            <SubmissionHistory questionKey={question?.id} />
          </div>
        )}
      </div>

      {/* Behavior Feedback Component - Development Only */}
      {showBehaviorFeedback && (
        <BehaviorFeedback
          isVisible={showBehaviorFeedback}
          analyzer={behaviorTracking.analyzer}
          behaviorTracker={behaviorTracking.behaviorTracker}
          liveMetrics={behaviorTracking.liveMetrics}
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

      {/* Submission Success Modal */}
      <SubmissionSuccessModal
        isVisible={showSuccessModal}
        onContinue={handleContinueCoding}
        onEndSession={handleEndSessionFromSuccess}
        questionTitle={successModalData?.questionTitle}
        runtime={successModalData?.runtime}
        runtimePercentile={successModalData?.runtimePercentile}
        memoryKb={successModalData?.memoryKb}
        memoryPercentile={successModalData?.memoryPercentile}
      />
    </div>
  );
};

export default CodeEditor;
