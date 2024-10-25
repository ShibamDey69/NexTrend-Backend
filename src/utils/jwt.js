import crypto from 'crypto';

export class CryptoService {
    /**
     * Constructor for CryptoService class
     * @param {string} secret - The secret key used for encryption and decryption
     */
    constructor(secret) {
        if (!secret) {
            throw new Error('Secret is required');
        }
        
        // Generate a 256-bit key from the secret
        this.secret = secret;
        this.key = this.generateKey(secret);
        this.iv = crypto.randomBytes(16); // AES block size is 16 bytes
    }

    /**
     * Generates a 256-bit key from the secret using SHA-256
     * @param {string} secret - The secret used to generate the key
     * @returns {Buffer} - The generated 256-bit key
     */
    generateKey(secret) {
        return crypto.createHash('sha256').update(secret).digest();
    }

    /**
     * Encrypts the given text using AES-256-CBC
     * @param {string} text - The text to be encrypted
     * @returns {string} - The encrypted text with the IV
     */
    encrypt(text) {
        const cipher = crypto.createCipheriv('aes-256-cbc', this.key, this.iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return `${this.iv.toString('hex')}:${encrypted}`;
    }

    /**
     * Decrypts the given encrypted text using AES-256-CBC
     * @param {string} encryptedText - The encrypted text with the IV
     * @returns {string} - The decrypted text
     */
    decrypt(encryptedText) {
        const [ivHex, encrypted] = encryptedText.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', this.key, iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
}

export default CryptoService;
