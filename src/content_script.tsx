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
   * Currently checks for addresses in anchor href paths like /account/0x...
   */
  const findFullAddress = (element: Element): string | null => {
    const anchorParent = element.closest('a');
    if (!anchorParent?.getAttribute('href')) return null;

    const href = anchorParent.getAttribute('href')!;
    if (!href.includes('/account/')) return null;

    const lastPart = href.split('/').pop();
    return validAddressRegex.test(lastPart!) ? lastPart! : null;
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

    // Handle abbreviated addresses (0x1234...5678)
    if (validAbbreviatedAddressRegex.test(nodeValue)) {
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
    // Handle full addresses (0x + 40 hex chars)
    else if (validAddressRegex.test(nodeValue)) {
      const nameObject = addressToNameObject(nodeValue);
      node.nodeValue = formatFullName(nameObject);
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

  // Start observing the entire document for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
});
