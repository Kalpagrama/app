<template lang="pug">
div(
  :style=`{
          //- marginBottom: '300px',
        }`
).row.full-width.q-pt-lg
  div(
    @click="relatedContentClick(c,ci)"
    v-for="(c,ci) in item.relatedContent" :key="ci"
    :style=`{
            position: 'relative',
            minHeight: '50px',
            borderRadius: '10px',
            background: 'rgba(30,30,30,0.5)',
          }`
  ).row.full-width.items-start.content-start.q-mb-sm.cursor-pointer.content-wrapper
    //- loading
    transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
      div(
        v-if="relatedContentLoading === ci"
        :style=`{
                position: 'absolute', zIndex: 100,
                background: 'rgba(0,0,0,0.5)',
                borderRadius: '10px',
              }`
      ).row.fit.items-center.content-center.justify-center
        q-spinner(size="40px" color="green")
    //- default
    div(
      :style=`{
              //- width: '50px',
              height: '50px',
            }`
    ).row
      img(
        draggable="false"
        :src="c.thumbUrl"
        :style=`{
                //- height: '50px',
                borderRadius: '10px',
                //- objectFit: 'cover',
              }`).full-height
    .col.q-pa-sm
      .row.fit.items-center.content-center
        span.text-white {{ c.name }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { ContentApi } from 'src/api/content'

export default {
  name: 'pageSimilarYoutube',
  props: {
    item: {type: Object},
    types: {type: Array, default: ['NODE', 'JOINT', 'BLOCK']},
  },
  data () {
    return {
    }
  },
  computed: {
    query () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          objectTypeEnum: { $in: this.types },
          oidSphere: this.item.oid,
          deep: 5,
          sortStrategy: 'HOT' // 'ACTIVITY', // AGE
        },
        populateObjects: false,
      }
    },
  },
  methods: {
    async relatedContentClick (content, contentIndex) {
      this.$log('relatedContentClick', content)
      if (this.$store.getters.isGuest) {
        let authGuard = {
          message: 'Чтобы перейти на похожий контент, войдите в аккаунт'
        }
        this.$store.commit('ui/stateSet', ['authGuard', authGuard])
      }
      else {
        this.relatedContentLoading = contentIndex
        let contentKalpa = await ContentApi.contentCreateFromUrl(content.urlOriginal, false)
        this.relatedContentLoading = null
        // await this.$wait(300)
        if (contentKalpa) {
          await this.$router.push('/content/' + contentKalpa.oid)
        }
      }
    }
  }
}
</script>
