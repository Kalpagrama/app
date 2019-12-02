<template lang="pug">
div(
  ).row.fit
  k-colls(v-if="coll" @coll="coll = $event" :coll="coll" :colls="colls" :header="false" :tabs="true" :style=`{height: height+'px'}`).bg-grey-3
    template(v-slot:[coll])
      k-page
        node-loader(:query="query" queryKey="sphereNodes" :variables="variables()")
          template(v-slot:default=`{items}`)
            .row.full-width
              div(:style=`{paddingBottom: '60px'}`).row.full-width.items-start.content-start.q-px-sm
                template(
                  v-for="(n, ni) in items").row.full-width
                  node(
                    @nodeNameClick="nodeNameClick" :key="n.oid"
                    :style="n.oid === nodeOid ? nodeStyles : {}"
                    :index="ni" :node="n" :opened="n.oid === nodeOid").q-mb-xl.ontop
                  div(
                    v-if="n.oid === nodeOid" :key="n.oid+'e'"
                    :style=`{height: nodeStyles.height, borderRadius: '10px', overflow: 'hidden'}`
                    ).row.full-width.bg-grey-3.q-mb-xl
              div(
                v-if="nodeOid"
                v-touch-swipe:down="swipeDown"
                @click.self="nodeHide()"
                :style=`{position: 'absolute', zIndex: 10000}`).row.fit.bg-grey-3
  //- div(
  //-   v-if="nodeOid"
  //-   v-touch-swipe:down="swipeDown"
  //-   @click.self="nodeHide()"
  //-   :style=`{position: 'absolute', zIndex: 2000, opacity: tintOpacity, '-webkit-transform': 'translate3d(0,0,0)'}`).row.fit.bg-red
</template>

<script>
// TODO: long click on category(sphere) opens menu to manage subs
// TODO: keep-alive k-colls friend nodes to make next coll visible
// TODO: what happens with scroll
// TODO: save scroll position of the page TRENDS, HOME, and maybe in node_tape

import categories from './categories'
import node from './node'

export default {
  name: 'pageApp__hot',
  components: { categories, node },
  props: ['width', 'height'],
  data () {
    return {
      coll: undefined,
      nodeOid: undefined,
      nodeRect: null,
      nodeStyles: {
        position: 'absolute',
        zIndex: 100000,
        top: 0,
        width: 0,
        height: 0
      },
      tintOpacity: 0
    }
  },
  computed: {
    // query () {
    //   return gql`
    //     query sphereNodes ($sphereOid: OID!, $pagination: PaginationInput!, $filter: Filter, $sortStrategy: SortStrategyEnum) {
    //       sphereNodes (sphereOid: $sphereOid, pagination: $pagination, filter: $filter, sortStrategy: $sortStrategy) {
    //         count
    //         totalCount
    //         nextPageToken
    //         items {
    //           oid
    //           type
    //           thumbUrl (preferWidth: 600)
    //           createdAt
    //           name
    //           meta {
    //             ...on MetaNode {
    //               layout
    //               fragments { uid width height color thumbUrl(preferWidth: 600) }
    //             }
    //           }
    //         }
    //       }
    //     }
    //   `
    // },
    categories () {
      return this.$store.state.node.categories.reduce((acc, val) => {
        acc[val.type] = val
        return acc
      }, {})
    },
    categoryName () {
      let category = this.$route.params.category
      if (category) {
        let name = this.categories[category].name
        return `#${name.charAt(0).toUpperCase() + name.slice(1)}`
      } else {
        return this.$t('Catagories')
      }
    },
    sphereOid () {
      if (this.$route.params.category) return this.categories[this.$route.params.category].sphere.oid
      else return false
    },
    colls () {
      return this.$store.state.node.categories.map((c, ci) => {
        c.id = c.sphere.oid
        return c
      })
    }
  },
  methods: {
    nodeNameClick (n, rect) {
      this.$logD('nodeNameClick', n, rect)
      this.nodeRect = rect
      this.nodeStyles.height = rect.height + 'px'
      this.nodeStyles.width = rect.width + 'px'
      this.nodeStyles.maxWidth = rect.width + 'px'
      this.nodeStyles.top = rect.top - 50 + 'px'
      this.nodeOid = n.oid
      this.$tween.to(this.nodeStyles, 0.6, {
        top: '0px',
        onComplete: () => {
          this.$log('nodeShow DONE')
        }
      })
      this.$tween.to(this, 0.6, {tintOpacity: 1})
    },
    nodeHide () {
      this.$log('nodeHide start')
      this.$tween.to(this.nodeStyles, 0.6, {
        top: (this.nodeRect.top - 50) + 'px',
        onComplete: () => {
          this.$log('nodeHide DONE')
          this.nodeOid = undefined
        }
      })
      this.$tween.to(this, 0.6, {tintOpacity: 0})
    },
    swipeDown (e) {
      this.$log('swipeDown', e)
      this.nodeHide()
    },
    variables (sort) {
      return {
        sphereOid: this.coll,
        pagination: { pageSize: 100 },
        sortStrategy: sort || 'HOT',
        filter: { types: 'NODE' }
      }
    }
  },
  created () {
    this.$log('created')
    this.coll = this.colls[0].id
  }
}
</script>

<style lang="stylus">
.onback {
  -webkit-transform: translate3d(0,0,1px);
  transform: translate3d(0,0,1px);
}
.ontop {
  -webkit-transform: translate3d(0,0,100px) !important;
  transform: translate3d(0,0,100px) !important;
}
</style>
