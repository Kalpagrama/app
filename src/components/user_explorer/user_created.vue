<template lang="pug">
kalpa-loader(v-if="sphereOid" :mangoQuery="mangoQuery")
  template(v-slot=`{items,itemsMore}`)
    list-middle(:items="items" :more="itemsMore")
      template(v-slot:itemFirst)
        div(:style=`{height: '110px'}`).row.full-width
        //- create node if items.length === 0
        //- node editor
        q-dialog(
          v-model="nodeEditorOpened" position="bottom"
          @hide="nodeEdited")
          ws-node-editor(
            @close="nodeEdited"
            @published="nodePublished"
            :value="node"
            :style=`{
              maxWidth: '800px',
              maxHeight: $q.screen.height-60+'px',
              minHeight: $q.screen.height-60+'px',
            }`)
        div(
          v-if="itsMe && items.length === 0"
          :style=`{
            height: '400px',
            borderRadius: $store.state.ui.borderRadius+'px',
            overflow: 'hidden',
            marginBottom: '40px',
          }`
          ).row.full-width.items-center.content-center.justify-center.b-60
          span.text-white {{$t('no nodes created', 'Вы еще не создали ни одного ядра')}}
          .row.full-width.items-center.content-center.justify-center.q-py-sm
            q-btn(
              @click="createNodeStart()"
              color="green" no-caps
              :style=`{height: '50px', width: '240px',}`)
              span(:style=`{fontSize: '18px'}`).q-ml-md {{$t('Create node', 'Создать ядро')}}
      //- nodes
      template(v-slot:item=`{item, index, indexMiddle}`)
        node(
          ctx="list" layout="PIP"
          :node="item" :index="index" :essence="true"
          :needFull="index >= indexMiddle-1 && index <= indexMiddle+1"
          :visible="index >= indexMiddle-1 && index <= indexMiddle+1"
          :active="nodeListActive && index === indexMiddle"
          :mini="false")
      //- item last for padding
      template(v-slot:itemLast)
        div(:style=`{height: '400px'}`).row.full-width
</template>

<script>
// import { LstCollectionEnum as RxCollectionEnum } from 'src/system/rxdb/lists'
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
