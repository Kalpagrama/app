<template lang="pug">
div(
  :style=`{
    position: 'relative',
  }`
  ).column.fit
  div().row.full-width.q-px-sm
    q-btn(
      flat no-caps color="white"
      icon-right="keyboard_arrow_down"
      :style=`{
        height: '50px',
        maxWidth: '300px',
      }`).b-80.full-width Category
  div(:style=`{}`).row.full-width.q-pa-sm
    q-input(
      v-model="searchString"
      @keyup.enter="searchStringEnter()"
      filled dark dense autofocus
      color="white"
      label="Find or create sphere"
      ).full-width
  .col.full-width.scroll
    .row.full-width.items-start.content-start.q-px-sm
      div(
        v-for="(s,si) in node.spheres" :key="si" @click="sphereClick(s,si)"
        :style=`{
          borderRadius: '10px',
          overflow: 'hidden',
        }`
        ).q-pa-sm.q-mr-sm.q-mb-sm.b-80
        span.text-white {{ s.name }}
  //- div(:style=`{}`).row.full-width.q-pa-sm
</template>

<script>
// TODO: search from WS in your spheres...
export default {
  name: 'editSpheres',
  props: ['node'],
  data () {
    return {
      searchString: ''
    }
  },
  methods: {
    sphereClick (s, si) {
      this.$log('sphereClick')
      this.sphereDelete(s, si)
    },
    sphereDelete(s, si) {
      this.$log('sphereDelete')
      this.$delete(this.node.spheres, si)
    },
    async searchStringEnter () {
      this.$log('searchStringEnter')
      // check length
      if (this.searchString.length === 0) return
      // check dups
      let i = this.node.spheres.find(s => s.name === this.searchString)
      if (!i) {
        this.node.spheres.push({name: this.searchString})
      }
      this.searchString = ''
    }
  }
}
</script>
