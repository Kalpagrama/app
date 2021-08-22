<template lang="pug">
.row.full-width
  //- header
  div(
    :style=`{
      position: 'relative',
      minHeight: '60px',
      textAlign: 'center',
    }`
    ).row.full-width.items-center.content-center.justify-center.q-pa-sm
    span(:style=`{zIndex: 300,}`).text-white.text-bold.q-mr-sm {{$t('Joints')}}
    span().text-grey-6.text-bold - {{ item.countStat.countJoints }}
    //- q-icon(
      name="fas fa-link" size="80px"
      :style=`{
        color: 'rgb(38,38,38)',
        position: 'absolute', zIndex: 200,
        top: '-10px',
        left: '8px',
      }`)
  //- debug
  //- .row.full-width
    q-btn(no-caps outline @click="jointsRes.gotoStart()") To start
    q-btn(no-caps outline @click="jointsRes.prev()") Prev
    q-btn(no-caps outline @click="jointsRes.next()") Next
  //- body
  div(
    v-if="jointsRes"
    :style=`{
    }`
    ).row.full-width
    //- gallery
    div(v-if="jointsRes.items.length > 0").row.full-width
      joint-item(
        v-for="(item,itemIndex) in jointsRes.items" :key="item.oid"
        :joint="item.populatedObject"
        :oid="oid"
        @open="$emit('joint', item)")
    //- no joints, create one
    div(v-if="jointsRes.items.length === 0").row.full-width.justify-center
      div(
        :style=`{
          marginTop: '140px',
        }`
        ).row.full-width.justify-center
        span(:style=`{fontSize: '18px',}`).text-grey-6 {{$t('No joints yet, be the first one!')}}
        .row.full-width.justify-center.q-pt-sm
          span.text-grey-6 {{$t('Be first, click a button ↓')}}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import jointItem from './joint_item.vue'

export default {
  name: 'jointsGallery',
  props: ['oid', 'item'],
  components: {
    jointItem,
  },
  data () {
    return {
      jointsRes: null,
    }
  },
  computed: {
    query () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          objectTypeEnum: { $in: ['JOINT'] },
          oidSphere: this.oid,
          sortStrategy: 'AGE',
        },
        populateObjects: true,
      }
    }
  },
  watch: {
    'jointsRes.hasPrev': {
      handler (to, from) {
        this.$log('jointsRes.hasPrev TO', to)
        if (to === true) {
          this.jointsRes.gotoStart()
        }
      }
    }
  },
  methods: {
  },
  async mounted () {
    this.jointsRes = await this.$rxdb.find(this.query)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
