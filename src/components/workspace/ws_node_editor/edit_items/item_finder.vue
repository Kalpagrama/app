<template lang="pug">
q-layout(view="hHh Lpr lff" :style=`{zIndex: 4000, maxWidth: width+'px'}`).b-30
  q-header(reveal).row.full-width.justify-center
    div(:style=`{maxWidth: '800px'}`).row.full-width
      div(:style=`{}`).row.full-width.items-center.content-center.q-pa-sm
        q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$emit('close')")
        span(:style=`{fontSize: '18px'}`).text-white.text-bold Item finder
      .row.full-width.q-px-md
        div(:style=`{position: 'relative',borderRadius: '10px',overflow: 'hidden'}`).row.full-width
          q-input(
            v-model="searchString"
            placeholder="Find item"
            filled dark dense color="grey-6").full-width
  q-page-container
    q-page.row.full-width
      h1.text-white item finder
</template>

<script>
export default {
  name: 'wsNodeEditor_itemFinder',
  data () {
    return {
      searchString: ''
    }
  },
  computed: {
    width () {
      if (this.$q.screen.width < 800) return this.$q.screen.width
      else return 800
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
