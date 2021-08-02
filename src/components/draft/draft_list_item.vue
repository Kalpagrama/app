<style lang="sass" scoped>
.draft-item
  &:hover
    background: rgb(45, 45, 45) !important
</style>

<template lang="pug">
  div(
    :style=`{
    position: 'relative',
    minHeight: '50px',
    background: 'rgb(35,35,35)',
    borderRadius: '10px',
  }`
  ).row.full-width.items-start.content-start.draft-item
    //- left
    .col
      component(
        :is="mode === 'select' ? 'div' : 'q-btn'"
        :style=`{
        minHeight: '50px',
      }`
        @click="onSelect"
      ).row.full-width.items-start.content-start.cursor-pointer
        //- preview, but not for sphere...
        img(
          v-if="!thumbUrlErrored"
          @error="thumbUrlErrorHandle"
          draggable="false"
          :src="draft.thumbUrl"
          :style=`{
          height: '50px',
          minWidth: '90px',
          maxWidth: '90px',
          borderRadius: '10px',
          objectFit: 'contain',
        }`).b-40.q-mt-sm.q-ml-sm.q-mb-sm
        //- special case is sphere...
        div(
          v-else
          :style=`{
          height: '50px',
          width: '50px',
        }`
        ).row.items-center.content-center.justify-center
          q-icon(name="blur_on" color="white" size="30px")
        //- right side
        .col
          div(:style=`{minHeight: '50px',}`).row.full-width.items-start.content-start.q-pt-sm.q-px-sm
            //- draft name
            div(:style=`{minHeight:'32px',}`).row.full-width
              span(:style=`{lineHeight: 1.1,}`).text-white {{ draft.name }}
            .row.full-width.q-py-xs
              small.text-grey-8 {{ draft.type }}
              .col
              small.text-grey-8 {{ $date(draft.createdAt) }}
    //- right
    q-btn(
      v-if="mode !== 'select' && showMenuBtn"
      round flat color="grey-8" icon="delete"
      @click="removeDraft"
    ).justify-center.q-mt-md.q-mr-xs
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'draftListItem',
  props: {
    draft: {
      type: Object,
      required: true
    },
    mode: {
      type: String
    },
    showMenuBtn: { type: Boolean, default: true }
  },
  data () {
    return {
      thumbUrlErrored: false
    }
  },
  methods: {
    async removeDraft () {
      await this.draft.remove(true)
    },
    async thumbUrlErrorHandle (e) {
      this.$log('thumbUrlErrorHandle', e)
      // get draftFresh to refresh thumbs and names and any dynamic info...
      let draftFresh = await this.$rxdb.get(RxCollectionEnum.OBJ, this.draft.oid)
      this.draft.thumbUrl = draftFresh.thumbUrl
      this.draft.name = draftFresh.name
    },
    async onSelect () {
      this.$log(this.draft)
      if (this.mode === 'select') {
        this.$emit('draft', this.draft)
      } else {
        if (this.draft.wsItemType === RxCollectionEnum.WS_BLOCK) {
          await this.$router.push({ path: '/workspace/create', query: { mode: 'block', id: this.draft.id } })
        }
      }
    }
  }
}
</script>
