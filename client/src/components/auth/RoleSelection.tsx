import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ApiService from '../../services/api';

interface Role {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const roles: Role[] = [
  {
    id: 'patient',
    name: 'Patient',
    description: 'Access your health records and connect with healthcare providers',
    icon: '👤'
  },
  {
    id: 'health_worker',
    name: 'Health Worker',
    description: 'Manage patients and provide healthcare services',
    icon: '👨‍⚕️'
  },
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Manage system settings and user access',
    icon: '⚙️'
  },
  {
    id: 'moh',
    name: 'Ministry of Health',
    description: 'Access health analytics and manage public health policies',
    icon: '🏛️'
  },
  {
    id: 'ambulance_driver',
    name: 'Ambulance Driver',
    description: 'Respond to emergency calls and manage dispatches',
    icon: '🚑'
  },
  {
    id: 'pharmacy',
    name: 'Pharmacy',
    description: 'Manage prescriptions and medical supplies',
    icon: '💊'
  }
];

const RoleSelection: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = async (roleId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Update user role in the backend
      const response = await ApiService.updateProfile({ role: roleId });
      
      // Update local user state with new role
      if (response.success && updateUser) {
        updateUser({ ...user, role: roleId });
        navigate('/dashboard');
      } else {
        setError('Failed to update role. Please try again.');
      }
    } catch (err) {
      setError('An error occurred while updating your role.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Select Your Role</h1>
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => {
              setSelectedRole(role.id);
              handleRoleSelect(role.id);
            }}
            disabled={loading}
            className={`
              p-6 rounded-lg border transition-all
              ${selectedRole === role.id 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50'
              }
              ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="text-4xl mb-4">{role.icon}</div>
            <h3 className="text-lg font-semibold mb-2">{role.name}</h3>
            <p className="text-gray-600 text-sm">{role.description}</p>
          </button>
        ))}
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  );
};

export default RoleSelection;
