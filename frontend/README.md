# GPTogether - Frontend

GPTogether is a project that aims to improve the experience of ChatGPT by connecting users based on their prompts, and improving prompt suggestions. This repository contains the frontend code for the GPTogether project.

## Getting started

To get started with GPTogether, follow the steps below:

### Add your files

- [ ] Node.js
- [ ] NPM

### Installation

- [ ] Clone the repository using Git:

```
git clone https://github.com/sepana-io/gptogether
```

- [ ] Go to frontend folder

```
cd gptogether/frontend
```

- [ ] Install the dependencies:

```
npm install
```

- [ ] Set up the required environment variables by creating a `.env` file in the root directory of the project with the following variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Note: Replace the `your_xxx` values with the appropriate values for your Firebase project.

### Usage

To start the development server, run the following command:

```
npm run dev
```

### Deployment

To deploy the app to production, run the following command:

```
npm run build
```

This will create an optimized build of the app in the `build` directory. You can then deploy the contents of this directory to your web server.

## Contributing

We welcome contributions to GPTogether! To get started, please fork the repository and submit a pull request with your changes.

### Support

If you encounter any issues or have any questions about GPTogether, please open an issue on github.

### License

GPTogether is open-source software licensed under the [Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0).
