import crypto from 'crypto';
import cbor from 'cbor';
import * as jose from 'jose';
import str2ab from 'str2ab';
import {
  COSEKeyCommonParameter,
  COSEKeyType,
  COSEKeyTypeParameter,
  COSEKeyOperationValue,
  COSEEllipticCurve,
  COSEAlgorithm,
  COSEKeyParameterValueMapping,
} from './coseKey';
import {
  KeyTypeMapping,
  KeyAlgorithmMapping,
  KeyParameterMapping,
  KeyOperationMapping,
  EllipticCurveMapping,
} from './coseJoseMapping';
import KeyParseError from './exception/keyParseError';
import {
  JSONWebKeyEllipticCurve,
  JSONWebKeyOperation,
  JSONWebKeyUse,
  JSONWebKeyParameter,
  JSONWebKeyType,
  JSONWebSignatureAndEncryptionAlgorithm,
} from './joseKey';

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

type pemType = 'PUBLIC KEY' | 'PRIVATE KEY';

/**
 * Parse between JSON Web Key (JWK), CBOR Object Signing and Encryption (COSE) and PEM.
 */
class KeyParser {
  static readonly BUFFER_TYPE_COSE_KEY_PARAMETER_NAME = [
    'kid',
    'Base IV',
    'x',
    'd',
    'y',
    'n',
    'e',
    'p',
    'q',
    'dP',
    'dQ',
    'qInv',
    'r_i',
    'd_i',
    't_i',
    'k',
    'pub',
  ];

  private constructor() {
    // private
  }

  private static findCoseKeyAllParameterFromLabel(
    label: number,
    keyType: COSEKeyType,
  ): COSEKeyCommonParameter | COSEKeyTypeParameter | null {
    return COSEKeyCommonParameter.fromLabel(label) || COSEKeyTypeParameter.fromLabel(keyType, label) || null;
  }

  private static findCoseKeyParameterValueFromLabel(
    label: any,
    keyParameter: COSEKeyCommonParameter | COSEKeyTypeParameter,
  ): COSEKeyType | COSEKeyOperationValue | COSEEllipticCurve | COSEAlgorithm | null {
    const parameterValueMapping = COSEKeyParameterValueMapping.fromParameter(keyParameter);
    if (parameterValueMapping == null) {
      return null;
    }

    return parameterValueMapping.fromValueLabel(label);
  }

  private static findJSONWebKeyParameterFromName(name: string, keyType: JSONWebKeyType): JSONWebKeyParameter | null {
    return JSONWebKeyParameter.fromName(keyType, name);
  }

  private static findJSONWebKeyParameterValueFromValue(
    value: string,
  ):
    | JSONWebKeyType
    | JSONWebKeyEllipticCurve
    | JSONWebKeyUse
    | JSONWebKeyOperation
    | JSONWebSignatureAndEncryptionAlgorithm
    | null {
    if (typeof value !== 'string') {
      return null;
    }
    const param =
      JSONWebKeyType.fromValue(value) ||
      JSONWebKeyEllipticCurve.fromName(value) ||
      JSONWebKeyUse.fromValue(value) ||
      JSONWebKeyOperation.fromValue(value) ||
      JSONWebSignatureAndEncryptionAlgorithm.fromName(value);

    return param;
  }

  private static convertCoseJoseValue(
    parameterValue: COSEKeyType | COSEKeyOperationValue | COSEEllipticCurve | COSEAlgorithm,
  ) {
    if (parameterValue instanceof COSEKeyType) {
      return KeyTypeMapping.fromCOSEKeyType(parameterValue);
    } else if (parameterValue instanceof COSEKeyOperationValue) {
      return KeyOperationMapping.fromCOSEKeyOperation(parameterValue);
    } else if (parameterValue instanceof COSEEllipticCurve) {
      return EllipticCurveMapping.fromCOSEEllipticCurve(parameterValue);
    } else if (parameterValue instanceof COSEAlgorithm) {
      return KeyAlgorithmMapping.fromCOSEAlgorithm(parameterValue);
    }

    return null;
  }

  private static convertJoseCoseKey(
    keyParameter: JSONWebKeyParameter,
  ): COSEKeyCommonParameter | COSEKeyTypeParameter | null {
    return KeyParameterMapping.fromJSONWebKeyParameter(keyParameter);
  }

  private static convertJoseCoseValue(
    parameterValue:
      | JSONWebKeyType
      | JSONWebKeyEllipticCurve
      | JSONWebKeyUse
      | JSONWebKeyOperation
      | JSONWebSignatureAndEncryptionAlgorithm,
  ) {
    if (parameterValue instanceof JSONWebKeyType) {
      return KeyTypeMapping.fromJSONWebKeyType(parameterValue);
    } else if (parameterValue instanceof JSONWebKeyEllipticCurve) {
      return EllipticCurveMapping.fromJSONWebKeyEllipticCurve(parameterValue);
    } else if (parameterValue instanceof JSONWebKeyUse) {
      return parameterValue;
    } else if (parameterValue instanceof JSONWebKeyOperation) {
      return KeyOperationMapping.fromJSONWebKeyOperation(parameterValue);
    } else if (parameterValue instanceof JSONWebSignatureAndEncryptionAlgorithm) {
      return KeyAlgorithmMapping.fromJoseAlgorithm(parameterValue);
    }

    return null;
  }

  /**
   * Parse COSE key to JWK format.
   *
   * @param coseMap COSE key
   * @returns JWK
   */
  static cose2jwk(coseMap: coseMap): jwk {
    // specify key type
    const keyTypeValue = coseMap.get(COSEKeyCommonParameter.KTY.label);
    if (keyTypeValue == null) {
      throw new KeyParseError('"kty" is not included.');
    }
    if (typeof keyTypeValue !== 'number') {
      throw new KeyParseError(`"kty" is not number: ${keyTypeValue}`);
    }
    const keyType = COSEKeyType.fromValue(keyTypeValue);
    if (!keyType) {
      throw new KeyParseError('Cannot detect key type.');
    }

    const jwk: jwk = {};
    for (const [key, value] of coseMap.entries()) {
      const keyParameter = this.findCoseKeyAllParameterFromLabel(key, keyType);
      if (keyParameter == null) {
        continue;
      }

      const parameterValue = this.findCoseKeyParameterValueFromLabel(value, keyParameter);
      if (parameterValue != null) {
        const joseParameterValue = this.convertCoseJoseValue(parameterValue);
        if (joseParameterValue instanceof JSONWebKeyType) {
          jwk[keyParameter.name] = joseParameterValue.value;
        } else if (joseParameterValue instanceof JSONWebKeyEllipticCurve) {
          jwk[keyParameter.name] = joseParameterValue.name;
        } else if (joseParameterValue instanceof JSONWebKeyOperation) {
          jwk[keyParameter.name] = joseParameterValue.value;
        } else if (parameterValue instanceof COSEAlgorithm) {
          jwk[keyParameter.name] = joseParameterValue != null ? joseParameterValue.name : parameterValue.name;
        }
      } else {
        if (value instanceof Buffer) {
          jwk[keyParameter.name] = str2ab.buffer2base64url(value);
        } else {
          jwk[keyParameter.name] = value;
        }
      }
    }

    return jwk;
  }

  /**
   * Parse JWK to COSE key.
   *
   * @param jwk JWK
   * @returns COSE key
   */
  static jwk2cose(jwk: jwk): coseMap {
    const keyTypeValue = jwk.kty;
    if (!keyTypeValue) {
      throw new KeyParseError('jwk does not have "kty".');
    }

    const keyType = JSONWebKeyType.fromValue(keyTypeValue);
    if (keyType == null) {
      throw new KeyParseError('Cannot convert key type.');
    }

    const coseMap: coseMap = new Map<number, any>();
    for (const [key, value] of Object.entries(jwk)) {
      const keyParameter = this.findJSONWebKeyParameterFromName(key, keyType);
      const coseKeyParameter = keyParameter != null ? this.convertJoseCoseKey(keyParameter) : null;
      if (coseKeyParameter == null) {
        continue;
      }

      const parameterValue = typeof value === 'string' ? this.findJSONWebKeyParameterValueFromValue(value) : null;
      const coseParameterValue = parameterValue != null ? this.convertJoseCoseValue(parameterValue) : null;
      if (coseParameterValue != null) {
        coseMap.set(Number(coseKeyParameter.label), coseParameterValue.value);
      } else {
        if (
          typeof value === 'string' &&
          /[a-zA-Z0-9\-_]+/.test(value) &&
          KeyParser.BUFFER_TYPE_COSE_KEY_PARAMETER_NAME.includes(coseKeyParameter.name)
        ) {
          coseMap.set(Number(coseKeyParameter.label), str2ab.base64url2buffer(value));
        } else {
          coseMap.set(Number(coseKeyParameter.label), value);
        }
      }
    }

    return coseMap;
  }

  /**
   * Parse JWK to PEM.
   *
   * @param jwk JWK
   * @returns PEM
   */
  static async jwk2pem(jwk: jwk): Promise<pem> {
    try {
      const key = await jose.importJWK(jwk);
      if (key instanceof Uint8Array) {
        const keyType = jwk.d == null ? 'PUBLIC KEY' : 'PRIVATE KEY';
        return KeyParser.der2pem(keyType, Buffer.from(key));
      } else {
        if (jwk.d == null) {
          // Public key
          return await jose.exportSPKI(key);
        } else {
          // Private key
          return await jose.exportPKCS8(key);
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        throw new KeyParseError(err);
      } else {
        throw new KeyParseError('Cannot convert from jwk to PEM.');
      }
    }
  }

  /**
   * Parse PEM to JWK.
   *
   * This method's parameter `alg` is specified in JWK's "alg" parameter ({@link https://www.iana.org/assignments/jose/jose.xhtml#web-signature-encryption-algorithms | here} is registry).
   *
   * @param pem PEM
   * @param alg JWK's "alg" parameter
   * @returns JWK
   */
  static async pem2jwk(pem: pem, alg?: string): Promise<jwk> {
    const pemLine = pem.split(/(\r\n|\r|\n)+/g);
    const match = /^-----BEGIN (RSA )?(PUBLIC|PRIVATE) KEY-----$/.exec(pemLine[0]);
    if (match == null) {
      throw new KeyParseError('Cannot convert this pem.');
    }

    let jwk;
    if (match[2] === 'PUBLIC') {
      const key = crypto.createPublicKey(pem);
      jwk = await jose.exportJWK(key);
    } else {
      const key = crypto.createPrivateKey(pem);
      jwk = await jose.exportJWK(key);
    }
    if (alg != null && alg !== '') {
      jwk.alg = alg;
    }

    return jwk;
  }

  /**
   * Parse COSE key to PEM.
   *
   * @param coseMap COSE key
   * @returns PEM
   */
  static async cose2pem(coseMap: coseMap): Promise<pem> {
    const jwk = KeyParser.cose2jwk(coseMap);
    const pem = await KeyParser.jwk2pem(jwk);

    return pem;
  }

  /**
   * Parse PEM to COSE key.
   *
   * This method's parameter `alg` is specified in JWK's "alg" parameter ({@link https://www.iana.org/assignments/jose/jose.xhtml#web-signature-encryption-algorithms | here} is registry).
   *
   * @param pem PEM
   * @param alg Key algorithm, specified with JWK's "alg" parameter
   * @returns COSE key
   */
  static async pem2cose(pem: string, alg?: string): Promise<coseMap> {
    const jwk = await KeyParser.pem2jwk(pem, alg);
    const coseMap = KeyParser.jwk2cose(jwk);

    return coseMap;
  }

  /**
   * Parse attestation object in webauthn to JWK.
   *
   * @param attObj Attestation object
   * @returns JWK
   */
  static attestationObject2jwk(attObj: Buffer): jwk {
    const decoded = cbor.decodeAllSync(attObj);
    const authData = decoded[0]['authData'];
    const credIdLenBuf = authData.slice(53, 53 + 2);
    const credIdLen = credIdLenBuf.readUInt16BE();
    const credPubKeyAnd = authData.slice(55 + credIdLen);
    const [coseMap, ...extensions] = cbor.decodeAllSync(credPubKeyAnd);

    return KeyParser.cose2jwk(coseMap);
  }

  /**
   * Parse DER format key to PEM format.
   *
   * @param type Key type
   * @param der DER format key
   * @returns PEM format key
   */
  static der2pem(type: pemType, der: Buffer): string {
    const base64 = str2ab.buffer2base64(der);
    return [
      `-----BEGIN ${type}-----\n`,
      ...(base64.match(/.{1,64}/g) || []).join('\n').concat('\n'),
      `-----END ${type}-----\n`,
    ].join('');
  }

  /**
   * Parse PEM format key to DER format.
   *
   * @param pem PEM format key
   * @returns DER format key
   */
  static pem2der(pem: pem): Buffer {
    const base64 = pem
      .replace(/-----BEGIN (RSA )?(PUBLIC|PRIVATE) KEY-----/, '')
      .replace(/-----END (RSA )?(PUBLIC|PRIVATE) KEY-----/, '')
      .replace(/(\r\n|\r|\n)+/g, '');
    return str2ab.base642buffer(base64);
  }
}

export default KeyParser;
