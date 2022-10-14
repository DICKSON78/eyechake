import { useState } from "react";

const usePatch = (uri, payload = null) => {

  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  const handlePatch = (newUri, newPayload = null) => {
    if (typeof newUri === "string") {
      uri = newUri;
    }

    if (newPayload) {
      payload = newPayload;
    }

    setData(null);
    setLoading(true);
    setError(null);

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

  return { data, loading, error, handlePatch, setData, setError };
};

export default usePatch;
