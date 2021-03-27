<template lang="pug">
div(
  :style=`{
    height: height === 0 ? 'calc('+height+'% + 27px)' : 'calc('+height+'% + 29px)',
    minHeight: '27px',
    background: 'rgba(0,0,0,0.9)',
    borderRadius: '10px',
  }`
  ).column.full-width.items-end.content-end
    div(
      v-show="height > 0"
      :style=`{overflow: 'hidden',}`
      ).col.full-width
      div(
        v-if="contentKalpa"
        :style=`{overflow: 'hidden',}`
        @click.self="miniClick()"
        ).row.fit.items-start.content-start.q-pa-sm
        .row.full-width.q-pa-md
          span(
            :style=`{
              fontSize: '1rem',
            }`
          ).text-white.text-bold {{ contentKalpa.name }}
        .row.full-width.q-px-md
          img(
            :src="contentKalpa.thumbUrl"
            :style=`{
              height: '50px',
              borderRadius: '10px',
            }`
          )
          .col.q-pl-sm
            div(
              :style=`{
                height: '50px',
                borderRadius: '10px',
              }`).row.items-center.content-center.q-px-md.b-40
              span(:style=`{fontSize: '18px',}`).text-white.text-bold {{contentKalpa.countStat.countNodes}} Nodes
        //- img(
          draggable="false"
          :src="contentKalpa.thumbUrl"
          :style=`{
            borderRadius: '10px',
            width: '40%',
            //- maxWidth: '40%',
            maxHeight: '100%',
            objectFit: 'contain',
          }`
          ).b-40
        //- .col
          .row.full-width.q-px-sm
            span(
              :style=`{
                fontSize: '1rem',
              }`
            ).text-white.text-bold {{ contentKalpa.name }}
            .row.full-width.text-white.q-py-sm
              small.full-width {{ $t('Subscribers') }}: {{ contentKalpa.countStat.countSubscribers }}
              small.full-width {{ $t('Views') }}: {{ contentKalpa.countStat.countViews }}
              small.full-width {{ $t('Links') }}: {{ contentKalpa.countStat.countJoints }}
              small.full-width {{ $t('Nodes') }}: {{ contentKalpa.countStat.countNodes }}
            .row.full-width
              q-btn(
                outline no-caps color="white" icon="launch"
                :style=`{
                  height: '50px',
                  maxWidth: '300px',
                }`
                ).full-width
                span {{$t('Watch in context')}}
    transition(appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
      div(
        v-if="isActive"
        transition-show="jump-down"
        :style=`{
          height: '27px',
          background: 'rgb(0,0,0)',
          borderRadius: '10px',
          paddingLeft: '14px',
        }`
        @click="miniClick()"
        ).row.full-width.items-center.content-center.cursor-pointer
        q-icon(name="select_all" color="grey-4" size="14px").q-mr-xs
        //- small.text-grey-4 {{composition.layers[0].contentName}}
        small.text-grey-4 {{$t('Context')}}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'context',
  props: ['composition', 'isActive', 'isVisible'],
  data () {
    return {
      height: 0,
      contentKalpa: null,
    }
  },
  watch: {
    isActive: {
      immediate: true,
      handler (to, from) {
        if (to) {
          this.$wait(3000).then(() => {
            this.getContent()
          })
        }
        else {
          this.$tween.to(this, 0.3, {height: 0})
        }
      }
    }
  },
  methods: {
    miniClick () {
      this.$log('miniClick')
      if (!this.contentKalap) this.getContent()
      this.$tween.to(this, 0.3, {height: this.height === 100 ? 0 : 100})
    },
    async getContent () {
      this.$log('getContent')
      this.contentKalpa = await this.$rxdb.get(RxCollectionEnum.OBJ, this.composition.layers[0].contentOid)
    },
    goContent () {
      this.$log('goContent')
      this.$router.push('/content/' + this.composition.layers[0].contentOid)
    },
  }
}
</script>
