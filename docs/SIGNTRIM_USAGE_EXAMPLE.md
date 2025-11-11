# SignTrim Selector Usage Example

This document demonstrates how to use the SignTrimSelector component in your profile forms.

## Basic Usage

```svelte
<script lang="ts">
  import { SignTrimSelector } from '$lib/profiles/components/fields';
  
  let selectedColor = '';
  
  // Define SignTrim colors (these would typically come from the database)
  const signTrimColors = {
    "971": { "name": "WHITE", "hex": "#FFFFFF" },
    "785": { "name": "BLACK", "hex": "#000000" },
    "721": { "name": "BLACK/GREY", "hex": "#4A4A4A" },
    "479": { "name": "ULTRAMARINE", "hex": "#1E3A8A" },
    "155": { "name": "YELLOW 2", "hex": "#FFE135" },
    "097": { "name": "ORANGE", "hex": "#FF6600" },
    "300": { "name": "SILVER MIRROR", "hex": "#C0C0C0" }
  };
</script>

<SignTrimSelector
  bind:value={selectedColor}
  colors={signTrimColors}
  label="Trim Color"
  required={true}
/>

<p>Selected color: {selectedColor}</p>
```

## In Profile Form Template

When defining a profile template in the database, use the `signtrim_selector` field type:

```sql
INSERT INTO field_types (type_code, display_name_en, metadata)
VALUES (
  'signtrim_selector',
  'SignTrim Selector',
  '{
    "colors": {
      "971": {"name": "WHITE", "hex": "#FFFFFF"},
      "785": {"name": "BLACK", "hex": "#000000"},
      "479": {"name": "ULTRAMARINE", "hex": "#1E3A8A"},
      // ... more colors
    }
  }'::jsonb
);
```

Then reference it in a profile field:

```sql
INSERT INTO profile_section_fields (
  profile_template_id,
  section_id,
  field_type_id,
  field_key,
  label_en,
  is_required,
  order_index,
  config
) VALUES (
  :profile_id,
  :trim_section_id,
  (SELECT id FROM field_types WHERE type_code = 'signtrim_selector'),
  'trim_color',
  'TRIM COLOR',
  true,
  1,
  '{
    "colors": {
      "971": {"name": "WHITE", "hex": "#FFFFFF"},
      "785": {"name": "BLACK", "hex": "#000000"}
    }
  }'::jsonb
);
```

## ProfileFormVisual Integration

The SignTrimSelector is automatically rendered by ProfileFormVisual when it encounters a field with type `signtrim_selector`:

```svelte
<!-- ProfileFormVisual.svelte automatically handles this -->
{#if field.fieldType === 'signtrim_selector'}
  <SignTrimSelector
    bind:value={configuration[section.name][field.fieldKey]}
    label={field.label?.en || field.label_en}
    required={field.isRequired}
    disabled={readonly}
    colors={field.config?.colors || {}}
  />
{/if}
```

## Validation

When validating forms, the selected color code is stored as a string:

```typescript
// Example configuration object
{
  "TRIM": {
    "trim_color": "971"  // SignTrim color code
  }
}
```

To validate:

```typescript
const response = await fetch('/api/profiles/validate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    profileCode: 'P5',
    configuration: {
      TRIM: {
        trim_color: '971'
      }
    }
  })
});

const { valid, errors } = await response.json();
```

## PDF Generation

When generating PDFs, the SignTrim color will be rendered as a colored box:

```typescript
import { generateProfilePDF } from '$lib/profiles/utils/generateProfilePDF';

const pdfBlob = await generateProfilePDF({
  poNumber: 'PO-0023',
  profileCode: 'P5',
  profileName: 'Profile 5 - SignTrim',
  quantity: 2,
  configuration: {
    TRIM: {
      trim_color: '971'
    }
  },
  deliveryDate: '2025-10-27'
});
```

The PDF will show a white box (for SignTrim 971) in the TRIM section.

## Complete Example: Profile P5 Form

```svelte
<script lang="ts">
  import { ProfileFormVisual } from '$lib/profiles/components';
  
  let configuration = {
    CNC_FREZER: {},
    BENDER: {},
    TRIM: {},
    ASSEMBLING: {},
    DELIVERY: {}
  };
</script>

<ProfileFormVisual
  profileCode="P5"
  bind:configuration
  readonly={false}
/>

<button on:click={async () => {
  // Validate before submission
  const response = await fetch('/api/profiles/validate', {
    method: 'POST',
    body: JSON.stringify({
      profileCode: 'P5',
      configuration
    })
  });
  
  const { valid, errors } = await response.json();
  
  if (valid) {
    // Save configuration
    console.log('Valid configuration:', configuration);
  } else {
    console.error('Validation errors:', errors);
  }
}}>
  Validate & Save
</button>
```

## Advanced: Custom Color Management

If you need to dynamically load SignTrim colors from an API:

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { SignTrimSelector } from '$lib/profiles/components/fields';
  
  let selectedColor = '';
  let availableColors = {};
  
  onMount(async () => {
    const response = await fetch('/api/colors/signtrim');
    availableColors = await response.json();
  });
</script>

{#if Object.keys(availableColors).length > 0}
  <SignTrimSelector
    bind:value={selectedColor}
    colors={availableColors}
    label="Trim Color"
    required={true}
  />
{:else}
  <p>Loading colors...</p>
{/if}
```

## Styling Customization

The SignTrimSelector uses CSS custom properties for theming:

```css
.signtrim-selector {
  --search-bg: #f9fafb;
  --search-border: #e5e7eb;
  --preview-shadow: 2px 2px 6px rgba(0, 0, 0, 0.15);
  --box-shadow-hover: 0 6px 12px rgba(0, 0, 0, 0.2);
}
```

Override these in your global styles if needed.

## Testing

Example test for SignTrimSelector:

```typescript
import { render, fireEvent } from '@testing-library/svelte';
import SignTrimSelector from '$lib/profiles/components/fields/SignTrimSelector.svelte';

describe('SignTrimSelector', () => {
  const colors = {
    "971": { "name": "WHITE", "hex": "#FFFFFF" },
    "785": { "name": "BLACK", "hex": "#000000" }
  };
  
  it('displays color options', () => {
    const { getByText } = render(SignTrimSelector, {
      colors,
      value: '',
      label: 'Test'
    });
    
    expect(getByText('WHITE')).toBeInTheDocument();
    expect(getByText('BLACK')).toBeInTheDocument();
  });
  
  it('selects color on click', async () => {
    const { getByTitle, component } = render(SignTrimSelector, {
      colors,
      value: '',
      label: 'Test'
    });
    
    const whiteButton = getByTitle('SIGNTRIM WHITE 971');
    await fireEvent.click(whiteButton);
    
    expect(component.value).toBe('971');
  });
  
  it('filters colors on search', async () => {
    const { getByPlaceholderText, queryByText } = render(SignTrimSelector, {
      colors,
      value: '',
      label: 'Test'
    });
    
    const searchInput = getByPlaceholderText('Search SignTrim colors...');
    await fireEvent.input(searchInput, { target: { value: 'white' } });
    
    expect(queryByText('WHITE')).toBeInTheDocument();
    expect(queryByText('BLACK')).not.toBeInTheDocument();
  });
});
```

## Troubleshooting

**Colors not showing:**
- Verify the `colors` prop is passed correctly
- Check browser console for errors
- Ensure field type is `signtrim_selector` in database

**Selected color not saving:**
- Check that `bind:value` is used
- Verify the configuration object structure
- Check database validation rules

**Visual issues:**
- Clear browser cache
- Check for CSS conflicts
- Verify hex color values are valid

## Related Components

- **MaterialField** - For material selection with thickness
- **ColorRAL** - For RAL color selection
- **OracalSelector** - For ORACAL film selection
- **ProfileFormVisual** - Renders complete profile forms

## Further Reading

- [Phase 6 Implementation Guide](./PHASE_6_FORMS_IMPLEMENTATION.md)
- [Material Field System](./PHASE_6_FORMS_IMPLEMENTATION.md#material-field-system)
- [Profile Templates](./PHASE_6_FORMS_IMPLEMENTATION.md#profile-templates)
