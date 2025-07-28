/**
 * Blockchain Health Records Service
 * Secure, immutable health data storage and sharing using blockchain technology
 */

export interface EncryptedRecord {
  id: string;
  patientId: string;
  dataHash: string;
  encryptedData: string;
  timestamp: number;
  recordType: 'medical_history' | 'lab_results' | 'prescription' | 'imaging' | 'vital_signs' | 'consultation';
  metadata: {
    provider: string;
    facility: string;
    classification: 'public' | 'private' | 'restricted';
    retention_period?: number;
  };
  signatures: {
    patient?: string;
    provider: string;
    witness?: string;
  };
}

export interface BlockchainHash {
  transactionId: string;
  blockNumber: number;
  blockHash: string;
  gasUsed: number;
  timestamp: number;
  confirmations: number;
}

export interface AccessToken {
  token: string;
  providerId: string;
  patientId: string;
  recordId: string;
  permissions: Array<'read' | 'write' | 'share' | 'delete'>;
  expiresAt: number;
  issuedAt: number;
  revokedAt?: number;
}

export interface HealthDataConsent {
  consentId: string;
  patientId: string;
  providerId: string;
  dataTypes: string[];
  purpose: string;
  duration: number;
  granted: boolean;
  grantedAt?: number;
  revokedAt?: number;
  conditions: string[];
}

export interface AuditLog {
  id: string;
  recordId: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'share' | 'revoke';
  userId: string;
  userRole: 'patient' | 'provider' | 'researcher' | 'admin';
  timestamp: number;
  ipAddress: string;
  deviceInfo: string;
  success: boolean;
  errorMessage?: string;
}

class BlockchainHealthService {
  private baseUrl: string;
  private privateKey: string | null = null;
  private publicKey: string | null = null;

  constructor() {
    this.baseUrl = import.meta.env.VITE_BLOCKCHAIN_API_URL || 'http://localhost:3001';
  }

  /**
   * Initialize user's blockchain identity
   */
  async initializeIdentity(userId: string): Promise<{ privateKey: string; publicKey: string }> {
    const response = await fetch(`${this.baseUrl}/api/blockchain/identity/init`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to initialize blockchain identity: ${response.statusText}`);
    }

    const identity = await response.json();
    this.privateKey = identity.privateKey;
    this.publicKey = identity.publicKey;

    // Store keys securely (in production, use secure key management)
    localStorage.setItem('blockchain_private_key', identity.privateKey);
    localStorage.setItem('blockchain_public_key', identity.publicKey);

    return identity;
  }

  /**
   * Encrypt health data before storing on blockchain
   */
  async encrypt(data: any): Promise<EncryptedRecord> {
    const response = await fetch(`${this.baseUrl}/api/blockchain/encrypt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        data,
        publicKey: this.publicKey || localStorage.getItem('blockchain_public_key'),
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to encrypt data: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Store encrypted health record on blockchain
   */
  async store(record: EncryptedRecord): Promise<BlockchainHash> {
    const response = await fetch(`${this.baseUrl}/api/blockchain/store`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        record,
        privateKey: this.privateKey || localStorage.getItem('blockchain_private_key'),
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to store record on blockchain: ${response.statusText}`);
    }

    const blockchainHash = await response.json();
    
    // Log the storage action
    await this.logAction('create', record.id, 'patient');

    return blockchainHash;
  }

  /**
   * Verify the integrity of a blockchain record
   */
  async verify(hash: BlockchainHash): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/api/blockchain/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ hash }),
    });

    if (!response.ok) {
      throw new Error(`Failed to verify record: ${response.statusText}`);
    }

    const result = await response.json();
    return result.verified;
  }

  /**
   * Share health record with healthcare provider
   */
  async shareWithProvider(hash: BlockchainHash, providerId: string, permissions: Array<'read' | 'write' | 'share'>, duration: number = 86400000): Promise<AccessToken> {
    const response = await fetch(`${this.baseUrl}/api/blockchain/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        hash,
        providerId,
        permissions,
        duration,
        privateKey: this.privateKey || localStorage.getItem('blockchain_private_key'),
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to share record: ${response.statusText}`);
    }

    const accessToken = await response.json();
    
    // Log the sharing action
    await this.logAction('share', hash.transactionId, 'patient');

    return accessToken;
  }

  /**
   * Revoke access to a shared health record
   */
  async revokeAccess(tokenId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/blockchain/revoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        tokenId,
        privateKey: this.privateKey || localStorage.getItem('blockchain_private_key'),
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to revoke access: ${response.statusText}`);
    }

    // Log the revocation action
    await this.logAction('revoke', tokenId, 'patient');
  }

  /**
   * Retrieve and decrypt health record
   */
  async retrieve(hash: BlockchainHash, accessToken?: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/blockchain/retrieve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        hash,
        accessToken,
        privateKey: this.privateKey || localStorage.getItem('blockchain_private_key'),
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to retrieve record: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Log the access action
    await this.logAction('read', hash.transactionId, 'patient');

    return data;
  }

  /**
   * Get patient's consent records
   */
  async getConsentRecords(patientId: string): Promise<HealthDataConsent[]> {
    const response = await fetch(`${this.baseUrl}/api/blockchain/consent/${patientId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch consent records: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Grant consent for data sharing
   */
  async grantConsent(consent: Omit<HealthDataConsent, 'consentId' | 'granted' | 'grantedAt'>): Promise<HealthDataConsent> {
    const response = await fetch(`${this.baseUrl}/api/blockchain/consent/grant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        ...consent,
        privateKey: this.privateKey || localStorage.getItem('blockchain_private_key'),
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to grant consent: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Revoke previously granted consent
   */
  async revokeConsent(consentId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/blockchain/consent/revoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        consentId,
        privateKey: this.privateKey || localStorage.getItem('blockchain_private_key'),
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to revoke consent: ${response.statusText}`);
    }
  }

  /**
   * Get audit trail for a specific record
   */
  async getAuditTrail(recordId: string): Promise<AuditLog[]> {
    const response = await fetch(`${this.baseUrl}/api/blockchain/audit/${recordId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch audit trail: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get all records owned by a patient
   */
  async getPatientRecords(patientId: string): Promise<{ hash: BlockchainHash; metadata: any }[]> {
    const response = await fetch(`${this.baseUrl}/api/blockchain/records/patient/${patientId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch patient records: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Search for records with specific criteria
   */
  async searchRecords(criteria: {
    patientId?: string;
    recordType?: string;
    provider?: string;
    dateRange?: { from: number; to: number };
    hasConsent?: boolean;
  }): Promise<{ hash: BlockchainHash; metadata: any }[]> {
    const queryParams = new URLSearchParams();
    Object.entries(criteria).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
      }
    });

    const response = await fetch(`${this.baseUrl}/api/blockchain/records/search?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to search records: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get blockchain network statistics
   */
  async getNetworkStats(): Promise<{
    totalRecords: number;
    totalTransactions: number;
    averageBlockTime: number;
    networkHashrate: string;
    activeNodes: number;
    lastBlockNumber: number;
  }> {
    const response = await fetch(`${this.baseUrl}/api/blockchain/stats`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch network stats: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Log user actions for audit purposes
   */
  private async logAction(action: string, recordId: string, userRole: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/api/blockchain/audit/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          action,
          recordId,
          userRole,
          timestamp: Date.now(),
          ipAddress: await this.getClientIP(),
          deviceInfo: navigator.userAgent,
        }),
      });
    } catch (error) {
      console.warn('Failed to log action:', error);
    }
  }

  /**
   * Get client IP address for audit logging
   */
  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  }

  /**
   * Validate blockchain record integrity
   */
  async validateRecord(recordId: string): Promise<{
    isValid: boolean;
    tampered: boolean;
    lastValidated: number;
    validationErrors?: string[];
  }> {
    const response = await fetch(`${this.baseUrl}/api/blockchain/validate/${recordId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to validate record: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get gas estimation for blockchain operations
   */
  async estimateGas(operation: 'store' | 'share' | 'revoke'): Promise<{
    estimatedGas: number;
    estimatedCost: string;
    networkFee: string;
  }> {
    const response = await fetch(`${this.baseUrl}/api/blockchain/gas/estimate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ operation }),
    });

    if (!response.ok) {
      throw new Error(`Failed to estimate gas: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Batch operations for multiple records
   */
  async batchStore(records: EncryptedRecord[]): Promise<BlockchainHash[]> {
    const response = await fetch(`${this.baseUrl}/api/blockchain/batch/store`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        records,
        privateKey: this.privateKey || localStorage.getItem('blockchain_private_key'),
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to batch store records: ${response.statusText}`);
    }

    const hashes = await response.json();
    
    // Log batch operation
    for (const record of records) {
      await this.logAction('create', record.id, 'patient');
    }

    return hashes;
  }
}

export const blockchainHealthService = new BlockchainHealthService();
export default blockchainHealthService;
