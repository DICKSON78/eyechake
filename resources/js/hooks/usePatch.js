import { useState } from "react";

const usePatch = (uri, payload = null) => {

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePatch = (newUri, newPayload = null) => {
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

    window.axios.patch("/" + uri, payload, { headers })
      .then((response) => {
        setData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        setError(error);
      });
  };

  return { data, loading, error, handlePatch };
};

export default usePatch;
