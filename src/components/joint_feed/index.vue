<template lang="pug">
.row.full-width
  div(
    :style=`{
      position: 'relative',
      background: 'rgb(35,35,35)',
      borderRadius: '10px',
    }`
    ).row.full-width
    //- header
    div(
      :style=`{
      }`
      ).row.full-width.items-center.content-center.q-pa-xs
      q-btn(
        :to="'/user/'+joint.author.oid"
        round flat color="white" no-caps
        :style=`{
        }`).row.q-px-sm
        user-avatar(:url="joint.author.thumbUrl" :width="24" :height="24").q-ml-sm
        .col
          .row.items-center.content-center.q-px-sm
            span.text-grey-4 {{ joint.author.name }}
            .row.full-width
              //- small(:style=`{lineHeight: 0.8}`).text-grey-8 {{ node.author.username }}
      .col
      .row.items-center.content-center.justify-end.q-pt-sm
        small.text-grey-8 {{ $date(joint.createdAt, 'DD.MM.YYYY') }}
        .row.full-width.items-center.content-center.justify-end
          small(:style=`{lineHeight: 0.8}`).text-grey-8.q-mr-xs {{ joint.countStat.countViews }}
          q-icon(name="visibility" color="grey-9")
      kalpa-menu-actions(:actions="actions" icon="more_vert")
    //- items wrapper
    div(
      :style=`{
        position: 'relative',
        paddingLeft: '3px',
        paddingRight: '3px',
      }`).row.full-width
      q-btn(
        flat color="green" icon="fas fa-link" size="lg"
        :to="'/links/'+joint.items[0].oid"
        :style=`{
          position: 'absolute', zIndex: 1000,
          left: 'calc(50% - 30px)',
          top: 'calc(50% - 30px)',
          width: '60px', height: '60px',
        }`)
      div(
        v-for="(i,ii) in joint.items" :key="ii+'-'+i.oid"
        :class=`{
        }`
        :style=`{
        }`
        ).col-6
        div(
          :style=`{
            position: 'relative',
            paddingBottom: '100%',
            transform: ii === 0 ? 'perspective(1000px) rotateY(6deg)' : 'perspective(1000px) rotateY(-6deg)',
          }`
          ).row.full-width
          div(
            :style=`{
              position: 'absolute', zIndex: 100,
            }`
            ).row.fit.items-start.content-start
            //- img(
              :src="joint.items[ii].thumbUrl"
              :style=`{
                borderRadius: '10px',
                objectFit: 'cover',
              }`
              ).fit
            composition-player(
              @click.native="itemActive = ii"
              :compositionKey="`${joint.oid}-${ii}`"
              :composition="joint.items[ii].type === 'NODE' ? joint.items[ii].items[0] : joint.items[ii]"
              :isActive="isActive"
              :isVisible="true"
              :isMini="true"
              :styles=`{
                height: '100%',
                objectFit: 'cover',
              }`
              :options=`{
                loop: true,
                showBar: false,
                showHeader: true,
                footerOverlay: true,
              }`)
    //- vertices
    router-link(
      :to="'/links/'+joint.items[0].oid+'?with='+joint.items[1].oid"
      :style=`{
        height: '60px',
      }`
      ).row.full-width.items-center.content-center.justify-center
      small(:style=`{fontSize: '18px',}`).text-white {{ $nodeItemType(joint.vertices[0]).name }} - {{ $nodeItemType(joint.vertices[1]).name }}
    //- spheres
    div(
      v-if="joint.spheres.length > 0"
      :style=`{
        height: '60px',
      }`
      ).row.full-width.br
      small(v-for="(s,si) in joint.spheres" :key="si").text-white {{ s.name }}
  //- actions
  div(
    :style=`{
      height: '60px',
    }`
    ).row.full-width.items-start.content-start.justify-between.q-pa-sm
    small.text-white share
    small.text-white vote
    small.text-white save
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import compositionPlayer from 'components/composition/composition_player/index.vue'

export default {
  name: 'jointFeed',
  props: ['joint', 'jointIndex', 'isActive', 'isVisible'],
  components: {
    compositionPlayer
  },
  data () {
    return {
      itemActive: 0,
    }
  },
  computed: {
    actions () {
      return {}
    }
  },
  watch: {
    isActive: {
      handler (to, from) {
        this.$log('isActive', this.joint.oid, to)
      }
    }
  },
  methods: {
  },
  async mounted () {
  }
}
</script>
