<style lang="sass" scoped>
.subscription
  &:hover
    background: rgb(90,90,90)
</style>

<template lang="pug">
div(
  :style=`{
    position: 'relative',
    borderRadius: '10px',
    overflow: 'hidden',
  }`
  ).column.full-width.fit.b-50
  //- header
  div(:style=`{height: '100px'}`).row.full-width.items-center.content-center.q-px-md
    .col
      .row.fit.items-center.content-center.q-px-sm
        span(:style=`{fontSize: '16px',}`).text-white.text-bold {{$t('Subscriptions', 'Подписки')}}
    q-btn(
      @click="editing = !editing"
      round flat
      :color="editing ? 'green' : 'grey-6'"
      :icon="editing ? 'check' : 'edit'")
  //- body
  .col.full-width.scroll
    .row.full-width.items-start.content-start
      kalpa-loader(:mangoQuery="mangoQuery")
        template(v-slot=`{items,itemsMore}`)
          .row.full-width.items-start.content-start
            div(
              v-for="(s,si) in items" :key="s.oid"
              :style=`{
                position: 'relative',
                height: '50px',
                borderRadius: $store.state.ui.borderRadius+'px'
              }`
              ).row.full-width.items-center.content-center.q-px-md.cursor-pointer.subscription
              .col.full-height
                div(v-if="s.type === 'SENTENCE' || s.type === 'WORD'").row.fit.items-center.content-center
                  //- div(:style=`{}`)
                  q-btn(
                    round flat dense color="white"
                    :style=`{borderRadius: '50%',}`)
                    q-icon(name="blur_on" color="white" size="30px")
                  div(@click="subscriptionClick(s,si)").col.q-px-sm
                    span.text-white {{ s.name }}
                div(v-if="s.type === 'USER'").row.fit.items-center.content-center
                  img(@click="subscriptionClick(s,si)" :src="s.thumbUrl" :style=`{width: '36px', height: '36px', borderRadius: '50%',}`)
                  div(@click="subscriptionClick(s,si)").col.q-px-sm
                    span.text-white {{ s.name }}
              q-btn(
                v-if="editing"
                @click="subscriptionDelete(s,si)"
                round flat dense color="white" icon="clear"
                :style=`{}`).q-mr-xs
</template>

<script>
import { UserApi } from 'src/api/user'
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'homeExplorer-menuRight',
  data () {
    return {
      editing: false,
    }
  },
  computed: {
    mangoQuery () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SUBSCRIPTIONS,
          oidSphere: this.$store.getters.currentUser().oid,
        }
      }
    }
  },
  methods: {
    async subscriptionClick (s, si) {
      this.$log('subscriptionClick', s, si)
      let typesMap = {
        USER: '/user/',
        SENTENCE: '/sphere/',
        WORD: '/sphere/',
        NODE: '/node/'
      }
      if (!typesMap[s.type]) return
      this.$router.push(typesMap[s.type] + s.oid).catch(e => e)
    },
    async subscriptionDelete (s, si) {
      this.$log('subscriptionDelete', s, si)
      if (!confirm(`Unsubscribe from ${s.name} ?`)) return
      try {
        let res = await UserApi.unSubscribe(s.oid)
        this.$log('subscriptionDelete res', res)
        this.$q.notify({message: 'Unsubscribed', type: 'negative'})
      }
      catch (e) {
        this.$log('subscriptionDelete error', e)
        this.$q.notify({message: e.message || 'ERROR', type: 'negative'})
      }
    },
    subscriptionsEdit () {
      this.$log('subscriptionsEdit')
    }
  }
}
</script>
