import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

const Options = () => {
  const [displayFormat, setDisplayFormat] = useState<string>("full");

  useEffect(() => {
    chrome.storage.sync.get({ displayFormat: "full" }, (items) =>
      setDisplayFormat(items.displayFormat)
    );
  }, []);

  const saveOptions = () => {
    chrome.storage.sync.set({ displayFormat }, () => {
      alert("Options saved!");
    });
  };

  return (
    <div>
      <h2>Name Display Options</h2>
      <label>
        <input
          type="radio"
          value="full"
          checked={displayFormat === "full"}
          onChange={(e) => setDisplayFormat(e.target.value)}
        />
        Full Name (First Middle Last)
      </label>
      <br />
      <label>
        <input
          type="radio"
          value="initials"
          checked={displayFormat === "initials"}
          onChange={(e) => setDisplayFormat(e.target.value)}
        />
        Initials Only (F.M.L.)
      </label>
      <br />
      <button onClick={saveOptions}>Save</button>
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(<Options />);
