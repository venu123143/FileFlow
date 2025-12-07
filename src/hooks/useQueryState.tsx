import { useSearchParams } from "react-router-dom";
import { useCallback } from "react";

type Parser<T> = (value: string | null) => T;
type Serializer<T> = (value: T) => string;

/**
 * Reusable hook for managing query parameters in the URL.
 * 
 * @param key - The query parameter key
 * @param parser - Function to parse the string value from URL to your desired type
 * @param serializer - Function to serialize your value to a string for the URL
 * @returns A tuple of [value, setValue] similar to useState
 * 
 */
export function useQueryState<T>(key: string, parser: Parser<T>, serializer: Serializer<T>) {
    const [params, setParams] = useSearchParams();
    const value = parser(params.get(key));

    const setValue = useCallback((newValue: T) => {
        const newParams = new URLSearchParams(params);
        newParams.set(key, serializer(newValue));
        setParams(newParams, { replace: true }); // no history spam
    }, [key, serializer, params, setParams]);

    return [value, setValue] as const;
}

/**
 * Helper function to serialize values to JSON for query params
 */
// export const jsonSerializer = <T>(v: T) => JSON.stringify(v);

/**
 * Helper function to parse JSON from query params
 */
{/* export const jsonParser = <T>(v: string | null, defaultValue: T): T => v ? JSON.parse(v) : defaultValue; */ }
