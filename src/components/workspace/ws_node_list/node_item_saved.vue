<template lang="pug">
.row.full-width
  img(
    :src="node.thumbOid"
    :style=`{}`
    ).full-width.br
</template>

<script>
export default {
  name: 'nodeItemSaved',
  props: ['node'],
  data () {
    return {
    }
  }
}
</script>
