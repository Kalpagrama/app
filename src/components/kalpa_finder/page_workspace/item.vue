<style lang="sass" scoped>
.feed-item
  &:hover
    background: rgb(50,50,50) !important
</style>

<template lang="pug">
div(
  :style=`{
    position: 'relative',
    background: 'rgb(35,35,35)',
    borderRadius: '10px',
  }`
  ).row.full-width.items-start.content-start
  //- left side
  div(:style=`{position: 'relative',}`).col.full-height
    slot(name="tint" :item="item")
    //- default
    router-link(
      :to="itemLink"
      ).row.fit
      div(
        :style=`{
          width: '80px', height: '80px',
        }`
        ).row.items-center.content-center.justify-center
        img(
          v-if="!['SPHERE', 'WORD', 'SENTENCE'].includes(item.type)"
          draggable="false"
          :src="item.thumbUrl"
          :style=`{
            borderRadius: '10px',
            objectFit: 'cover',
          }`).fit
        q-icon(
          v-else
          name="blur_on" size="50px" color="white")
      .col
        .row.fit.items-center.content-center.justify-start.q-pa-md
          span(:style=`{zIndex: 102}`).text-white {{ item.name.slice(0, 150) }}
  //- right side
  div().row.full-height.items-center.content-center.justify-center.q-pa-md
    q-btn(
      @click="itemSubscriptionToggle()"
      round flat
      :color="item.isSubscribed ? 'grey-4' : 'grey-9'"
      :icon="item.isSubscribed ? 'notifications_active' : 'notifications_none'")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { UserApi } from 'src/api/user'

export default {
  name: 'kalpaFinder_pageWorkspace_item',
  props: ['item'],
  data () {
    return {
    }
  },
  computed: {
    actions () {
      return {
        delete: {
          name: 'Удалить',
          color: 'red',
          styles: {},
          cb: async () => {
            this.$log('actionDelete', this.item)
            this.$emit('delete')
          }
        }
      }
    },
    itemLink () {
      let itemLinkMap = {
        NODE: '/node/',
        JOINT: '/node/',
        USER: '/user/',
        SPHERE: '/sphere/',
        VIDEO: '/content/',
        IMAGE: '/content/',
        BOOK: '/content/'
      }
      return itemLinkMap[this.item.type] + this.item.oid
    }
  },
  methods: {
    async itemSubscriptionToggle () {
      if (this.item.isSubscribed) {
        await UserApi.unSubscribe(this.item.oid)
        this.item.isSubscribed = false
      }
      else {
        await UserApi.subscribe(this.item.oid)
        this.item.isSubscribed = true
      }
    },
    itemIcon (item) {
      let iconMap = {
        SPHERE: 'blur_on',
        VIDEO: 'select_all',
        IMAGE: 'select_all',
        NODE: 'filter_tilt_shift',
        USER: 'face',
        JOINT: 'link'
      }
      if (item.wsItemType) {
        if (item.wsItemType === 'WS_BOOKMARK') return iconMap[item.type]
        else if (item.wsItemType === 'WS_NODE') return 'filter_tilt_shift'
        else if (item.wsItemType === 'WS_JOINT') return 'link'
        else return 'blur_on'
      }
      else {
        return iconMap[item.type]
      }
    },
  }
}
</script>
