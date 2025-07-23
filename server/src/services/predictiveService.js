const calculatePatientRisk = (patientInfo, pregnancyData) => {
  let riskScore = 0;
  let riskFactors = [];

  // Age-based risk
  if (patientInfo.age < 18 || patientInfo.age > 35) {
    riskScore += 2;
    riskFactors.push('Age (under 18 or over 35)');
  }

  // Chronic conditions risk
  if (patientInfo.chronicConditions && patientInfo.chronicConditions.length > 0) {
    riskScore += 3;
    riskFactors.push('Chronic Conditions');
  }

  // Pregnancy-related risks
  if (pregnancyData) {
    if (pregnancyData.healthStatus && pregnancyData.healthStatus.toLowerCase() !== 'stable') {
      riskScore += 4;
      riskFactors.push('Pregnancy Health Status');
    }
    if (pregnancyData.alerts && pregnancyData.alerts.length > 0) {
      riskScore += 5;
      riskFactors.push('Pregnancy Alerts');
    }
  }

  // Basic medical history risk (example: if any history exists)
  if (patientInfo.medicalHistory && patientInfo.medicalHistory.length > 0) {
    riskScore += 1;
    riskFactors.push('Medical History');
  }

  // Determine risk level
  let riskLevel = 'low';
  if (riskScore >= 8) {
    riskLevel = 'high';
  } else if (riskScore >= 4) {
    riskLevel = 'medium';
  }

  return {
    score: riskScore,
    level: riskLevel,
    factors: riskFactors,
  };
};

module.exports = { calculatePatientRisk };
