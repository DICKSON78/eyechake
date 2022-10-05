import { useState } from "react";

const usePost = (uri, payload = null) => {

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePost = (newUri, newPayload = null) => {
    if (typeof newUri === "string") {
      uri = newUri;
    }

    if (newPayload) {
      payload = newPayload;
    }

    setError(null);
    setLoading(true);

    const headers = {
      "Authorization": `Bearer ${window.localStorage.getItem("api_token")}`
    };

    window.axios.post("/" + uri, payload, { headers })
      .then((response) => {
        setData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        setError(error);
      });
  };

  return { data, loading, error, handlePost };
};

export default usePost;
