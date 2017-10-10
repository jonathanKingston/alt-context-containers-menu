const menuClickHandler = {
  menuElement: null,
  lastUrl: null,
  linkSelector:"a[href]",

  init() {
    this.createMenu();

    document.addEventListener("keydown", this);
    document.addEventListener("click", this);
  },

  handleEvent(e) {
    switch(e.type) {
    case "keydown":
      if (this.isMenuOpen()) {
        if (e.key === "Escape") {
          this.menuClose();
        }
      }
      if (e.altKey) {
        e.preventDefault();
        e.stopPropagation();
        this.addOpenListeners(e);
      } 
    break;
    case "keyup":
      if (e.altKey) {
        this.removeOpenListeners();
      }
      break;
    case "click":
      if (this.isMenuOpen() &&
          (e.target.closest(this.linkSelector) || e.target.matches(this.linkSelector))) {
        e.preventDefault();
        e.stopPropagation();
      } else {
        this.menuClose();
      }
      this.removeOpenListeners();
      break;
    case "mousedown":
      if (this.isMenuOpen()) {
        if (!e.target.closest("#containers-menu")) {
          this.menuClose();
        }
        return;
      }
      if (e.target.closest(this.linkSelector) ||
          e.target.matches(this.linkSelector)) {
        // Prevent text selection
        e.preventDefault();
        e.stopPropagation();
        this.lastUrl = e.target.href;
        this.showMenu(e);
      }
      /*
      setTimeout(() => {
        this.removeOpenListeners();
      }, 1000);
      */
      break;
    }
  },

  addOpenListeners(e) {
    this.shiftKey = e.shiftKey || e.key === "Shift";
    this.ctrlKey = e.ctrlKey || e.key === "Control";
    document.addEventListener("mousedown", this);
    document.addEventListener("keyup", this);
  },

  removeOpenListeners() {
    this.ctrlKey = false;
    this.shiftKey = false;
    document.removeEventListener("mousedown", this);
    document.removeEventListener("keyup", this);
  },

  isMenuOpen() {
    return !this.menuElement.hidden;
  },

  menuOpen() {
    this.menuElement.hidden = false;
  },

  menuClose() {
    this.menuElement.hidden = true;
  },

  getContainers() {
    return browser.runtime.sendMessage({
      method: "getContainers"
    });
  },

  async createMenu() {
    if (this.menuElement) {
      return this.menuElement;
    }
    const menuElement = document.createElement("ul");
    menuElement.id = "containers-menu";
    menuElement.hidden = true;
    const containers = await this.getContainers();
    containers.forEach((container) => {
      const containerElement = document.createElement("li");
      const spanElement = document.createElement("span");
      spanElement.innerText = container.name;
      containerElement.appendChild(spanElement);
      containerElement.setAttribute("tabindex", 0);
      const iconElement = document.createElement("div");
      iconElement.classList.add("usercontext-icon");
      const iconUrl = container.iconUrl;
      iconElement.style.mask = `url(${iconUrl}) top left / contain`;
      iconElement.style.background = container.colorCode;
      containerElement.prepend(iconElement);
      menuElement.appendChild(containerElement);
      containerElement.addEventListener("click", (e) => {
        this.openContainer(container);
      });
    });
    document.body.appendChild(menuElement);
    this.menuElement = menuElement;
    return menuElement;
  },

  async showMenu(e) {
    const menuElement = await this.createMenu();
    this.menuOpen();
    menuElement.style.top = `${e.clientY}px`;
    menuElement.style.left = `${e.clientX}px`;
    menuElement.querySelector("div").focus();
  },

  openContainer(container) {
    return browser.runtime.sendMessage({
      method: "openTab",
      url: this.lastUrl,
      ctrl: this.ctrlKey || false,
      shift: this.shiftKey || false,
      cookieStoreId: container.cookieStoreId
    });
  }

};

menuClickHandler.init();
