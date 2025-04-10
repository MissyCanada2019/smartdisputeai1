/**
 * Unified AI Service for SmartDispute.ai
 * 
 * This module provides a unified interface for AI services with automatic fallback
 * between available providers (Anthropic Claude, OpenAI, and alternative services).
 */

import * as anthropicService from './anthropic.js';
import * as openaiService from './openai.js';
import * as puterService from './puter.js';
import 'dotenv/config';

// Service status tracking
const serviceStatus = {
  anthropic: {
    available: false,
    checkedAt: null,
    lastError: null
  },
  openai: {
    available: false,
    checkedAt: null,
    lastError: null
  },
  puter: {
    available: false,
    checkedAt: null,
    lastError: null
  }
};

// Configuration
const config = {
  defaultService: 'anthropic',
  fallbackOrder: ['openai', 'puter'],
  cacheExpiryMs: 5 * 60 * 1000, // 5 minutes
  retries: 2
};

/**
 * Helper to retry operations with exponential backoff
 */
async function withRetry(fn, retries = config.retries) {
  let lastError;
  
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      console.warn(`Attempt ${i + 1}/${retries} failed:`, error.message);
      lastError = error;
      
      // Wait before retrying (exponential backoff)
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError;
}

/**
 * Select a service to use based on availability
 */
async function selectService() {
  const services = [config.defaultService, ...config.fallbackOrder];
  const now = new Date();
  
  for (const serviceName of services) {
    const status = serviceStatus[serviceName];
    
    // Skip services we know are down (checked recently)
    if (status.checkedAt && !status.available && 
        (now.getTime() - status.checkedAt.getTime() < config.cacheExpiryMs)) {
      continue;
    }
    
    try {
      let available = false;
      switch (serviceName) {
        case 'anthropic':
          available = await anthropicService.testConnection();
          break;
        case 'openai':
          available = await openaiService.testConnection();
          break;
        case 'puter':
          available = await puterService.testConnection();
          break;
      }
      
      serviceStatus[serviceName] = {
        available,
        checkedAt: now,
        lastError: available ? null : 'Connection test failed'
      };
      
      if (available) {
        return serviceName;
      }
    } catch (error) {
      serviceStatus[serviceName] = {
        available: false,
        checkedAt: now,
        lastError: error.message
      };
    }
  }
  
  throw new Error('All AI services are unavailable');
}

/**
 * Execute a function with the selected service
 */
async function executeWithService(methodName, ...args) {
  return await withRetry(async () => {
    const serviceName = await selectService();
    let service;
    
    switch (serviceName) {
      case 'anthropic':
        service = anthropicService;
        break;
      case 'openai':
        service = openaiService;
        break;
      case 'puter':
        service = puterService;
        break;
      default:
        throw new Error(`Unknown service: ${serviceName}`);
    }
    
    if (!service[methodName]) {
      throw new Error(`Method ${methodName} not available in ${serviceName} service`);
    }
    
    try {
      const result = await service[methodName](...args);
      return {
        result,
        serviceName,
        modelName: serviceName === 'anthropic' ? 'claude-3-7-sonnet-20250219' : 
                   serviceName === 'openai' ? 'gpt-4o' : 
                   'alternative-ai',
        error: null
      };
    } catch (error) {
      serviceStatus[serviceName] = {
        available: false,
        checkedAt: new Date(),
        lastError: error.message
      };
      throw error;
    }
  });
}

/**
 * Get current status of all AI services
 */
export async function getStatus() {
  // Force a refresh of status for services that haven't been checked recently
  const now = new Date();
  
  const services = ['anthropic', 'openai', 'puter'];
  
  for (const serviceName of services) {
    const status = serviceStatus[serviceName];
    
    if (!status.checkedAt || 
        (now.getTime() - status.checkedAt.getTime() > config.cacheExpiryMs)) {
      try {
        let available = false;
        switch (serviceName) {
          case 'anthropic':
            available = await anthropicService.testConnection();
            break;
          case 'openai':
            available = await openaiService.testConnection();
            break;
          case 'puter':
            available = await puterService.testConnection();
            break;
        }
        
        serviceStatus[serviceName] = {
          available,
          checkedAt: now,
          lastError: available ? null : 'Connection test failed'
        };
      } catch (error) {
        serviceStatus[serviceName] = {
          available: false,
          checkedAt: now,
          lastError: error.message
        };
      }
    }
  }
  
  return {
    defaultService: config.defaultService,
    fallbackOrder: config.fallbackOrder,
    services: {
      anthropic: {
        available: serviceStatus.anthropic.available,
        lastChecked: serviceStatus.anthropic.checkedAt,
        error: serviceStatus.anthropic.lastError,
        model: 'claude-3-7-sonnet-20250219' // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
      },
      openai: {
        available: serviceStatus.openai.available,
        lastChecked: serviceStatus.openai.checkedAt,
        error: serviceStatus.openai.lastError,
        model: 'gpt-4o' // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      },
      puter: {
        available: serviceStatus.puter.available,
        lastChecked: serviceStatus.puter.checkedAt,
        error: serviceStatus.puter.lastError,
        model: 'alternative-ai'
      }
    },
    systemStatus: (serviceStatus.anthropic.available || 
                  serviceStatus.openai.available || 
                  serviceStatus.puter.available) ? "operational" : "down"
  };
}

/**
 * Analyze text using the best available AI service
 * 
 * @param {string} text - Text to analyze
 * @param {string} province - Province code (e.g., 'ON')
 * @returns {Promise<Object>} Analysis results with service info
 */
export async function analyzeText(text, province = 'ON') {
  return await executeWithService('analyzeText', text, province);
}

/**
 * Generate a response based on analysis data
 * 
 * @param {Object} analysisResult - Results from previous analysis
 * @param {string} originalText - Original document text
 * @param {Object} userInfo - User information
 * @param {string} province - Province code
 * @returns {Promise<Object>} Generated response with service info
 */
export async function generateResponse(analysisResult, originalText, userInfo = {}, province = 'ON') {
  return await executeWithService('generateResponse', analysisResult, originalText, userInfo, province);
}

/**
 * Simple chat interface with AI
 * 
 * @param {string} message - User's message
 * @returns {Promise<Object>} AI response with service info
 */
export async function chat(message) {
  return await executeWithService('chat', message);
}

/**
 * Analyze an image using the best available service with vision capabilities
 * 
 * @param {string} base64Image - Base64-encoded image data
 * @returns {Promise<Object>} Analysis results with service info
 */
export async function analyzeImage(base64Image) {
  // Only OpenAI supports image analysis in our implementation
  try {
    const result = await openaiService.analyzeImage(base64Image);
    return {
      result,
      serviceName: 'openai',
      modelName: 'gpt-4o',
      error: null
    };
  } catch (error) {
    // Handle image analysis errors
    serviceStatus.openai = {
      available: false,
      checkedAt: new Date(),
      lastError: error.message
    };
    
    throw new Error(`Image analysis failed: ${error.message}`);
  }
}

export default {
  getStatus,
  analyzeText,
  generateResponse,
  chat,
  analyzeImage
};