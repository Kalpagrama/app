<template lang="pug">
.row.full-width
  node(:node="node" :needFull="true")
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
