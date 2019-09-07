<template lang="pug">
div(
  v-if="node"
  :style=`{position: 'relative', overflow: 'hidden'}`).row.full-width.items-start.content-start
  //- rate
  div(
    v-if="nodeRating"
    :style=`{position: 'absolute', zIndex: zIndex+2600, color: 'white'}` v-ripple @click="nodeRate()"
    ).row.fit.justify-center.items-center
    q-spinner(
      v-if="nodeRateSending"
      color="white" :thickness="2" size="50px")
    span(
      v-else
      :style=`{opacity: rateOpacity, whiteSpace: 'nowrap', fontSize: '3rem'}`).text-white.noselect {{rates[rate].name}}
  //- debug
  div(
    v-if="false"
    :style=`{color: 'white'}`).row.full-width.bg-purple.q-pa-xs
  //- header
  div(
    v-if="!noHeader"
    :style=`{order: -100, height: '50px'}`).row.full-width.justify-between.items-center.q-px-sm
    //- q-btn(round flat dense color="grey-6" style=`{width: 30px; height: 30px}`).bg-grey-4
    //- q-btn(round flat dense icon="more_vert" color="grey-6")
    //- author
    router-link(v-if="nodeFull && nodeFull.author" :style=`{height: '35px', width: '35px', borderRadius: '50%', overflow: 'hidden'}`
      :to="`/app/user/${nodeFull.author.oid}/nodes`").row.bg-grey-4
      img(v-if="nodeFull" :src="nodeFull.author.thumbUrl[0]" :style=`{width: '35px', height: '35px'}` @error="avatarError")
    div(v-if="nodeFull && nodeFull.author").row.q-px-sm
      router-link(:to="`/app/user/${nodeFull.author.oid}/nodes`").full-width {{nodeFull.author.name}}
      span(:style=`{fontSize: '10px'}`).full-width.text-grey-8 {{$date(node.createdAt, 'DD.MM.YYYY HH:mm')}}
    .col
    //- menu
    q-btn(v-if="!noNodeMenu" round flat icon="more_vert" color="grey-6")
      q-popup-proxy(position="bottom" auto-close anchor="bottom right" self="top right")
        div(
          :style=`{maxWidth: $q.screen.width < 451 ? '100%' : '230px'}`
          :class="{'q-pa-md': $q.screen.width <= 450}").row.fit
          div(:style=`{borderRadius: '4px'}`).row.full-width.bg-white
            //- header
            div(:style=`{height: '50px', borderBottom: '1px solid #eee'}`).row.full-width.items-center.justify-center.q-px-md
              span.text-bold {{ node.name | cut(30) }}
            //- menus
            div(v-for="(m, mi) in menus" :key="m.id" @click="menuClick(m)"
              :style=`{height: '50px'}`
              ).row.full-width.items-center.justify-center.q-px-md.hr.cursor-pointer
              span(:style=`{color: m.color}`) {{ m.name }}
          //- cancel
          div(v-if="$q.screen.width < 451" :style=`{height: '50px', borderRadius: '4px'}`
            ).row.full-width.items-center.justify-center.q-mt-sm.q-px-md.bg-grey-1
            span(:style=`{color: 'red'}`).text-bold {{ $t('Отмена') }}
  //- fragments
  node-fragment-css(
    v-if="fragmentShow(node, fi)" v-for="(f, fi) in 2" :key="fi" :index="fi" :zIndex="zIndex" :maxHeight="maxHeight" :active="active"
    :oid="node.oid" :name="node.name" :noFragmentMenu="noFragmentMenu" :needFull="needFull" :inEditor="inEditor"
    :preview="node.thumbUrl[fi]" :fragment="nodeFull ? nodeFull.fragments[fi] : null"
    :style=`{order: fi*2}`)
    template(v-slot:fragment="{index}")
      slot(name="fragment" :index="index" :empty="nodeFull ? nodeFull.fragments[fi] ? false : true : true")
  //- name
  div(v-if="!noName" :style=`{order: nameAtTheBottom ? 10 : 1, height: '40px'}`).row.full-width.items-center.justify-center
    router-link(v-if="!$slots.name" :to="`/app/node/${node.oid}`")
      small(v-if="node" :style=`{whiteSpace: 'nowrap'}`).text-bold {{ node.name | cut(45) }}
    //- small {{node.fragmentsPoints}}
    slot(name="name")
  //- spheres !noSpheres && nodeFull && nodeFull.spheres.length > 0
  div(v-if="!noSpheres" :style=`{order: 400, maxWidth: '100%', height: '45px', overflowX: 'auto', overflowY: 'hidden'}` body-scroll-lock-ignore).row.full-width.items-center.scroll
    div(v-if="nodeFull").row.no-wrap.q-pl-sm
      div(
        v-for="(s, si) in nodeFull.spheres" :key="si" @click="sphereClick(s, si)"
        :style=`{height: '30px', borderRadius: '4px'}`
        ).row.items-center.q-px-sm.q-mr-sm.bg-grey-4.cursor-pointer
        span(:style=`{whiteSpace: 'nowrap'}`) {{'#'+s.name}}
  //- actions
  div(v-if="!noActions" :style=`{order: 500, height: '70px', position: 'relative'}`).row.full-width.q-px-sm
    //- q-btn(round flat color="grey-9" icon="linear_scale" size="lg" @click="nodeChain()")
    .col
    q-btn(round flat color="grey-9" icon="gps_fixed" @click="nodeRate()" size="lg")
    div(:style=`{position: 'absolute', zIndex: zIndex+2500, width: rateHeight+'px', color: 'white',
      height: rateHeight+'px', right: -rateHeight/2+37+'px', bottom: -rateHeight/2+40+'px', borderRadius: '50%', opacity: rateOpacity-0.2}`
      v-ripple).row.bg-black
</template>

<script>
import nodeFragmentCss from './node_fragment_css'

export default {
  name: 'nodeCss',
  props: {
    zIndex: {
      type: Number,
      default () {
        return 200
      }
    },
    index: {type: Number},
    node: {type: Object},
    nodeFullReady: {type: Object},
    noHeader: {type: Boolean},
    noName: {type: Boolean},
    noSpheres: {type: Boolean},
    noActions: {type: Boolean},
    noNodeMenu: {type: Boolean},
    noFragmentMenu: {type: Boolean},
    noFragment: {type: Number},
    maxHeight: {type: String},
    active: {type: Boolean},
    needFull: {type: Boolean},
    inEditor: {type: Boolean},
    nameAtTheBottom: {type: Boolean}
  },
  components: {nodeFragmentCss},
  data () {
    return {
      nodeFull: null,
      menus: [
        {id: 'to_node', name: 'К ядру', color: 'black'},
        {id: 'to_workspace', name: 'Добавить в мастерскую', color: 'black'},
        {id: 'to_chain', name: 'Добавить в цепочку', color: 'black'},
        {id: 'follow', name: 'Подписаться', color: 'black'},
        {id: 'share', name: 'Поделиться', color: 'black'},
        {id: 'report', name: 'Пожаловаться', color: 'red'}
      ],
      nodeRating: false,
      nodeRateSending: false,
      nodeRateTimer: null,
      nodeRateTimeout: 1300,
      rate: 3,
      rates: [
        {id: 1, name: 'Нет', rate: 0.0, icon: 'gps_off', opacity: 1},
        {id: 2, name: 'Скорее нет', rate: 0.25, icon: 'gps_not_fixed', opacity: 0.7},
        {id: 3, name: 'Может быть', rate: 0.5, icon: 'gps_not_fixed', opacity: 1},
        {id: 4, name: 'Скорее да', rate: 0.75, icon: 'gps_fixed', opacity: 0.7},
        {id: 5, name: 'Да', rate: 1.0, icon: 'gps_fixed', opacity: 1}
      ],
      rateHeight: 10,
      rateOpacity: 0
    }
  },
  watch: {
    nodeFullReady: {
      immediate: true,
      handler (to, from) {
        if (to) {
          this.$log('nodeFullReady CHANGED')
          this.nodeFull = to
          this.$emit('nodeFull', this.nodeFull)
        }
      }
    },
    needFull: {
      immediate: true,
      async handler (to, from) {
        if (to === true && !this.nodeFullReady) {
          this.$log('nodeFull CHANGED', this.node.name)
          this.nodeFull = await this.nodeLoad(this.node.oid)
          this.$emit('nodeFull', this.nodeFull)
        }
      }
    }
  },
  computed: {
  },
  methods: {
    menuClick (m) {
      this.$log('menuClick', m)
      switch (m.id) {
        case 'to_node': {
          this.$log('menuClick', m.id)
          this.$router.push(`/app/node/${this.node.oid}`)
          break
        }
        case 'to_workspace': {
          this.$log('menuClick', m.id)
          break
        }
        case 'to_chain': {
          this.$log('menuClick', m.id)
          break
        }
        case 'follow': {
          this.$log('menuClick', m.id)
          break
        }
        case 'share': {
          this.$log('menuClick', m.id)
          break
        }
        case 'report': {
          this.$log('menuClick', m.id)
          break
        }
      }
    },
    sphereClick (s, si) {
      this.$log('sphereClick', s, si)
      if (this.inEditor) {
        // this.$emit('sphereClick', s, si)
        this.nodeFull.spheres = this.nodeFull.spheres.filter(sp => {
          return sp !== s
        })
      } else {
        this.$router.push(`/app/sphere/${s.oid}`)
      }
    },
    nodeChain () {
      this.$log('nodeChain')
    },
    fragmentShow (n, fi) {
      if (n.fragmentsPoints) {
        if (n.fragmentsPoints[0].fragmentIndx === fi) return false
        else return true
      } else {
        return true
      }
    },
    async nodeRateSend () {
      this.$log('NODE RATE SEND start')
      console.time('nodeRateSend')
      this.nodeRateSending = true
      let {data: { nodeRate }} = await this.$apollo.mutate({
        mutation: gql`
          mutation nodeRate2($oid: OID!, $rate: Float!) {
            nodeRate(oid: $oid, rate: $rate)
          }
        `,
        variables: {
          oid: this.node.oid,
          rate: this.rates[this.rate].rate
        }
      })
      await this.$wait(200)
      this.nodeRateSending = false
      this.nodeRating = false
      this.$tween.to(this, 0.7, {rateHeight: 0, rateOpacity: 0})
      this.$log('NODE RATE SEND done')
      console.timeEnd('nodeRateSend')
    },
    async nodeRate () {
      this.$log('nodeRate CLICK')
      if (this.nodeRateSending) return
      // update rate
      if (this.rate === this.rates.length - 1) this.rate = 0
      else this.rate += 1
      if (this.nodeRating) {
        if (this.nodeRateTimer) {
          clearTimeout(this.nodeRateTimer)
          this.nodeRateTimer = setTimeout(this.nodeRateSend, this.nodeRateTimeout)
        }
      } else {
        this.$tween.to(this, 0.7, {rateHeight: 3000, rateOpacity: 1})
        await this.$wait(300)
        this.nodeRating = true
        this.nodeRateTimer = setTimeout(this.nodeRateSend, this.nodeRateTimeout)
      }
    },
    async nodeLoad (oid) {
      this.$log('nodeLoad start', this.index, this.node.name)
      let { data: { objectList: [nodeFull] } } = await this.$apollo.query({
        query: gql`
          query getExtendedNodesProps($oid: OID!) {
            objectList(oids: [$oid]) {
              oid
              type
              name
              createdAt
              ...on Node {
                rate
                viewCnt
                # rateUser
                author {
                  oid
                  type
                  name
                  thumbUrl(preferWidth: 50)
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
                      width
                      height
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
          oid: oid
        },
        fetchPolicy: 'cache-first'
      })
      this.$log('nodeLoad done', this.index, this.node.name)
      return nodeFull
    },
    avatarError (e) {
      // this.$log('avatarError', e)
      e.target.src = 'statics/logo.png'
    }
  },
  mounted () {
    // this.$log('mounted')
  },
  beforeDestroy () {
    // this.$log('beforeDestroy')
  }
}
</script>

<style lang="stylus">
.noselect {
  -webkit-touch-callout: none
    -webkit-user-select: none
     -khtml-user-select: none
       -moz-user-select: none
        -ms-user-select: none
            user-select: none
}
</style>
