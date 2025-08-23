import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MaternalHealth from './MaternalHealth';
import { motion } from 'framer-motion';
import { MessageSquare, HeartPulse, Send } from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  contact: string;
  address: string;
  medicalHistory: string[];
  allergies: string[];
  chronicConditions: string[];
  medications: string[];
  bloodType: string;
  lastCheckupDate: string;
  riskFactors: string[];
  isPregnant: boolean;
}

interface PregnancyData {
  estimatedDueDate: string;
  healthStatus: string;
  transportBooked: boolean;
  alerts: string[];
}

interface LabResult {
  testName: string;
  value: number;
  unit: string;
  timestamp: number;
}

interface Appointment {
  type: string;
  appointmentDate: number;
  time: string;
}

interface RiskAssessment {
  score: number;
  level: 'low' | 'medium' | 'high';
  factors: string[];
}

interface HealthTwin {
  patientInfo: Patient;
  pregnancyData?: PregnancyData;
  symptomHistory: SymptomReport[];
  labResults: LabResult[];
  appointments: Appointment[];
  riskAssessment?: RiskAssessment;
}


interface SymptomReport {
  symptoms: string[];
  timestamp: number;
}

interface Message {
  id: string;
  sender: string;
  receiver: string;
  content: string;
  timestamp: number;
}

const PatientDetail: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [healthTwin, setHealthTwin] = useState<HealthTwin | null>(null);
  const [symptomChecks, setSymptomChecks] = useState<SymptomReport[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch health twin data which includes patient info, pregnancy, symptoms, labs, appointments
        const healthTwinRes = await fetch(`${process.env.VITE_API_BASE_URL}/api/patients/${id}/health-twin`);
        if (!healthTwinRes.ok) throw new Error(`Failed to fetch health twin: ${healthTwinRes.statusText}`);
        const healthTwinData: HealthTwin = await healthTwinRes.json();
        setHealthTwin(healthTwinData);
        setPatient(healthTwinData.patientInfo); // Set patient from health twin
        setSymptomChecks(healthTwinData.symptomHistory); // Set symptom checks from health twin

        // Fetch messages separately as they are not part of the health twin aggregation
        const messageRes = await fetch(`${process.env.VITE_API_BASE_URL}/api/messages/${id}`);
        if (!messageRes.ok) throw new Error(`Failed to fetch messages: ${messageRes.statusText}`);
        const messageData: Message[] = await messageRes.json();
        setMessages(messageData);

      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !patient) return;

    try {
      const res = await fetch(`${process.env.VITE_API_BASE_URL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: 'Health Worker', receiver: patient.id, content: newMessage }),
      });
      if (!res.ok) throw new Error(`Failed to send message: ${res.statusText}`);
      const sentMessage: Message = await res.json();
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
    } catch (e) {
      console.error('Error sending message:', e);
      alert(t('message_send_error', { error: e instanceof Error ? e.message : String(e) }));
    }
  };

  if (loading) return <div className="text-center text-text dark:text-dark-text">{t('loading_patient_data')}</div>;
  if (error) return <div className="text-center text-destructive dark:text-dark-destructive">{t('error_loading_patient_data', { error })}</div>;
  if (!patient) return <div className="text-center text-text dark:text-dark-text">{t('patient_not_found')}</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Patient Info & Maternal Health */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-card dark:bg-dark-card p-6 rounded-lg shadow-md border border-border dark:border-dark-border">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center font-bold text-3xl text-primary dark:text-primary-300">
                {patient.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-text dark:text-dark-text">{patient.name}</h2>
                <p className="text-muted dark:text-dark-muted">{patient.age} {t('years_old')}, {patient.gender}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <p><strong>{t('patient_info_contact')}:</strong> {patient.contact}</p>
              <p><strong>{t('patient_info_address')}:</strong> {patient.address}</p>
              <p><strong>{t('patient_info_medical_history')}:</strong> {patient.medicalHistory.join(', ')}</p>
              <p><strong>{t('patient_info_allergies')}:</strong> {patient.allergies.join(', ')}</p>
              <p><strong>{t('patient_info_chronic_conditions')}:</strong> {patient.chronicConditions.join(', ')}</p>
              <p><strong>{t('patient_info_medications')}:</strong> {patient.medications.join(', ')}</p>
              <p><strong>{t('patient_info_blood_type')}:</strong> {patient.bloodType}</p>
              <p><strong>{t('patient_info_last_checkup')}:</strong> {patient.lastCheckupDate}</p>
              <p><strong>{t('patient_info_risk_factors')}:</strong> {patient.riskFactors.join(', ')}</p>
              <p><strong>{t('patient_info_is_pregnant')}:</strong> {patient.isPregnant ? t('yes') : t('no')}</p>
            </div>
          </div>

          {patient.isPregnant && id && 
            <div className="bg-card dark:bg-dark-card rounded-lg shadow-md border border-border dark:border-dark-border">
              <MaternalHealth patientId={id} />
            </div>
          }

          {healthTwin && (
            <div className="bg-card dark:bg-dark-card p-6 rounded-lg shadow-md border border-border dark:border-dark-border">
              <h3 className="text-xl font-semibold mb-4 flex items-center"><HeartPulse className="mr-2 text-primary"/> {t('health_twin_overview')}</h3>
              
              {healthTwin.pregnancyData && (
                <div className="mb-4">
                  <h4 className="font-semibold">{t('pregnancy_data')}</h4>
                  <p><strong>{t('estimated_due_date')}:</strong> {healthTwin.pregnancyData.estimatedDueDate}</p>
                  <p><strong>{t('health_status')}:</strong> {healthTwin.pregnancyData.healthStatus}</p>
                  <p><strong>{t('transport_booked')}:</strong> {healthTwin.pregnancyData.transportBooked ? t('yes') : t('no')}</p>
                  {healthTwin.pregnancyData.alerts.length > 0 && (
                    <p><strong>{t('alerts')}:</strong> {healthTwin.pregnancyData.alerts.join(', ')}</p>
                  )}
                </div>
              )}

              {healthTwin.symptomHistory.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold">{t('symptom_history')}</h4>
                  <ul className="list-disc list-inside">
                    {healthTwin.symptomHistory.map((s, index) => (
                      <li key={index}>{s.symptoms.join(', ')} ({new Date(s.timestamp).toLocaleDateString()})</li>
                    ))}
                  </ul>
                </div>
              )}

              {healthTwin.labResults.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold">{t('lab_results')}</h4>
                  <ul className="list-disc list-inside">
                    {healthTwin.labResults.map((l, index) => (
                      <li key={index}>{l.testName}: {l.value} {l.unit} ({new Date(l.timestamp).toLocaleDateString()})</li>
                    ))}
                  </ul>
                </div>
              )}

              {healthTwin.appointments.length > 0 && (
                <div>
                  <h4 className="font-semibold">{t('appointments')}</h4>
                  <ul className="list-disc list-inside">
                    {healthTwin.appointments.map((a, index) => (
                      <li key={index}>{a.type} on {new Date(a.appointmentDate).toLocaleDateString()} at {a.time}</li>
                    ))}
                  </ul>
                </div>
              )}

              {healthTwin.riskAssessment && (
                <div className="mt-4">
                  <h4 className="font-semibold">{t('risk_assessment')}</h4>
                  <p><strong>{t('risk_score')}:</strong> {healthTwin.riskAssessment.score}</p>
                  <p><strong>{t('risk_level')}:</strong> <span className={`px-2 py-1 rounded-full text-xs font-semibold ${healthTwin.riskAssessment.level === 'high' ? 'bg-red-100 text-red-800' : healthTwin.riskAssessment.level === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{t(healthTwin.riskAssessment.level)}</span></p>
                  {healthTwin.riskAssessment.factors.length > 0 && (
                    <p><strong>{t('risk_factors')}:</strong> {healthTwin.riskAssessment.factors.join(', ')}</p>
                  )}
                </div>
              )}

              {!healthTwin.pregnancyData && healthTwin.symptomHistory.length === 0 && healthTwin.labResults.length === 0 && healthTwin.appointments.length === 0 && !healthTwin.riskAssessment && (
                <p className="text-muted dark:text-dark-muted">{t('no_health_twin_data_available')}</p>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Symptom Checks & Messaging */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-card dark:bg-dark-card p-6 rounded-lg shadow-md border border-border dark:border-dark-border">
            <h3 className="text-xl font-semibold mb-4 flex items-center"><HeartPulse className="mr-2 text-primary"/> {t('recent_symptom_checks_title')}</h3>
            {symptomChecks.length === 0 ? (
              <p className="text-muted dark:text-dark-muted">{t('no_recent_symptom_checks')}</p>
            ) : (
              <ul className="space-y-3">
                {symptomChecks.map((check, index) => (
                  <li key={index} className="bg-background dark:bg-dark-background p-3 rounded-md border border-border dark:border-dark-border">
                    <p className="font-semibold">{check.symptoms}</p>
                    <p className="text-xs text-muted dark:text-dark-muted">{new Date(check.timestamp).toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-card dark:bg-dark-card p-6 rounded-lg shadow-md border border-border dark:border-dark-border">
            <h3 className="text-xl font-semibold mb-4 flex items-center"><MessageSquare className="mr-2 text-primary"/> {t('messaging_title')}</h3>
            <div className="h-64 overflow-y-auto bg-background dark:bg-dark-background p-4 rounded-md mb-4 space-y-3 border border-border dark:border-dark-border">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'Health Worker' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-lg max-w-[80%] ${msg.sender === 'Health Worker' ? 'bg-primary text-primary-text' : 'bg-muted/20 dark:bg-dark-muted/20'}`}>
                    <p>{msg.content}</p>
                    <p className="text-xs opacity-70 text-right mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center">
              <input
                type="text"
                className="flex-grow p-3 rounded-l-md bg-input dark:bg-dark-input text-text dark:text-dark-text border border-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={t('type_message_placeholder')}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
              />
              <button
                onClick={handleSendMessage}
                className="bg-primary hover:bg-primary-700 text-primary-text font-bold p-3 rounded-r-md transition-colors"
              >
                <Send />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PatientDetail;