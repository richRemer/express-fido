// CBOR Object Signing and Encryption (COSE) algorithm constants
// References
//   https://www.iana.org/assignments/cose/cose.xhtml#algorithms
//   https://github.com/w3c/webauthn/issues/1757
// excludes most non-"Recommended" algorithms
// includes RS256, which is required to support Windows Hello

// NOT Recommended by spec
export const RS256 = -257;  // for Windows Hello

// Recommended by spec
export const HSS_LMS = -46;
export const SHAKE256 = -45;
export const SHA_512 = -44;
export const SHA_384 = -43;
export const RSAES_OAEP_with_SHA_512 = -42;
export const RSAES_OAEP_with_SHA_256 = -41;
export const RSAES_OAEP_with_RFC_8017_default_parameters = -40;
export const PS512 = -39;
export const PS384 = -38;
export const PS256 = -37;
export const ES512 = -36;
export const ES384 = -35;
export const ECDH_SS_A256KW = -34;
export const ECDH_SS_A192KW = -33;
export const ECDH_SS_A128KW = -32;
export const ECDH_ES_A256KW = -31;
export const ECDH_ES_A192KW = -30;
export const ECDH_ES_A128KW = -29;
export const ECDH_SS_HKDF_512 = -28;
export const ECDH_SS_HKDF_256 = -27;
export const ECDH_ES_HKDF_512 = -26;
export const ECDH_ES_HKDF_256 = -25;
export const SHAKE128 = -18;
export const SHA_512_256 = -17;
export const SHA_256 = -16;
export const direct_HKDF_AES_256 = -13;
export const direct_HKDF_AES_128 = -12;
export const direct_HKDF_SHA_512 = -11;
export const direct_HKDF_SHA_256 = -10;
export const EdDSA = -8;
export const ES256 = -7;  // widely supported
export const direct = -6;
export const A256KW = -5;
export const A192KW = -4;
export const A128KW = -3;
export const A128GCM = 1;
export const A192GCM = 2;
export const A256GCM = 3;
export const HMAC_256_64 = 4;
export const HMAC_256_256 = 5;
export const HMAC_384_384 = 6;
export const HMAC_512_512 = 7;
export const AES_CCM_16_64_128 = 10;
export const AES_CCM_16_64_256 = 11;
export const AES_CCM_64_64_128 = 12;
export const AES_CCM_64_64_256 = 13;
export const AES_MAC_128_64 = 14;
export const AES_MAC_256_64 = 15;
export const ChaCha20_Poly1305 = 24;
export const AES_MAC_128_128 = 25;
export const AES_MAC_256_128 = 26;
export const AES_CCM_16_128_128 = 30;
export const AES_CCM_16_128_256 = 31;
export const AES_CCM_64_128_128 = 32;
export const AES_CCM_64_128_256 = 33;
