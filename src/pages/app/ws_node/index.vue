<template lang="pug">
.row.full-width.justify-center
  kalpa-finder(
    @item="itemFound"
    :workspaceFilter="['WS_BOOKMARK']"
    :typesFilter="['VIDEO', 'IMAGE']"
    :style=`{
      maxWidth: $store.state.ui.pageWidth+'px',
      //- width: $q.screen.width+'px',
      height: $q.screen.height+'px',
    }`)
    template(v-slot:header)
      div(:style=`{height: '60px'}`).row.full-width.items-center.content-center
        .col
          span(:style=`{fontSize: '18px'}`).text-white.text-bold.q-ml-md Выбрать контент
        q-btn(round flat color="white" icon="clear" @click="$router.back()").q-mr-sm
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'wsNode',
  components: {
    // nodeEditor: () => import('components/node_editor/index.vue'),
  },
  data () {
    return {
      searchString: '',
      node: null,
      nodeNew: {
        name: '',
        description: '',
        items: [],
        spheres: [],
        category: 'FUN',
        layout: 'VERTICAL',
        wsItemType: 'WS_NODE',
        thumbUrl: '',
      }
    }
  },
  watch: {
    // '$route.params.id': {
    //   immediate: true,
    //   async handler (to, from) {
    //     this.$log('id TO', to)
    //     if (to) {
    //       if (to === 'new') {
    //         // this.$q.notify({type: 'positive', position: 'top', message: 'Creating new node'})
    //         this.node = JSON.parse(JSON.stringify(this.nodeNew))
    //         var unwatch = this.$watch(
    //           'node',
    //           async (_from, _to) => {
    //             this.$log('node _TO', to)
    //             // create node...
    //             if (unwatch) unwatch()
    //             let nodeInput = JSON.parse(JSON.stringify(this.node))
    //             let node = await this.$rxdb.set(RxCollectionEnum.WS_NODE, nodeInput)
    //             this.$router.replace(`/workspace/node/${node.id}`)
    //           },
    //           {
    //             deep: true,
    //           }
    //         )
    //       }
    //       else {
    //         let item = await this.$rxdb.get(RxCollectionEnum.WS_NODE, to)
    //         this.$log('FOUND node', item)
    //         if (item) this.node = item
    //         else this.$router.push('/workspace/nodes')
    //       }
    //     }
    //   }
    // },
  },
  methods: {
    itemFound (item) {
      this.$log('itemFound', item)
      this.contentKalpaFound(item)
    },
    contentKalpaFound (contentKalpa) {
      this.$log('contentKalpaFound', contentKalpa)
      this.$router.replace('/content/' + contentKalpa.oid)
    }
  },
  mounted () {
    this.$log('mounted')
    this.$store.commit('ui/stateSet', ['mobileNavigationShow', false])
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.$store.commit('ui/stateSet', ['mobileNavigationShow', true])
  }
}
</script>
