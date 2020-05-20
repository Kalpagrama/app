<template lang="pug">
.column.fit
  .row.full-width
    slot(name="header")
  .col.full-width.scroll.q-pa-sm
    small.text-white {{node}}
</template>

<script>
export default {
  name: 'nodeEditor-editPreview',
  props: {
    node: {type: Object}
  },
  data () {
    return {
    }
  }
}
</script>
