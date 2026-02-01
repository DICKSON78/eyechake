import { useState } from "react";
import notificationEvents from "../utils/notificationEvents";

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

    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 25000); // 25 second timeout
    });

    // Normalize URI to avoid double slashes and protocol-relative URLs
    const normalizedUri = String(uri || "").replace(/^\/+/, "");

    // Race between the actual request and timeout
    Promise.race([
      window.axios.post("/" + normalizedUri, payload),
      timeoutPromise
    ])
      .then((response) => {
        setData(response.data);
        setLoading(false);
        
        // Trigger notification refresh for specific endpoints that affect notification counts
        const notificationEndpoints = [
          'api/patient-payment-cache-items/complete',
          'api/patient-payment-cache-items/dispense',
          'api/patient-payment-cache-items/make-cash-payment',
          'api/patient-payment-cache-items/create-bill',
          'api/consultations',
          'api/patient-check-ins',
          'api/patient-payment-cache',
          'api/patient-waiting-times',
          'api/patient-payments',
          'api/patient-item-payments',
          'api/patient-item-bills',
          'api/patient-item-bill-payments'
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

  return { data, loading, error, handlePost, setData, setError };
};

export default usePost;
