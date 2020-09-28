<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-header(reveal)
    .row.full-width.justify-center.b-30
      div(:style=`{position: 'relative', maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width.b-30.br
        div(:style=`{height: '50px'}`).row.full-width.items-center.content-center.justify-between.q-px-md
  q-page-container
    q-page(style="padding-top: 100px")
      .row.full-width.justify-center
        div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px', paddingBottom: '1000px',}`).row.full-width.items-start.content-start
          q-tab-panels(
            v-model="pageId"
            swipeable infinite animated
            :style=`{padding: 0, margin: 0, background: 'none'}`).fit
            q-tab-panel(name="created" :style=`{padding: 0, margin: 0, background: 'none'}`)
              user-created()
            q-tab-panel(name="voted" :style=`{padding: 0, margin: 0, background: 'none'}`)
              user-voted()
            q-tab-panel(name="following" :style=`{padding: 0, margin: 0, background: 'none'}`)
              user-subscriptions(:oid="$route.params.oid" :style=`{paddingTop: '80px',}`)
            q-tab-panel(name="followers" :style=`{padding: 0, margin: 0, background: 'none'}`)
              user-followers()
      //- pages
      q-page-sticky(expand position="top")
        .row.full-width.justify-center.b-30
          div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width.q-px-md
            q-tabs(v-model="pageId" no-caps dense active-color="white" align="left" switch-indicator).text-grey-8
              q-tab(v-for="t in pages" :key="t.id" :name="t.id" :label="t.name")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp__user',
  data () {
    return {
      user: null,
      pageId: 'created',
    }
  },
  computed: {
    pages () {
      return [
        {id: 'created', name: this.$t('Nodes', 'Ядра')},
        {id: 'voted', name: this.$t('Votes', 'Голоса')},
        {id: 'following', name: this.$t('Subscriptions', 'Подписки')},
        {id: 'followers', name: this.$t('Subscribers', 'Подписчики')},
      ]
    }
  },
  watch: {
    '$route.params.oid': {
      immediate: true,
      async handler (to, from) {
        this.$log('$route.params.oid TO', to)
        if (to) {
          this.user = await this.$rxdb.get(RxCollectionEnum.OBJ, to)
        }
      }
    },
  }
}
</script>
