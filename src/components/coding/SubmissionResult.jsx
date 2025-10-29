import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import OptimizationTips from './OptimizationTips';
import axiosInstance from '../../utils/axios';

/**
 * Professional submission result display component
 * Shows test results, performance metrics, and status in a clean, modern UI
 * Now includes code quality suggestions from Code Analysis Agent (fetched asynchronously)
 */
const SubmissionResult = ({ result, isRunning, questionId }) => {
  const [codeAnalysis, setCodeAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisFailed, setAnalysisFailed] = useState(false);
  // Poll for code analysis when result indicates analysis is pending
  useEffect(() => {
    if (result?.analysis_pending && result.success && questionId) {
      setAnalysisLoading(true);
      setAnalysisFailed(false);
      
      // Poll for analysis (with exponential backoff)
      let attempts = 0;
      const maxAttempts = 10; // Max 10 attempts (about 30 seconds total)
      
      const pollAnalysis = async () => {
        try {
          const response = await axiosInstance.get(`/submissions/analysis/${questionId}`);
          
          if (response.data.success && response.data.analysis) {
            setCodeAnalysis(response.data.analysis);
            setAnalysisLoading(false);
            console.log('✅ Code analysis fetched successfully');
          }
        } catch (error) {
          attempts++;
          
          if (attempts >= maxAttempts) {
            console.warn('⚠️ Max polling attempts reached for code analysis');
            setAnalysisLoading(false);
            setAnalysisFailed(true);
            return;
          }
          
          // If 404, analysis isn't ready yet - retry with exponential backoff
          if (error.response?.status === 404) {
            const delay = Math.min(1000 * Math.pow(1.5, attempts), 5000); // Cap at 5s
            setTimeout(pollAnalysis, delay);
          } else {
            console.error('Failed to fetch code analysis:', error);
            setAnalysisLoading(false);
            setAnalysisFailed(true);
          }
        }
      };
      
      // Start polling after a short delay (give backend time to start)
      setTimeout(pollAnalysis, 1500);
    }
  }, [result?.analysis_pending, result?.success, questionId]);

  if (isRunning) {
    return (
      <div className="h-full flex items-center justify-center bg-zinc-900">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-zinc-700 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-zinc-300 text-sm font-medium">Executing Code</p>
          <p className="text-zinc-500 text-xs mt-1">Running test cases...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="h-full flex items-center justify-center bg-zinc-900">
        <div className="text-center max-w-md px-6">
          <svg className="w-16 h-16 mx-auto mb-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-zinc-400 font-medium mb-2">No Results Yet</h3>
          <p className="text-zinc-500 text-sm">Run your code or submit your solution to see results here</p>
        </div>
      </div>
    );
  }

  const isSuccess = result.success;
  const isSubmission = result.submission_id !== undefined;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="h-full overflow-y-auto bg-zinc-900 p-6"
      >
        {/* Status Header */}
        <div className={`rounded-lg border-2 p-6 mb-6 ${
          isSuccess 
            ? 'bg-green-500/10 border-green-500/30' 
            : 'bg-red-500/10 border-red-500/30'
        }`}>
          <div className="flex items-start gap-4">
            {/* Status Icon */}
            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
              isSuccess ? 'bg-green-500/20' : 'bg-red-500/20'
            }`}>
              {isSuccess ? (
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>

            {/* Status Text */}
            <div className="flex-1">
              <h3 className={`text-lg font-semibold mb-1 ${
                isSuccess ? 'text-green-400' : 'text-red-400'
              }`}>
                {result.status}
              </h3>
              <p className="text-zinc-400 text-sm">
                {isSuccess 
                  ? isSubmission 
                    ? 'Your solution has been accepted and saved' 
                    : 'All test cases passed successfully'
                  : result.error_message || 'Some test cases failed'
                }
              </p>
            </div>

            {/* Test Count Badge */}
            <div className="flex-shrink-0 text-right">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                isSuccess ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
              }`}>
                <span className="font-bold">{result.passed_count}</span>
                <span className="text-zinc-400">/</span>
                <span>{result.total_count}</span>
              </div>
              <p className="text-zinc-500 text-xs mt-1">Tests Passed</p>
            </div>
          </div>
        </div>

        {/* Performance Metrics (for successful submissions) */}
        {isSuccess && isSubmission && (result.runtime_ms || result.memory_kb) && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Runtime */}
            {result.runtime_ms && (
              <div className="bg-zinc-800 rounded-lg border border-zinc-700 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-zinc-400 text-xs font-medium">Runtime</span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold text-zinc-100">{result.runtime_ms}</span>
                  <span className="text-sm text-zinc-400 mb-0.5">ms</span>
                </div>
                {result.runtime_percentile && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
                      <span>Beats {result.runtime_percentile.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-zinc-700 rounded-full h-1.5">
                      <div 
                        className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${result.runtime_percentile}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Memory */}
            {result.memory_kb && (
              <div className="bg-zinc-800 rounded-lg border border-zinc-700 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                  <span className="text-zinc-400 text-xs font-medium">Memory</span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold text-zinc-100">
                    {(result.memory_kb / 1024).toFixed(1)}
                  </span>
                  <span className="text-sm text-zinc-400 mb-0.5">MB</span>
                </div>
                {result.memory_percentile && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
                      <span>Beats {result.memory_percentile.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-zinc-700 rounded-full h-1.5">
                      <div 
                        className="bg-purple-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${result.memory_percentile}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Code Analysis / Optimization Tips */}
        {isSuccess && (
          <>
            {/* Show loading state while analysis is being generated */}
            {analysisLoading && !codeAnalysis && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-500/5 rounded-lg border border-blue-500/20 p-6 mb-6"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-blue-400 mb-1">
                      Analyzing Your Code...
                    </h3>
                    <p className="text-zinc-400 text-xs">
                      AI is reviewing your solution for optimization opportunities
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Show analysis when available */}
            {codeAnalysis && <OptimizationTips analysisData={codeAnalysis} />}
            
            {/* Show failure state if analysis failed */}
            {analysisFailed && !codeAnalysis && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-800/50 rounded-lg border border-zinc-700 p-4 mb-6"
              >
                <p className="text-zinc-500 text-sm">
                  💡 Code analysis is temporarily unavailable. Your code passed all tests!
                </p>
              </motion.div>
            )}
          </>
        )}

        {/* Test Results */}
        {result.test_results && result.test_results.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-zinc-300 mb-3">Test Case Results</h4>
            <div className="space-y-3">
              {result.test_results.map((test, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`rounded-lg border p-4 ${
                    test.passed 
                      ? 'bg-zinc-800/50 border-zinc-700' 
                      : 'bg-red-500/5 border-red-500/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Status Icon */}
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                      test.passed ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}>
                      {test.passed ? (
                        <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>

                    {/* Test Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-zinc-300">Test Case {index + 1}</span>
                        {test.runtime_ms && (
                          <span className="text-xs text-zinc-500">{test.runtime_ms}ms</span>
                        )}
                      </div>

                      <div className="space-y-2 text-xs">
                        {/* Input */}
                        <div>
                          <span className="text-zinc-500 font-medium">Input:</span>
                          <pre className="mt-1 p-2 bg-zinc-900 rounded border border-zinc-700 text-zinc-300 overflow-x-auto font-mono">
                            {test.input}
                          </pre>
                        </div>

                        {/* Expected vs Actual */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-zinc-500 font-medium">Expected:</span>
                            <pre className="mt-1 p-2 bg-zinc-900 rounded border border-zinc-700 text-zinc-300 overflow-x-auto font-mono">
                              {test.expected_output}
                            </pre>
                          </div>
                          <div>
                            <span className={`font-medium ${test.passed ? 'text-zinc-500' : 'text-red-400'}`}>
                              {test.passed ? 'Output:' : 'Got:'}
                            </span>
                            <pre className={`mt-1 p-2 bg-zinc-900 rounded border overflow-x-auto font-mono ${
                              test.passed 
                                ? 'border-zinc-700 text-zinc-300' 
                                : 'border-red-500/30 text-red-300'
                            }`}>
                              {test.actual_output || 'N/A'}
                            </pre>
                          </div>
                        </div>

                        {/* Error Message */}
                        {test.error && (
                          <div className="mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded">
                            <span className="text-red-400 font-medium">Error:</span>
                            <pre className="mt-1 text-red-300 text-xs whitespace-pre-wrap font-mono">
                              {test.error}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Error Message (for failed submissions without test results) */}
        {!isSuccess && result.error_message && (!result.test_results || result.test_results.length === 0) && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-red-400 mb-2">Error Details</h4>
            <pre className="text-xs text-red-300 whitespace-pre-wrap font-mono overflow-x-auto">
              {result.error_message}
            </pre>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default SubmissionResult;
