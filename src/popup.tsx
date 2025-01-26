import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

const Popup = () => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    chrome.storage.sync.get({ enabled: true }, (items) => {
      setEnabled(items.enabled);
    });
  }, []);

  const toggleExtension = () => {
    chrome.storage.sync.set({ enabled: !enabled }, () => {
      setEnabled(!enabled);
    });
  };

  return (
    <div style={{
      width: '300px',
      padding: '20px',
      backgroundColor: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '24px',
      }}>
        <h2 style={{
          margin: 0,
          fontSize: '20px',
          fontWeight: 600,
          color: '#1a1a1a',
        }}>
          Onoma Names
        </h2>
        <span style={{
          marginLeft: '8px',
          padding: '4px 8px',
          backgroundColor: '#f3f4f6',
          borderRadius: '12px',
          fontSize: '12px',
          color: '#6b7280',
        }}>
          v1.0
        </span>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        backgroundColor: '#f9fafb',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
      }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#374151',
          fontSize: '14px',
          fontWeight: 500,
          cursor: 'pointer',
        }}>
          <div style={{
            position: 'relative',
            width: '36px',
            height: '20px',
          }}>
            <input
              type="checkbox"
              checked={enabled}
              onChange={toggleExtension}
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer',
              }}
            />
            <div style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backgroundColor: enabled ? '#10b981' : '#e5e7eb',
              borderRadius: '20px',
              transition: 'background-color 0.2s',
            }} />
            <div style={{
              position: 'absolute',
              left: enabled ? '18px' : '2px',
              top: '2px',
              width: '16px',
              height: '16px',
              backgroundColor: '#ffffff',
              borderRadius: '50%',
              transition: 'left 0.2s',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
            }} />
          </div>
          Enable Address Replacement
        </label>
      </div>

      <p style={{
        margin: '16px 0 0',
        fontSize: '12px',
        color: '#6b7280',
        lineHeight: '1.5',
      }}>
        Refresh the page to see changes take effect
      </p>
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(<Popup />);
