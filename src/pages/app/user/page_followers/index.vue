<style lang="sass" scoped>
.subscription
  &:hover
    background: rgb(50,50,50)
</style>

<template lang="pug">
.row.full-width.q-px-sm
  tab-list-feed(
    :scrollAreaHeight="(scrollAreaHeight || $q.screen.height)"
    :navHeaderText="useNavHeader ? $t('Collections') : ''"
    :searchInputState="'enabled'"
    :searchString="searchString"
    :query="query"
    nextSize=44
    screenSize=88
    :itemMiddlePersist="false"
    @searchString="searchString = $event"
  ).row.full-width
    template(v-slot:item=`{item,itemIndex,isActive,isVisible}`)
      div(
        v-if="item.type === 'USER'"
        @click="$router.push('/user/'+item.oid)"
        :style=`{
          background: 'rgb(35,35,35)',
          borderRadius: '10px',
        }`
      ).row.fit.items-center.content-center.q-pa-sm
        img(
          draggable="false"
          :src="item.thumbUrl"
          :style=`{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
          }`).q-mr-sm
        span.text-white {{ item.name }}

  //list-feed(
  //  :query="query"
  //  :itemStyles=`{
  //    paddingBottom: '8px',
  //  }`)
  //  template(v-slot:prepend)
  //    slot(name="prepend")
  //  template(v-slot:item=`{item,itemIndex,isActive,isVisible}`)
  //    div(
  //      v-if="item.type === 'USER'"
  //      @click="$router.push('/user/'+item.oid)"
  //      :style=`{
  //        background: 'rgb(35,35,35)',
  //        borderRadius: '10px',
  //      }`
  //      ).row.fit.items-center.content-center.q-pa-sm
  //      img(
  //        draggable="false"
  //        :src="item.thumbUrl"
  //        :style=`{
  //          width: '30px',
  //          height: '30px',
  //          borderRadius: '50%',
  //        }`).q-mr-sm
  //      span.text-white {{ item.name }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageFollowers',
  props: ['user'],
  data () {
    return {
      searchString: ''
    }
  },
  computed: {
    query () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SUBSCRIBERS,
          oidSphere: this.user.oid,
          objectTypeEnum: {$in: ['USER']}
        },
        populateObjects: false,
      }
    }
  },
  methods: {
  },
  created () {
    this.$log('mounted')
  }
}
</script>
