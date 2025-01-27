import { validAddressRegex } from "onoma";

/**
 * Attempts to find a full Ethereum address from an element's context
 * Checks for addresses in:
 * 1. title attribute
 * 2. data-* attributes that might contain addresses
 * 3. anchor href paths like /account/0x... or /address/0x...
 */
export const findFullAddress = (element: Element): string | null => {
  // Check title attribute first
  const title = element.getAttribute("title");
  if (title && validAddressRegex.test(title)) {
    return title;
  }

  // Check all data-* attributes for a full address
  for (const attr of element.getAttributeNames()) {
    if (attr.startsWith("data-")) {
      const dataValue = element.getAttribute(attr);
      if (dataValue && validAddressRegex.test(dataValue)) {
        return dataValue;
      }
    }
  }

  // Then check parent elements recursively up to 3 levels
  let current: Element | null = element;
  let depth = 0;
  while (current && depth < 3) {
    // Check title attribute on parent
    const parentTitle = current.getAttribute("title");
    if (parentTitle && validAddressRegex.test(parentTitle)) {
      return parentTitle;
    }

    // Check href if it's an anchor
    if (current instanceof HTMLAnchorElement && current.href) {
      const matches = current.href.match(/(0x[a-fA-F0-9]{40})/);
      if (matches) {
        return matches[1];
      }
    }

    current = current.parentElement;
    depth++;
  }

  return null;
};
