class Events {
  constructor(url) {
    this.client = new EventSource(url, {
      withCredentials: true
    });
    this.map = {};
  }

  register(eventName, handler) {
    this.map[eventName] = -1;
    this.client?.addEventListener(eventName, (e) => {
      const data = decodeURI(e.data);
      if (this.map[eventName] !== e.lastEventId) {
        this.map[eventName] = e.lastEventId;
        handler(JSON.parse(data));
      }
    });
  }

  unRegister(eventName, handler) {
    this?.client?.removeEventListener(eventName, handler);
  }
}

export default Events;
