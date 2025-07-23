import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useTranslation } from 'react-i18next';

interface PatientFormData {
  name: string;
  age: string;
  gender: string;
  contact: string;
  address: string;
  medicalHistory: string[];
  allergies: string[];
  bloodType: string;
  emergencyContact: string;
  notes: string;
  isPregnant: boolean;
}

const AddPatient: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<PatientFormData>({
    name: '',
    age: '',
    gender: '',
    contact: '',
    address: '',
    medicalHistory: [],
    allergies: [],
    bloodType: '',
    emergencyContact: '',
    notes: '',
    isPregnant: false
  });

  // Handle text input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle array input changes (medical history, allergies)
  const handleArrayInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'medicalHistory' | 'allergies') => {
    const value = e.target.value;
    // Split by commas and trim whitespace
    const items = value.split(',').map(item => item.trim());
    setFormData(prev => ({
      ...prev,
      [field]: items
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Validate form data
      if (!formData.name || !formData.age || !formData.gender) {
        throw new Error('Name, age, and gender are required');
      }
      
      // Convert age to number
      const ageNum = parseInt(formData.age);
      if (isNaN(ageNum) || ageNum <= 0) {
        throw new Error('Age must be a positive number');
      }
      
      const response = await fetch(`${process.env.VITE_API_BASE_URL}/api/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          age: ageNum
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add patient');
      }
      
      const data = await response.json();
      setSuccess(true);
      
      // Redirect to patient detail page after short delay
      setTimeout(() => {
        navigate(`/patients/${data.id}`);
      }, 1500);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4 sm:p-6 max-w-4xl"
    >
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-text dark:text-dark-text">
        {t('addPatient.title', 'Add New Patient')}
      </h1>
      
      {error && (
        <div className="bg-destructive/20 text-destructive p-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-6">
          {t('addPatient.success', 'Patient added successfully! Redirecting...')}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-card dark:bg-dark-card p-6 rounded-xl shadow-lg border border-border dark:border-dark-border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-text dark:text-dark-text">
              {t('addPatient.basicInfo', 'Basic Information')}
            </h2>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-muted dark:text-dark-muted mb-1">
                {t('addPatient.name', 'Full Name')} *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-border dark:border-dark-border rounded-lg bg-background dark:bg-dark-background text-text dark:text-dark-text"
              />
            </div>
            
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-muted dark:text-dark-muted mb-1">
                {t('addPatient.age', 'Age')} *
              </label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                required
                min="0"
                className="w-full p-2 border border-border dark:border-dark-border rounded-lg bg-background dark:bg-dark-background text-text dark:text-dark-text"
              />
            </div>
            
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-muted dark:text-dark-muted mb-1">
                {t('addPatient.gender', 'Gender')} *
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-border dark:border-dark-border rounded-lg bg-background dark:bg-dark-background text-text dark:text-dark-text"
              >
                <option value="">{t('addPatient.selectGender', 'Select Gender')}</option>
                <option value="male">{t('addPatient.male', 'Male')}</option>
                <option value="female">{t('addPatient.female', 'Female')}</option>
                <option value="other">{t('addPatient.other', 'Other')}</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="contact" className="block text-sm font-medium text-muted dark:text-dark-muted mb-1">
                {t('addPatient.contact', 'Contact Number')}
              </label>
              <input
                type="tel"
                id="contact"
                name="contact"
                value={formData.contact}
                onChange={handleInputChange}
                className="w-full p-2 border border-border dark:border-dark-border rounded-lg bg-background dark:bg-dark-background text-text dark:text-dark-text"
              />
            </div>
            
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-muted dark:text-dark-muted mb-1">
                {t('addPatient.address', 'Address')}
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full p-2 border border-border dark:border-dark-border rounded-lg bg-background dark:bg-dark-background text-text dark:text-dark-text"
              />
            </div>
          </div>
          
          {/* Medical Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-text dark:text-dark-text">
              {t('addPatient.medicalInfo', 'Medical Information')}
            </h2>
            
            <div>
              <label htmlFor="medicalHistory" className="block text-sm font-medium text-muted dark:text-dark-muted mb-1">
                {t('addPatient.medicalHistory', 'Medical History')} (comma-separated)
              </label>
              <input
                type="text"
                id="medicalHistory"
                name="medicalHistory"
                value={formData.medicalHistory.join(', ')}
                onChange={(e) => handleArrayInputChange(e, 'medicalHistory')}
                className="w-full p-2 border border-border dark:border-dark-border rounded-lg bg-background dark:bg-dark-background text-text dark:text-dark-text"
                placeholder="Diabetes, Hypertension, etc."
              />
            </div>
            
            <div>
              <label htmlFor="allergies" className="block text-sm font-medium text-muted dark:text-dark-muted mb-1">
                {t('addPatient.allergies', 'Allergies')} (comma-separated)
              </label>
              <input
                type="text"
                id="allergies"
                name="allergies"
                value={formData.allergies.join(', ')}
                onChange={(e) => handleArrayInputChange(e, 'allergies')}
                className="w-full p-2 border border-border dark:border-dark-border rounded-lg bg-background dark:bg-dark-background text-text dark:text-dark-text"
                placeholder="Penicillin, Peanuts, etc."
              />
            </div>
            
            <div>
              <label htmlFor="bloodType" className="block text-sm font-medium text-muted dark:text-dark-muted mb-1">
                {t('addPatient.bloodType', 'Blood Type')}
              </label>
              <select
                id="bloodType"
                name="bloodType"
                value={formData.bloodType}
                onChange={handleInputChange}
                className="w-full p-2 border border-border dark:border-dark-border rounded-lg bg-background dark:bg-dark-background text-text dark:text-dark-text"
              >
                <option value="">{t('addPatient.selectBloodType', 'Select Blood Type')}</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="emergencyContact" className="block text-sm font-medium text-muted dark:text-dark-muted mb-1">
                {t('addPatient.emergencyContact', 'Emergency Contact')}
              </label>
              <input
                type="text"
                id="emergencyContact"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleInputChange}
                className="w-full p-2 border border-border dark:border-dark-border rounded-lg bg-background dark:bg-dark-background text-text dark:text-dark-text"
              />
            </div>
            
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-muted dark:text-dark-muted mb-1">
                {t('addPatient.notes', 'Additional Notes')}
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full p-2 border border-border dark:border-dark-border rounded-lg bg-background dark:bg-dark-background text-text dark:text-dark-text"
              />
            </div>

            <div>
              <label htmlFor="isPregnant" className="block text-sm font-medium text-muted dark:text-dark-muted mb-1">
                {t('addPatient.isPregnant', 'Is Pregnant?')}
              </label>
              <input
                type="checkbox"
                id="isPregnant"
                name="isPregnant"
                checked={formData.isPregnant}
                onChange={(e) => setFormData(prev => ({ ...prev, isPregnant: e.target.checked }))}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/patients')}
            className="px-4 py-2 border border-border dark:border-dark-border rounded-lg bg-background dark:bg-dark-background text-text dark:text-dark-text hover:bg-muted/20 dark:hover:bg-dark-muted/20 transition-colors"
          >
            {t('common.cancel', 'Cancel')}
          </button>
          <button
            type="submit"
            disabled={loading || success}
            className="px-4 py-2 bg-primary hover:bg-primary-700 text-primary-text font-bold rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? t('common.saving', 'Saving...') : t('common.save', 'Save Patient')}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default AddPatient;