<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-header(reveal)
    .row.full-width.justify-center.q-px-sm.q-pt-sm
      div(:style=`{position: 'relative', maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width
        div(:style=`{height: '60px',borderRadius: '10px', overflow: 'hidden',}`
          ).row.full-width.items-center.content-center.b-40.q-px-sm
          q-btn(
            @click="$router.back()"
            round flat color="white" icon="keyboard_arrow_left")
          q-icon(name="link" color="white" size="30px").q-mr-sm.q-my-xs
          div(:style=`{overflowX: 'auto'}`).col
            span(:style=`{fontSize: '18px', whiteSpace: 'nowrap'}`).text-white.text-bold {{ title }}
          kalpa-follow(v-if="link" :oid="$route.params.oid")
  q-page-container
    q-page(:style=`{paddingTop: '20px', paddingBottom: '400px'}`).row.full-width.justify-center
      div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width
        link-feed(v-if="link" :link="link")
        .row.full-width.justify-center.q-pt-xl
          //- .row.full-width.justify-center
            span.text-white Something similar... links from items...
          .row.full-width.q-pr-sm
            masonry(
              :cols="5"
              :gutter="{default: 10}").full-width.q-pr-sm
              div(
                v-for="n in 10" :key="n"
                :style=`{
                  position: 'relative',
                  height: 0, paddingBottom: '150%',
                }`).row.full-width.q-pa-xs.q-mb-md
                div(
                  :style=`{
                    position: 'absolute',
                    borderRadius: '10px', overflow: 'hidden',
                  }`
                  ).row.fit.items-center.content-center.justify-center.b-40
                  small.text-white link {{ n }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp_link',
  data () {
    return {
      link: null
    }
  },
  computed: {
    title () {
      if (this.link) {
        if (this.link.jointType === 'ASSOCIATIVE') return 'Associations'
        else return this.link.name
      }
      else return ''
    }
  },
  watch: {
    '$route.params.oid': {
      deep: true,
      immediate: true,
      async handler (to, from) {
        this.$log('$route.params.oid TO', to)
        if (to) {
          this.link = await this.$rxdb.get(RxCollectionEnum.OBJ, to)
        }
      }
    },
  },
}
</script>
