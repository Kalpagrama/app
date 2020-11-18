<template lang="pug">
div().row.full-width
  div().row.full-width
  div(v-if="item.items && item.items.length > 0").row.full-width
    item(:item="item")
</template>

<script>
export default {
  name: 'item',
  props: ['item'],
}
</script>
