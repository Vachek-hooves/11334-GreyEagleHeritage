import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
export type RequestItem = {
  id: string;
  service: string;
  room: string;
  time: string;
  comment: string;
  created: string;
  status: 'Saved locally' | 'Cancelled';
};
export type EventItem = {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  notes: string;
};
export type Message = { id: string; text: string; role: 'user' | 'assistant' };
type State = {
  onboarded: boolean;
  room: string;
  requests: RequestItem[];
  events: EventItem[];
  messages: Message[];
};
const initial: State = {
  onboarded: false,
  room: '',
  requests: [],
  events: [],
  messages: [],
};
const Context = createContext<{
  state: State;
  ready: boolean;
  save: (patch: Partial<State>) => Promise<boolean>;
}>({ state: initial, ready: false, save: async () => false });
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(initial);
  const [ready, setReady] = useState(false);
  const current = useRef(initial);
  const queue = useRef(Promise.resolve(true));
  useEffect(() => {
    AsyncStorage.getItem('grey-eagle-v1')
      .then(value => {
        if (value) {
          const data = JSON.parse(value);
          const restored: State = {
            ...initial,
            onboarded: data.onboarded === true,
            room: typeof data.room === 'string' ? data.room : '',
            requests: Array.isArray(data.requests) ? data.requests : [],
            events: Array.isArray(data.events) ? data.events : [],
            messages: Array.isArray(data.messages) ? data.messages : [],
          };
          current.current = restored;
          setState(restored);
        }
      })
      .catch(() =>
        Alert.alert(
          'Storage unavailable',
          'Your saved information could not be loaded.',
        ),
      )
      .finally(() => setReady(true));
  }, []);
  function save(patch: Partial<State>) {
    const operation = queue.current.then(async () => {
      const next = { ...current.current, ...patch };
      try {
        await AsyncStorage.setItem('grey-eagle-v1', JSON.stringify(next));
        current.current = next;
        setState(next);
        return true;
      } catch {
        Alert.alert(
          'Could not save',
          'Please try again. Your changes have not been saved.',
        );
        return false;
      }
    });
    queue.current = operation;
    return operation;
  }
  return (
    <Context.Provider value={{ state, ready, save }}>
      {children}
    </Context.Provider>
  );
}
export const useStore = () => useContext(Context);
