import React, { useState } from 'react';
import { Stethoscope, AlertTriangle, CheckCircle, Phone } from 'lucide-react';

const SRHSymptomChecker: React.FC = () => {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    urgency: string;
    recommendations: string[];
    possibleConditions: string[];
    zambiahHotlines: { name: string; number: string }[];
  } | null>(null);

  const symptoms = [
    'Irregular Periods',
    'Pelvic Pain',
    'Unusual Discharge',
    'Painful Urination',
    'Sores or Bumps',
    'Itching or Irritation',
  ];

  const handleSymptomClick = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
  };

  const analyzeSymptoms = () => {
    if (selectedSymptoms.length === 0) {
      alert('Please select at least one symptom to analyze.');
      return;
    }

    // Simple symptom analysis logic
    let urgency = 'low';
    const recommendations: string[] = [];
    const possibleConditions: string[] = [];
    
    // Analysis based on selected symptoms
    if (selectedSymptoms.includes('Sores or Bumps')) {
      urgency = 'high';
      recommendations.push('Seek immediate medical attention for STI testing');
      possibleConditions.push('Possible sexually transmitted infection');
    }
    
    if (selectedSymptoms.includes('Painful Urination')) {
      urgency = urgency === 'low' ? 'medium' : urgency;
      recommendations.push('Consider UTI or STI testing');
      possibleConditions.push('Urinary tract infection or STI');
    }
    
    if (selectedSymptoms.includes('Unusual Discharge')) {
      urgency = urgency === 'low' ? 'medium' : urgency;
      recommendations.push('Schedule gynecological examination');
      possibleConditions.push('Vaginal infection or hormonal changes');
    }
    
    if (selectedSymptoms.includes('Pelvic Pain')) {
      urgency = urgency === 'low' ? 'medium' : urgency;
      recommendations.push('Consult healthcare provider for pelvic examination');
      possibleConditions.push('Ovarian cysts, endometriosis, or PID');
    }
    
    if (selectedSymptoms.includes('Irregular Periods')) {
      recommendations.push('Track menstrual cycle and consult healthcare provider');
      possibleConditions.push('Hormonal imbalance or PCOS');
    }
    
    if (selectedSymptoms.includes('Itching or Irritation')) {
      recommendations.push('Avoid harsh soaps, wear cotton underwear');
      possibleConditions.push('Yeast infection or contact dermatitis');
    }

    // General recommendations
    recommendations.push('Practice safe sex and maintain good hygiene');
    recommendations.push('Schedule regular gynecological check-ups');

    const result = {
      urgency,
      recommendations,
      possibleConditions,
      zambiahHotlines: [
        { name: 'Ministry of Health Hotline', number: '+260-211-253-344' },
        { name: 'Zambia Sexual Health Helpline', number: '+260-977-000-111' },
        { name: 'Emergency Services', number: '999' },
        { name: 'University Teaching Hospital', number: '+260-211-254-131' }
      ]
    };

    setAnalysisResult(result);
    setShowResults(true);
  };

  return (
    <div className="bg-card dark:bg-dark-card p-8 rounded-xl shadow-lg border border-border dark:border-dark-border">
      <h2 className="text-3xl font-bold mb-6 text-text dark:text-dark-text">SRH Symptom Checker</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {symptoms.map((symptom) => (
          <button
            key={symptom}
            onClick={() => handleSymptomClick(symptom)}
            className={`p-4 rounded-lg text-center transition-colors ${
              selectedSymptoms.includes(symptom)
                ? 'bg-primary-600 text-white'
                : 'bg-background dark:bg-dark-background border border-border dark:border-dark-border text-text dark:text-dark-text hover:bg-primary-100 dark:hover:bg-primary-900'
            }`}
          >
            {symptom}
          </button>
        ))}
      </div>
      <button 
        onClick={analyzeSymptoms}
        disabled={selectedSymptoms.length === 0}
        className={`w-full py-3 rounded-lg transition-colors flex items-center justify-center ${
          selectedSymptoms.length === 0 
            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
            : 'bg-primary-600 text-white hover:bg-primary-700'
        }`}
      >
        <Stethoscope size={20} className="mr-2" />
        Analyze Symptoms ({selectedSymptoms.length})
      </button>

      {/* Results Modal */}
      {showResults && analysisResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-card dark:bg-dark-card p-6 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-text dark:text-dark-text">Symptom Analysis Results</h3>
              <button 
                onClick={() => setShowResults(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Urgency Level */}
            <div className={`p-4 rounded-lg mb-6 flex items-center ${
              analysisResult.urgency === 'high' ? 'bg-red-100 text-red-800' :
              analysisResult.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {analysisResult.urgency === 'high' ? (
                <AlertTriangle size={20} className="mr-3 flex-shrink-0" />
              ) : (
                <CheckCircle size={20} className="mr-3 flex-shrink-0" />
              )}
              <div>
                <h4 className="font-bold text-lg">
                  {analysisResult.urgency === 'high' ? 'High Priority' :
                   analysisResult.urgency === 'medium' ? 'Medium Priority' : 'Low Priority'}
                </h4>
                <p className="text-sm">
                  {analysisResult.urgency === 'high' ? 'Seek immediate medical attention' :
                   analysisResult.urgency === 'medium' ? 'Consider scheduling an appointment soon' :
                   'Monitor symptoms and maintain good health practices'}
                </p>
              </div>
            </div>

            {/* Selected Symptoms */}
            <div className="mb-6">
              <h4 className="font-bold text-lg mb-3 text-text dark:text-dark-text">Selected Symptoms:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedSymptoms.map((symptom) => (
                  <span key={symptom} className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
                    {symptom}
                  </span>
                ))}
              </div>
            </div>

            {/* Possible Conditions */}
            <div className="mb-6">
              <h4 className="font-bold text-lg mb-3 text-text dark:text-dark-text">Possible Conditions:</h4>
              <ul className="list-disc pl-5 space-y-1">
                {analysisResult.possibleConditions.map((condition: string, index: number) => (
                  <li key={index} className="text-muted dark:text-dark-muted">{condition}</li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div className="mb-6">
              <h4 className="font-bold text-lg mb-3 text-text dark:text-dark-text">Recommendations:</h4>
              <ul className="list-disc pl-5 space-y-2">
                {analysisResult.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="text-muted dark:text-dark-muted">{rec}</li>
                ))}
              </ul>
            </div>

            {/* Zambian Health Hotlines */}
            <div className="mb-6">
              <h4 className="font-bold text-lg mb-3 text-text dark:text-dark-text flex items-center">
                <Phone size={18} className="mr-2" />
                Zambian Health Hotlines
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {analysisResult.zambiahHotlines.map((hotline: { name: string; number: string }, index: number) => (
                  <div key={index} className="p-3 bg-background dark:bg-dark-background rounded-lg border">
                    <p className="font-semibold text-sm text-text dark:text-dark-text">{hotline.name}</p>
                    <a href={`tel:${hotline.number}`} className="text-primary-600 hover:underline">
                      {hotline.number}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-yellow-400 mr-3 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <strong>Medical Disclaimer:</strong> This tool is for educational purposes only and should not replace professional medical advice. Always consult with qualified healthcare providers for proper diagnosis and treatment.
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button 
                onClick={() => {
                  setShowResults(false);
                  setSelectedSymptoms([]);
                }}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Start Over
              </button>
              <button 
                onClick={() => setShowResults(false)}
                className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SRHSymptomChecker;
