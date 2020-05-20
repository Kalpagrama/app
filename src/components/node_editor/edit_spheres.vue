<template lang="pug">
.column.fit
  slot(name="header")
  //- header
  .row.full-width.q-px-sm.q-pt-sm
    div(:style=`{borderRadius: node.spheres.length > 0 ? '10px 10px 0 0' : '10px'}`).row.full-width.q-pa-sm.b-70
      q-input(
        v-model="sphereSearch" @keyup.enter="sphereEnter"
        filled color="white"
        label="Add sphere"
        :style=`{borderRadius: '10px', overflow: 'hidden', transform: 'translate3d(0,0,0)'}`
        ).full-width.b-220
  //- body
  .col.full-width.scroll.q-px-sm.q-pb-sm
    div(
      v-if="node.spheres.length > 0"
      :style=`{borderRadius: '0 0 10px 10px'}`).row.full-width.items-start.content-start.q-pa-sm.b-70
      div(
        v-for="(s,si) in node.spheres" :key="si" @click="sphereClick(s, si)"
        :class=`{
          'full-width': si === sphereIndex
        }`
        :style=`{borderRadius: '10px', overflow: 'hidden'}`
        ).row.q-px-sm.q-py-xs.bg-grey-8.q-mr-xs.q-mb-xs.cursor-pointer
        span(:style=`{userSelect: 'none'}`).text-white {{ s.name }}
</template>

<script>
export default {
  name: 'nodeEditor-editSpheres',
  props: {
    node: {type: Object}
  },
  data () {
    return {
      sphereSearch: '',
      sphereIndex: null
    }
  },
  methods: {
    sphereEnter () {
      this.$log('sphereEnter', this.sphereSearch)
      if (this.sphereSearch.length > 0) {
        this.node.spheres.push({name: this.sphereSearch})
        this.sphereSearch = ''
      }
    },
    sphereClick (s, si) {
      this.$log('sphereClick', s, si)
      // if (this.sphereIndex === si) {
      //   this.sphereIndex = null
      // }
      // else {
      //   this.sphereIndex = si
      // }
      this.$delete(this.node.spheres, si)
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
