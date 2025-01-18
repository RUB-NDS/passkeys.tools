import * as CoseKey from './coseKey';
import * as JoseKey from './joseKey';

class KeyTypeMapping {
  static _values = [] as KeyTypeMapping[];

  static readonly OKP = new KeyTypeMapping(CoseKey.COSEKeyType.OKP, JoseKey.JSONWebKeyType.OKP);
  static readonly EC2 = new KeyTypeMapping(CoseKey.COSEKeyType.EC2, JoseKey.JSONWebKeyType.EC);
  static readonly RSA = new KeyTypeMapping(CoseKey.COSEKeyType.RSA, JoseKey.JSONWebKeyType.RSA);

  private constructor(private _coseKeyType: CoseKey.COSEKeyType, private _jsonWebKeyType: JoseKey.JSONWebKeyType) {
    KeyTypeMapping._values.push(this);
  }

  get coseKeyType(): CoseKey.COSEKeyType {
    return this._coseKeyType;
  }

  get jsonWebKeyType(): JoseKey.JSONWebKeyType {
    return this._jsonWebKeyType;
  }

  static values(): KeyTypeMapping[] {
    return KeyTypeMapping._values;
  }

  static fromCOSEKeyType(coseKeyType: CoseKey.COSEKeyType): JoseKey.JSONWebKeyType | null {
    const found = KeyTypeMapping.values().find((m) => {
      return m.coseKeyType === coseKeyType;
    });

    if (found == null) {
      return null;
    }

    return found.jsonWebKeyType;
  }

  static fromCOSEKeyTypeValue(coseKeyTypeValue: number): JoseKey.JSONWebKeyType | null {
    const found = KeyTypeMapping.values().find((m) => {
      return m.coseKeyType.value === coseKeyTypeValue;
    });

    if (found == null) {
      return null;
    }

    return found.jsonWebKeyType;
  }

  static fromJSONWebKeyType(jsonWebKeyType: JoseKey.JSONWebKeyType): CoseKey.COSEKeyType | null {
    const found = KeyTypeMapping.values().find((m) => {
      return m.jsonWebKeyType === jsonWebKeyType;
    });

    if (found == null) {
      return null;
    }

    return found.coseKeyType;
  }

  static fromJSONWebKeyTypeValue(jsonWebKeyTypeValue: string): CoseKey.COSEKeyType | null {
    const found = KeyTypeMapping.values().find((m) => {
      return m.jsonWebKeyType.value === jsonWebKeyTypeValue;
    });

    if (found == null) {
      return null;
    }

    return found.coseKeyType;
  }
}

class KeyAlgorithmMapping {
  static _values = [] as KeyAlgorithmMapping[];

  static readonly RS1 = new KeyAlgorithmMapping(
    CoseKey.COSEAlgorithm.RS1,
    JoseKey.JSONWebSignatureAndEncryptionAlgorithm.RS1,
  );
  static readonly RS512 = new KeyAlgorithmMapping(
    CoseKey.COSEAlgorithm.RS512,
    JoseKey.JSONWebSignatureAndEncryptionAlgorithm.RS512,
  );
  static readonly RS384 = new KeyAlgorithmMapping(
    CoseKey.COSEAlgorithm.RS384,
    JoseKey.JSONWebSignatureAndEncryptionAlgorithm.RS384,
  );
  static readonly RS256 = new KeyAlgorithmMapping(
    CoseKey.COSEAlgorithm.RS256,
    JoseKey.JSONWebSignatureAndEncryptionAlgorithm.RS256,
  );
  static readonly ES256K = new KeyAlgorithmMapping(
    CoseKey.COSEAlgorithm.ES256K,
    JoseKey.JSONWebSignatureAndEncryptionAlgorithm.ES256K,
  );
  static readonly RSAES_OAEP_SHA512 = new KeyAlgorithmMapping(
    CoseKey.COSEAlgorithm.RSAES_OAEP_w_SHA_512,
    JoseKey.JSONWebSignatureAndEncryptionAlgorithm.RSA_OAEP_512,
  );
  static readonly RSAES_OAEP_SHA256 = new KeyAlgorithmMapping(
    CoseKey.COSEAlgorithm.RSAES_OAEP_w_SHA_256,
    JoseKey.JSONWebSignatureAndEncryptionAlgorithm.RSA_OAEP_256,
  );
  static readonly PS512 = new KeyAlgorithmMapping(
    CoseKey.COSEAlgorithm.PS512,
    JoseKey.JSONWebSignatureAndEncryptionAlgorithm.PS512,
  );
  static readonly PS384 = new KeyAlgorithmMapping(
    CoseKey.COSEAlgorithm.PS384,
    JoseKey.JSONWebSignatureAndEncryptionAlgorithm.PS384,
  );
  static readonly PS256 = new KeyAlgorithmMapping(
    CoseKey.COSEAlgorithm.PS256,
    JoseKey.JSONWebSignatureAndEncryptionAlgorithm.PS256,
  );
  static readonly ES512 = new KeyAlgorithmMapping(
    CoseKey.COSEAlgorithm.ES512,
    JoseKey.JSONWebSignatureAndEncryptionAlgorithm.ES512,
  );
  static readonly ES384 = new KeyAlgorithmMapping(
    CoseKey.COSEAlgorithm.ES384,
    JoseKey.JSONWebSignatureAndEncryptionAlgorithm.ES384,
  );
  static readonly ECDH_ES_A256KW = new KeyAlgorithmMapping(
    CoseKey.COSEAlgorithm.ECDH_ES_A256KW,
    JoseKey.JSONWebSignatureAndEncryptionAlgorithm.ECDH_ES_A256KW,
  );
  static readonly ECDH_ES_A192KW = new KeyAlgorithmMapping(
    CoseKey.COSEAlgorithm.ECDH_ES_A192KW,
    JoseKey.JSONWebSignatureAndEncryptionAlgorithm.ECDH_ES_A192KW,
  );
  static readonly ECDH_ES_A128KW = new KeyAlgorithmMapping(
    CoseKey.COSEAlgorithm.ECDH_ES_A128KW,
    JoseKey.JSONWebSignatureAndEncryptionAlgorithm.ECDH_ES_A128KW,
  );
  static readonly EdDSA = new KeyAlgorithmMapping(
    CoseKey.COSEAlgorithm.EdDSA,
    JoseKey.JSONWebSignatureAndEncryptionAlgorithm.EdDSA,
  );
  static readonly ES256 = new KeyAlgorithmMapping(
    CoseKey.COSEAlgorithm.ES256,
    JoseKey.JSONWebSignatureAndEncryptionAlgorithm.ES256,
  );
  static readonly DIRECT = new KeyAlgorithmMapping(
    CoseKey.COSEAlgorithm.DIRECT,
    JoseKey.JSONWebSignatureAndEncryptionAlgorithm.DIR,
  );
  static readonly A256KW = new KeyAlgorithmMapping(
    CoseKey.COSEAlgorithm.A256KW,
    JoseKey.JSONWebSignatureAndEncryptionAlgorithm.A256KW,
  );
  static readonly A192KW = new KeyAlgorithmMapping(
    CoseKey.COSEAlgorithm.A192KW,
    JoseKey.JSONWebSignatureAndEncryptionAlgorithm.A192KW,
  );
  static readonly A128KW = new KeyAlgorithmMapping(
    CoseKey.COSEAlgorithm.A128KW,
    JoseKey.JSONWebSignatureAndEncryptionAlgorithm.A128KW,
  );
  static readonly A128GCM = new KeyAlgorithmMapping(
    CoseKey.COSEAlgorithm.A128GCM,
    JoseKey.JSONWebSignatureAndEncryptionAlgorithm.A128GCM,
  );
  static readonly A192GCM = new KeyAlgorithmMapping(
    CoseKey.COSEAlgorithm.A192GCM,
    JoseKey.JSONWebSignatureAndEncryptionAlgorithm.A192GCM,
  );
  static readonly A256GCM = new KeyAlgorithmMapping(
    CoseKey.COSEAlgorithm.A256GCM,
    JoseKey.JSONWebSignatureAndEncryptionAlgorithm.A256GCM,
  );

  constructor(
    private _coseAlgorithm: CoseKey.COSEAlgorithm,
    private _joseAlgorithm: JoseKey.JSONWebSignatureAndEncryptionAlgorithm,
  ) {
    KeyAlgorithmMapping._values.push(this);
  }

  get coseAlgorithm(): CoseKey.COSEAlgorithm {
    return this._coseAlgorithm;
  }

  get joseAlgorithm(): JoseKey.JSONWebSignatureAndEncryptionAlgorithm {
    return this._joseAlgorithm;
  }

  static values(): KeyAlgorithmMapping[] {
    return KeyAlgorithmMapping._values;
  }

  static fromCOSEAlgorithm(
    coseAlgorithm: CoseKey.COSEAlgorithm,
  ): JoseKey.JSONWebSignatureAndEncryptionAlgorithm | null {
    const found = KeyAlgorithmMapping.values().find((m) => {
      return m.coseAlgorithm === coseAlgorithm;
    });

    if (found == null) {
      return null;
    }

    return found.joseAlgorithm;
  }

  static fromCOSEAlgorithmValue(coseAlgorithmValue: number): JoseKey.JSONWebSignatureAndEncryptionAlgorithm | null {
    const found = KeyAlgorithmMapping.values().find((m) => {
      return m.coseAlgorithm.value === coseAlgorithmValue;
    });

    if (found == null) {
      return null;
    }

    return found.joseAlgorithm;
  }

  static fromJoseAlgorithm(
    joseAlgorithm: JoseKey.JSONWebSignatureAndEncryptionAlgorithm,
  ): CoseKey.COSEAlgorithm | null {
    const found = KeyAlgorithmMapping.values().find((m) => {
      return m.joseAlgorithm === joseAlgorithm;
    });

    if (found == null) {
      return null;
    }

    return found.coseAlgorithm;
  }

  static fromJoseAlgorithmName(joseAlgorithmName: string): CoseKey.COSEAlgorithm | null {
    const found = KeyAlgorithmMapping.values().find((m) => {
      return m.joseAlgorithm.name === joseAlgorithmName;
    });

    if (found == null) {
      return null;
    }

    return found.coseAlgorithm;
  }
}

class KeyParameterMapping {
  static _values = [] as KeyParameterMapping[];

  static readonly KTY = new KeyParameterMapping(CoseKey.COSEKeyCommonParameter.KTY, JoseKey.JSONWebKeyParameter.KTY);
  static readonly KID = new KeyParameterMapping(CoseKey.COSEKeyCommonParameter.KID, JoseKey.JSONWebKeyParameter.KID);
  static readonly ALG = new KeyParameterMapping(CoseKey.COSEKeyCommonParameter.ALG, JoseKey.JSONWebKeyParameter.ALG);
  static readonly KEY_OPS = new KeyParameterMapping(
    CoseKey.COSEKeyCommonParameter.KEY_OPS,
    JoseKey.JSONWebKeyParameter.KEY_OPS,
  );
  static readonly OKP_CRV = new KeyParameterMapping(
    CoseKey.COSEKeyTypeParameter.OKP_CRV,
    JoseKey.JSONWebKeyParameter.OKP_CRV,
  );
  static readonly OKP_X = new KeyParameterMapping(
    CoseKey.COSEKeyTypeParameter.OKP_X,
    JoseKey.JSONWebKeyParameter.OKP_X,
  );
  static readonly OKP_D = new KeyParameterMapping(
    CoseKey.COSEKeyTypeParameter.OKP_D,
    JoseKey.JSONWebKeyParameter.OKP_D,
  );
  static readonly EC2_CRV = new KeyParameterMapping(
    CoseKey.COSEKeyTypeParameter.EC2_CRV,
    JoseKey.JSONWebKeyParameter.EC_CRV,
  );
  static readonly EC2_X = new KeyParameterMapping(CoseKey.COSEKeyTypeParameter.EC2_X, JoseKey.JSONWebKeyParameter.EC_X);
  static readonly EC2_Y = new KeyParameterMapping(CoseKey.COSEKeyTypeParameter.EC2_Y, JoseKey.JSONWebKeyParameter.EC_Y);
  static readonly EC2_D = new KeyParameterMapping(CoseKey.COSEKeyTypeParameter.EC2_D, JoseKey.JSONWebKeyParameter.EC_D);
  static readonly RSA_N = new KeyParameterMapping(CoseKey.COSEKeyTypeParameter.RSA_N, JoseKey.JSONWebKeyParameter.N);
  static readonly RSA_E = new KeyParameterMapping(CoseKey.COSEKeyTypeParameter.RSA_E, JoseKey.JSONWebKeyParameter.E);
  static readonly RSA_D = new KeyParameterMapping(
    CoseKey.COSEKeyTypeParameter.RSA_D,
    JoseKey.JSONWebKeyParameter.RSA_D,
  );
  static readonly RSA_P = new KeyParameterMapping(CoseKey.COSEKeyTypeParameter.RSA_P, JoseKey.JSONWebKeyParameter.P);
  static readonly RSA_Q = new KeyParameterMapping(CoseKey.COSEKeyTypeParameter.RSA_Q, JoseKey.JSONWebKeyParameter.Q);
  static readonly RSA_DP = new KeyParameterMapping(CoseKey.COSEKeyTypeParameter.RSA_DP, JoseKey.JSONWebKeyParameter.DP);
  static readonly RSA_DQ = new KeyParameterMapping(CoseKey.COSEKeyTypeParameter.RSA_DQ, JoseKey.JSONWebKeyParameter.DQ);
  static readonly OTHER = new KeyParameterMapping(CoseKey.COSEKeyTypeParameter.OTHER, JoseKey.JSONWebKeyParameter.OTH);

  private constructor(
    private _coseKeyParameter: CoseKey.COSEKeyCommonParameter | CoseKey.COSEKeyTypeParameter,
    private _jsonWebKeyParameter: JoseKey.JSONWebKeyParameter,
  ) {
    KeyParameterMapping._values.push(this);
  }

  get coseKeyParameter(): CoseKey.COSEKeyCommonParameter | CoseKey.COSEKeyTypeParameter {
    return this._coseKeyParameter;
  }

  get jsonWebKeyParameter(): JoseKey.JSONWebKeyParameter {
    return this._jsonWebKeyParameter;
  }

  static values(): KeyParameterMapping[] {
    return KeyParameterMapping._values;
  }

  static fromCOSEKeyParameter(
    coseKeyParameter: CoseKey.COSEKeyCommonParameter | CoseKey.COSEKeyTypeParameter,
  ): JoseKey.JSONWebKeyParameter | null {
    const found = KeyParameterMapping.values().find((m) => {
      return m.coseKeyParameter === coseKeyParameter;
    });

    if (found == null) {
      return null;
    }

    return found.jsonWebKeyParameter;
  }

  static fromCOSEKeyParameterLabel(coseKeyParameterLabel: number): JoseKey.JSONWebKeyParameter | null {
    const found = KeyParameterMapping.values().find((m) => {
      return m.coseKeyParameter.label === coseKeyParameterLabel;
    });

    if (found == null) {
      return null;
    }

    return found.jsonWebKeyParameter;
  }

  static fromJSONWebKeyParameter(
    jsonWebKeyParameter: JoseKey.JSONWebKeyParameter,
  ): CoseKey.COSEKeyCommonParameter | CoseKey.COSEKeyTypeParameter | null {
    const found = KeyParameterMapping.values().find((m) => {
      return m.jsonWebKeyParameter === jsonWebKeyParameter;
    });

    if (found == null) {
      return null;
    }

    return found.coseKeyParameter;
  }

  static fromJSONWebKeyParameterName(
    jsonWebKeyParameterName: string,
  ): CoseKey.COSEKeyCommonParameter | CoseKey.COSEKeyTypeParameter | null {
    const found = KeyParameterMapping.values().find((m) => {
      return m.jsonWebKeyParameter.name === jsonWebKeyParameterName;
    });

    if (found == null) {
      return null;
    }

    return found.coseKeyParameter;
  }
}

class KeyOperationMapping {
  static _values = [] as KeyOperationMapping[];

  static readonly SIGN = new KeyOperationMapping(CoseKey.COSEKeyOperationValue.SIGN, JoseKey.JSONWebKeyOperation.SIGN);
  static readonly VERIFY = new KeyOperationMapping(
    CoseKey.COSEKeyOperationValue.VERIFY,
    JoseKey.JSONWebKeyOperation.VERIFY,
  );
  static readonly ENCRYPT = new KeyOperationMapping(
    CoseKey.COSEKeyOperationValue.ENCRYPT,
    JoseKey.JSONWebKeyOperation.ENCRYPT,
  );
  static readonly DECRYPT = new KeyOperationMapping(
    CoseKey.COSEKeyOperationValue.DECRYPT,
    JoseKey.JSONWebKeyOperation.DECRYPT,
  );
  static readonly WRAP_KEY = new KeyOperationMapping(
    CoseKey.COSEKeyOperationValue.WRAP_KEY,
    JoseKey.JSONWebKeyOperation.WRAP_KEY,
  );
  static readonly UNWRAP_KEY = new KeyOperationMapping(
    CoseKey.COSEKeyOperationValue.UNWRAP_KEY,
    JoseKey.JSONWebKeyOperation.UNWRAP_KEY,
  );
  static readonly DERIVE_KEY = new KeyOperationMapping(
    CoseKey.COSEKeyOperationValue.DERIVE_KEY,
    JoseKey.JSONWebKeyOperation.DERIVE_KEY,
  );
  static readonly DERIVE_BITS = new KeyOperationMapping(
    CoseKey.COSEKeyOperationValue.DERIVE_BITS,
    JoseKey.JSONWebKeyOperation.DERIVE_BITS,
  );

  private constructor(
    private _coseKeyOperation: CoseKey.COSEKeyOperationValue,
    private _jsonWebKeyOperation: JoseKey.JSONWebKeyOperation,
  ) {
    KeyOperationMapping._values.push(this);
  }

  get coseKeyOperation(): CoseKey.COSEKeyOperationValue {
    return this._coseKeyOperation;
  }

  get jsonWebKeyOperation(): JoseKey.JSONWebKeyOperation {
    return this._jsonWebKeyOperation;
  }

  static values(): KeyOperationMapping[] {
    return KeyOperationMapping._values;
  }

  static fromCOSEKeyOperation(coseKeyOperation: CoseKey.COSEKeyOperationValue): JoseKey.JSONWebKeyOperation | null {
    const found = KeyOperationMapping.values().find((m) => {
      return m.coseKeyOperation === coseKeyOperation;
    });

    if (found == null) {
      return null;
    }

    return found.jsonWebKeyOperation;
  }

  static fromCOSEKeyOperationValue(coseKeyOperationValue: number): JoseKey.JSONWebKeyOperation | null {
    const found = KeyOperationMapping.values().find((m) => {
      return m.coseKeyOperation.value === coseKeyOperationValue;
    });

    if (found == null) {
      return null;
    }

    return found.jsonWebKeyOperation;
  }

  static fromJSONWebKeyOperation(
    jsonWebKeyOperation: JoseKey.JSONWebKeyOperation,
  ): CoseKey.COSEKeyOperationValue | null {
    const found = KeyOperationMapping.values().find((m) => {
      return m.jsonWebKeyOperation === jsonWebKeyOperation;
    });

    if (found == null) {
      return null;
    }

    return found.coseKeyOperation;
  }

  static fromJSONWebKeyOperationValue(jsonWebKeyOperationValue: string): CoseKey.COSEKeyOperationValue | null {
    const found = KeyOperationMapping.values().find((m) => {
      return m.jsonWebKeyOperation.value === jsonWebKeyOperationValue;
    });

    if (found == null) {
      return null;
    }

    return found.coseKeyOperation;
  }
}

class EllipticCurveMapping {
  static _values = [] as EllipticCurveMapping[];

  static readonly P_256 = new EllipticCurveMapping(
    CoseKey.COSEEllipticCurve.P_256,
    JoseKey.JSONWebKeyEllipticCurve.P_256,
  );
  static readonly P_384 = new EllipticCurveMapping(
    CoseKey.COSEEllipticCurve.P_384,
    JoseKey.JSONWebKeyEllipticCurve.P_384,
  );
  static readonly P_512 = new EllipticCurveMapping(
    CoseKey.COSEEllipticCurve.P_512,
    JoseKey.JSONWebKeyEllipticCurve.P_521,
  );
  static readonly X25519 = new EllipticCurveMapping(
    CoseKey.COSEEllipticCurve.X25519,
    JoseKey.JSONWebKeyEllipticCurve.X25519,
  );
  static readonly X448 = new EllipticCurveMapping(CoseKey.COSEEllipticCurve.X448, JoseKey.JSONWebKeyEllipticCurve.X448);
  static readonly ED25519 = new EllipticCurveMapping(
    CoseKey.COSEEllipticCurve.ED25519,
    JoseKey.JSONWebKeyEllipticCurve.ED25519,
  );
  static readonly ED448 = new EllipticCurveMapping(
    CoseKey.COSEEllipticCurve.ED448,
    JoseKey.JSONWebKeyEllipticCurve.ED448,
  );
  static readonly SECP256K1 = new EllipticCurveMapping(
    CoseKey.COSEEllipticCurve.SECP256K1,
    JoseKey.JSONWebKeyEllipticCurve.SECP256K1,
  );

  private constructor(
    private _coseEllipticCurve: CoseKey.COSEEllipticCurve,
    private _jsonWebKeyEllipticCurve: JoseKey.JSONWebKeyEllipticCurve,
  ) {
    EllipticCurveMapping._values.push(this);
  }

  get coseEllipticCurve(): CoseKey.COSEEllipticCurve {
    return this._coseEllipticCurve;
  }

  get jsonWebKeyEllipticCurve(): JoseKey.JSONWebKeyEllipticCurve {
    return this._jsonWebKeyEllipticCurve;
  }

  static values(): EllipticCurveMapping[] {
    return EllipticCurveMapping._values;
  }

  static fromCOSEEllipticCurve(coseEllipticCurve: CoseKey.COSEEllipticCurve): JoseKey.JSONWebKeyEllipticCurve | null {
    const found = EllipticCurveMapping.values().find((m) => {
      return m.coseEllipticCurve === coseEllipticCurve;
    });

    if (found == null) {
      return null;
    }

    return found.jsonWebKeyEllipticCurve;
  }

  static fromCOSEEllipticCurveValue(coseEllipticCurveValue: number): JoseKey.JSONWebKeyEllipticCurve | null {
    const found = EllipticCurveMapping.values().find((m) => {
      return m.coseEllipticCurve.value === coseEllipticCurveValue;
    });

    if (found == null) {
      return null;
    }

    return found.jsonWebKeyEllipticCurve;
  }

  static fromJSONWebKeyEllipticCurve(
    jsonWebKeyEllipticCurve: JoseKey.JSONWebKeyEllipticCurve,
  ): CoseKey.COSEEllipticCurve | null {
    const found = EllipticCurveMapping.values().find((m) => {
      return m.jsonWebKeyEllipticCurve === jsonWebKeyEllipticCurve;
    });

    if (found == null) {
      return null;
    }

    return found.coseEllipticCurve;
  }

  static fromJSONWebKeyEllipticCurveName(jsonWebKeyEllipticCurveValue: string): CoseKey.COSEEllipticCurve | null {
    const found = EllipticCurveMapping.values().find((m) => {
      return m.jsonWebKeyEllipticCurve.name === jsonWebKeyEllipticCurveValue;
    });

    if (found == null) {
      return null;
    }

    return found.coseEllipticCurve;
  }
}

export { KeyTypeMapping, KeyAlgorithmMapping, KeyParameterMapping, KeyOperationMapping, EllipticCurveMapping };
