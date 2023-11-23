Simple FIDO public key implementation for Express.js.

express-fido
============

Server Example
--------------
```js
import http from "http";
import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import {FIDO} from "@apsu/express-fido";

const app = express();
const server = http.createServer(app);  // example expects TLS proxy
const users = new Map();                // mock users DB
const rpId = "localhost";               // identifies FIDO server
const fido = new FIDO({rpId});

app.set("trust proxy", 1);              // example expects TLS proxy
app.use(session({secret: "secret"}));   // sessions must be enabled
app.use(bodyParser.json());             // middleware expects parsed body

app.use(fido.init({
  // implement load function to get user key from DB
  async load(id) {
    return users.get(id);
  },

  // implement save function to save registered user
  async save(id, name, displayName, publicKey, counter) {
    const user = {id, name, displayName, publicKey, counter};
    users.set(id, user);
  }
}));

// endpoint to send attestation options to client (for registering)
app.get("/register/:fidoName", fido.attestationOptions());

// endpoint to send assertion options to client (for login)
app.get("/login/challenge", fido.assertionOptions());

// endpoint to save credential sent from client
app.post("/register", fido.attestation());

// endpoint to verify credential sent from client
app.post("/login", fido.assertion());

server.listen(process.env.LISTEN_PORT, process.env.LISTEN_ADDR);
```

Client Example
--------------
This client example makes use of the [client library](lib/fido-client.js)
provided by this package.  This example assumes you have copied the library
into the same directory as the example code.

**index.html**  
```html
<!doctype html>
<html>
  <head>
    <script type="module" src="client.js"></script>
  </head>
  <body>
    <section class="register">
      <label for="fidoName">Username</label>
      <input id="fidoName" autocomplete="webauthn username">
      <button id="register" type="button">Register</button>
    </section>
    <section class="login">
      <button id="login" type="button">Login</button>
    </section>
  </body>
</html>
```

**client.js**  
```js
import * as fido from "./fido-client.js";

const {href} = window.location;

document.addEventListener("DOMContentLoaded", () => {
  const register = document.getElementById("register");
  const login = document.getElementById("login");
  const fidoName = document.getElementById("fidoName");

  register.addEventListener("click", async () => {
    const name = fidoName.value;
    const opt = {url: new URL(`/register/${name}`, href)};
    const cred = {url: new URL("/register", href)};
    const user = await fido.create({opt, cred});

    console.info("logged in as", user.name);
  });

  login.addEventListener("click", async () => {
    const opt = {url: new URL("/login/challenge", href)};
    const cred = {url: new URL("/login", href)};
    const user = await fido.get({opt, cred});

    console.info("logged in as", user.name);
  });
});
```
