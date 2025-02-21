# Welcome to Your Expo App 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## 🚀 Get Started

### 1. Install Dependencies

Run the following commands to install dependencies:

```bash
npm install
npm fund
npm audit fix --force
sudo npm install -g firebase-tools
sudo npm i --save firebase-functions
npm install dotenv --save
```

### 2. Add Environment Variables

Create a `.env` file inside the `functions` folder and add your `SENDGRID_API_KEY`.

### 3. Start the App

```bash
npx expo start
```

### 4. Start Firebase Emulators

Open two new terminal windows and run the following:

```bash
firebase emulators:start --only functions
```

```bash
firebase functions:shell
```

## 📱 Run on Different Devices

You can open the app in:

- [Development Build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android Emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS Simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go)

## 🌀 Project Structure

The project follows a **file-based routing** approach, and you can start developing inside the `app` directory.

## 🔄 Reset the Project

If you need a fresh project, run:

```bash
npm run reset-project
```

This will move the starter code to the `app-example` directory and create a new `app` directory.

## 📚 Learn More

Check out these resources to learn more about Expo development:

- [Expo Documentation](https://docs.expo.dev/): Learn fundamentals and advanced topics.
- [Learn Expo Tutorial](https://docs.expo.dev/tutorial/introduction/): Step-by-step guide to build an app for Android, iOS, and web.

## 💬 Join the Community

- [Expo on GitHub](https://github.com/expo/expo): Contribute to the open-source project.
- [Discord Community](https://chat.expo.dev): Chat with developers and ask questions.

## 🎨 Screenshots

Here are some screenshots of the app:

![Expo Logo](https://expo.dev/static/images/thumb1.png)

## 🎬 Demo Video

Watch this demo to see the app in action:

<video width="600" controls>
  <source src="./assets/demo.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

