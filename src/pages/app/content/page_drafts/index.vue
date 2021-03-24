<template lang="pug">
div(
  :style=`{
    position: 'relative',
    paddingTop: '0px',
  }`
  ).row.full-width.items-start.content-start.justify-center
  //- body
  div(
    v-if="$store.getters.currentUser().profile.role === 'GUEST'"
    :style=`{maxWidth: 600+'px', minHeight: '500px',}`
    ).row.full-width.items-center.content-center
    .row.full-width.justify-center
      q-icon(name="login" color="grey-8" size="100px")
    div(:style=`{textAlign: 'center'}`).row.full-width.justify-center
      span.text-white {{$t('To create drafts, login')}}
    .row.full-width.justify-center.q-pt-md
      q-btn(
        outline color="white" no-caps
        :to="'/auth/sign-in'"
        :style=`{
          height: '50px',
        }`)
        h1.text-white {{$t('Login')}}
  div(
    v-if="$store.getters.currentUser().profile.role !== 'GUEST'"
    :style=`{maxWidth: 600+'px'}`).row.full-width
    slot
    //- header: stats, actions
    .row.full-width.items-center.content-center.justify-between.q-pa-sm
      span.text-white.text-bold.q-ml-sm {{$t('Drafts')}} {{ itemsRes ? itemsRes.totalCount === 0 ? '' : '- ' + itemsRes.totalCount : '' }}
      .col
      //- q-btn(
      //-   @click="drop()"
      //-   outline color="red" no-caps dense) Drop
      //- q-btn(
      //-   @click="prev()"
      //-   outline color="white" no-caps dense) Prev
      //- q-btn(
      //-   @click="next()"
      //-   outline color="white" no-caps dense) Next
      kalpa-menu-actions(
        icon="tune" color="white"
        :actions="itemsActions")
    //- body
    div(
      v-if="itemsRes"
      ).row.full-width.q-px-md
      draft-item(
        v-for="(i,ii) in items" :key="i.id"
        :item="i" :itemIndex="ii"
        @set-selected="itemsSelectedKey = i.id"
        :isSelected="itemsSelectedKey === i.id"
        :player="player" :contentKalpa="contentKalpa")
      //- add draft now, only for video content
      //- draft-current-time(
        v-if="contentKalpa.type === 'VIDEO'"
        :contentKalpa="contentKalpa"
        :player="player"
        @focused="itemsSelectedKey = null")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import draftItem from './draft_item.vue'
import draftCurrentTime from './draft_current_time.vue'

export default {
  name: 'pageDrafts',
  props: ['contentKalpa', 'player'],
  components: {
    draftItem,
    draftCurrentTime,
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
    }
  },
  async mounted () {
    this.$log('mounted')
    this.itemsRes = await this.$rxdb.find(this.query, true)
    this.$log('$rxdb.find complete')
  }
}
</script>
