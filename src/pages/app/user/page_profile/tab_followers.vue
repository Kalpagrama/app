<style lang="sass" scoped>
.subscription
  &:hover
    background: rgb(50,50,50)
</style>

<template lang="pug">
kalpa-loader(
  :immediate="true"
  :query="query" :limit="1000" v-slot=`{items,next,nexting}`)
  div(
    :style=`{
      paddingTop: '16px',
    }`
    ).row.full-width.items-start.content-start.q-px-sm
    div(
      v-for="(s,si) in items" :key="s.oid"
      :style=`{
        position: 'relative',
        height: '50px',
        borderRadius: '10px', overflow: 'hidden',
      }`
      ).row.items-center.content-center.q-px-md.cursor-pointer.subscription.b-40.q-mb-sm.q-mr-sm
      img(@click="subscriptionClick(s,si)" :src="s.thumbUrl" :style=`{width: '30px', height: '30px', borderRadius: '50%',}`)
      div(@click="subscriptionClick(s,si)").col.q-pl-sm
        span.text-white {{ s.name }}
</template>

<script>
import { UserApi } from 'src/api/user'
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'user_profile_followers',
  props: ['user'],
  data () {
    return {
    }
  },
  computed: {
    query () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SUBSCRIBERS,
          oidSphere: this.user.oid,
        },
        populateObjects: false,
      }
    }
  },
  methods: {
    async subscriptionClick (s, si) {
      this.$log('subscriptionClick', s, si)
      this.$router.push('/user/' + s.oid).catch(e => e)
    },
  }
}
</script>
