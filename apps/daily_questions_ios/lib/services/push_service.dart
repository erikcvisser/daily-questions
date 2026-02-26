import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:webview_flutter/webview_flutter.dart';

class PushService {
  final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  String? _fcmToken;
  bool _tokenRegistered = false;
  void Function(String path)? onNotificationTap;

  Future<void> initialize() async {
    final settings = await _messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    if (settings.authorizationStatus == AuthorizationStatus.authorized ||
        settings.authorizationStatus == AuthorizationStatus.provisional) {
      _fcmToken = await _messaging.getToken();

      _messaging.onTokenRefresh.listen((newToken) {
        _fcmToken = newToken;
        _tokenRegistered = false;
      });

      FirebaseMessaging.onMessage.listen(_handleForegroundMessage);
      FirebaseMessaging.onMessageOpenedApp.listen(_handleNotificationTap);

      final initialMessage = await _messaging.getInitialMessage();
      if (initialMessage != null) {
        _handleNotificationTap(initialMessage);
      }
    }
  }

  void _handleForegroundMessage(RemoteMessage message) {
    // Foreground notifications are handled by the system on iOS
    // when content_available or mutable_content is set (done server-side)
  }

  void _handleNotificationTap(RemoteMessage message) {
    final path = message.data['url'] ?? '/submission/new';
    onNotificationTap?.call(path);
  }

  Future<void> registerTokenWithBackend(WebViewController controller) async {
    if (_fcmToken == null || _tokenRegistered) return;

    final timezone = DateTime.now().timeZoneName;
    final ianaTimezone = await _getIanaTimezone(controller);

    final js = '''
      (async () => {
        try {
          const resp = await fetch('/api/device-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              token: '$_fcmToken',
              platform: 'ios',
              timezone: '$ianaTimezone'
            })
          });
          return resp.ok ? 'ok' : 'error:' + resp.status;
        } catch(e) {
          return 'error:' + e.message;
        }
      })()
    ''';

    try {
      final result = await controller.runJavaScriptReturningResult(js);
      if (result.toString().contains('ok')) {
        _tokenRegistered = true;
      }
    } catch (e) {
      // Will retry on next page navigation
    }
  }

  Future<String> _getIanaTimezone(WebViewController controller) async {
    try {
      final result = await controller.runJavaScriptReturningResult(
        'Intl.DateTimeFormat().resolvedOptions().timeZone',
      );
      return result.toString().replaceAll('"', '');
    } catch (_) {
      return 'Europe/Amsterdam';
    }
  }
}
