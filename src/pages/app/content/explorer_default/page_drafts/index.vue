<template lang="pug">
div(
  :style=`{
    position: 'relative',
    paddingTop: '0px',
  }`
  ).row.full-width.items-start.content-start.justify-center
  div(:style=`{maxWidth: 600+'px'}`).row.full-width
    slot
    .row.full-width.items-center.content-center.justify-between.q-pa-sm
      span.text-grey-7.text-bold.q-ml-sm Заметки {{ itemsRes ? itemsRes.totalCount === 0 ? '' : '- ' + itemsRes.totalCount : '' }}
      .col
      q-btn(
        @click="drop()"
        outline color="red" no-caps dense) Drop
      q-btn(
        @click="prev()"
        outline color="white" no-caps dense) Prev
      q-btn(
        @click="next()"
        outline color="white" no-caps dense) Next
      //- q-btn(
        round flat color="grey-7" icon="tune")
      kalpa-menu-actions(
        icon="tune" color="grey-7"
        :actions="itemsActions")
    div(
      v-if="itemsRes"
      ).row.full-width.q-px-md
      div(
        v-for="(i,ii) in items" :key="ii"
        :style=`{
          minHeight: '40px',
        }`
        ).row.full-width.items-center.content-center.q-mb-sm
        //- node name
        .row.full-width
          span.text-white {{ i.name }}
        //- figure footer
        .row.full-width
          small(
            v-if="contentKalpa.type === 'VIDEO'"
            ).text-grey-7.q-mr-xs {{ $time(i.items[0].layers[0].figuresAbsolute[0].t) }}
          .col
          small.text-grey-7 {{ $date(i.createdAt) }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import groupItem from '../page_nodes/group_item.vue'

export default {
  name: 'pageDrafts',
  props: ['contentKalpa', 'player', 'node'],
  components: {
    groupItem
  },
  data () {
    return {
      searchString: '',
      nodes: [],
      itemsRes: null,
      itemsSortBy: 'FIGURE', // FIGURE, CREATED_AT, UPDATED_AT, NAME, LENGTH
    }
  },
  computed: {
    items () {
      if (!this.itemsRes) return []
      let items = this.itemsRes.items
      return items.sort((a, b) => {
        if (this.itemsSortBy === 'FIGURE') {
          return a.items[0].layers[0].figuresAbsolute[0].t - b.items[0].layers[0].figuresAbsolute[0].t
        }
        if (this.itemsSortBy === 'CREATED_AT') {
          return a.createdAt - b.createdAt
        }
        else {
          return a.createdAt - b.createdAt
        }
      })
    },
    itemsActions () {
      return {
        sortByFigure: {
          name: 'Sort by figure',
          cb: () => {
            this.$log('sortByFigure')
            this.itemsSortBy = 'FIGURE'
          }
        },
        sortByCreatedAt: {
          name: 'Sort by creation date',
          cb: () => {
            this.$log('sortByCreatedAt')
            this.itemsSortBy = 'CREATED_AT'
          }
        },
        // deleteAll: {}
        // publishAll: {}
      }
    },
    query () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_NODE,
          'items.0.layers.0.contentOid': this.contentKalpa.oid
        },
        sort: [
          {updatedAt: 'desc'},
          // {'items.0.layers.0.figuresAbsolute.0.t': 'desc'}
        ],
        // limit: 1000
      }
      // add name filter
      // if (this.searchString.length > 0) {
      //   let nameRegExp = new RegExp(this.searchString, 'i')
      //   res.selector.name = {$regex: nameRegExp}
      // }
      return res
    }
  },
  methods: {
    async prev () {
      this.$log('prev')
      if (this.itemsRes && this.itemsRes.hasPrev) {
        await this.itemsRes.prev()
      }
    },
    async next () {
      this.$log('next')
      if (this.itemsRes && this.itemsRes.hasNext) {
        await this.itemsRes.next()
      }
    },
    async drop () {
      this.$log('drop')
      this.itemsRes.setProperty('currentId', null)
      await this.itemsRes.gotoCurrent()
    },
    nodeActions (n) {
      return {
        edit: {
          name: 'Редактировать',
          cb: () => {
            this.nodeClick(n)
          }
        },
        delete: {
          name: 'Удалить',
          color: 'red',
          cb: async () => {
            if (confirm('Удалить?')) {
              this.$log('draftDelete', n)
              await n.remove(true)
            }
          }
        }
      }
    },
    nodeClick (n, ni) {
      this.$log('nodeClick', n, ni)
      this.$emit('node', n)
    },
    nodesUpdated (nodes) {
      this.$log('nodesUpdated', nodes)
      this.nodes = [...nodes].sort((a, b) => {
        return a.items[0].layers[0].figuresAbsolute[0].t - b.items[0].layers[0].figuresAbsolute[0].t
      })
      let figures = nodes.reduce((acc, node) => {
        node.items.map(i => {
          if (i.layers) {
            if (i.layers[0].contentOid === this.contentKalpa.oid) {
              let figureInput = i.layers[0].figuresAbsolute[0]
              acc.push([figureInput])
            }
          }
        })
        return acc
      }, [])
      this.figures = figures
      this.player.setState('points', figures)
    }
  },
  async mounted () {
    this.$log('mounted')
    this.itemsRes = await this.$rxdb.find(this.query, true)
  }
}
</script>
