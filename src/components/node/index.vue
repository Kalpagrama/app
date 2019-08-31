<template lang="pug">
div(:style=`{position: 'relative', maxHeight: '100%', maxWidth: '100%', borderRadius: '4px', overflow: 'hidden'}`).row.full-width
  //- debug
  div(v-if="false" style=`color: white; fontSize: 10px`).row.full-width.bg-purple.q-pa-sm
    small.full-width index: {{index}} / oid: {{node.oid}} / active: {{active}}
    small.full-width fragments: {{fragments}} / fragmentsMaxHeight: {{fragmentsMaxHeight}}
    small.full-width fragmentsStyles: {{fragmentsStyles}}
  //- header
  div(v-if="!noHeader" :style=`{height: '50px'}`).row.full-width.items-center.justify-between.q-px-sm
    //- author
    router-link(v-if="nodeFull" :style=`{height: '35px', width: '35px', borderRadius: '50%', overflow: 'hidden'}`
      :to="`/app/user/${nodeFull.author.oid}/nodes`").row.bg-grey-4
      img(v-if="nodeFull" :src="nodeFull.author.thumbUrl[0]" :style=`{width: '35px', height: '35px'}` @error="avatarError")
    div(v-if="nodeFull").row.q-px-md
      router-link(:to="`/app/user/${nodeFull.author.oid}/nodes`").full-width {{nodeFull.author.name}}
      small.full-width.text-grey-8 {{$date(node.createdAt, 'DD.MM.YYYY HH:mm')}}
    .col
    //- menu
    q-btn(round flat icon="more_vert" color="grey-6")
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
  node-fragment(
    v-for="(f, fi) in 2" :key="fi" :index="fi" :name="node.name" :active="active" :preview="node.thumbUrl[fi]" :mini="mini"
    :style=`{order: fi*2, ...fragmentsStyles[fi]}` @height="fragments[fi].initialHeight = $event" :needFull="needFull"
    :fragment="nodeFull ? nodeFull.fragments[fi] : null" @ready="$event => $emit('ready', $event)"
    :height="fragmentsStyles[fi].maxHeight")
    slot(name="fragment" :index="fi")
    template(v-slot:fragmentExplorer)
      //- h1 helloooo
      slot(name="fragmentExplorer" :index="fi")
  //- name
  div(v-if="!noName" :style=`{order: 1, height: '40px'}`).row.full-width.justify-center.items-center
    router-link(v-if="!$slots.name" :to="`/app/node/${node.oid}`")
      span(v-if="node") {{ node.name | cut(45) }}
    slot(name="name")
  //- spheres
  div(v-if="!noSpheres" :style=`{order: 3, height: '45px', overflowX: 'auto', overflowY: 'hidden'}`).row.full-width.items-center
    div(v-if="nodeFull").row.no-wrap.scroll.q-pl-sm
      div(
        v-for="(s, si) in nodeFull.spheres" :key="si" @click="sphereClick(s, si)"
        :style=`{height: '30px', borderRadius: '4px'}`
        ).row.items-center.q-px-sm.q-mr-sm.bg-grey-4.cursor-pointer
        span(:style=`{whiteSpace: 'nowrap'}`) {{'#'+s.name}}
  //- actions
  div(v-if="!noActions" :style=`{order: 4, height: '66px'}`).row.full-width.items-start.q-px-sm
    //- span Actions
    q-btn(round flat color="grey-9" icon="linear_scale" size="lg" @click="nodeChain()")
    .col
    q-btn(round flat color="grey-9" icon="gps_fixed" @click="nodeRate()" size="lg"
      :style=`{position: 'relative', width: '40px', height: '40px'}`)
      q-btn(
        v-if="nodeRating" round :icon="rates[rate].icon" color="primary" size="lg" :loading="nodeRateSending"
        :style=`{position: 'absolute', height: '480px', width: '480px', right: '-210px', bottom: '-210px', zIndex: zIndex+10000}`)
      h6(
        v-if="nodeRating"
        :style=`{position: 'absolute', left: '-120px', top: '-120px', zIndex: zIndex+11000}`
        ).text-white.text-bold {{ rates[rate].name }}
</template>

<script>
import nodeFragment from './node_fragment'

export default {
  name: 'node',
  components: { nodeFragment },
  props: {
    index: {type: Number},
    zIndex: {type: Number, default () { return 200 }},
    node: {},
    nodeFullReady: { type: Object },
    needFull: { type: Boolean },
    active: {type: Boolean},
    mini: {type: Boolean},
    inEditor: {type: Boolean},
    noHeader: {type: Boolean},
    noName: {type: Boolean},
    noActions: {type: Boolean},
    noSpheres: {type: Boolean},
    noFragmentActions: {type: Boolean},
    width: {type: Number},
    maxHeight: {type: Number}
  },
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
      rate: 0,
      rates: [
        {id: 1, name: 'Нет', rate: 0.0, icon: 'gps_off', opacity: 1},
        {id: 2, name: 'Скорее нет', rate: 0.25, icon: 'gps_not_fixed', opacity: 0.7},
        {id: 3, name: 'Может быть', rate: 0.5, icon: 'gps_not_fixed', opacity: 1},
        {id: 4, name: 'Скорее да', rate: 0.75, icon: 'gps_fixed', opacity: 0.7},
        {id: 5, name: 'Да', rate: 1.0, icon: 'gps_fixed', opacity: 1}
      ],
      fragments: [
        {initialHeight: 0},
        {initialHeight: 0}
      ]
    }
  },
  computed: {
    fragmentsMaxHeight () {
      let h = this.maxHeight
      return h
    },
    fragmentsStyles () {
      let hMax = this.fragmentsMaxHeight
      let h1 = this.fragments[0].initialHeight
      let h2 = this.fragments[1].initialHeight
      if (hMax >= h1 + h2) return [{}, {}]
      let h1p = h1 / (h1 + h2)
      let h2p = 1 - h1p
      return [
        {maxHeight: h1p * hMax + 'px'},
        {maxHeight: h2p * hMax + 'px'}
      ]
    }
  },
  watch: {
    needFull: {
      immediate: true,
      async handler (to, from) {
        if (to) {
          this.$log('needFull CHANGED', this.index, this.node.name)
          this.nodeFull = await this.nodeLoad(this.node.oid)
          this.$emit('nodeFull', this.nodeFull)
        }
      }
    },
    active: {
      immediate: true,
      handler (to, from) {
        if (to) {
          this.$log('active CHANGED', this.index, this.node.name, to)
        }
      }
    }
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
    avatarError (e) {
      // this.$log('avatarError', e)
      e.target.src = 'https://storage.yandexcloud.net/kalpa-thumbs/90/9u/108271081881665538_50.jpg'
    },
    nameClick () {
      this.$log('nameClick', this.node.name)
      if (this.inEditor) {
      } else {
        this.$router.push(`/app/node/${this.node.oid}`)
      }
    },
    sphereClick (s, si) {
      this.$log('sphereClick', s.name)
      if (this.inEditor) {
      } else {
        this.$router.push(`/app/sphere/${s.oid}`)
      }
    },
    nodeChain () {
      this.$log('nodeChain', this.node.name)
    },
    async nodeRateSend (rate) {
      this.$log('nodeRateSend start')
      this.nodeRateSending = true
      let {data: { nodeRate }} = await this.$apollo.mutate({
        mutation: gql`
          mutation nodeRate1($oid: OID!, $rate: Float!) {
            nodeRate(oid: $oid, rate: $rate)
          }
        `,
        variables: {
          oid: this.node.oid,
          rate: rate.rate
        }
      })
      await this.$wait(200)
      this.nodeRateSending = false
      this.$log('nodeRateSend done')
    },
    nodeRateJob () {
      this.$log('nodeRateJob')
      this.nodeRating = setTimeout(async () => {
        await this.nodeRateSend(this.rates[this.rate])
        this.nodeRating = null
      }, 1000)
      if (this.rate === this.rates.length - 1) this.rate = 0
      else this.rate += 1
      this.$log('nodeRateJob', this.rates[this.rate].name)
    },
    async nodeRate () {
      this.$log('nodeRate')
      if (this.nodeRateSending) return
      if (this.nodeRating) {
        clearInterval(this.nodeRating)
        this.nodeRateJob()
      } else {
        this.nodeRateJob()
      }
    },
    async nodeLoad (oid) {
      // this.$log('nodeLoad start', this.index, this.node.name)
      let { data: { objectList: [nodeFull] } } = await this.$apollo.query({
        query: gql`
          query getExtendedNodesPropsNode($oid: OID!) {
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
    }
  }
}
</script>
