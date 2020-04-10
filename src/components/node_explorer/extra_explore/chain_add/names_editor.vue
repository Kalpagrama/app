<template lang="pug">
div(:style=`{height: $q.screen.height+'px', width: $q.screen.width+'px'}`).column.bg-grey-10
  //- header
  .row.full-width
    div(:style=`{height: '60px', paddingLeft: '10px', paddingTop: '10px'}`).row.full-width.items-start.content-start
      q-btn(round flat color="grey-3" icon="keyboard_arrow_left" @click="$emit('cancel')"
        :style=`{background: 'rgba(0,0,0,0.3)'}`)
    .row.full-width.q-px-sm
      q-input(
        ref="nameInputRef" v-model="node.name" filled dark color="green" autofocus autogrow type="textarea" :rows="2"
        placeholder="Whats on your mind?"
        :style=`{transform: 'translate3d(0,0,0)', zIndex: 200, borderRadius: '10px', overflow: 'hidden'}`).full-width
  .col.full-width.q-pa-sm
    .row.full-width.items-start.content-start.q-px-sm
      span.text-bold.text-white Category: #sphere, #sphere, #sphere, #sphere
</template>

<script>
export default {
  name: 'extraExplore_chainAdd_namesEditor',
  props: ['node'],
  data () {
    return {
    }
  },
  mounted () {
    this.$log('mounted')
  }
}
</script>
