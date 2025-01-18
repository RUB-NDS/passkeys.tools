import KeyParseError from './exception/keyParseError';

abstract class COSEKeyParameterValue {}

/**
 * COSE Key Types.
 * {@link https://www.iana.org/assignments/cose/cose.xhtml#key-type}
 */
class COSEKeyType extends COSEKeyParameterValue {
  static _values: COSEKeyType[] = [];

  static readonly OKP = new COSEKeyType('OKP', 1, 'Octet Key Pair');
  static readonly EC2 = new COSEKeyType('EC2', 2, 'Elliptic Curve Keys w/ x- and y-coordinate pair');
  static readonly RSA = new COSEKeyType('RSA', 3, 'RSA Key');
  static readonly SYMMETRIC = new COSEKeyType('Symmetric', 4, 'Symmetric Keys');
  static readonly HSS_LMS = new COSEKeyType('HSS-LMS', 5, 'Public key for HSS/LMS hash-based digital signature');
  static readonly WALNUT_DSA = new COSEKeyType('WalnutDSA', 6, 'WalnutDSA	public key');

  private constructor(private _name: string, private _value: number, private _description: string) {
    super();
    COSEKeyType._values.push(this);
  }

  get name(): string {
    return this._name;
  }

  get value(): number {
    return this._value;
  }

  get description(): string {
    return this._description;
  }

  static values(): COSEKeyType[] {
    return COSEKeyType._values;
  }

  static fromValue(value: number): COSEKeyType | null {
    const found = COSEKeyType.values().find((c) => {
      return c.value === value;
    });

    return found || null;
  }

  static fromName(name: string): COSEKeyType | null {
    const found = COSEKeyType.values().find((c) => {
      return c.name === name;
    });

    return found || null;
  }
}

abstract class COSEKeyParameter {}

/**
 * COSE Key Common Parameters.
 * {@link https://www.iana.org/assignments/cose/cose.xhtml#key-common-parameters}
 */
class COSEKeyCommonParameter extends COSEKeyParameter {
  private static _values = [] as COSEKeyCommonParameter[];

  static readonly KTY = new COSEKeyCommonParameter('kty', 1, 'Identification of the key type');
  static readonly KID = new COSEKeyCommonParameter('kid', 2, 'Key identification value -- match to kid in message');
  static readonly ALG = new COSEKeyCommonParameter('alg', 3, 'Key usage restriction to this algorithm');
  static readonly KEY_OPS = new COSEKeyCommonParameter('key_ops', 4, 'Restrict set of permissible operations');
  static readonly BASE_IV = new COSEKeyCommonParameter('Base IV', 5, 'Base IV to be xor-ed with Partial IVs');

  private constructor(private _name: string, private _label: number, private _description: string) {
    super();
    COSEKeyCommonParameter._values.push(this);
  }

  get name(): string {
    return this._name;
  }

  get label(): number {
    return this._label;
  }

  get description(): string {
    return this._description;
  }

  static values(): COSEKeyCommonParameter[] {
    return COSEKeyCommonParameter._values;
  }

  static fromLabel(label: number): COSEKeyCommonParameter | null {
    const found = COSEKeyCommonParameter.values().find((c) => {
      return c.label === label;
    });

    return found || null;
  }

  static fromName(name: string): COSEKeyCommonParameter | null {
    const found = COSEKeyCommonParameter.values().find((c) => {
      return c.name === name;
    });

    return found || null;
  }
}

/**
 * COSE Key Type Parameters.
 * {@link https://www.iana.org/assignments/cose/cose.xhtml#key-type-parameters}
 */
class COSEKeyTypeParameter extends COSEKeyParameter {
  private static _values = [] as COSEKeyTypeParameter[];

  static readonly OKP_CRV = new COSEKeyTypeParameter(
    COSEKeyType.OKP,
    'crv',
    -1,
    'EC identifier - Taken from the "COSE Elliptic Curves" registry',
  );
  static readonly OKP_X = new COSEKeyTypeParameter(COSEKeyType.OKP, 'x', -2, 'x-coordinate');
  static readonly OKP_D = new COSEKeyTypeParameter(COSEKeyType.OKP, 'd', -4, 'Private key');
  static readonly EC2_CRV = new COSEKeyTypeParameter(
    COSEKeyType.EC2,
    'crv',
    -1,
    'EC identifier - Taken from the "COSE Elliptic Curves" registry',
  );
  static readonly EC2_X = new COSEKeyTypeParameter(COSEKeyType.EC2, 'x', -2, 'Public Key');
  static readonly EC2_Y = new COSEKeyTypeParameter(COSEKeyType.EC2, 'y', -3, 'y-coordinate');
  static readonly EC2_D = new COSEKeyTypeParameter(COSEKeyType.EC2, 'd', -4, 'Private key');
  static readonly RSA_N = new COSEKeyTypeParameter(COSEKeyType.RSA, 'n', -1, 'the RSA modulus n');
  static readonly RSA_E = new COSEKeyTypeParameter(COSEKeyType.RSA, 'e', -2, 'the RSA public exponent e');
  static readonly RSA_D = new COSEKeyTypeParameter(COSEKeyType.RSA, 'd', -3, 'the RSA private exponent d');
  static readonly RSA_P = new COSEKeyTypeParameter(COSEKeyType.RSA, 'p', -4, 'the prime factor p of n');
  static readonly RSA_Q = new COSEKeyTypeParameter(COSEKeyType.RSA, 'q', -5, 'the prime factor q of n');
  static readonly RSA_DP = new COSEKeyTypeParameter(COSEKeyType.RSA, 'dP', -6, 'dP is d mod (p - 1)');
  static readonly RSA_DQ = new COSEKeyTypeParameter(COSEKeyType.RSA, 'dQ', -7, 'dQ is d mod (q - 1)');
  static readonly RSA_QINV = new COSEKeyTypeParameter(
    COSEKeyType.RSA,
    'qInv',
    -8,
    'qInv is the CRT coefficient q^(-1) mod p',
  );
  static readonly OTHER = new COSEKeyTypeParameter(COSEKeyType.RSA, 'other', -9, 'other prime infos, an array');
  static readonly R_I = new COSEKeyTypeParameter(COSEKeyType.RSA, 'r_i', -10, 'a prime factor r_i of n, where i >= 3');
  static readonly D_I = new COSEKeyTypeParameter(COSEKeyType.RSA, 'd_i', -11, 'd_i = d mod (r_i - 1)');
  static readonly T_I = new COSEKeyTypeParameter(
    COSEKeyType.RSA,
    't_i',
    -12,
    'the CRT coefficient t_i = (r_1 * r_2 * ... * r_(i-1))^(-1) mod r_i',
  );
  static readonly SYMMETRIC_K = new COSEKeyTypeParameter(COSEKeyType.SYMMETRIC, 'k', -1, 'Key Value');
  static readonly PUB = new COSEKeyTypeParameter(
    COSEKeyType.HSS_LMS,
    'pub',
    -1,
    'Public key for HSS/LMS hash-based digital signature',
  );
  static readonly WALNUTRSA_N = new COSEKeyTypeParameter(
    COSEKeyType.WALNUT_DSA,
    'N',
    -1,
    'Group and Matrix (NxN) size',
  );
  static readonly WALNUTRSA_Q = new COSEKeyTypeParameter(COSEKeyType.WALNUT_DSA, 'q', -2, 'Finite field F_q');
  static readonly T_VALUES = new COSEKeyTypeParameter(
    COSEKeyType.WALNUT_DSA,
    't-values',
    -3,
    'List of T-values, entries in F_q',
  );
  static readonly MATRIX_1 = new COSEKeyTypeParameter(
    COSEKeyType.WALNUT_DSA,
    'matrix 1',
    -4,
    'NxN Matrix of entries in F_q in column-major form',
  );
  static readonly PERMUTATION_1 = new COSEKeyTypeParameter(
    COSEKeyType.WALNUT_DSA,
    'permutation',
    -5,
    'Permutation associated with matrix 1',
  );
  static readonly MATRIX_2 = new COSEKeyTypeParameter(
    COSEKeyType.WALNUT_DSA,
    'matrix 2',
    -6,
    'NxN Matrix of entries in F_q in column-major form',
  );

  private constructor(
    private _keyType: COSEKeyType,
    private _name: string,
    private _label: number,
    private _description: string,
  ) {
    super();
    COSEKeyTypeParameter._values.push(this);
  }

  get keyType(): COSEKeyType {
    return this._keyType;
  }

  get name(): string {
    return this._name;
  }

  get label(): number {
    return this._label;
  }

  get description(): string {
    return this._description;
  }

  static values(): COSEKeyTypeParameter[] {
    return COSEKeyTypeParameter._values;
  }

  static fromLabel(keyType: COSEKeyType, label: number): COSEKeyTypeParameter | null {
    const found = COSEKeyTypeParameter.values().find((c) => {
      return c.keyType === keyType && c.label === label;
    });

    return found || null;
  }

  static fromName(keyType: COSEKeyType, name: string): COSEKeyTypeParameter | null {
    const found = COSEKeyTypeParameter.values().find((c) => {
      return c.keyType === keyType && c.name === name;
    });

    return found || null;
  }
}

class COSEKeyOperationValue extends COSEKeyParameterValue {
  static _values = [] as COSEKeyOperationValue[];

  static readonly SIGN = new COSEKeyOperationValue(
    'sign',
    1,
    'The key is used to create signatures.  Requires private key fields.',
  );
  static readonly VERIFY = new COSEKeyOperationValue('verify', 2, 'The key is used for verification of signatures.');
  static readonly ENCRYPT = new COSEKeyOperationValue('encrypt', 3, 'The key is used for key transport encryption.');
  static readonly DECRYPT = new COSEKeyOperationValue(
    'decrypt',
    4,
    'The key is used for key transport decryption.  Requires private key fields.',
  );
  static readonly WRAP_KEY = new COSEKeyOperationValue('wrap key', 5, 'The key is used for key wrap encryption.');
  static readonly UNWRAP_KEY = new COSEKeyOperationValue(
    'unwrap key',
    6,
    'The key is used for key wrap decryption.  Requires private key fields.',
  );
  static readonly DERIVE_KEY = new COSEKeyOperationValue(
    'derive key',
    7,
    'The key is used for deriving keys.  Requires private key fields.',
  );
  static readonly DERIVE_BITS = new COSEKeyOperationValue(
    'derive bits',
    8,
    'The key is used for deriving bits not to be used as a key.  Requires private key fields.',
  );
  static readonly MAC_CREATE = new COSEKeyOperationValue('MAC create', 9, 'The key is used for creating MACs.');
  static readonly MAC_VERIFY = new COSEKeyOperationValue('MAC verify', 10, 'The key is used for validating MACs.');

  private constructor(private _name: string, private _value: number, private _description: string) {
    super();
    COSEKeyOperationValue._values.push(this);
  }

  get name(): string {
    return this._name;
  }

  get value(): number {
    return this._value;
  }

  get description(): string {
    return this._description;
  }

  static values(): COSEKeyOperationValue[] {
    return COSEKeyOperationValue._values;
  }

  static fromValue(value: number): COSEKeyOperationValue | null {
    const found = COSEKeyOperationValue.values().find((c) => {
      return c.value === value;
    });

    return found || null;
  }

  static fromName(name: string): COSEKeyOperationValue | null {
    const found = COSEKeyOperationValue.values().find((c) => {
      return c.name === name;
    });

    return found || null;
  }
}

class COSEEllipticCurve extends COSEKeyParameterValue {
  static _values = [] as COSEEllipticCurve[];

  static readonly P_256 = new COSEEllipticCurve('P-256', 1, COSEKeyType.EC2, 'NIST P-256 also known as secp256r1');
  static readonly P_384 = new COSEEllipticCurve('P-384', 2, COSEKeyType.EC2, 'NIST P-384 also known as secp384r1');
  static readonly P_512 = new COSEEllipticCurve('P-512', 3, COSEKeyType.EC2, 'NIST P-512 also known as secp512r1');
  static readonly X25519 = new COSEEllipticCurve('X25519', 4, COSEKeyType.OKP, 'X25519 for use w/ ECDH only');
  static readonly X448 = new COSEEllipticCurve('X448', 5, COSEKeyType.OKP, 'X448 for use w/ ECDH only');
  static readonly ED25519 = new COSEEllipticCurve('Ed25519', 6, COSEKeyType.OKP, 'Ed25519 for use w/ EdDSA only');
  static readonly ED448 = new COSEEllipticCurve('Ed448', 7, COSEKeyType.OKP, 'Ed448 for use w/ EdDSA only');
  static readonly SECP256K1 = new COSEEllipticCurve('secp256k1', 8, COSEKeyType.EC2, 'SECG secp256k1 curve');

  private constructor(
    private _name: string,
    private _value: number,
    private _keyType: COSEKeyType,
    private _description: string,
  ) {
    super();
    COSEEllipticCurve._values.push(this);
  }

  get name(): string {
    return this._name;
  }

  get value(): number {
    return this._value;
  }

  get keyType(): COSEKeyType {
    return this._keyType;
  }

  get description(): string {
    return this._description;
  }

  static values(): COSEEllipticCurve[] {
    return COSEEllipticCurve._values;
  }

  static fromValue(keyType: COSEKeyType, value: number): COSEEllipticCurve | null {
    const found = COSEEllipticCurve.values().find((c) => {
      return c.keyType === keyType && c.value === value;
    });

    return found || null;
  }

  static fromName(keyType: COSEKeyType, name: string): COSEEllipticCurve | null {
    const found = COSEEllipticCurve.values().find((c) => {
      return c.keyType === keyType && c.name === name;
    });

    return found || null;
  }
}

class COSEAlgorithm extends COSEKeyParameterValue {
  private static _values = [] as COSEAlgorithm[];

  static readonly RS1 = new COSEAlgorithm('RS1', -65535, 'RSASSA-PKCS1-v1_5 using SHA-1', 'sha1');
  static readonly WALNUT_DSA = new COSEAlgorithm('WalnutDSA', -260, 'WalnutDSA signature', null);
  static readonly RS512 = new COSEAlgorithm('RS512', -259, 'RSASSA-PKCS1-v1_5 using SHA-512', 'sha512');
  static readonly RS384 = new COSEAlgorithm('RS384', -258, 'RSASSA-PKCS1-v1_5 using SHA-384', 'sha384');
  static readonly RS256 = new COSEAlgorithm('RS256', -257, 'RSASSA-PKCS1-v1_5 using SHA-256', 'sha256');
  static readonly ES256K = new COSEAlgorithm('ES256K', -47, 'ECDSA using secp256k1 curve and SHA-256', 'sha256');
  static readonly HSS_LMS = new COSEAlgorithm('HSS-LMS', -46, 'HSS/LMS hash-based digital signature', null);
  static readonly SHAKE256 = new COSEAlgorithm('SHAKE256', -45, 'SHAKE-256 512-bit Hash Value', null);
  static readonly SHA_512 = new COSEAlgorithm('SHA-512', -44, 'SHA-2 512-bit Hash', null);
  static readonly SHA_384 = new COSEAlgorithm('SHA-384', -43, 'SHA-2 384-bit Hash', null);
  static readonly RSAES_OAEP_w_SHA_512 = new COSEAlgorithm(
    'RSAES-OAEP w/ SHA-512',
    -42,
    'RSAES-OAEP w/ SHA-512',
    'sha512',
  );
  static readonly RSAES_OAEP_w_SHA_256 = new COSEAlgorithm(
    'RSAES-OAEP w/ SHA-256',
    -41,
    'RSAES-OAEP w/ SHA-256',
    'sha256',
  );
  static readonly RSAES_OAEP_w_RFC8017_DEFAULT_PARAMETERS = new COSEAlgorithm(
    'RSAES-OAEP w/ RFC 8017 default parameters',
    -40,
    'RSAES-OAEP w/ SHA-1',
    null,
  );
  static readonly PS512 = new COSEAlgorithm('PS512', -39, 'RSASSA-PSS w/ SHA-512', 'sha512');
  static readonly PS384 = new COSEAlgorithm('PS384', -38, 'RSASSA-PSS w/ SHA-384', 'sha384');
  static readonly PS256 = new COSEAlgorithm('PS256', -37, 'RSASSA-PSS w/ SHA-256', 'sha256');
  static readonly ES512 = new COSEAlgorithm('ES512', -36, 'ECDSA w/ SHA-512', 'sha512');
  static readonly ES384 = new COSEAlgorithm('ES384', -35, 'ECDSA w/ SHA-384', 'sha384');
  static readonly ECDH_SS_A256KW = new COSEAlgorithm(
    'ECDH-SS + A256KW',
    -34,
    'ECDH SS w/ Concat KDF and AES Key Wrap w/ 256-bit key',
    null,
  );
  static readonly ECDH_SS_A192KW = new COSEAlgorithm(
    'ECDH-SS + A256KW',
    -33,
    'ECDH SS w/ Concat KDF and AES Key Wrap w/ 192-bit key',
    null,
  );
  static readonly ECDH_SS_A128KW = new COSEAlgorithm(
    'ECDH-SS + A128KW',
    -32,
    'ECDH SS w/ Concat KDF and AES Key Wrap w/ 128-bit key',
    null,
  );
  static readonly ECDH_ES_A256KW = new COSEAlgorithm(
    'ECDH-ES + A256KW',
    -31,
    'ECDH ES w/ Concat KDF and AES Key Wrap w/ 256-bit key',
    null,
  );
  static readonly ECDH_ES_A192KW = new COSEAlgorithm(
    'ECDH-ES + A192KW',
    -30,
    'ECDH ES w/ Concat KDF and AES Key Wrap w/ 192-bit key',
    null,
  );
  static readonly ECDH_ES_A128KW = new COSEAlgorithm(
    'ECDH-ES + A128KW',
    -29,
    'ECDH ES w/ Concat KDF and AES Key Wrap w/ 128-bit key',
    null,
  );
  static readonly ECDH_SS_HKDF_512 = new COSEAlgorithm(
    'ECDH-SS + HKDF-512',
    -28,
    'ECDH SS w/ HKDF - generate key directly',
    null,
  );
  static readonly ECDH_SS_HKDF_256 = new COSEAlgorithm(
    'ECDH-SS + HKDF-256',
    -27,
    'ECDH SS w/ HKDF - generate key directly',
    null,
  );
  static readonly ECDH_ES_HKDF_512 = new COSEAlgorithm(
    'ECDH-ES + HKDF-512',
    -26,
    'ECDH ES w/ HKDF - generate key directly',
    null,
  );
  static readonly ECDH_ES_HKDF_256 = new COSEAlgorithm(
    'ECDH-ES + HKDF-256',
    -25,
    'ECDH ES w/ HKDF - generate key directly',
    null,
  );
  static readonly SHAKE128 = new COSEAlgorithm('SHAKE128', -18, 'SHAKE-128 512-bit Hash Value', null);
  static readonly SHA_512_256 = new COSEAlgorithm('SHA-512/256', -17, 'SHA-2 512-bit Hash truncated to 256-bits', null);
  static readonly SHA_256 = new COSEAlgorithm('SHA-256', -16, 'SHA-2 256-bit Hash', null);
  static readonly SHA_256_64 = new COSEAlgorithm('SHA-256/64', -15, 'SHA-2 256-bit Hash truncated to 64-bits', null);
  static readonly SHA_1 = new COSEAlgorithm('SHA-1', -14, 'SHA-1 Hash', null);
  static readonly DIRECT_HKDF_AES_256 = new COSEAlgorithm(
    'direct+HKDF-AES-256',
    -13,
    'Shared secret w/ AES-MAC 256-bit key',
    null,
  );
  static readonly DIRECT_HKDF_AES_128 = new COSEAlgorithm(
    'direct+HKDF-AES-128',
    -12,
    'Shared secret w/ AES-MAC 128-bit key',
    null,
  );
  static readonly DIRECT_HKDF_SHA_512 = new COSEAlgorithm(
    'direct+HKDF-SHA-512',
    -11,
    'Shared secret w/ HKDF and SHA-512',
    null,
  );
  static readonly DIRECT_HKDF_SHA_256 = new COSEAlgorithm(
    'direct+HKDF-SHA-256',
    -10,
    'Shared secret w/ HKDF and SHA-256',
    null,
  );
  static readonly EdDSA = new COSEAlgorithm('EdDSA', -8, 'EdDSA', 'sha512');
  static readonly ES256 = new COSEAlgorithm('ES256', -7, 'ECDSA w/ SHA-256', 'sha256');
  static readonly DIRECT = new COSEAlgorithm('direct', -6, 'Direct use of CEK', null);
  static readonly A256KW = new COSEAlgorithm('A256KW', -5, 'AES Key Wrap w/ 256-bit key', null);
  static readonly A192KW = new COSEAlgorithm('A192KW', -4, 'AES Key Wrap w/ 192-bit key', null);
  static readonly A128KW = new COSEAlgorithm('A128KW', -3, 'AES Key Wrap w/ 128-bit key', null);
  static readonly A128GCM = new COSEAlgorithm('A128GCM', 1, 'AES-GCM mode w/ 128-bit key, 128-bit tag', null);
  static readonly A192GCM = new COSEAlgorithm('A192GCM', 2, 'AES-GCM mode w/ 192-bit key, 128-bit tag', null);
  static readonly A256GCM = new COSEAlgorithm('A256GCM', 3, 'AES-GCM mode w/ 256-bit key, 128-bit tag', null);
  static readonly HMAC_256_64 = new COSEAlgorithm('HMAC 256/64', 4, 'HMAC w/ SHA-256 truncated to 64 bits', 'sha256');
  static readonly HMAC_256_256 = new COSEAlgorithm('HMAC 256/256', 5, 'HMAC w/ SHA-256', 'sha256');
  static readonly HMAC_384_384 = new COSEAlgorithm('HMAC 384/384', 6, 'HMAC w/ SHA-384', 'sha384');
  static readonly HMAC_512_512 = new COSEAlgorithm('HMAC 512/512', 7, 'HMAC w/ SHA-512', 'sha512');
  static readonly AES_CCM_16_64_128 = new COSEAlgorithm(
    'AES-CCM-16-64-128',
    10,
    'AES-CCM mode 128-bit key, 64-bit tag, 13-byte nonce',
    null,
  );
  static readonly AES_CCM_16_64_256 = new COSEAlgorithm(
    'AES-CCM-16-64-256',
    11,
    'AES-CCM mode 256-bit key, 64-bit tag, 13-byte nonce',
    null,
  );
  static readonly AES_CCM_64_64_128 = new COSEAlgorithm(
    'AES-CCM-64-64-128',
    12,
    'AES-CCM mode 128-bit key, 64-bit tag, 7-byte nonce',
    null,
  );
  static readonly AES_CCM_64_64_256 = new COSEAlgorithm(
    'AES-CCM-64-64-256',
    13,
    'AES-CCM mode 256-bit key, 64-bit tag, 7-byte nonce',
    null,
  );
  static readonly AES_MAC_128_64 = new COSEAlgorithm('AES-MAC 128/64', 14, 'AES-MAC 128-bit key, 64-bit tag', null);
  static readonly AES_MAC_256_64 = new COSEAlgorithm('AES-MAC 256/64', 15, 'AES-MAC 256-bit key, 64-bit tag', null);
  static readonly CHACHA20_POLY1305 = new COSEAlgorithm(
    'ChaCha20/Poly1305',
    24,
    'ChaCha20/Poly1305 w/ 256-bit key, 128-bit tag',
    null,
  );
  static readonly AES_MAC_128_128 = new COSEAlgorithm('AES-MAC 128/128', 25, 'AES-MAC 128-bit key, 128-bit tag', null);
  static readonly AES_MAC_256_128 = new COSEAlgorithm('AES-MAC 256/128', 26, 'AES-MAC 256-bit key, 128-bit tag', null);
  static readonly AES_CCM_16_128_128 = new COSEAlgorithm(
    'AES-CCM-16-128-128',
    30,
    'AES-CCM mode 128-bit key, 128-bit tag, 13-byte nonce',
    null,
  );
  static readonly AES_CCM_16_128_256 = new COSEAlgorithm(
    'AES-CCM-16-128-256',
    31,
    'AES-CCM mode 256-bit key, 128-bit tag, 13-byte nonce',
    null,
  );
  static readonly AES_CCM_64_128_128 = new COSEAlgorithm(
    'AES-CCM-64-128-128',
    32,
    'AES-CCM mode 128-bit key, 128-bit tag, 7-byte nonce',
    null,
  );
  static readonly AES_CCM_64_128_256 = new COSEAlgorithm(
    'AES-CCM-64-128-256',
    33,
    'AES-CCM mode 256-bit key, 128-bit tag, 7-byte nonce',
    null,
  );
  static readonly IV_GENERATION = new COSEAlgorithm(
    'IV-GENERATION',
    34,
    'For doing IV generation for symmetric algorithms.',
    null,
  );

  private constructor(
    private _name: string,
    private _value: number,
    private _description: string,
    private _nodeCryptoHashAlg: string | null,
  ) {
    super();
    COSEAlgorithm._values.push(this);
  }

  get name(): string {
    return this._name;
  }

  get value(): number {
    return this._value;
  }

  get description(): string {
    return this._description;
  }

  get nodeCryptoHashAlg(): string | null {
    return this._nodeCryptoHashAlg;
  }

  static values(): COSEAlgorithm[] {
    return COSEAlgorithm._values;
  }

  static fromValue(value: number): COSEAlgorithm | null {
    const found = COSEAlgorithm.values().find((c) => {
      return c.value === value;
    });

    return found || null;
  }

  static fromName(name: string): COSEAlgorithm | null {
    const found = COSEAlgorithm.values().find((c) => {
      return c.name === name;
    });

    return found || null;
  }
}

class COSEKeyParameterValueMapping {
  private static _values = [] as COSEKeyParameterValueMapping[];

  static readonly KTY = new COSEKeyParameterValueMapping(COSEKeyCommonParameter.KTY, COSEKeyType);
  static readonly ALG = new COSEKeyParameterValueMapping(COSEKeyCommonParameter.ALG, COSEAlgorithm);
  static readonly KEY_OPS = new COSEKeyParameterValueMapping(COSEKeyCommonParameter.KEY_OPS, COSEKeyOperationValue);
  static readonly OKP_CRV = new COSEKeyParameterValueMapping(COSEKeyTypeParameter.OKP_CRV, COSEEllipticCurve);
  static readonly EC2_CRV = new COSEKeyParameterValueMapping(COSEKeyTypeParameter.EC2_CRV, COSEEllipticCurve);

  private constructor(
    private _parameter: COSEKeyCommonParameter | COSEKeyTypeParameter,
    private _value: COSEKeyParameterValue,
  ) {
    COSEKeyParameterValueMapping._values.push(this);
  }

  get parameter(): COSEKeyParameter {
    return this._parameter;
  }

  get value(): COSEKeyParameterValue {
    return this._value;
  }

  static values(): COSEKeyParameterValueMapping[] {
    return COSEKeyParameterValueMapping._values;
  }

  static fromParameter(parameter: COSEKeyParameter): COSEKeyParameterValueMapping | null {
    const found = COSEKeyParameterValueMapping.values().find((c) => {
      return c.parameter == parameter;
    });
    return found || null;
  }

  fromParameterLabel(label: number, keyType?: COSEKeyType): COSEKeyParameterValueMapping | null {
    const parameter =
      COSEKeyCommonParameter.fromLabel(label) ||
      COSEKeyTypeParameter.fromLabel(keyType || COSEKeyType.OKP, label) ||
      null;
    if (!parameter) {
      return null;
    }

    return COSEKeyParameterValueMapping.fromParameter(parameter);
  }

  fromValueLabel(label: any) {
    if (this._value === COSEKeyType) {
      return COSEKeyType.fromValue(label);
    } else if (this._value === COSEKeyOperationValue) {
      return COSEKeyOperationValue.fromValue(label);
    } else if (this._value === COSEEllipticCurve) {
      if (this === COSEKeyParameterValueMapping.OKP_CRV) {
        return COSEEllipticCurve.fromValue(COSEKeyType.OKP, label);
      } else if (this === COSEKeyParameterValueMapping.EC2_CRV) {
        return COSEEllipticCurve.fromValue(COSEKeyType.EC2, label);
      }
    } else if (this._value === COSEAlgorithm) {
      return COSEAlgorithm.fromValue(label);
    }

    return null;
  }

  fromValueName(name: string) {
    if (this._value === COSEKeyType) {
      return COSEKeyType.fromName(name);
    } else if (this._value === COSEKeyOperationValue) {
      return COSEKeyOperationValue.fromName(name);
    } else if (this._value === COSEEllipticCurve) {
      if (this === COSEKeyParameterValueMapping.OKP_CRV) {
        return COSEEllipticCurve.fromName(COSEKeyType.OKP, name);
      } else if (this === COSEKeyParameterValueMapping.EC2_CRV) {
        return COSEEllipticCurve.fromName(COSEKeyType.EC2, name);
      }
    } else if (this._value === COSEAlgorithm) {
      return COSEAlgorithm.fromName(name);
    }

    return null;
  }
}

export {
  COSEKeyCommonParameter,
  COSEKeyType,
  COSEKeyTypeParameter,
  COSEKeyOperationValue,
  COSEEllipticCurve,
  COSEAlgorithm,
  COSEKeyParameterValueMapping,
};
