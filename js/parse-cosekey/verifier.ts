import crypto from 'crypto';
import { COSEAlgorithm, COSEKeyCommonParameter } from './coseKey';
import KeyParseError from './exception/keyParseError';
import { JSONWebKeyParameter, JSONWebSignatureAndEncryptionAlgorithm } from './joseKey';
import KeyParser from './keyParser';

type coseMap = Map<number, any>;

type jwk = {
  kty?: string;
  use?: string;
  key_ops?: string[];
  alg?: string;
  kid?: string;
  x5u?: string;
  x5c?: string[];
  x5t?: string;
  'x5t#S256'?: string;
  crv?: string;
  x?: string;
  y?: string;
  d?: string;
  n?: string;
  e?: string;
  p?: string;
  q?: string;
  dp?: string;
  dq?: string;
  qi?: string;
  oth?: {
    r?: string;
    d?: string;
    t?: string;
  }[];
  k?: string;
  ext?: boolean;
  [key: string]: unknown;
};

type pem = string;

/**
 * Verify data using signature and key(COSE, JWK or PEM).
 */
class Verifier {
  private constructor() {
    // private constructor
  }

  /**
   * Verify data using signature and COSE key.
   *
   * @param data verification content
   * @param signature calculated signature for data
   * @param key public key
   * @returns Validity of signature
   * @throws {@link KeyParseError} if COSE key is imperfect
   */
  static async verifyWithCOSEKey(data: Buffer, signature: Buffer, key: coseMap): Promise<boolean> {
    const cosealg = COSEAlgorithm.fromValue(key.get(COSEKeyCommonParameter.ALG.label));
    if (cosealg == null) {
      throw new KeyParseError('Cose map does not have valid alg value.');
    }
    const pem = await KeyParser.cose2pem(key);

    return Verifier.verifyWithPEM(data, signature, pem, cosealg.name, cosealg.nodeCryptoHashAlg || 'sha256');
  }

  /**
   * Verify data using signature and JWK.
   *
   * @param data verification content
   * @param signature calculated signature for data
   * @param key public key
   * @returns Validity of signature
   * @throws {@link KeyParseError} if JWK is imperfect
   */
  static async verifyWithJWK(data: Buffer, signature: Buffer, key: jwk): Promise<boolean> {
    const rawJwkalg = key[JSONWebKeyParameter.ALG.name];
    if (typeof rawJwkalg !== 'string') {
      throw new KeyParseError('JWK does not have valid alg value.');
    }
    const jwkalg = JSONWebSignatureAndEncryptionAlgorithm.fromName(rawJwkalg);
    if (jwkalg == null) {
      throw new KeyParseError('JWK does not have valid alg value.');
    }
    const pem = await KeyParser.jwk2pem(key);

    return Verifier.verifyWithPEM(data, signature, pem, jwkalg.name, jwkalg.nodeCryptoHashAlg || 'sha256');
  }

  /**
   * Verify data using signature and PEM.
   *
   * @param data verification content
   * @param signature calculated signature for data
   * @param key public key
   * @returns Validity of signature
   */
  static verifyWithPEM(data: Buffer, signature: Buffer, key: pem, algorithm: string, hashAlgorithm?: string): boolean {
    if (algorithm === 'EdDSA') {
      return crypto.verify(null, data, key, signature);
    }

    let hashAlg = hashAlgorithm;
    if (hashAlg == null) {
      const matches = /^(PS|RS|ES|HS|RSA-OAEP-)(1|256|384|512)K?$/.exec(algorithm);
      if (matches != null) {
        hashAlg = 'sha' + matches[2];
      } else {
        hashAlg = 'sha256';
      }
    }
    const verify = crypto.createVerify(hashAlg);
    verify.update(data);
    if (/^PS(256|384|512)$/.test(algorithm)) {
      return verify.verify(
        {
          key,
          padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
          saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST,
        },
        signature,
      );
    } else {
      return verify.verify(key, signature);
    }
  }
}

export default Verifier;
