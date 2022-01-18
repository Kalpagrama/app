<style lang="sass">
.note-item
  cursor: pointer
  &:hover
    background: rgba(30,30,30,0.8) !important
</style>

<template lang="pug">
.column.fit
  //- header
  slot(name="header")
  //- body
  div(:style=`{position: 'relative',}`).col.full-width.scroll
    guest-guard(
      v-if="$store.getters.isGuest")
    nodata-guard(v-else-if="!itemsRes || !itemsRes.items.length"
      icon="filter_tilt_shift"
      :title="$t('Здесь пока ничего нет')"
      :message="$t('Всё что Вы сохраните в заметки появится здесь')"
      iconColor="grey"
      backgroundColor="rgba(35,35,35,0)"
    )
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
        slot(name="draft" :draft="d")
          small.text-white {{ d.name }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import guestGuard from './view_guest.vue'
import nodataGuard from 'src/components/kalpa_guard/nodata_guard'

export default {
  name: 'pageDraftsRoot',
  props: ['contentKalpa', 'player'],
  components: {
    guestGuard,
    nodataGuard
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
          'items.layers.contentOid': this.contentKalpa.oid
          // 'items.0.layers.0.contentOid': this.contentKalpa.oid
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
    this.itemsRes = await this.$rxdb.find(this.query)
    // alert(this.itemsRes.items.length)
  }
}
</script>
