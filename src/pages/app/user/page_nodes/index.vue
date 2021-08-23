<template lang="pug">
list-feed(
  :query="query"
  :itemStyles=`{
    paddingBottom: '50px',
  }`)
  template(v-slot:prepend)
    slot(name="prepend")
  template(v-slot:item=`{item,itemIndex,isActive,isVisible}`)
    item-feed(
      :item="item.populatedObject"
      :showAuthorAlways="true"
      :isActive="isActive"
      :isVisible="isVisible")
    //div(
    //  @click="$emit('item', item)"
    //  :style=`{
    //          position: 'relative',
    //          borderRadius: '10px',
    //          background: 'rgb(35,35,35)',
    //        }`
    //).row.full-width
    //  //- slot(name="tint" :item="item")
    //  .row.full-width
    //    img(
    //      draggable="false"
    //      :src="item.thumbUrl"
    //      :style=`{
    //              height: '50px',
    //              minWidth: '90px',
    //              maxWidth: '90px',
    //              borderRadius: '10px',
    //              objectFit: 'contain',
    //            }`).b-40.q-mt-sm.q-ml-sm.q-mb-sm
    //    .col.full-height
    //      .row.fit.items-between.content-between.q-pa-sm
    //        .row.full-width
    //          span.text-white {{ item.name }}
    //        .row.full-width.justify-end
    //          small.text-grey-8.q-mr-sm {{ $date(item.createdAt, 'DD.MM.YYYY') }}
    //        //- q-btn(round flat dense color="grey-6" icon="more_vert")
    //  //- .row.full-width.q-pa-sm
    //    span.text-white {{ item.name }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageNodes',
  props: ['user'],
  computed: {
    query () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          objectTypeEnum: { $in: ['NODE'] },
          oidSphere: this.user.oid,
          oidAuthor: {$eq: this.user.oid},
          sortStrategy: 'AGE',
        },
        populateObjects: true,
      }
    }
  }
}
</script>
