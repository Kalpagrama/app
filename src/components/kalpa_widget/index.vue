<template lang="pug">
.row.full-width
</template>

<script>
export default {
  name: 'kalpaWidget',
  props: {
    loading: {type: Boolean},
    items: {type: Array, default () { return [] }},
    itemOnClick: {type: Function},
  }
}
</script>
