<template lang="pug">
div(:style=`{position: 'relative', maxHeight: '100%', maxWidth: '100%', borderRadius: '4px', overflow: 'hidden !important'}`).column.full-width.full-height
  //- header
  div(v-if="!noHeader" :style=`{height: '50px'}`).row.full-width.items-center.justify-between.q-px-sm
    //- author
    router-link(v-if="nodeFull" :style=`{height: '35px', width: '35px', borderRadius: '50%'}`
      :to="`/app/user/${nodeFull.author.oid}/nodes`").row.bg-grey-3
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
    v-for="(f, fi) in 2" :key="fi" :index="fi" :style=`{order: fi*2}`
    :preview="node.thumbUrl[fi]" :fragment="nodeFull ? nodeFull.fragments[fi] : null" :mini="mini" :visible="visible"
    :noFragmentActions="noFragmentActions")
    slot(name="fragment" :index="fi")
  //- name
  div(v-if="!noName" :style=`{order: 1, height: '40px'}`).row.full-width.justify-center.items-center
      //- span {{node.name}}
      router-link(v-if="!$slots.name" :to="`/app/node/${node.oid}`")
        span {{ node.name | cut(40) }}
      slot(name="name")
  //- spheres
  div(v-if="!noSpheres" :style=`{order: 3, height: '45px', overflowX: 'auto', overflowY: 'hidden'}`).row.full-width.items-center
    div(v-if="nodeFull").row.no-wrap.scroll.q-px-sm
      div(
        v-for="(s, si) in nodeFull.spheres" :key="si" @click="sphereClick(s, si)"
        :style=`{height: '30px', borderRadius: '4px'}`
        ).row.items-center.q-px-sm.q-mr-sm.bg-grey-4
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
    zIndex: {type: Number, default () { return 200 }},
    node: { type: Object, required: true },
    nodeFullReady: { type: Boolean },
    needFull: { type: Boolean },
    visible: {type: Boolean},
    mini: {type: Boolean},
    inEditor: {type: Boolean},
    noHeader: {type: Boolean},
    noName: {type: Boolean},
    noActions: {type: Boolean},
    noSpheres: {type: Boolean},
    noFragmentActions: {type: Boolean}
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
      ]
    }
  },
  computed: {
  },
  watch: {
    needFull: {
      immediate: true,
      async handler (to, from) {
        if (to) {
          if (this.nodeFullReady) {
            this.nodeFull = await this.nodeLoad(this.node.oid)
          } else {
            if (!this.nodeFull) {
              this.nodeFull = await this.nodeLoad(this.node.oid)
            }
          }
        }
      }
    },
    // visible: {
    //   immediate: false,
    //   async hanlder (to, from) {
    //     if (to) {
    //     }
    //   }
    // }
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
    nameClick () {
      this.$log('nameClick')
      if (this.inEditor) {
      } else {
        this.$router.push(`/app/node/${this.node.oid}`)
      }
    },
    sphereClick (s, si) {
      this.$log('sphereClick')
      if (this.inEditor) {
      } else {
        this.$router.push(`/app/sphere/${s.oid}`)
      }
    },
    nodeChain () {
      this.$log('nodeChain')
    },
    async nodeRateSend (rate) {
      this.$log('nodeRateSend start')
      this.nodeRateSending = true
      let {data: { nodeRate }} = await this.$apollo.mutate({
        mutation: gql`
          mutation nodeRate($oid: OID!, $rate: Float!) {
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
      this.$log('nodeLoad')
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
      return nodeFull
    }
  }
}
</script>
