import {Fido2Lib} from "fido2-lib";
import {ES256, RS256} from "./cose.js";
import {encode, decode} from "./base64.js";
import idgen from "./idgen.js";

const factor = "either";

export class FIDO {
  fido;
  origin;

  constructor({
    rpId,
    rpName=rpId,
    attestation="none",
    cryptoParams=[ES256, RS256],
    authenticatorRequireResidentKey=true,
    ...moreOptions
  }) {
    if (!rpId) {
      throw new Error("rpId is a required option");
    }

    this.origin = `https://${rpId}`;
    this.fido = new Fido2Lib({
      rpId, rpName, attestation, cryptoParams,
      authenticatorRequireResidentKey, ...moreOptions
    });
  }

  /**
   * Create middleware which handles logging in with credentials.  The client
   * can prompt the user to select credentials using
   * navigator.credentials.get().
   */
  assertion() {
    const {origin, fido} = this;

    return async function assertion(req, res) {
      const credential = req.body;
      const {challenge} = req.fido;
      const {userHandle} = credential.response;
      const key = await req.fido.loadCred(userHandle);
      const expectation = {challenge, origin, factor, userHandle, ...key};

      credential.id = decode(credential.id);

      const result = await fido.assertionResult(credential, expectation);

      res.json(req.fido.login());
    };
  }

  /**
   * Create middleware which sends assertion options to client.  The client can
   * prompt the user to select credentials by passing the options to
   * navigator.credentials.get().
   */
  assertionOptions() {
    const {fido} = this;

    return async function assertionOptions(req, res) {
      const assertionOptions = await fido.assertionOptions();
      const {challenge} = assertionOptions;

      assertionOptions.challenge = req.fido.setChallenge(challenge);
      res.json(assertionOptions);
    };
  }

  /**
   * Create middleware which handles registering new credentials.  The client
   * can create credentials using navigator.credentials.create().
   */
  attestation() {
    const {origin, fido} = this;

    return async function attestation(req, res) {
      const credential = req.body;
      const {challenge} = req.fido;
      const expectation = {challenge, origin, factor};

      credential.id = decode(credential.id);

      const result = await fido.attestationResult(credential, expectation);
      const publicKey = result.authnrData.get("credentialPublicKeyPem");
      const counter = result.authnrData.get("counter");

      await req.fido.saveCred(publicKey, counter);
      res.json(req.fido.login());
    };
  }

  /**
   * Create middleware which sends attestation options to client.  The client
   * can register new credentials by passing the options to
   * navigator.credentials.create().
   */
  attestationOptions() {
    const {fido} = this;

    return async function attestationOptions(req, res) {
      const attestationOptions = await fido.attestationOptions();
      const {challenge} = attestationOptions;

      attestationOptions.user = req.fido.initUser(req.params.fidoName);
      attestationOptions.challenge = req.fido.setChallenge(challenge);
      res.json(attestationOptions);
    };
  }

  /**
   * Initialize FIDO middleware.  Sets the .fido property of the request.  The
   * caller must provide implementations to save and load user credentials.
   */
  init({
    save, // async (id, name, displayName, publicKey, counter)
    load  // async (id) : {publicKey, counter}
  }) {
    return function user(req, res, next) {
      req.fido = new FIDORequestController(req, {save, load});
      next();
    };
  }
}

class FIDORequestController {
  req;
  impl;

  constructor(req, impl) {
    if (!req.session) {
      throw new Error("session not created");
    } else if (!req.session.fido) {
      req.session.fido = {};
    }

    this.req = req;
    this.impl = impl;
  }

  get authenticated() { return this.req.session.fido.authenticated === true; }
  get challenge()     { return this.req.session.fido.challenge; }
  get displayName()   { return this.req.session.fido.user?.displayName; }
  get id()            { return this.req.session.fido.user?.id; }
  get name()          { return this.req.session.fido.user?.name; }

  initUser(name, displayName="") {
    const id = idgen();
    const user = {id, name, displayName};
    this.req.session.fido.user = user;
    this.req.session.fido.authenticated = false;
    return user;
  }

  async loadCred(id) {
    const {name, displayName, publicKey, counter} = await this.impl.load(id);
    this.req.session.user = {id, name, displayName};
    this.req.session.authenticated = false;
    return {publicKey, prevCounter: counter};
  }

  login() {
    const {id, name, displayName} = this;

    if (id && name) {
      this.req.session.fido.authenticated = true;
      delete this.req.session.fido.challenge;
      return {id, name, displayName};
    } else {
      throw new Error("missing credential");
    }
  }

  async saveCred(publicKey, counter) {
    const {id, name, displayName} = this;
    await this.impl.save(id, name, displayName, publicKey, counter);
    return {publicKey, counter};
  }

  setChallenge(challenge) {
    challenge = encode(challenge);
    this.req.session.fido.challenge = challenge;
    this.req.session.authenticated = false;
    return challenge;
  }
}
