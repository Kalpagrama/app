<template lang="pug">
div(
  :style=`{
    position: 'relative',
    minWidth: '300px',
    minHeight: '300px',
    maxHeight: '500px'
  }`).column.fit.b-80
  //- header
  div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).row.full-width.q-pa-sm.b-100
    q-input(
      v-model="searchString"
      autofocus
      color="white" dark
      filled
      :style=`{}`).full-width
  //- body
  div(
    ref="wsFinderSpheresScrollArea"
    :style=`{}`
    ).col.full-width.scroll
    .row.full-width.items-start.content-start.q-pa-sm
      kalpa-loader(
        type="WS_SPHERE"
        :variables=`{selector: {}}`
        @noResults="noResults")
        template(v-slot=`{items}`)
          div(
            v-for="(s,si) in items" :key="s.id"
            :style=`{height: '35px'}`
            ).row.full-width.items-center.content-center.q-px-md.br
            span.text-white {{ s.name }}
      div(v-if="searchStringCreate").row.full-width.items-center.content-center
        small.text-white.q-mr-sm Create
        q-btn(color="green" dense no-caps @click="sphereCreate({name: searchString})").q-px-sm {{ searchString }}
  //- footer
</template>

<script>
export default {
  name: 'wsFinderSpheres',
  data () {
    return {
      searchString: '',
      searchStringCreate: false
    }
  },
  methods: {
    async sphereCreate (sphereInput) {
      this.$log('sphereCreate')
      sphereInput.wsItemType = 'WS_SPHERE'
      let rxDoc = await this.$rxdb.upsertItem(sphereInput)
      this.searchStringCreate = false
      this.searchString = ''
    },
    noResults () {
      this.$log('noResults')
      if (this.searchString.length > 0) {
        this.searchStringCreate = true
      }
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
