import { useState } from "react";
import notificationEvents from "../utils/notificationEvents";

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

    // Normalize URI to avoid double slashes
    const normalizedUri = String(uri || "").replace(/^\/+/, "");
    
    // Use axios with its built-in timeout instead of race condition
    // Use PATCH method for updates (Laravel routes expect PATCH)
    window.axios.patch("/" + normalizedUri, payload, {
      timeout: 45000 // 45 seconds timeout for complex operations
    })
      .then((response) => {
        setData(response.data);
        setLoading(false);
        
        // Trigger notification refresh for specific endpoints that affect notification counts
        const notificationEndpoints = [
          'api/consultations',
          'api/patient-payment-cache-items',
          'api/patient-check-ins',
          'api/patient-payment-cache',
          'api/patient-waiting-times',
        ];

        if (notificationEndpoints.some(endpoint => normalizedUri.includes(endpoint))) {
          console.log('Triggering notification refresh for endpoint:', normalizedUri);
          // Use multiple attempts with increasing delays to ensure backend has processed
          const triggerNotifications = () => {
            notificationEvents.refresh();
          };

          // Immediate trigger
          setTimeout(triggerNotifications, 200);
          // Follow-up trigger in case backend is slow
          setTimeout(triggerNotifications, 1000);
          // Final trigger to ensure consistency
          setTimeout(triggerNotifications, 3000);
        }
      })
      .catch((error) => {
        setLoading(false);
        setError(error);
        console.error('API Error:', error.message);
      });
  };

  return { data, loading, error, handlePatch, setData, setError };
};

export default usePatch;
