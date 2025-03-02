import { useState, useEffect } from 'react';

/**
 * Custom hook for safely using localStorage in Next.js
 * Prevents SSR issues by only accessing localStorage on the client side
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  // Flag to track if we're on the client side
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true when component mounts (client-side only)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize on client-side only
  useEffect(() => {
    if (!isClient) return;

    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      if (item) {
        try {
          const parsedItem = JSON.parse(item);
          setStoredValue(parsedItem);
        } catch (parseError) {
          console.error('Error parsing localStorage item:', parseError);
          setStoredValue(initialValue);
        }
      }
    } catch (error) {
      // If error also return initialValue
      console.error('Error reading from localStorage:', error);
      setStoredValue(initialValue);
    }
  }, [key, initialValue, isClient]);

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = (value: T) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        console.log(`Saved to localStorage: ${key} =`, valueToStore);
      }
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.error('Error writing to localStorage:', error);
    }
  };

  return [storedValue, setValue];
}
