<template lang="pug">
.row.fit.justify-center
  div(style=`maxWidth: 1130px`).row.fit.justify-start.q-px-md
    //- left menu
    slot(name="menu")
    //- body
    .col.full-height.q-px-md.q-py-md
      .column.fit
        //- sphere header + spheres
        div(style=`borderRadius: 8px`).row.full-width.justify-center.bg-white.q-mb-md
          div(style=`height: 60px`).row.full-width.items-center.no-wrap.q-px-sm.scroll
            h6(v-if="sphere" style=`white-space: nowrap`).q-ma-xs {{`#${sphere.name}`}}
          div(v-show="sphereSpheresShow"
            style=`minHeight: 40px; borderBottom: 1px solid #eee; overflowY: hidden`
            ).row.full-width.q-pa-sm.scroll
            //- rows
            div(
              v-for="(r, ri) in getRows" :key="ri"
              style=`height: 40px`).row.full-width.no-wrap
              //- spheres
              div(
                v-for="(s, si) in spheres" :key="s.oid" v-if="spheresShow(ri, si)"
                @click="sphereClick(s, si)" v-touch-hold="$event => sphereHold(s, si, $event)"
                style=`borderRadius: 4px`
                :class=`{'bg-grey-3': s.oid !== $route.query.sphere, 'bg-grey-5': s.oid === $route.query.sphere}`
                ).row.items-center.q-pa-xs.q-ma-xs.bg-grey-3.hr.cursor-pointer
                span(style=`white-space: nowrap`) {{ `#${s.name}` }}
        //- body
        .col.scroll
          k-feed(v-if="!loading && sphere" :query="query" :variables="variables" :mini="true" queryKey="sphereNodes")
          //- swithing spheres
          div(v-else).row.fit.items-center.justify-center
            q-spinner(size="50px" :thickness="2" color="primary")
    //- right menu
    div(style=`position: relative; width: 280px; maxHeight: 100%`).column.full-height.q-py-md
      div(style=`position: fixed; width: 240px; height: 800px`).row
        div(style=`borderRadius: 8px`).row.fit.items-center.justify-center.bg-white
          q-icon(name="flash_on")
          span Some popular
</template>

<script>
import nodeCard from 'components/node/node_card'
import kMenu from 'pages/app/menu'
import kFeed from 'components/kFeed'

export default {
  name: 'pageApp__Sphere',
  components: { nodeCard, kFeed, kMenu },
  data () {
    return {
      loading: false,
      search: '',
      sphere: null,
      sphereHolding: false,
      spheresSelected: [],
      spheres: [],
      sphereSpheresShow: true,
      query: gql`
        query sphereNodes($oid: OID!) {
          sphereNodes (sphereOid: $oid, pagination: {pageSize: 5}) {
            totalCount
            items {
              oid
              type
              thumbUrl (preferWidth: 600)
              createdAt
              name
            }
            nextPageToken
          }
        }
      `
    }
  },
  computed: {
    variables () {
      return {
        oid: this.$route.query.sphere
      }
    },
    getRows () {
      if (this.spheres.length <= 4) {
        return 1
      } else if (this.spheres.length <= 8) {
        return 2
      } else {
        return 3
      }
    }
  },
  watch: {
    '$route': {
      deep: true,
      immediate: true,
      async handler (to, from) {
        this.$log('$route CHANGED', to)
        if (to.query.sphere) {
          // TODO: check for from !== value
          this.sphereLoad(to.query.sphere)
          this.spheresLoad(to.query.sphere)
        } else {
          let sphereLast = localStorage.getItem('zspherelast')
          if (sphereLast) this.$router.push({query: {sphere: sphereLast}})
          else this.$router.push({query: {sphere: 'AYedgFVAIYQ='}})
        }
      }
    }
  },
  methods: {
    handleResult (e) {
      this.$log('handleResult', e)
      let {data: {sphereNodes: {items}}} = e
      items.map((i) => {
        this.$log('i.oid', i.oid)
      })
      // this.$log('items', items)
    },
    getNode (n) {
      // this.$log('getNode', n)
      return {visible: true, ...n}
    },
    sphereHold (s, si) {
      this.$log('sphereHold', s, si)
      this.$q.notify({message: `Holding ${s.name}`})
      if (this.sphereHolding) {
        // purge selected spheres
        // set again sphere holdin
        // this.sphereHolding = true
      } else {
        // this.sphereHolding = true
      }
    },
    sphereClick (s, si) {
      this.$log('sphereClick', s, si)
      if (this.sphereHolding) {
      } else {
        this.$router.push({query: { sphere: s.oid }})
        localStorage.setItem('zspherelast', s.oid)
      }
    },
    async sphereLoad (oid) {
      this.$log('sphereLoad start', oid)
      this.loading = true
      await this.$wait(500)
      let { data: { objectList: sphereFull } } = await this.$apollo.query({
        query: gql`
          query sphereLoad ($oid: OID!) {
            objectList (oids: [$oid]) {
              oid
              type
              name
            }
          }
        `,
        variables: {
          oid: oid
        }
      })
      this.loading = false
      // this.$log('sphereLoad done', sphereFull[0])
      this.$set(this, 'sphere', sphereFull[0])
    },
    spheresShow(ri, si) {
      // ri
      let l = this.spheres.length
      let rl = Math.ceil(this.spheres.length / this.getRows)
      if (ri === 0) {
        return si < (ri + 1) * rl
      } else {
        return si < (ri + 1) * rl && si >= (ri) * rl
      }
    },
    async spheresLoad (oid) {
      this.$log('spheresLoad start', oid)
      let { data: { sphereSpheres: { items } } } = await this.$apollo.query({
        query: gql`
          query sphereSpheres ($oid: OID!){
            sphereSpheres (sphereOid: $oid, pagination: {pageSize: 500}) {
              items {
                oid
                name
              }
            }
          }
        `,
        variables: {
          oid: oid
        }
      })
      // this.$log('spheresLoad done', items)
      this.$set(this, 'spheres', items)
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
