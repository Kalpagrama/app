<template lang="pug">
kalpa-layout
  template(v-slot:header=`{scrollTop}`)
    //nav-tabs(:user="user" v-if="scrollTop > 226")
  template(v-slot:footer)
    kalpa-menu-mobile(v-if="$q.screen.lt.md && !$store.state.ui.userTyping")
  template(v-slot:body)
    //- followers
    q-dialog(
      v-model="showFollowDialog"
      position="standard"
      :maximized="false"
      @hide="showFollowDialog = null")
      list-following(
        v-if="followersFollowing === 'following'"
        :user="user"
        :useNavHeader="false"
        :scrollAreaHeight="$q.screen.height/2"
        searchInputState="disabled"
        :itemActivePersist="false"
        mode="select").b-30
      list-followers(
        v-if="followersFollowing === 'followers'"
        :user="user"
        :useNavHeader="false"
        :scrollAreaHeight="$q.screen.height/2"
        searchInputState="disabled"
        :itemActivePersist="false"
        mode="select").b-30
    .row.full-width.items-start.content-start.justify-center
      div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
        tab-list-feed(
          v-if="user"
          ref="listFeed"
          :type="'customPPV'"
          :scrollAreaHeight="0"
          searchInputState="disabled"
          :pages="pages"
          :pageId="pageId"
          :query="query"
          :itemHeightApprox="Math.min($store.state.ui.pageWidth, $q.screen.width) * 0.6 + 222"
          :itemActivePersist="true"
          @pageId="pageId = $event"
        ).row.full-width
          template(v-slot:externalHeader)
            nav-header(:user="user" @followers="showFollowDialog=true, followersFollowing='followers'" @following="showFollowDialog=true, followersFollowing='following'")
          template(v-slot:item=`{item,itemState,itemIndex,isActive,isVisible,isPreload, scrolling}`)
            div(
              v-if="pageId === 'votes' && item.votedUserRate"
              :style=`{
              borderRadius: '10px 10px 0 0',
              background: 'rgba(32,32,32)',
              marginBottom: '-10px',
              paddingBottom: '18px',
            }`
            ).row.full-width.items-center.content-center.q-px-sm.q-pt-sm
              img(
                draggable="false"
                :src="user.thumbUrl"
                :style=`{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
              }`).q-mx-sm
              small.text-grey-5.q-mr-xs {{ user.name }} {{$t('проголосовал(а)')}}
              small.text-grey-5 "{{ rateMeta(item.votedUserRate).name }}"
              div(
                :style=`{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: rateMeta(item.votedUserRate).colorBackground,
              }`).row.q-ml-xs.q-mr-sm
            item-feed(
              :itemShortOrFull="item"
              :itemState="itemState"
              :itemIndex="itemIndex"
              :isActive="isActive"
              :isVisible="isVisible"
              :isPreload="isPreload"
              :layout="item.type.in('NODE', 'JOINT', 'BLOCK') ? 'card' : 'line'"
              :scrolling="scrolling").q-pb-xl
</template>

<script>
import { UserApi } from 'src/api/user'
import { RxCollectionEnum } from 'src/system/rxdb'
import listFollowers from 'src/components/kalpa_lists/followers.vue'
import listFollowing from 'src/components/kalpa_lists/following.vue'

import navHeader from './nav_header.vue'
import navTabs from './nav_tabs.vue'

export default {
  name: 'userHome',
  components: {
    navHeader,
    navTabs,
    listFollowers,
    listFollowing
  },
  data () {
    return {
      user: null,
      followersFollowing: null,
      showFollowDialog: false,
      scrollTop: 0,
      pageId: 'nodes'
    }
  },
  computed: {
    scrollAreaHeight () {
      return this.$q.screen.height
    },
    pages () {
      return [
        { id: 'nodes', name: this.$t('Nodes') },
        { id: 'joints', name: this.$t('Joints') },
        { id: 'blocks', name: this.$t('Essence blocks') },
        { id: 'votes', name: this.$t('Votes') }
      ]
    },
    query () {
      let objectTypes
      if (this.pageId === 'all') {
        objectTypes = ['VIDEO', 'IMAGE', 'BOOK', 'NODE', 'BLOCK', 'USER', 'JOINT', 'WORD', 'SENTENCE', 'CHAR']
      } else if (this.pageId === 'nodes') {
        objectTypes = ['NODE']
      } else if (this.pageId === 'joints') {
        objectTypes = ['JOINT']
      } else if (this.pageId === 'blocks') {
        objectTypes = ['BLOCK']
      } else if (this.pageId === 'contents') {
        objectTypes = ['VIDEO', 'IMAGE', 'BOOK']
      } else if (this.pageId === 'users') {
        objectTypes = ['USER']
      } else if (this.pageId === 'spheres') {
        objectTypes = ['WORD', 'SENTENCE', 'CHAR']
      } else if (this.pageId === 'votes') {
        objectTypes = ['NODE', 'JOINT', 'BLOCK']
      } else throw new Error('bad pageId: ' + this.pageId)

      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          oidSphere: this.user.oid,
          oidAuthor: this.pageId === 'votes' ? { $ne: this.user.oid } : { $eq: this.user.oid },
          objectTypeEnum: { $in: objectTypes },
          // querySearch: this.searchString,
          sortStrategy: 'AGE' // 'ACTIVITY', // AGE
        },
        populateObjects: false
      }
    }
  },
  watch: {
    '$route.params.oid': {
      immediate: true,
      async handler (to, from) {
        if (to) {
          this.user = null
          // await this.$wait(300)
          this.user = await this.$rxdb.get(RxCollectionEnum.OBJ, to)
          // if (!this.$route.params.page) this.$router.replace('nodes')
        }
      }
    }
  },
  methods: {
    rateMeta (val) {
      let rate = this.$rateMeta.find(r => {
        return val > r.valueMin && val <= r.valueMax
      })
      if (rate) return rate
      else return { name: val, color: 'red', colorBackground: 'red' }
    },
    onScroll (e) {
      // this.$log('onScroll', e.position)
      this.scrollTop = e.position
    },
    onBusEvent(ev) {
      this.$refs.listFeed.scrollTo('start')
    }
  },
  mounted () {
    this.$log('mounted')
    this.$eventBus.$on('btn-user-clicked', this.onBusEvent)
  },
  beforeUnmount () {
    this.$log('beforeDestroy')
    this.$eventBus.$off('btn-user-clicked', this.onBusEvent)
  }
}
</script>
