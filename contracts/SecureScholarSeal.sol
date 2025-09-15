// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import { euint32, externalEuint32, euint8, ebool, FHE } from "@fhevm/solidity/lib/FHE.sol";

contract SecureScholarSeal is SepoliaConfig {
    using FHE for *;
    
    struct ScholarProfile {
        euint32 profileId;
        euint32 academicScore;
        euint32 verificationLevel;
        euint32 reputationScore;
        bool isVerified;
        bool isActive;
        string name;
        string institution;
        string specialization;
        address scholar;
        uint256 createdAt;
        uint256 lastUpdated;
    }
    
    struct Credential {
        euint32 credentialId;
        euint32 score;
        euint32 validityPeriod;
        bool isRevoked;
        bool isVerified;
        string credentialType;
        string issuer;
        string metadataHash;
        address owner;
        uint256 issuedAt;
        uint256 expiresAt;
    }
    
    struct VerificationRequest {
        euint32 requestId;
        euint32 verificationScore;
        bool isApproved;
        bool isProcessed;
        string requestType;
        string evidenceHash;
        address requester;
        address verifier;
        uint256 submittedAt;
        uint256 processedAt;
    }
    
    struct AcademicRecord {
        euint32 recordId;
        euint32 gpa;
        euint32 creditHours;
        euint32 semesterCount;
        bool isGraduated;
        string degreeType;
        string major;
        string institution;
        address student;
        uint256 enrollmentDate;
        uint256 graduationDate;
    }
    
    mapping(uint256 => ScholarProfile) public scholarProfiles;
    mapping(uint256 => Credential) public credentials;
    mapping(uint256 => VerificationRequest) public verificationRequests;
    mapping(uint256 => AcademicRecord) public academicRecords;
    mapping(address => euint32) public scholarReputation;
    mapping(address => euint32) public institutionReputation;
    
    uint256 public profileCounter;
    uint256 public credentialCounter;
    uint256 public requestCounter;
    uint256 public recordCounter;
    
    address public owner;
    address public verifier;
    address public institutionManager;
    
    event ProfileCreated(uint256 indexed profileId, address indexed scholar, string name);
    event CredentialIssued(uint256 indexed credentialId, address indexed owner, string credentialType);
    event VerificationRequested(uint256 indexed requestId, address indexed requester, string requestType);
    event VerificationProcessed(uint256 indexed requestId, bool isApproved, address indexed verifier);
    event AcademicRecordAdded(uint256 indexed recordId, address indexed student, string institution);
    event ReputationUpdated(address indexed user, uint32 reputation);
    
    constructor(address _verifier, address _institutionManager) {
        owner = msg.sender;
        verifier = _verifier;
        institutionManager = _institutionManager;
    }
    
    function createScholarProfile(
        string memory _name,
        string memory _institution,
        string memory _specialization,
        externalEuint32 academicScore,
        bytes calldata inputProof
    ) public returns (uint256) {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_institution).length > 0, "Institution cannot be empty");
        
        uint256 profileId = profileCounter++;
        
        // Convert externalEuint32 to euint32 using FHE.fromExternal
        euint32 internalScore = FHE.fromExternal(academicScore, inputProof);
        
        scholarProfiles[profileId] = ScholarProfile({
            profileId: FHE.asEuint32(0), // Will be set properly later
            academicScore: internalScore,
            verificationLevel: FHE.asEuint32(0),
            reputationScore: FHE.asEuint32(0),
            isVerified: false,
            isActive: true,
            name: _name,
            institution: _institution,
            specialization: _specialization,
            scholar: msg.sender,
            createdAt: block.timestamp,
            lastUpdated: block.timestamp
        });
        
        emit ProfileCreated(profileId, msg.sender, _name);
        return profileId;
    }
    
    function issueCredential(
        address _owner,
        string memory _credentialType,
        string memory _issuer,
        string memory _metadataHash,
        externalEuint32 score,
        externalEuint32 validityPeriod,
        bytes calldata inputProof
    ) public returns (uint256) {
        require(msg.sender == institutionManager, "Only institution manager can issue credentials");
        require(_owner != address(0), "Invalid owner address");
        require(bytes(_credentialType).length > 0, "Credential type cannot be empty");
        
        uint256 credentialId = credentialCounter++;
        
        // Convert externalEuint32 to euint32 using FHE.fromExternal
        euint32 internalScore = FHE.fromExternal(score, inputProof);
        euint32 internalValidityPeriod = FHE.fromExternal(validityPeriod, inputProof);
        
        credentials[credentialId] = Credential({
            credentialId: FHE.asEuint32(0), // Will be set properly later
            score: internalScore,
            validityPeriod: internalValidityPeriod,
            isRevoked: false,
            isVerified: true,
            credentialType: _credentialType,
            issuer: _issuer,
            metadataHash: _metadataHash,
            owner: _owner,
            issuedAt: block.timestamp,
            expiresAt: block.timestamp + 365 days // Default 1 year validity
        });
        
        emit CredentialIssued(credentialId, _owner, _credentialType);
        return credentialId;
    }
    
    function submitVerificationRequest(
        string memory _requestType,
        string memory _evidenceHash,
        externalEuint32 verificationScore,
        bytes calldata inputProof
    ) public returns (uint256) {
        require(bytes(_requestType).length > 0, "Request type cannot be empty");
        require(bytes(_evidenceHash).length > 0, "Evidence hash cannot be empty");
        
        uint256 requestId = requestCounter++;
        
        // Convert externalEuint32 to euint32 using FHE.fromExternal
        euint32 internalScore = FHE.fromExternal(verificationScore, inputProof);
        
        verificationRequests[requestId] = VerificationRequest({
            requestId: FHE.asEuint32(0), // Will be set properly later
            verificationScore: internalScore,
            isApproved: false,
            isProcessed: false,
            requestType: _requestType,
            evidenceHash: _evidenceHash,
            requester: msg.sender,
            verifier: address(0),
            submittedAt: block.timestamp,
            processedAt: 0
        });
        
        emit VerificationRequested(requestId, msg.sender, _requestType);
        return requestId;
    }
    
    function processVerificationRequest(
        uint256 requestId,
        bool isApproved
    ) public {
        require(msg.sender == verifier, "Only verifier can process requests");
        require(verificationRequests[requestId].requester != address(0), "Request does not exist");
        require(!verificationRequests[requestId].isProcessed, "Request already processed");
        
        verificationRequests[requestId].isApproved = isApproved;
        verificationRequests[requestId].isProcessed = true;
        verificationRequests[requestId].verifier = msg.sender;
        verificationRequests[requestId].processedAt = block.timestamp;
        
        emit VerificationProcessed(requestId, isApproved, msg.sender);
    }
    
    function addAcademicRecord(
        address _student,
        string memory _degreeType,
        string memory _major,
        string memory _institution,
        externalEuint32 gpa,
        externalEuint32 creditHours,
        externalEuint32 semesterCount,
        bool _isGraduated,
        bytes calldata inputProof
    ) public returns (uint256) {
        require(msg.sender == institutionManager, "Only institution manager can add records");
        require(_student != address(0), "Invalid student address");
        require(bytes(_degreeType).length > 0, "Degree type cannot be empty");
        
        uint256 recordId = recordCounter++;
        
        // Convert externalEuint32 to euint32 using FHE.fromExternal
        euint32 internalGpa = FHE.fromExternal(gpa, inputProof);
        euint32 internalCreditHours = FHE.fromExternal(creditHours, inputProof);
        euint32 internalSemesterCount = FHE.fromExternal(semesterCount, inputProof);
        
        academicRecords[recordId] = AcademicRecord({
            recordId: FHE.asEuint32(0), // Will be set properly later
            gpa: internalGpa,
            creditHours: internalCreditHours,
            semesterCount: internalSemesterCount,
            isGraduated: _isGraduated,
            degreeType: _degreeType,
            major: _major,
            institution: _institution,
            student: _student,
            enrollmentDate: block.timestamp,
            graduationDate: _isGraduated ? block.timestamp : 0
        });
        
        emit AcademicRecordAdded(recordId, _student, _institution);
        return recordId;
    }
    
    function updateReputation(address user, euint32 reputation) public {
        require(msg.sender == verifier, "Only verifier can update reputation");
        require(user != address(0), "Invalid user address");
        
        // Determine if user is scholar or institution based on context
        if (scholarProfiles[profileCounter - 1].scholar == user) {
            scholarReputation[user] = reputation;
        } else {
            institutionReputation[user] = reputation;
        }
        
        emit ReputationUpdated(user, 0); // FHE.decrypt(reputation) - will be decrypted off-chain
    }
    
    function revokeCredential(uint256 credentialId) public {
        require(msg.sender == institutionManager, "Only institution manager can revoke credentials");
        require(credentials[credentialId].owner != address(0), "Credential does not exist");
        
        credentials[credentialId].isRevoked = true;
    }
    
    function getScholarProfileInfo(uint256 profileId) public view returns (
        string memory name,
        string memory institution,
        string memory specialization,
        uint8 academicScore,
        uint8 verificationLevel,
        uint8 reputationScore,
        bool isVerified,
        bool isActive,
        address scholar,
        uint256 createdAt,
        uint256 lastUpdated
    ) {
        ScholarProfile storage profile = scholarProfiles[profileId];
        return (
            profile.name,
            profile.institution,
            profile.specialization,
            0, // FHE.decrypt(profile.academicScore) - will be decrypted off-chain
            0, // FHE.decrypt(profile.verificationLevel) - will be decrypted off-chain
            0, // FHE.decrypt(profile.reputationScore) - will be decrypted off-chain
            profile.isVerified,
            profile.isActive,
            profile.scholar,
            profile.createdAt,
            profile.lastUpdated
        );
    }
    
    function getCredentialInfo(uint256 credentialId) public view returns (
        uint8 score,
        uint8 validityPeriod,
        bool isRevoked,
        bool isVerified,
        string memory credentialType,
        string memory issuer,
        string memory metadataHash,
        address owner,
        uint256 issuedAt,
        uint256 expiresAt
    ) {
        Credential storage credential = credentials[credentialId];
        return (
            0, // FHE.decrypt(credential.score) - will be decrypted off-chain
            0, // FHE.decrypt(credential.validityPeriod) - will be decrypted off-chain
            credential.isRevoked,
            credential.isVerified,
            credential.credentialType,
            credential.issuer,
            credential.metadataHash,
            credential.owner,
            credential.issuedAt,
            credential.expiresAt
        );
    }
    
    function getVerificationRequestInfo(uint256 requestId) public view returns (
        uint8 verificationScore,
        bool isApproved,
        bool isProcessed,
        string memory requestType,
        string memory evidenceHash,
        address requester,
        address verifier,
        uint256 submittedAt,
        uint256 processedAt
    ) {
        VerificationRequest storage request = verificationRequests[requestId];
        return (
            0, // FHE.decrypt(request.verificationScore) - will be decrypted off-chain
            request.isApproved,
            request.isProcessed,
            request.requestType,
            request.evidenceHash,
            request.requester,
            request.verifier,
            request.submittedAt,
            request.processedAt
        );
    }
    
    function getAcademicRecordInfo(uint256 recordId) public view returns (
        uint8 gpa,
        uint8 creditHours,
        uint8 semesterCount,
        bool isGraduated,
        string memory degreeType,
        string memory major,
        string memory institution,
        address student,
        uint256 enrollmentDate,
        uint256 graduationDate
    ) {
        AcademicRecord storage record = academicRecords[recordId];
        return (
            0, // FHE.decrypt(record.gpa) - will be decrypted off-chain
            0, // FHE.decrypt(record.creditHours) - will be decrypted off-chain
            0, // FHE.decrypt(record.semesterCount) - will be decrypted off-chain
            record.isGraduated,
            record.degreeType,
            record.major,
            record.institution,
            record.student,
            record.enrollmentDate,
            record.graduationDate
        );
    }
    
    function getScholarReputation(address scholar) public view returns (uint8) {
        return 0; // FHE.decrypt(scholarReputation[scholar]) - will be decrypted off-chain
    }
    
    function getInstitutionReputation(address institution) public view returns (uint8) {
        return 0; // FHE.decrypt(institutionReputation[institution]) - will be decrypted off-chain
    }
}
