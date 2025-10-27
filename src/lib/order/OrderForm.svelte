<script lang="ts">
  import { base } from '$app/paths';
  import Input from '$lib/ui/Input.svelte';
  import Button from '$lib/ui/Button.svelte';
  import PdfFrame from '$lib/pdf/PdfFrame.svelte';
  import ColorSwatch from '$lib/colors/ColorSwatch.svelte';
  import type { ColorSpec } from '$lib/colors/color-systems';
  import { isKnownRal } from '$lib/colors/color-systems';
  import LoadingDatePicker from '$lib/order/LoadingDatePicker.svelte';
  import { createOrder } from '$lib/order/signage-store';

  export let open = false;
  export let onClose: () => void = () => {};

  const defaultProgress = {
    CAD: 0,
    CNC: 0,
    SANDING: 0,
    BENDING: 0,
    WELDING: 0,
    PAINT: 0,
    ASSEMBLY: 0,
    QC: 0,
    LOGISTICS: 0
  };

  type MaterialRow = {
    key: string;
    label: string;
    material: string;
    thickness: string;
    color: ColorSpec;
  };

  let id = '';
  let title = '';
  let client = '';
  let due = new Date().toISOString().slice(0, 10);
  let loadingDate = '';
  let pdfPath = '';

  let materials: MaterialRow[] = [
    { key: 'face', label: 'Face', material: 'Acrylic', thickness: '3mm', color: { system: 'RAL', code: 'RAL 9016' } },
    { key: 'back', label: 'Back', material: 'ACP', thickness: '3mm', color: { system: 'RAL', code: 'RAL 9005' } },
    { key: 'frame', label: 'Face Frame', material: 'Aluminum', thickness: '2mm', color: { system: 'Other', code: 'Natural' } }
  ];

  function resetForm() {
    id = '';
    title = '';
    client = '';
    due = new Date().toISOString().slice(0, 10);
    loadingDate = '';
    pdfPath = '';
    materials = [
      { key: 'face', label: 'Face', material: 'Acrylic', thickness: '3mm', color: { system: 'RAL', code: 'RAL 9016' } },
      { key: 'back', label: 'Back', material: 'ACP', thickness: '3mm', color: { system: 'RAL', code: 'RAL 9005' } },
      { key: 'frame', label: 'Face Frame', material: 'Aluminum', thickness: '2mm', color: { system: 'Other', code: 'Natural' } }
    ];
  }

  function addRow() {
    const index = materials.length + 1;
    materials = [
      ...materials,
      {
        key: `part_${index}`,
        label: 'Part',
        material: '',
        thickness: '',
        color: { system: 'HEX', code: '', hex: '#888888' }
      }
    ];
  }

  function deleteRow(index: number) {
    materials = materials.filter((_, i) => i !== index);
  }

  function isHexValid(value: string | undefined) {
    if (!value) return true;
    return /^#?[0-9a-f]{6}$/i.test(value.trim());
  }

  function needsRalWarning(code: string | undefined) {
    if (!code) return false;
    return !isKnownRal(code.trim());
  }

  function close() {
    open = false;
    onClose();
  }

  function create() {
    if (!id.trim() || !title.trim() || !client.trim() || !pdfPath.trim()) return;

    const fields = [
      { key: 'due', label: 'Due', value: due },
      { key: 'loading', label: 'Loading Date', value: loadingDate || '' }
    ];

    const mats = materials.map((item) => ({
      key: item.key,
      label: `${item.label} (${item.material} ${item.thickness})`,
      value: `${item.material} ${item.thickness} – ${item.color.system} ${item.color.code}`
    }));

    createOrder({
      id,
      title,
      client,
      due,
      badges: ['OPEN', 'IN_PROGRESS'],
      fields,
      materials: mats,
      progress: { ...defaultProgress },
      loadingDate,
      file: {
        id: crypto.randomUUID(),
        name: pdfPath.split('/').pop() || 'order.pdf',
        path: pdfPath,
        kind: 'pdf'
      }
    });

    resetForm();
    close();
  }
</script>

{#if open}
  <div class="shade" on:click={(event) => event.target === event.currentTarget && close()}>
    <div class="panel" role="dialog" aria-modal="true" aria-label="Order form">
      <header>
        <h3>New Order</h3>
        <button class="x" on:click={close} aria-label="Close">✕</button>
      </header>

      <section class="grid" style="grid-template-columns:1.2fr 1fr; gap:12px">
        <div class="pdf-stack">
          <PdfFrame src={pdfPath} />
          <div class="card">
            <h4>PDF Source</h4>
            <div class="muted" style="font-size:.85rem;margin-bottom:6px">
              Paste a PDF path under <code>{base}/files/</code>
            </div>
            <Input bind:value={pdfPath} placeholder={`${base}/files/PO-....pdf`} ariaLabel="PDF path" />
          </div>
        </div>

        <div class="grid">
          <div class="card">
            <h4>Basics</h4>
            <div class="grid" style="grid-template-columns:1fr 1fr">
              <Input bind:value={id} placeholder="PO number (unique)" />
              <Input bind:value={client} placeholder="Client" />
              <div style="grid-column:span 2">
                <Input bind:value={title} placeholder="Title" />
              </div>
              <div>
                <label class="muted">Due</label>
                <input class="rf-input" type="date" bind:value={due} />
              </div>
              <div>
                <label class="muted">Loading Date</label>
                <LoadingDatePicker bind:selected={loadingDate} />
              </div>
            </div>
          </div>

          <div class="card">
            <h4>Colors & Materials</h4>
            <div class="materials-grid">
              {#each materials as row, index}
                <Input bind:value={row.label} placeholder="Section" />
                <Input bind:value={row.material} placeholder="Material" />
                <Input bind:value={row.thickness} placeholder="Thickness (e.g., 3mm)" />
                <select class="rf-select" bind:value={row.color.system}>
                  <option value="RAL">RAL</option>
                  <option value="Pantone">Pantone</option>
                  <option value="HEX">HEX</option>
                  <option value="Other">Other</option>
                </select>
                <Input
                  bind:value={row.color.code}
                  placeholder={row.color.system === 'HEX' ? '#RRGGBB' : 'Color code'}
                />

                {#if row.color.system === 'HEX' && row.color.code && !isHexValid(row.color.code)}
                  <div class="full warn">Invalid HEX</div>
                {/if}

                {#if row.color.system !== 'HEX'}
                  <div class="full-block">
                    <Input bind:value={row.color.hex} placeholder="Optional HEX override" />
                    {#if row.color.hex && !isHexValid(row.color.hex)}
                      <div class="warn">Invalid HEX</div>
                    {/if}
                    {#if row.color.system === 'RAL' && row.color.code && needsRalWarning(row.color.code)}
                      <div class="warn">Unknown RAL code</div>
                    {/if}
                  </div>
                {/if}

                <div class="row full" style="align-items:center; gap:6px">
                  <ColorSwatch color={row.color} />
                  <button class="tag" type="button" on:click={() => deleteRow(index)} aria-label="Remove">–</button>
                </div>
              {/each}
              <div class="full">
                <button class="tag" type="button" on:click={addRow}>+ Add section</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer class="row" style="justify-content:flex-end; gap:8px; margin-top:10px">
        <Button variant="ghost" on:click={close}>Cancel</Button>
        <Button on:click={create}>Create Order</Button>
      </footer>
    </div>
  </div>
{/if}

<style>
.shade{position:fixed;inset:0;background:rgba(0,0,0,.45);display:grid;place-items:center;z-index:99}
.panel{background:var(--bg-1);border:1px solid var(--border);border-radius:14px;min-width:920px;max-width:95vw;max-height:90vh;padding:14px;overflow:auto}
header{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
.x{background:transparent;border:none;color:var(--text);cursor:pointer;font-size:1.1rem}
.pdf-stack{display:grid;gap:12px}
.materials-grid{
  display:grid;
  grid-template-columns:repeat(5,minmax(0,1fr));
  gap:8px;
}
.materials-grid .full{grid-column:1 / -1}
.materials-grid .full-block{
  grid-column:1 / -1;
  display:flex;
  flex-direction:column;
  gap:4px;
}
.warn{color:var(--danger);font-size:.8rem}
</style>
