import { addressToNameObject, validAddressRegex, validAbbreviatedAddressRegex, NameObject } from "onoma";

chrome.storage.sync.get(['enabled'], function (settings) {
  if (!settings.enabled) return;

  // Format helpers for consistent name display
  const formatFullName = (nameObject: NameObject) => 
    `${nameObject.firstName} ${nameObject.middleName.charAt(0).toUpperCase()}. ${nameObject.lastName}`;
  
  const formatAbbreviatedName = (nameObject: NameObject) => 
    `${nameObject.firstName} ${nameObject.lastName}`;

  /**
   * Attempts to find a full Ethereum address from an element's context
   * Checks for addresses in:
   * 1. data-* attributes that might contain addresses
   * 2. anchor href paths like /account/0x... or /address/0x...
   */
  const findFullAddress = (element: Element): string | null => {
    // First check all data attributes for a full address
    const dataAttrs = ['data-address', 'data-account', 'data-wallet'];
    for (const attr of dataAttrs) {
      const dataValue = element.getAttribute(attr);
      if (dataValue && validAddressRegex.test(dataValue)) {
        return dataValue;
      }
    }

    // Then check parent elements recursively up to 3 levels
    let current: Element | null = element;
    let depth = 0;
    while (current && depth < 3) {
      // Check data attributes on parent elements
      for (const attr of dataAttrs) {
        const dataValue = current.getAttribute(attr);
        if (dataValue && validAddressRegex.test(dataValue)) {
          return dataValue;
        }
      }

      // Check for anchor tags with address in href
      if (current.tagName === 'A') {
        const href = current.getAttribute('href');
        if (href) {
          // Match common patterns for Ethereum addresses in URLs
          const patterns = ['/account/', '/address/', '/0x'];
          for (const pattern of patterns) {
            if (href.includes(pattern)) {
              const lastPart = href.split(pattern).pop()?.split('/').shift();
              if (lastPart && validAddressRegex.test(lastPart)) {
                return lastPart;
              }
            }
          }
        }
      }

      current = current.parentElement;
      depth++;
    }

    return null;
  };

  /**
   * Process a single text node to replace Ethereum addresses with human-readable names
   * Handles both full and abbreviated addresses:
   * - Full: 0x1234567890123456789012345678901234567890
   * - Abbreviated: 0x1234...5678
   */
  const processNode = (node: Node) => {
    const nodeValue = node.nodeValue?.trim();
    if (!nodeValue?.includes('0x')) return;

    // Handle full addresses (0x + 40 hex chars)
    if (validAddressRegex.test(nodeValue)) {
      const nameObject = addressToNameObject(nodeValue);
      node.nodeValue = formatFullName(nameObject);
    }

    // Handle abbreviated addresses (0x1234...5678)
    else if (validAbbreviatedAddressRegex.test(nodeValue)) {
      const parentElement = node.parentElement;
      if (!parentElement) return;

      const fullAddress = findFullAddress(parentElement);
      const currentAbbrev = nodeValue.match(validAbbreviatedAddressRegex)?.[0];
      if (!currentAbbrev) return;

      if (fullAddress) {
        // If we found the full address in context, use it for better name generation
        const nameObject = addressToNameObject(fullAddress);
        const name = formatFullName(nameObject);
        node.nodeValue = nodeValue.replace(currentAbbrev, name);
      } else {
        // Otherwise, generate a name from the abbreviated address
        const nameObject = addressToNameObject(currentAbbrev, true);
        const name = formatAbbreviatedName(nameObject);
        node.nodeValue = nodeValue.replace(currentAbbrev, name);
      }
    } 

  };

  /**
   * Recursively process all text nodes within a root node
   * Uses TreeWalker for efficient DOM traversal
   */
  const processTextNodes = (root: Node) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      processNode(node);
    }
  };

  // Do initial processing of the page
  processTextNodes(document.body);

  // Set up observer for dynamic content changes
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          // Process new elements and their text nodes
          if (node.nodeType === Node.ELEMENT_NODE) {
            processTextNodes(node);
          } 
          // Process new text nodes directly
          else if (node.nodeType === Node.TEXT_NODE) {
            processNode(node);
          }
        });
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Listen for settings changes from the extension popup
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'ONOMA_TOGGLE_ENABLED') {
      // Re-process the entire page with new settings
      processTextNodes(document.body);
    }
  });
});
