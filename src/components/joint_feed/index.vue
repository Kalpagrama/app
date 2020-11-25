<template lang="pug">
.row.full-width
  div(
    @click.self="jointClick()"
    :style=`{
      borderRadius: '10px', overflow: 'hidden',
    }`
    ).row.full-width.b-40
    //- author
    div(
      v-if="showHeader"
      ).row.full-width.items-center.content-center.q-pa-xs
      q-btn(
        :to="'/user/'+joint.author.oid"
        flat color="white" dense no-caps
        )
        user-avatar(:url="joint.author.thumbUrl" :width="24" :height="24")
        span.text-grey-4.q-ml-sm {{ joint.author.name }}
      .col
      small.text-grey-8.q-mr-xs {{ joint.countViews }}
      q-icon(name="visibility" color="grey-8").q-mr-md
      small.text-grey-8.q-mr-sm {{ $date(joint.createdAt, 'DD.MM.YYYY') }}
    //- items
    div(
      @click.self="jointClick()"
      :style=`{position: 'relative', padding: '11px'}`).row.full-width.items-end.content-end
      div(
        v-for="(item,ii) in joint.items" :key="ii"
        :style=`{
          //- maxWidth: ii === 0 ? '100%' : '60px'
        }`
        ).col-6
        div(
          :style=`{
            position: 'relative',
            transform: ii === 0 ? 'perspective(600px) rotateY(10deg)' : 'perspective(600px) rotateY(-10deg)',
          }`
          ).row.full-width
          div(
            :style=`{
              position: 'relative',
              paddingTop: '100%',
            }`).row.full-width
            div(
              v-if="itemActive !== ii"
              @click="itemActive = ii"
              :style=`{
                position: 'absolute', zIndex: 110, top: 0,
              }`
              ).row.fit
            div(
              :style=`{
                position: 'absolute', zIndex: 100, top: 0,
              }`
              ).row.fit
              composition-player(
                v-if="item.type === 'NODE'"
                :composition="item.items[0]"
                :isActive="isActive && itemActive === ii"
                :isVisible="isVisible"
                :options=`{height: '100%', objectFit: 'cover', loop: true}`)
              img(
                v-else
                :src="item.thumbUrl"
                :style=`{
                  borderRadius: '10px',
                  objectFit: 'cover',
                  borderRadius: '10px',
                }`
                ).fit.b-30
              //- tint
              div(
                :style=`{
                  position: 'absolute', bottom: '-0.8px', zIndex: 2000, transform: 'translate3d(0,0,0)', height: '40%',
                  //- background: 'rgb(0,0,0)',
                  background: 'linear-gradient(0deg, rgba(5,5,5,0.9) 30%, rgba(0,0,0,0) 100%)',
                  borderRadius: '0 0 10px 10px', overflow: 'hidden', pointerEvents: 'none',
                }`).row.full-width
              //- name
              div(
                :style=`{
                  position: 'absolute', zIndex: 2010, bottom: 0
                }`
                ).row.full-width.q-pa-sm
                .row.full-width.scroll
                  div(
                    :style=`{
                      maxHeight: '40px',
                    }`
                    ).row.no-wrap
                    span(:style=`{whiteSpace: 'nowrap'}`).text-white.text-bold {{ item.name }}
          //- item.type
          //- joint.vertices[ii] !== 'ASSOCIATIVE'
          div(
            v-if="joint.vertices[ii] && joint.vertices[ii] !== 'ASSOCIATIVE'"
            ).row.full-width.justify-center
            span.text-white {{ itemType(ii).name }}
      //- link btn
      q-btn(
        round flat color="green" icon="link" size="lg"
        :style=`{position: 'absolute', zIndex: 100, bottom: 'calc(50% - 30.5px)', left: 'calc(50% - 30.5px)',}`)
    //- name
    div(
      v-if="joint.name.length > 0"
      @click="jointClick()"
      ).row.full-width.justify-center.q-pa-sm.cursor-pointer
      span(:style=`{fontSize: '20px'}`).text-white.text-bold.shaking.cursor-pointer {{ joint.name }}
  //- actions
  node-actions(
    v-if="showFooter"
    :node="joint"
    :isActive="isActive" :isVisible="isVisible")
    template(v-slot:action-right)
      kalpa-share(
        type="joint" :item="joint")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import compositionPlayer from 'components/composition/composition_player/index.vue'

export default {
  name: 'jointFeed',
  props: {
    joint: {type: Object},
    isActive: {type: Boolean, default: false},
    isVisible: {type: Boolean, default: false},
    showHeader: {type: Boolean, default: true},
    showFooter: {type: Boolean, default: true},
    mini: {type: Boolean, default: false}
  },
  components: {
    compositionPlayer,
    nodeActions: () => import('components/node/node_actions.vue')
  },
  data () {
    return {
      stats: null,
      itemOpened: 0,
      itemActive: 0,
    }
  },
  computed: {
    itemTypes () {
      return [
        {id: 'ESSENCE', name: 'По сути', pair: 'ESSENCE'},
        {id: 'ASSOCIATIVE', name: 'Ассоциация', pair: 'ASSOCIATIVE'},
        {id: 'CAUSE', name: 'Причина', pair: 'EFFECT'},
        {id: 'EFFECT', name: 'Следствие', pair: 'CAUSE'},
        {id: 'PROBLEM', name: 'Проблема', pair: 'SOLUTION'},
        {id: 'SOLUTION', name: 'Решение', pair: 'PROBLEM'},
        {id: 'TRUE', name: 'Опровержение', pair: 'FALSE'},
        {id: 'FALSE', name: 'Факт', pair: 'TRUE'},
        {id: 'FROM', name: 'Факт', pair: 'TO'},
        {id: 'TO', name: 'Подтверждение', pair: 'FROM'},
      ]
    },
    types () {
      return [
        // {id: 'ESSENCE'},
        // {id: 'ASSOCIATIVE'},
        {id: 'CAUSE_EFFECT', names: ['Причина', 'Следствие']},
        {id: 'PROBLEM_SOLUTION', names: ['Проблема', 'Решение']},
        {id: 'FALSE_TRUE', names: ['Фэйк', 'Опровержение']},
        {id: 'FROM_TO', names: ['Факт', 'Подтверждение']}
      ]
    }
  },
  methods: {
    itemType (index) {
      return this.itemTypes.find(i => i.id === this.joint.vertices[index])
    },
    jointClick () {
      this.$log('jointClick')
      this.$router.push(`/joint/${this.joint.oid}`).catch(e => e)
    }
  },
  async mounted () {
    // this.$log('mounted')
    // this.stats = await this.$rxdb.get(RxCollectionEnum.GQL_QUERY, 'objectStat', {params: {oid: this.joint.oid}})
  }
}
</script>
