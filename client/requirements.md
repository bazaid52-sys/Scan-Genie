## Packages
html5-qrcode | Robust device camera management and QR/barcode scanning capabilities
date-fns | Formatting timestamps for the scan history
lucide-react | Premium iconography
clsx | Utility for constructing className strings conditionally
tailwind-merge | Utility to merge tailwind classes without style conflicts

## Notes
- `html5-qrcode` is used for both live camera feed scanning and image upload parsing.
- The torch (flashlight) feature relies on the `applyVideoConstraints` API and device support.
- Assumes authentication is handled via the existing `useAuth` hook and `/api/login` endpoint.
