const json = "application/json";

export async function create({
  opt: {
    method: optMethod="GET",
    url: optUrl,
    headers: optHeaders={Accept: json, "Content-Type": json}
  },
  cred: {
    method: credMethod="POST",
    url: credUrl,
    headers: credHeaders={Accept: json, "Content-Type": json}
  }
}) {
  const options = await request(optMethod, optUrl, optHeaders);
  const decoded = decodeOptions(options);
  const credential = await navigator.credentials.create(decoded);
  const encoded = encodeCredential(credential);
  const user = await request(credMethod, credUrl, credHeaders, encoded);
  return user;
}

export async function get({
  opt: {
    method: optMethod="GET",
    url: optUrl,
    headers: optHeaders={Accept: json, "Content-Type": json}
  },
  cred: {
    method: credMethod="POST",
    url: credUrl,
    headers: credHeaders={Accept: json, "Content-Type": json}
  }
}) {
  const options = await request(optMethod, optUrl, optHeaders);
  const decoded = decodeOptions(options);
  const credential = await navigator.credentials.get(decoded);
  const encoded = encodeCredential(credential);
  const user = await request(credMethod, credUrl, credHeaders, encoded);
  return user;
}

function decode(string) {
  const decoded = atob(string.replace(/_/g, "/").replace(/-/g, "+"));
  return new Uint8Array([...decoded].map(c => c.charCodeAt(0))).buffer;
}

function decodeOptions(options) {
  return {
    publicKey: clean({
      ...options,
      challenge: decode(options.challenge),
      user: options.user === undefined ? undefined : {
        ...options.user,
        id: decode(options.user.id)
      }
    })
  };

  function clean(publicKey) {
    const {user, ...key} = publicKey;
    return user ? {...key, user} : key;
  }
}

function encode(buffer) {
  if (buffer) {
    const encoded = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    return encoded.replace(/\//g, "_").replace(/\+/g, "-").replace(/=+$/, "");
  } else {
    return undefined;
  }
}

function encodeCredential(credential) {
  return {
    authenticatorAttachment: encode(credential.authenticatorAttachment),
    id: credential.id,
    response: encodeResponse(credential.response),
    type: credential.type
  };

  function encodeResponse(response) {
    return {
      attestationObject: encode(response.attestationObject),
      authenticatorData: encode(response.authenticatorData),
      clientDataJSON: encode(response.clientDataJSON),
      signature: encode(response.signature),
      userHandle: encode(response.userHandle)
    };
  }
}

async function request(method, url, headers, body) {
  body = body && typeof body === "object" ? JSON.stringify(body) : body;

  const res = await fetch(url, {method, headers, body});
  const type = res.headers.get("Content-Type");

  if (!res.ok) {
    throw new Error(`unexpected HTTP ${res.status} status`);
  } else if (type && type.startsWith(json)) {
    return res.json();
  } else {
    return res.text();
  }
}
