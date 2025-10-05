# Dynamic QR Code Implementation

## Overview

The CampusBuzz application now features a comprehensive dynamic QR code system that generates QR codes on-the-fly instead of using static images. This implementation provides better security, flexibility, and storage efficiency.

## 🔧 Implementation Details

### 1. Dynamic QR Code Generation API
**File**: `src/pages/api/qrcode/[ticketId].ts`

- **Purpose**: Generates QR codes on-demand for specific tickets
- **Method**: GET `/api/qrcode/{ticketId}`
- **Authentication**: Required (user must own ticket or be admin)
- **Output**: SVG format for scalability
- **Security**: Includes verification tokens for authenticity

**Features**:
- Real-time QR generation
- High error correction level
- Caching headers (1 hour cache)
- Comprehensive ticket data inclusion
- Security token verification

### 2. QR Code React Component
**File**: `src/components/QRCodeComponent.tsx`

- **Purpose**: Client-side QR code generation
- **Props**: Customizable data, size, colors, error correction
- **Formats**: Canvas or SVG rendering
- **Features**: Loading states, error handling, responsive design

**Usage Example**:
```tsx
<QRCodeComponent 
  data={{
    ticketId: "123456",
    eventName: "Tech Conference",
    userName: "John Doe"
  }}
  size={200}
  level="H"
/>
```

### 3. QR Verification API
**File**: `src/pages/api/verify-qr.ts`

- **Purpose**: Verify QR code authenticity and ticket validity
- **Method**: POST `/api/verify-qr`
- **Authentication**: Required (admin access)
- **Input**: QR data (JSON string or object)
- **Output**: Comprehensive verification result

**Verification Process**:
1. Parse QR data
2. Validate ticket exists in database
3. Cross-reference with event details
4. Check verification token
5. Return detailed verification result

### 4. QR Scanner Component
**File**: `src/components/QRScanner.tsx`

- **Purpose**: Admin interface for ticket verification
- **Features**: Manual input, real-time verification, detailed results
- **Integration**: Used in admin verification pages
- **Future**: Ready for camera-based QR scanning integration

## 📊 Data Structure

### QR Code Data Format
```json
{
  "ticketId": "string",
  "eventId": "string", 
  "eventName": "string",
  "userName": "string",
  "userEmail": "string",
  "eventDate": "ISO date",
  "eventTime": "string",
  "eventLocation": "string",
  "price": "number|string",
  "purchaseDate": "ISO date",
  "verified": true,
  "timestamp": "ISO date",
  "verificationToken": "security hash"
}
```

### Database Schema Updates
**File**: `src/models/Ticket.ts`

Added `qrData` field to ticketDetails:
```typescript
ticketDetails: {
  // ... existing fields
  qr: { type: String, required: false }, // Dynamic QR URL
  qrData: { type: String, required: false }, // Stored QR data
}
```

## 🔐 Security Features

### 1. Verification Tokens
- Generated using HMAC-SHA256
- Includes ticket ID, user ID, and event ID
- Time-based component for freshness
- Prevents QR code forgery

### 2. Authentication
- All QR endpoints require JWT authentication
- Ticket ownership validation
- Admin-only verification access
- Token-based security

### 3. Data Integrity
- Cross-reference with database
- Validate all ticket parameters
- Check event existence
- Verify user permissions

## 🚀 Usage Examples

### 1. Ticket Display
```tsx
// Automatic dynamic QR display
<img 
  src={`/api/qrcode/${ticketId}`}
  alt="Ticket QR Code"
  className="w-48 h-48"
/>

// Or using the component
<QRCodeComponent 
  data={ticketData}
  size={192}
  level="H"
/>
```

### 2. Admin Verification
```tsx
// QR Scanner integration
<QRScanner 
  onVerificationComplete={(result) => {
    console.log('Verification result:', result);
  }}
/>
```

### 3. Manual Verification
```javascript
// API call for verification
const response = await fetch('/api/verify-qr', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ qrData: scannedData })
});

const result = await response.json();
```

## 🎯 Benefits

### 1. Storage Efficiency
- No static QR image files
- Reduced server storage requirements
- Dynamic generation only when needed

### 2. Security Enhancement
- Real-time verification tokens
- Cannot be easily forged or replicated
- Database validation on every scan

### 3. Flexibility
- Easy to update QR data format
- Customizable appearance
- Multiple rendering options (SVG/Canvas)

### 4. Scalability
- No file system limitations
- Cacheable responses
- Load balancer friendly

## 📱 Integration Points

### 1. Ticket Booking
- **Files**: `src/pages/api/book-ticket.ts`, `src/pages/api/orders/book-ticket.ts`
- **Changes**: Store QR data instead of generating files
- **Benefit**: Instant ticket generation

### 2. Ticket Display
- **Files**: `src/pages/ticket/[id].tsx`
- **Changes**: Dynamic QR rendering
- **Benefit**: Always up-to-date QR codes

### 3. Admin Verification
- **Files**: `src/pages/admin/verify-tickets.tsx`
- **Changes**: Integrated QR scanner
- **Benefit**: Real-time ticket validation

## 🔧 Configuration

### Environment Variables
```bash
JWT_SECRET=your_jwt_secret_for_verification_tokens
```

### QR Code Settings
```typescript
// Customizable in components
errorCorrectionLevel: 'H' // High error correction
margin: 2                 // Border margin
width: 400               // Pixel width
color: {
  dark: '#1f2937',       // QR code color
  light: '#ffffff'       // Background color
}
```

## 🚧 Future Enhancements

### 1. Camera Integration
- Real QR code scanning with device camera
- Libraries: `react-qr-reader`, `qr-scanner`
- Mobile-optimized interface

### 2. Offline Support
- Service worker for QR generation
- Cached verification data
- Progressive Web App features

### 3. Advanced Analytics
- QR scan tracking
- Verification statistics
- Real-time attendance monitoring

### 4. Batch Verification
- Multiple QR codes at once
- Event check-in optimization
- Bulk operations interface

## ✅ Testing

### 1. QR Generation Test
```bash
curl -H "Authorization: Bearer YOUR_JWT" \
     http://localhost:3000/api/qrcode/TICKET_ID
```

### 2. Verification Test
```bash
curl -X POST \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_JWT" \
     -d '{"qrData": "QR_JSON_DATA"}' \
     http://localhost:3000/api/verify-qr
```

## 📋 Maintenance

### 1. Monitor Performance
- QR generation response times
- Database query optimization
- Cache hit rates

### 2. Security Updates
- Regular token algorithm updates
- JWT secret rotation
- Vulnerability assessments

### 3. Data Cleanup
- Remove old verification logs
- Archive expired tickets
- Database optimization

This implementation provides a robust, secure, and scalable QR code system that enhances the ticket management experience while maintaining high security standards.