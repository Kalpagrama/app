<template lang="pug">
div(:style=`{
  height: $store.state.ui.width+180+'px',
  maxWidth: $store.state.ui.width+'px'}`
  ).column.full-width.q-mt-xs.q-mb-sm.bg-white.q-px-md.bg-grey-1
  //- node author
  div(style=`height: 60px`).row.full-width.items-center.q-pl-sm
    div(style=`height: 35px; width: 35px; borderRadius: 50%`).row.bg-grey-3.q-ml-xs
    .col.q-px-sm
      div(v-if="nodeFull.author.name.length > 0").row.fit.items-center
        span {{ nodeFull.author.name }}
        .row.full-width.items-center
          q-icon(name="remove_red_eye" size="14px" color="grey-6").q-mr-xs
          small 12114
          small.text-grey-8.q-ml-sm yesterday
      div(v-else).row.full-width
        div(style=`minHeight: 18px; height: 18px; borderRadius: 4px; width: 230px`).row.items-center.bg-grey-3.q-mb-xs
        div(style=`minHeight: 15px; height: 15px; borderRadius: 4px; width: 180px`).row.items-center.bg-grey-3
    div(style=`height: 60px; width: 60px`).row.items-center.justify-center
      q-btn(icon="more_vert" color="grey-8" flat round dense)
  //- node body
  node(:node="node" :nodeFull="nodeFull" :types="getTypes")
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
  //- node spheres
  div(style=`height: 46px`).row.full-width.items-end.content-end.q-px-md
    div(style=`height: 40px; maxWidth: 100%`).row.full-width.items-center.no-wrap.scroll
      div(v-for="(s, si) in nodeFull.spheres" :key="s.oid" @click="sphereClick(s, si)"
        style=`display: inline-block; height: 30px; borderRadius: 5px`).q-pa-xs.q-mr-sm.bg-grey-3
        span(style=`white-space: nowrap`) {{ `#${s.name}` }}
  //- node actions
  div(style=`height: 60px`).row.full-width.q-px-sm
    .col
      .row.fit.items-center.justify-start
        div.row.full-height.items-center
          q-btn(icon="reply_all" color="grey-8" flat no-caps dense @click="shareClick()").q-ml-xs
    div.row.full-height.items-center
      //- span 1233
      //- q-btn(icon="share" size="md" color="grey-8" flat round dense @click="nodeChain()").q-mr-md
      small {{ rate.id }} /
      span.q-mb-xs 3.45
      q-btn(icon="track_changes" size="lg" color="grey-8" flat round @click="nodeRate()")
</template>

<script>
import node from 'components/node'
export default {
  name: 'nodeCard',
  components: {node},
  props: {
    node: {
      type: Object, required: true
    }
  },
  data () {
    return {
      spheres: [
        {oid: 't1', name: 'смертьkla sklmaslk  slkas'},
        {oid: 't2', name: 'сталин  kakask laks '},
        {oid: 't3', name: 'справедливость lkasl'},
        {oid: 't4', name: 'неприкосновенность a  anan an alnaslknl'}
      ],
      nodeLoaded: false,
      nodeFull: {
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
      ]
    }
  },
  computed: {
    getTypes () {
      return [
        this.nodeFull.fragments[0]['content']['type'] || 'none',
        this.nodeFull.fragments[1]['content']['type'] || 'none'
      ]
    }
  },
  methods: {
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
          message: 'Cant share now :(',
          color: 'green',
          textColor: 'white'
        })
      }
    },
    sphereClick (s, si) {
      this.$log('sphereClick', s, si)
      this.$router.push({name: 'search', query: {q: s.name}})
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
      console.time('nodeLoad')
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
                  content {
                    oid
                    type
                    name
                    thumbUrl(preferWidth: 600)
                    ...on Video {
                    url
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
      this.nodeFull = nodeFull[0]
      this.$log('nodeLoad done')
      console.timeEnd('nodeLoad')
    }
  },
  watch: {
    node: {
      deep: true,
      immediate: true,
      handler (to, from) {
        // this.$log('node CHANGED', to)
        if (to.visible === true && this.nodeLoaded === false) {
          this.nodeLoaded = true
          this.nodeLoad()
        }
      }
    }
  },
  async mounted () {
    // this.$log('mounted')
    // this.$log('node', this.node)
  }
}
</script>
