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
      :to="'/joint/'+node.oid"
      :style=`{}`).row.full-width.items-center.content-center.q-pa-md
      q-icon(name="fas fa-link" color="grey-9" size="24px")
      .col
        span.text-white.text-bold Связи
      //- q-icon(name="bookmark_outline" color="white" size="24px")
      //- q-btn(round flat dense color="grey-9")
    //- scrolled bookmarks preview max 10...
    .row.full-width.scroll
      //- joints mockup
      div(v-if="!joints").row.full-width.no-wrap.q-pa-sm
        div(
          v-for="n in 5" :key="n"
          :style=`{
            height: '50px', width: '50px', minWidth: '50px',
            borderRadius: '10px',
          }`
          ).row.b-40.q-mr-sm
      //- joints loaded
      div(v-if="joints && joints.length > 0").row.full-width.no-wrap.q-pa-sm
        router-link(
          v-for="j in joints" :key="j.populatedObject.oid"
          :to="'/joint/'+node.oid"
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
      //- no joints, create one
      div(
        v-if="joints && joints.length === 0"
        ).row.full-width
        q-btn(
          :to="'/joint/'+node.oid"
          flat no-caps color="grey-5" align="left"
          :style=`{
            height: '50px',
          }`
          ).full-width Add some links
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'widgetJoints',
  props: ['node'],
  data () {
    return {
      joints: null
    }
  },
  computed: {
    jointsCount () {
      if (this.joints.length > 0) return ' - ' + this.joints.length
      else return ''
    },
    jointsQuery () {
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
    jointsUpdated (joints) {
      this.$log('jointsUpdated', joints)
      this.joints = joints
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
