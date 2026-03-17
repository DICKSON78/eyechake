import { useCallback, useEffect, useRef, useState } from "react";

const useFetch = (
  uri,
  params = null,
  fetchOnMount = true,
  initialData = null,
  callback = null
) => {
  const ignore = useRef(false);
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  const queryString = JSON.stringify(params || {});

  const handleFetch = useCallback(() => {
    setLoading(true);
    setError(null);

    const normalizedUri = String(uri || "").replace(/^\/+/, "");
    const fetchParams = params ? JSON.parse(queryString) : null;
    window.axios
      .get("/" + normalizedUri, { params: fetchParams })
      .then((response) => {
        console.log('useFetch - Raw response:', response);
        console.log('useFetch - Response data:', response?.data);
        console.log('useFetch - Response data data:', response?.data?.data);
        
        if (!ignore.current) {
          try {
            const result = callback ? callback(response) : response?.data;
            console.log('useFetch - Callback result:', result);
            setData(result !== undefined && result !== null ? result : initialData);
          } catch (e) {
            setError(e);
          }
          setLoading(false);
        }
      })
      .catch((error) => {
        if (!ignore.current) {
          setLoading(false);
          setError(error);
        }
      });
  }, [uri, queryString]);

  useEffect(() => {
    ignore.current = false;
    if (fetchOnMount) {
      handleFetch();
    }

    return () => {
      ignore.current = true;
    };
  }, [handleFetch]);

  return { data, loading, error, handleFetch, setData, setError };
};

export default useFetch;
