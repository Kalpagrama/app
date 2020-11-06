<template lang="pug">
.row.full-width.items-start.content-start.justify-center
  kalpa-loader(
    :immediate="true"
    :query="query" :limit="1000")
    template(v-slot=`{items,next,nexting}`)
      masonry(
        :cols="$q.screen.width < $store.state.ui.pageWidth ? 2 : 4"
        :gutter="{default: 0}"
        :style=`{maxWidth: $store.state.ui.pageWidth+'px'}`
        ).full-width.items-start.content-start.justify-start
        div(
          v-for="(node, ii) in items" :key="node.id"
          @mouseenter="nodeOver = node.id"
          @mouseleave="nodeOver = null"
          :style=`{position: 'relative'}`
          ).row.full-width.q-pr-sm.q-mb-sm
          slot(name="tint" :item="node" :itemKey="node.id")
          ws-node-item(
            @click.native="$router.push('/workspace/node/'+node.id)"
            :node="node"
            :style=`{position: 'relative'}`)
          div(:style=`{position: 'absolute', zIndex: 300, top: 0, right: '8px',}`)
            q-btn(
              v-show="$q.screen.width < $store.state.ui.pageWidth ? true : nodeOver == node.id"
              round flat dense icon="more_vert" color="white"
              :style=`{
              }`)
              q-popup-proxy(
                maximized position="bottom" dark
                anchor="top right" self="top right"
                :max-width="$q.screen.width < $store.state.ui.pageWidth ? '100%' : '200px'"
                ).b-40
                div(
                  :style=`{
                    borderRadius: '10px',
                  }`
                  ).row.full-width.items-start.content-start.b-40
                  //- header
                  div(
                    v-if="$q.screen.width < $store.state.ui.pageWidth"
                    ).row.full-width.items-center.content-center.justify-center.q-pa-md
                    q-icon(name="filter_tilt_shift" color="white" size="20px").q-mr-sm
                    span.text-white.text-bold "{{ node.name }}"
                  //- actions
                  q-btn(
                    @click="a.cb(node)"
                    v-for="(a,akey) in actions" :key="akey"
                    flat no-caps
                    :color="a.color || 'white'"
                    :style=`{height: '50px',}`).full-width
                    span {{ a.name }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'wsNodes_typeDrafts',
  props: {
    searchString: {type: String},
  },
  data () {
    return {
      nodeOver: null,
    }
  },
  computed: {
    query () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_NODE
        },
        sort: [{updatedAt: 'desc'}]
      }
      // add name filter
      if (this.searchString.length > 0) {
        let nameRegExp = new RegExp(this.searchString, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      return res
    },
    actions () {
      return {
        edit: {
          name: 'Редактировать',
          cb: (node) => {
            this.$log('edit')
            this.$router.push('/workspace/node/' + node.id)
          }
        },
        goToContext: {
          name: 'Перейти на контент',
          cb: async (node) => {
            this.$log('goToContext')
            if (node.items[0]) {
              this.$router.push('/content/' + node.items[0].layers[0].contentOid)
            }
          }
        },
        moveToCollection: {
          name: 'Добавить в коллекцию',
          cb: (node) => {
            this.$log('moveToCollection...')
            // move to collection
            // go to collection items
          }
        },
        delete: {
          name: 'В корзину',
          color: 'red',
          cb: async (node) => {
            await node.remove()
          }
        }
      }
    }
  },
  methods: {
  }
}
</script>
