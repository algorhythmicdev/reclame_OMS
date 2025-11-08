<script lang="ts">
  export let code: string;
  export let color: string;
</script>

<div class="color-swatch" style="background-color: {color};">
  {code}
</div>

<style>
  .color-swatch {
    width: 50px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 11px;
    border-radius: 3px;
  }
</style>
