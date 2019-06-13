<template lang="pug">
.column.fit.bg-white
  //- header
  div(style=`height: 60px; borderBottom: 1px solid #eee`).row.full-width.items-center
    .col
      .row.fit.items-center.q-px-sm
        h6(v-if="sphere").q-ma-xs {{ `#${sphere.name}` }}
    div(style=`height: 60px; minWidth: 60px`).row.items-center.justify-center.q-px-sm
      //- q-btn(round flat icon="search")
      q-btn(round flat :icon=`sphereSpheresShow ? 'keyboard_arrow_up' : 'keyboard_arrow_down'` @click="sphereSpheresShow = !sphereSpheresShow")
      q-btn(round flat icon="more_vert")
        q-menu()
          div(style=`minWidth: 150px`).column.fit
            div(style=`height: 50px; borderBottom: 1px solid #eee`).row.full-width.items-center.q-px-sm
              span Подписаться
            div(style=`height: 50px; borderBottom: 1px solid #eee`).row.full-width.items-center.q-px-sm
              span Поделиться
            div(style=`height: 50px; borderBottom: 1px solid #eee`).row.full-width.items-center.q-px-sm
              span Сохранить
  //- spheres find
  //- div(v-if="sphereSpheresShow" style=`height: 60px`).row.items-end.full-width.q-px-sm
  //-   q-input(v-model="search" filled :placeholder="sphere.name" label="Найти сферу").full-width.q-px-xs
  //-     template(v-slot:append)
  //-       q-btn(round flat icon="clear" v-if="search.length > 0" @click="search = ''")
  //- sphere spheres
  div(v-show="sphereSpheresShow" style=`minHeight: 40px; borderBottom: 1px solid #eee; overflowY: hidden` body-scroll-lock-ignore).row.full-width.q-pa-sm.scroll
    //- rows
    div(
      v-for="(r, ri) in 3" :key="ri"
      style=`height: 40px`).row.full-width.no-wrap
      //- spheres
      div(
        v-for="(s, si) in spheres" :key="s.oid" v-if="spheresShow(ri, si)"
        @click="sphereClick(s, si)" v-touch-hold="$event => sphereHold(s, si, $event)"
        style=`borderRadius: 4px`
        :class=`{'bg-grey-3': s.oid !== $route.query.sphere, 'bg-grey-5': s.oid === $route.query.sphere}`
        ).row.items-center.q-pa-xs.q-ma-xs.bg-grey-3.hr.cursor-pointer
        span {{ `#${s.name}` }}
  //- sphere nodes
  div(body-scroll-lock-ignore).col.scroll.bg-grey-3
    apollo-query(v-if="!loading && sphere" :query="query" :variables="variables" @result="handleResult" :deep="true")
      template(v-slot="{ result: { loading, error, data } }")
        //- loading
        div(v-if="loading" style=`height: 100px`).row.full-width.items-center.justify-center
            q-spinner(size="50px" color="primary" :thickness="2")
        //- error
        div(v-else-if="error" style=`height: 100px`).row.full-width.items-center.justify-center
          span {{ error }} : (
        //- items
        template(v-else-if="data && data.sphereNodes")
          node-card(v-for="(n, ni) in data.sphereNodes.items" :key="n.oid" :node="getNode(n)")
        //- nothing
        div(v-else style=`height: 100px;`).row.full-width.items-center.justify-center
          q-spinner(size="50px" :thickness="2" color="primary")
    //- swithing spheres
    div(v-else).row.fit.items-center.justify-center
      q-spinner(size="50px" :thickness="2" color="primary")
</template>

<script>
import nodeCard from 'components/node/node_card'

export default {
  name: 'pageApp__Sphere',
  components: { nodeCard },
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
      let rl = Math.ceil(this.spheres.length / 3)
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
