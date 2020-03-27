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
  //- input find/add
  div(
    v-if="mode === 'edit'"
    :style=`{overflow: 'hidden', borderRadius: '10px'}`
    ).row.full-width
    q-input(
      v-model="sphere"
      placeholder="Find or add sphere"
      filled dark color="green"
      @keyup.enter="sphereAdd"
      :style=`{}`).fit.bg-grey-8
  //- spheres WS
  div(
    v-if="false && mode === 'edit' && sphere.length > 0"
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
    //- span(
    //-   v-if="mode === 'watch'"
    //-   :style=`{textTransform: 'capitalize', borderRadius: '10px', overflow: 'hidden'}`
    //- ).q-pa-sm.q-mr-sm.q-mb-sm.text-white.bg-green {{ categoryHuman(node.category) }}
    span(
      v-for="(s, si) in spheres" :key="si"
      :class=`{'full-width': si === sphereIndex}`
      :style=`{
        position: 'relative', color: 'white', borderRadius: '10px', userSelect: 'none',
        overflow: 'hidden', whiteSpace: 'nowrap'}`
      ).bg-grey-8.q-pa-sm.q-mr-sm.q-mb-sm {{ s.name }}
      //- INACTIVE sphere
      div(
        v-if="si !== sphereIndex" @click="sphereClick(s,si)"
        :style=`{position: 'absolute', top: '0px', left: '0px', zIndex: 200}`
        ).row.fit.cursor-pointer
      //- ACTIVE sphere
      div(
        v-if="si === sphereIndex"
        :style=`{height: '60px'}`
        ).row.full-width.items-end.content-end
        q-btn(round flat dense color="red" icon="delete_outline" @click="sphereDelete(s,si)")
        .col
        q-btn(
          push color="green" no-caps @click="sphereExplore(s, si)"
          :style=`{borderRadius: '10px', overflow: 'hidden'}`) Explore
</template>

<script>
export default {
  name: 'nodeSpheresEditor',
  props: {
    node: {type: Object},
    mode: {type: String, default () { return 'watch' }}
  },
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
    }
  },
  methods: {
    categoryHuman (type) {
      return this.categories.find(i => i.type === type).name
    },
    sphereClick (s, si) {
      this.$log('sphereClick', s, si)
      if (this.mode === 'watch') {
        this.sphereExplore(s, si)
      }
      if (this.mode === 'edit') {
        this.sphereIndex = si
      }
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
      // this.sphereIndex = -1
      this.$emit('explore', s)
      // this.$router.push('/sphere/' + s.oid).catch(e => e)
    },
    sphereDelete (s, si) {
      this.$log('sphereDelete')
      if (!confirm('Delete sphere?')) return
      this.sphereIndex = -1
      this.node.spheres = this.node.spheres.filter(i => i.oid !== s.oid)
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
    if (this.ctx === 'edit') {
      this.spheresWSget()
    }
  }
}
</script>
