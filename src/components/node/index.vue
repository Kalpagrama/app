<template lang="pug">
.row.full-width
  component(
    :is="$store.state.node.layouts[node.meta.layout].component"
    :index="index" :zIndex="zIndex" @action="nodeAction($event)" :widthWrapper="width" :muted="muted"
    :node="node" :nodeFull="nodeFull" :active="active" :needFull="needFull"
    :noActions="noActions" :noTimestamp="noTimestamp" :noName="noName" :noSpheres="noSpheres")
  k-dialog-bottom(ref="nodeActionDialog" mode="actions" :options="nodeActionOptions" @action="action")
</template>

<script>
import nodeTemplateHoriz from './node_template_horiz'
import nodeTemplateVert from './node_template_vert'
import nodeTemplatePip from './node_template_pip'
import nodeTemplateCards from './node_template_cards'
import kMenuPopup from 'components/k_menu_popup'

export default {
  components: {nodeTemplateHoriz, nodeTemplateVert, nodeTemplatePip, nodeTemplateCards, kMenuPopup},
  name: 'node',
  props: {
    zIndex: {type: Number, default () { return 200 }},
    index: {type: Number, default () { return 0 }},
    node: {type: Object},
    needFull: {type: Boolean},
    nodeFullReady: {type: Object},
    active: {type: Boolean},
    template: {type: String},
    inCreator: {type: Boolean},
    noActions: {type: Boolean},
    noTimestamp: {type: Boolean},
    noName: {type: Boolean},
    noSpheres: {type: Boolean},
    width: {type: Number},
    muted: {type: Boolean}
  },
  data () {
    return {
      nodeFull: null,
      actionFragment: null
    }
  },
  computed: {
    nodeActionOptions () {
      return {
        header: false,
        confirm: true,
        confirmName: 'Создать ядро',
        actions: {
          subscribe: {name: 'Follow'},
          contentExplore: {name: 'Explore content'},
          saveToWorkspace: {name: 'Save to workspace'}
        }
      }
    }
  },
  watch: {
    nodeFullReady: {
      immediate: true,
      handler (to, from) {
        if (to) {
          // this.$log('nodeFullReady CHANGED')
          this.nodeFull = to
          this.$emit('nodeFull', this.nodeFull)
        }
      }
    },
    // нужны данные по полному ядру
    needFull: {
      immediate: true,
      async handler (to, from) {
        if (to === true && !this.nodeFullReady) {
          // this.$log('nodeFull CHANGED', this.node.name)
          this.nodeFull = await this.nodeLoad(this.node.oid)
          this.$emit('nodeFull', this.nodeFull)
        }
      }
    },
  },
  methods: {
    nodeAction ([action, payload]) {
      this.$log('nodeAction', action, payload)
      this.actionFragment = payload
      this.$refs.nodeActionDialog.show()
    },
    action (e) {
      this.$log('action', e)
      switch (e) {
        case 'subscribe': {
          this.$log('SUBSCRIBE')
          break
        }
        case 'contentExplore': {
          this.$log('CONTENT EXPLORE')
          this.$router.push(`/app/content/${this.actionFragment.content.oid}`)
          break
        }
        case 'confirm': {
          this.$log('CONFIRM')
          this.$root.$emit('create')
          break
        }
      }
    },
    nodeBookmark () {
      this.$log('nodeBookmark')
    },
    nodeContent () {
      this.$log('nodeContent')
    },
    nodeFragment () {
      this.$log('nodeFragment')
    },
    async nodeLoad (oid) {
      this.$log('nodeLoad start', this.index, this.node.oid)
      let node = null
      try {
        node = await this.$store.dispatch('objects/get', { oid, fragmentName: 'nodeFragment', priority: 0 })
      } catch (err){
        // this.$log('nodeLoad error', err, this.index, this.node.oid)
        this.$store.dispatch('log/error', ['node', 'nodeLoad error', err])
        node = null
      }
      this.$log('nodeLoad end', this.index, this.node.oid)
      return node
      // let { data: { objectList: [nodeFull] } } = await this.$apollo.query({
      //   query: gql`
      //     query getExtendedNodesProps($oid: OID!) {
      //       objectList(oids: [$oid]) {
      //         oid
      //         type
      //         name
      //         createdAt
      //         ...on Node {
      //           rate
      //           rateUser
      //           viewCnt
      //           author {
      //             oid
      //             type
      //             name
      //             thumbUrl(preferWidth: 50)
      //             __typename
      //           }
      //           spheres {
      //             oid
      //             name
      //           }
      //           categories
      //           fragments {
      //             uid
      //             name
      //             url
      //             content {
      //               oid
      //               type
      //               name
      //               thumbUrl(preferWidth: 600)
      //               ...on Video {
      //                 url
      //                 urlType
      //                 width
      //                 height
      //                 duration
      //               }
      //               ...on Image {
      //                 url
      //               }
      //             }
      //             relativePoints { x y z }
      //             relativeScale
      //           }
      //         }
      //       }
      //     }
      //   `,
      //   variables: {
      //     oid: oid
      //   },
      //   fetchPolicy: 'cache-first'
      // })
      // // this.$log('nodeLoad done', this.index, this.node.name)
      // return nodeFull
    }
  }
}
</script>
