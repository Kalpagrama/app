<template lang="pug">
.row.full-width.justify-center.q-px-sm
  div(
    :style=`{
      maxWidth: '500px',
      borderRadius: '10px',
      background: 'rgb(35,35,35)',
    }`
    ).row.full-width
    //- header
    router-link(
      :to="'/graph/'+node.oid"
      :style=`{}`).row.full-width.items-center.content-center.q-pa-md
      q-icon(name="fas fa-link" color="white" size="24px").q-mr-sm
      .col
        span.text-white.text-bold {{$t('Joints')}}
      //- q-icon(name="bookmark_outline" color="white" size="24px")
      //- q-btn(round flat dense color="grey-9")
    //- scrolled bookmarks preview max 10...
    .row.full-width.scroll
      //- joints loading
      div(v-if="!jointsRes").row.full-width.no-wrap.q-pa-sm
        div(
          v-for="n in 5" :key="n"
          :style=`{
            height: '50px', width: '50px', minWidth: '50px',
            borderRadius: '10px',
          }`
          ).row.b-40.q-mr-sm
      //- joints
      div(v-if="jointsRes && jointsRes.items.length > 0").row.full-width.no-wrap.q-pa-sm
        router-link(
          v-for="j in jointsRes.items"
          :key="j.populatedObject.oid"
          :to="'/graph/'+node.oid+'?oid='+j.oid"
          :style=`{
            height: '50px', width: '50px', minWidth: '50px',
            borderRadius: '10px',
          }`
          ).row.b-50.q-mr-sm
          img(
            draggable="false"
            :src="j.populatedObject.items.find(i => i.oid !== node.oid).thumbUrl"
            :style=`{
              objectFit: 'cover',
              borderRadius: '10px',
            }`
            ).fit
      //- joints empty
      div(v-if="jointsRes && jointsRes.items.length === 0").row.full-width.no-wrap.q-pa-sm
        q-btn(
          flat no-caps color="white" align="left"
          :to="'/graph/'+node.oid"
          :style=`{
            height: '50px',
          }`
          ).full-width
          span {{$t('No joints, create one')}}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'widgetJoints',
  props: ['node'],
  data () {
    return {
      jointsRes: null
    }
  },
  computed: {
    query () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          objectTypeEnum: { $in: ['JOINT'] },
          oidSphere: this.node.oid,
          sortStrategy: 'AGE',
        },
        populateObjects: true,
      }
    }
  },
  methods: {
  },
  async mounted () {
    this.$log('mounted')
     this.jointsRes = await this.$rxdb.find(this.query, true)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
