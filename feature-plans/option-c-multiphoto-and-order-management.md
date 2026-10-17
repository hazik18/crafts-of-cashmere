# Feature Specification: Option C — Multi-Photo Gallery & Order Management (Admin Operations)

**Objective**: Elevate the Atelier Admin from a simple CRUD panel into a comprehensive operations dashboard. Equip artisans and staff with multi-photo gallery management (front, detail, macro, maker shots), full order fulfillment status tracking with courier tracking numbers, and CSV export capabilities for logistics and marketing.

---

## 1. Overview & Operational Requirements

### Current State
- Products only support a single image path (`item.img`) or a fallback SVG motif (`item.motif`).
- The admin order view (`#view-orders`) is a read-only historical list; staff cannot update order status, mark orders as shipped, or assign tracking numbers.
- Subscriber and order lists cannot be exported to CSV for courier shipping aggregators (e.g., Shiprocket, Delhivery) or newsletter campaigns.

### Target State
1. **Multi-Photo Product Gallery**:
   - Each product record can store an ordered array of images (`images: string[]`) alongside the primary thumbnail (`img`).
   - Admin editor drawer supports uploading multiple photos with drag-to-reorder and delete controls.
   - Storefront `ProductDetailModal.tsx` upgraded to a multi-image gallery with thumbnail navigation and zoom preview.
2. **Order Lifecycle & Fulfillment Management**:
   - Status transitions:
     - `PENDING` (Order created, waiting for payment/verification)
     - `PAID` (Payment verified or cash confirmed)
     - `CRAFTING` (On the loom or in the workshop)
     - `DISPATCHED` (Shipped with courier name and tracking code)
     - `DELIVERED` (Completed)
     - `CANCELLED` (Refunded or cancelled)
   - Order detail drawer in admin allowing staff to:
     - Change order status via dropdown.
     - Add courier name (e.g., Blue Dart, Shiprocket, DHL, Delhivery) and tracking URL/number.
     - Add internal atelier notes (e.g., "Gift packaging requested").
3. **Data Export Tools**:
   - One-click "Export Orders to CSV" (formatted for shipping aggregators).
   - One-click "Export Subscribers to CSV" (formatted for email marketing platforms).

---

## 2. Data Model Extensions

### Product Entity Update (`backend/src/types/index.ts`)
```typescript
export interface Product {
  id: string;
  cat: CraftCategory;
  name: string;
  maker: string;
  badge: string;
  price: number;
  img: string | null;            // Primary thumbnail
  gallery?: string[];            // Additional high-resolution detail photos
  alt: string;
  motif: MotifType | null;
  desc?: string;
  stock?: number;                // Available units (0 = Made on order)
  leadTimeWeeks?: number;        // e.g., 3 weeks for Kaani / Carpet
}
```

### Order Entity Update (`backend/src/types/index.ts`)
```typescript
export interface OrderFulfillment {
  courier?: string;              // e.g. "Shiprocket / Delhivery"
  trackingNumber?: string;       // e.g. "AWB-10928374"
  trackingUrl?: string;          // Direct tracking link
  shippedAt?: string;
  internalNotes?: string;
}

export interface Order {
  id: string;
  at: string;
  name: string;
  email: string;
  address: string;
  lines: OrderLineItem[];
  total: number;
  status: 'PENDING' | 'PAID' | 'CRAFTING' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED';
  paymentId?: string;
  fulfillment?: OrderFulfillment;
}
```

---

## 3. Backend Implementation Steps

### 3.1 Order Management Endpoints
- **`PUT /api/orders/:id/status`** *(Admin only)*:
  - Updates order status, courier info, tracking code, and internal notes.
  - Validates valid status enum transition.
- **`GET /api/orders/export/csv`** *(Admin only)*:
  - Generates and streams standard RFC 4180 CSV with columns:
    `Order ID, Date, Customer Name, Email, Address, Items, Total (INR), Status, Courier, Tracking Number`.
- **`GET /api/subscribers/export/csv`** *(Admin only)*:
  - Generates CSV: `Email, Joined Date`.

### 3.2 Multi-Photo Upload Endpoint
- **`POST /api/upload/batch`** *(Admin only)*:
  - Accepts multiple base64 image strings.
  - Validates size (<= 8MB each) and magic bytes for each.
  - Returns array of saved paths: `{ ok: true, paths: string[] }`.

---

## 4. Frontend Implementation Steps

### 4.1 Admin Multi-Photo Upload UI (`frontend/src/pages/AdminPage.tsx`)
- In `ProductEditorDrawer`:
  - Replace single preview with a **Photo Gallery Strip**:
    - Primary cover photo highlighted with "Cover" badge.
    - Mini thumbnails for additional angles (texture, reverse side, loom shot).
    - "Add photos" button supporting multi-file selection.
    - Delete button (`✕`) on individual photos.
- Update form submission to send `gallery: string[]`.

### 4.2 Admin Order Fulfillment Controls (`frontend/src/pages/AdminPage.tsx`)
- Enhance the Orders table:
  - Add color-coded status badges:
    - `PENDING`: Muted taupe
    - `PAID`: Forest green
    - `CRAFTING`: Gold / Saffron
    - `DISPATCHED`: Slate lake blue
    - `CANCELLED`: Terracotta red
  - Clicking an order row opens an **Order Detail & Dispatch Drawer**:
    - Full customer delivery details and phone number.
    - Ordered items breakdown with photos.
    - Status change dropdown.
    - Courier selector + Tracking number input field.
    - "Save Fulfillment" button sending `PUT /api/orders/:id/status`.

### 4.3 Storefront Product Detail Gallery (`frontend/src/features/products/ProductDetailModal.tsx`)
- When a product has `gallery` photos:
  - Display primary large image container.
  - Underneath, display a horizontal row of clickable thumbnail previews.
  - Clicking a thumbnail seamlessly switches the featured view with smooth crossfade.
  - Displays stock badge:
    - If `stock === 1`: "1 of 1 — Single Piece Heirloom"
    - If `stock === 0`: "Woven to Order — {leadTimeWeeks || 3} Weeks"

### 4.4 Data Export Buttons
- In the top action bar of the Orders and Letters views:
  ```tsx
  <button className="btn-ghost" onClick={handleExportCSV}>
    Export CSV ⤓
  </button>
  ```
  Triggers immediate browser download of the generated CSV file.

---

## 5. Acceptance Criteria & Testing Checklist

- [ ] Admin can upload 1 to 5 photos per product; images display in editor preview strip.
- [ ] Product detail modal on storefront renders thumbnail gallery allowing patrons to view multiple angles.
- [ ] Admin can update order status from `PENDING` -> `PAID` -> `DISPATCHED`.
- [ ] Assigning courier and tracking code persists to `orders.json` and displays in order view.
- [ ] "Export CSV" generates a valid CSV file that opens cleanly in Excel / Google Sheets with proper headers and UTF-8 encoding.
- [ ] Inventory lead time indicator ("Woven to Order") renders accurately when `stock === 0`.
