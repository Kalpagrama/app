<template lang="pug">
k-menu-popup(:name="node.name" :actions="actions" @action="$event => $emit('action', $event)")
    q-btn(icon="brush" color="grey-5" round flat)
</template>

<script>
export default {
  name: 'nodeTemplateToggle'
}
</script>
