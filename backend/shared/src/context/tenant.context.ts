import { AsyncLocalStorage } from 'async_hooks';

export interface ITenantStore {
  schoolId: string;
  userId: string;
}

export class TenantContext {
  private static storage = new AsyncLocalStorage<ITenantStore>();

  static run(store: ITenantStore, callback: () => void) {
    this.storage.run(store, callback);
  }

  static getStore(): ITenantStore | null {
    return this.storage.getStore() || null;
  }
}
