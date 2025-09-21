export type InitialState = Record<string, any>;
export type State = Map<string, any>;
export type ReadOnlyState = ReadonlyMap<string, any>;
export type SubscribeCallback = (state: ReadOnlyState) => void;
export type UnsubscribeCallback = () => void;

export class AppState {
  private static isInit: boolean = false;
  private static state: State;
  private static subscribers: Map<string, Set<SubscribeCallback>>;
  private static generalSubscriber: SubscribeCallback | undefined = undefined;

  static get(): ReadOnlyState {
    return AppState.state;
  }

  static initialize(
    initialState: InitialState,
    generalSubscribeCallback?: SubscribeCallback,
  ): void {
    if (!AppState.isInit) {
      AppState.state = new Map<string, any>(Object.entries(initialState));
      AppState.subscribers = new Map<string, Set<SubscribeCallback>>();
      AppState.isInit = true;
    }

    if (generalSubscribeCallback) {
      AppState.generalSubscriber = generalSubscribeCallback;
    }
  }

  static set(key: string, value: any): void {
    if (!AppState.isInit) {
      throw new Error('AppState is not initialized');
    }

    if (!key) {
      throw new Error('key undefined');
    }

    if (!value) {
      throw new Error('value undefined');
    }

    AppState.state.set(key, value);

    const callbacks = AppState.subscribers.get(key);

    if (callbacks) {
      for (const cb of callbacks) {
        cb(AppState.state);
      }
    }

    if (AppState.generalSubscriber) {
      AppState.generalSubscriber(AppState.state);
    }
  }

  static subscribe(key: string, subscribeCallback: SubscribeCallback): UnsubscribeCallback {
    if (!key) {
      throw new Error('key undefined');
    }

    if (!subscribeCallback) {
      throw new Error('subscribeCallback undefined');
    }

    let set = AppState.subscribers.get(key);

    if (!set) {
      set = new Set<SubscribeCallback>();
      AppState.subscribers.set(key, set);
    }

    set.add(subscribeCallback);

    return () => {
      set.delete(subscribeCallback);

      if (set.size === 0) {
        AppState.subscribers.delete(key);
      }
    }
  }
}
