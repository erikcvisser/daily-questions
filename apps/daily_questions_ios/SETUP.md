# Daily Questions iOS App Setup

## Prerequisites

1. **Apple Developer Account** ($99/year) - for App Store distribution
2. **Firebase Project** (free tier) - for FCM push notifications
3. **Xcode** - latest version
4. **Flutter SDK** - 3.10+
5. **CocoaPods** - `gem install cocoapods`

## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project (or use existing) named "Daily Questions"
3. Add an iOS app with bundle ID: `app.dailyquestions.dailyQuestionsIos`
4. Download `GoogleService-Info.plist` and place it in `ios/Runner/`
5. In Firebase Console > Project Settings > Cloud Messaging:
   - Upload your APNs Authentication Key (.p8) from Apple Developer portal

## APNs Key

1. Go to [Apple Developer > Keys](https://developer.apple.com/account/resources/authkeys/list)
2. Create a new key with "Apple Push Notifications service (APNs)" enabled
3. Download the .p8 file
4. Upload it to Firebase Cloud Messaging settings
5. Note the Key ID and Team ID

## Backend Environment Variables

Add these to your Vercel/deployment environment:

```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Get these from Firebase Console > Project Settings > Service Accounts > Generate new private key.

## Build & Run

```bash
cd apps/daily_questions_ios
flutter pub get
cd ios && pod install && cd ..
flutter run
```

## Release Build

```bash
flutter build ios --release
```

Then open `ios/Runner.xcworkspace` in Xcode for archive and App Store submission.

## App Store Checklist

- [ ] App icons (1024x1024 in Assets.xcassets)
- [ ] Screenshots for each device size
- [ ] Privacy policy URL
- [ ] `GoogleService-Info.plist` in `ios/Runner/`
- [ ] Push notification capability enabled in Xcode signing
- [ ] APNs key uploaded to Firebase
