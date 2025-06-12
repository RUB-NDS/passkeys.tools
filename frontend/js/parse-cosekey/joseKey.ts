/**
 * JSON Web Key (JWK) Types class.
 * "kty" (Key Type) parameter.
 *
 * RFC: {@link https://datatracker.ietf.org/doc/html/rfc7517#section-4.1}
 *
 * Registry: {@link https://www.iana.org/assignments/jose/jose.xhtml#web-key-types}
 */
class JSONWebKeyType {
  static _values = [] as JSONWebKeyType[];

  static readonly EC = new JSONWebKeyType('EC', 'Elliptic Curve');
  static readonly RSA = new JSONWebKeyType('RSA', 'RSA');
  static readonly OCT = new JSONWebKeyType('oct', 'Octet sequence');
  static readonly OKP = new JSONWebKeyType('OKP', 'Octet string key pairs');

  /**
   * Private constructor.
   *
   * @param _value key type.key type.
   * @param _description Key type description
   */
  private constructor(private _value: string, private _description: string) {
    JSONWebKeyType._values.push(this);
  }

  /**
   * Returns key type.
   *
   * @returns Key type
   */
  get value(): string {
    return this._value;
  }

  /**
   * Returns key type description.
   *
   * @returns Key type description
   */
  get description(): string {
    return this._description;
  }

  /**
   * Returns all JWK key type class.
   *
   * @returns All JWK key type class
   */
  static values(): JSONWebKeyType[] {
    return JSONWebKeyType._values;
  }

  /**
   * Returns JWK key type class which has same key type to function's parameter.
   *
   * @param value Target key type
   * @returns JWK key type class, if not found returns null
   */
  static fromValue(value: string): JSONWebKeyType | null {
    const found = JSONWebKeyType.values().find((j) => {
      return j.value === value;
    });

    return found || null;
  }
}

/**
 * JSON Web Signature and Encryption Algorithms class.
 * "alg" (Algorithm) parameter.
 *
 * RFC: {@link https://datatracker.ietf.org/doc/html/rfc7517#section-4.4}
 *
 * Registry: {@link https://www.iana.org/assignments/jose/jose.xhtml#web-signature-encryption-algorithms}
 */
class JSONWebSignatureAndEncryptionAlgorithm {
  static _values = [] as JSONWebSignatureAndEncryptionAlgorithm[];

  static readonly HS256 = new JSONWebSignatureAndEncryptionAlgorithm('HS256', 'HMAC using SHA-256', 'sha256');
  static readonly HS384 = new JSONWebSignatureAndEncryptionAlgorithm('HS384', 'HMAC using SHA-384', 'sha384');
  static readonly HS512 = new JSONWebSignatureAndEncryptionAlgorithm('HS512', 'HMAC using SHA-512', 'sha512');
  static readonly RS256 = new JSONWebSignatureAndEncryptionAlgorithm(
    'RS256',
    'RSASSA-PKCS1-v1_5 using SHA-256',
    'sha256',
  );
  static readonly RS384 = new JSONWebSignatureAndEncryptionAlgorithm(
    'RS384',
    'RSASSA-PKCS1-v1_5 using SHA-384',
    'sha384',
  );
  static readonly RS512 = new JSONWebSignatureAndEncryptionAlgorithm(
    'RS512',
    'RSASSA-PKCS1-v1_5 using SHA-512',
    'sha512',
  );
  static readonly ES256 = new JSONWebSignatureAndEncryptionAlgorithm(
    'ES256',
    'ECDSA using P-256 and SHA-256',
    'sha256',
  );
  static readonly ES384 = new JSONWebSignatureAndEncryptionAlgorithm(
    'ES384',
    'ECDSA using P-384 and SHA-384',
    'sha384',
  );
  static readonly ES512 = new JSONWebSignatureAndEncryptionAlgorithm(
    'ES512',
    'ECDSA using P-512 and SHA-512',
    'sha512',
  );
  static readonly PS256 = new JSONWebSignatureAndEncryptionAlgorithm(
    'PS256',
    'RSASSA-PSS using SHA-256 and MGF1 with SHA-256',
    'sha256',
  );
  static readonly PS384 = new JSONWebSignatureAndEncryptionAlgorithm(
    'PS384',
    'RSASSA-PSS using SHA-384 and MGF1 with SHA-384',
    'sha384',
  );
  static readonly PS512 = new JSONWebSignatureAndEncryptionAlgorithm(
    'PS512',
    'RSASSA-PSS using SHA-512 and MGF1 with SHA-512',
    'sha512',
  );
  static readonly NONE = new JSONWebSignatureAndEncryptionAlgorithm(
    'none',
    'No digital signature or MAC performed',
    null,
  );
  static readonly RSA1_5 = new JSONWebSignatureAndEncryptionAlgorithm('RSA1_5', 'RSAES-PKCS1-v1_5', null);
  static readonly RSA_OAEP = new JSONWebSignatureAndEncryptionAlgorithm(
    'RSA-OAEP',
    'RSAES OAEP using default parameters',
    null,
  );
  static readonly RSA_OAEP_256 = new JSONWebSignatureAndEncryptionAlgorithm(
    'RSA-OAEP-256',
    'RSAES OAEP using SHA-256 and MGF1 with SHA-256',
    'sha256',
  );
  static readonly A128KW = new JSONWebSignatureAndEncryptionAlgorithm('A128KW', 'AES Key Wrap using 128-bit key', null);
  static readonly A192KW = new JSONWebSignatureAndEncryptionAlgorithm('A192KW', 'AES Key Wrap using 192-bit key', null);
  static readonly A256KW = new JSONWebSignatureAndEncryptionAlgorithm('A256KW', 'AES Key Wrap using 256-bit key', null);
  static readonly DIR = new JSONWebSignatureAndEncryptionAlgorithm('dir', 'Direct use of a shared symmetric key', null);
  static readonly ECDH_ES = new JSONWebSignatureAndEncryptionAlgorithm('ECDH-ES', 'ECDH-ES using Concat KDF', null);
  static readonly ECDH_ES_A128KW = new JSONWebSignatureAndEncryptionAlgorithm(
    'ECDH-ES+A128KW',
    'ECDH-ES using Concat KDF and "A128KW" wrapping',
    null,
  );
  static readonly ECDH_ES_A192KW = new JSONWebSignatureAndEncryptionAlgorithm(
    'ECDH-ES+A192KW',
    'ECDH-ES using Concat KDF and "A192KW" wrapping',
    null,
  );
  static readonly ECDH_ES_A256KW = new JSONWebSignatureAndEncryptionAlgorithm(
    'ECDH-ES+A256KW',
    'ECDH-ES using Concat KDF and "A256KW" wrapping',
    null,
  );
  static readonly A128GCMKW = new JSONWebSignatureAndEncryptionAlgorithm(
    'A128GCMKW',
    'Key wrapping with AES GCM using 128-bit key',
    null,
  );
  static readonly A192GCMKW = new JSONWebSignatureAndEncryptionAlgorithm(
    'A192GCMKW',
    'Key wrapping with AES GCM using 192-bit key',
    null,
  );
  static readonly A256GCMKW = new JSONWebSignatureAndEncryptionAlgorithm(
    'A256GCMKW',
    'Key wrapping with AES GCM using 256-bit key',
    null,
  );
  static readonly PBES2_HS256_A128KW = new JSONWebSignatureAndEncryptionAlgorithm(
    'PBES2-HS256+A128KW',
    'PBES2 with HMAC SHA-256 and "A128KW" wrapping',
    null,
  );
  static readonly PBES2_HS384_A192KW = new JSONWebSignatureAndEncryptionAlgorithm(
    'PBES2-HS384+A192KW',
    'PBES2 with HMAC SHA-384 and "A192KW" wrapping',
    null,
  );
  static readonly PBES2_HS512_A256KW = new JSONWebSignatureAndEncryptionAlgorithm(
    'PBES2-HS512+A256KW',
    'PBES2 with HMAC SHA-512 and "A256KW" wrapping',
    null,
  );
  static readonly A128CBC_HS256 = new JSONWebSignatureAndEncryptionAlgorithm(
    'A128CBC-HS256',
    'AES_128_CBC_HMAC_SHA_256 authenticated encryption algorithm',
    null,
  );
  static readonly A192CBC_HS384 = new JSONWebSignatureAndEncryptionAlgorithm(
    'A192CBC-HS384',
    'AES_192_CBC_HMAC_SHA_384 authenticated encryption algorithm',
    null,
  );
  static readonly A256CBC_HS512 = new JSONWebSignatureAndEncryptionAlgorithm(
    'A256CBC-HS512',
    'AES_256_CBC_HMAC_SHA_512 authenticated encryption algorithm',
    null,
  );
  static readonly A128GCM = new JSONWebSignatureAndEncryptionAlgorithm('A128GCM', 'AES GCM using 128-bit key', null);
  static readonly A192GCM = new JSONWebSignatureAndEncryptionAlgorithm('A192GCM', 'AES GCM using 192-bit key', null);
  static readonly A256GCM = new JSONWebSignatureAndEncryptionAlgorithm('A256GCM', 'AES GCM using 256-bit key', null);
  static readonly EdDSA = new JSONWebSignatureAndEncryptionAlgorithm('EdDSA', 'EdDSA signature algorithms', 'sha512');
  static readonly RS1 = new JSONWebSignatureAndEncryptionAlgorithm('RS1', 'RSASSA-PKCS1-v1_5 with SHA-1', 'sha1');
  static readonly RSA_OAEP_384 = new JSONWebSignatureAndEncryptionAlgorithm(
    'RSA-OAEP-384',
    'RSA-OAEP using SHA-384 and MGF1 with SHA-384',
    'sha384',
  );
  static readonly RSA_OAEP_512 = new JSONWebSignatureAndEncryptionAlgorithm(
    'RSA-OAEP-512',
    'RSA-OAEP using SHA-512 and MGF1 with SHA-512',
    'sha512',
  );
  static readonly A128CBC = new JSONWebSignatureAndEncryptionAlgorithm('A128CBC', 'AES CBC using 128 bit key', null);
  static readonly A192CBC = new JSONWebSignatureAndEncryptionAlgorithm('A192CBC', 'AES CBC using 192 bit key', null);
  static readonly A256CBC = new JSONWebSignatureAndEncryptionAlgorithm('A256CBC', 'AES CBC using 256 bit key', null);
  static readonly A128CTR = new JSONWebSignatureAndEncryptionAlgorithm('A128CTR', 'AES CTR using 128 bit key', null);
  static readonly A192CTR = new JSONWebSignatureAndEncryptionAlgorithm('A192CTR', 'AES CTR using 192 bit key', null);
  static readonly A256CTR = new JSONWebSignatureAndEncryptionAlgorithm('A256CTR', 'AES CTR using 256 bit key', null);
  static readonly HS1 = new JSONWebSignatureAndEncryptionAlgorithm('HS1', 'HMAC using SHA-1', 'sha1');
  static readonly ES256K = new JSONWebSignatureAndEncryptionAlgorithm(
    'ES256K',
    'ECDSA using secp256k1 curve and SHA-256',
    'sha256',
  );

  /**
   * Private constructor.
   *
   * @param _name Algorithm name
   * @param _description Algorithm description
   * @param _nodeCryptoHashAlg Node.js crypto module's algorithm name
   */
  private constructor(private _name: string, private _description: string, private _nodeCryptoHashAlg: string | null) {
    JSONWebSignatureAndEncryptionAlgorithm._values.push(this);
  }

  /**
   * Returns algorithm name.
   *
   * @returns Algorithm name
   */
  get name(): string {
    return this._name;
  }

  /**
   * Returns algorithm description.
   *
   * @returns Algorithm description
   */
  get description(): string {
    return this._description;
  }

  /**
   * Returns Node.js crypto module's algorithm name.
   *
   * @returns Node.js crypto module's algorithm name
   */
  get nodeCryptoHashAlg(): string | null {
    return this._nodeCryptoHashAlg;
  }

  /**
   * Returns all JSON Web Signature and Encryption Algorithms class.
   *
   * @returns All JSON Web Signature and Encryption Algorithms class
   */
  static values(): JSONWebSignatureAndEncryptionAlgorithm[] {
    return JSONWebSignatureAndEncryptionAlgorithm._values;
  }

  /**
   * Returns JSON Web Signature and Encryption Algorithms class which has same algorithm name to function's parameter.
   *
   * @param name Target algorithm name
   * @returns JSON Web Signature and Encryption Algorithms class, if not found returns null
   */
  static fromName(name: string): JSONWebSignatureAndEncryptionAlgorithm | null {
    const found = JSONWebSignatureAndEncryptionAlgorithm.values().find((j) => {
      return j.name === name;
    });

    return found || null;
  }
}

/**
 * JSON Web Key Elliptic Curve class.
 *
 * RFC: {@link https://www.rfc-editor.org/rfc/rfc7518.html#section-6.2.1.1}
 *
 * Registry: {@link https://www.iana.org/assignments/jose/jose.xhtml#web-key-elliptic-curve}
 */
class JSONWebKeyEllipticCurve {
  static _values = [] as JSONWebKeyEllipticCurve[];

  static readonly P_256 = new JSONWebKeyEllipticCurve('P-256', 'P-256 Curve');
  static readonly P_384 = new JSONWebKeyEllipticCurve('P-384', 'P-384 Curve');
  static readonly P_521 = new JSONWebKeyEllipticCurve('P-521', 'P-521 Curve');
  static readonly ED25519 = new JSONWebKeyEllipticCurve('Ed25519', 'Ed25519 signature algorithm key pairs');
  static readonly ED448 = new JSONWebKeyEllipticCurve('Ed448', 'Ed448 signature algorithm key pairs');
  static readonly X25519 = new JSONWebKeyEllipticCurve('X25519', 'X25519 function key pairs');
  static readonly X448 = new JSONWebKeyEllipticCurve('X448', 'X448 function key pairs');
  static readonly SECP256K1 = new JSONWebKeyEllipticCurve('secp256k1', 'SECG secp256k1 curve');

  /**
   * Private constructor.
   *
   * @param _name Curve name
   * @param _description Curve description
   */
  private constructor(private _name: string, private _description: string) {
    JSONWebKeyEllipticCurve._values.push(this);
  }

  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  static values(): JSONWebKeyEllipticCurve[] {
    return JSONWebKeyEllipticCurve._values;
  }

  static fromName(name: string): JSONWebKeyEllipticCurve | null {
    const found = JSONWebKeyEllipticCurve.values().find((j) => {
      return j.name === name;
    });

    return found || null;
  }
}

class JSONWebKeyParameter {
  static _values = [] as JSONWebKeyParameter[];

  static readonly KTY = new JSONWebKeyParameter('kty', 'Key Type', [
    JSONWebKeyType.EC,
    JSONWebKeyType.RSA,
    JSONWebKeyType.OCT,
    JSONWebKeyType.OKP,
  ]);
  static readonly USE = new JSONWebKeyParameter('use', 'Public Key Use', [
    JSONWebKeyType.EC,
    JSONWebKeyType.RSA,
    JSONWebKeyType.OCT,
    JSONWebKeyType.OKP,
  ]);
  static readonly KEY_OPS = new JSONWebKeyParameter('key_ops', 'Key Operations', [
    JSONWebKeyType.EC,
    JSONWebKeyType.RSA,
    JSONWebKeyType.OCT,
    JSONWebKeyType.OKP,
  ]);
  static readonly ALG = new JSONWebKeyParameter('alg', 'Algorithm', [
    JSONWebKeyType.EC,
    JSONWebKeyType.RSA,
    JSONWebKeyType.OCT,
    JSONWebKeyType.OKP,
  ]);
  static readonly KID = new JSONWebKeyParameter('kid', 'Key ID', [
    JSONWebKeyType.EC,
    JSONWebKeyType.RSA,
    JSONWebKeyType.OCT,
    JSONWebKeyType.OKP,
  ]);
  static readonly X5U = new JSONWebKeyParameter('x5u', 'X.509 URL', [
    JSONWebKeyType.EC,
    JSONWebKeyType.RSA,
    JSONWebKeyType.OCT,
    JSONWebKeyType.OKP,
  ]);
  static readonly X5C = new JSONWebKeyParameter('x5c', 'X.509 Certificate Chain', [
    JSONWebKeyType.EC,
    JSONWebKeyType.RSA,
    JSONWebKeyType.OCT,
    JSONWebKeyType.OKP,
  ]);
  static readonly X5T = new JSONWebKeyParameter('x5t', 'X.509 Certificate SHA-1 Thumbprint', [
    JSONWebKeyType.EC,
    JSONWebKeyType.RSA,
    JSONWebKeyType.OCT,
    JSONWebKeyType.OKP,
  ]);
  static readonly X5T_SHARP_S256 = new JSONWebKeyParameter('x5t#S256', 'X.509 Certificate SHA-256 Thumbprint', [
    JSONWebKeyType.EC,
    JSONWebKeyType.RSA,
    JSONWebKeyType.OCT,
    JSONWebKeyType.OKP,
  ]);
  static readonly EC_CRV = new JSONWebKeyParameter('crv', 'Curve', [JSONWebKeyType.EC]);
  static readonly EC_X = new JSONWebKeyParameter('x', 'X Coordinate', [JSONWebKeyType.EC]);
  static readonly EC_Y = new JSONWebKeyParameter('y', 'Y Coordinate', [JSONWebKeyType.EC]);
  static readonly EC_D = new JSONWebKeyParameter('d', 'ECC Private Key', [JSONWebKeyType.EC]);
  static readonly N = new JSONWebKeyParameter('n', 'Modulus', [JSONWebKeyType.RSA]);
  static readonly E = new JSONWebKeyParameter('e', 'Exponent', [JSONWebKeyType.RSA]);
  static readonly RSA_D = new JSONWebKeyParameter('d', 'Private Exponent', [JSONWebKeyType.RSA]);
  static readonly P = new JSONWebKeyParameter('p', 'First Prime Factor', [JSONWebKeyType.RSA]);
  static readonly Q = new JSONWebKeyParameter('q', 'Second Prime Factor', [JSONWebKeyType.RSA]);
  static readonly DP = new JSONWebKeyParameter('dp', 'First Factor CRT Exponent', [JSONWebKeyType.RSA]);
  static readonly DQ = new JSONWebKeyParameter('dq', 'Second Factor CRT Exponent', [JSONWebKeyType.RSA]);
  static readonly QI = new JSONWebKeyParameter('qi', 'First CRT Coefficient', [JSONWebKeyType.RSA]);
  static readonly OTH = new JSONWebKeyParameter('oth', 'Other Primes Info', [JSONWebKeyType.RSA]);
  static readonly K = new JSONWebKeyParameter('k', 'Key Value', [JSONWebKeyType.OCT]);
  static readonly OKP_CRV = new JSONWebKeyParameter('crv', 'The subtype of key pair', [JSONWebKeyType.OKP]);
  static readonly OKP_D = new JSONWebKeyParameter('d', 'The private key', [JSONWebKeyType.OKP]);
  static readonly OKP_X = new JSONWebKeyParameter('x', 'The public key', [JSONWebKeyType.OKP]);
  static readonly EXT = new JSONWebKeyParameter('ext', 'Extractable', [
    JSONWebKeyType.EC,
    JSONWebKeyType.RSA,
    JSONWebKeyType.OCT,
    JSONWebKeyType.OKP,
  ]);

  private constructor(private _name: string, private _description: string, private _usedWith: JSONWebKeyType[]) {
    JSONWebKeyParameter._values.push(this);
  }

  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  get usedWith(): JSONWebKeyType[] {
    return this._usedWith;
  }

  static values(): JSONWebKeyParameter[] {
    return JSONWebKeyParameter._values;
  }

  static fromName(usedWith: JSONWebKeyType, name: string): JSONWebKeyParameter | null {
    const found = JSONWebKeyParameter.values().find((j) => {
      return j.usedWith.includes(usedWith) && j.name === name;
    });

    return found || null;
  }
}

class JSONWebKeyUse {
  static _values = [] as JSONWebKeyUse[];

  static readonly SIG = new JSONWebKeyUse('sig', 'Digital Signature or MAC');
  static readonly ENC = new JSONWebKeyUse('enc', 'Encryption');

  private constructor(private _value: string, private _description: string) {
    JSONWebKeyUse._values.push(this);
  }

  get value(): string {
    return this._value;
  }

  get description(): string {
    return this._description;
  }
  static values(): JSONWebKeyUse[] {
    return JSONWebKeyUse._values;
  }

  static fromValue(value: string): JSONWebKeyUse | null {
    const found = JSONWebKeyUse.values().find((j) => {
      return j.value === value;
    });

    return found || null;
  }
}

class JSONWebKeyOperation {
  static _values = [] as JSONWebKeyOperation[];

  static readonly SIGN = new JSONWebKeyOperation('sign', 'Compute digital signature or MAC');
  static readonly VERIFY = new JSONWebKeyOperation('verify', 'Verify digital signature or MAC');
  static readonly ENCRYPT = new JSONWebKeyOperation('encrypt', 'Encrypt content');
  static readonly DECRYPT = new JSONWebKeyOperation(
    'decrypt',
    'Decrypt content and validate decryption, if applicable',
  );
  static readonly WRAP_KEY = new JSONWebKeyOperation('wrapKey', 'Encrypt key');
  static readonly UNWRAP_KEY = new JSONWebKeyOperation(
    'unwrapKey',
    'Decrypt key and validate decryption, if applicable',
  );
  static readonly DERIVE_KEY = new JSONWebKeyOperation('deriveKey', 'Derive key');
  static readonly DERIVE_BITS = new JSONWebKeyOperation('deriveBits', 'Derive bits not to be used as a key');

  private constructor(private _value: string, private _description: string) {
    JSONWebKeyOperation._values.push(this);
  }

  get value(): string {
    return this._value;
  }

  get description(): string {
    return this._description;
  }
  static values(): JSONWebKeyOperation[] {
    return JSONWebKeyOperation._values;
  }

  static fromValue(value: string): JSONWebKeyOperation | null {
    const found = JSONWebKeyOperation.values().find((j) => {
      return j.value === value;
    });

    return found || null;
  }
}

export {
  JSONWebKeyType,
  JSONWebSignatureAndEncryptionAlgorithm,
  JSONWebKeyEllipticCurve,
  JSONWebKeyParameter,
  JSONWebKeyUse,
  JSONWebKeyOperation,
};
