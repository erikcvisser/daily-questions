import 'dart:async';
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:app_links/app_links.dart';
import '../services/push_service.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  late final WebViewController _controller;
  final PushService _pushService = PushService();
  late final AppLinks _appLinks;
  StreamSubscription<Uri>? _linkSubscription;
  bool _isLoading = true;
  String? _pendingDeepLink;

  static const String _baseUrl = 'https://dailyquestions.app';

  @override
  void initState() {
    super.initState();
    _initWebView();
    _initPush();
    _initDeepLinks();
  }

  @override
  void dispose() {
    _linkSubscription?.cancel();
    super.dispose();
  }

  void _initWebView() {
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFFFFFFFF))
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (_) {
            if (mounted) setState(() => _isLoading = true);
          },
          onPageFinished: (url) {
            if (mounted) setState(() => _isLoading = false);
            _controller.runJavaScript(
              "document.documentElement.classList.add('ios-app');",
            );
            _checkAuthState(url);
            if (_pendingDeepLink != null) {
              _controller.loadRequest(Uri.parse('$_baseUrl$_pendingDeepLink'));
              _pendingDeepLink = null;
            }
          },
          onNavigationRequest: (request) {
            final uri = Uri.parse(request.url);

            // Intercept mobile OAuth — open in Safari
            if (uri.host == 'dailyquestions.app' &&
                uri.path == '/api/auth/mobile-signin') {
              launchUrl(uri, mode: LaunchMode.externalApplication);
              return NavigationDecision.prevent;
            }

            if (uri.host == 'dailyquestions.app' || uri.host == 'localhost') {
              return NavigationDecision.navigate;
            }
            return NavigationDecision.prevent;
          },
        ),
      )
      ..setUserAgent('DailyQuestionsIOS/1.0')
      ..loadRequest(Uri.parse(_baseUrl));
  }

  void _initDeepLinks() {
    _appLinks = AppLinks();

    // Handle link when app is already running
    _linkSubscription = _appLinks.uriLinkStream.listen(_handleAuthCallback);

    // Handle link when app was cold-started from link
    _appLinks.getInitialLink().then((uri) {
      if (uri != null) _handleAuthCallback(uri);
    });
  }

  void _handleAuthCallback(Uri uri) {
    if (uri.scheme == 'dailyquestions' && uri.host == 'auth') {
      final token = uri.queryParameters['token'];
      if (token != null) {
        // Load mobile-session endpoint which sets the cookie and redirects
        _controller.loadRequest(Uri.parse(
          '$_baseUrl/api/auth/mobile-session?token=${Uri.encodeComponent(token)}',
        ));
      }
    }
  }

  Future<void> _initPush() async {
    _pushService.onNotificationTap = (path) {
      if (_isLoading) {
        _pendingDeepLink = path;
      } else {
        _controller.loadRequest(Uri.parse('$_baseUrl$path'));
      }
    };

    await _pushService.initialize();
  }

  void _checkAuthState(String url) {
    final protectedPaths = ['/overview', '/questions', '/submission', '/profile'];
    final isAuthenticated = protectedPaths.any((path) => url.contains(path));

    if (isAuthenticated) {
      _pushService.registerTokenWithBackend(_controller);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Stack(
          children: [
            WebViewWidget(controller: _controller),
            if (_isLoading)
              const Center(
                child: CircularProgressIndicator(),
              ),
          ],
        ),
      ),
    );
  }
}
