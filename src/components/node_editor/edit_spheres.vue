<template lang="pug">
.column.fit
  //- header
  .row.full-width.q-pa-sm
    q-input(
      v-model="sphereSearch" @keyup.enter="sphereEnter"
      filled dark color="green"
      placeholder="Add sphere"
      :style=`{borderRadius: '10px', overflow: 'hidden', transform: 'translate3d(0,0,0)'}`
      ).full-width.bg-grey-8
  //- body
  .col.full-width.scroll
    .row.full-width.items-start.content-start.q-px-sm
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
      if (this.sphereIndex === si) {
        this.sphereIndex = null
      }
      else {
        this.sphereIndex = si
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
