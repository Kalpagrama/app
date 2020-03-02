<style lang="stylus">
.kinput {
  border: none;
  height: 100%;
  padding: 10px;
  &:focus {
    outline: none;
  }
}
</style>
<template lang="pug">
div(
  :style=`{minHeight: '60px'}`
  ).row.full-width.items-start.content-start
  div(:style=`{height: '60px'}`).row.full-width.items-center.content-center.scroll
    .row.no-wrap
      span(
        v-for="(c, ci) in categories" :key="ci" @click="categorySet(c, ci)"
        v-if="c.type !== 'ALL'"
        :class=`{
          'bg-green': c.type === node.category,
          'text-bold': c.type === node.category
        }`
        :style=`{
          color: 'white', whiteSpace: 'nowrap', textTransform: 'capitalize',
          borderRadius: '10px', overflow: 'hidden'}`
        ).cursor-pointer.q-pa-sm.q-mr-sm {{ c.sphere.name }}
  div().row.full-width
    input(
      v-model="sphere" placeholder="Find or add sphere"
      @keyup.enter="sphereAdd"
      :style=`{minHeight: '60px', borderRadius: '10px'}`).kinput.full-width.bg-grey-4
  //- spheres WS
  div(
    v-if="sphere.length > 0"
    ).row.full-width.items-start.content-start.q-py-sm
    span(
      v-for="(s,si) in spheresWSFiltered" :key="si" @click="sphereAdd(s,si)"
      :style=`{color: 'white', borderRadius: '10px', overflow: 'hidden'}`
      ).bg-grey-9.q-pa-sm.q-mr-sm.q-mb-sm.cursor-pointer {{ s.name }}
    q-btn(
      v-if="spheresWSFiltered.length === 0"
      no-caps color="green" @click="sphereAdd({name: sphere})"
      :style=`{borderRadius: '10px', overflow: 'hidden'}`) Add: {{ sphere }}
  //- spheres NODE
  .row.full-width.items-start.content-start.q-py-sm
    span(
      v-for="(s, si) in spheres" :key="si" @click="sphereClick(s,si)"
      :class=`{'full-width': si === sphereIndex}`
      :style=`{
        color: 'white', borderRadius: '10px', userSelect: 'none',
        overflow: 'hidden', whiteSpace: 'nowrap'}`
      ).bg-grey-9.q-pa-sm.q-mr-sm.q-mb-sm.cursor-pointer {{ s.name }}
      div(
        v-if="si === sphereIndex"
        :style=`{height: '60px'}`
        ).row.full-width.items-end.content-end
        q-btn(round flat dense color="red" icon="delete_outline" @click="sphereDelete(s,si)")
        .col
        q-btn(
          color="green" no-caps @click="sphereExplore(s, si)"
          :style=`{borderRadius: '10px', overflow: 'hidden'}`) Explore
</template>

<script>
export default {
  name: 'nodeEditorSpheres',
  props: ['node'],
  data () {
    return {
      sphere: '',
      sphereIndex: -1,
      spheresWS: []
    }
  },
  computed: {
    spheres () {
      return this.node.spheres
    },
    spheresWSFiltered () {
      return this.spheresWS.filter(i => {
        return i.name.includes(this.sphere)
      })
    },
    categories () {
      return this.$store.state.node.categories
    }
  },
  methods: {
    categorySet (c, ci) {
      this.$log('categorySet', c, ci)
      this.node.category = c.type
      this.sphereIndex = -1
    },
    sphereClick (s, si) {
      this.$log('sphereClick', s, si)
      this.sphereIndex = si
    },
    sphereAdd () {
      this.$log('sphereAdd')
      if (this.sphere.length === 0) return
      this.sphereIndex = -1
      this.node.spheres.push({name: this.sphere})
      this.sphere = ''
    },
    sphereExplore (s, si) {
      this.$log('sphereExplore', s, si)
      this.sphereIndex = -1
      this.$router.push('/sphere/' + s.oid).catch(e => e)
    },
    sphereDelete (s, si) {
      this.$log('sphereDelete')
      this.node.spheres = this.node.spheres.filter(i => i.oid !== s.oid)
      this.sphereIndex = -1
    },
    async spheresWSget () {
      this.$log('spheresWSget')
      let name = 'SPHERES-' + this.$store.state.auth.userOid
      let item = await this.$store.dispatch('workspace/get', { name })
      if (item) {
        this.spheresWS = item.spheres
      }
    }
  },
  mounted () {
    this.$log('mounted')
    this.spheresWSget()
  }
}
</script>
