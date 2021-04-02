<style lang="sass">
.note-item
  cursor: pointer
  &:hover
    background: rgba(30,30,30,0.8) !important
</style>

<template lang="pug">
.column.fit
  //- header
  .row.full-width.q-pa-md
    span.text-white.text-bold {{$t('Drafts')}}
  //- body
  div(:style=`{position: 'relative',}`).col.full-width.scroll
    view-guest(
      v-if="$store.getters.isGuest()")
    div(
      v-else-if="itemsRes"
      ).row.full-width.items-strat.content-start.justify-center.q-px-sm
      div(
        v-for="(d,di) in itemsRes.items" :key="d.id"
        :style=`{
          position: 'relative',
          background: 'rgba(30,30,30,0.5)',
          borderRadius: '10px',
          minHeight: '40px',
        }`
        @click="$emit('draft', d)"
        ).row.full-width.items-center.content-center.q-pa-sm.note-item.q-mb-sm
        small.text-white {{ d.name }}
        slot(name="draft" :draft="d")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import viewGuest from './view_guest.vue'

export default {
  name: 'pageDraftsRoot',
  props: ['contentKalpa', 'player'],
  components: {
    viewGuest
  },
  data () {
    return {
      searchString: '',
      itemsSelectedKey: null,
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
      if (this.searchString.length > 0) {
        let nameRegExp = new RegExp(this.searchString, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
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
    }
  },
  async mounted () {
    this.$log('mounted')
    this.itemsRes = await this.$rxdb.find(this.query, true)
  }
}
</script>
