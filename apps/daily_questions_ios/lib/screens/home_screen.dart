import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import '../services/push_service.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  late final WebViewController _controller;
  final PushService _pushService = PushService();
  bool _isLoading = true;
  String? _pendingDeepLink;

  static const String _baseUrl = 'https://dailyquestions.app';

  @override
  void initState() {
    super.initState();
    _initWebView();
    _initPush();
  }

  void _initWebView() {
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (_) {
            if (mounted) setState(() => _isLoading = true);
          },
          onPageFinished: (url) {
            if (mounted) setState(() => _isLoading = false);
            _checkAuthState(url);
            if (_pendingDeepLink != null) {
              _controller.loadRequest(Uri.parse('$_baseUrl$_pendingDeepLink'));
              _pendingDeepLink = null;
            }
          },
          onNavigationRequest: (request) {
            final uri = Uri.parse(request.url);
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
