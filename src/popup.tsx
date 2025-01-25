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
      // Send message to all tabs to update content
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          if (tab.id) {
            chrome.tabs.sendMessage(tab.id, { type: 'ONOMA_TOGGLE_ENABLED' });
          }
        });
      });
    });
  };

  return (
    <div>
      <h2>Extension Settings 8</h2>
      <label>
        <input
          type="checkbox"
          checked={enabled}
          onChange={toggleExtension}
        />
        Enable Address Replacement
      </label>
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(<Popup />);
