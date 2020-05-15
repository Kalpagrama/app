<template lang="pug">
div(
  :style=`{
    position: 'relative',
    height: height+'px',
    maxWidth: '100%'
  }`
  ).row.full-width.items-start.content-start.b-70
  //- actions
  q-btn(
    round flat color="white" icon="edit" @click="itemEdit()"
    :style=`{
      position: 'absolute', zIndex: 10000, right: '8px', top: 'calc(50% - 20px)'
    }`)
  div(
    :style=`{
      position: 'relative',
      maxWidth: height+'px',
      maxHeight: height+'px'
    }`
    ).row.fit
    composition-editor(
      ctx="workspace"
      :composition="item"
      :options=`{visible: true, active: true, mini: false}`)
</template>

<script>
export default {
  name: 'editItems-itemActive',
  props: ['item', 'itemIndex', 'itemEditing'],
  data () {
    return {
      height: 100
    }
  },
  methods: {
    itemEdit () {
      this.$log('itemEdit')
      this.$tween.to(this, 0.5, {height: this.$q.screen.height})
    }
  }
}
</script>
