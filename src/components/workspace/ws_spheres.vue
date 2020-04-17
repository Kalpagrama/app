<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
  //- header
  .row.full-width.q-pa-sm
    q-input(
      v-model="sphereInput"
      filled color="green" placeholder="Find or add sphere"
      @keyup.enter="sphereInputEnter"
      :style=`{zIndex: 100, borderRadius: '10px', overflow: 'hidden', transform: 'translate3d(0,0,0)'}`
      ).full-width.bg-grey-1
  //- body
  .col.full-width.scroll
    kalpa-loader(type="SPHERE_LIST" :variables=`{}`)
      template(v-slot=`{items}`)
        .row.full-width.items-start.content-start
          div(
            v-for="(i,ii) in items" :key="i.oid"
            ).row.q-pa-sm
            span.text-white {{ i.name }}
</template>

<script>
export default {
  name: 'wsSpheres',
  data () {
    return {
      sphere: null,
      sphereInput: ''
    }
  },
  watch: {
  },
  methods: {
    async sphereInputEnter () {
      this.$log('sphereInputEnter')
      // find this sphere...
      await this.sphereAdd(this.sphereInput)
      this.sphereInput = ''
    },
    async sphereAdd (name) {
      this.$log('sphereAdd start', name)
      if (!name) return
      let sphereInput = {
        name: name,
        // unique: content.oid,
        // thumbOid: content.oid,
        wsItemType: 'SPHERE',
        rawData: {
          color: 'red'
        }
      }
      this.$log('sphereInput', sphereInput)
      let sphere = await this.$store.dispatch('workspace/wsItemCreate', sphereInput)
      this.$log('sphereInput done', sphere)
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
