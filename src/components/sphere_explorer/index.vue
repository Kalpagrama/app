<style lang="stylus">
.q-header {
  background: none !important;
}
.q-footer {
  background: none !important;
}
.mejs__playpause-button {
  display: none !important
}
iframe {
  width: 100% !important;
  height: 100% !important;
}
</style>
<template lang="pug">
q-layout(view="HHh lpR fFf").bg-grey-3
  //- header
  q-header(reveal).row.full-width.items-center.justify-center
    div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width.bg-grey-3
      h6(v-if="sphere" :style=`{}`).text-black.q-pa-xs.q-ma-xs {{ sphere.name }}
      //- .col
      //- q-btn(round flat icon="more_vert")
  q-footer(reveal).row.full-width.justify-center
    k-menu-mobile(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width
  //- body nodes
  q-page-conainter.row.full-width.items-start.content-start.justify-center
    //- spheres
    div(:style=`{marginTop: '60px'}`).row.full-width.justify-center.q-px-md
      div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width.items-start.content-start
        div(v-if="false").row.full-width.q-pa-sm
          span {{$t('Similar spheres')}}
        div(
          v-for="(s, si) in spheres" :key="s.oid"
          v-if="si < 20"
          @click="sphereClick(s, si)"
          :style=`{borderRadius: '10px'}`
          ).bg-grey-4.q-px-sm.q-py-xs.q-mr-sm.q-mb-sm.cursor-pointer.ksphere
          span(:style=`{whiteSpace: 'nowrap'}`) {{`${s.name}` | cut(50)}}
    div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width.q-px-sm
      node-loader(v-if="sphereOid" ref="nodeLoader" :variables="variables" type="sphereNodes")
        template(v-slot:default=`{nodes, fetchingMore}`)
          node-list(:nodes="nodes" :nodesBan="[]" @nodeClick="nodeClick")
</template>

<script>
// TODO: horizontal scroll of sphereSpheres
export default {
  name: 'sphereExplorer',
  props: [],
  data () {
    return {
      sphere: null,
      spheres: []
    }
  },
  computed: {
    sphereOid () {
      return this.$route.params.oid
    },
    variables () {
      return {
        oid: this.sphereOid
      }
    }
  },
  watch: {
    $route: {
      immediate: true,
      async handler (to, from) {
        this.$log('$route CHANGED', to)
        if (to.params.oid) {
          this.sphere = await this.sphereLoad(to.params.oid)
          this.spheres = await this.spheresLoad(to.params.oid)
        }
      }
    }
  },
  methods: {
    nodeClick (val) {
      this.$log('nodeClick', val)
      this.$router.push('/node/' + val[0].oid)
    },
    sphereClick (s, si) {
      this.$log('sphereClick', s, si)
      this.$router.push(`/sphere/${s.oid}`)
    },
    async sphereLoad (oid) {
      this.$log('sphereLoad start', oid)
      let sphere = await this.$store.dispatch('objects/get', { oid, fragmentName: 'sphereFragment', priority: 0 })
      this.$log('sphereLoad done', sphere)
      return sphere
    },
    async spheresLoad (oid) {
      this.$log('spheresLoad start', oid)
      let pagination = {pageSize: 100}
      let filter = null
      let sortStrategy = 'HOT'
      let spheres = await this.$store.dispatch('lists/sphereSpheres', { oid, pagination, filter, sortStrategy })
      // let { data: { sphereSpheres: { items: spheres } } } = await this.$apollo.query({
      //   query: gql`
      //     query sphereSpheresSphereExplorer ($oid: OID!){
      //       sphereSpheres (sphereOid: $oid, pagination: {pageSize: 500}, sortStrategy: HOT) {
      //         items {
      //           oid
      //           name
      //         }
      //       }
      //     }
      //   `,
      //   variables: {
      //     oid: oid
      //   }
      // })
      this.$log('spheresLoad done', spheres)
      return spheres
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

<style lang="stylus" scoped>
.ksphere:hover {
  background: #4caf50 !important;
  color: white !important;
}
</style>
