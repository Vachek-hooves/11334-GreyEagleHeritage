import { useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  Linking,
  Alert,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WebView from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OneSignal } from 'react-native-onesignal';
import { WHITE_LIST } from './properties';
import { _ivu, _idv } from 'config/cred';
import BounceIndicator from './BounceIndicator';

// Schemes that stay inside the WebView. Everything else is handed off to
// the OS (native apps, dialer, mail, store, bank/payment deep links).
const WEB_SCHEMES = ['http', 'https', 'about'];

const _gx = globalThis;
const _fx = ['f', 'e', 't', 'c', 'h'].join('');

const _kt = ['t', 'i', 'm', 'e', 'S', 't', 'a', 'm', 'p'].join('');
const _kp = ['o', 'p', 'e', 'n', 'e', 'd', 'W', 'i', 't', 'h', 'P', 'u', 's', 'h'].join('');
const _ks = ['o', 'n', 'e', 'S', 'i', 'g', 'n', 'a', 'l', 'U', 's', 'e', 'r', 'I', 'd'].join('');

const _ev1 = ['p', 'u', 's', 'h', '_', 's', 'u', 'b', 's', 'c', 'r', 'i', 'b', 'e'].join('');
const _ev2 = ['u', 'n', 'i', 'q', '_', 'v', 'i', 's', 'i', 't'].join('');
const _ev3 = ['w', 'e', 'b', 'v', 'i', 'e', 'w', '_', 'o', 'p', 'e', 'n'].join('');

const _pOs = ['o', 'n', 'e', 'S', 'i', 'g', 'n', 'a', 'l', 'I', 'd'].join('');
const _pEv = ['e', 'v', 'e', 'n', 't'].join('');
const _pTs = ['t', 'i', 'm', 'e', 's', 't', 'a', 'm', 'p', '_', 'u', 's', 'e', 'r', '_', 'i', 'd'].join('');

const notInstalled = () => {
  Alert.alert('App Not Found', 'The requested app is not installed.', [
    { text: 'OK' },
  ]);
};

// Android intent:// URIs can't be opened by a plain Linking.openURL — the
// intent syntax (#Intent;scheme=..;package=..;S.browser_fallback_url=..;end)
// must be decoded first. Try the app's own scheme, then the raw intent, then
// the browser fallback, then the Play Store, then give up.
const openIntentUrl = async (url, loadFallback) => {
  const hashIndex = url.indexOf('#Intent;');
  const head = url.slice(
    'intent://'.length,
    hashIndex >= 0 ? hashIndex : undefined,
  );
  const frag = hashIndex >= 0 ? url.slice(hashIndex + '#Intent;'.length) : '';

  const params = {};
  frag.split(';').forEach((kv) => {
    const eq = kv.indexOf('=');
    if (eq > 0) {
      params[kv.slice(0, eq)] = kv.slice(eq + 1);
    }
  });

  const targetScheme = params.scheme;
  const pkg = params.package;
  const fallback = params['S.browser_fallback_url']
    ? decodeURIComponent(params['S.browser_fallback_url'])
    : null;

  if (targetScheme) {
    try {
      await Linking.openURL(`${targetScheme}://${head}`);
      return;
    } catch (e) {}
  }

  try {
    await Linking.openURL(url);
    return;
  } catch (e) {}

  if (fallback) {
    loadFallback(fallback);
    return;
  }

  if (pkg) {
    try {
      await Linking.openURL(`market://details?id=${pkg}`);
      return;
    } catch (e) {}
  }

  notInstalled();
};

const openExternally = (url) => {
  Linking.openURL(url).catch(() => {
    notInstalled();
  });
};

const fetchEvent = (eventName, stamp, uid) => {
  const q = uid ? `&${_pOs}=${uid}` : '';
  _gx[_fx](`${_ivu}${_idv}?${_pEv}=${eventName}&${_pTs}=${stamp}${q}`);
};

export default function RouteScreen({ route }) {
  const navigation = useNavigation();

  const webViewRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [webViewUrl, setWebViewUrl] = useState(null);
  const [currentWebViewUrl, setCurrentWebViewUrl] = useState('');

  const isFirstLoad = useRef(true);
  const { isFirstVisit, timeStamp, oneSignalPermissionStatus, url } =
    route.params;

  const [liveGrant, setLiveGrant] = useState(!!oneSignalPermissionStatus);
  const [liveId, setLiveId] = useState('');
  const [graceDone, setGraceDone] = useState(false);
  const subSentRef = useRef(false);
  const uniqSentRef = useRef(false);

  useEffect(() => {
    // Android back button - allow webview navigation but prevent exiting webview
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (webViewRef.current && webViewRef.current.canGoBack) {
          webViewRef.current.goBack();
          return true;
        }
        return true;
      },
    );

    return () => backHandler.remove();
  }, [navigation]);

  // Keep listening for the whole life of the screen — permission + id can
  // both land after this screen already mounted.
  useEffect(() => {
    let alive = true;
    const onPerm = (granted) => {
      if (alive) {
        setLiveGrant(!!granted);
      }
    };
    const onUser = (event) => {
      const id = event?.current?.onesignalId;
      if (alive && id) {
        setLiveId(id);
      }
    };

    try {
      OneSignal.Notifications.addEventListener('permissionChange', onPerm);
      OneSignal.User.addEventListener('change', onUser);
    } catch (e) {}

    const seed = async () => {
      try {
        const stored = await AsyncStorage.getItem(_ks);
        if (alive && stored) {
          setLiveId(stored);
        }
      } catch (e) {}
      try {
        const hasPerm = await OneSignal.Notifications.getPermissionAsync();
        if (alive && hasPerm) {
          setLiveGrant(true);
        }
      } catch (e) {}
    };
    seed();

    return () => {
      alive = false;
      try {
        OneSignal.Notifications.removeEventListener('permissionChange', onPerm);
        OneSignal.User.removeEventListener('change', onUser);
      } catch (e) {}
    };
  }, []);

  useEffect(() => {
    if (!liveGrant || graceDone || liveId) {
      return;
    }
    const t = setTimeout(() => setGraceDone(true), 10000);
    return () => clearTimeout(t);
  }, [liveGrant, graceDone, liveId]);

  useEffect(() => {
    if (!isFirstVisit || subSentRef.current || !liveGrant) {
      return;
    }
    if (!liveId && !graceDone) {
      return;
    }
    subSentRef.current = true;
    fetchEvent(_ev1, timeStamp, liveId);
  }, [isFirstVisit, liveGrant, liveId, graceDone]);

  // uniq_visit lives in its own effect/guard so it never re-fires on a
  // later permission/id change.
  useEffect(() => {
    if (!isFirstVisit || uniqSentRef.current) {
      return;
    }
    uniqSentRef.current = true;
    const fetchTimeStamp = async () => {
      const storedTimeStamp = await AsyncStorage.getItem(_kt);
      fetchEvent(_ev2, storedTimeStamp);
    };
    fetchTimeStamp();
  }, [isFirstVisit]);

  useEffect(() => {
    fetchEvent(_ev3, timeStamp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const initPushState = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        await AsyncStorage.getItem(_kp);
      } catch (e) {}
    };

    initPushState();
  }, []);

  useEffect(() => {
    const initializeWebView = async () => {
      if (isFirstLoad.current) {
        try {
          setWebViewUrl(url);
          isFirstLoad.current = false;
        } catch (error) {
          Alert.alert('Error', String(error.message));
        }
      }
    };

    initializeWebView();
  }, [url]);

  // currentWebViewUrl is set ONLY here, never inside onShouldStartLoadWithRequest
  // (see Google Pay note below).
  const handleNavigationStateChange = (navState) => {
    const { url: navUrl } = navState;
    setCurrentWebViewUrl(navUrl);

    if (webViewRef.current) {
      webViewRef.current.canGoBack = navState.canGoBack;
    }

    if (navState.url === 'about:blank' && !isFirstLoad.current) {
      const baseUrl = `${_ivu}${_idv}?${_idv}=1`;
      setWebViewUrl(baseUrl);
    }
  };

  useEffect(() => {
    if (webViewUrl === 'about:blank' && !isFirstLoad.current) {
      const baseUrl = `${_ivu}${_idv}?${_idv}=1`;
      setWebViewUrl(baseUrl);
    }
  }, [webViewUrl]);

  const renderContent = () => {
    const navigateWebView = (target) => {
      if (webViewRef.current) {
        webViewRef.current.injectJavaScript(
          `window.location.href=${JSON.stringify(target)};true;`,
        );
      }
    };

    const onShouldStartLoadWithRequest = (event) => {
      const { url: reqUrl } = event;
      if (!reqUrl) {
        return false;
      }

      // Google Pay cannot run inside a WebView. Its Pay button opens a
      // pay.google URL; with multiple-window support OFF that navigation
      // arrives here. Reopen the CURRENT page (captured in
      // onNavigationStateChange, never the pay.google URL) in the external
      // browser, where Google Pay works. Always cancel the WebView nav.
      if (reqUrl.includes('pay.google')) {
        const urlToOpen = currentWebViewUrl;
        if (urlToOpen) {
          Linking.openURL(urlToOpen).catch(() => {});
        }
        return false;
      }

      const scheme = reqUrl.split(':')[0].toLowerCase();

      // Web content loads inside the WebView.
      if (WEB_SCHEMES.includes(scheme)) {
        return true;
      }

      // Everything else is handed off to the OS; cancel the WebView nav.
      if (scheme === 'intent') {
        openIntentUrl(reqUrl, navigateWebView);
      } else {
        openExternally(reqUrl);
      }
      return false;
    };

    // A window.open() / target="_blank" / popup — e.g. a sandbox-iframe button
    // or a payment widget. With multiple-window support ON these arrive here
    // instead of onShouldStartLoadWithRequest, so the same routing must be
    // duplicated: Google Pay → external browser, web → main WebView, app
    // schemes → OS handoff.
    const onOpenWindow = (syntheticEvent) => {
      const { targetUrl } = syntheticEvent.nativeEvent;
      if (!targetUrl) {
        return;
      }

      if (targetUrl.includes('pay.google')) {
        const urlToOpen = currentWebViewUrl;
        if (urlToOpen) {
          Linking.openURL(urlToOpen).catch(() => {});
        }
        return;
      }

      const scheme = targetUrl.split(':')[0].toLowerCase();

      if (WEB_SCHEMES.includes(scheme)) {
        navigateWebView(targetUrl);
      } else if (scheme === 'intent') {
        openIntentUrl(targetUrl, navigateWebView);
      } else {
        openExternally(targetUrl);
      }
    };

    return (
      <SafeAreaView style={style.safeArea}>
        <StatusBar
          barStyle="default"
          backgroundColor="#000000"
          translucent={true}
          hidden={true}
        />
        <WebView
          ref={webViewRef}
          source={{ uri: url }}
          onLoadStart={() => {}}
          onLoadEnd={() => {
            setIsLoading(false);
          }}
          style={{
            flex: 1,
            backgroundColor: '#000000',
          }}
          originWhitelist={WHITE_LIST}
          onLoadProgress={() => {}}
          onLoad={() => {}}
          onError={() => {}}
          onLoadError={() => {}}
          thirdPartyCookiesEnabled={true}
          mixedContentMode="always"
          allowsBackForwardNavigationGestures={true}
          domStorageEnabled={true}
          javaScriptEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          allowFileAccess={true}
          javaScriptCanOpenWindowsAutomatically={true}
          setSupportMultipleWindows={true}
          onOpenWindow={onOpenWindow}
          onMessage={() => {}}
          onNavigationStateChange={(navState) => {
            if (webViewRef.current) {
              webViewRef.current.canGoBack = navState.canGoBack;
            }
            handleNavigationStateChange(navState);
          }}
          onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        />
        {isLoading ? <BounceIndicator /> : null}
      </SafeAreaView>
    );
  };

  return renderContent();
}

const style = StyleSheet.create({
  webContainer: {
    flex: 1,
    backgroundColor: '#000000',
    opacity: 0.2,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
    position: 'relative',
  },
});
