'use client';

import { useState, useEffect } from 'react';
import {
  Query,
  onSnapshot,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/** Utility type to add an 'id' field to a given type T. */
type WithId<T> = T & { id: string };

/**
 * Interface for the return value of the useCollection hook.
 * @template T Type of the document data.
 */
export interface UseCollectionResult<T> {
  data: WithId<T>[] | null; // Array of document data with IDs, or null.
  isLoading: boolean;       // True if loading.
  error: FirestoreError | Error | null; // Error object, or null.
}

/**
 * React hook to subscribe to a Firestore collection in real-time.
 * Handles nullable queries.
 *
 * IMPORTANT! YOU MUST MEMOIZE the inputted query or you will cause infinite loops.
 * Use the useMemoFirebase helper for this.
 * e.g. const memoizedQuery = useMemoFirebase(() => query(....), [deps]);
 *
 *
 * @template T Optional type for document data. Defaults to any.
 * @param {Query<DocumentData> | null | undefined} memoizedQuery -
 * The Firestore Query. Waits if null/undefined. MUST BE MEMOIZED.
 * @returns {UseCollectionResult<T>} Object with data, isLoading, error.
 */
export function useCollection<T = any>(
  memoizedQuery: Query<DocumentData> | null | undefined,
): UseCollectionResult<T> {
  type StateDataType = WithId<T>[] | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  useEffect(() => {
    if (!memoizedQuery) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      memoizedQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const docs = snapshot.docs.map(doc => ({ ...(doc.data() as T), id: doc.id }));
        setData(docs);
        setError(null);
        setIsLoading(false);
      },
      (err: FirestoreError) => {
        let path = 'unknown_path';
        try {
          // This is a hacky way to get the path for error reporting.
          path = (memoizedQuery as any)._query.path.segments.join('/');
        } catch (e) {
          // Ignore if we can't get path.
        }

        const contextualError = new FirestorePermissionError({
          operation: 'list',
          path: path,
        });

        setError(contextualError);
        setData(null);
        setIsLoading(false);

        // trigger global error propagation
        errorEmitter.emit('permission-error', contextualError);
      }
    );

    return () => unsubscribe();
  }, [memoizedQuery]);

  return { data, isLoading, error };
}
