// workaround for using `confirm()` dialog in tauri, required because of
// this issue: https://github.com/tauri-apps/tauri/issues/7845
export const confirmAction = async (msg) => {
  if (window.__TAURI__) {
    // In tauri's webview this returns a promise which we need to await.
    return await confirm(msg);
  } else {
    return confirm(msg);
  }
};
