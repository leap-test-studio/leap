import { PROFILE_STORAGE_KEY } from "../../Constants";

class LocalStorageService {
  cache = {};

  setItem(key, value) {
    this.cache[key] = value;
    value = JSON.stringify(value);
    localStorage.setItem(key, value);
    return true;
  }

  clear() {
    console.log("Clear All Local Storage");
    this.cache = {};
    localStorage.clear();
  }
  getItem(key) {
    if (this.cache[key]) return this.cache[key];
    const value = localStorage.getItem(key);
    try {
      this.cache[key] = JSON.parse(value);
      return this.cache[key];
    } catch (e) {
      return value;
    }
  }

  getUserInfo() {
    return this.getItem(PROFILE_STORAGE_KEY);
  }

  removeItem(key) {
    delete this.cache[key];
    localStorage.removeItem(key);
  }
}
const Singleton = new LocalStorageService();
export default Singleton;

export const setStoreItem = (k, v) => (k != null && v != null ? localStorage.setItem(k, v) : localStorage.removeItem(k));
