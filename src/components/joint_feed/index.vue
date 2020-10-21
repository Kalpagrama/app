<template lang="pug">
.row.full-width
  div(
    @click.self="jointClick()"
    :style=`{
      borderRadius: '10px', overflow: 'hidden',
      //- background: 'rgb(35,35,35)',
    }`
    ).row.full-width.b-40
    //- authors
    div(
      v-if="showHeader"
      ).row.full-width.items-center.content-center
      div(:style=`{overflow: 'hidden'}`).col
        div(v-if="stats").row.items-center.content-center.justify-start.no-wrap.q-py-xs
          q-btn(
            v-for="(voter, voteri) in stats.votes" :key="voter.oid"
            :to="'/user/'+voter.oid"
            flat dense no-caps
            :style=`{
              minWidth: '80px',
              //- background: 'rgb(45,45,45)'
            }`
            ).row.q-mr-xs
            user-avatar(:url="voter.thumbUrl" :width="24" :height="24")
            span.text-grey-6.q-ml-sm {{ voter.name }}
          q-btn(
            v-if="stats.votes.length > 3"
            flat dense color="grey-8" icon="more_vert"
            ).q-mr-xs
      q-icon(name="visibility" color="grey-8")
      small.text-grey-8.q-mr-xs 1234
      q-btn(round flat dense color="grey-8" icon="more_vert")
    //- items top/bottom
    //- div().row.full-width.items-start.content-start
      //- left item
      .row.full-width.q-px-sm
        div(
          :style=`{
            borderRadius: '10px',
            background: 'rgb(45,45,45)',
          }`
          ).row.full-width
          img(
            draggable="false"
            :src="joint.leftItem.thumbUrl"
            :style=`{
              height: '80px',
              borderRadius: '10px', overflow: 'hidden',
            }`)
          .col
            .row.fit.items-start.content-start.q-pa-md
              span.text-white.text-bold {{ joint.leftItem.name }}
      //- right item
      div(:style=`{}`).row.full-width.q-pt-md
        joint-item(
          :joint="joint"
          :item="joint.rightItem"
          :isActive="isActive" :isVisible="isVisible"
          :mini="mini"
          :style=`{
            //- position: 'absolute', zIndex: 100, top: 0,
            //- transform: ii === 0 ? 'perspective(600px) rotateY(10deg)' : 'perspective(600px) rotateY(-10deg)'
          }`)
    //- items left/right
    div(
      @click.self="jointClick()"
      :style=`{padding: '11px'}`).row.full-width.items-end.content-end
      div(
        v-for="(item,ii) in [joint.leftItem, joint.rightItem]" :key="ii"
        ).col-6
        //- div(:style=`{position: 'relative', height: 0, paddingBottom: '100%'}`).row.full-width
        joint-item(
          :joint="joint"
          :item="item"
          :isActive="isActive" :isVisible="isVisible"
          :mini="mini"
          :style=`{
            //- position: 'absolute', zIndex: 100, top: 0,
            transform: ii === 0 ? 'perspective(600px) rotateY(10deg)' : 'perspective(600px) rotateY(-10deg)'
          }`)
          template(v-slot:footer)
            div(
              v-if="!['ESSENCE', 'ASSOCIATIVE'].includes(joint.jointType)"
              :class=`{
                'justify-end': ii === 0
              }`
              :style=`{
                height: '40px',
              }`).row.full-width.items-center.content-center.q-px-md
              span.text-white.text-bold {{ getItemTypeName(ii, joint.jointType) }}
    //- type
    //- .row.full-width.justify-center
      small.text-white {{ joint.jointType }}
    //- name
    div(
      v-if="joint.name.length > 0"
      @click="jointClick()"
      ).row.full-width.justify-center.q-pa-sm.cursor-pointer
      span(:style=`{fontSize: '20px'}`).text-white.text-bold.shaking.cursor-pointer {{ joint.name }}
  //- actions
  joint-actions(
    v-if="showFooter"
    :joint="joint" :isActive="isActive" :isVisible="isVisible")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

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
    jointItem: () => import('./joint_item.vue'),
    jointActions: () => import('components/joint/joint_actions.vue')
  },
  data () {
    return {
      stats: null
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
        {id: 'TRUE', name: 'Правда', pair: 'FALSE'},
        {id: 'FALSE', name: 'Ложь', pair: 'TRUE'},
        {id: 'FROM', name: 'Первое', pair: 'TO'},
        {id: 'TO', name: 'Второе', pair: 'FROM'},
      ]
    },
    types () {
      return [
        // {id: 'ESSENCE'},
        // {id: 'ASSOCIATIVE'},
        {id: 'CAUSE_EFFECT', names: ['Причина', 'Следствие']},
        {id: 'PROBLEM_SOLUTION', names: ['Проблема', 'Решение']},
        {id: 'FALSE_TRUE', names: ['Ложь', 'Правда']},
        {id: 'FROM_TO', names: ['Первое', 'Второе']}
      ]
    }
  },
  methods: {
    jointClick () {
      this.$log('jointClick')
      this.$router.push(`/joint/${this.joint.oid}`).catch(e => e)
    },
    getItemTypeName (index, val) {
      this.$log('getItemTypeName', index, val)
      if (['ESSENCE', 'ASSOCIATIVE'].includes(val)) return ''
      else {
        let t = this.types.find(t => t.id === val)
        this.$log('t', t)
        return t.names[index]
      }
    }
  },
  async mounted () {
    this.$log('mounted')
    this.stats = await this.$rxdb.get(RxCollectionEnum.GQL_QUERY, 'objectStat', {params: {oid: this.joint.oid}})
  }
}
</script>
