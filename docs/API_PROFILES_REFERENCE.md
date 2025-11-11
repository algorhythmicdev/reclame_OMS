# Profile API Reference

Complete reference for the Profile API endpoints.

## Base URL

All endpoints are relative to: `/api/profiles`

---

## Endpoints

### 1. List Profile Templates

**Endpoint:** `GET /api/profiles/templates`

**Description:** Retrieve a list of all available profile templates.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `active` | boolean | `true` | Filter by active status. Set to `false` to include inactive templates. |

**Example Request:**

```bash
curl -X GET "https://your-domain.com/api/profiles/templates?active=true"
```

**Success Response (200 OK):**

```json
{
  "items": [
    {
      "id": 1,
      "code": "P7st",
      "name": "Profile 7st - Super Pro",
      "description": "Complete outdoor/indoor sign with full manufacturing workflow",
      "version": 1,
      "is_active": true,
      "metadata": {
        "icon": "award",
        "complexity": "complex",
        "typical_timeline": "8-10 days",
        "color": "#E91E63"
      },
      "created_at": "2025-11-11T10:00:00Z",
      "updated_at": "2025-11-11T10:00:00Z"
    },
    {
      "id": 2,
      "code": "P5",
      "name": "Profile 5 - SignTrim",
      "description": "SignTrim channel letters with specialized trim and LED options",
      "version": 1,
      "is_active": true,
      "metadata": {
        "icon": "award",
        "complexity": "complex",
        "typical_timeline": "8-10 days",
        "color": "#9333EA"
      },
      "created_at": "2025-11-11T10:00:00Z",
      "updated_at": "2025-11-11T10:00:00Z"
    }
  ],
  "total": 2
}
```

**Error Response (500):**

```json
{
  "message": "Failed to fetch profile templates"
}
```

---

### 2. Validate Profile Configuration

**Endpoint:** `POST /api/profiles/validate`

**Description:** Validate a profile configuration against its template rules.

**Request Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "profileCode": "P7st",
  "configuration": {
    "CNC_FREZER": {
      "face_material": {
        "materialType": "ACRYLIC",
        "materialId": 142,
        "materialCode": "PLEXIGLAS_XT_WN071",
        "materialName": "PLEXIGLAS® XT White Opal",
        "thickness": 3
      },
      "back_material": {
        "materialType": "ALUMINUM",
        "materialCode": "ALU",
        "thickness": 1.5
      }
    },
    "PAINTING": {
      "sides_color": "3020",
      "back_color": "9005"
    },
    "DELIVERY": {
      "delivery_date": "2025-10-27"
    }
  }
}
```

**Example Request:**

```bash
curl -X POST "https://your-domain.com/api/profiles/validate" \
  -H "Content-Type: application/json" \
  -d '{
    "profileCode": "P7st",
    "configuration": {
      "CNC_FREZER": {
        "face_material": {
          "materialType": "ACRYLIC",
          "materialCode": "WN071",
          "thickness": 3
        }
      }
    }
  }'
```

**Success Response (200 OK) - Valid:**

```json
{
  "valid": true,
  "errors": []
}
```

**Success Response (200 OK) - Invalid:**

```json
{
  "valid": false,
  "errors": [
    {
      "section": "CNC_FREZER",
      "field": "back_material",
      "message": "back_material is required"
    },
    {
      "section": "PAINTING",
      "field": "sides_color",
      "message": "Invalid RAL code format (should be 4 digits)"
    },
    {
      "section": "DELIVERY",
      "field": "delivery_date",
      "message": "delivery_date is required"
    }
  ]
}
```

**Error Responses:**

**400 Bad Request:**
```json
{
  "message": "Missing profileCode or configuration"
}
```

**404 Not Found:**
```json
{
  "message": "Template not found"
}
```

**500 Internal Server Error:**
```json
{
  "message": "Validation failed"
}
```

---

## Validation Rules

### Field Type Validation

The validation endpoint checks field values against their defined types:

#### Number Fields

```typescript
{
  "depth": 60  // Must be numeric
}
```

**Validation:**
- Must be a valid number
- Respects `min` and `max` from field config
- Must match `step` if defined

**Error Example:**
```json
{
  "section": "BENDER",
  "field": "depth",
  "message": "Must be at least 30"
}
```

#### Date Fields

```typescript
{
  "delivery_date": "2025-10-27"
}
```

**Validation:**
- Must be valid ISO 8601 date format
- Can check against `minDate` and `maxDate`

**Error Example:**
```json
{
  "section": "DELIVERY",
  "field": "delivery_date",
  "message": "Invalid date format"
}
```

#### Material Fields

```typescript
{
  "face_material": {
    "materialType": "ACRYLIC",
    "materialId": 142,
    "materialCode": "PLEXIGLAS_XT_WN071",
    "thickness": 3
  }
}
```

**Validation:**
- Must have `materialCode` or `materialId`
- Thickness must be numeric (if provided)
- MaterialType must match allowed types

**Error Example:**
```json
{
  "section": "CNC_FREZER",
  "field": "face_material",
  "message": "Material not properly selected"
}
```

#### Color RAL Fields

```typescript
{
  "sides_color": "3020"
}
```

**Validation:**
- Must be 4-digit RAL code
- Format: `^\d{4}$`

**Error Example:**
```json
{
  "section": "PAINTING",
  "field": "sides_color",
  "message": "Invalid RAL code format (should be 4 digits)"
}
```

### Conditional Logic

Fields can be conditionally required based on other field values:

```typescript
{
  "conditional_logic": [
    {
      "field_key": "ASSEMBLING.waterholes",
      "operator": "equals",
      "value": true
    }
  ]
}
```

**Operators:**
- `equals` - Field value must equal specified value
- `not_equals` - Field value must not equal specified value
- `contains` - Array field must contain specified value
- `greater_than` - Numeric field must be greater than value
- `less_than` - Numeric field must be less than value

### Custom Validation Rules

Fields can have custom validation rules:

```typescript
{
  "validation_rules": [
    {
      "type": "pattern",
      "value": "^\\d+(\\.\\d+)?m$",
      "message": "Must be in format: 43m or 2.5m"
    },
    {
      "type": "min_length",
      "value": 3,
      "message": "Minimum length is 3 characters"
    },
    {
      "type": "max_length",
      "value": 50,
      "message": "Maximum length is 50 characters"
    }
  ]
}
```

**Rule Types:**
- `pattern` - Regular expression pattern matching
- `min_length` - Minimum string length
- `max_length` - Maximum string length
- `min` - Minimum numeric value
- `max` - Maximum numeric value

---

## Integration Examples

### React/Svelte Integration

```typescript
async function validateProfileForm(profileCode: string, configuration: any) {
  try {
    const response = await fetch('/api/profiles/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        profileCode,
        configuration
      })
    });

    if (!response.ok) {
      throw new Error('Validation request failed');
    }

    const result = await response.json();
    
    if (!result.valid) {
      // Display errors to user
      result.errors.forEach(error => {
        console.error(`${error.section}.${error.field}: ${error.message}`);
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error('Validation error:', error);
    return false;
  }
}
```

### Complete Order Submission Flow

```typescript
async function submitOrder(orderData: any) {
  // 1. Load available profiles
  const templatesResponse = await fetch('/api/profiles/templates');
  const { items: profiles } = await templatesResponse.json();
  
  // 2. User selects profile
  const selectedProfile = profiles.find(p => p.code === 'P7st');
  
  // 3. User fills out form
  const configuration = {
    CNC_FREZER: { /* ... */ },
    PAINTING: { /* ... */ },
    DELIVERY: { /* ... */ }
  };
  
  // 4. Validate configuration
  const validationResponse = await fetch('/api/profiles/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      profileCode: selectedProfile.code,
      configuration
    })
  });
  
  const { valid, errors } = await validationResponse.json();
  
  if (!valid) {
    // Show errors to user
    showValidationErrors(errors);
    return;
  }
  
  // 5. Save order
  const orderResponse = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      profileCode: selectedProfile.code,
      configuration,
      ...orderData
    })
  });
  
  if (orderResponse.ok) {
    // Generate PDF
    await generatePDF(orderResponse.json());
  }
}
```

---

## Error Handling

### Common Errors and Solutions

#### Template Not Found

**Error:**
```json
{
  "message": "Template not found"
}
```

**Solution:**
- Verify the profile code is correct
- Check that the template exists in the database
- Ensure the profile is active (if filtering by `active=true`)

#### Missing Required Fields

**Error:**
```json
{
  "valid": false,
  "errors": [
    {
      "section": "CNC_FREZER",
      "field": "face_material",
      "message": "face_material is required"
    }
  ]
}
```

**Solution:**
- Ensure all required fields are filled
- Check conditional logic - field might be required based on other values
- Verify field keys match template exactly

#### Invalid Data Types

**Error:**
```json
{
  "valid": false,
  "errors": [
    {
      "section": "BENDER",
      "field": "depth",
      "message": "Must be a number"
    }
  ]
}
```

**Solution:**
- Convert string inputs to appropriate types
- Use `Number()` for numeric fields
- Use proper date formatting for date fields

---

## Testing

### Example Test Suite

```typescript
describe('Profile API', () => {
  describe('GET /api/profiles/templates', () => {
    it('returns list of active templates', async () => {
      const response = await fetch('/api/profiles/templates');
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('items');
      expect(data).toHaveProperty('total');
      expect(Array.isArray(data.items)).toBe(true);
    });
    
    it('includes inactive templates when active=false', async () => {
      const response = await fetch('/api/profiles/templates?active=false');
      const data = await response.json();
      
      const hasInactive = data.items.some(t => !t.is_active);
      expect(hasInactive).toBe(true);
    });
  });
  
  describe('POST /api/profiles/validate', () => {
    it('validates correct configuration', async () => {
      const response = await fetch('/api/profiles/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileCode: 'P7st',
          configuration: {
            CNC_FREZER: {
              face_material: {
                materialType: 'ACRYLIC',
                materialCode: 'WN071',
                thickness: 3
              }
            }
          }
        })
      });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.valid).toBe(true);
    });
    
    it('returns errors for missing required fields', async () => {
      const response = await fetch('/api/profiles/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileCode: 'P7st',
          configuration: {}
        })
      });
      
      const data = await response.json();
      expect(data.valid).toBe(false);
      expect(data.errors.length).toBeGreaterThan(0);
    });
  });
});
```

---

## Rate Limiting

Currently, there are no rate limits on these endpoints. Consider implementing rate limiting for production:

```typescript
// Suggested rate limits:
// - GET /api/profiles/templates: 100 requests/minute
// - POST /api/profiles/validate: 50 requests/minute
```

---

## Authentication

These endpoints currently don't require authentication but should be protected in production:

```typescript
// Add authentication middleware
import { requireAuth } from '$lib/server/auth/roleCheck';

export const GET: RequestHandler = async ({ locals }) => {
  requireAuth({ locals });
  // ... endpoint logic
};
```

---

## Related Documentation

- [Phase 6 Implementation Guide](./PHASE_6_FORMS_IMPLEMENTATION.md)
- [SignTrim Usage Example](./SIGNTRIM_USAGE_EXAMPLE.md)
- [Material Field System](./PHASE_6_FORMS_IMPLEMENTATION.md#material-field-system)

---

## Support

For issues or questions about the Profile API:
- Check the troubleshooting section in [PHASE_6_FORMS_IMPLEMENTATION.md](./PHASE_6_FORMS_IMPLEMENTATION.md#troubleshooting)
- Contact the development team at #reclame-oms-dev
- File an issue on GitHub
