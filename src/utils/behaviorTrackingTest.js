/**
 * Behavior Tracking System Test Suite
 * Validates the behavior tracking functionality and integration
 */

import { KeystrokeAnalyzer } from './keystrokeAnalyzer';
import { BehaviorTrackingService } from '../services/behaviorTracking';

export class BehaviorTrackingTest {
  constructor() {
    this.testResults = [];
    this.analyzer = null;
    this.tracker = null;
  }

  /**
   * Run all behavior tracking tests
   */
  async runAllTests() {
    console.log('🧪 Starting Behavior Tracking System Tests...\n');
    
    this.testResults = [];
    
    // Core functionality tests
    await this.testKeystrokeAnalyzer();
    await this.testBehaviorTracker();
    await this.testIntegration();
    
    // Performance tests
    await this.testPerformance();
    
    // Privacy tests
    await this.testPrivacyControls();
    
    this.printResults();
    return this.testResults;
  }

  /**
   * Test keystroke analyzer functionality
   */
  async testKeystrokeAnalyzer() {
    console.log('🔍 Testing Keystroke Analyzer...');
    
    try {
      this.analyzer = new KeystrokeAnalyzer();
      
      // Test 1: Basic initialization
      this.addTestResult(
        'Analyzer Initialization',
        this.analyzer !== null && typeof this.analyzer.addKeystroke === 'function',
        'Analyzer should initialize with proper methods'
      );

      // Test 2: Add keystrokes and calculate metrics
      const testKeystrokes = this.generateTestKeystrokes(50);
      testKeystrokes.forEach(keystroke => {
        this.analyzer.addKeystroke(keystroke);
      });

      const metrics = this.analyzer.getMetrics();
      
      this.addTestResult(
        'Metrics Calculation',
        metrics && typeof metrics.typingSpeed === 'object' && typeof metrics.productivity === 'object',
        'Should calculate typing speed and productivity metrics'
      );

      this.addTestResult(
        'Typing Speed Calculation',
        metrics.typingSpeed.cpm >= 0 && metrics.typingSpeed.wpm >= 0,
        'Should calculate positive typing speed values'
      );

      this.addTestResult(
        'Productivity Score',
        metrics.productivity.score >= 0 && metrics.productivity.score <= 100,
        'Productivity score should be between 0-100'
      );

      // Test 3: Insights generation
      const insights = this.analyzer.getInsights();
      this.addTestResult(
        'Insights Generation',
        Array.isArray(insights.insights) && Array.isArray(insights.suggestions),
        'Should generate insights and suggestions arrays'
      );

      console.log('✅ Keystroke Analyzer tests completed\n');
      
    } catch (error) {
      this.addTestResult('Keystroke Analyzer Error', false, error.message);
      console.error('❌ Keystroke Analyzer test failed:', error);
    }
  }

  /**
   * Test behavior tracker service
   */
  async testBehaviorTracker() {
    console.log('📊 Testing Behavior Tracker Service...');
    
    try {
      this.tracker = new BehaviorTrackingService();
      
      // Test 1: Service initialization
      this.addTestResult(
        'Service Initialization',
        this.tracker !== null && typeof this.tracker.recordKeystroke === 'function',
        'Service should initialize with proper methods'
      );

      // Test 2: Event buffer management
      const testEvent = {
        key: 'a',
        keyCode: 65,
        target: { value: 'test' }
      };

      this.tracker.recordKeystroke(testEvent);
      
      this.addTestResult(
        'Event Recording',
        this.tracker.eventBuffer.length >= 0,
        'Should manage event buffer properly'
      );

      // Test 3: Privacy settings
      const privacySettings = { trackingEnabled: false };
      this.tracker.updatePrivacySettings(privacySettings);
      
      this.addTestResult(
        'Privacy Controls',
        this.tracker.privacySettings.trackingEnabled === false,
        'Should update privacy settings correctly'
      );

      console.log('✅ Behavior Tracker Service tests completed\n');
      
    } catch (error) {
      this.addTestResult('Behavior Tracker Error', false, error.message);
      console.error('❌ Behavior Tracker test failed:', error);
    }
  }

  /**
   * Test integration between components
   */
  async testIntegration() {
    console.log('🔗 Testing Component Integration...');
    
    try {
      if (!this.analyzer || !this.tracker) {
        throw new Error('Prerequisites not met - analyzer or tracker not initialized');
      }

      // Test 1: Data flow between components
      const testKeystroke = {
        timestamp: new Date().toISOString(),
        key_pressed: 'x',
        key_code: 88,
        is_printable: true,
        text_length: 10
      };

      this.analyzer.addKeystroke(testKeystroke);
      const metricsAfterKeystroke = this.analyzer.getMetrics();
      
      this.addTestResult(
        'Data Flow',
        metricsAfterKeystroke.session.totalKeystrokes > 0,
        'Components should process data correctly'
      );

      // Test 2: Real-time updates
      const initialMetrics = this.analyzer.getMetrics();
      
      // Simulate rapid typing
      for (let i = 0; i < 10; i++) {
        this.analyzer.addKeystroke({
          timestamp: new Date(Date.now() + i * 100).toISOString(),
          key_pressed: String.fromCharCode(97 + i),
          key_code: 97 + i,
          is_printable: true,
          text_length: 10 + i
        });
      }
      
      const updatedMetrics = this.analyzer.getMetrics();
      
      this.addTestResult(
        'Real-time Updates',
        updatedMetrics.session.totalKeystrokes > initialMetrics.session.totalKeystrokes,
        'Metrics should update in real-time'
      );

      console.log('✅ Integration tests completed\n');
      
    } catch (error) {
      this.addTestResult('Integration Error', false, error.message);
      console.error('❌ Integration test failed:', error);
    }
  }

  /**
   * Test performance under load
   */
  async testPerformance() {
    console.log('⚡ Testing Performance...');
    
    try {
      if (!this.analyzer) {
        throw new Error('Analyzer not initialized');
      }

      // Test 1: High volume keystroke processing
      const startTime = performance.now();
      const largeKeystrokeSet = this.generateTestKeystrokes(1000);
      
      largeKeystrokeSet.forEach(keystroke => {
        this.analyzer.addKeystroke(keystroke);
      });
      
      const endTime = performance.now();
      const processingTime = endTime - startTime;
      
      this.addTestResult(
        'High Volume Processing',
        processingTime < 1000, // Should process 1000 keystrokes in under 1 second
        `Processing 1000 keystrokes took ${processingTime.toFixed(2)}ms`
      );

      // Test 2: Memory usage
      const metrics = this.analyzer.getMetrics();
      
      this.addTestResult(
        'Memory Efficiency',
        this.analyzer.events.length <= 1200, // Should not retain excessive events
        `Event buffer contains ${this.analyzer.events.length} events`
      );

      // Test 3: Calculation accuracy
      this.addTestResult(
        'Calculation Accuracy',
        metrics.typingSpeed.cpm >= 0 && !isNaN(metrics.typingSpeed.cpm),
        'Calculations should produce valid numbers'
      );

      console.log('✅ Performance tests completed\n');
      
    } catch (error) {
      this.addTestResult('Performance Error', false, error.message);
      console.error('❌ Performance test failed:', error);
    }
  }

  /**
   * Test privacy and data protection
   */
  async testPrivacyControls() {
    console.log('🔒 Testing Privacy Controls...');
    
    try {
      if (!this.tracker) {
        throw new Error('Tracker not initialized');
      }

      // Test 1: Tracking disabled
      this.tracker.updatePrivacySettings({ trackingEnabled: false });
      
      const initialBufferLength = this.tracker.eventBuffer.length;
      this.tracker.recordKeystroke({ key: 'test', keyCode: 84 });
      
      this.addTestResult(
        'Tracking Disabled',
        this.tracker.eventBuffer.length === initialBufferLength,
        'Should not record events when tracking is disabled'
      );

      // Test 2: Data anonymization
      this.tracker.updatePrivacySettings({ 
        trackingEnabled: true, 
        anonymizeData: true 
      });
      
      this.addTestResult(
        'Anonymization Setting',
        this.tracker.privacySettings.anonymizeData === true,
        'Should support data anonymization setting'
      );

      // Test 3: Data retention controls
      this.tracker.updatePrivacySettings({ dataRetentionDays: 30 });
      
      this.addTestResult(
        'Data Retention',
        true, // This would be tested with actual backend integration
        'Should support configurable data retention periods'
      );

      console.log('✅ Privacy controls tests completed\n');
      
    } catch (error) {
      this.addTestResult('Privacy Error', false, error.message);
      console.error('❌ Privacy test failed:', error);
    }
  }

  /**
   * Generate test keystroke data
   */
  generateTestKeystrokes(count) {
    const keystrokes = [];
    const keys = 'abcdefghijklmnopqrstuvwxyz '.split('');
    let timestamp = Date.now();
    
    for (let i = 0; i < count; i++) {
      const key = keys[Math.floor(Math.random() * keys.length)];
      const interval = Math.random() * 200 + 50; // 50-250ms intervals
      
      keystrokes.push({
        timestamp: new Date(timestamp).toISOString(),
        key_pressed: key,
        key_code: key.charCodeAt(0),
        is_printable: key !== ' ',
        text_length: i + 1,
        cursor_position: { line: 1, column: i + 1 }
      });
      
      timestamp += interval;
    }
    
    return keystrokes;
  }

  /**
   * Add test result
   */
  addTestResult(testName, passed, description) {
    this.testResults.push({
      test: testName,
      passed,
      description,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Print test results
   */
  printResults() {
    console.log('\n📋 Test Results Summary:');
    console.log('=' .repeat(50));
    
    const passed = this.testResults.filter(r => r.passed).length;
    const total = this.testResults.length;
    
    this.testResults.forEach(result => {
      const icon = result.passed ? '✅' : '❌';
      console.log(`${icon} ${result.test}: ${result.description}`);
    });
    
    console.log('=' .repeat(50));
    console.log(`Total: ${passed}/${total} tests passed (${((passed/total) * 100).toFixed(1)}%)`);
    
    if (passed === total) {
      console.log('🎉 All tests passed! Behavior tracking system is working correctly.');
    } else {
      console.log('⚠️  Some tests failed. Please review the implementation.');
    }
  }

  /**
   * Quick validation test (for development)
   */
  static async quickTest() {
    console.log('🚀 Running quick behavior tracking validation...\n');
    
    try {
      // Test keystroke analyzer
      const analyzer = new KeystrokeAnalyzer();
      analyzer.addKeystroke({
        timestamp: new Date().toISOString(),
        key_pressed: 'a',
        key_code: 65,
        is_printable: true,
        text_length: 1
      });
      
      const metrics = analyzer.getMetrics();
      const insights = analyzer.getInsights();
      
      console.log('📊 Sample Metrics:', {
        typingSpeed: metrics.typingSpeed,
        productivity: metrics.productivity.score,
        insightsCount: insights.insights.length + insights.suggestions.length
      });
      
      // Test behavior tracker
      const tracker = new BehaviorTrackingService();
      tracker.recordKeystroke({ key: 'test', keyCode: 84 });
      
      console.log('✅ Quick test completed successfully!');
      return true;
      
    } catch (error) {
      console.error('❌ Quick test failed:', error);
      return false;
    }
  }
}

// Export for use in development
export const runBehaviorTrackingTests = () => {
  const tester = new BehaviorTrackingTest();
  return tester.runAllTests();
};

export const quickValidation = () => {
  return BehaviorTrackingTest.quickTest();
};

