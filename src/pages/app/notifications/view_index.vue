<template lang="pug">
q-page(
  :style=`{paddingTop: '8px', paddingBottom: '200px'}`
  ).row.full-width.justify-center.q-px-sm
  kalpa-loader(
    v-if="sphereOid"
    :immediate="true" :query="query" :limit="100" v-slot=`{items,next}`)
    div(
      :style=`{maxWidth: $store.state.ui.pageWidth+'px'}`
      ).row.full-width.items-start.content-start
      div(
        v-for="(n,ni) in items" :key="n.id"
        v-if="n.subject && n.object"
        :style=`{
          position: 'relative',
          minHeight: '60px', borderRadius: '10px', overflow: 'hidden',
          background: 'rgb(35,35,35)',
        }`
        ).row.full-width.items-center.content-center.q-px-sm.q-pb-sm.q-pt-sm.q-mb-sm
        //- timestamp
        div(:style=`{position: 'absolute', top: '8px', right: '8px', zIndex: 100,}`).row
          //- .col
          small.text-grey-8 {{ $date(n.createdAt) }}
        div(
          v-for="(i,ii) in n.card.items" :key="ii"
          ).row.full-width
          div(
            v-if="typeof i === 'object'"
            ).row.full-width
            router-link(
              :to="objectLink(i)"
              :style=`{borderRadius: '10px',}`).row.items-center.content-center.b-40
              img(
                draggable="false"
                :src="i.thumbUrl"
                :style=`{
                  height: '40px',
                  objectFit: 'cover',
                  borderRadius: '10px',
                  //- width: '40px',
                }`)
              .col.q-px-sm
                span.text-white {{ i.name }}
          div(
            v-if="typeof i === 'string'"
            ).row.q-pa-sm
            span.text-white {{ i }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp_notifications_viewHome',
  data () {
    return {
    }
  },
  computed: {
    sphereOid () {
      return this.$store.getters.currentUser() ? this.$store.getters.currentUser().oid : null
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
    objectLink (i) {
      let m = {
        NODE: '/node/',
        USER: '/user/',
        WORD: '/sphere/',
        SENTENCE: '/sphere/',
        JOINT: '/joint/'
      }
      return m[i.type] + i.oid
    }
  }
}
</script>
