<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-page-container
    q-page
      .row.full-width.justify-center.q-pt-sm.q-px-sm
        div(:style=`{position: 'relative', maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
          //- sphere avatar(s)
          div(
            :style=`{
              position: 'relative', height: '140px',
              borderRadius: '10px 10px 0 0',
            }`).row.full-width.b-40
            //- img(
              :src="$store.getters.currentUser().thumbUrl"
              :style=`{
                objectFit: 'cover',
              }`
              ).fit
            q-btn(
              @click="$routerKalpa.back()"
              round flat color="white" icon="west"
              :style=`{
                position: 'absolute', zIndex: 1000,
                top: '8px', left: '8px',
              }`)
            kalpa-menu-actions(
              :actions="actions" icon="more_vert"
              color="white"
              :style=`{
                position: 'absolute', zIndex: 1000,
                top: '8px', right: '8px',
              }`)
            //- tint
            div(
              :style=`{
                position: 'absolute', bottom: '0px', zIndex: 90, transform: 'translate3d(0,0,0)', height: '100%',
                background: 'linear-gradient(0deg, rgba(30,30,30,0.8) 10%, rgba(0,0,0,0) 100%)',
                overflow: 'hidden', pointerEvents: 'none',
              }`).row.full-width
          //- header wrapper
          div(
            :style=`{
              zIndex: 100,
              marginTop: '-10px',
              //- marginTop: '8px',
              //- paddingTop: '8px',
              //- minHeight: '60px',
              borderRadius: '10px',
              overflow: 'hidden',
            }`).row.full-width.b-40
            //- header
            div(
              :style=`{
                minHeight: '60px',
              }`
              ).row.full-width.items-center.content-center.q-pa-sm
              q-icon(name="blur_on" color="white" size="30px").q-ml-xs
              .col.q-px-sm
                span(
                  v-if="sphere"
                  :class=`{
                    'text-bold': sphere.length < 20,
                  }`
                  :style=`{
                    fontSize: fontSize+'px',
                  }`
                  ).text-white {{ sphere.name }}
              kalpa-bookmark(
                v-if="sphere"
                :oid="sphere.oid"
                type="SPHERE"
                :name="sphere.name"
                :thumbUrl="''"
                :isActive="true")
            //- about user
            //- .row.full-width.q-px-md.q-pb-sm
              //- .row.full-width
                p.text-grey-2 status lorem ipsum lorem ipsum lorem ipsum status lorem ipsum lorem ipsum lorem ipsum status lorem
              .row.full-width.q-pb-sm
                //- weight
                //- router-link(
                  :to=`{params: {tab: 'weight'}}`
                  ).row.full-height.items-center.content-center
                  span.text-white.q-mr-xs 1231
                  span.text-grey-7.q-mr-md Вес
                //- following
                //- router-link(
                  :to=`{params: {tab: 'following'}}`
                  ).row.full-height.items-center.content-center
                  span.text-white.q-mr-xs 1419
                  span.text-grey-7.q-mr-md Подписки
                //- followers
                router-link(
                  :to=`{params: {tab: 'followers'}}`
                  ).row.full-height.items-center.content-center
                  span.text-white.q-mr-xs 9293
                  span.text-grey-7 Подписчики
            //- kalpa-menu-actions(:actions="actions" icon="more_vert")
      //- tabs sticky
      //- div(
        :style=`{
          position: 'sticky', top: '0px',
          zIndex: 2000,
        }`
        ).row.full-width.justify-center.b-30.text-grey-6
        q-tabs(
          active-color="green" switch-indicator no-caps
          ).full-width
          q-route-tab(
            v-for="(t,ti) in tabs" :key="t.id"
            :to="{params: {page: t.id}}" :name="t.id" :label="t.name")
      component(
        v-if="sphere"
        :is="`page-${$route.params.page}`"
        :sphere="sphere")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp_sphere',
  components: {
    pageNodes: () => import('./page_nodes/index.vue'),
    pageJoints: () => import('./page_joints/index.vue'),
    pageContent: () => import('./page_content/index.vue'),
    // pagePeople: () => import('./page_people/index.vue')
  },
  data () {
    return {
      // pageId: 'nodes',
      sphere: null,
    }
  },
  computed: {
    actions () {
      return {
        copyLink: {
          name: 'Скопировать ссылку',
          cb: () => {
            this.$log('copyLink')
          }
        },
        share: {
          name: 'Поделиться',
          cb: () => {
            this.$log('share')
          }
        },
        hide: {
          name: 'Пожаловаться',
          color: 'red',
          cb: async () => {
            this.$log('hide')
          }
        }
      }
    },
    tabs () {
      return [
        {id: 'content', name: 'Медиа'},
        {id: 'nodes', name: 'Ядра'},
        {id: 'joints', name: 'Связи'},
        {id: 'people', name: 'Люди'},
        {id: 'spheres', name: 'Сферы'}
      ]
    },
    fontSize () {
      if (!this.sphere) return 14
      let l = this.sphere.name.length
      if (l < 20) return 22
      else if (l < 30) return 20
      else if (l < 40) return 16
      else return 14
    },
  },
  watch: {
    '$route.params.oid': {
      deep: true,
      immediate: true,
      async handler (to, from) {
        if (to) {
          this.$log('$route.params.oid TO', to)
          this.sphere = await this.$rxdb.get(RxCollectionEnum.OBJ, to)
          if (!this.$route.params.page) {
            this.$router.replace({params: {page: 'nodes'}})
          }
        }
      }
    }
  },
  mounted () {
    this.$log('mounted')
    // document.body.style.background = 'rgb(30,30,30)'
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
