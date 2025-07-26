import React, { useState } from "react";
import { motion } from "framer-motion";
import { useSocket } from "./SocketContext";

const LumaChatbot: React.FC = () => {
  const [query, setQuery] = useState<string>("");
  const [lumaResponse, setLumaResponse] = useState<{
    response: string | {
      primaryDiagnosis: string;
      severity: string;
      recommendations: string[];
    };
    type: string;
  } | null>(null); // Can be symptom analysis or SRH response
  const [loading, setLoading] = useState<boolean>(false);
  const { socket } = useSocket();

  const handleAskLuma = async () => {
    setLoading(true);
    setLumaResponse(null);
    try {
      const token = localStorage.getItem("token");
      const patientId = localStorage.getItem("patientId");

      if (!token) {
        setLumaResponse({
          response: "Error: Not authenticated. Please log in.",
          type: "error",
        });
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${process.env.VITE_API_BASE_URL}/api/luma/query`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ query, patientId }), // Pass patientId to backend
        },
      );

      const data = await response.json();
      if (response.ok) {
        setLumaResponse(data);

        // If it's a symptom analysis and severity is high/critical, emit emergency alert
        if (
          data.type === "symptom" &&
          (data.response.severity === "high" ||
            data.response.severity === "critical")
        ) {
          if (socket) {
            socket.emit("emergency:alert", {
              patientId: patientId,
              location: "Unknown", // Placeholder, ideally fetched from user profile or GPS
              severity: data.response.severity,
              symptoms: query,
              diagnosis: data.response.primaryDiagnosis,
            });
            alert("Emergency alert sent to health workers!");
          }
        }
      } else {
        setLumaResponse({
          response: `Error: ${data.message || "Something went wrong."}`,
          type: "error",
        });
      }
    } catch (error) {
      setLumaResponse({
        response: `Network Error: ${error instanceof Error ? error.message : String(error)}`,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto"
    >
      <h1 className="text-3xl font-bold mb-8 text-text dark:text-dark-text text-center">
        Ask Luma
      </h1>
      <div className="bg-card dark:bg-dark-card p-8 rounded-lg shadow-md border border-border dark:border-dark-border">
        <div className="mb-6">
          <label
            htmlFor="query"
            className="block text-lg font-medium text-muted dark:text-dark-muted mb-2"
          >
            What do you want to ask Luma?
          </label>
          <textarea
            id="query"
            className="w-full p-3 rounded-md bg-input dark:bg-dark-input text-text dark:text-dark-text border border-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-primary"
            rows={6}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., What are the symptoms of malaria? or Tell me about contraception."
          ></textarea>
        </div>
        <button
          onClick={handleAskLuma}
          className="w-full bg-primary hover:bg-primary-700 text-primary-text font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50"
          disabled={loading || query.trim() === ""}
        >
          {loading ? "Thinking..." : "Ask Luma"}
        </button>

        {lumaResponse && (
          <div className="mt-8 p-6 bg-background dark:bg-dark-background rounded-lg border border-border dark:border-dark-border">
            <h3 className="text-xl font-semibold mb-2 text-text dark:text-dark-text">
              Luma's Response:
            </h3>
            {lumaResponse.type === "symptom" ? (
              <div>
                <p className="text-muted dark:text-dark-muted">
                  Primary Diagnosis: {lumaResponse.response.primaryDiagnosis}
                </p>
                <p className="text-muted dark:text-dark-muted">
                  Severity: {lumaResponse.response.severity}
                </p>
                <p className="text-muted dark:text-dark-muted">
                  Recommendations:{" "}
                  {lumaResponse.response.recommendations.join(", ")}
                </p>
              </div>
            ) : (
              <p className="text-muted dark:text-dark-muted">
                {lumaResponse.response}
              </p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default LumaChatbot;
