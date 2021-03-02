<template lang="pug">
.row.full-width
  .col
    list-feed(
      :query="query"
      :itemStyles=`{
        paddingBottom: '50px',
      }`)
      template(v-slot:prepend)
        slot(name="prepend")
      template(v-slot:item=`{item,itemIndex,isActive,isVisible}`)
        node-feed(
          :node="item.populatedObject"
          :showAuthorAlways="true"
          :isActive="isActive"
          :isVisible="isVisible")
  //- div(:style=`{paddingTop: '1000px',marginBottom: '1000px'}`).col.q-px-md
    div(
      :style=`{
        height: '750px',
      }`).column.full-width.b-40
      .col.full-width.scroll
        list-feed(
          :query="query"
          :itemStyles=`{
            paddingBottom: '50px',
          }`)
          //- template(v-slot:item=`{item,itemIndex,isActive,isVisible}`)
            div(
              :style=`{}`
              :class=`{
                'b-60': isActive,
              }`
              ).row.full-width
              img(
                :src="item.thumbUrl"
                :style=`{height: '50px',}`).br
              .col
                span.text-white {{ item.name }}
            //- node-feed(
              :node="item.populatedObject"
              :showAuthorAlways="true"
              :isActive="isActive"
              :isVisible="isVisible")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageNodes',
  props: ['user'],
  components: {
  },
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
