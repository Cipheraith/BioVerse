/**
 * Ollama Configuration and Model Management
 * Optimized model selection and configuration for healthcare AI
 */

const ollamaConfig = {
  // Ollama server configuration
  server: {
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    timeout: 60000, // 1 minute timeout
    retries: 3,
    retryDelay: 1000 // 1 second
  },

  // Recommended models for different healthcare tasks
  models: {
    // Primary medical model for diagnosis and analysis
    medical: {
      name: 'meditron:7b',
      description: 'Specialized medical model for clinical tasks',
      use_cases: ['diagnosis', 'medical_analysis', 'clinical_reasoning'],
      parameters: {
        temperature: 0.2, // Low temperature for medical accuracy
        top_p: 0.9,
        max_tokens: 1000,
        stop: ['Human:', 'Assistant:']
      }
    },

    // Conversational model for patient interactions
    chat: {
      name: 'neural-chat:7b',
      description: 'Empathetic conversational model for patient support',
      use_cases: ['patient_chat', 'health_education', 'support'],
      parameters: {
        temperature: 0.6, // Moderate temperature for natural conversation
        top_p: 0.9,
        max_tokens: 800,
        stop: []
      }
    },

    // Large model for complex reasoning
    reasoning: {
      name: 'llama3.1:70b',
      description: 'Large model for complex medical reasoning and analysis',
      use_cases: ['complex_diagnosis', 'research_analysis', 'trend_analysis'],
      parameters: {
        temperature: 0.3,
        top_p: 0.95,
        max_tokens: 1500,
        stop: []
      }
    },

    // Code generation for health data analysis
    code: {
      name: 'deepseek-coder:6.7b',
      description: 'Code generation for health data analysis and visualization',
      use_cases: ['data_analysis', 'visualization', 'pattern_detection'],
      parameters: {
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 1200,
        stop: ['```']
      }
    },

    // Embedding model for semantic search
    embedding: {
      name: 'nomic-embed-text',
      description: 'Text embedding model for semantic search and similarity',
      use_cases: ['search', 'similarity', 'clustering'],
      parameters: {}
    },

    // Fast model for quick responses
    fast: {
      name: 'mistral:7b',
      description: 'Fast model for quick health queries and basic analysis',
      use_cases: ['quick_queries', 'basic_analysis', 'triage'],
      parameters: {
        temperature: 0.4,
        top_p: 0.9,
        max_tokens: 500,
        stop: []
      }
    }
  },

  // System prompts for different healthcare contexts
  systemPrompts: {
    medical_diagnosis: `You are an expert medical AI assistant specializing in diagnostic support for healthcare professionals. 
    Your role is to:
    - Analyze patient symptoms and medical history
    - Suggest possible differential diagnoses with confidence levels
    - Recommend appropriate diagnostic tests and examinations
    - Identify red flags and urgent conditions
    - Provide evidence-based medical insights
    
    IMPORTANT: Always emphasize that your analysis is for informational purposes only and should not replace professional medical judgment. Include confidence levels (1-10) for all diagnoses and recommendations.`,

    patient_chat: `You are Luma, BioVerse's friendly and knowledgeable health AI assistant. Your role is to:
    - Provide helpful, accurate health information in an empathetic manner
    - Answer health-related questions clearly and supportively
    - Encourage healthy behaviors and lifestyle choices
    - Guide users to appropriate healthcare resources when needed
    - Maintain patient privacy and confidentiality
    
    IMPORTANT: Always remind users to consult healthcare professionals for serious health concerns. Be supportive but never provide specific medical advice or diagnoses.`,

    health_education: `You are a health education specialist AI that creates personalized, easy-to-understand educational content. Your role is to:
    - Explain health topics in accessible language
    - Adapt content complexity to the user's background and needs
    - Provide practical, actionable health information
    - Include relevant examples and analogies
    - Encourage preventive care and healthy lifestyle choices
    
    Focus on evidence-based information and always encourage users to discuss important health decisions with their healthcare providers.`,

    data_analysis: `You are a health data analysis AI that generates Python code and insights for healthcare data. Your role is to:
    - Analyze health data patterns and trends
    - Generate appropriate visualizations for health metrics
    - Identify statistical correlations and anomalies
    - Provide clear interpretations of data findings
    - Suggest actionable insights based on data patterns
    
    Always include proper error handling, data validation, and clear documentation in your code. Focus on clinically relevant insights.`,

    document_analysis: `You are a medical document analysis AI that extracts and summarizes key information from healthcare documents. Your role is to:
    - Extract key medical information from various document types
    - Identify important findings, diagnoses, and recommendations
    - Summarize complex medical information clearly
    - Flag critical or urgent information
    - Organize information in a structured, accessible format
    
    Maintain accuracy and highlight any uncertainties in the document content.`
  },

  // Model selection logic based on task type
  getModelForTask: (taskType) => {
    const taskModelMap = {
      'medical_diagnosis': 'medical',
      'symptom_analysis': 'medical',
      'health_predictions': 'reasoning',
      'patient_chat': 'chat',
      'health_education': 'chat',
      'document_analysis': 'medical',
      'data_analysis': 'code',
      'quick_query': 'fast',
      'trend_analysis': 'reasoning',
      'recommendations': 'medical'
    };

    return ollamaConfig.models[taskModelMap[taskType]] || ollamaConfig.models.fast;
  },

  // Performance optimization settings
  performance: {
    // Cache frequently used model responses
    enableResponseCache: true,
    responseCacheSize: 1000,
    responseCacheTTL: 300000, // 5 minutes

    // Batch processing settings
    enableBatchProcessing: true,
    maxBatchSize: 10,
    batchTimeout: 30000, // 30 seconds

    // Model warming (keep models loaded)
    enableModelWarming: true,
    warmModels: ['medical', 'chat', 'fast'],

    // Request queuing for high load
    enableRequestQueue: true,
    maxQueueSize: 100,
    queueTimeout: 120000 // 2 minutes
  },

  // Health-specific validation rules
  validation: {
    // Maximum input lengths for different content types
    maxInputLengths: {
      chat_message: 2000,
      symptom_description: 5000,
      document_text: 50000,
      medical_history: 10000
    },

    // Content filtering for healthcare context
    contentFilters: {
      enableProfanityFilter: true,
      enableMedicalTermValidation: true,
      enablePrivacyProtection: true
    },

    // Required fields for different operations
    requiredFields: {
      symptom_analysis: ['symptoms', 'patientId'],
      medical_diagnosis: ['symptoms', 'patientData'],
      health_predictions: ['patientId', 'healthData'],
      document_analysis: ['documentText', 'documentType']
    }
  },

  // Monitoring and logging configuration
  monitoring: {
    enablePerformanceLogging: true,
    enableUsageTracking: true,
    enableErrorTracking: true,
    
    // Metrics to track
    trackMetrics: [
      'response_time',
      'token_usage',
      'model_accuracy',
      'user_satisfaction',
      'error_rate'
    ],

    // Alert thresholds
    alertThresholds: {
      response_time: 10000, // 10 seconds
      error_rate: 0.05, // 5%
      queue_size: 50
    }
  },

  // Security and privacy settings
  security: {
    // Enable request sanitization
    enableInputSanitization: true,
    
    // PII detection and masking
    enablePIIDetection: true,
    piiMaskingRules: {
      phone_numbers: true,
      email_addresses: true,
      social_security_numbers: true,
      medical_record_numbers: true
    },

    // Rate limiting per user/IP
    rateLimiting: {
      enabled: true,
      requestsPerMinute: 60,
      requestsPerHour: 1000,
      requestsPerDay: 10000
    },

    // Audit logging
    auditLogging: {
      enabled: true,
      logSensitiveData: false,
      retentionDays: 90
    }
  },

  // Fallback and error handling
  fallback: {
    // Use simpler model if primary model fails
    enableModelFallback: true,
    fallbackChain: ['medical', 'fast', 'chat'],

    // Default responses for common failures
    defaultResponses: {
      model_unavailable: "I'm temporarily unable to process your request. Please try again in a moment.",
      timeout: "Your request is taking longer than expected. Please try again with a shorter query.",
      rate_limited: "You've reached the request limit. Please wait a moment before trying again.",
      invalid_input: "I couldn't understand your request. Please rephrase and try again."
    },

    // Graceful degradation options
    degradationModes: {
      high_load: 'use_fast_model',
      model_error: 'use_fallback_model',
      timeout: 'return_cached_response'
    }
  }
};

module.exports = ollamaConfig;