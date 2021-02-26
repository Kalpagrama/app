<template lang="pug">
list-feed(
  :query="query"
  :itemStyles=`{
    paddingBottom: '50px',
  }`
  :style=`{
  }`)
  template(v-slot:prepend)
    slot(name="prepend")
  template(v-slot:item=`{item,itemIndex,isActive,isVisible}`)
    div(
      v-if="item.votedUserRate"
      :style=`{
        borderRadius: '10px 10px 0 0',
        background: 'rgba(32,32,32)',
        marginBottom: '-10px',
        paddingBottom: '18px',
      }`
      ).row.full-width.items-center.content-center.q-px-sm.q-pt-sm
      img(
        draggable="false"
        :src="user.thumbUrl"
        :style=`{
          width: '16px',
          height: '16px',
          borderRadius: '50%',
        }`).q-mx-sm
      small.text-grey-5.q-mr-xs {{ user.name }} проголосовал
      small.text-grey-5 "{{ rateMeta(item.votedUserRate).name }}"
      div(
        :style=`{
          width: '14px',
          height: '14px',
          borderRadius: '50%',
          background: rateMeta(item.votedUserRate).colorBackground,
        }`).row.q-ml-xs.q-mr-sm
    node-feed(
      :node="item.populatedObject"
      :showAuthorAlways="true"
      :isActive="isActive"
      :isVisible="isVisible")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageVotes',
  props: ['user'],
  computed: {
    query () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          objectTypeEnum: { $in: ['NODE', 'JOINT'] },
          oidSphere: this.user.oid,
          oidAuthor: {$ne: this.user.oid},
          sortStrategy: 'AGE',
        },
        populateObjects: true,
      }
    }
  },
  methods: {
    rateMeta (val) {
      let rate = this.$rateMeta.find(r => {
        return val > r.valueMin && val < r.valueMax
      })
      if (rate) return rate
      else return {name: val, color: 'red', colorBackground: 'red'}
    }
  }
}
</script>
