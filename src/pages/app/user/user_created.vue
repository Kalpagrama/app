<template lang="pug">
q-page(:style=`{paddingTop: '8px', paddingBottom: '200px'}`).row.full-width.justify-center
  div(:style=`{maxWidth: '800px'}`).row.full-width.items-start.content-start
    kalpa-loader(v-if="sphereOid" :mangoQuery="mangoQuery")
      template(v-slot=`{items,itemsMore}`)
        list-middle(:items="items" :more="itemsMore" :itemStyles=`{marginBottom: '50px',}`)
          template(v-slot:item=`{item,itemIndex,isActive,isVisible}`)
            node-lite(:node="item" :isActive="isActive" :isVisible="isVisible")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'userCreated',
  props: {
  },
  data () {
    return {
      nodeEditorOpened: false,
      node: null,
      nodeListActive: true,
    }
  },
  computed: {
    itsMe () {
      return this.$route.params.oid === this.$store.getters.currentUser().oid
    },
    progress () {
      // this.$logW('todo !!!!')
      // return this.$store.state.events.progressCreateNode
      return 100
    },
    sphereOid () {
      // return this.$store.getters.currentUser.oid
      return this.$route.params.oid
    },
    mangoQuery () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_NODES,
          oidSphere: this.sphereOid,
          oidAuthor: {$eq: this.sphereOid},
          sortStrategy: 'AGE',
        }
      }
    }
  },
  watch: {
    // '$store.state.events.progressCreateNode': {
    //   handler (to, from) {
    //     this.$log('progressCreateNode CHANGED', to)
    //     if (to && to.progress === 100 && to.action === 'CREATE' && to.oid) {
    //       // this.$router.push({params: {oid: to.oid}}).catch(e => e)
    //       this.$store.commit('events/stateSet', ['progressCreateNode', null])
    //     }
    //   }
    // }
    nodeEditorOpened: {
      handler (to, from) {
        this.$log('nodeEditorOpened TO', to)
        if (to) this.nodeListActive = false
        else this.nodeListActive = true
      }
    }
  },
  methods: {
    async createNodeStart () {
      this.$log('createNodeStart')
      this.$store.commit('ui/stateSet', ['active', false])
      let nodeInput = {
        name: '',
        wsItemType: 'WS_NODE',
        items: [],
        spheres: [],
        category: 'FUN',
        layout: 'PIP',
        stage: 'draft'
      }
      this.$log('nodeInput', nodeInput)
      let item = await this.$rxdb.set(RxCollectionEnum.WS_NODE, nodeInput)
      this.$log('nodeAddStart item', item)
      this.node = item
      this.nodeEditorOpened = true
    },
    nodeEdited () {
      this.$log('nodeEdited')
      this.$store.commit('ui/stateSet', ['active', true])
      this.nodeEditorOpened = false
      this.node = null
    },
    async nodePublished () {
      this.$log('nodePublished')
      this.nodeEdited()
      // await this.$wait(200)
      // this.$router.push(`/user/${this.$store.getters.currentUser().oid}`).catch(e => e)
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
