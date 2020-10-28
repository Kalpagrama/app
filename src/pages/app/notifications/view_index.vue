<template lang="pug">
q-page(
  :style=`{paddingTop: '8px', paddingBottom: '200px'}`
  ).row.full-width.justify-center.q-px-sm
  kalpa-loader(
    v-if="sphereOid"
    :immediate="true" :query="query" :limit="100" v-slot=`{items,next}`)
    div(
      :style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`
      ).row.full-width.items-start.content-start
      div(
        v-for="(n,ni) in items" :key="n.id"
        v-if="n.subject && n.object"
        :style=`{minHeight: '60px', borderRadius: '10px', overflow: 'hidden'}`
        ).row.full-width.items-center.content-center.b-40.q-pa-sm.q-mb-sm
        //- subject WHO
        //- subject USER
        router-link(
          v-if="n.subject.type === 'USER'"
          :to="'/user/'+n.subject.oid"
          :style=`{
            borderRadius: '10px',
          }`
          ).row.items-center.content-center.q-pa-xs.b-50
          img(
            draggable="false"
            :src="n.subject.thumbUrl"
            :style=`{
              width: '30px', height: '30px',
              borderRadius: '50%'}`
            )
          .col.q-px-sm
            small.text-white {{ n.subject.name }}
        //- subject fallback
        div(
          v-else
          ).row.bg-blue
          small.text-white {{ n.subject }}
        //- type (n.type) VOTED
        //- type VOTED
        div(
          v-if="n.type === 'VOTED'"
          ).row.q-px-sm
          span.text-white проголосовал за
        div(
          v-else-if="n.type === 'USER_SUBSCRIBED'"
          ).row.q-px-sm
          span.text-white подписался на
        div(
          v-else-if="n.type === 'OBJECT_CREATED'"
          ).row.q-px-sm
          span.text-white создал
        div(
          v-else-if="n.type === 'OBJECT_DELETED'"
          ).row.q-px-sm
          span.text-white удалил
        //- type fallback
        div(
          v-else
          ).row.bg-blue
          small.text-white {{ n.type }}
        //- what (n.object) NODE, JOINT
        //- object NODE
        router-link(
          v-if="n.object.type === 'NODE'"
          :to="'/node/'+n.object.oid"
          ).row.items-center.content-center
          .col.q-pr-sm
            span.text-white ядро
          div(
            :style=`{
              borderRadius: '10px',
            }`
            ).row.full-height.items-center.content-center.b-50
            img(
              draggable="false"
              :src="n.object.thumbUrl"
              :style=`{
                height: '40px', borderRadius: '10px',
              }`)
            .col.q-px-sm
              span.text-white {{ n.object.name.slice(0, 50) }}
        //- object JOINT
        router-link(
          v-else-if="n.object.type === 'JOINT'"
          :to="'/joint/'+n.object.oid"
          ).row.items-center.content-center
          .col.q-pr-sm
            span.text-white связь
          div(
            :style=`{
              borderRadius: '10px',
            }`
            ).row.full-height.items-center.content-center.b-50
            img(
              draggable="false"
              :src="n.object.thumbUrl"
              :style=`{
                height: '40px', borderRadius: '10px',
              }`)
            .col.q-px-sm
              span.text-white {{ n.object.name.slice(0, 50) }}
        //- object USER
        router-link(
          v-else-if="n.object.type === 'USER'"
          :to="'/user/'+n.object.oid"
          :style=`{
            borderRadius: '10px',
          }`
          ).row.items-center.content-center.q-pa-xs.b-50
          img(
            draggable="false"
            :src="n.object.thumbUrl"
            :style=`{
              width: '30px', height: '30px',
              borderRadius: '50%'}`
            )
          .col.q-px-sm
            small.text-white {{ n.object.name }}
        //- object VIDEO, IMAGE... content
        router-link(
          v-else-if="['VIDEO', 'IMAGE'].includes(n.object.type)"
          :to="'/content/'+n.object.oid"
          ).row.items-center.content-center
          .col.q-pr-sm
            span.text-white контент
          div(
            :style=`{
              borderRadius: '10px',
            }`
            ).row.full-height.items-center.content-center.b-50
            img(
              draggable="false"
              :src="n.object.thumbUrl"
              :style=`{
                height: '40px', borderRadius: '10px',
              }`)
            .col.q-px-sm
              span.text-white {{ n.object.name.slice(0, 50) }}
        //- object WORD, SENTENCE
        router-link(
          v-else-if="['WORD', 'SENTENCE'].includes(n.object.type)"
          :to="'/sphere/'+n.object.oid"
          ).row.items-center.content-center.q-pa-xs
          span.text-white.q-mr-sm сферу
          div(
            :style=`{
              borderRadius: '10px',
            }`
            ).row.items-center.content-center.q-pa-xs.b-50
            q-icon(name="blur_on" color="white" size="30px")
            span.text-white.q-mx-sm {{ n.object.name }}
        //- object fallback
        div(
          v-else
          ).row.bg-blue
          small.text-white {{ n.object }}
        //- why (n.matter)
        //- div(
          :style=`{}`
          ).row.bg-blue
          small.text-white {{ n.matter }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp_notifications_viewHome',
  data () {
    return {
    }
  },
  computed: {
    sphereOid () {
      return this.$store.getters.currentUser() ? this.$store.getters.currentUser().oid : null
    },
    query () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_FEED,
          oidSphere: this.sphereOid
        },
        populateObjects: false,
      }
    }
  },
  methods: {
    getTitle (n) {
      let typeMap = {
        VOTED: 'Вы проголосовали за',
      }
      // let
      return `${n.subject.name} voted ${n.object.name}`
    },
    getObject (object) {
      let objectMap = {
        NODE: 'node'
      }
      return null
    }
  }
}
</script>
