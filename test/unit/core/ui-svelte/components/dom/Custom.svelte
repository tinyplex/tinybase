<script lang="ts">
  let {store: _store, queries: _queries, ...props}: Record<string, any> =
    $props();
</script>

<b>{JSON.stringify(props)}</b>
