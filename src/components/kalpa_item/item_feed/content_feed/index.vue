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
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { assert } from 'src/system/common/utils'
import { reactive } from 'vue'

// этот элемент показывается в virtual scroll и не может иметь состояния!!! data - запрещено! И во вложенных - тоже!!!
export default {
  name: 'contentFeed',
  props: ['item', 'itemState', 'isActive', 'isVisible'],
  components: {
  },
  computed: {
    actions () {
      return {}
    },
    data() {
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      assert(this.itemState)
      let key = this.$options.name
      if (!this.itemState[key]) {
        this.$set_deprecated(this.itemState, key, reactive({
          itemActive: 0
        }))
      }
      return this.itemState[key]
    }
  }
}
</script>
