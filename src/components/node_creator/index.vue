<template lang="pug">
div(:style=`{height: $q.screen.height+'px'}`).column.full-width
  q-dialog(ref="nodeCreatorDialog" :maximized="true" transition-show="slide-left" transition-hide="slide-right")
    .column.fit.bg-white
      div(:style=`{height: '60px'}`).row.full-width.items-center
        div(:style=`{height: '60px', width: '45px'}`).row.items-center.justify-end
          q-btn(round flat icon="keyboard_arrow_left" @click="$refs.nodeCreatorDialog.hide()")
      span nodeCreatorDialog
  q-dialog(ref="fragmentFinderDialog" :maximized="true" transition-show="slide-up" transition-hide="slide-down"
    @hide="fragmentFinderDialogToggled(false)" @show="fragmentFinderDialogToggled(true)")
    div(
      @click.self="$refs.fragmentFinderDialog.hide()"
      :style=`{background: 'rgba(0,0,0,'+fragmentFinderDialogBackgroundOpacity+')'}`).row.fit.items-end
      div(
        :style=`{height: height-260+'px', borderRadius: '10px 10px 0 0', overflow: 'hidden'}`
        ).column.full-width.bg-white
        //- div(:style=`{height: '60px'}`).row.full-width
        //-   .col.full-height
        //-   div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
        //-     q-btn(round flat icon="check" @click="fragmentFinding = -1")
        .col.full-width
          k-colls(@coll="fragmentFindingColl = $event" :tabs="true" :coll="fragmentFindingColl" :colls="fragmentFindingColls" :style="{height: '100%'}")
            template(v-slot:bookmarks)
              span Bookmarks
            template(v-slot:fragments)
              span Fragments
  q-dialog(ref="nameFinderDialog" :maximized="true" transition-show="slide-up" transition-hide="slide-down")
    div(@click.self="$refs.nameFinderDialog.hide()").row.fit.items-end
      div(:style=`{height: height-200+'px', borderRadius: '10px 10px 0 0'}`).column.full-width.q-pa-sm.bg-grey-3
        .row.full-width
          div(:style=`{height: '60px', borderRadius: '10px'}`).row.full-width.bg-white
        .col.full-width.scroll
          .row.full-width.items-start.content-start.q-px-sm
            div(
              v-for="(s, si) in 20" :key="si"
              :style=`{minHeight: '40px'}`
              ).row.full-width.items-center.justify-center.q-px-sm
              span Suggestion {{ s }}
  div(
    v-if="true"
    :style=`{height: '60px'}`).row.full-width
    div(
      v-if="false"
      :style=`{height: '60px', width: '45px'}`).row.items-center.justify-start
      q-btn(round flat icon="keyboard_arrow_left")
    .col.full-height
      .row.fit.items-center.justify-start.q-px-md
        span.text-bold {{ $t('Node composer') }}
    div(
      v-if="true"
      :style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
      q-btn(round flat icon="more_vert" @click="$refs.nodeCreatorDialog.show()")
  .col.full-width.scroll
    k-colls(@coll="$router.push({params: {page: $event}})" :coll="$route.params.page" :colls="colls" :tabs="true" :style=`{height: height-60+'px'}`)
      template(v-slot:drafts)
        .column.fit
          div(:style=`{height: '60px'}`).row.full-width
            .col.full-height
              .row.fit.items-center.q-px-sm
                span 4 {{ $t('drafts') }}
            div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
              q-btn(round flat icon="search")
          .col.scroll
            .row.full-width.items-start.content-start.q-pa-sm
              div(
                v-for="(d, di) in 4" :key="di"
                :style=`{height: '60px', borderRadius: '10px', overflow: 'hidden'}`
                ).row.full-width.items-center.bg-white.q-px-sm.q-mb-sm
                span Draft {{ di }}
      template(v-slot:editor)
        .column.fit
          .col.scroll
            div(:style=`{paddingBottom: '200px'}`).row.full-width.items-start.justify-center
              div(:style=`{maxWidth: '400px'}`).row.full-width.items-start.content-start.q-px-sm
                //- first fragment
                //- transition(appear enter-active-class="animated slideOutDown" leave-active-class="animated slideInUp")
                div(
                  v-if="fragmentFinding !== 1"
                  v-ripple=`{color: 'accent'}` @click="fragmentFindStart(0)"
                  :style=`{position: 'relative', minHeight: '200px', borderRadius: '10px', oveflow: 'hidden'}`
                  ).row.full-width.items-center.justify-center.bg-white.cursor-pointer.q-mb-sm
                  q-btn(round flat icon="add" color="accent" size="lg" :style=`{pointerEvents: 'none'}`)
                //- name
                //- transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
                div(
                  v-if="fragmentFinding < 0" @click="nameEditStart()"
                  :style=`{height: '60px', borderRadius: '10px', overflow: 'hidden'}`
                  ).row.full-width.items-center.justify-center.bg-white.q-mb-sm
                  span {{ $t('Whats the point?') }}
                //- second fragment
                //- transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
                div(
                  v-if="fragmentFinding !== 0"
                  v-ripple=`{color: 'accent'}` @click="fragmentFindStart(1)"
                  :style=`{position: 'relative', minHeight: '200px', borderRadius: '10px', overflow: 'hidden'}`
                  ).row.full-width.items-center.justify-center.bg-white.cursor-pointer.q-mb-sm
                  q-btn(round flat icon="add" color="accent" size="lg" :style=`{pointerEvents: 'none'}`)
                //- save or publish
                .row.full-width.q-mt-sm
                  q-btn(
                    v-if="fragmentFinding < 0"
                    push no-caps color="accent" @click="$router.push({params: {page: 'preview'}})"
                    :style=`{height: '60px', borderRadius: '10px'}`).full-width
                    span.text-bold {{ $t('Next') }}
      template(v-slot:preview)
        .row.fit.items-start.content-start
          .row.full-width.q-px-sm
            div(
              :style=`{height: '200px', borderRadius: '10px'}`).row.full-width.bg-white
          .row.full-width.q-mt-sm.q-px-sm
            q-btn(
              push no-caps color="accent" @click="nodePublish()"
              :style=`{height: '60px', borderRadius: '10px'}`).full-width
              span.text-bold {{$t('Publish')}}
          //- span Preview
</template>

<script>
export default {
  name: 'nodeCreator',
  props: ['width', 'height'],
  data () {
    return {
      coll: 'editor',
      colls: [
        {id: 'drafts', name: 'My drafts'},
        {id: 'editor', name: 'Editor'},
        {id: 'preview', name: 'Preview'}
      ],
      fragmentFinding: -1,
      fragmentFindingColl: 'bookmarks',
      fragmentFindingColls: [
        {id: 'bookmarks', name: 'Bookmarks'},
        {id: 'fragments', name: 'Fragments'}
      ],
      fragmentFinderDialogBackgroundOpacity: 0,
      nameEditing: false
    }
  },
  computed: {
  },
  watch: {
    $route: {
      immediate: true,
      handler (to, from) {
        if (!to.params.page) {
          this.$router.replace({params: {page: 'creator'}})
        }
      }
    }
  },
  methods: {
    nameEditStart () {
      this.$logD('nameEditStart')
      this.$refs.nameFinderDialog.show()
      this.nameEditing = true
    },
    fragmentFindStart (i) {
      this.$logD('fragmentFindStart', i)
      this.fragmentFinding = i
      this.$refs.fragmentFinderDialog.show()
    },
    fragmentFinderDialogToggled (show) {
      if (show) {
        this.$tween.to(this, 0.3, {fragmentFinderDialogBackgroundOpacity: 0.25})
      } else {
        this.$tween.to(this, 0.3, {fragmentFinderDialogBackgroundOpacity: 0})
        this.fragmentFinding = -1
      }
    }
  },
  async mounted () {
    this.$logD('mounted')
  },
  beforeDestroy () {
    this.$logD('beforeDestroy')
  }
}
</script>

<style lang="stylus">
</style>
