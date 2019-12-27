<template lang="pug">
q-layout(view="hHh lpR fFf" @resize="onResize" @scroll="onScroll").bg-grey-3
  q-header(
    v-if="true"
    reveal
    ).row.full-width.justify-center.q-px-sm.bg-grey-3
    k-colls-tabs(
      :coll="coll" :colls="colls"
      @coll="coll = $event"
      :style=`{maxWidth: $store.state.ui.pageMaxWidth+'px', borderRadius: '0 0 10px 10px'}`).bg-white
  q-footer(reveal).row.full-width.justify-center.bg-grey-3
    k-menu-mobile(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`)
  q-page-conainter
    div(:style=`{position: 'relative', paddingTop: '70px', paddingBottom: '70px'}`).row.full-width.justify-center.items-start.content-start
      div(:style=`{position: 'relative', maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width.items-start.content-start.q-pa-sm
        //- k-colls-new(:coll="coll" :colls="colls" @coll="coll = $event")
          //- template(v-slot:[$route.params.category])
            //- k-colls(@coll="coll = $event" :coll="coll" :colls="colls" :tabs="true" :style=`{height: height+'px'}`).bg-grey-3
        node-loader(v-if="sphereOid" ref="nodeLoader" :variables="variables" type="sphereNodes")
          template(v-slot:default=`{nodes}`)
            node-list(:nodes="nodes" @nodeClick="nodeClick")
</template>

<script>
export default {
  name: 'pageAppTrends',
  props: [],
  data () {
    return {
      width: 0,
      coll: 'FUN',
      // colls: [
      //   {id: 'foryou', name: 'For you'},
      //   {id: 'following', name: 'Following'},
      //   {id: 's1', name: 'How to kill'},
      //   {id: 's2', name: 'How to pill'},
      //   {id: 's3', name: 'How to feel'}
      // ]
    }
  },
  computed: {
    colls () {
      return this.$store.state.node.categories.reduce((acc, val) => {
        acc.push({
          id: val.type,
          name: val.name
        })
        return acc
      }, [])
    },
    categories () {
      return this.$store.state.node.categories.reduce((acc, val) => {
        acc[val.type] = val
        return acc
      }, {})
    },
    sphereOid () {
      if (this.$route.params.category) return this.categories[this.$route.params.category].sphere.oid
      else return false
      // return this.categories.FUN.sphere.oid
      // else return false
    },
    variables () {
      return {
        oid: this.sphereOid,
        pagination: { pageSize: 100 },
        sortStrategy: 'HOT',
        filter: { types: 'NODE' }
      }
    },
  },
  watch: {
    coll: {
      immediate: true,
      handler (to, from) {
        this.$log('coll CHANGED1', to)
        if (to) {
          // if ios safari?
          this.$router.push({params: {category: to}})
        }
      }
    },
    // $route: {
    //   immediate: true,
    //   handler (to, from) {
    //     this.$log('$route CHANGED', to)
    //     if (to.params.category) {
    //       this.coll = to.params.category
    //     } else {
    //       this.coll = 'FUN'
    //       // this.$router.replace({params: {category: 'FUN'}})
    //     }
    //   }
    // }
  },
  methods: {
    nodeClick (val) {
      this.$log('nodeClick', val)
      // this.$store.commit('node/stateSet', ['node', val])
      this.$router.push('/node/' + val[0].oid)
    },
    onScroll (e) {
      // this.$log('onScroll', e)
      // if (this.previewHeight > 0 && e.position >= this.previewHeight) {
      //   this.showNameSticky = true
      // } else {
      //   this.showNameSticky = false
      // }
    },
    onResize (e) {
      this.width = e.width
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
