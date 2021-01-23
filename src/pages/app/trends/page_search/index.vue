<template lang="pug">
q-page.row.full-width.justify-center.items-start.content-start
  kalpa-finder(
    @contentKalpa="$event => $router.push('/content/'+$event.oid)"
    :searchString="searchString"
    :pagesShow="false"
    :pages=`{
      //- workspace: {views: ['image', 'video', 'node', 'user', 'sphere']},
      kalpagrama: {views: ['all', 'users', 'nodes']},
      //- gif: {views: ['all']},
      //- web: {views: ['all', 'image', 'video',]}
    }`
    :style=`{
      maxWidth: $store.state.ui.pageWidth+'px',
      height: $q.screen.height-130+'px',
    }`)
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'trends_pageSearch',
  props: ['searchString'],
  components: {
    kalpaFinder: () => import('components/kalpa_finder/index.vue'),
  },
  data () {
    return {
    }
  },
  computed: {
  },
  methods: {
    itemLaunch (item) {
      this.$log('itemLaunch', item)
      if (item.wsItemType) {
        confirm('Open in workspace?')
      }
      else {
        let itemLaunchMap = {
          NODE: '/node/',
          JOINT: '/joint/',
          USER: '/user/',
          SPHERE: '/sphere/',
          WORD: '/sphere/',
          SENTENCE: '/sphere/',
          VIDEO: '/content/',
          IMAGE: '/content/'
        }
        let p = itemLaunchMap[item.type]
        this.$log('p', p)
        if (p) {
          this.$router.push(p + item.oid)
        }
      }
    },
  }
}
</script>
