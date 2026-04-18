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

  static getStore(): ITenantStore {
    return this.storage.getStore() || { 
      schoolId: 'd4c837bd-ea38-42ca-a99f-ffddf2e148a8', 
      userId: 'd4c837bd-ea38-42ca-a99f-ffddf2e148a8' 
    };
  }
}
