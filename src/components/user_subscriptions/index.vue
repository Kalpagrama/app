<template lang="pug">
div(:style=`{position: 'relative',}`).column.fit
  //- header: navigation
  div(
    v-if="mode === 'standalone'"
    ).row.full-width
  //- header: search
  div(
    ).row.full-width.q-pa-sm
    .col.q-pr-sm
      div(:style=`{position: 'relative', zIndex: 100, borderRadius: '10px', overflow: 'hidden'}`).row.full-width
        q-input(
          v-model="searchString"
          filled dense dark color="white"
          :placeholder="$t('userSubscriptions_findPlaceholder', 'Найти подписку')"
          ).full-width
          template(v-slot:append)
            q-btn(
              v-if="searchString.length > 0"
              @click="searchString = ''"
              flat dense color="white" icon="clear")
            q-btn(flat dense color="white" icon="filter_list")
    q-btn(v-if="!editing" round flat color="white" icon="edit" @click="editing = true").q-mr-xs
    q-btn(v-if="editing" round flat color="green" icon="check" @click="editing = false").q-mr-xs
  //- body
  .col.full-width.scroll
    kalpa-loader(:mangoQuery="mangoQuery" :sliceSize="1000")
      template(v-slot=`{items, itemsMore}`)
        .row.full-width.items-start.content-start.q-px-sm
          div(
            v-for="(s,si) in items" :key="s.oid"
            :style=`{
              position: 'relative',
              height: '50px',
              borderRadius: '10px', overflow: 'hidden',
            }`
            ).row.full-width.items-center.content-center.b-50.q-mb-sm
            .col.full-height
              //- for text: WORK and SENTENCE, they dont have thumbUrl, they got only icon
              div(v-if="s.type === 'SENTENCE' || s.type === 'WORD'").row.fit.items-center.content-center.q-px-sm
                q-btn(
                  round flat dense color="white"
                  :style=`{borderRadius: '50%',}`)
                  q-icon(name="blur_on" color="white" size="30px")
                div(@click="subscriptionClick(s,si)").col.q-px-sm
                  span.text-white {{ s.name }}
              //- for user subscriptions, they got thumbUrl
              div(v-if="s.type === 'USER'").row.fit.items-center.content-center.q-px-sm
                img(@click="subscriptionClick(s,si)" :src="s.thumbUrl" :style=`{width: '36px', height: '36px', borderRadius: '50%',}`)
                div(@click="subscriptionClick(s,si)").col.q-px-sm
                  span.text-white {{ s.name }}
            q-btn(
              v-if="editing"
              @click="subscriptionDelete(s,si)"
              round flat color="red" icon="delete_outline").q-mr-xs
</template>

<script>
import { UserApi } from 'src/api/user'
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'userSubscriptions',
  props: {
    mode: {
      type: String, default () { return 'standalone' },
    },
    oid: {
      type: String
    }
  },
  data () {
    return {
      searchString: '',
      editing: false,
    }
  },
  computed: {
    mangoQuery () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SUBSCRIPTIONS,
          oidSphere: this.oid || this.$store.getters.currentUser().oid,
        }
      }
    }
  },
  methods: {
    subscriptionClick (s, si) {
      this.$log('subscriptionClick', s, si)
      let typesMap = {
        USER: '/user/',
        SENTENCE: '/sphere/',
        WORD: '/sphere/',
        NODE: '/node/'
      }
      if (!typesMap[s.type]) {
        this.$q.notify({type: 'negative', message: 'Unknown subscription type !'})
        return
      }
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
  }
}
</script>
