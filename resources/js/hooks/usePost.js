import { useState } from "react";

const usePost = (uri, payload = null) => {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  const handlePost = (newUri, newPayload = null) => {
    if (typeof newUri === "string") {
      uri = newUri;
    }

    if (newPayload) {
      payload = newPayload;
    }

    setData(null);
    setLoading(true);
    setError(null);

    window.axios
      .post("/" + uri, payload)
      .then((response) => {
        setData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        setError(error);
      });
  };

  return { data, loading, error, handlePost, setData, setError };
};

export default usePost;
