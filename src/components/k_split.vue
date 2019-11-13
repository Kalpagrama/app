<template lang="pug">
div(:style=`{height: $q.screen.height+'px'}`).column
  //- header
  div(
    :class="headerClass"
    :style=`{overflow: 'hidden'}`).row.full-width
    slot(name="header")
  //- body
  div(:class="bodyClass").col.full-width.scroll
    slot(name="body")
</template>

<script>
export default {
  name: 'kSplit',
  props: ['width', 'height', 'headerMaxHeight', 'bodyClass', 'headerClass'],
  data () {
    return {
    }
  }
}
</script>
