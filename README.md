# Boilerplate Game Server [WIP]

Contains a server that allows for users to log in and interact with each other.

---

## Features

**User Management**
- Secure login
- Custom profiles
  - Display name
  - Avatar image
  - Profile themes
- New user email verification
- Firebase is a little funky when it comes to user state between the backend and
  frontend. I've put together an API that allows for user access via the frontend
  but still keeps all the logic on the backend.

---

## Installation

```sh
npm i
```

---

## HTTPS setup

```
npm run setup-certs
```

Enter in these values when prompted
- **pass phrase**: `pass`
- **Country Name**: `US`
- **State**: `Kansas`
- **State**: `Oz`
- **Organization Name**: `Acme Inc.`
- **Organization Unit Name**: `Anvil division`
- **Common Name**: `localhost`
- **Email**: `dev@example.com`

When the script has completed you should have a `certs` folder in the root of
the project. You'll then want to open a browser and follow these steps:

**Chrome**
- Go to Settings and scroll down until you see the **Show advanced settings...**
  link. Click on it to expand settings. Scroll down to **HTTPS/SSL** and click on
  **Manage certificates...**.
- Go to the **Trusted Root Certification Authorities** tab.
- Click on **Import**.
- In the **File to Import** window, click **Browse**, navigate to the `certs`
  directory that was created. There should be a drop-down next to the **File name**
  input field. Expand it and select **All Files**. Then select `rootCA.pem` and
  accept all prompts that come up after.

**Firefox**
- Go to Tools > Options > Advanced > Certificates. Click **View Certificates**.
- In the **Authorities** tab click on **Import**.
- Navigate to the `certs` directory that was created and select the `rootCA.pem`
  file.
- Check **Trust this CA to identify websites.** and click **Ok**.

You should now be able to hit up the server under `https`, congrats.

---

## Starting app

```sh
# prod
npm start

# dev - watches for file changes
npm start -- -d

# dev - watches for file changes & reloads app if server file gets updated
npm run server-dev
```

---

## Dev



---

## Useful Links

- http://riotjs.com/guide/
- https://martinmuzatko.github.io/riot-cheatsheet/
- http://ricostacruz.com/cheatsheets/riot.html