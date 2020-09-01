<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-dialog(
    v-model="nodeAddDialogOpened" position="bottom"
    @before-show="nodeActive = false, $store.commit('ui/stateSet', ['showMobileNavigation', false])"
    @before-hide="nodeActive = true, $store.commit('ui/stateSet', ['showMobileNavigation', true])")
    q-layout(view="hHh Lpr lff").b-30
      q-header(reveal)
        .row.full-width.justify-center.b-30
          div(:style=`{maxWidth: '800px',height: '50px',}`).row.full-width.items-center.content-center.q-px-md
            span(:style=`{fontSize: '18px',}`).text-bold.text-white Find node
      q-page-container
        q-page(:style=`{paddingBottom: '200px',}`).row.full-width.justify-center
          div(:style=`{maxWidth: '800px'}`)
            kalpa-loader(:mangoQuery="queryNodeAdd" :sliceSize="1000")
              template(v-slot=`{items, itemsMore}`)
                .row.full-width.items-start.content-start.q-pa-sm
                  div(
                    v-for="(n,ni) in items" :key="n.id"
                    :style=`{height: '100px',borderRadius: '10px', overflow: 'hidden',}`
                    ).row.full-width.items-start.content-start.q-mb-sm.b-50
                    img(:src="n.color" :style=`{height: '100px'}`)
                    .col
                      .row.fit.q-pa-md
                        span.text-bold {{ n.name }}
          q-page-sticky(expand position="bottom" :offset="[0,0]" :style=`{zIndex: 1000}`)
            .row.full-width.justify-center.b-30
              div(:style=`{maxWidth: '800px', height: '50px',}`).row.full-width
                q-btn(round flat color="white" icon="keyboard_arrow_down" @click="nodeAddDialogOpened = false")
                .col
          q-page-sticky(position="bottom-right" :offset="[25,25]" :style=`{zIndex: 2000}`)
            q-btn(
              round push color="green" icon="add" size="lg"
              :style=`{borderRadius: '50%'}`)
  q-header(reveal)
    .row.full-width.justify-center.b-30
      div(:style=`{position: 'relative', maxWidth: '800px'}`).row.full-width.q-pt-sm
        .row.full-width.items-start.content-start
          q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()")
          .col
            div(:style=`{borderRadius: '10px',}`
              ).row.full-width.items-center.content-center.justify-between.b-40.q-pa-xs
              //- q-icon(name="select_all" color="white" size="30px").q-mx-sm
              div(:style=`{overflowX: 'auto'}`).col.q-px-md
                span(:style=`{fontSize: '18px', whiteSpace: 'nowrap'}`).text-white.text-bold Ядро
              //- q-btn(round flat color="grey-8" icon="more_vert")
              q-btn(
                flat no-caps
                :to="`/trends/${categoryOid}`"
                :style=`{fontSize: '16px'}`
                ).text-white.text-bold.q-px-sm {{ categoryName }}
            div(:style=`{paddingLeft: '14px',}`).row.full-width.justify-start
              q-tabs(
                v-model="viewId"
                no-caps dense active-color="white" switch-indicator).text-grey-8
                q-tab(v-for="v in views" :key="v.id" :name="v.id" :label="v.name")
  q-page-container
    q-page(:style=`{paddingTop: '20px', paddingBottom: '400px'}`)
      .row.full-width.items-start.content-start.justify-center
        div(:style=`{maxWidth: '800px'}`).row.full-width.items-start.content-start
          node-lite(
            v-if="node" :node="node" :isActive="nodeActive" :isVisible="nodeVisible"
            v-observe-visibility=`{
              callback: nodeVisibilityCallback,
              intersection: {
                threshold: 0.8
              }
            }`)
          //- actions
          div(
            v-if="node"
            ).row.full-width
            //- q-btn(round flat icon="share" color="white" @click="nodeShare()")
          //- spheres
          div(v-if="node").row.full-width.q-pa-sm
            .row.full-width.items-center.content-center.q-pa-sm
              span.text-bold.text-grey-7 Сферы сути
            router-link(
              v-for="(s,si) in node.spheres" :key="s.oid" :to="'/sphere/'+s.oid"
              :style=`{height: '40px',borderRadius: '10px'}`
              ).row.full-width.items-center.content-center.q-px-sm.b-50
              q-icon(name="blur_on" color="white" size="20px").q-mr-xs
              span.text-white {{ s.name }}
          //- dubug
          .row.full-width.justify-center.q-pa-sm
            span(
              v-if="$store.state.core.progressInfo.CREATE[$route.params.oid]"
              :style=`{fontSize: '200px',}`
              ).text-bold.text-grey-6 {{ $store.state.core.progressInfo.CREATE[$route.params.oid] }}
          router-view(v-if="node" :node="node")
      q-page-sticky(
        v-if="node"
        position="bottom" :offset="[0, 60]")
        q-btn(
          @click="nodeAddStart()"
          no-caps color="green" icon="add"
          ) Добавить ядро
      q-page-sticky(
        expand position="bottom" :style=`{zIndex: 100}`)
        .row.full-width.justify-center.b-30
          div(:style=`{maxWidth: '800px', height: '50px', paddingLeft: '50px', paddingRight: '50px',}`).row.full-width
            q-tabs(
              :value="$route.name" @input="$router.replace({name: $event})"
              no-caps active-color="white"
              ).fit.text-grey-8
              q-tab(name="nodes" label="Ядра")
              q-tab(name="chains" label="Связи")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { NodeApi } from 'src/api/node'
import { date } from 'quasar'
import { shareWith } from 'src/system/services'

export default {
  name: 'pageApp__node',
  meta () {
    return {
      title: this.node?.name,
    }
  },
  data () {
    return {
      node: null,
      nodeActive: true,
      nodeVisible: true,
      nodeCategories: [],
      nodeAddDialogOpened: false,
      viewId: 'nodes',
    }
  },
  computed: {
    views () {
      return [
        {id: 'nodes', name: this.$t('pageApp_node_viewNodes_title', 'Ядра')},
        {id: 'chains', name: this.$t('pageApp_node_viewChains_title', 'Связи')}
      ]
    },
    createdAt () {
      if (this.node) {
        return date.formatDate(this.node.createdAt, 'DD.MM.YYYY')
      }
      return ''
    },
    category () {
      if (!this.node) return null
      return this.nodeCategories.find(c => c.type === this.node.category)
    },
    categoryName () {
      return this.category?.alias
    },
    categoryOid () {
      return this.category?.sphere.oid
    },
    queryNodeAdd () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_NODE,
          stage: 'draft'
        },
        sort: [{updatedAt: 'desc'}]
      }
    }
  },
  watch: {
    '$route.params.oid': {
      deep: true,
      immediate: true,
      async handler (to, from) {
        this.$log('$route.params.oid TO', to)
        if (to) {
          if (this.$store.state.core.progressInfo.CREATE[to]) {
            var unwatch = this.$watch(
              '$store.state.core.progressInfo.CREATE',
              (valOld, valNew) => {
                if (valNew) {
                  this.$log('CREATE valOld/valNew', valOld, valNew[to])
                  if (valNew[to] === 100) {
                    this.$q.notify({
                      type: 'positive',
                      position: 'top',
                      message: this.$t('wsNodeEditor_nodeSendToPublication', 'Ядро готово!')
                    })
                    this.nodeLoad(to)
                    unwatch()
                    this.$store.commit('core/stateSet', ['progressInfo', {UPLOAD: {}, CREATE: {}}])
                  }
                }
                else {
                  if (unwatch) unwatch()
                }
              },
              {
                immediate: true,
                deep: true
              }
            )
          }
          else {
            this.nodeLoad(to)
          }
        }
      }
    },
    '$route.query.creating': {
      deep: true,
      immediate: true,
      async handler (to, from) {
        this.$log('$route.query.creating TO', to)
        if (to) {
          // confirm('Node is creating !' + to)
        }
      },
    },
  },
  methods: {
    nodeShare () {
      this.$log('nodeShare')
      // is can be shared ???
      shareWith(this.node)
    },
    nodeAddStart () {
      this.$log('nodeAddStart')
      this.nodeAddDialogOpened = true
    },
    nodeVisibilityCallback (isVisible, entry) {
      // this.$log('nodeVisibilityCallback', isVisible, entry)
      if (isVisible) {
        this.nodeActive = true
      }
      else {
        this.nodeActive = false
      }
    },
    async nodeLoad (oid) {
      this.$log('nodeLoad', oid)
      this.node = await this.$rxdb.get(RxCollectionEnum.OBJ, oid)
      this.nodeCategories = await this.$rxdb.get(RxCollectionEnum.GQL_QUERY, 'nodeCategories')
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
