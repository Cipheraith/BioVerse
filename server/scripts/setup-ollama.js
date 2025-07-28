#!/usr/bin/env node

/**
 * Ollama Setup Script for BioVerse
 * Automatically downloads and configures recommended AI models
 */

const axios = require('axios');
const readline = require('readline');
const { spawn } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

class OllamaSetup {
  constructor() {
    this.baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.recommendedModels = [
      {
        name: 'llama3.1:8b',
        description: 'General purpose model for basic health queries',
        size: '4.7GB',
        priority: 'high',
        use_case: 'General health assistance and basic medical queries'
      },
      {
        name: 'neural-chat:7b',
        description: 'Conversational model optimized for patient interactions',
        size: '4.1GB',
        priority: 'high',
        use_case: 'Patient chatbot (Luma) and health education'
      },
      {
        name: 'mistral:7b',
        description: 'Fast model for quick responses and triage',
        size: '4.1GB',
        priority: 'high',
        use_case: 'Quick health queries and symptom triage'
      },
      {
        name: 'deepseek-coder:6.7b',
        description: 'Code generation for health data analysis',
        size: '3.8GB',
        priority: 'medium',
        use_case: 'Health data analysis and visualization code generation'
      },
      {
        name: 'nomic-embed-text',
        description: 'Text embedding model for semantic search',
        size: '274MB',
        priority: 'high',
        use_case: 'Medical document search and similarity matching'
      },
      {
        name: 'meditron:7b',
        description: 'Specialized medical model (if available)',
        size: '4.1GB',
        priority: 'medium',
        use_case: 'Advanced medical diagnosis and clinical reasoning'
      },
      {
        name: 'llama3.1:70b',
        description: 'Large model for complex medical reasoning',
        size: '40GB',
        priority: 'low',
        use_case: 'Complex medical analysis and research (requires 64GB+ RAM)'
      }
    ];
  }

  async checkOllamaStatus() {
    try {
      console.log('🔍 Checking Ollama server status...');
      const response = await axios.get(`${this.baseUrl}/api/tags`, { timeout: 5000 });
      console.log('✅ Ollama server is running');
      return true;
    } catch (error) {
      console.log('❌ Ollama server is not running or not accessible');
      console.log('Please make sure Ollama is installed and running on', this.baseUrl);
      return false;
    }
  }

  async getInstalledModels() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`);
      return response.data.models || [];
    } catch (error) {
      console.error('Error getting installed models:', error.message);
      return [];
    }
  }

  async pullModel(modelName) {
    return new Promise((resolve, reject) => {
      console.log(`📥 Pulling model: ${modelName}`);
      console.log('This may take several minutes depending on model size and internet speed...');
      
      const startTime = Date.now();
      let lastProgress = 0;

      const pullProcess = spawn('ollama', ['pull', modelName], {
        stdio: ['inherit', 'pipe', 'pipe']
      });

      pullProcess.stdout.on('data', (data) => {
        const output = data.toString();
        // Parse progress if available
        const progressMatch = output.match(/(\d+)%/);
        if (progressMatch) {
          const progress = parseInt(progressMatch[1]);
          if (progress > lastProgress + 10) { // Show progress every 10%
            console.log(`   Progress: ${progress}%`);
            lastProgress = progress;
          }
        }
      });

      pullProcess.stderr.on('data', (data) => {
        const error = data.toString();
        if (!error.includes('pulling')) { // Ignore normal pulling messages
          console.error(`   Error: ${error}`);
        }
      });

      pullProcess.on('close', (code) => {
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        if (code === 0) {
          console.log(`✅ Successfully pulled ${modelName} (${duration}s)`);
          resolve();
        } else {
          console.log(`❌ Failed to pull ${modelName} (exit code: ${code})`);
          reject(new Error(`Failed to pull model: ${modelName}`));
        }
      });
    });
  }

  async testModel(modelName) {
    try {
      console.log(`🧪 Testing model: ${modelName}`);
      
      const testPrompt = "What is the normal human body temperature?";
      const response = await axios.post(`${this.baseUrl}/api/generate`, {
        model: modelName,
        prompt: testPrompt,
        stream: false,
        options: {
          temperature: 0.3,
          max_tokens: 100
        }
      }, { timeout: 30000 });

      if (response.data && response.data.response) {
        console.log(`✅ Model ${modelName} is working correctly`);
        console.log(`   Test response: ${response.data.response.substring(0, 100)}...`);
        return true;
      } else {
        console.log(`❌ Model ${modelName} test failed - no response`);
        return false;
      }
    } catch (error) {
      console.log(`❌ Model ${modelName} test failed:`, error.message);
      return false;
    }
  }

  async promptUserChoice(message, choices) {
    return new Promise((resolve) => {
      console.log(message);
      choices.forEach((choice, index) => {
        console.log(`${index + 1}. ${choice}`);
      });
      
      rl.question('Enter your choice (number): ', (answer) => {
        const choice = parseInt(answer) - 1;
        if (choice >= 0 && choice < choices.length) {
          resolve(choice);
        } else {
          console.log('Invalid choice, please try again.');
          this.promptUserChoice(message, choices).then(resolve);
        }
      });
    });
  }

  async promptYesNo(question) {
    return new Promise((resolve) => {
      rl.question(`${question} (y/n): `, (answer) => {
        const response = answer.toLowerCase().trim();
        if (response === 'y' || response === 'yes') {
          resolve(true);
        } else if (response === 'n' || response === 'no') {
          resolve(false);
        } else {
          console.log('Please answer y or n');
          this.promptYesNo(question).then(resolve);
        }
      });
    });
  }

  displaySystemRequirements() {
    console.log('\n📋 System Requirements for BioVerse AI Models:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Minimum Requirements:');
    console.log('  • RAM: 8GB (for basic models)');
    console.log('  • Storage: 20GB free space');
    console.log('  • CPU: 4+ cores recommended');
    console.log('');
    console.log('Recommended Requirements:');
    console.log('  • RAM: 16GB+ (for better performance)');
    console.log('  • Storage: 50GB+ free space');
    console.log('  • CPU: 8+ cores');
    console.log('  • GPU: Optional but improves performance');
    console.log('');
    console.log('For Large Models (70B):');
    console.log('  • RAM: 64GB+ required');
    console.log('  • Storage: 100GB+ free space');
    console.log('  • High-end CPU or GPU acceleration');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  async run() {
    console.log('🏥 BioVerse AI Setup - Ollama Model Configuration');
    console.log('═══════════════════════════════════════════════════');
    console.log('This script will help you set up AI models for BioVerse healthcare platform.\n');

    // Check system requirements
    this.displaySystemRequirements();
    
    const continueSetup = await this.promptYesNo('Do you want to continue with the setup?');
    if (!continueSetup) {
      console.log('Setup cancelled.');
      rl.close();
      return;
    }

    // Check Ollama status
    const ollamaRunning = await this.checkOllamaStatus();
    if (!ollamaRunning) {
      console.log('\n📖 To install Ollama:');
      console.log('  • Visit: https://ollama.ai');
      console.log('  • Or run: curl -fsSL https://ollama.ai/install.sh | sh');
      console.log('  • Then start with: ollama serve');
      rl.close();
      return;
    }

    // Get currently installed models
    const installedModels = await this.getInstalledModels();
    const installedModelNames = installedModels.map(m => m.name);

    console.log('\n📦 Currently installed models:');
    if (installedModelNames.length === 0) {
      console.log('  No models installed');
    } else {
      installedModelNames.forEach(name => console.log(`  ✅ ${name}`));
    }

    // Show recommended models
    console.log('\n🎯 Recommended models for BioVerse:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    this.recommendedModels.forEach((model, index) => {
      const installed = installedModelNames.some(name => name.startsWith(model.name.split(':')[0]));
      const status = installed ? '✅ Installed' : '⏳ Not installed';
      const priority = model.priority === 'high' ? '🔴 High' : 
                      model.priority === 'medium' ? '🟡 Medium' : '🟢 Low';
      
      console.log(`${index + 1}. ${model.name}`);
      console.log(`   Status: ${status} | Priority: ${priority} | Size: ${model.size}`);
      console.log(`   Use case: ${model.use_case}`);
      console.log(`   Description: ${model.description}\n`);
    });

    // Installation options
    const installChoice = await this.promptUserChoice(
      '\n🚀 What would you like to do?',
      [
        'Install all high-priority models (recommended)',
        'Install specific models (custom selection)',
        'Install all models (requires significant storage)',
        'Test existing models only',
        'Exit setup'
      ]
    );

    let modelsToInstall = [];

    switch (installChoice) {
      case 0: // High priority models
        modelsToInstall = this.recommendedModels
          .filter(m => m.priority === 'high' && !installedModelNames.some(name => name.startsWith(m.name.split(':')[0])));
        break;
        
      case 1: // Custom selection
        console.log('\n📋 Select models to install:');
        for (const model of this.recommendedModels) {
          const installed = installedModelNames.some(name => name.startsWith(model.name.split(':')[0]));
          if (!installed) {
            const install = await this.promptYesNo(`Install ${model.name} (${model.size})?`);
            if (install) {
              modelsToInstall.push(model);
            }
          }
        }
        break;
        
      case 2: // All models
        modelsToInstall = this.recommendedModels
          .filter(m => !installedModelNames.some(name => name.startsWith(m.name.split(':')[0])));
        break;
        
      case 3: // Test only
        await this.testExistingModels(installedModelNames);
        rl.close();
        return;
        
      case 4: // Exit
        console.log('Setup cancelled.');
        rl.close();
        return;
    }

    // Install selected models
    if (modelsToInstall.length > 0) {
      console.log(`\n📥 Installing ${modelsToInstall.length} models...`);
      
      const totalSize = modelsToInstall.reduce((sum, model) => {
        const size = parseFloat(model.size.replace('GB', '').replace('MB', '')) * 
                    (model.size.includes('GB') ? 1 : 0.001);
        return sum + size;
      }, 0);
      
      console.log(`Total download size: ~${totalSize.toFixed(1)}GB`);
      
      const confirmInstall = await this.promptYesNo('Continue with installation?');
      if (!confirmInstall) {
        console.log('Installation cancelled.');
        rl.close();
        return;
      }

      for (const model of modelsToInstall) {
        try {
          await this.pullModel(model.name);
          await this.testModel(model.name);
        } catch (error) {
          console.log(`⚠️  Skipping ${model.name} due to error: ${error.message}`);
        }
      }
    }

    // Final status
    console.log('\n🎉 Setup Complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const finalModels = await this.getInstalledModels();
    console.log(`✅ Total models installed: ${finalModels.length}`);
    
    console.log('\n🚀 Next Steps:');
    console.log('1. Update your .env file with Ollama configuration:');
    console.log('   OLLAMA_BASE_URL=http://localhost:11434');
    console.log('   OLLAMA_DEFAULT_MODEL=llama3.1:8b');
    console.log('   OLLAMA_MEDICAL_MODEL=meditron:7b');
    console.log('   OLLAMA_EMBEDDING_MODEL=nomic-embed-text');
    console.log('');
    console.log('2. Restart your BioVerse server to use the new AI models');
    console.log('3. Test the AI features in your application');
    console.log('');
    console.log('📚 For more information, visit: https://ollama.ai/library');
    
    rl.close();
  }

  async testExistingModels(modelNames) {
    console.log('\n🧪 Testing existing models...');
    
    for (const modelName of modelNames) {
      await this.testModel(modelName);
    }
  }
}

// Run the setup if called directly
if (require.main === module) {
  const setup = new OllamaSetup();
  setup.run().catch(error => {
    console.error('Setup failed:', error);
    process.exit(1);
  });
}

module.exports = OllamaSetup;