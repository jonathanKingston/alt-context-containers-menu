class backgroundManager {
  constructor() {
    browser.runtime.onMessage.addListener((m) => {
      return this.onMessage(m);
    });
  }

  async onMessage(m) {
    let response;

    switch (m.method) {
    case "getContainers":
      response = browser.contextualIdentities.query({});
      break;
    case "openTab":
      const currentTab = await browser.tabs.query({
        active: true,
        windowId: browser.windows.WINDOW_ID_CURRENT
      });
      response = browser.tabs.create({
        url: m.url,
        index: currentTab[0].index + 1,
        active: m.ctrl && m.shift,
        cookieStoreId: m.cookieStoreId
      });
      break;
    }

    return response;
  }
};

new backgroundManager();
