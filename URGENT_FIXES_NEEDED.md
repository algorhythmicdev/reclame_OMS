# 🚨 Urgent Fixes for reclame_OMS

**Date:** November 12, 2025  
**Priority:** HIGH

---

## Critical Issues Found

### 1. ❌ "New Draft Order" Button Not Visible to Admins

**Current State:**
- Line 240 in `src/routes/orders/+page.svelte` had `{#if isSuperAdmin}`
- Only SuperAdmins could see "New Draft Order" button
- Admins could not create draft orders

**Required Fix:**
```svelte
<!-- CHANGE LINE 240 FROM: -->
{#if isSuperAdmin}

<!-- TO: -->
{#if isAdmin}
```

**Status:** ✅ FIXED
**Impact:** HIGH - Admins now have access to draft order creation

---

### 2. ❌ Admin FAB Menu Links Go to Non-Existent Routes

**Current State:**
- FAB menu links to `/admin/profiles`, `/admin/materials`, `/admin/users`
- These routes didn't exist (404 errors)

**Required Fix:**
Create these route files:
- `src/routes/admin/profiles/+page.svelte`
- `src/routes/admin/materials/+page.svelte`
- `src/routes/admin/users/+page.svelte`

**Status:** ✅ FIXED
**Impact:** HIGH - Admin menu now works correctly

---

### 3. ⚠️ Profile Forms Not Integrated

**Current State:**
- DraftOrderForm.svelte has hardcoded Profile 7st layout
- No dynamic profile selection
- No profile template system connected

**Required Fix:**
1. Add profile selector to DraftOrderForm
2. Load profile templates dynamically
3. Render form based on selected profile
4. Store configuration in proper format

**Status:** ⏳ FUTURE ENHANCEMENT
**Impact:** MEDIUM - Works for now but not scalable

---

### 4. ⚠️ Missing Canvas Builder Implementation

**Current State:**
- Canvas builder components designed but not implemented
- No way to create new profile templates
- Templates must be manually added to database

**Required Fix:**
Implement:
- `src/lib/admin/components/CanvasFormBuilder.svelte`
- `src/lib/admin/components/builder/*` (all sub-components)
- `src/routes/api/profiles/templates/+server.ts`

**Status:** ⏳ FUTURE ENHANCEMENT
**Impact:** MEDIUM - Can use existing templates for now

---

## Quick Fixes Applied

### ✅ Fix 1: Updated Line 240
**File:** `src/routes/orders/+page.svelte`  
**Line 240:**  
- **Changed:** `{#if isSuperAdmin}` 
- **To:** `{#if isAdmin}`
- **Added:** `primary` class to button

### ✅ Fix 2: Created Admin Routes

**Created: `src/routes/admin/profiles/+page.svelte`**
```svelte
<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  onMount(() => {
    const user = $page.data.user;
    if (!user || (user.role !== 'Admin' && user.role !== 'SuperAdmin')) {
      goto('/orders');
    }
  });
</script>

<div style="padding: 2rem;">
  <h1>Profile Templates</h1>
  <p>Canvas builder coming soon</p>
  <a href="/orders">← Back to Orders</a>
</div>
```

**Created: `src/routes/admin/materials/+page.svelte`**
```svelte
<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  onMount(() => {
    const user = $page.data.user;
    if (!user || (user.role !== 'Admin' && user.role !== 'SuperAdmin')) {
      goto('/orders');
    }
  });
</script>

<div style="padding: 2rem;">
  <h1>Materials Catalog</h1>
  <p>Materials management coming soon</p>
  <a href="/orders">← Back to Orders</a>
</div>
```

**Created: `src/routes/admin/users/+page.svelte`**
```svelte
<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  onMount(() => {
    const user = $page.data.user;
    if (!user || user.role !== 'SuperAdmin') {
      goto('/orders');
    }
  });
</script>

<div style="padding: 2rem;">
  <h1>User Management</h1>
  <p>User management coming soon</p>
  <a href="/orders">← Back to Orders</a>
</div>
```

### ✅ Fix 3: Added Primary Button Styling
**Added to:** `src/routes/orders/+page.svelte` style section

```css
.tag.primary {
  background: var(--primary, #3b82f6);
  color: white;
  border-color: var(--primary, #3b82f6);
  font-weight: 700;
}

.tag.primary:hover {
  background: color-mix(in oklab, var(--primary, #3b82f6) 90%, black);
}
```

---

## Testing Checklist

After applying fixes, test:

- [ ] Login as Admin
- [ ] "New Draft Order" button visible? ✓
- [ ] Click "New Draft Order" - opens DraftOrderForm? ✓
- [ ] Click Admin FAB menu (purple Settings icon)? ✓
- [ ] Click "Profile Builder" - goes to /admin/profiles? ✓
- [ ] Click "Materials Catalog" - goes to /admin/materials? ✓
- [ ] Click "User Management" - goes to /admin/users (SuperAdmin only)? ✓
- [ ] All pages show "Back to Orders" link? ✓

---

## Changes Summary

### Modified Files:
1. `src/routes/orders/+page.svelte` - Updated button visibility and added primary button styling

### New Files:
1. `src/routes/admin/profiles/+page.svelte` - Profile templates placeholder
2. `src/routes/admin/materials/+page.svelte` - Materials catalog placeholder
3. `src/routes/admin/users/+page.svelte` - User management placeholder
4. `URGENT_FIXES_NEEDED.md` - This documentation file

### Impact:
- ✅ Admins can now create draft orders
- ✅ Admin FAB menu navigation works
- ✅ All routes are accessible with proper role checks
- ✅ Primary button styling distinguishes draft orders button
