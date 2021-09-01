<template lang="pug">
//- kalpa-layout()
  template(v-slot:header)
    .row.full-width.justify-center.b-30
      q-input(
        v-model="searchString"
        dark borderless
        placeholder="Type something..."
        :style=`{
          padding: '10px',
          maxWidth: $store.state.ui.pageWidth+'px',
          fontWeight: 'bold',
          fontSize: '20px',
        }`).full-width
  template(v-slot:footer)
    .row.full-width.justify-center.b-30
      q-input(
        v-model="searchString"
        dark borderless
        placeholder="Type something..."
        :style=`{
          padding: '10px',
          maxWidth: $store.state.ui.pageWidth+'px',
          fontWeight: 'bold',
          fontSize: '20px',
        }`).full-width
      .row.full-width
        q-btn(round color="green" size='xl')
  template(v-slot:body)
    .row.full-width.justify-center
      div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width.items-start.content-start
        div(v-for="i in 100" :key="i").row.full-width.q-pa-md.text-red
          .row.full-width {{ i }}
          .row.full-width
            small.text-grey-6 {{ $store.state.ui.viewportHeight }} / {{ $store.state.ui.viewportOffsetTop }}
kalpa-layout
  template(v-slot:footer)
    kalpa-menu-mobile(v-if="$q.screen.lt.md")
  template(v-slot:body)
    .row.full-width.items-start.content-start
      //- header
      .row.full-width.justify-center.b-30.q-pt-sm.q-px-sm
        div(:style=`{position: 'relative', maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
          div(
            :style=`{
              height: '60px', borderRadius: '10px',
            }`
            ).row.full-width.items-center.content-center.justify-between.q-pa-sm.b-40
            q-icon(name="notifications_none" color="white" size="30px").q-mx-sm
            div(
              @click="headerClick()"
              ).col
              .row.full-width.items-center.content-center.justify-center
                span(
                  :style=`{fontSize: '18px', userSelect: 'none'}`
                  ).text-bold.text-white {{$t('Activity')}}
            q-btn(round flat color="white" icon="more_vert")
      .row.full-width.justify-center.q-pt-sm.q-px-sm
        //- guest
        div(
          v-if="$store.getters.isGuest"
          :style=`{maxWidth: 600+'px'}`).row.full-width.items-center.content-center.justify-center
          .row.full-width.justify-center
            q-icon(name="login" color="grey-8" size="100px")
          div(:style=`{textAlign: 'center'}`).row.full-width.justify-center
            span.text-white {{$t('You will see your notifications')}}
          .row.full-width.justify-center.q-pt-md
            q-btn(
              outline color="white" no-caps
              :style=`{
                height: '50px',
              }`
              @click="$store.commit('ui/stateSet', ['authGuard', {message: null}])"
            )
              h1.text-white {{$t('Login')}}
        //- user
        list-feed(
          v-if="!$store.getters.isGuest && sphereOid"
          :query="query"
          nextSize=25
          :itemMiddlePersist="false"
          screenSize=100
          :itemStyles=`{
            paddingBottom: '8px',
          }`
          :style=`{
            maxWidth: $store.state.ui.pageWidth+'px',
          }`)
          template(v-slot:item=`{item,itemIndex,isActive,isVisible}`)
            notification-item(
              :notification="item"
              :notificationIndex="itemIndex"
              :isActive="isActive"
              :isVisible="isVisible")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import notificationItem from './notification_item.vue'

export default {
  name: 'pageApp__notifications',
  components: {
    notificationItem,
  },
  data () {
    return {
      searchString: ''
    }
  },
  computed: {
    sphereOid () {
      return this.$store.getters.currentUser ? this.$store.getters.currentUser.oid : null
    },
    query () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_FEED,
          oidSphere: this.sphereOid
        },
        populateObjects: false,
      }
    }
  },
  methods: {
    headerClick () {
      this.$store.commit('ui/stateSet', ['listFeedGoToStart', true])
    }
  },
}
</script>
