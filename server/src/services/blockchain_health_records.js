/**
 * BioVerse Blockchain Health Records
 * Revolutionary blockchain-based medical record system
 * Provides immutable, secure, and patient-controlled health data
 */

const crypto = require('crypto');
const { EventEmitter } = require('events');
const logger = require('../config/logger');

class Block {
    constructor(index, timestamp, data, previousHash) {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.nonce = 0;
        this.hash = this.calculateHash();
    }

    calculateHash() {
        return crypto
            .createHash('sha256')
            .update(
                this.index +
                this.previousHash +
                this.timestamp +
                JSON.stringify(this.data) +
                this.nonce
            )
            .digest('hex');
    }

    mineBlock(difficulty) {
        const target = Array(difficulty + 1).join('0');
        
        while (this.hash.substring(0, difficulty) !== target) {
            this.nonce++;
            this.hash = this.calculateHash();
        }

        logger.info(`Block mined: ${this.hash}`);
    }
}

class HealthRecord {
    constructor(recordData) {
        this.recordId = this.generateRecordId();
        this.patientId = recordData.patientId;
        this.providerId = recordData.providerId;
        this.recordType = recordData.recordType;
        this.timestamp = new Date().toISOString();
        this.encryptedData = recordData.encryptedData;
        this.dataHash = this.calculateDataHash(recordData.rawData);
        this.accessPermissions = recordData.accessPermissions || [];
        this.emergencyAccess = recordData.emergencyAccess || false;
        this.metadata = {
            version: '1.0',
            encryption: 'AES-256-GCM',
            created: this.timestamp,
            lastModified: this.timestamp
        };
    }

    generateRecordId() {
        return crypto.randomBytes(16).toString('hex');
    }

    calculateDataHash(data) {
        return crypto
            .createHash('sha256')
            .update(JSON.stringify(data))
            .digest('hex');
    }

    addAccessPermission(userId, permissions, expiryDate = null) {
        const permission = {
            userId,
            permissions, // ['read', 'write', 'share']
            granted: new Date().toISOString(),
            expires: expiryDate,
            active: true
        };

        this.accessPermissions.push(permission);
        this.metadata.lastModified = new Date().toISOString();
    }

    revokeAccess(userId) {
        this.accessPermissions = this.accessPermissions.map(permission => {
            if (permission.userId === userId) {
                permission.active = false;
                permission.revoked = new Date().toISOString();
            }
            return permission;
        });
        this.metadata.lastModified = new Date().toISOString();
    }

    hasAccess(userId, requiredPermission) {
        const permission = this.accessPermissions.find(p => 
            p.userId === userId && 
            p.active && 
            p.permissions.includes(requiredPermission) &&
            (!p.expires || new Date(p.expires) > new Date())
        );

        return !!permission;
    }
}

class HealthBlockchain extends EventEmitter {
    constructor() {
        super();
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.miningReward = 100;
        this.healthRecords = new Map();
        this.patientRecords = new Map();
        this.accessLogs = [];
        this.emergencyContacts = new Map();
        this.smartContracts = new Map();
    }

    createGenesisBlock() {
        const genesisData = {
            type: 'genesis',
            message: 'BioVerse Health Blockchain Genesis Block',
            timestamp: new Date().toISOString()
        };
        
        return new Block(0, new Date().toISOString(), genesisData, '0');
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addHealthRecord(healthRecord) {
        try {
            // Validate health record
            this.validateHealthRecord(healthRecord);

            // Store the record
            this.healthRecords.set(healthRecord.recordId, healthRecord);

            // Update patient record index
            if (!this.patientRecords.has(healthRecord.patientId)) {
                this.patientRecords.set(healthRecord.patientId, []);
            }
            this.patientRecords.get(healthRecord.patientId).push(healthRecord.recordId);

            // Create blockchain transaction
            const transaction = {
                type: 'health_record',
                action: 'create',
                recordId: healthRecord.recordId,
                patientId: healthRecord.patientId,
                providerId: healthRecord.providerId,
                recordType: healthRecord.recordType,
                dataHash: healthRecord.dataHash,
                timestamp: healthRecord.timestamp,
                metadata: healthRecord.metadata
            };

            this.pendingTransactions.push(transaction);

            // Log access
            this.logAccess({
                action: 'create',
                recordId: healthRecord.recordId,
                userId: healthRecord.providerId,
                timestamp: new Date().toISOString(),
                success: true
            });

            this.emit('recordAdded', {
                recordId: healthRecord.recordId,
                patientId: healthRecord.patientId,
                recordType: healthRecord.recordType
            });

            logger.info(`Health record added: ${healthRecord.recordId}`);
            return healthRecord.recordId;

        } catch (error) {
            logger.error('Error adding health record:', error);
            throw error;
        }
    }

    validateHealthRecord(healthRecord) {
        if (!healthRecord.patientId) {
            throw new Error('Patient ID is required');
        }
        if (!healthRecord.providerId) {
            throw new Error('Provider ID is required');
        }
        if (!healthRecord.recordType) {
            throw new Error('Record type is required');
        }
        if (!healthRecord.encryptedData) {
            throw new Error('Encrypted data is required');
        }
        if (!healthRecord.dataHash) {
            throw new Error('Data hash is required');
        }
    }

    getHealthRecord(recordId, requesterId) {
        try {
            const record = this.healthRecords.get(recordId);
            
            if (!record) {
                throw new Error('Health record not found');
            }

            // Check access permissions
            if (!this.checkAccess(record, requesterId, 'read')) {
                this.logAccess({
                    action: 'read',
                    recordId,
                    userId: requesterId,
                    timestamp: new Date().toISOString(),
                    success: false,
                    reason: 'Access denied'
                });
                throw new Error('Access denied');
            }

            // Log successful access
            this.logAccess({
                action: 'read',
                recordId,
                userId: requesterId,
                timestamp: new Date().toISOString(),
                success: true
            });

            this.emit('recordAccessed', {
                recordId,
                userId: requesterId,
                action: 'read'
            });

            return record;

        } catch (error) {
            logger.error('Error retrieving health record:', error);
            throw error;
        }
    }

    getPatientRecords(patientId, requesterId) {
        try {
            // Check if requester is the patient or has permission
            if (patientId !== requesterId && !this.hasPatientAccess(patientId, requesterId)) {
                throw new Error('Access denied');
            }

            const recordIds = this.patientRecords.get(patientId) || [];
            const records = [];

            for (const recordId of recordIds) {
                const record = this.healthRecords.get(recordId);
                if (record && this.checkAccess(record, requesterId, 'read')) {
                    records.push(record);
                }
            }

            // Log access
            this.logAccess({
                action: 'read_patient_records',
                patientId,
                userId: requesterId,
                timestamp: new Date().toISOString(),
                success: true,
                recordCount: records.length
            });

            return records;

        } catch (error) {
            logger.error('Error retrieving patient records:', error);
            throw error;
        }
    }

    checkAccess(record, userId, permission) {
        // Patient always has access to their own records
        if (record.patientId === userId) {
            return true;
        }

        // Check emergency access
        if (permission === 'read' && record.emergencyAccess && this.isEmergencyUser(userId)) {
            return true;
        }

        // Check explicit permissions
        return record.hasAccess(userId, permission);
    }

    hasPatientAccess(patientId, requesterId) {
        // Check if requester has general access to patient records
        // This could be through healthcare provider relationships, etc.
        return false; // Simplified - implement based on your access control logic
    }

    isEmergencyUser(userId) {
        // Check if user has emergency access privileges
        // This could be emergency responders, hospitals, etc.
        return false; // Simplified - implement based on your emergency access logic
    }

    grantAccess(recordId, patientId, targetUserId, permissions, expiryDate = null) {
        try {
            const record = this.healthRecords.get(recordId);
            
            if (!record) {
                throw new Error('Health record not found');
            }

            // Only patient can grant access to their records
            if (record.patientId !== patientId) {
                throw new Error('Only patient can grant access');
            }

            record.addAccessPermission(targetUserId, permissions, expiryDate);

            // Create blockchain transaction
            const transaction = {
                type: 'access_grant',
                recordId,
                patientId,
                targetUserId,
                permissions,
                expiryDate,
                timestamp: new Date().toISOString()
            };

            this.pendingTransactions.push(transaction);

            // Log access grant
            this.logAccess({
                action: 'grant_access',
                recordId,
                userId: patientId,
                targetUserId,
                permissions,
                timestamp: new Date().toISOString(),
                success: true
            });

            this.emit('accessGranted', {
                recordId,
                patientId,
                targetUserId,
                permissions
            });

            logger.info(`Access granted for record ${recordId} to user ${targetUserId}`);

        } catch (error) {
            logger.error('Error granting access:', error);
            throw error;
        }
    }

    revokeAccess(recordId, patientId, targetUserId) {
        try {
            const record = this.healthRecords.get(recordId);
            
            if (!record) {
                throw new Error('Health record not found');
            }

            // Only patient can revoke access to their records
            if (record.patientId !== patientId) {
                throw new Error('Only patient can revoke access');
            }

            record.revokeAccess(targetUserId);

            // Create blockchain transaction
            const transaction = {
                type: 'access_revoke',
                recordId,
                patientId,
                targetUserId,
                timestamp: new Date().toISOString()
            };

            this.pendingTransactions.push(transaction);

            // Log access revocation
            this.logAccess({
                action: 'revoke_access',
                recordId,
                userId: patientId,
                targetUserId,
                timestamp: new Date().toISOString(),
                success: true
            });

            this.emit('accessRevoked', {
                recordId,
                patientId,
                targetUserId
            });

            logger.info(`Access revoked for record ${recordId} from user ${targetUserId}`);

        } catch (error) {
            logger.error('Error revoking access:', error);
            throw error;
        }
    }

    enableEmergencyAccess(recordId, patientId) {
        try {
            const record = this.healthRecords.get(recordId);
            
            if (!record) {
                throw new Error('Health record not found');
            }

            if (record.patientId !== patientId) {
                throw new Error('Only patient can enable emergency access');
            }

            record.emergencyAccess = true;
            record.metadata.lastModified = new Date().toISOString();

            // Create blockchain transaction
            const transaction = {
                type: 'emergency_access_enable',
                recordId,
                patientId,
                timestamp: new Date().toISOString()
            };

            this.pendingTransactions.push(transaction);

            logger.info(`Emergency access enabled for record ${recordId}`);

        } catch (error) {
            logger.error('Error enabling emergency access:', error);
            throw error;
        }
    }

    logAccess(accessLog) {
        this.accessLogs.push(accessLog);
        
        // Keep only recent logs (last 10000)
        if (this.accessLogs.length > 10000) {
            this.accessLogs = this.accessLogs.slice(-10000);
        }
    }

    getAccessLogs(recordId, requesterId) {
        try {
            const record = this.healthRecords.get(recordId);
            
            if (!record) {
                throw new Error('Health record not found');
            }

            // Only patient or authorized users can view access logs
            if (record.patientId !== requesterId && !this.checkAccess(record, requesterId, 'read')) {
                throw new Error('Access denied');
            }

            return this.accessLogs.filter(log => log.recordId === recordId);

        } catch (error) {
            logger.error('Error retrieving access logs:', error);
            throw error;
        }
    }

    minePendingTransactions(miningRewardAddress) {
        try {
            const rewardTransaction = {
                type: 'mining_reward',
                toAddress: miningRewardAddress,
                amount: this.miningReward,
                timestamp: new Date().toISOString()
            };

            this.pendingTransactions.push(rewardTransaction);

            const block = new Block(
                this.chain.length,
                new Date().toISOString(),
                this.pendingTransactions,
                this.getLatestBlock().hash
            );

            block.mineBlock(this.difficulty);
            
            this.chain.push(block);
            this.pendingTransactions = [];

            this.emit('blockMined', {
                blockIndex: block.index,
                blockHash: block.hash,
                transactionCount: block.data.length
            });

            logger.info(`Block mined successfully: ${block.hash}`);
            return block;

        } catch (error) {
            logger.error('Error mining block:', error);
            throw error;
        }
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }

        return true;
    }

    getBlockchainStats() {
        return {
            totalBlocks: this.chain.length,
            totalRecords: this.healthRecords.size,
            totalPatients: this.patientRecords.size,
            pendingTransactions: this.pendingTransactions.length,
            totalAccessLogs: this.accessLogs.length,
            chainValid: this.isChainValid(),
            lastBlockHash: this.getLatestBlock().hash,
            difficulty: this.difficulty
        };
    }

    // Smart Contract functionality
    deploySmartContract(contractCode, contractData) {
        try {
            const contractId = crypto.randomBytes(16).toString('hex');
            
            const smartContract = {
                contractId,
                code: contractCode,
                data: contractData,
                deployed: new Date().toISOString(),
                active: true,
                executions: []
            };

            this.smartContracts.set(contractId, smartContract);

            // Create blockchain transaction
            const transaction = {
                type: 'smart_contract_deploy',
                contractId,
                codeHash: crypto.createHash('sha256').update(contractCode).digest('hex'),
                timestamp: new Date().toISOString()
            };

            this.pendingTransactions.push(transaction);

            logger.info(`Smart contract deployed: ${contractId}`);
            return contractId;

        } catch (error) {
            logger.error('Error deploying smart contract:', error);
            throw error;
        }
    }

    executeSmartContract(contractId, inputData, executorId) {
        try {
            const contract = this.smartContracts.get(contractId);
            
            if (!contract || !contract.active) {
                throw new Error('Smart contract not found or inactive');
            }

            // Execute contract (simplified - in production would use a proper VM)
            const execution = {
                executionId: crypto.randomBytes(16).toString('hex'),
                contractId,
                inputData,
                executorId,
                timestamp: new Date().toISOString(),
                result: this.runContractCode(contract.code, inputData),
                gasUsed: 1000 // Simplified gas calculation
            };

            contract.executions.push(execution);

            // Create blockchain transaction
            const transaction = {
                type: 'smart_contract_execution',
                contractId,
                executionId: execution.executionId,
                executorId,
                gasUsed: execution.gasUsed,
                timestamp: execution.timestamp
            };

            this.pendingTransactions.push(transaction);

            logger.info(`Smart contract executed: ${contractId}`);
            return execution.result;

        } catch (error) {
            logger.error('Error executing smart contract:', error);
            throw error;
        }
    }

    runContractCode(code, inputData) {
        // Simplified contract execution
        // In production, this would use a secure virtual machine
        try {
            const contractFunction = new Function('input', code);
            return contractFunction(inputData);
        } catch (error) {
            throw new Error('Contract execution failed: ' + error.message);
        }
    }

    // Health data analytics (privacy-preserving)
    generateHealthInsights(patientId, requesterId) {
        try {
            if (patientId !== requesterId && !this.hasPatientAccess(patientId, requesterId)) {
                throw new Error('Access denied');
            }

            const records = this.getPatientRecords(patientId, requesterId);
            
            // Generate anonymized insights
            const insights = {
                totalRecords: records.length,
                recordTypes: this.analyzeRecordTypes(records),
                timelineAnalysis: this.analyzeTimeline(records),
                riskFactors: this.identifyRiskFactors(records),
                recommendations: this.generateRecommendations(records)
            };

            return insights;

        } catch (error) {
            logger.error('Error generating health insights:', error);
            throw error;
        }
    }

    analyzeRecordTypes(records) {
        const types = {};
        records.forEach(record => {
            types[record.recordType] = (types[record.recordType] || 0) + 1;
        });
        return types;
    }

    analyzeTimeline(records) {
        const timeline = records
            .map(record => ({
                date: record.timestamp,
                type: record.recordType
            }))
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        return {
            firstRecord: timeline[0]?.date,
            lastRecord: timeline[timeline.length - 1]?.date,
            recordFrequency: this.calculateRecordFrequency(timeline)
        };
    }

    calculateRecordFrequency(timeline) {
        if (timeline.length < 2) return 0;
        
        const firstDate = new Date(timeline[0].date);
        const lastDate = new Date(timeline[timeline.length - 1].date);
        const daysDiff = (lastDate - firstDate) / (1000 * 60 * 60 * 24);
        
        return timeline.length / Math.max(daysDiff, 1);
    }

    identifyRiskFactors(records) {
        // Simplified risk factor identification
        const riskFactors = [];
        
        const recordTypes = this.analyzeRecordTypes(records);
        
        if (recordTypes['emergency'] > 2) {
            riskFactors.push('Frequent emergency visits');
        }
        
        if (recordTypes['chronic_condition']) {
            riskFactors.push('Chronic condition management');
        }
        
        return riskFactors;
    }

    generateRecommendations(records) {
        // Simplified recommendation generation
        const recommendations = [];
        
        const recordTypes = this.analyzeRecordTypes(records);
        
        if (!recordTypes['preventive_care']) {
            recommendations.push('Schedule preventive care checkup');
        }
        
        if (recordTypes['lab_results'] && recordTypes['lab_results'] < 2) {
            recommendations.push('Consider regular lab work monitoring');
        }
        
        return recommendations;
    }
}

// Health Token System
class HealthToken {
    constructor() {
        this.name = 'BioVerse Health Token';
        this.symbol = 'BVH';
        this.decimals = 18;
        this.totalSupply = 1000000000 * Math.pow(10, 18); // 1 billion tokens
        this.balances = new Map();
        this.allowances = new Map();
        this.healthScores = new Map();
        this.rewardHistory = [];
    }

    balanceOf(address) {
        return this.balances.get(address) || 0;
    }

    transfer(from, to, amount) {
        const fromBalance = this.balanceOf(from);
        
        if (fromBalance < amount) {
            throw new Error('Insufficient balance');
        }

        this.balances.set(from, fromBalance - amount);
        this.balances.set(to, this.balanceOf(to) + amount);

        return true;
    }

    rewardHealthyBehavior(userAddress, tokenAmount, behavior) {
        try {
            const currentBalance = this.balanceOf(userAddress);
            this.balances.set(userAddress, currentBalance + tokenAmount);

            const reward = {
                user: userAddress,
                amount: tokenAmount,
                behavior,
                timestamp: new Date().toISOString(),
                type: 'healthy_behavior'
            };

            this.rewardHistory.push(reward);

            logger.info(`Health behavior rewarded: ${userAddress} received ${tokenAmount} BVH for ${behavior}`);
            return reward;

        } catch (error) {
            logger.error('Error rewarding healthy behavior:', error);
            throw error;
        }
    }

    achieveHealthGoal(userAddress, goal, bonusMultiplier = 1) {
        try {
            const baseReward = 1000 * Math.pow(10, this.decimals);
            const bonus = baseReward * bonusMultiplier;

            const currentBalance = this.balanceOf(userAddress);
            this.balances.set(userAddress, currentBalance + bonus);

            // Update health score
            const currentScore = this.healthScores.get(userAddress) || 0;
            this.healthScores.set(userAddress, currentScore + 10);

            const achievement = {
                user: userAddress,
                goal,
                bonus,
                bonusMultiplier,
                timestamp: new Date().toISOString(),
                type: 'health_goal_achievement'
            };

            this.rewardHistory.push(achievement);

            logger.info(`Health goal achieved: ${userAddress} achieved ${goal} and received ${bonus} BVH`);
            return achievement;

        } catch (error) {
            logger.error('Error processing health goal achievement:', error);
            throw error;
        }
    }

    getHealthScore(userAddress) {
        return this.healthScores.get(userAddress) || 0;
    }

    getRewardHistory(userAddress) {
        return this.rewardHistory.filter(reward => reward.user === userAddress);
    }

    getTotalRewards(userAddress) {
        return this.getRewardHistory(userAddress)
            .reduce((total, reward) => total + (reward.amount || reward.bonus || 0), 0);
    }
}

module.exports = {
    HealthBlockchain,
    HealthRecord,
    HealthToken,
    Block
};