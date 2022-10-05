import { useCallback, useEffect, useRef, useState } from "react";

const useFetch = (uri, params = null, fetchOnMount = true, initialData = null, callback = null) => {

  const ignore = useRef(false);
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const queryString = JSON.stringify(params || {});

  const handleFetch = useCallback(() => {
    setError(null);
    setLoading(true);

    const headers = {
      "Authorization": `Bearer ${window.localStorage.getItem("api_token")}`
    };

    window.axios.get("/" + uri, { params, headers })
      .then((response) => {
        if (!ignore.current) {
          setData(callback ? callback(response) : response.data);
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

  return { data, loading, error, handleFetch };
};

export default useFetch;
