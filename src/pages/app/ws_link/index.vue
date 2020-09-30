<template lang="pug">
.row.full-width
  //- h1.text-white wsLink {{link}}
  div(v-if="link").row.full-width
    q-input(
      v-model="link.name"
      filled dark dense color="grey-6"
      ).full-width.br
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp_wsLink',
  data () {
    return {
      link: null,
      linkNew: {
        name: '',
        items: [],
        wsItemType: 'WS_JOINT',
        // leftItem: null,
        // rightItem: null,
      }
    }
  },
  watch: {
    '$route.params.id': {
      immediate: true,
      async handler (to, from) {
        this.$log('id TO', to)
        if (to) {
          if (to === 'new') {
            this.$q.notify({type: 'positive', position: 'top', message: 'Creating new link'})
            this.link = JSON.parse(JSON.stringify(this.linkNew))
            var unwatch = this.$watch(
              'link',
              async (_from, _to) => {
                this.$log('link TO', to)
                // create node...
                if (unwatch) unwatch()
                let linkInput = JSON.parse(JSON.stringify(this.link))
                let link = await this.$rxdb.set(RxCollectionEnum.WS_JOINT, linkInput)
                this.$router.replace(`/workspace/link/${link.id}`)
              },
              {
                deep: true,
              }
            )
          }
          else {
            let {items: [item]} = await this.$rxdb.find({
              selector: {
                rxCollectionEnum: RxCollectionEnum.WS_JOINT,
                id: to
              }
            })
            this.$log('FOUND link', item)
            this.link = item
          }
        }
      }
    },
  },
  mounted () {
    this.$log('mounted')
    this.$store.commit('ui/stateSet', ['showMobileNavigation', false])
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.$store.commit('ui/stateSet', ['showMobileNavigation', true])
  }
}
</script>
