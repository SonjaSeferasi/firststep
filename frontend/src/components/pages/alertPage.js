import React, { useState } from "react";

const AlertPage = () => {
  const [showAlert, setShowAlert] = useState(true);

  const handleClose = () => {
    setShowAlert(false);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🚨 Alert Page</h1>

      {showAlert ? (
        <div style={styles.alertBox}>
          <p style={styles.message}>
            ⚠️ This is an important alert! Please take action.
          </p>
          <button onClick={handleClose} style={styles.button}>
            Dismiss
          </button>
        </div>
      ) : (
        <p style={styles.closed}>✅ No active alerts</p>
      )}
    </div>
  );
};

const styles = {
  container: {
    textAlign: "center",
    padding: "40px",
    fontFamily: "Arial",
  },
  title: {
    color: "#d9534f",
  },
  alertBox: {
    marginTop: "20px",
    padding: "20px",
    backgroundColor: "#f8d7da",
    border: "1px solid #f5c6cb",
    borderRadius: "10px",
    display: "inline-block",
  },
  message: {
    marginBottom: "10px",
    fontSize: "18px",
  },
  button: {
    padding: "8px 15px",
    backgroundColor: "#d9534f",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  closed: {
    marginTop: "20px",
    color: "green",
    fontSize: "18px",
  },
};

export default AlertPage;