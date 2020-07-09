<style lang="sass" scoped>
.subscription
  &:hover
    background: rgb(90,90,90)
</style>

<template lang="pug">
kalpa-loader(:mangoQuery="mangoQuery" :sliceSize="1000")
  template(v-slot=`{items, itemsMore}`)
    .row.full-width.justify-center
      div(:style=`{maxWidth: '600px', paddingTop: '110px',}`).row.full-width.items-start.content-start
        div(
          v-for="(s,si) in items" :key="s.oid"
          :style=`{
            position: 'relative',
            height: '40px',
            borderRadius: $store.state.ui.borderRadius+'px'
          }`
          ).row.full-width.items-center.content-center.q-px-md.cursor-pointer.subscription.b-50.q-mb-xs
          img(@click="subscriptionClick(s,si)" :src="s.thumbUrl" :style=`{width: '30px', height: '30px', borderRadius: '50%',}`)
          div(@click="subscriptionClick(s,si)").col.q-px-sm
            span.text-white {{ s.name }}
</template>

<script>
import { UserApi } from 'src/api/user'
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'userExplorer-userFollowing',
  props: ['subscriptions', 'oid'],
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
          oidSphere: this.sphereOid,
        }
      }
    }
  },
  methods: {
    async subscriptionClick (s, si) {
      this.$log('subscriptionClick', s, si)
      this.$router.push('/user/' + s.oid)
    },
    subjectClick (s) {
      this.$logD('subjectClick')
      switch (s.type) {
        case 'VIDEO':
        case 'AUDIO':
        case 'BOOK':
        case 'IMAGE': {
          this.$router.push(`/content/${s.oid}`)
          break
        }
        case 'USER': {
          if (this.oid === s.oid) break
          else this.$router.push(`/user/${s.oid}`)
          break
        }
        case 'SPHERE': {
          this.$router.push(`/sphere/${s.oid}`)
          break
        }
        case 'NODE': {
          this.$router.push(`/node/${s.oid}`)
          break
        }
      }
    }
  }
}
</script>
