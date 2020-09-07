<style lang="sass" scoped>
.subscription
  &:hover
    background: rgb(50,50,50)
</style>

<template lang="pug">
q-page(:style=`{paddingTop: '8px', paddingBottom: '200px', minHeight: '100vh'}`).row.full-width.justify-center
  div(:style=`{maxWidth: '800px'}`).row.full-width.items-start.content-start
    kalpa-loader(:mangoQuery="mangoQuery" :sliceSize="1000")
      template(v-slot=`{items,next}`)
        .row.full-width.items-start.content-start
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
  name: 'userExplorer-userFollowers',
  props: ['subscribers', 'oid'],
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
          rxCollectionEnum: RxCollectionEnum.LST_SUBSCRIBERS,
          oidSphere: this.sphereOid,
        }
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
