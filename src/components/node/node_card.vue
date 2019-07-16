<template lang="pug">
div(:style=`{position: 'relative', maxWidth: $store.state.ui.nodeMaxWidth+'px', borderRadius: getRadius+'px'}`).column.items-center.bg-white
  //- node author
  div(style=`height: 60px`).row.full-width.items-center.q-pl-sm
    div(style=`height: 35px; width: 35px; borderRadius: 50%`).row.bg-grey-5.q-ml-xs
    .col.q-px-sm
      div(v-if="nodeFull.author.name.length > 0").row.fit.items-center
        span {{ nodeFull.author.name }}
        //- small.text-red needFull::{{needFull}}
        .row.full-width.items-center
          //- q-icon(name="remove_red_eye" size="14px" color="grey-6").q-mr-xs
          //- small 12114
          small.text-grey-8 {{$date(node.createdAt, 'DD.MM.YYYY HH:mm')}}
      div(v-else).row.full-width
        div(style=`minHeight: 18px; height: 18px; borderRadius: 4px; width: 230px`).row.items-center.bg-grey-3.q-mb-xs
        div(style=`minHeight: 15px; height: 15px; borderRadius: 4px; width: 180px`).row.items-center.bg-grey-3
    //- node to workspace or create from
    div(style=`height: 60px; minWidth: 60px`).row.items-center.justify-center.q-px-sm
      //- q-icon(:name="nodeIcon" round flat dense color="grey-7" size="20px").q-mx-sm
      q-btn(icon="more_vert" round flat color="grey-9").q-mr-xs
        //- TODO: proxy node menu
        q-menu(ref="nmenu" fit anchor="bottom right" self="top right" content-style=`{borderRadius: '8px'}`)
          div(style=`width: 200px; borderRadius: 8px`).row.bg-white
            div(v-for="(m, mi) in menus" :key="mi" @click="menuClick(m, mi), $refs.nmenu.hide()"
              style=`height: 40px`).row.full-width.items-center.hr.cursor-pointer.q-px-md
              span(:style=`{color: m.color}`) {{$t(m.name)}}
  //- node body
  node(:node="node" :nodeFull="nodeFull" :mini="mini" @visible="$event => $emit('visible', $event, index, node, nodeFull)")
    //- node rate
    template(v-slot:rate)
      transition(appear enter-active-class="animated zoomIn" leave-active-class="animated zoomOut")
        div(v-if="rateShow" style=`position: absolute; zIndex: 1000`).row.fit.items-center.justify-center
          div(style=`position: relative`).row.fit.items-center.justify-center
            q-icon(name="favorite" size="400px" color="primary")
            div(style=`position: absolute; zIndex: 1100`).row.fit.items-center.justify-center
              h6.text-white.text-bold {{ rate.name }}
            //- div(style=`position: absolute: zIndex: 2000`).row.full-width.bg-green
            //-   span.text-white rate {{ rate }}
    template(v-slot:actions="{index}")
      //- .row.full-width {{needFull}}
      slot(name="actions" :index="index" :node="node" :nodeFull="nodeFull")
  //- .row.full-width {{needFull}}
  //- node spheres
  div(style=`height: 46px`).row.full-width.items-end.content-end.q-px-md
    div(style=`height: 40px; maxWidth: 100%`).row.full-width.items-center.no-wrap.scroll
      div(v-for="(s, si) in nodeFull.spheres" :key="s.oid" @click="sphereClick(s, si)"
        style=`display: inline-block; height: 30px; borderRadius: 5px`).q-pa-xs.q-mr-sm.bg-grey-3.cursor-pointer.hr
        span(style=`white-space: nowrap`) {{ `#${s.name}` }}
  slot(name="footer" :index="index" :node="node" :nodeFull="nodeFull")
  //- node actions
  div(v-if="!$slots.footer || !$scopedSlots.footer" style=`height: 76px`).row.full-width
    .col
      .row.fit.items-center.justify-start.q-px-sm
        div.row.full-height.items-center
          q-btn(icon="reply_all" round color="grey-8" flat no-caps dense @click="shareClick()").q-ml-xs
    div.row.full-height.items-center.q-pa-sm
      //- span 1233
      //- q-btn(icon="share" size="md" color="grey-8" flat round dense @click="nodeChain()").q-mr-md
      small {{ rate.id }} /
      span.q-mb-xs 3.45
      q-btn(size="lg" color="grey-8" flat round @click="nodeRate()")
        q-icon(name="track_changes" size="40px")
</template>

<script>
import node from 'components/node'
export default {
  name: 'nodeCard',
  components: {node},
  props: {
    index: {type: Number},
    node: {type: Object, required: true},
    needFull: {type: Boolean},
    nodeFullReady: {type: Object},
    workspace: {type: Boolean},
    mini: {type: Boolean}
  },
  data () {
    return {
      nodeFull: {
        oid: null,
        author: {name: ''},
        fragments: [
          {content: { type: 'none', poster: this.node.thumbUrl[0] }},
          {content: { type: 'none', poster: this.node.thumbUrl[1] }}
        ],
        spheres: []
      },
      rate: {id: 1, name: 'Нет', rate: 0.0},
      rateNext: {id: 2, name: 'Cкорее нет', rate: 0.25},
      rateShow: false,
      rates: [
        {id: 1, name: 'Нет', rate: 0.0},
        {id: 2, name: 'Скорее нет', rate: 0.25},
        {id: 3, name: 'Может быть', rate: 0.5},
        {id: 4, name: 'Скорее да', rate: 0.75},
        {id: 5, name: 'Да', rate: 1.0}
      ],
      menus: [
        {id: 'to_node', name: 'to_node', color: 'black'},
        {id: 'to_workspace', name: 'to_workspace', color: 'black'},
        // {id: 'to_chain', name: 'to_chain', color: 'black},
        {id: 'follow', name: 'follow', color: 'black'},
        {id: 'share', name: 'share', color: 'black'},
        {id: 'report', name: 'report', color: 'red'}
      ]
    }
  },
  computed: {
    nodeIcon () {
      let nodeFind = this.$store.state.workspace.workspace.nodes.find(n => this.node.oid === n.oid)
      if (nodeFind) return 'cloud_done'
      else return 'cloud_queue'
    },
    getRadius () {
      if (this.$q.screen.width <= this.$store.state.ui.nodeMaxWidth) return this.$store.state.ui.radiusMobile
      else return this.$store.state.ui.radiusDesktop
    }
  },
  methods: {
    nodeToWorkspace () {
      this.$log('nodeToWorkspace')
      this.$store.commit('workspace/addNode', this.node)
    },
    shareClick () {
      this.$log('shareClick')
      if (navigator.share) {
        navigator.share({
            title: 'Web Fundamentals',
            text: 'Check out Web Fundamentals — it rocks!',
            url: 'https://developers.google.com/web',
        })
          .then(() => this.$log('Successful share'))
          .catch((error) => this.$log('Error sharing', error))
      } else {
        this.$log('Cant share')
        this.$q.notify({
          message: 'Cant share, yet :(',
          color: 'green',
          textColor: 'white'
        })
      }
    },
    sphereClick (s, si) {
      this.$log('sphereClick', s, si)
      // this.$router.push({name: 'sphere', query: {sphere: s.oid}})
    },
    menuClick ({id, name, color}, mi) {
      this.$log('menuClick')
      switch (id) {
        case 'to_node': {
          this.$log('menuClick to_node')
          break
        }
        case 'to_workspace': {
          this.$log('menuClick to_workspace')
          this.nodeToWorkspace()
          break
        }
        case 'follow': {
          this.$log('menuClick to follow')
          break
        }
        case 'share': {
          this.$log('menuClick share')
          break
        }
        case 'report': {
          this.$log('menuClick report')
          break
        }
      }
    },
    nodeClick () {
      this.$log('nodeClick', this.item)
      // this.$router.push({name: 'node'})
    },
    async nodeRate () {
      this.rate = this.rateNext
      this.rateShow = false
      this.rateShow = true
      await this.$wait(500)
      this.rateShow = false
      if (this.rate.id === 5) this.rateNext = this.rates[0]
      else this.rateNext = this.rates[this.rate.id]
      // rate mutation
      let {data: { nodeRate }} = await this.$apollo.mutate({
        mutation: gql`
          mutation nodeRate($oid: OID!, $rate: Float!) {
            nodeRate(oid: $oid, rate: $rate)
          }
        `,
        variables: {
          oid: this.node.oid,
          rate: this.rate.rate
        }
      })
      this.$log('nodeRate', nodeRate)
    },
    nodeChain () {
      this.$log('nodeChain')
      this.$q.notify({
        message: 'Cant chain now :(',
        color: 'green',
        textColor: 'white'
      })
    },
    async nodeLoad () {
      this.$log('nodeLoad start')
      // this.$set(this, 'nodeFull', null)
      let { data: { objectList: nodeFull } } = await this.$apollo.query({
        query: gql`
          query getExtendedNodesProps($oid: OID!) {
            objectList(oids: [$oid]) {
              oid
              type
              name
              ...on Node {
                rate
                # viewCnt
                # rateUser
                author {
                  oid
                  type
                  name
                  thumbUrl(preferWidth: 600)
                  __typename
                }
                spheres {
                  oid
                  name
                }
                fragments {
                  url
                  content {
                    oid
                    type
                    name
                    thumbUrl(preferWidth: 600)
                    ...on Video {
                      url
                      urlType
                    }
                    ...on Image {
                      url
                    }
                  }
                  relativePoints { x y z }
                  relativeScale
                }
              }
            }
          }
        `,
        variables: {
          oid: this.node.oid
        }
      })
      this.$log('nodeFull', nodeFull[0])
      this.$set(this, 'nodeFull', nodeFull[0])
    }
  },
  watch: {
    node: {
      immediate: false,
      deep: true,
      handler (to, from) {
        this.$log('node changed', to)
        if (this.needFull) {
          this.nodeLoad()
        } else {
        }
      }
    },
    needFull: {
      immediate: true,
      handler (to, from) {
        if (to) {
          this.$log('needFull changed', to)
          this.nodeLoad()
        } else {
        }
      }
    }
  },
  async mounted () {
    this.$log('mounted')
    // this.$log('node', this.node)
  }
}
</script>
