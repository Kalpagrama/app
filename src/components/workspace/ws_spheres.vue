<style lang="sass">
.sphere-item
  &:hover
    background: #777 !important
</style>

<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
  //- header
  div(
    :style=`{borderRadius: '0 0 10px 10px', overflow: 'hidden'}`
    ).row.full-width.q-pa-sm.b-100
    q-input(
      v-model="sphereInput"
      filled color="green"
      label="Find or add sphere"
      @keyup.enter="sphereInputEnter"
      :style=`{zIndex: 100, borderRadius: '10px', overflow: 'hidden', transform: 'translate3d(0,0,0)'}`
      ).full-width.b-220
  //- body
  .col.full-width.scroll
    kalpa-loader(type="WS_SPHERE")
      template(v-slot=`{items}`)
        .row.full-width.items-start.content-start.q-py-sm
          div(
            v-for="(i,ii) in spheresFilter(items)" :key="i.oid"
            :class=`{
              'full-width': ii === sphereIndex,
              'sphere-item': ii !== sphereIndex,
              'cursor-pointer': ii !== sphereIndex
            }`
            :style=`{
              borderRadius: '10px', overflow: 'hidden'
            }`
            ).row.q-mr-xs.q-mb-xs.bg-grey-8
            //- default header
            div(
              @click="sphereClick(i, ii)"
              :style=`{position: 'relative', height: '40px'}`
              ).row.full-width.q-pa-sm
              span(:style=`{userSelect: 'none'}`).text-white {{ i.name }}
              q-btn(
                v-if="ii === sphereIndex"
                round flat dense color="white" icon="edit" @click="sphereEditName(s,si)"
                :style=`{position: 'absolute', zIndex: 100, right: '8px', top: '8px', background: 'rgba(0,0,0,0.2)'}`)
            //- TODO sphere active actions: delete, favorite, color, edit name, explore ws, explore world
            div(
              v-if="ii === sphereIndex"
              :style=`{position: 'relative'}`).row.full-width.items-start.content-start.q-pa-sm
              q-btn(round dense color="blue" icon="colorize").q-mr-sm
              q-btn(flat color="white" no-caps @click="sphereExplore(s,si)").bg-grey-7 Explore
              .col
              q-btn(round dense flat color="red" icon="delete_outline" @click="sphereDelete(s, si)").bg-grey-7
</template>

<script>
// TODO add spheres drag and drop sorting, selecting, color shit, exploring...

export default {
  name: 'wsTags',
  data () {
    return {
      sphere: null,
      sphereInput: '',
      sphereIndex: null
    }
  },
  watch: {
  },
  methods: {
    spheresFilter (arr) {
      if (this.sphereInput.length > 0) {
        return arr.filter(i => i.name.includes(this.sphereInput))
      }
      else {
        return arr
      }
    },
    async sphereInputEnter () {
      this.$log('sphereInputEnter')
      // find this sphere...
      await this.sphereAdd(this.sphereInput)
      this.sphereInput = ''
    },
    sphereClick (s, si) {
      this.$log('sphereClick', s, si)
      if (this.sphereIndex === si) {
        this.sphereIndex = null
      }
      else {
        this.sphereIndex = si
      }
    },
    sphereEditName (s, si) {
      this.$log('sphereEditName', s, si)
    },
    sphereExplore (s, si) {
      this.$log('sphereExplore', s, si)
    },
    sphereDelete (s, si) {
      this.$log('sphereDelete', s, si)
    },
    async sphereAdd (name) {
      this.$log('sphereAdd start', name)
      // TODO prevent duplicates for spheres
      // TODO show btn for create new sphere if filtered spheres length === 0
      if (!name) return
      let sphereInput = {
        name: name,
        wsItemType: 'WS_SPHERE',
        color: 'red'
      }
      // TODO add color picker
      this.$log('sphereInput', sphereInput)
      let sphere = await this.$store.dispatch('workspace/wsItemUpsert', sphereInput)
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
