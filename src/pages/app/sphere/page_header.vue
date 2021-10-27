<template lang="pug">
.row.full-width.justify-center.q-pt-sm.q-px-sm
        div(:style=`{position: 'relative', maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
          //- sphere avatar(s)
          div(
            :style=`{
              position: 'relative', height: '140px',
              borderRadius: '10px 10px 0 0',
            }`).row.full-width.b-40
            img(
              v-if="topNode"
              :src="topNode.thumbUrl"
              :style=`{
                objectFit: 'cover',
              }`
              ).fit
            q-btn(
              v-if="!$q.screen.lt.md"
              @click="$routerKalpa.back()"
              round flat color="white" icon="west"
              :style=`{
                position: 'absolute', zIndex: 1000,
                top: '8px', left: '8px',
              }`)
            kalpa-menu-actions(
              v-if="!$q.screen.lt.md"
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
            //- about sphere: nodes, joints, items statCount...
</template>

<script>
export default {
  name: 'pageHeader',
  props: ['sphere', 'topNode'],
  computed: {
    fontSize () {
      if (!this.sphere) return 14
      let l = this.sphere.name.length
      if (l < 20) return 22
      else if (l < 30) return 20
      else if (l < 40) return 16
      else return 14
    },
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
  },
}
</script>
