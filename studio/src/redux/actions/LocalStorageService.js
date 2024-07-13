class LocalStorageService {
  cache = {};

  setItem(key, value) {
    this.cache[key] = value;
    value = JSON.stringify(value);
    localStorage.setItem(key, value);
    return true;
  }

  clear() {
    this.cache = {};
    localStorage.clear();
  }
  getItem(key) {
    if (this.cache[key]) return this.cache[key];
    const value = localStorage.getItem(key);
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  }

  removeItem(key) {
    delete this.cache[key];
    localStorage.removeItem(key);
  }
}
const Singleton = new LocalStorageService();
export default Singleton;
