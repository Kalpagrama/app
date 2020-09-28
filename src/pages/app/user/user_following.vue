<style lang="sass" scoped>
.subscription
  &:hover
    background: rgb(50,50,50)
</style>

<template lang="pug">
q-page(:style=`{paddingTop: '8px', paddingBottom: '200px', minHeight: '100vh'}`).row.full-width.justify-center
  div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width.items-start.content-start
    kalpa-loader(:query="mangoQuery" :limit="1000" v-slot=`{items,next}`)
      .row.full-width.items-start.content-start.q-px-sm
        div(
          v-for="(s,si) in items" :key="s.oid"
          :style=`{
            position: 'relative',
            height: '50px',
            borderRadius: '10px',
            overflow: 'hidden'
          }`
          ).row.items-center.content-center.q-px-md.cursor-pointer.subscription.b-40.q-mb-sm.q-mr-sm
          div(
            v-if="s.type === 'USER'"
            @click="subscriptionClick(s)"
            ).row.fit.items-center.content-center
            img( :src="s.thumbUrl" :style=`{width: '30px', height: '30px', borderRadius: '50%',}`).q-mr-sm
            span.text-white {{ s.name }}
          div(
            v-if="s.type === 'WORD'"
            @click="subscriptionClick(s)"
            ).row.fit.items-center.content-center
            q-icon(name="blur_on" color="white" size="30px").q-mr-sm
            span.text-white {{ s.name }}
          div(
            v-if="s.type === 'NODE'"
            @click="subscriptionClick(s)"
            ).row.fit.items-center.content-center
            q-icon(name="filter_tilt_shift" color="white" size="30px").q-mr-sm
            span.text-white {{ s.name }}
          div(
            v-if="s.type === 'VIDEO' || s.type === 'IMAGE'"
            @click="subscriptionClick(s)"
            ).row.fit.items-center.content-center
            q-icon(name="select_all" color="white" size="30px").q-mr-sm
            div(:style=`{overflow: 'hidden'}`).col
              span(:style=`{whiteSpace: 'nowrap'}`).text-white {{ s.name }}
</template>

<script>
import { UserApi } from 'src/api/user'
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'userExplorer-userFollowing',
  data () {
    return {
    }
  },
  computed: {
    sphereOid () {
      return this.$route.params.oid
    },
    mangoQuery () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SUBSCRIPTIONS,
          populateObjects: false,
          oidSphere: this.sphereOid,
        }
      }
    }
  },
  methods: {
    async subscriptionClick (s) {
      this.$log('subscriptionClick', s)
      switch (s.type) {
        case 'VIDEO':
        case 'AUDIO':
        case 'BOOK':
        case 'IMAGE': {
          this.$router.push(`/content/${s.oid}`)
          break
        }
        case 'USER': {
          this.$router.push(`/user/${s.oid}`)
          break
        }
        case 'WORD': {
          this.$router.push(`/sphere/${s.oid}`)
          break
        }
        case 'NODE': {
          this.$router.push(`/node/${s.oid}`)
          break
        }
      }
    },
  }
}
</script>
